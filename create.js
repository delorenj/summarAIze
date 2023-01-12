import * as uuid from "uuid";
import AWS from "aws-sdk";
import handler from "./libs/handler-lib";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const main = handler(async (event, context) => {
  // Request body is passed in as a JSON encoded string in 'event.body'
  const data = JSON.parse(event.body);
  console.log("Birds", event.requestContext.identity.cognitoIdentityId);
  const params = {
    TableName: process.env.booksTableName,
    Item: {
      // The attributes of the item to be created
      userId: event.requestContext.identity.cognitoIdentityId, // The id of the author
      bookId: uuid.v1(), // A unique uuid
      content: data.content, // Parsed from request body
      attachment: data.attachment, // Parsed from request body
      createdAt: Date.now(), // Current Unix timestamp
    },
  };

    await dynamoDb.put(params).promise();

    return {
      result: JSON.stringify(params.Item),
    };
});
