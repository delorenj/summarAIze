import { IBookMetadata, IRawBook } from "../../../types/summaraizeTypes";

export const wordsPerPage = 300;
export interface DocumentStrategy {
  book: IRawBook;
  parseMetadata(): Promise<IBookMetadata>;
  getAllText(): Promise<string>;
}
