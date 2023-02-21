import {defaultChapterParserOptions} from "./ChapterParserContext";
import {createChapterPersistenceContext} from "../ChapterPersistence/ChapterPersistenceContext";
import {ChapterParsingStrategy} from "./ChapterParserStrategy";
import {DocumentContext} from "../Documents/DocumentContext";
import {IChapter, IChapterParserOptions} from "../../../types/summaraizeTypes";
import S3ChapterPersistenceStrategy from "../ChapterPersistence/S3ChapterPersistenceStrategy";
import {stripNewlinesAndCollapseSpaces} from "../book-lib";

export const NativeChapterParserStrategy = (params: IChapterParserOptions): ChapterParsingStrategy => {
    const options = {
        ...defaultChapterParserOptions,
        ...params,
    };
    console.log("NativeChapter parser options", options);
    const log = (message: string, ...args: any[]) => {
        if (options.logLevel === "debug") {
            console.log(message, ...args);
        }
    }

    const parse = async (doc: DocumentContext): Promise<IChapter[]> => {
        log("Parsing document with NativeChapterParserStrategy");
        const numPages = await doc.pageCount();
        log("Number of pages", numPages);
        const numWords = await doc.wordCount();
        log("Number of words", numWords);

        const chapterRows = await doc.strategy.getNativeChapters();
        console.log("chapterRows", chapterRows);
        const chapterPersist = createChapterPersistenceContext(S3ChapterPersistenceStrategy(doc));
        for (let i = 0; i < chapterRows.length; i++) {
            const contents = await doc.strategy.getNativeChapterText(chapterRows[i].chapterId as string);
            const strippedText = stripNewlinesAndCollapseSpaces(contents);
            chapterRows[i].numWords = strippedText.split(" ").length;
            chapterRows[i].firstFewWords = strippedText.split(" ").slice(0, 10).join(" ");
            if (options.persistChapter && strippedText.length > 0) {
                log("Persisting chapter", chapterRows[i]);
                const s3Url = await chapterPersist.saveChapter(
                    strippedText,
                    chapterRows[i].index,
                );
                log("Persisted chapter on S3");
                chapterRows[i].persistStrategy = "S3"
            } else {
                log("Not persisting chapter");
                if (strippedText.length === 0) {
                    log("...because chapter has no text");
                }
            }
        }

        return chapterRows.filter(chapter => chapter.numWords > 0);
    }


    const numChapters = async (doc: DocumentContext, minPage: number, maxPage: number): Promise<number> => {
        const numPages = await doc.pageCount();
        const numWords = await doc.wordCount();
        console.log("numPages", numPages);
        console.log("numWords", numWords);
        const chapterRows = await doc.strategy.getNativeChapters();
        console.log("chapterRows", chapterRows);
        return chapterRows.length;
    }

    return {
        options,
        parse,
        numChapters,
    }
}

