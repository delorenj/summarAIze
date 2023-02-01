const AWS = require('aws-sdk');
import handler from "./libs/handler-lib";
require('dotenv').config();
AWS.config.update({region: 'us-east-1'});
const s3 = new AWS.S3();

// Change this value to adjust the signed URL's expiration
const URL_EXPIRATION_SECONDS = 300;

export const getUploadUrl = handler(async (event, context) => {
  const userId = event.requestContext.authorizer.claims.sub;
  const querystring = event.queryStringParameters;
  const fileName = querystring.fn;
  const fileType = querystring.ft;
  console.log("Query Params:", fileName, fileType);
  const Key = `${userId}/${fileName}`;
  console.log("Upload Key:", Key);
  const ContentType = fileType;

  // Get signed URL from S3
  const s3Params = {
    Bucket: 'summaraize-book',
    Key,
    Expires: URL_EXPIRATION_SECONDS,
    ContentType,
    // ACL: 'public-read'
  };

  console.log('Params: ', s3Params);
  const uploadURL = await s3.getSignedUrlPromise('putObject', s3Params);
  console.log('Upload URL: ', uploadURL);
  return {
    uploadURL,
    Key
  };
});
