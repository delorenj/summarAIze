import {
  IBookMetadata,
  IChapter,
  IRawBook,
} from "../../../types/summaraizeTypes";
import { EPub } from "epub2";
import pdfParse from "pdf-parse";

export const wordsPerPage = 300;
export interface DocumentStrategy {
  book: IRawBook;
  parseMetadata(): Promise<IBookMetadata>;
  getAllText(): Promise<string>;
  extractCoverImage(): Promise<string[]>;
  getNativeDocument(): Promise<EPub | pdfParse.Result | string>;
  getNativeChapters(): Promise<IChapter[]>;
  getNativeChapterText(chapterId: string): Promise<string>;
}
