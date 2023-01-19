const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

module.exports.getData = async (event) => {
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
}
