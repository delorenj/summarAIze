import {ARTIFICIAL_CHAPTER_BREAK_THRESHOLD, defaultChapterParserOptions} from "./ChapterParserContext";
import {createChapterPersistenceContext} from "../ChapterPersistence/ChapterPersistenceContext";
import {stripNewlinesAndCollapseSpaces} from "../book-lib";
import {ChapterParsingStrategy} from "./ChapterParserStrategy";
import {DocumentContext} from "../Documents/DocumentContext";
import {IChapter, IChapterParserOptions, IChapterPlaceholder} from "../../../types/summaraizeTypes";
import S3ChapterPersistenceStrategy from "../ChapterPersistence/S3ChapterPersistenceStrategy";

export const chapterBreakRegex = /^\s*(chapter|part|section)\s(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fifteen|twenty|thirty|fifty|I|V|X)*/;
export const LookForChapterHeadingParserStrategy = (params: IChapterParserOptions): ChapterParsingStrategy => {
    const options = {
        ...defaultChapterParserOptions,
        ...params,
    };
    console.log("LookForChapterHeading parser options", options);
    const log = (message: string, ...args: any[]) => {
        if (options.logLevel === "debug") {
            console.log(message, ...args);
        }
    }

    const noChapterFoundOnPastXPages = (placeholder: IChapterPlaceholder, currentPage: number, maxNumPages: number) => {
        const diff = (currentPage - (placeholder.pageEnd || 0));
        const result = (diff > 0) && (diff % ARTIFICIAL_CHAPTER_BREAK_THRESHOLD === 0)
        if (result) {
            log("No chapter found on past", ARTIFICIAL_CHAPTER_BREAK_THRESHOLD, "pages. Creating artificial chapter.");
            console.log("noChapter",
                "currentPage", currentPage,
                "previousPage", placeholder.pageEnd || 0,
                "current - prev||0", currentPage - (placeholder.pageEnd || 0));
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
        let artificialToggledOn = false;
        const currentPlaceholder: IChapterPlaceholder = {
            chapterNumber: 0,
            pageStart: 0,
            lineStart: 0,
            text: '',
            artificial: false,
        }
        const chapterPersist = createChapterPersistenceContext(S3ChapterPersistenceStrategy(doc));

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
            if (options.persistChapter && strippedText.length > 0) {
                log("Persisting chapter", currentPlaceholder);
                const s3Url = await chapterPersist.saveChapter(
                    strippedText,
                    currentPlaceholder.chapterNumber,
                );
                log("Persisted chapter on S3");
                chapterRow.persistStrategy = "S3"
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
            const tooLongWithoutChapter = noChapterFoundOnPastXPages(currentPlaceholder, i, ARTIFICIAL_CHAPTER_BREAK_THRESHOLD)
            if (tooLongWithoutChapter || artificialToggledOn) {
                log(`No chapter found on past ${ARTIFICIAL_CHAPTER_BREAK_THRESHOLD} pages, so we're going to artificially break the chapters`);
                currentPlaceholder.pageEnd = i - 1;
                currentPlaceholder.artificial = true;
                artificialToggledOn = true;
                await lockInChapter();
                const lines = page.match(/[^\r\n]+/g) || [];
                chapterCount += 1;
                currentPlaceholder.text += lines.join(" ");
                currentPlaceholder.lineStart = 0;
                currentPlaceholder.pageStart = i;
                currentPlaceholder.chapterNumber = chapterCount;
                continue;
            }
            const headingCheckRegex = new RegExp(chapterBreakRegex, 'igm');
            const pageMatch = page.match(headingCheckRegex);
            console.log("pageMatch", pageMatch);
            if (!pageMatch) {
                log("No chapter break found on page on full page match. Continuing");
                const lines = page.match(/[^\r\n]+/g) || [];
                currentPlaceholder.text += ` ${page}`; //Append the line to the current chapter with a space just in case
                currentPlaceholder.lineEnd = lines.length - 1
                currentPlaceholder.pageEnd = i - 1;
                continue;
            } else {
                const matchesWithMoreThanOneWord = pageMatch.filter(match => match.split(" ").length > 1 && match.split(" ")[1] !== "");
                console.log("matchesWithMoreThanOneWord", matchesWithMoreThanOneWord);
                if (matchesWithMoreThanOneWord.length === 0) {
                    console.log("Chapter break on page but it's only one word. Not counting it as a chapter");
                    continue;
                } else {
                    console.log("Chapter break on page and it's more than one word. Counting it as a chapter");
                }
            }
            const lines = page.match(/[^\r\n]+/g) || [];
            try {
                // Loop through the lines on the page and look for "Chapter" keyword
                for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                    const line = lines[lineIndex];
                    if (line.match(new RegExp(chapterBreakRegex, 'ig'))) {
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

    const numChapters = async (doc: DocumentContext, minPage: number, maxPage: number): Promise<number> => {
        const numPages = await doc.pageCount();
        const numWords = await doc.wordCount();
        console.log("numPages", numPages);
        console.log("numWords", numWords);
        const chapterPages = [];
        for (let i = minPage; i < Math.min(maxPage || 10000, numPages); i++) {
            const page = await doc.getPage(i);
            log("Page", i, page);
            const headingCheckRegex = new RegExp(chapterBreakRegex, 'igm');
            const pageMatch = page.match(headingCheckRegex);
            console.log("pageMatch", pageMatch);
            if (pageMatch) {
                if (pageMatch.filter(match => match.split(" ").length > 1 && match.split(" ")[1] !== "").length > 0) {
                    chapterPages.push(i);
                } else {
                    console.log("Chapter break on page but it's only one word. Not counting it as a chapter");
                }
            }
        }
        console.log("chapterPages", chapterPages);
        return chapterPages.length;
    }

    return {
        options,
        parse,
        numChapters,
    }
}
