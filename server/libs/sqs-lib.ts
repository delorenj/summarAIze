import * as AWS from "aws-sdk";
import {
  ISummaryFormPayload,
  ISummaryJobPayload,
  ISummaryJobStatus,
  IUser,
} from "../../types/summaraizeTypes";

const sqs = new AWS.SQS({
  apiVersion: "latest",
  region: "us-east-1",
});

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export enum JobStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

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

  const jobStatus: ISummaryJobStatus = {
    jobId: sqsResponse.MessageId as string,
    status: JobStatus.PENDING,
    userId: user.userId,
    payload,
    createdAt: new Date().toISOString(),
  };

  await dynamoDb
    .put({
      TableName: process.env.jobsTableName as string,
      Item: jobStatus,
    })
    .promise();

  return jobStatus;
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
