import * as AWS from "aws-sdk";
import { fileTypeFromBuffer } from "file-type";
import { EPub } from "epub2";
import pdf from "fork-pdf-parse-with-pagepertext";
import striptags from "striptags";
import { toPng } from "html-to-image";
import * as cheerio from "cheerio";

import {
  FileType,
  IBook,
  IBookMetadata,
  IChapter,
  IChapterParserOptions,
  IChapterText,
  IFileType,
  IPagePerText,
  IRawBook,
  ISummaryFormPayload,
  ISummaryJobStatus,
  LogLevel,
} from "../../types/summaraizeTypes";
import { promises as fs } from "fs";
import { dirname as getDirName } from "path";
import { getBooks } from "./user-lib";
import EpubDocumentStrategy from "./Documents/EpubDocumentStrategy";
import {
  createDocumentContext,
  DocumentContext,
  DocumentFactory,
} from "./Documents/DocumentContext";
import PDFDocumentStrategy from "./Documents/PDFDocumentStrategy";
import { createChapterParserContext } from "./ChapterParser/ChapterParserContext";
import PlainTextDocumentStrategy from "./Documents/PlainTextDocumentStrategy";
import { LookForChapterHeadingParserStrategy } from "./ChapterParser/LookForChapterHeadingParserStrategy";
import { DocumentStrategy } from "./Documents/DocumentStrategy";
import { NativeChapterParserStrategy } from "./ChapterParser/NativeChapterParserStrategy";
import { BookCoverRequest, getBookCoverByBookCoverRequest } from "../cover";
import openaiLib from "./openai-lib";
import { DOMParser } from "xmldom";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const s3 = new AWS.S3();

export const getDocumentByTitle = async (
  title: string
): Promise<DocumentContext> => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  //first, get all the books from the DB
  const params = {
    TableName: "dev-books",
  };

  const reg = new RegExp(title, "i");
  const books: any = await dynamoDb.scan(params).promise();
  const book = books.Items.filter((book: IBook) => book.title.match(reg))[0];
  return DocumentFactory().createFromBook(book);
};

export const getBookCoverByBook = async (book: IBook) => {
  try {
    if (!book.author || book.author === "" || book.author === "Unknown") {
      console.log("no author found for book", book);
      throw new Error("No author found for book");
    }
    if (!book.title || book.title === "" || book.title === "Unknown") {
      console.log("no title found for book", book);
      throw new Error("No title found for book");
    }

    const req: BookCoverRequest = {
      bookTitle: book.title,
      authorName: book.author,
    };
    console.log("get book cover by book request", req);
    return await getBookCoverByBookCoverRequest(req);
  } catch (e) {
    console.log(
      "getBookCoverByBook(): Error getting book cover. TODO: Replace with filetype cover right here.",
      e
    );
    const cover = await generateCoverImageByBook(book);
    console.log("getBookCoverByBook(): generated cover", cover);
    return cover;
  }
};

export const generateCoverImageByBook = async (book: IBook) => {
  const doc = await DocumentFactory().createFromBook(book);
  const textContents = await doc.getFirstPageRaw();
  console.log("generateCoverImageByBook(): textContents", textContents);
  const parser = new DOMParser();
  const html = parser.parseFromString(textContents, "plain/text");
  console.log("generateCoverImageByBook(): html", html);
  const container = document.createElement("div");
  container.style.width = "300px";
  container.style.height = "400px";
  container.appendChild(html);

  // Convert the container element to an image using 'html-to-image'
  toPng(container).then((pngBlob) => {
    // Generate a unique filename for the image
    const filename = `${book.userId}/${book.key}-cover.png`;
    console.log("generateCoverImageByBook(): filename", filename);
    // Upload the image to S3
    s3.upload(
      {
        Bucket: "summaraize-book",
        Key: filename,
        Body: pngBlob,
        ContentType: "image/png",
      },
      (error, data) => {
        if (error) {
          console.error("Error:", error);
        } else {
          console.log("Success:", data);
          return data;
        }
      }
    );
  });
};

export const getBookById = async (
  bookId: string,
  userId: string
): Promise<IBook> => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: "dev-books",
    Key: {
      userId: userId.replace(/"/g, ""),
      bookId: bookId.replace(/"/g, ""),
    },
  };
  console.log("get book params", params);
  const result = await dynamoDb.get(params).promise();
  console.log("get book result", result);
  if (!result.Item) {
    console.log("no book found. Maybe it's a public book?");
    params.Key.userId = "public";
    const result = await dynamoDb.get(params).promise();
    if (result.Item) {
      result.Item.userId = "public";
    }
    return result.Item as IBook;
  }
  if (result.Item) {
    result.Item.userId = userId;
  }
  return result.Item as IBook;
};

