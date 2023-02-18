import { IChapter } from "../../../types/summaraizeTypes";
import {DocumentContext} from "./DocumentContext";

export interface ChapterParsingStrategy {
    parse(doc: DocumentContext): Promise<IChapter[]>;
}
