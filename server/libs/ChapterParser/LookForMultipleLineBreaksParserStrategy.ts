import { defaultChapterParserOptions } from "./ChapterParserContext";
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

export const chapterBreakRegex = /(.*)([\r\n]{3,})/;
export const LookForMultipleLineBreaksParserStrategy = (
  params: IChapterParserOptions
): ChapterParsingStrategy => {
  const options = {
    ...defaultChapterParserOptions,
    ...params,
  };
  console.log("LookForChapterHeading parser options", options);
  const log = (message: string, ...args: any[]) => {
    if (options.logLevel === "debug") {
      console.log(message, ...args);
    }
  };

  const pageMatchWasOk = (pageMatch: any[]) => {
    return true;
  };

  const parse = async (doc: DocumentContext): Promise<IChapter[]> => {
    log("Parsing document with LookForMultipleLineBreaksParserStrategy");
    const numPages = await doc.pageCount();
    log("Number of pages", numPages);
    const numWords = await doc.wordCount();
    log("Number of words", numWords);
    let chapterCount = 0;
    const chapterRows: IChapter[] = [];
    const currentPlaceholder: IChapterPlaceholder = {
      chapterNumber: 0,
      pageStart: 0,
      lineStart: 0,
      text: "",
      artificial: false,
    };
    const chapterPersist = createChapterPersistenceContext(
      S3ChapterPersistenceStrategy(doc)
    );

    const lockInChapter = async () => {
      const strippedText = stripNewlinesAndCollapseSpaces(
        currentPlaceholder.text
      );
      const chapterRow: IChapter = {
        index: currentPlaceholder.chapterNumber,
        bookmark: `page-${currentPlaceholder.pageStart}-line-${currentPlaceholder.lineStart}`,
        page: currentPlaceholder.pageStart,
        numWords: strippedText.split(" ").length,
        firstFewWords: strippedText.split(" ").slice(0, 10).join(" "),
        artificial: currentPlaceholder.artificial,
      };
      if (options.persistChapter && strippedText.length > 0) {
        log("Persisting chapter", currentPlaceholder);
        const s3Url = await chapterPersist.saveChapter(
          strippedText,
          currentPlaceholder.chapterNumber
        );
        log("Persisted chapter on S3");
        chapterRow.persistStrategy = "S3";
      } else {
        log("Not persisting chapter");
        if (strippedText.length === 0) {
          log("...because chapter has no text");
        }
      }
      if (strippedText.length > 0) {
        chapterRows.push(chapterRow);
      } else {
        log("Chapter has no words, so we're not going to persist it");
      }
    };

    for (let i = 0; i < numPages; i++) {
      const page = await doc.getPage(i);
      const headingCheckRegex = new RegExp(chapterBreakRegex, "igm");
      const pageMatch = page.match(headingCheckRegex);
      if (!pageMatch) {
        currentPlaceholder.text += ` ${page}`; //Append the line to the current chapter with a space just in case
        currentPlaceholder.lineEnd = page.length - 1;
        currentPlaceholder.pageEnd = i - 1;

        if (i === numPages - 1) {
          log(
            "Looks like we've reached the end of the book. Persisting the last chapter"
          );
          await lockInChapter();
        }
        continue;
      }

      await lockInChapter();

      //Reset the current placeholder to the new chapter
      chapterCount += 1;
      currentPlaceholder.text = pageMatch[1];
      currentPlaceholder.lineStart = page.length - pageMatch[1].length;
      currentPlaceholder.pageStart = i;
      currentPlaceholder.chapterNumber = chapterCount;
      break;
    }
    log("Chapter breaks", chapterRows);
    return chapterRows.filter((chapter) => chapter.numWords > 0);
  };

  const numChapters = async (
    doc: DocumentContext,
    minPage: number,
    maxPage: number
  ): Promise<number> => {
    const numPages = await doc.pageCount();
    const numWords = await doc.wordCount();
    console.log("numPages", numPages);
    console.log("numWords", numWords);
    const chapterPages: number[] = [];
    for (let i = minPage; i < Math.min(maxPage || 10000, numPages); i++) {
      const page = await doc.getPage(i);
      console.log("Page", i, page);
      const headingCheckRegex = new RegExp(chapterBreakRegex, "igm");
      const pageMatch = page.matchAll(headingCheckRegex);
      console.log("pageMatch", pageMatch);
      for (const match of pageMatch) {
        console.log(match);
        console.log(match.index);
        chapterPages.push(i);
      }
    }
    console.log("chapterPages", chapterPages);
    return chapterPages.length;
  };

  return {
    options,
    parse,
    numChapters,
  };
};
