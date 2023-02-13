import handler from "./libs/handler-lib";
import OpenAILib from "./libs/openai-lib";
import {APIGatewayProxyWithCognitoAuthorizerEvent} from "aws-lambda";
import {ISummarizeResult, ISummaryFormPayload, IUser} from "../types/summaraizeTypes";
import {getChapterTextByPayload} from "./libs/book-lib";
import {getUser} from "./libs/user-lib";
import {publishToSummaryQueue} from "./libs/sqs-lib";

const generateSummaries = async (payload: ISummaryFormPayload, user: IUser) => {
    const textToSummarize = await getChapterTextByPayload(payload, user.userId);
    console.log("textToSummarize", textToSummarize);
    const oai = OpenAILib({user});
    const summarizations: ISummarizeResult[] = await oai.summarize(payload, textToSummarize);
    console.log("summarizations", summarizations);
    return summarizations
}

export const publishSummaryJob = handler(async (event: APIGatewayProxyWithCognitoAuthorizerEvent) => {
    const userId = event.requestContext.authorizer.claims.sub;
    const user = await getUser(userId);
    console.log("queue url", process.env.QUEUE_URL);

    if (!user) {
        return JSON.stringify({
            statusCode: 400,
            body: {error: "Error getting user"}
        });
    }

    try {
        const payload: ISummaryFormPayload = JSON.parse(event.body as string);
        console.log("payload", payload);

        const jobStatus = await publishToSummaryQueue(payload, user);

        return JSON.stringify({
            statusCode: 200,
            body: jobStatus
        });
    } catch (e) {
        console.log("Error parsing summaryform payload", e);
        return JSON.stringify({
            statusCode: 400,
            body: {error: "Error parsing summary form payload"}
        })
    }
});
