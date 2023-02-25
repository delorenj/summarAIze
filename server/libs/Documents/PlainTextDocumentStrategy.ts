import {
  IBookMetadata,
  IChapter,
  IRawBook,
} from "../../../types/summaraizeTypes";
import { DocumentStrategy } from "./DocumentStrategy";
import { findAuthorInContents, getTitleFromUrl } from "../book-lib";
import striptags from "striptags";
import openaiLib from "../openai-lib";

const PlainTextDocumentStrategy = (params: {
  book: IRawBook;
}): DocumentStrategy => {
  const { book } = params;
  const plainText = (): string => {
    return book.fileContents.toString("utf8");
  };
  const wordCount = async (): Promise<number> => {
    const allWords = await getAllText();
    return allWords.split(" ").length;
  };

  const getAllText = async (): Promise<string> => {
    const doc = plainText();
    return striptags(doc);
  };

  const getNativeDocument = async (): Promise<string> => {
    return plainText();
  };

  const parseMetadata = async (): Promise<IBookMetadata> => {
    const doc = plainText();
    console.log("Got PlainText doc");
    const oai = openaiLib({});
    const title = getTitleFromUrl(book.url) || "Untitled";
    const text = await getAllText();
    const author =
      findAuthorInContents(await getAllText()) ||
      (await oai.askGPTToFindAuthor(text.split(" ").slice(0, 100).join(" "))) ||
      "Unknown Author";

    const chapters: IChapter[] = [];
    console.log("chapters", chapters);
    return {
      author,
      title,
      numWords: await wordCount(),
      chapters,
      fileType: {
        ext: "plainText",
        mime: "application/plainText",
      },
    };
  };

  const getNativeChapters = async (): Promise<IChapter[]> => {
    const doc = plainText();
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

export default PlainTextDocumentStrategy;
