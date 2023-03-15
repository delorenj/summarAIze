import { IBook, IRawBook } from "../../../types/summaraizeTypes";
import { DocumentStrategy, wordsPerPage } from "./DocumentStrategy";
import PDFDocumentStrategy from "./PDFDocumentStrategy";
import { fileTypeFromBuffer } from "file-type";
import EpubDocumentStrategy from "./EpubDocumentStrategy";
import PlainTextDocumentStrategy from "./PlainTextDocumentStrategy";
import {
  isPdf,
  isEpub,
  getRawBookByUrl,
  getUserIdFromRawBook,
  getChapterUrlByRawBook,
  getChapterTextFromS3,
} from "../book-lib";
import * as stream from "stream";

export interface DocumentContext {
  strategy: DocumentStrategy;
  book: IRawBook;
  getPage(pageNumber: number): Promise<string>;
  pageCount: () => Promise<number>;
  parseMetadata: () => Promise<any>;
  wordCount: () => Promise<number>;
  getAllWords: () => Promise<string[]>;
  extractCoverImage: () => Promise<string[]>;
  getAllText: () => Promise<string>;
  getChapterText: (chapterIndex: number) => Promise<string>;
}

export interface IDocumentFactory {
  createFromRawBook(book: IRawBook): Promise<DocumentContext>;
  createFromBook(book: IBook): Promise<DocumentContext>;
}

export const DocumentFactory = (): IDocumentFactory => {
  const createFromRawBook = async (
    book: IRawBook
  ): Promise<DocumentContext> => {
    const fileType = (await fileTypeFromBuffer(book.fileContents)) || {
      ext: "txt",
      mime: "plain/text",
    };
    console.log("fileTypeFromBuffer", fileType);
    if (isEpub(fileType)) {
      return createDocumentContext(EpubDocumentStrategy({ book }));
    } else if (isPdf(fileType)) {
      return createDocumentContext(PDFDocumentStrategy({ book }));
    } else {
      console.log("Unknown file type, treating as plain text", fileType);
      return createDocumentContext(PlainTextDocumentStrategy({ book }));
    }
  };
  const createFromBook = async (book: IBook): Promise<DocumentContext> => {
    const rawBook = await getRawBookByUrl(book.userId + "/" + book.key);
    return createFromRawBook(rawBook);
  };
  return {
    createFromRawBook,
    createFromBook,
  };
};

export const createDocumentContext = (
  strategy: DocumentStrategy
): DocumentContext => {
  const getAllWords = async (): Promise<string[]> => {
    return (await strategy.getAllText()).split(" ");
  };

  const extractCoverImage = async (): Promise<string[]> => {
    return await strategy.extractCoverImage();
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

  const getChapterText = async (chapterIndex: number): Promise<string> => {
    return await getChapterTextFromS3(strategy.book, chapterIndex);
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
    extractCoverImage,
    getPage,
    getChapterText,
  };
};
