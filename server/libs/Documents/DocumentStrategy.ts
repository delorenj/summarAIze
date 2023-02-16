import { IBookMetadata } from "../../../types/summaraizeTypes";

export const wordsPerPage = 300;
export interface DocumentStrategy {
  parseMetadata(): Promise<IBookMetadata>;
  getAllText(): Promise<string>;
}
