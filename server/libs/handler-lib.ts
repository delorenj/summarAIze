import {
  APIGatewayProxyWithCognitoAuthorizerEvent,
  APIGatewayProxyWithCognitoAuthorizerHandler,
  Callback,
  Context,
} from "aws-lambda";

export default function handler(lambda: (event: APIGatewayProxyWithCognitoAuthorizerEvent) => Promise<{ body: { error: string }; statusCode: number } | { body: string; userId: string; statusCode: number }>) {
  return async function (event:APIGatewayProxyWithCognitoAuthorizerEvent, context:Context, callback: Callback) {
    let body, statusCode;

    try {
      // Run the Lambda
      body = await lambda(event);
      statusCode = 200;
    } catch (e: any) {
      body = { error: e.message };
      statusCode = 500;
    }

    // Return HTTP response
    return {
      statusCode,
      body: JSON.stringify(body),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
    };
  };
}
