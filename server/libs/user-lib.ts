import AWS from "aws-sdk";
import {IBook, IUser} from "../../types/summaraizeTypes";
import {APIGatewayEventRequestContextWithAuthorizer, APIGatewayProxyCognitoAuthorizer,} from "aws-lambda";
import {QueryInput} from "aws-sdk/clients/dynamodb";

const dynamo = new AWS.DynamoDB.DocumentClient();

export const ensureAdmin = async (context: APIGatewayEventRequestContextWithAuthorizer<APIGatewayProxyCognitoAuthorizer>) => {
    const userId = context.authorizer.claims.sub;
    const stage = context.stage;
    const user = await getUser(userId, `${stage}-users`);
    if (!user?.isAdmin) {
        throw new Error("User is not an admin");
    }
};
export const getBooks = async (userId: string, bookTable: string): Promise<IBook[]> => {
    const publicBooksQuery: QueryInput = {
        TableName: bookTable,
        KeyConditionExpression: "userId = :publicUser",
        ExpressionAttributeValues: {
            ":publicUser": {S: "public"}
        },
    };

    const myBooksQuery: QueryInput = {
        TableName: bookTable,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
            ":userId": {S: userId}
        },
    };
    console.log("defined both queries");

    try {
      const publicBooks = await dynamo.query(publicBooksQuery).promise();
      const myBooks = await dynamo.query(myBooksQuery).promise();
      await Promise.all([publicBooks, myBooks]).catch((e) => {
        console.log("error", e);
        throw new Error("Error getting books");
      });

      const combinedBooks = [...publicBooks.Items as IBook[], ...myBooks.Items as IBook[]];
      console.log("about to return", combinedBooks);

      return combinedBooks;
    } catch (e) {
        console.log("error", e);
        throw new Error("Error getting books");
    }
};

export const getUser = async (userId: string, userTable: string): Promise<IUser | null> => {
    const params = {
        TableName: userTable,
        Key: {
            userId
        }
    };
    const user = await dynamo.get(params).promise();
    if (!user.Item) {
        console.log("user", userId, "does not exist in table", userTable, "");
        return null;
    }
    return user.Item as IUser;
};

export const getOrCreateUser = async (userId: string, userTable: string): Promise<IUser> => {
    const params = {
        TableName: userTable,
        Key: {
            userId
        }
    };
    console.log("getting user", userId, "from table", userTable, "");
    const user = await dynamo.get(params).promise();
    console.log("user", user);
    if (!user.Item) {
        console.log("creating user", userId, "in table", userTable, "");
        const params = {
            TableName: userTable,
            Item: {
                userId,
                admin: false
            }
        };
        await dynamo.put(params).promise();
        console.log("created user", userId, "in table", userTable, "");
        return params.Item as IUser;
    }
    console.log("user", userId, "already exists in table", userTable, "");
    return user.Item as IUser;
};
