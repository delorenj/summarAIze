import {sqsHandler} from "./libs/handler-lib";
import {SQSEvent} from "aws-lambda";
import {getUser} from "./libs/user-lib";
import {ISummaryFormPayload, ISummarizeResult} from "../types/summaraizeTypes";
//import OpenAILib from "./libs/openai-lib";
import {getChapterTextByPayload} from "./libs/book-lib";
import {JobStatus, updateJobStatus} from "./libs/sqs-lib";
//import {createSummaryDocument} from "./libs/document-lib";

export const handler = sqsHandler(async (event: SQSEvent) => {
    console.log("event", event);

    try {
        const body = JSON.parse(event.Records[0].body);
        const payload: ISummaryFormPayload = body.payload;
        const userId: string = body.userId;
        const user = await getUser(userId);

        if (!user) {
            throw new Error("User not found");
        }

        const textToSummarize = await getChapterTextByPayload(payload, userId);
        console.log("textToSummarize", textToSummarize);
    console.log("SKIPPING OPENAI CALLS FOR NOW");
        //const oai = OpenAILib({user});
        //const summarizations: ISummarizeResult[] = await oai.summarize(payload, textToSummarize);
        //console.log("summarizations", summarizations);

        //const document = createSummaryDocument(summarizations, payload, userId);
        //uploadDocument(document, payload, userId);
        //console.log("document", document);
        //Update job status
        await updateJobStatus(event.Records[0].messageId, userId, JobStatus.COMPLETED);
    } catch (e) {
        console.log("Error parsing payload/userId from SQS message:", e);
        const body = JSON.parse(event.Records[0].body);
        const payload: ISummaryFormPayload = body.payload;
        const userId: string = body.userId;
        await updateJobStatus(event.Records[0].messageId, userId, JobStatus.FAILED);
        throw new Error("Error parsing payload/userId from SQS message");
    }
    return "OK";
});
