import {IChapter, IRawBook, LogLevel} from "../../../types/summaraizeTypes";
import {DocumentContext} from "./DocumentContext";
import {numberOfWords, stripNewlinesAndCollapseSpaces} from "../book-lib";
import {ChapterPersistenceStrategy} from "./ChapterPersistenceStrategy";
import {createChapterPersistenceContext} from "./ChapterPersistenceContext";
import S3ChapterPersistenceStrategy from "./S3ChapterPersistenceStrategy";

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
export const createChapterParser = (strategy: ChapterParsingStrategy, options: IChapterParserOptions): IChapterParser => {
    return {
        strategy,
        async parse(doc: DocumentContext): Promise<IChapter[]> {
            return await strategy.parse(doc);
        }
    };
}

export const LookForChapterHeadingStrategy = (params: IChapterParserOptions): ChapterParsingStrategy => {
    const {persistChapter, logLevel, persistStrategy} = params;
    const parse = async (doc: DocumentContext): Promise<IChapter[]> => {
        const numPages = await doc.pageCount();
        console.log("Number of pages", numPages);
        const chapterBreaks: IChapter[] = [];
        const numWords = await doc.wordCount();
        console.log("Number of words", numWords);
        let chapterCount = 0;
        let numWordsPerChapter = 0;
        let chapterWords = '';
        let lines = [];

        const chapterPersist = createChapterPersistenceContext(persistStrategy);
        for (let i = 0; i < 130; i++) {
            const page = await doc.getPage(i);
            console.log("Page", i, page);
            lines = page.match(/[^\r\n]+/g) || [];
            try {
                // Loop through the lines on the page and look for "Chapter" keyword
                for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                    const line = lines[lineIndex];
                    if (line.toLowerCase().includes('chapter')) {
                        const lineIndexLookahead = Math.min(lineIndex + 3, lines.length);
                        chapterBreaks.push({
                            id: `page-${i}-line-${lineIndex}`,
                            page: i,
                            chapter: chapterCount + 1,
                            numWords: -1,
                            firstFewWords: lines.slice(lineIndex, lineIndexLookahead).join(" ")
                        });
                        console.log("Found chapter break", chapterBreaks);
                        if(chapterWords.length > 0) {
                            console.log("Persisting chapter words", chapterWords);
                            if(persistChapter) {
                                console.log("Persisting chapter words for chapter ", chapterCount)
                                await chapterPersist.saveChapter(
                                    chapterWords,
                                    chapterCount
                                );
                            } else {
                                console.log("Not persisting chapter words");
                            }
                        }
                        chapterWords = line;
                        if (chapterCount > 0) {
                            // Add end to the previous chapter
                            chapterBreaks[chapterCount - 1].end = `page-${i}-line-${lineIndex}`;
                            chapterBreaks[chapterCount - 1].numWords = numWordsPerChapter;
                            console.log("Added end to previous chapter", numWordsPerChapter);
                            numWordsPerChapter = 0;
                        }
                        chapterCount += 1;
                        numWordsPerChapter = 0;
                        console.log("chapterCount", chapterCount, "numWordsPerChapter reset", numWordsPerChapter)
                        break;
                    } else {
                        numWordsPerChapter += numberOfWords(stripNewlinesAndCollapseSpaces(line));
                    }
                }
            } catch (e) {
                console.log("error parsing chapter breaks", e);
            }
        }
        if (chapterBreaks.length === 0) {
            console.log("No chapter breaks found, adding one at the beginning of the book");
            let firstFewWords = '';
            try {
                firstFewWords = (await doc.getPage(0)).split(" ").slice(0, 50).join(" ");
            } catch (err) {
                console.log("Problem getting first few words", err);
            }
            chapterBreaks.push({
                id: "page-0-line-0",
                page: 1,
                chapter: 1,
                numWords,
                firstFewWords
            });
        } else {
            chapterBreaks[chapterBreaks.length - 1].end = `page-${numPages}-line-${lines.length}`;
            chapterBreaks[chapterBreaks.length - 1].numWords = numWordsPerChapter;
        }
        console.log("Chapter breaks", chapterBreaks);
        return chapterBreaks;
    }
    return {
        parse
    }
}
