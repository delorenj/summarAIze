import {
  APIGatewayProxyWithCognitoAuthorizerEvent,
  APIGatewayProxyWithCognitoAuthorizerHandler,
  Callback,
  Context, S3CreateEvent,
} from "aws-lambda";

export default function handler(lambda: (event: APIGatewayProxyWithCognitoAuthorizerEvent) =>
    Promise<string>) {
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
      body,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
    };
  };
}

export function s3handler(lambda: (event: S3CreateEvent) =>
    Promise<string>) {
  return async function (event:S3CreateEvent) {
    let body, statusCode;

    try {
      // Run the Lambda
      await lambda(event);
      body = "Success";
      statusCode = 200;
    } catch (e: any) {
      body = { error: e.message };
      statusCode = 500;
    }

    // Return HTTP response
    return {
      body,
      statusCode
    };
  };
}

export function invokeHandler(lambda: () => Promise<string>) {
  return async function () {
    let body, statusCode;

    try {
      // Run the Lambda
      await lambda();
      body = "Success";
      statusCode = 200;
    } catch (e: any) {
      body = { error: e.message };
      statusCode = 500;
    }

    // Return HTTP response
    return {
      body,
      statusCode
    };
  };
}