export const getBookJobs = async (
  bookId: string,
  userId: string
): Promise<ISummaryJobStatus[]> => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: process.env.booksJobsTableName as string,
    KeyConditionExpression: "bookId = :bookId",
    ExpressionAttributeValues: {
      ":bookId": bookId,
    },
  };
  console.log("params", params);
  const bookJobs = await dynamoDb.query(params).promise();
  console.log("bookJobs", bookJobs);
  if (!bookJobs.Items) {
    console.log("no book jobs");
    return [];
  }
  const Keys = bookJobs.Items.map((item) => {
    return {
      userId,
      jobId: item.jobId,
    };
  });
  console.log("Keys", Keys);

  const jobParams = {
    RequestItems: {
      [process.env.jobsTableName as string]: {
        Keys,
      },
    },
  };
  console.log("jobParams", jobParams);
  try {
    const resp = await dynamoDb.batchGet(jobParams).promise();
    console.log("resp", resp);
    if (!resp.Responses) {
      console.log("no responses");
      return [];
    }
    const jobs = resp.Responses[process.env.jobsTableName as string];
    console.log("jobs", jobs);
    return jobs as ISummaryJobStatus[];
  } catch (e) {
    console.log("error", e);
    return [];
  }
};
export const getUserIdFromRawBook = (book: IRawBook): string => {
  if (!book.url) {
    throw new Error("No book url");
  }
  return book.url.split("/")[0];
};
export const getChapterUrlByRawBook = (
  book: IRawBook,
  chapterIndex: number
): string => {
  if (!book.url) {
    throw new Error("No book url");
  }
  const bookKey = book.url.split("/").pop();
  return `${getUserIdFromRawBook(
    book
  )}/chapters/${bookKey}/${chapterIndex}.txt`;
};

export const getChapterTextByPayload = async (
  payload: ISummaryFormPayload,
  userId: string
): Promise<IChapterText[]> => {
  const book = await getBookById(payload.bookId, userId);
  console.log("book", book);
  const rawBook = await loadBookContentsAndGenerateMetadata(
    book.userId + "/" + book.key
  );
  console.log("rawBook", rawBook);
  const chapterTexts = [];
  for (const selectedChapter of payload.selectedChapters) {
    console.log("selectedChapter", selectedChapter);
    const chapter = getRawChapterByIndex(book, selectedChapter.index);
    console.log("chapter", chapter);
    const chapterText = await getTextByChapter(rawBook, chapter);
    console.log("chapterText", chapterText);
    chapterTexts.push({ chapter, text: chapterText });
  }
  return chapterTexts;
};

const getEpubChapterText = async (
  book: IRawBook,
  chapter: IChapter
): Promise<string> => {
  const epub = await EPub.createAsync(book.fileContents as unknown as string);
  const chapterText = await epub.getChapterRawAsync(chapter.chapterId);
  return striptags(chapterText);
};

//TODO: This is not working yet
const getPdfChapterText = async (
  book: IRawBook,
  chapter: IChapter
): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    pdf(
      book.fileContents as unknown as Buffer,
      (err: Error, data: IPagePerText) => {
        if (err) {
          reject(err);
        }
        const chapterText = "PDF: TO BE IMPLEMENTED"; //data.text.slice(chapter.start, chapter.end);
        resolve(chapterText);
      }
    );
  });
};

//TODO: This is not working yet
const getGenericChapterText = async (
  book: IRawBook,
  chapter: IChapter
): Promise<string> => {
  return new Promise<string>((resolve) => {
    const chapterText = "Generic/Txt: TO BE IMPLEMENTED"; //data.text.slice(chapter.start, chapter.end);
    resolve(chapterText);
  });
};

const getTextByChapter = async (
  book: IRawBook,
  chapter: IChapter
): Promise<string> => {
  if (!book.fileContents) {
    throw new Error("No file contents");
  }
  switch (book.fileType) {
    case FileType.EPUB:
      return await getEpubChapterText(book, chapter);
    case FileType.PDF:
      return await getPdfChapterText(book, chapter);
    case FileType.TEXT:
    default:
      return await getGenericChapterText(book, chapter);
  }
};

const getRawChapterByIndex = (book: IBook, chapterIndex: number): IChapter => {
  const filteredChapters = book.chapters.filter(
    (chapter) => chapter.index === chapterIndex
  );
  if (filteredChapters.length === 0) {
    throw new Error(`Could not find chapter with index ${chapterIndex}`);
  }
  return filteredChapters[0];
};

export const getBookRow = async (
  bookId: string,
  userId: string
): Promise<IBook> => {
  const books = await getBooks(userId);
  console.log("jong books", books);
  const book = books.filter((book) => book.bookId === bookId);
  if (!book) {
    throw new Error(`Could not find book with id ${bookId}`);
  }
  return book[0] as IBook;
};

