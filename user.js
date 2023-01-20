import AWS from "aws-sdk";
import handler from "./libs/handler-lib";

const dynamo = new AWS.DynamoDB.DocumentClient();

export const getData = handler(async (event, context) => {
  const userId = event.requestContext.identity.cognitoIdentityId;

  const stage = process.env.STAGE;
  const tableName = `${stage}-books`;

  const params = {
    TableName: tableName,
    FilterExpression: "(userId = :userId OR userId = :public)",
    ExpressionAttributeValues: {
      ":userId": userId,
      ":public": "public"
    }
  };

  return dynamo.query(params).promise();

});
