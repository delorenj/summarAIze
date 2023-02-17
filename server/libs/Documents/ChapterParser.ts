import {IChapter, IRawBook, LogLevel} from "../../../types/summaraizeTypes";
import {DocumentContext} from "./DocumentContext";
import {numberOfWords, stripNewlinesAndCollapseSpaces} from "../book-lib";
import {ChapterPersistenceStrategy} from "./ChapterPersistenceStrategy";
import {createChapterPersistenceContext} from "./ChapterPersistenceContext";
import S3ChapterPersistenceStrategy from "./S3ChapterPersistenceStrategy";

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
                id: "page-0-line-0",
                page: 0,
                chapter: 0,
                numWords: 0,
                firstFewWords: "",
            });
        }
        const lastChapter = chapterRows[chapterRows.length - 1];
        return currentPage - (lastChapter.page || 0) > 70;
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
        for (let i = 0; i < 130; i++) {
            const page = await doc.getPage(i);
            log("Page", i, page);
            const lines = page.match(/[^\r\n]+/g) || [];
            try {
                // Loop through the lines on the page and look for "Chapter" keyword
                for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                    const line = stripNewlinesAndCollapseSpaces(lines[lineIndex]);
                    if (line.toLowerCase().includes('chapter') || noChapterFoundOnPastXPages(chapterRows, i, ARTIFICIAL_CHAPTER_BREAK_THRESHOLD)) {
                        log("Found chapter break on line:", line);
                        if (noChapterFoundOnPastXPages(chapterRows, i, ARTIFICIAL_CHAPTER_BREAK_THRESHOLD)) {
                            log("No chapter found on past 70 pages, so we're going to artificially break the chapters");
                            artificialChapterBreaks = true;
                        }
                        if (currentPlaceholder.text.length === 0) {
                            log("Looks like this is the first chapter, so there's nothing to persist yet. We'll start building the text for the first chapter");
                            chapterCount += 1;
                            currentPlaceholder.text = line;
                            currentPlaceholder.lineStart = lineIndex;
                            currentPlaceholder.pageStart = i;
                            currentPlaceholder.chapterNumber = chapterCount;
                        } else {
                            log("Looks like we've found a chapter break. Persisting the previous chapter and starting a new one");
                            const chapterRow: IChapter = {
                                id: `page-${currentPlaceholder.pageStart}-line-${currentPlaceholder.lineStart}`,
                                page: currentPlaceholder.pageStart,
                                chapter: currentPlaceholder.chapterNumber,
                                numWords: currentPlaceholder.text.split(" ").length,
                                firstFewWords: currentPlaceholder.text.split(" ").slice(0, 10).join(" "),
                                artificial: artificialChapterBreaks,
                            }
                            if (persistChapter) {
                                log("Persisting chapter", currentPlaceholder);
                                const persistData = await chapterPersist.saveChapter(
                                    currentPlaceholder.text,
                                    currentPlaceholder.chapterNumber,
                                );
                                log("Persisted chapter", persistData);
                                chapterRow.persistData = persistData;
                            } else {
                                log("Not persisting chapter");
                            }
                            chapterRows.push(chapterRow);

                            //Reset the current placeholder to the new chapter
                            chapterCount += 1;
                            currentPlaceholder.text = line;
                            currentPlaceholder.lineStart = lineIndex;
                            currentPlaceholder.pageStart = i;
                            currentPlaceholder.chapterNumber = chapterCount;
                        }
                    } else {
                        currentPlaceholder.text += line;
                        currentPlaceholder.lineEnd = lineIndex;
                        currentPlaceholder.pageEnd = i;
                    }
                }
            } catch (e) {
                log("error parsing chapter breaks", e);
            }
        }
        log("Chapter breaks", chapterRows);
        return chapterRows;
    }
    return {
        parse
    }
}
