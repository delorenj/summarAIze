import { IBookMetadata } from "../../../types/summaraizeTypes";

export interface ChapterPersistenceStrategy {
    saveChapter(chapterText:string, chapterIndex: number): Promise<string>;
}
