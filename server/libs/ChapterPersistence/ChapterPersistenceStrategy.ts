import { IBookMetadata } from "../../../types/summaraizeTypes";

export interface ChapterPersistenceStrategy {
    TYPE: string;
    saveChapter(chapterText:string, chapterIndex: number): Promise<string>;
}
