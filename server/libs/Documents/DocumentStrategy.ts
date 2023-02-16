import { IBookMetadata } from "../../../types/summaraizeTypes";

export const wordsPerPage = 300;
export interface DocumentStrategy {
  getPage(pageNumber: number): Promise<string>;
  pageCount(): Promise<number>;
  parseMetadata(): Promise<IBookMetadata>;
  getAllText(): Promise<string>;
}
