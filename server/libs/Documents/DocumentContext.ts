import {DocumentStrategy} from "./DocumentStrategy";

export interface DocumentContext {
  strategy: DocumentStrategy;
  getPage(pageNumber: number): Promise<string>;
  pageCount: () => Promise<number>;
  parseMetadata: () => Promise<any>;
  wordCount: () => Promise<number>;
  getAllWords: () => Promise<string[]>;
  getAllText: () => Promise<string>;
}

export const createDocumentContext = (strategy: DocumentStrategy): DocumentContext => {
  const getAllWords = async (): Promise<string[]> => {
    return (await strategy.getAllText()).split(" ");
  };

  const wordCount = async (): Promise<number> => {
    return (await getAllWords()).length;
  };

  return {
    strategy,
    async getPage(pageNumber: number) : Promise<string> {
      return await strategy.getPage(pageNumber);
    },
    async pageCount() : Promise<number> {
      return await strategy.pageCount();
    },
    async parseMetadata() : Promise<any> {
      return await strategy.parseMetadata();
    },
    async getAllText(): Promise<string> {
      return await strategy.getAllText();
    },
    getAllWords,
    wordCount,
  };
};
