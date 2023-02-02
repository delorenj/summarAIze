import AWS from "aws-sdk";
  import handler from "./libs/handler-lib";

const dynamo = new AWS.DynamoDB.DocumentClient();

export const getData = handler(async (event, context) => {
  const userId = event.requestContext.authorizer.claims.sub;
  console.log("userId", userId);
  const stage = event.requestContext.stage;
  const tableName = `${stage}-books`;

  const publicBooksQuery = {
    TableName: tableName,
    KeyConditionExpression: "userId = :publicUser",
    ExpressionAttributeValues: {
      ":publicUser": "public"
    }
  };

  const myBooksQuery = {
    TableName: tableName,
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": userId
    }
  };
  console.log("defined both queries");
  const publicBooks = await dynamo.query(publicBooksQuery).promise();
  const myBooks = await dynamo.query(myBooksQuery).promise();
  console.log("myBooksQuery", myBooksQuery);
  console.log("myBooks", myBooks);
  console.log("about to return", [...publicBooks.Items, ...myBooks.Items]);
  return {
    books: [...publicBooks.Items, ...myBooks.Items]
  };
});