export const findAuthorInContents = (contents: string): string | null => {
  // Regular expression to match an author name in the format "Last, First"
  const authorRegex = /(?<=(Author|Written by):\s+)[A-Za-z]+,\s+[A-Za-z]+/g;
  const match = contents.match(authorRegex);

  if (match && match.length > 0) {
    return match[0];
  } else {
    return null;
  }
};
export const loadBookContentsAndGenerateMetadata = async (
  url: string,
  options?: any
): Promise<IRawBook> => {
  // Always get the book from S3 for now
  // try {
  //     const book = await readFileFromTemp(url);
  //     console.log("Book read from /tmp");
  //     const metadata = await generateBookMetadata(book);
  //     return {
  //         url,
  //         fileContents: book.fileContents,
  //         metadata
  //     };
  // } catch (err) {
  //     console.log("Problem getting book from /tmp:", err);
  const rawBook: IRawBook = await getRawBookByUrl(url);
  if (!rawBook) {
    throw new Error(`Could not find rawBook at ${url}`);
  }
  const metadata: IBookMetadata = await generateBookMetadata(rawBook, options);
  await writeBookToTemp(rawBook);
  return {
    url,
    fileType: rawBook.fileType,
    fileContents: rawBook.fileContents,
    metadata,
    id: rawBook.id,
  };
  // };
};

export const updateBookCover = async (
  bookId: string,
  userId: string,
  cover: string
): Promise<void> => {
  const params: any = {
    TableName: process.env.booksTableName,
    Key: {
      userId: userId,
      bookId: bookId,
    },
    UpdateExpression: "set cover = :cover",
    ExpressionAttributeValues: {
      ":cover": cover,
    },
    ReturnValues: "UPDATED_NEW",
  };

  try {
    console.log("Updating book cover", params);
    await dynamoDb.update(params).promise();
  } catch (err) {
    console.log("Problem updating book cover:", err);
  }
};

