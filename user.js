import AWS from "aws-sdk";
import handler from "./libs/handler-lib";

const dynamo = new AWS.DynamoDB.DocumentClient();

const getOrCreateUser = async (userId, userTable) => {
  const params = {
    TableName: userTable,
    Key: {
      userId: userId
    }
  };
  const user = await dynamo.get(params).promise();
  console.log("user", user);
  if (!user.Item) {
    console.log("creating user", userId, "in table", userTable, "");
    const params = {
      TableName: userTable,
      Item: {
        userId: userId,
        admin: false
      }
    };
    await dynamo.put(params).promise();
    console.log("created user", userId, "in table", userTable, "");
    return params.Item;
  }
  console.log("user", userId, "already exists in table", userTable, "");
  return user.Item;
};

export const getData = handler(async (event, context) => {
  const userId = event.requestContext.authorizer.claims.sub;
  console.log("userId", userId);
  console.log("event.requestContext", JSON.stringify(event.requestContext));
  const stage = event.requestContext.stage;
  const tableNameBook = `${stage}-books`;
  const tableNameUser = `${stage}-users`;
  const user = await getOrCreateUser(userId, tableNameUser);

  const publicBooksQuery = {
    TableName: tableNameBook,
    KeyConditionExpression: "userId = :publicUser",
    ExpressionAttributeValues: {
      ":publicUser": "public"
    },
  };

  const myBooksQuery = {
    TableName: tableNameBook,
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": userId
    },
  };
  console.log("defined both queries");
  const publicBooks = await dynamo.query(publicBooksQuery).promise();
  const myBooks = await dynamo.query(myBooksQuery).promise();
  console.log("myBooksQuery", myBooksQuery);
  console.log("myBooks", myBooks);
  console.log("about to return", [...publicBooks.Items, ...myBooks.Items]);
  return {
    user,
    books: [...publicBooks.Items, ...myBooks.Items]
  };
});
