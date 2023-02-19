import { IChapter, IChapterParserOptions } from "../../../types/summaraizeTypes";
import {DocumentContext} from "../Documents/DocumentContext";

export interface ChapterParsingStrategy {
    parse(doc: DocumentContext): Promise<IChapter[]>;
    options: IChapterParserOptions;
    numChapters(doc: DocumentContext, minPage: number, maxPage: number): Promise<number>;
}