export const writeMetadataToDB = async (userId: string, book: IRawBook) => {
  const params: any = {
    TableName: process.env.booksTableName,
    Item: {
      // The attributes of the item to be created
      userId: userId.replace(/"/g, ""),
      author: book.metadata?.author,
      bookId: book.id.replace(/"/g, ""),
      format: book.metadata?.fileType.ext,
      title: book.metadata?.title,
      chapters: book.metadata?.chapters,
      numWords: book.metadata?.numWords,
      key: getKeyFromUrl(book.url),
      sizeInBytes: book.fileContents?.length,
      createdAt: Date.now(), // Current Unix timestamp
    },
  };

  try {
    console.log("Writing to DB", params);
    await dynamoDb.put(params).promise();
  } catch (err) {
    console.log("Problem writing to DB:", err);
  }
};

// a function to write the files to tmp on the lambda
const writeBookToTemp = async (book: IRawBook) => {
  console.log(
    `writing cached books to /tmp`,
    `/tmp/${book.url}`,
    book.fileContents
  );
  await fs.mkdir(`/tmp/${getDirName(book.url)}`, { recursive: true });
  await fs.writeFile(`/tmp/${book.url}`, book.fileContents);
  console.log("Book written to /tmp");
};

// a function to read the cached files from tmp
// async function readFileFromTemp(url) {
//     const file = await fs.readFile(`/tmp/${url}`);
//     console.log("readFileFromTemp", url, file);
//     return {
//         url: url,
//         fileContents: file,
//     };
// }

// a function to pull the files from an s3 bucket before caching them locally
export const getRawBookByUrl = async (url: string): Promise<IRawBook> => {
  console.log("getRawBookByUrl", url);

  try {
    const object = await s3
      .getObject({
        Key: url,
        Bucket: "summaraize-book",
      })
      .promise();

    console.log("Got object!");
    console.log("Returning: ", object);
    return {
      url: url,
      fileType: url.split(".").pop() || "txt",
      fileContents: object.Body as Buffer,
      id: object.ETag || "unknown",
    };
  } catch (err) {
    console.log("Problem getting S3 object:", err);
    throw err;
  }
};

export const isPlainText = (fileType: IFileType) => {
  return fileType && fileType.mime === "text/plain";
};

export const isEpub = (fileType: IFileType) => {
  return fileType && fileType.mime === "application/epub+zip";
};

export const isPdf = (fileType: IFileType) => {
  return fileType && fileType.mime === "application/pdf";
};

export const numberOfWords = (text: string): number => {
  return text?.split(" ").length || 0;
};

export const stripNewlinesAndCollapseSpaces = (str: string): string => {
  return str.replace(/(\r\n|\n|\r|\t|\s{2,})/gm, " ").trim();
};

export const getTitleFromUrl = (url: string): string | undefined => {
  return url.split("/").pop()?.split(".")[0];
};

const getKeyFromUrl = (url: string): string | undefined => {
  return url.split("/").pop();
};

//This method is called by the client to get the book metadata
export const generateBookMetadata = async (
  rawBook: IRawBook,
  options?: any
): Promise<IBookMetadata> => {
  console.log("generateBookMetadata()", rawBook);
  if (!rawBook.fileContents) {
    throw new Error("No file contents");
  }
  const fileType = (await fileTypeFromBuffer(rawBook.fileContents)) || {
    ext: "txt",
    mime: "plain/text",
  };
  console.log("generateBookMetadata(): fileTypeFromBuffer", fileType);

  const oai = openaiLib({});
  const author =
    findAuthorInContents(rawBook.fileContents.toString()) ||
    (await oai.askGPTToFindAuthor(
      rawBook.fileContents.toString().split(" ").slice(0, 100).join(" ")
    )) ||
    "Unknown Author";
  if (options?.simple) {
    return {
      author,
      fileType,
      title: getTitleFromUrl(rawBook.url) || "Untitled",
      numWords: 0,
      chapters: [],
    };
  }

  let docStrategy: DocumentStrategy;

  if (isEpub(fileType)) {
    docStrategy = EpubDocumentStrategy({ book: rawBook });
  } else if (isPdf(fileType)) {
    docStrategy = PDFDocumentStrategy({ book: rawBook });
  } else {
    console.log(
      "generateBookMetadata(): Unknown file type, treating as plain text",
      fileType
    );
    docStrategy = PlainTextDocumentStrategy({ book: rawBook });
  }

  const documentContext = createDocumentContext(docStrategy);
  const parserOptions: IChapterParserOptions = {
    persistChapter: true,
    logLevel: LogLevel.DEBUG,
  };

  const metadata = await documentContext.parseMetadata();
  console.log("generateBookMetadata(): Got book metadata", metadata);
  console.log("generateBookMetadata(): options", options);
  console.log(
    "generateBookMetadata(): !options.metadataOnly",
    !options?.metadataOnly
  );
  if (!options?.metadataOnly) {
    console.log("generateBookMetadata(): Going to parse chapters");
    let chapterParser = createChapterParserContext(
      documentContext,
      NativeChapterParserStrategy(parserOptions)
    );
    console.log(
      "generateBookMetadata(): Created chapter parser",
      chapterParser
    );
    let avgWordsPerChapter = await chapterParser.avgWordsPerChapter(0, 150);
    console.log(
      "generateBookMetadata(): Got avgWordsPerChapter",
      avgWordsPerChapter
    );
    let chapters: IChapter[] = [];
    console.log(
      "generateBookMetadata(): Got avgWordsPerChapter",
      avgWordsPerChapter
    );
    if (avgWordsPerChapter > 4000) {
      console.log(
        "generateBookMetadata(): Too many words per chapter, going to see if headings are present"
      );
      chapterParser = createChapterParserContext(
        documentContext,
        LookForChapterHeadingParserStrategy(parserOptions)
      );
      avgWordsPerChapter = await chapterParser.avgWordsPerChapter(0, 150);
      console.log(
        "generateBookMetadata(): Got avgWordsPerChapter",
        avgWordsPerChapter
      );
      if (avgWordsPerChapter > 4000) {
        console.log(
          "generateBookMetadata(): Too many words per chapter, going to manually parse"
        );
        throw new Error(
          "generateBookMetadata(): Artificial chapters not supported yet"
        );
      }

      chapters = await chapterParser.parse();
      console.log("Got Chapters", chapters);
      metadata.chapters = chapters;
    } else {
      console.log(
        "generateBookMetadata(): Not too many words per chapter, going to use native chapters"
      );
      chapters = await chapterParser.parse();
      console.log("generateBookMetadata(): Got Chapters", chapters);
      metadata.chapters = chapters;
    }

    console.log("generateBookMetadata(): metadata after chapter parsing", {
      author: metadata.author || "Unknown",
      fileType: fileType,
      title: metadata.title,
      numWords: metadata.numWords,
      chapters: metadata.chapters,
    });
  } else {
    console.log("generateBookMetadata(): Skipping chapter parsing...");
  }

  let cover;
  try {
    cover = await getBookCoverByBookCoverRequest({
      bookTitle: metadata.title,
      authorName: metadata.author,
    });
  } catch (err) {
    console.log("generateBookMetadata(): Error getting book cover.", err);
  }

  if (!cover) {
    const userId = getUserIdFromRawBook(rawBook);
    const book = await getBookById(rawBook.id, userId);
    cover = await generateCoverImageByBook(book);
    console.log("generateBookMetadata(): Generated cover image", cover);
  }

  return {
    author: metadata.author || "Unknown",
    fileType,
    title: metadata.title || "Untitled",
    cover,
    numWords: metadata.numWords,
    chapters: metadata.chapters,
  };
};
