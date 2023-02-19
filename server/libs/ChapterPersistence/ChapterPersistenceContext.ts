import {IChapter, IRawBook} from "../../../types/summaraizeTypes";
import {ChapterPersistenceStrategy} from "./ChapterPersistenceStrategy";

export interface ChapterPersistenceContext {
    strategy: ChapterPersistenceStrategy;
    saveChapter(chapterText: string, chapterIndex: number): Promise<string>;
}

export const createChapterPersistenceContext = (strategy: ChapterPersistenceStrategy): ChapterPersistenceContext => {
    const saveChapter = async (chapterText: string, chapterIndex: number): Promise<string> => {
        return await strategy.saveChapter(chapterText, chapterIndex);
    }

    return {
        strategy,
        saveChapter
    };
};
