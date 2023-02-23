import * as AWS from "aws-sdk";
import {
  ISummaryFormPayload,
  ISummaryJobPayload,
  ISummaryJobStatus,
  IUser,
  JobStatus,
} from "../../types/summaraizeTypes";

const sqs = new AWS.SQS({
  apiVersion: "latest",
  region: "us-east-1",
});

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const publishToSummaryQueue = async (
  payload: ISummaryFormPayload,
  user: IUser
): Promise<ISummaryJobStatus> => {
  const queueUrl = process.env.QUEUE_URL as string;

  const job: ISummaryJobPayload = {
    payload,
    userId: user.userId,
  };

  const params = {
    MessageBody: JSON.stringify(job),
    QueueUrl: queueUrl,
  };

  const sqsResponse = await sqs.sendMessage(params).promise();
  console.log("sqsResponse", sqsResponse);

  try {
    const jobStatus: ISummaryJobStatus = {
      jobId: sqsResponse.MessageId as string,
      status: JobStatus.PENDING,
      userId: user.userId,
      payload,
      createdAt: new Date().toISOString(),
    };
    console.log("jobStatus", jobStatus);

    const a = await dynamoDb
      .put({
        TableName: process.env.jobsTableName as string,
        Item: jobStatus,
      })
      .promise();

    const b = await dynamoDb
      .put({
        TableName: process.env.booksJobsTableName as string,
        Item: {
          bookId: payload.bookId,
          jobId: sqsResponse.MessageId,
        },
      })
      .promise();
    return jobStatus;
  } catch (e) {
    console.log("Error saving book job", e);
    throw e;
  }
};

export const updateJobStatus = async (
  jobId: string,
  userId: string,
  status: JobStatus
) => {
  const params = {
    TableName: process.env.jobsTableName as string,
    Key: {
      jobId,
      userId,
    },
    UpdateExpression: "set #status = :status",
    ExpressionAttributeNames: {
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":status": status,
    } as any,
  };
  await dynamoDb.update(params).promise();
};
