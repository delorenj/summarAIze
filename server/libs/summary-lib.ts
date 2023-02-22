import * as AWS from "aws-sdk";
import {ISummarizeResult, ISummaryFormPayload, IUser} from "../../types/summaraizeTypes";
import {SQSEvent} from "aws-lambda";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const persistSummaries = async (summarizations: ISummarizeResult[], payload: ISummaryFormPayload, userId: string, event: SQSEvent) => {
    const jobId = event.Records[0].messageId;
    //const summaries = summarizations.reduce((acc, obj) => ({ ...acc, [obj.summary.chapter.index]: obj }), {});
    const summaries = {
        userId: userId,
        bookId: payload.bookId,
        summaries: {}
    };
    console.log('summaries', summaries);
    summarizations.forEach((summarization) => {
        summaries['summaries'] = {
            ...summaries['summaries'],
            [summarization.summary.chapter.index]: summarization.summary.text
        }
    });
    console.log('summaries', summaries);

    const params : AWS.DynamoDB.DocumentClient.UpdateItemInput = {
        TableName: process.env.jobsTableName as string,
        Key: {
            jobId,
            userId
        },
        UpdateExpression: "set summaries = :summaries",
        ExpressionAttributeValues: {
            ":summaries": summaries,
        }
    };

    console.log('params', params);
    await dynamoDb.update(params).promise();
}
