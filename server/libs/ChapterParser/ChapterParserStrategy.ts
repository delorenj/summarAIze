import { IChapter } from "../../../types/summaraizeTypes";
import {DocumentContext} from "../Documents/DocumentContext";

export interface ChapterParsingStrategy {
    parse(doc: DocumentContext): Promise<IChapter[]>;
}
