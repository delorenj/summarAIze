import AWS from "aws-sdk";
import {IBook, IBookRow, ISummaryJobStatus, IUser} from "../../types/summaraizeTypes";
import {APIGatewayEventRequestContextWithAuthorizer, APIGatewayProxyCognitoAuthorizer,} from "aws-lambda";
import {QueryInput} from "aws-sdk/clients/dynamodb";

const dynamo = new AWS.DynamoDB.DocumentClient();

export const ensureAdmin = async (context: APIGatewayEventRequestContextWithAuthorizer<APIGatewayProxyCognitoAuthorizer>) => {
    const userId = context.authorizer.claims.sub;
    const stage = context.stage;
    const user = await getUser(userId);
    if (!user?.isAdmin) {
        throw new Error("User is not an admin");
    }
};
export const getBooks = async (userId: string): Promise<IBookRow[]> => {
    const publicBooksQuery: QueryInput = {
        TableName: process.env.booksTableName as string,
        KeyConditionExpression: "userId = :publicUser",
        ExpressionAttributeValues: {
            ":publicUser": "public"
        } as any,
    };

    const myBooksQuery: QueryInput = {
        TableName: process.env.booksTableName as string,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
            ":userId": userId
        } as any,
    };
    console.log("defined both queries");

    try {
      const publicBooks = await dynamo.query(publicBooksQuery).promise();
      const myBooks = await dynamo.query(myBooksQuery).promise();
      await Promise.all([publicBooks, myBooks]).catch((e) => {
        console.log("tom error", e);
        throw new Error("Error getting books");
      });

      const combinedBooks = [...publicBooks.Items as IBookRow[], ...myBooks.Items as IBookRow[]];
      console.log("about to return", combinedBooks);

      return combinedBooks;
    } catch (e) {
        console.log("jote error", e);
        throw new Error("Error getting books");
    }
};

export const getJobs = async (userId: string): Promise<ISummaryJobStatus[]> => {
    const params = {
        TableName: process.env.jobsTableName as string,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
            ":userId": userId,
        } as any,
    };
    console.log("params", params);
    try {
        const jobs = await dynamo.query(params).promise();
        return jobs.Items as ISummaryJobStatus[];
    } catch (e) {
        console.log("error", e);
        throw new Error("Error getting jobs");
    }
}

export const getUser = async (userId: string): Promise<IUser | null> => {
    const params = {
        TableName: process.env.usersTableName as string,
        Key: {
            userId
        }
    };
    const user = await dynamo.get(params).promise();
    if (!user.Item) {
        console.log("user", userId, "does not exist in table", process.env.usersTableName, "");
        return null;
    }
    return user.Item as IUser;
};

export const getOrCreateUser = async (userId: string): Promise<IUser> => {
    const params = {
        TableName: process.env.usersTableName as string,
        Key: {
            userId
        }
    };
    const user = await dynamo.get(params).promise();
    console.log("user", user);
    if (!user.Item) {
        console.log("creating user", userId);
        const params = {
            TableName: process.env.usersTableName as string,
            Item: {
                userId,
                admin: false
            }
        };
        await dynamo.put(params).promise();
        console.log("created user", userId);
        return params.Item as IUser;
    }
    console.log("user", userId, "already exists in table");
    return user.Item as IUser;
};
