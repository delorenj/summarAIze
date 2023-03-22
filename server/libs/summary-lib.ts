import * as AWS from "aws-sdk";
import {
  ISummarizeResult,
  ISummaryFormPayload,
  IChapterSummary,
} from "../../types/summaraizeTypes";
import { SQSEvent } from "aws-lambda";
import { GetItemInput } from "aws-sdk/clients/dynamodb";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const persistSummaries = async (
  summarizations: ISummarizeResult[],
  payload: ISummaryFormPayload,
  userId: string,
  event: SQSEvent
) => {
  const jobId = event.Records[0].messageId;
  const summaries: IChapterSummary[] = [];
  summarizations.forEach((summarization) => {
    const newSummary = {
      chapterIndex: summarization.summary.chapter.index,
      text: summarization.summary.text, // Fix the misspelling of 'summary'
    };
    summaries.push(newSummary);
  });

  const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
    TableName: process.env.jobsTableName as string,
    Key: {
      jobId,
      userId,
    },
    UpdateExpression: "set summaries = :summaries",
    ExpressionAttributeValues: {
      ":summaries": summaries,
    },
  };

  await dynamoDb.update(params).promise();
};

export const getSummaryJob = async (jobId: string, userId: string) => {
  if (!process.env.SUMMARY_JOB_TABLE) {
    throw new Error(
      "Summary job table name is not defined in environment variables."
    );
  }

  const params: GetItemInput = {
    TableName: process.env.SUMMARY_JOB_TABLE,
    Key: {
      jobId: { S: jobId },
      userId: { S: userId },
    },
  };

  try {
    const result = await dynamoDb.get(params).promise();
    return result.Item;
  } catch (error) {
    console.error("Error getting summary job from DynamoDB:", error);
    throw new Error("Error getting summary job");
  }
};
