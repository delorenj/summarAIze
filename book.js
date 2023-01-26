import * as AWS from "aws-sdk";
import handler from "./libs/handler-lib";
import { EPub } from 'epub2';

const fs = require("fs").promises;
const s3 = new AWS.S3();
const getDirName = require('path').dirname;

// a function to write the files to tmp on the lambda
const writeBookToTemp = async (book) => {
  console.log(`writing cached books to /tmp`, `/tmp/${book.url}`, book.fileContents.Body);
  await fs.mkdir(`/tmp/${getDirName(book.url)}`, {recursive: true});
  await fs.writeFile(`/tmp/${book.url}`, book.fileContents.Body);
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
      fileContents: object,
    };

  } catch (err) {
    console.log("Problem getting S3 object:", err);
  }
}

// set this defaulted to false, and set to true when files are cached to tmp
let filesCached = false;

export const parseBookMetadata = handler(async (event, context) => {
  // const userId = event.requestContext.authorizer.claims.sub;
  const body = JSON.parse(event.body);
  const bookUrl = body.bookUrl;
  let title = '';
  let c1 = '';
  let chapters = [];
  try {

    if (filesCached) {
      console.log(`files are cached - read from tmp on Lambda`);
      const bookFile = await readFileFromTemp(bookUrl);
      console.log("bookFile", bookFile.fileContents);
      let book = await EPub.createAsync(bookFile.fileContents);
      console.log('Read from tmp, and EPub created...');
      title = book.metadata.title;
      console.log(`got title: ${title}`);
      let chapters = [];
      book.flow.forEach(c => {
        chapters.push(c.id);
      });
      console.log(chapters);
      book.getChapter('main3', (e,c) => {
        c1 = c;
        console.log(c);
      });
      return {
        statusCode: 200,
        body: {title, c1, cached: true}
      };

    } else {
      console.log(
        `files are not cached - read from s3 bucket and cache in tmp`
      );
      const bookData = await readFileFromS3Bucket(bookUrl);
      await writeBookToTemp(bookData);

      filesCached = true; // set cached to true

      let book = await EPub.createAsync(bookData.fileContents.Body);
      console.log('Read from bucket, stored to tmp, and EPub created...');
      console.log("waited for ready", JSON.stringify(book.metadata));
      title = book.metadata.title;
      console.log(`got title: ${title}`);
      chapters = [];
      book.flow.forEach(c => {
        chapters.push(c.id);
      });
      console.log(chapters);
      book.getChapter('main3', (e,c) => {
        c1 = c;
        console.log(c);
      });
      return {
        statusCode: 200,
        body: {title, c1, cached: false}
      };
    }
  } catch
    (error) {
    return {
      body: "An error has occurred",
      statusCode: 500,
    };
  }
});

