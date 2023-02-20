import {IChapter, IChapterParserOptions, LogLevel} from "../../../types/summaraizeTypes";
import {DocumentContext} from "../Documents/DocumentContext";
import s3ChapterPersistenceStrategy from "../ChapterPersistence/S3ChapterPersistenceStrategy";
import S3ChapterPersistenceStrategy from "../ChapterPersistence/S3ChapterPersistenceStrategy";
import {ChapterParsingStrategy} from "./ChapterParserStrategy";

export const ARTIFICIAL_CHAPTER_BREAK_THRESHOLD = 20;

export interface ChapterParserContext {
    strategy: ChapterParsingStrategy;
    documentContext: DocumentContext,
    parse(): Promise<IChapter[]>,
    numChapters(minPage: number, maxPage: number): Promise<number>,
    avgWordsPerChapter(minPage: number, maxPage: number): Promise<number>,
}

/*
This is a piece of code that looks for "Chapter" headings in a document and creates
an array of IChapter objects that represent the chapter numbers, starting and ending
pages, and other information.

The code iterates through the pages of the document and for each page, it checks
whether there have been any chapters found on the past x pages (where x is a
predetermined value). If no chapters have been found in that number of pages, an
artificial chapter break is created.

If a chapter is found, the current chapter's information is locked in and the
placeholders for the next chapter are reset.

The code also checks for the last page of the document and locks in the last chapter
if necessary. Overall, this code is using a strategy to parse a document, look for
chapter headings, and create an array of chapter objects. It is checking for certain conditions and creating new chapter objects based on these conditions.
 */
export const defaultChapterParserOptions : IChapterParserOptions= {
    persistChapter: false,
    logLevel: LogLevel.DEBUG,
}
export const createChapterParserContext = (documentContext: DocumentContext, strategy: ChapterParsingStrategy): ChapterParserContext => {
    return {
        strategy,
        documentContext,
        async parse(): Promise<IChapter[]> {
            return await strategy.parse(documentContext);
        },
        async numChapters(minPage: number, maxPage: number): Promise<number> {
            return await strategy.numChapters(documentContext, minPage || 0, maxPage || 100);
        },
        async avgWordsPerChapter(minPage: number, maxPage: number): Promise<number> {
            const numChapters = await strategy.numChapters(documentContext, minPage || 0, maxPage || 100);
            const numWords = await documentContext.wordCount();
            return Math.floor(numWords / numChapters);
        }
    };
}
