import * as AWS from "aws-sdk";
import {v4 as uuid} from "uuid";
import handler from "./libs/handler-lib";

const fs = require("fs").promises;
const s3 = new AWS.S3();

// a function to write the files to tmp on the lambda
const writeBookToTemp = async (book) => {
  console.log(`writing cached books to /tmp`);

  await fs.writeFile(`/tmp/${book.url}`, book.file);
  console.log("Book written to /tmp");
};

// a function to read the cached files from tmp
async function readFileFromTemp(url) {
  const file = await fs.readFile(`/tmp/${url}`);

  return {
    url: url,
    file: Buffer.from(file).toString(),
  };
}

// a function to pull the files from an s3 bucket before caching them locally
async function readFileFromS3Bucket(url) {
  console.log('readFileFromS3Bucket', url);

  try {
    const object = await s3
      .getObject({Key: url, Bucket: 'summaraize-book'})
      .promise();

    console.log("Got object!");
    console.log("Returning: ", object.Body?.toString("base64"));
    return {
      url: url,
      file: object.Body?.toString("base64"),
    };

  } catch (err) {
    console.log("Problem getting S3 object:", err);
  }
}

// set this defaulted to false, and set to true when files are cached to tmp
let filesCached = false;

export const parseBookMetadata = handler(async (event, context) => {
  const userId = event.requestContext.authorizer.claims.sub;
  const body = JSON.parse(event.body);
  const bookUrl = body.bookUrl;

  try {
    const correlationId = uuid();
    const method = "book.parseBookMetadata";
    const prefix = `${correlationId} - ${method}`;

    console.log(`${prefix} - started`);

    if (filesCached) {
      console.log(`${prefix} files are cached - read from tmp on Lambda`);

      const bookFile = await readFileFromTemp(bookUrl);
      console.log("bookFile", bookFile);

    } else {
      console.log(
        `${prefix} files are not cached - read from s3 bucket and cache in tmp`
      );
      const bookFile = await readFileFromS3Bucket(bookUrl);
      await writeBookToTemp({
        url: bookUrl,
        file: bookFile
      });

      filesCached = true; // set cached to true

      return {
        body: {
          userId: userId,
          bookFile: bookFile[0]
        },
        statusCode: 200,
      };
    }
  } catch (error) {
    return {
      body: "An error has occurred",
      statusCode: 500,
    };
  }
});

