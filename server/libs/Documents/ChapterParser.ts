import {IChapter, IRawBook, LogLevel} from "../../../types/summaraizeTypes";
import {DocumentContext} from "./DocumentContext";
import {stripNewlinesAndCollapseSpaces} from "../book-lib";
import {ChapterPersistenceStrategy} from "./ChapterPersistenceStrategy";
import {createChapterPersistenceContext} from "./ChapterPersistenceContext";

export const ARTIFICIAL_CHAPTER_BREAK_THRESHOLD = 50;

export interface ChapterParsingStrategy {
    parse(doc: DocumentContext): Promise<IChapter[]>;
}

export interface IChapterParser {
    strategy: ChapterParsingStrategy;

    parse(doc: DocumentContext): Promise<IChapter[]>;
}

export interface IChapterParserOptions {
    persistChapter?: boolean;
    persistStrategy: ChapterPersistenceStrategy;
    logLevel?: LogLevel;
    book: IRawBook;
}

export const createChapterParser = (strategy: ChapterParsingStrategy): IChapterParser => {
    return {
        strategy,
        async parse(doc: DocumentContext): Promise<IChapter[]> {
            return await strategy.parse(doc);
        }
    };
}

export const LookForChapterHeadingStrategy = (params: IChapterParserOptions): ChapterParsingStrategy => {
    const {persistChapter, logLevel, persistStrategy} = params;
    const log = (message: string, ...args: any[]) => {
        if (logLevel === "debug") {
            console.log(message, ...args);
        }
    }

    interface IChapterPlaceholder {
        chapterNumber: number;
        pageStart: number;
        lineStart: number;
        pageEnd?: number;
        lineEnd?: number;
        text: string;
    }

    const noChapterFoundOnPastXPages = (chapterRows: IChapter[], currentPage: number, maxNumPages: number) => {
        if (chapterRows.length === 0) {
            chapterRows.push({
                index: 0,
                bookmark: "page-0-line-0",
                page: 0,
                numWords: 0,
                firstFewWords: "",
            });
        }
        const lastChapter = chapterRows[chapterRows.length - 1];
        return currentPage - (lastChapter.page || 0) > ARTIFICIAL_CHAPTER_BREAK_THRESHOLD;
    }
    const parse = async (doc: DocumentContext): Promise<IChapter[]> => {
        log("Parsing document with LookForChapterHeadingStrategy");
        const numPages = await doc.pageCount();
        log("Number of pages", numPages);
        const numWords = await doc.wordCount();
        log("Number of words", numWords);
        let chapterCount = 0;
        let artificialChapterBreaks = false;
        const chapterRows: IChapter[] = [];
        const currentPlaceholder: IChapterPlaceholder = {
            chapterNumber: 0,
            pageStart: 0,
            lineStart: 0,
            text: ''
        }
        const chapterPersist = createChapterPersistenceContext(persistStrategy);

        const lockInChapter = async () => {
            const strippedText = stripNewlinesAndCollapseSpaces(currentPlaceholder.text);
            const chapterRow: IChapter = {
                index: currentPlaceholder.chapterNumber,
                bookmark: `page-${currentPlaceholder.pageStart}-line-${currentPlaceholder.lineStart}`,
                page: currentPlaceholder.pageStart,
                numWords: strippedText.split(" ").length,
                firstFewWords: strippedText.split(" ").slice(0, 10).join(" "),
                artificial: artificialChapterBreaks,
            }
            if (persistChapter && strippedText.length > 0) {
                log("Persisting chapter", currentPlaceholder);
                const s3Url = await chapterPersist.saveChapter(
                    strippedText,
                    currentPlaceholder.chapterNumber,
                );
                log("Persisted chapter on S3");
                chapterRow.persistStrategy = persistStrategy.TYPE
            } else {
                log("Not persisting chapter");
                if (strippedText.length === 0) {
                    log("...because chapter has no text");
                }
            }
            if (strippedText.length > 0) {
                chapterRows.push(chapterRow);
            } else {
                log("Chapter has no words, so we're not going to persist it");
            }
        }

        for (let i = 0; i < numPages; i++) {
            const page = await doc.getPage(i);
            log("Page", i, page);
            const lines = page.match(/[^\r\n]+/g) || [];
            try {
                // Loop through the lines on the page and look for "Chapter" keyword
                for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                    const line = lines[lineIndex];
                    if (line.toLowerCase().includes('chapter') || noChapterFoundOnPastXPages(chapterRows, i, ARTIFICIAL_CHAPTER_BREAK_THRESHOLD)) {
                        log("Found chapter break on line:", line);
                        if (noChapterFoundOnPastXPages(chapterRows, i, ARTIFICIAL_CHAPTER_BREAK_THRESHOLD)) {
                            log(`No chapter found on past ${ARTIFICIAL_CHAPTER_BREAK_THRESHOLD} pages, so we're going to artificially break the chapters`);
                            artificialChapterBreaks = true;
                        } else {
                            artificialChapterBreaks = false;
                        }

                        log("Looks like we've found a chapter break. Persisting the previous chapter and starting a new one");
                        await lockInChapter();

                        //Reset the current placeholder to the new chapter
                        chapterCount += 1;
                        currentPlaceholder.text = line;
                        currentPlaceholder.lineStart = lineIndex;
                        currentPlaceholder.pageStart = i;
                        currentPlaceholder.chapterNumber = chapterCount;

                    } else {
                        currentPlaceholder.text += ` ${line}`; //Append the line to the current chapter with a space just in case
                        currentPlaceholder.lineEnd = lineIndex;
                        currentPlaceholder.pageEnd = i;
                    }
                }
                if (i === numPages - 1) {
                    log("Looks like we've reached the end of the book. Persisting the last chapter");
                    await lockInChapter();
                }
            } catch (e) {
                log("error parsing chapter breaks", e);
            }
        }
        log("Chapter breaks", chapterRows);
        return chapterRows.filter(chapter => chapter.numWords > 0);
    }
    return {
        parse
    }
}
