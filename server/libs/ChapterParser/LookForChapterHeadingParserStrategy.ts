import {ARTIFICIAL_CHAPTER_BREAK_THRESHOLD} from "./ChapterParserContext";
import {createChapterPersistenceContext} from "../ChapterPersistence/ChapterPersistenceContext";
import {stripNewlinesAndCollapseSpaces} from "../book-lib";
import {ChapterParsingStrategy} from "./ChapterParserStrategy";
import {DocumentContext} from "../Documents/DocumentContext";
import {IChapter, IChapterParserOptions, IChapterPlaceholder } from "../../../types/summaraizeTypes";

export const LookForChapterHeadingParserStrategy = (params: IChapterParserOptions): ChapterParsingStrategy => {
    const {persistChapter, logLevel, persistStrategy} = params;
    const log = (message: string, ...args: any[]) => {
        if (logLevel === "debug") {
            console.log(message, ...args);
        }
    }

    const noChapterFoundOnPastXPages = (chapterRows: IChapter[], currentPage: number, maxNumPages: number) => {
        let chapterRowComp: IChapter;
        if (chapterRows.length === 0) {
            chapterRowComp = {
                index: 0,
                bookmark: "page-0-line-0",
                page: 0,
                numWords: 0,
                firstFewWords: "",
            };
        } else {
            chapterRowComp = chapterRows[chapterRows.length - 1];
        }

        const result = ((currentPage - (chapterRowComp.page || 0)) % ARTIFICIAL_CHAPTER_BREAK_THRESHOLD) === 0;
        if(result) {
            log("No chapter found on past", ARTIFICIAL_CHAPTER_BREAK_THRESHOLD, "pages. Creating artificial chapter.");
            console.log("noChapter",
            "currentPage", currentPage,
            "previousPage", chapterRowComp.page,
            "current - prev||0", currentPage - (chapterRowComp.page || 0));
        }
        return result;
    }
    const parse = async (doc: DocumentContext): Promise<IChapter[]> => {
        log("Parsing document with LookForChapterHeadingStrategy");
        const numPages = await doc.pageCount();
        log("Number of pages", numPages);
        const numWords = await doc.wordCount();
        log("Number of words", numWords);
        let chapterCount = 0;
        const chapterRows: IChapter[] = [];
        const currentPlaceholder: IChapterPlaceholder = {
            chapterNumber: 0,
            pageStart: 0,
            lineStart: 0,
            text: '',
            artificial: false,
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
                artificial: currentPlaceholder.artificial,
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
            const tooLongWithoutChapter = noChapterFoundOnPastXPages(chapterRows, i, ARTIFICIAL_CHAPTER_BREAK_THRESHOLD)
            if (tooLongWithoutChapter) {
                log(`No chapter found on past ${ARTIFICIAL_CHAPTER_BREAK_THRESHOLD} pages, so we're going to artificially break the chapters`);
                currentPlaceholder.pageEnd = i - 1;
                currentPlaceholder.artificial = true;
                await lockInChapter();
                const lines = page.match(/[^\r\n]+/g) || [];
                chapterCount += 1;
                currentPlaceholder.text += lines.join(" ");
                currentPlaceholder.lineStart = 0;
                currentPlaceholder.pageStart = i;
                currentPlaceholder.chapterNumber = chapterCount;
                continue;
            }
            const lines = page.match(/[^\r\n]+/g) || [];
            try {
                // Loop through the lines on the page and look for "Chapter" keyword
                for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                    const line = lines[lineIndex];

                    if (line.toLowerCase().includes('chapter')) {
                        log("Found chapter break on line:", line);

                        currentPlaceholder.artificial = false;

                        await lockInChapter();

                        //Reset the current placeholder to the new chapter
                        chapterCount += 1;
                        currentPlaceholder.text = line;
                        currentPlaceholder.lineStart = lineIndex;
                        currentPlaceholder.pageStart = i;
                        currentPlaceholder.chapterNumber = chapterCount;
                        break;
                    } else {
                        currentPlaceholder.text += ` ${line}`; //Append the line to the current chapter with a space just in case
                        currentPlaceholder.lineEnd = lineIndex;
                        currentPlaceholder.pageEnd = i - 1;
                    }
                }
                if (i === numPages - 1) {
                    log("Looks like we've reached the end of the book. Persisting the last chapter");
                    currentPlaceholder.lineEnd = lines.length - 1;
                    currentPlaceholder.pageEnd = i - 1;
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
