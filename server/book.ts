import handler, { invokeHandler, s3handler } from "./libs/handler-lib";
import {
  getBookById,
  getBookFromFileSystemOrS3,
  getBookJobs,
  searchForBookByTitle,
  writeMetadataToDB,
} from "./libs/book-lib";
import {
  APIGatewayProxyWithCognitoAuthorizerEvent,
  S3CreateEvent,
} from "aws-lambda";
import * as AWS from "aws-sdk";
import { IBook, IBookDetails, IRawBook } from "../types/summaraizeTypes";
import { DocumentFactory } from "./libs/Documents/DocumentContext";
import { LookForChapterHeadingParserStrategy } from "./libs/ChapterParser/LookForChapterHeadingParserStrategy";
import { createChapterParserContext } from "./libs/ChapterParser/ChapterParserContext";
import { ChapterParsingStrategy } from "./libs/ChapterParser/ChapterParserStrategy";
import { LookForMultipleLineBreaksParserStrategy } from "./libs/ChapterParser/LookForMultipleLineBreaksParserStrategy";
import { NativeChapterParserStrategy } from "./libs/ChapterParser/NativeChapterParserStrategy";

export interface IParseBookMetadataPayload {
  bookUrl: string;
}

//This method is called by the client to get the book metadata
export const parseBookMetadata = handler(
  async (event: APIGatewayProxyWithCognitoAuthorizerEvent) => {
    const userId = event.requestContext.authorizer.claims.sub;
    const body: IParseBookMetadataPayload = JSON.parse(event.body as string);
    const bookUrl = body.bookUrl;

    const book: IRawBook = await getBookFromFileSystemOrS3(bookUrl);
    await writeMetadataToDB(userId, book);
    return JSON.stringify({
      book,
    });
  }
);

export const onUpload = s3handler(async (event: S3CreateEvent) => {
  const object = event.Records[0].s3.object;
  const key = object.key;
  if (key.indexOf("/chapters/") > -1) {
    return "not a book";
  }
  const userId = key.split("/")[0];
  console.log("onUpload things", userId, key);
  const book = await getBookFromFileSystemOrS3(key);
  console.log("got book", book);
  await writeMetadataToDB(userId, book);
  return JSON.stringify({
    book,
  });
});

export const parseAllBooks = invokeHandler(async () => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  //first, get all the books from the DB
  const params = {
    TableName: "dev-books",
  };
  const books: any = await dynamoDb.scan(params).promise();
  console.log("books", books);
  for (const book of books.Items) {
    const bookUrl = `${book.userId}/${book.key}`;
    const bookFromS3 = await getBookFromFileSystemOrS3(bookUrl);
    await writeMetadataToDB(book.userId, bookFromS3);
  }
  //return the keys of the books that were parsed
  return { books: books.Items.map((book: IBook) => book.key) };
});

export const parseBook = invokeHandler(async (event) => {
  console.log("event", event);
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  //first, get all the books from the DB
  const params = {
    TableName: "dev-books",
  };
  let searchString = "";
  const books: any = await dynamoDb.scan(params).promise();
  try {
    if (typeof event === "string") {
      event = JSON.parse(event);
    }
    console.log("typeof event", typeof event);
    searchString = event.book;
  } catch (e) {
    console.log("error parsing event", e);
    searchString = event;
  }
  console.log("searchString", searchString);
  const reg = new RegExp(searchString, "i");
  const book = books.Items.filter((book: IBook) => book.title.match(reg))[0];
  const bookUrl = `${book.userId}/${book.key}`;
  const bookFromS3 = await getBookFromFileSystemOrS3(bookUrl);
  await writeMetadataToDB(book.userId, bookFromS3);
  return { book: { key: book.key }, event, reg, searchString };
});

export const parsePages = invokeHandler(async (event) => {
  console.log("event", event);

  let searchString = "";
  try {
    if (typeof event === "string") {
      event = JSON.parse(event);
    }
    console.log("typeof event", typeof event);
    searchString = event.book;
  } catch (e) {
    console.log("error parsing event", e);
    searchString = event;
  }
  const minPage = event.minPage || 0;
  const maxPage = event.maxPage;
  const chapterStrategy =
    event.strategy || "LookForChapterHeadingParserStrategy";
  let strategy: ChapterParsingStrategy | null;
  switch (chapterStrategy) {
    case "breaks":
      strategy = LookForMultipleLineBreaksParserStrategy({
        persistChapter: false,
      });
      break;
    case "native":
      strategy = NativeChapterParserStrategy({
        persistChapter: false,
      });
      break;
    case "heading":
    default:
      strategy = LookForChapterHeadingParserStrategy({
        persistChapter: false,
      });
      break;
  }

  console.log(
    "searchString",
    searchString,
    "minPage",
    minPage,
    "maxPage",
    maxPage
  );
  const book = await searchForBookByTitle(searchString);
  console.log("book", book);
  const documentContext = await DocumentFactory().createFromRawBook(book);
  console.log("documentContext", documentContext);
  const chapterParser = await createChapterParserContext(
    documentContext,
    strategy
  );
  console.log("chapterParser", chapterParser);
  const foundChapterPages = await chapterParser.numChapters(minPage, maxPage);
  return { book: { url: book.url }, foundChapterPages, event, searchString };
});

export const getBookDetails = invokeHandler(async (event) => {
  console.log("event", event);
  const bookId = event.bookId;
  const userId = event.requestContext.authorizer.claims.sub;

  console.log("bookId", bookId, "userId", userId);
  const book = await getBookById(bookId, userId);
  console.log("book", book);
  const bookJobs = await getBookJobs(bookId);
  const bookDetails: IBookDetails = {
    book,
    bookJobs,
  };
  return { bookDetails, event };
});
