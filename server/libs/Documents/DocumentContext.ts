import {IChapterParserOptions, IRawBook, LogLevel} from "../../../types/summaraizeTypes";
import {DocumentStrategy, wordsPerPage} from "./DocumentStrategy";
import {LookForChapterHeadingParserStrategy} from "../ChapterParser/LookForChapterHeadingParserStrategy";
import PDFDocumentStrategy from "./PDFDocumentStrategy";
import {createChapterParserContext} from "../ChapterParser/ChapterParserContext";
import {fileTypeFromBuffer} from "file-type";
import EpubDocumentStrategy from "./EpubDocumentStrategy";
import PlainTextDocumentStrategy from "./PlainTextDocumentStrategy";
import S3ChapterPersistenceStrategy from "../ChapterPersistence/S3ChapterPersistenceStrategy";
import {isPdf, isEpub, isPlainText} from "../book-lib";

export interface DocumentContext {
    strategy: DocumentStrategy;
    book: IRawBook;
    getPage(pageNumber: number): Promise<string>;
    pageCount: () => Promise<number>;
    parseMetadata: () => Promise<any>;
    wordCount: () => Promise<number>;
    getAllWords: () => Promise<string[]>;
    getAllText: () => Promise<string>;
}

export interface IDocumentFactory {
    createFromRawBook(book: IRawBook): Promise<DocumentContext>;
}

export const DocumentFactory = (): IDocumentFactory => {
    const createFromRawBook = async (book: IRawBook): Promise<DocumentContext> => {
        const fileType = await fileTypeFromBuffer(book.fileContents) || {ext: "txt", mime: "plain/text"};
        console.log("fileTypeFromBuffer", fileType);
        if (isEpub(fileType)) {
            return createDocumentContext(EpubDocumentStrategy({book}));
        } else if (isPdf(fileType)) {
            return createDocumentContext(PDFDocumentStrategy({book}));
        } else {
            console.log("Unknown file type, treating as plain text", fileType);
            return createDocumentContext(PlainTextDocumentStrategy({book}));
        }
    };
    return {
        createFromRawBook
    };
}

export const createDocumentContext = (strategy: DocumentStrategy): DocumentContext => {
    const getAllWords = async (): Promise<string[]> => {
        return (await strategy.getAllText()).split(" ");
    };

    const wordCount = async (): Promise<number> => {
        return (await getAllWords()).length;
    };

    const pageCount = async (): Promise<number> => {
        const totalWords = await wordCount();
        return Math.ceil(totalWords / wordsPerPage);
    };

    const getPage = async (pageNumber: number): Promise<string> => {
        const totalPages = await pageCount();
        if (pageNumber >= totalPages) {
            throw new Error("Page number is out of range");
        }
        const allWords = await getAllWords();
        const startWord = (pageNumber - 1) * wordsPerPage;
        const endWord = pageNumber * wordsPerPage;
        const pageWords = allWords.slice(startWord, endWord);
        return pageWords.join(" ");
    };

    return {
        strategy,
        book: strategy.book,
        async parseMetadata(): Promise<any> {
            return await strategy.parseMetadata();
        },
        async getAllText(): Promise<string> {
            return await strategy.getAllText();
        },
        pageCount,
        wordCount,
        getAllWords,
        getPage
    };
};
