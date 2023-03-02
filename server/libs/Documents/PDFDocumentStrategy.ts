import {
  IBookMetadata,
  IChapter,
  IRawBook,
} from "../../../types/summaraizeTypes";
import { DocumentStrategy } from "./DocumentStrategy";
import pdfParse from "pdf-parse";
import { findAuthorInContents, getTitleFromUrl } from "../book-lib";
import striptags from "striptags";
import openaiLib from "../openai-lib";

const PDFDocumentStrategy = (params: { book: IRawBook }): DocumentStrategy => {
  const { book } = params;
  const pdf = async (): Promise<pdfParse.Result> => {
    return await pdfParse(book.fileContents);
  };
  const wordCount = async (): Promise<number> => {
    const allWords = await getAllText();
    return allWords.split(" ").length;
  };

  const getAllText = async (): Promise<string> => {
    const doc = await pdf();
    return striptags(doc.text);
  };

  const getNativeDocument = async (): Promise<pdfParse.Result> => {
    return await pdf();
  };

  const parseMetadata = async (): Promise<IBookMetadata> => {
    const doc = await pdf();
    console.log("Got PDF doc");
    const title = doc.info.Title || getTitleFromUrl(book.url) || "Untitled";
    const text = await getAllText();
    const oai = openaiLib({});
    const author =
      (await oai.askGPTToFindAuthor(text.split(" ").slice(0, 100).join(" "))) ||
      "Unknown Author";
    const chapters: IChapter[] = [];
    return {
      author,
      title,
      numWords: await wordCount(),
      chapters,
      fileType: {
        ext: "pdf",
        mime: "application/pdf",
      },
    };
  };

  const getNativeChapters = async (): Promise<IChapter[]> => {
    const doc = await pdf();
    const chapters: IChapter[] = [];
    return chapters;
  };

  const getNativeChapterText = async (chapterId: string): Promise<string> => {
    return "not yet implemented";
  };

  return {
    parseMetadata,
    getAllText,
    book,
    getNativeDocument,
    getNativeChapters,
    getNativeChapterText,
  };
};

export default PDFDocumentStrategy;
