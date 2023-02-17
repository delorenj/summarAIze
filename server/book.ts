import handler, {invokeHandler, s3handler} from "./libs/handler-lib";
import {getBookFromFileSystemOrS3, writeMetadataToDB} from "./libs/book-lib";
import {APIGatewayProxyWithCognitoAuthorizerEvent, S3CreateEvent} from "aws-lambda";
import * as AWS from "aws-sdk";
import {IBook, IRawBook} from "../types/summaraizeTypes";

export interface IParseBookMetadataPayload {
    bookUrl: string;
}

//This method is called by the client to get the book metadata
export const parseBookMetadata = handler(async (event: APIGatewayProxyWithCognitoAuthorizerEvent) => {
    const userId = event.requestContext.authorizer.claims.sub;
    const body: IParseBookMetadataPayload = JSON.parse(event.body as string);
    const bookUrl = body.bookUrl;

    const book: IRawBook = await getBookFromFileSystemOrS3(bookUrl);
    await writeMetadataToDB(userId, book);
    return JSON.stringify({
        book
    });
});

export const onUpload = s3handler(async (event: S3CreateEvent) => {
    const object = event.Records[0].s3.object;
    const key = object.key;
    if(key.indexOf('/chapters/') > -1) {
        return "not a book";
    }
    const userId = key.split("/")[0];
    console.log("onUpload things", userId, key);
    const book = await getBookFromFileSystemOrS3(key);
    console.log("got book", book);
    await writeMetadataToDB(userId, book);
    return JSON.stringify({
        book
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
    return {books: books.Items.map((book: IBook) => book.key) };
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
    console.log("books", books, "reg", reg, "searchString", searchString, event);
    const book = books.Items.filter((book: IBook) => book.title.match(reg))[0];
    console.log("book", book);
    const bookUrl = `${book.userId}/${book.key}`;
    const bookFromS3 = await getBookFromFileSystemOrS3(bookUrl);
    await writeMetadataToDB(book.userId, bookFromS3);
    return {book: {'key': book.key}, event, reg, searchString};
});
