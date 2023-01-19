import AWS from "aws-sdk";
import handler from "./libs/handler-lib";

const dynamo = new AWS.DynamoDB.DocumentClient();

export const getUserData = handler(async (event, context) => {
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

  try {
    const result = await dynamo.query(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(result.Items)
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message
      })
    };
  }
});
