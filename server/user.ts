import handler from "./libs/handler-lib";
import {APIGatewayProxyWithCognitoAuthorizerEvent} from "aws-lambda";
import { IBook, IBookRow, ISummaryJobStatus} from "../types/summaraizeTypes";
import {getBooks, getJobs, getOrCreateUser} from "./libs/user-lib";

export const getData = handler(async (event:APIGatewayProxyWithCognitoAuthorizerEvent) => {
    const userId = event.requestContext.authorizer.claims.sub;
    console.log("user id", userId);
    const user = await getOrCreateUser(userId);
    const books : IBookRow[] = await getBooks(userId);
    const jobs : ISummaryJobStatus[] = await getJobs(userId);
    return JSON.stringify({
        user,
        books,
        jobs
    });
});
