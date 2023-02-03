import * as AWS from "aws-sdk";
import handler from "./libs/handler-lib";
import {fileTypeFromBuffer} from 'file-type';
import {EPub} from 'epub2';
import pdf from 'pdf-parse';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const fs = require("fs").promises;
const s3 = new AWS.S3();
const getDirName = require('path').dirname;

// a function to write the files to tmp on the lambda
const writeBookToTemp = async (book) => {
  console.log(`writing cached books to /tmp`, `/tmp/${book.url}`, book.fileContents);
  await fs.mkdir(`/tmp/${getDirName(book.url)}`, {recursive: true});
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
async function readFileFromS3Bucket(url) {
  console.log('readFileFromS3Bucket', url);

  try {
    const object = await s3
      .getObject({
        Key: url,
        Bucket: 'summaraize-book'
      })
      .promise();

    console.log("Got object!");
    console.log("Returning: ", object);
    return {
      url: url,
      fileContents: object.Body,
      id: object.ETag
    };

  } catch (err) {
    console.log("Problem getting S3 object:", err);
  }
}

const getBookFromFileSystemOrS3 = async (url) => {
  // Always get the book from S3 for now
  // try {
  //     const book = await readFileFromTemp(url);
  //     console.log("Book read from /tmp");
  //     const metadata = await getBookMetadata(book);
  //     return {
  //         url,
  //         fileContents: book.fileContents,
  //         metadata
  //     };
  // } catch (err) {
  //     console.log("Problem getting book from /tmp:", err);
  const book = await readFileFromS3Bucket(url);
  const metadata = await getBookMetadata(book);
  await writeBookToTemp(book);
  return {
    url,
    fileContents: book.fileContents,
    metadata,
    id: book.id
  };
  // };
};

const isEpub = (fileType) => {
  return fileType && fileType.mime === "application/epub+zip";
};

const isPdf = (fileType) => {
  return fileType && fileType.mime === "application/pdf";
};

const numberOfWords = (text) => {
  return text.split(" ").length;
};

// This method is called by the client to get the book metadata
const getEpubMetadata = async (book) => {
  const epub = await EPub.createAsync(book.fileContents);
  const title = epub.metadata.title;
  const chapters = [];
  epub.flow.forEach((chapter) => {
    epub.getChapterRaw(chapter.id, (err, text) => {
      if (err) {
        console.log("Error getting chapter", err);
      } else {
        chapter.numberOfWords = numberOfWords(text);
      }
      chapters.push({
        id: chapter.id,
        title: chapter.title,
        numWords: numberOfWords(text),
        firstFewWords: text.split(" ").slice(0, 50).join(" ")
      });
    });
  });
  return {title, chapters};
};

const getPdfMetadata = async (book) => {
  const doc = await pdf(book.fileContents);
  const title = doc.info.Title || getTitleFromUrl(book.url) || "Untitled";
  const chapters = [{
    id: 1,
    title: 'main',
    numWords: numberOfWords(doc.text),
    firstFewWords: doc.text.split(" ").slice(0, 50).join(" ")
  }];
  const info = doc.info;
  const metadata = doc.metadata;
  console.log("PDF metadata", {title, chapters, info, metadata});
  return {
    title,
    chapters
  };
};

const getTitleFromUrl = (url) => {
  return url.split("/").pop().split(".")[0];
};

const getKeyFromUrl = (url) => {
  return url.split("/").pop();
};

const getGenericMetadata = (book) => {
  return {
    title: getTitleFromUrl(book.url),
    chapters: [{
      id: 1,
      title: 'main',
      numWords: numberOfWords(book.fileContents)
    }]
  };
};

//This method is called by the client to get the book metadata
const getBookMetadata = async (book) => {
  const fileType = await fileTypeFromBuffer(book.fileContents);
  let metadata = {};
  if (isEpub(fileType)) {
    metadata = await getEpubMetadata(book);
  } else if(isPdf(fileType)) {
    metadata = await getPdfMetadata(book);
  } else {
   //Generic metadata for other file types
   metadata = getGenericMetadata(book);
  }
  return {
    fileType: fileType,
    title: metadata.title,
    chapters: metadata.chapters
  };
};

export const writeMetadataToDB = async (userId, book) => {
  const params = {
    TableName: process.env.booksTableName,
    Item: {
      // The attributes of the item to be created
      userId: userId,
      bookId: book.id, // The book's s3 ETag
      format: book.metadata.fileType.ext,
      title: book.metadata.title,
      chapters: JSON.stringify(book.metadata.chapters),
      key: getKeyFromUrl(book.url),
      sizeInBytes: book.fileContents.length,
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

//This method is called by the client to get the book metadata
export const parseBookMetadata = handler(async (event, context) => {
  const userId = event.requestContext.authorizer.claims.sub;
  const body = JSON.parse(event.body);
  const bookUrl = body.bookUrl;

  const book = await getBookFromFileSystemOrS3(bookUrl);
  await writeMetadataToDB(userId, book);
  return {
    statusCode: 200,
    book: book
  };
});

export const onUpload = handler(async (event, context) => {
  const object = event.Records[0].s3.object;
  const key = object.key;
  const userId = key.split("/")[0];
  console.log("onUpload things", userId, key);
  const book = await getBookFromFileSystemOrS3(key);
  console.log("got book", book);
  await writeMetadataToDB(userId, book);
  return {
    statusCode: 200,
    book: book
  };
});

