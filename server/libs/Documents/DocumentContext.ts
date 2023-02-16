import {IChapter} from "../../../types/summaraizeTypes";
import {DocumentStrategy, wordsPerPage} from "./DocumentStrategy";

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
