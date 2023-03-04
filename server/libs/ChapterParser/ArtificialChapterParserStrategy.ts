import {
  ARTIFICIAL_CHAPTER_BREAK_THRESHOLD,
  defaultChapterParserOptions,
} from "./ChapterParserContext";
import { createChapterPersistenceContext } from "../ChapterPersistence/ChapterPersistenceContext";
import { stripNewlinesAndCollapseSpaces } from "../book-lib";
import { ChapterParsingStrategy } from "./ChapterParserStrategy";
import { DocumentContext } from "../Documents/DocumentContext";
import {
  IChapter,
  IChapterParserOptions,
  IChapterPlaceholder,
} from "../../../types/summaraizeTypes";
import S3ChapterPersistenceStrategy from "../ChapterPersistence/S3ChapterPersistenceStrategy";

export const ArtificialChapterParserStrategy = (
  params: IChapterParserOptions
): ChapterParsingStrategy => {
  const options = {
    ...defaultChapterParserOptions,
    ...params,
  };
  console.log("ArtificialChapter parser options", options);
  const log = (message: string, ...args: any[]) => {
    if (options.logLevel === "debug") {
      console.log(message, ...args);
    }
  };

  const parse = async (doc: DocumentContext): Promise<IChapter[]> => {
    throw new Error("ArtificialChapters not implemented");
  };

  const numChapters = async (
    doc: DocumentContext,
    minPage: number,
    maxPage: number
  ): Promise<number> => {
    throw new Error("not implemented");
  };

  return {
    options,
    parse,
    numChapters,
  };
};
