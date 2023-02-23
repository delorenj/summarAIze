import { sqsHandler } from "./libs/handler-lib";
import { SQSEvent } from "aws-lambda";
import { getUser } from "./libs/user-lib";
import {
  ISummarizeResult,
  ISummaryFormPayload,
  JobStatus,
} from "../types/summaraizeTypes";
import OpenAILib from "./libs/openai-lib";
import { getChapterTextByPayload } from "./libs/book-lib";
import { updateJobStatus } from "./libs/sqs-lib";
import { persistSummaries } from "./libs/summary-lib";

export const handler = sqsHandler(async (event: SQSEvent) => {
  console.log("event", event);

  try {
    console.log("event.Records[0].body", event.Records[0].body);
    const body = JSON.parse(event.Records[0].body);
    console.log("body", body);
    const payload: ISummaryFormPayload = body.payload;
    console.log("payload", payload);
    const userId: string = body.userId;
    console.log("userId", userId);
    const user = await getUser(userId);
    console.log("user", user);

    if (!user) {
      throw new Error("User not found");
    }

    const textToSummarize = await getChapterTextByPayload(payload, userId);
    console.log("textToSummarize", textToSummarize);
    const oai = OpenAILib({ user, mock: true });
    const summarizations: ISummarizeResult[] = await oai.summarize(
      payload,
      textToSummarize
    );
    console.log("summarizations", summarizations);
    // const document = await createSummaryDocument(summarizations, payload, userId);
    await persistSummaries(summarizations, payload, userId, event);
    //uploadDocument(document, payload, userId);
    //console.log("document", document);
    //Update job status
    await updateJobStatus(
      event.Records[0].messageId,
      userId,
      JobStatus.COMPLETED
    );
  } catch (e) {
    console.log("Error parsing payload/userId from SQS message:", e);
    const body = JSON.parse(event.Records[0].body);
    console.log("body", body);
    const payload: ISummaryFormPayload = body.payload;
    console.log("payload", payload);
    const userId: string = body.userId;
    console.log("userId", userId);
    await updateJobStatus(event.Records[0].messageId, userId, JobStatus.FAILED);
    throw new Error("Error parsing payload/userId from SQS message");
  }
  return "OK";
});
