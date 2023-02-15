import * as AWS from "aws-sdk";
import PDFDocument from "pdfkit";
import {ISummarizeResult, ISummaryFormPayload, IUser} from "../../types/summaraizeTypes";
import {getBookRow} from "./book-lib";
import openaiLib from "./openai-lib";
import {getUser} from "./user-lib";
import blobStream from "blob-stream";

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

const html = "<!DOCTYPE html><html><head><meta charset=\"UTF-8\" /><title>{{title}}</title></head><body><h1>{{title}}</h1><p>{{description}}</p><ul>{{#each summaries}}<li><h2>{{summaryTitle}}</h2><p>{{summaryText}}</p></li>{{/each}}</ul></body></html>";

const options = {
    format: 'A4',
    orientation: 'portrait',
    border: '10mm',
};

interface ISummarySection {
    summaryTitle: string,
    summaryText: string,
}

interface ISummaryTemplate {
    title: string,
    description: string,
    summaries: ISummarySection[],
}

const getDescriptionFromPayload = async (payload: ISummaryFormPayload, user: IUser): Promise<string> => {
    const oai = openaiLib({user, mock: true});
    return await oai.generateDescriptionByPayload(payload);
};

const getSummariesFromSummarizations = (summarizations: ISummarizeResult[]): ISummarySection[] => {
    return summarizations.map((summarization) => {
        return {
            summaryTitle: summarization.summary.chapter.title as string,
            summaryText: summarization.summary.text,
        }
    });
};

export const createSummaryDocument = async (summarizations: ISummarizeResult[], payload: ISummaryFormPayload, userId: string) => {
    const bookRow = await getBookRow(payload.bookId, userId);
    const user = await getUser(userId);
    const description = await getDescriptionFromPayload(payload, user as IUser);
    const htmlData: ISummaryTemplate = {
        title: bookRow.title,
        description,
        summaries: getSummariesFromSummarizations(summarizations)
    };

    const document = {
        html,
        data: htmlData,
        type: "buffer",
    };

    console.log("document", document);
    const doc = new PDFDocument();
    const stream = doc.pipe(blobStream());
    doc.text("Hello World");
    doc.end();
    await uploadBlobStreamToS3(stream, userId, payload.bookId);
}

export const uploadBlobStreamToS3 = async (stream: any, userId: string, bookId: string) => {
    stream.on('finish', async function () {
        // get a blob you can do whatever you like with
        const blob = stream.toBlob('application/pdf');
        console.log("blob", blob);
        const params = {
            Bucket: "summaraize-book",
            Key: `${userId}/summaries/${bookId}.pdf`,
            Body: blob,
            ContentType: "application/pdf",
        };
        console.log("params", params);
        const result = await s3.upload(params).promise();
        console.log("result", result);

        // or get a blob URL for display in the browser
        const url = stream.toBlobURL('application/pdf');
        console.log("url", url);
        return result;
    });
}
