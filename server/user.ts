import handler from "./libs/handler-lib";
import { APIGatewayProxyWithCognitoAuthorizerEvent } from "aws-lambda";
import { IBook, ISummaryJobStatus } from "../types/summaraizeTypes";
import {
  getBooks,
  getJobs as getJobsLib,
  getOrCreateUser,
} from "./libs/user-lib";

export const getData = handler(
  async (event: APIGatewayProxyWithCognitoAuthorizerEvent) => {
    const userId = event.requestContext.authorizer.claims.sub;
    console.log("user id", userId);
    const user = await getOrCreateUser(userId);
    const books: IBook[] = await getBooks(userId);
    const jobs: ISummaryJobStatus[] = await getJobsLib(userId);
    console.log("jobs", jobs);
    return JSON.stringify({
      user,
      books,
      jobs,
    });
  }
);

export const getJobs = handler(
  async (event: APIGatewayProxyWithCognitoAuthorizerEvent) => {
    const userId = event.requestContext.authorizer.claims.sub;
    const jobs: ISummaryJobStatus[] = await getJobsLib(userId);
    return JSON.stringify(jobs);
  }
);
