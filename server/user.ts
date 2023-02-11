import handler from "./libs/handler-lib";
import {APIGatewayProxyWithCognitoAuthorizerEvent} from "aws-lambda";
import { IBook} from "../types/summaraizeTypes";
import {getBooks, getOrCreateUser} from "./libs/user-lib";

export const getData = handler(async (event:APIGatewayProxyWithCognitoAuthorizerEvent) => {
    const userId = event.requestContext.authorizer.claims.sub;
    console.log("user id", userId);
    console.log("event.requestContext", JSON.stringify(event.requestContext));
    const stage = event.requestContext.stage;
    const tableNameBook = `${stage}-books`;
    const tableNameUser = `${stage}-users`;
    console.log("table names", tableNameBook, tableNameUser);
    const user = await getOrCreateUser(userId, tableNameUser);
    console.log("got user", user);
    const books : IBook[] = await getBooks(userId, tableNameBook);
    return JSON.stringify({
        user,
        books
    });
});
