import * as AWS from "aws-sdk";
import handler from "./libs/handler-lib";
import {fileTypeFromBuffer} from 'file-type';

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
async function readFileFromTemp(url) {
  const file = await fs.readFile(`/tmp/${url}`);
  console.log("readFileFromTemp", url, file);
  return {
    url: url,
    fileContents: file,
  };
}

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
    };

  } catch (err) {
    console.log("Problem getting S3 object:", err);
  }
}

const getBookFromFileSystemOrS3 = async (url) => {
  try {
    const book = await readFileFromTemp(url);
    console.log("Book read from /tmp");
    const metadata = await getBookMetadata(book);
    return {
      url,
      fileContents: book.fileContents,
      metadata
    };
  } catch (err) {
    console.log("Problem getting book from /tmp:", err);
    const book = await readFileFromS3Bucket(url);
    const metadata = await getBookMetadata(book);
    await writeBookToTemp(book);
    return {
      url,
      fileContents: book.fileContents,
      metadata
    };
  }
};

//This method is called by the client to get the book metadata
const getBookMetadata = async (book) => {
  const fileType = await fileTypeFromBuffer(book.fileContents);
  return {
    fileType: fileType
  };
};

export const parseBookMetadata = handler(async (event, context) => {
  // const userId = event.requestContext.authorizer.claims.sub;
  const body = JSON.parse(event.body);
  const bookUrl = body.bookUrl;

  const book = await getBookFromFileSystemOrS3(bookUrl);
  return {
    statusCode: 200,
    book: book
  };
});

