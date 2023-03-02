import {
  IBookMetadata,
  IChapter,
  IRawBook,
} from "../../../types/summaraizeTypes";
import { DocumentStrategy, wordsPerPage } from "./DocumentStrategy";
import { EPub } from "epub2";
import striptags from "striptags";
import { font } from "pdfkit";
import { findAuthorInContents } from "../book-lib";
import openaiLib from "../openai-lib";

const EpubDocumentStrategy = (params: { book: IRawBook }): DocumentStrategy => {
  const { book } = params;

  const epub = async (): Promise<EPub> => {
    return await EPub.createAsync(book.fileContents as unknown as string);
  };
  const wordCount = async (): Promise<number> => {
    const allWords = await getAllText();
    return allWords.split(" ").length;
  };
  const pageCount = async (): Promise<number> => {
    const totalWords = await wordCount();
    return Math.ceil(totalWords / wordsPerPage);
  };

  const getAllWords = async (): Promise<string[]> => {
    const allWords = await getAllText();
    return allWords.split(" ");
  };

  const getNativeDocument = async (): Promise<EPub> => {
    return await epub();
  };

  const getAllText = async (): Promise<string> => {
    const doc = await epub();
    let text = "";
    for (const chapter of doc.flow) {
      const contents = await doc.getChapterRawAsync(chapter.id as string);
      text += contents;
    }
    return striptags(text);
  };
  const parseMetadata = async (): Promise<IBookMetadata> => {
    const doc = await epub();
    if (!book.fileContents) {
      throw new Error("No file contents");
    }
    const oai = openaiLib({});
    const text = await getAllText();
    const title = doc.metadata.title || "Untitled";
    const author =
      (await oai.askGPTToFindAuthor(text.split(" ").slice(0, 100).join(" "))) ||
      "Unknown Author";
    const chapters: IChapter[] = [];
    return {
      author,
      title: title || "Untitled",
      numWords: await wordCount(),
      chapters,
      fileType: {
        ext: "epub",
        mime: "application/epub+zip",
      },
    };
  };

  const getNativeChapters = async (): Promise<IChapter[]> => {
    const doc = await epub();
    const chapters: IChapter[] = [];
    console.log(doc);
    for (const chapter of doc.flow) {
      const contents = await getNativeChapterText(chapter.id as string);
      chapters.push({
        bookmark: `native-epub`,
        firstFewWords: contents.slice(0, 100),
        index: chapters.length,
        chapterTitle: chapter.title || chapter.id || "Untitled",
        numWords: await wordCount(),
        chapterId: chapter.id as string,
      });
    }
    return chapters;
  };

  const getNativeChapterText = async (chapterId: string): Promise<string> => {
    console.log("getNativeChapterText");
    const doc = await epub();
    console.log("chapterId", chapterId);
    const contents = await doc.getChapterRawAsync(chapterId);
    console.log("contents", contents);
    return striptags(contents);
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

export default EpubDocumentStrategy;
