import * as AWS from "aws-sdk";
import fs from "fs";
import pdf from "pdf-creator-node";
import { ISummarizeResult, ISummaryFormPayload, IUser } from "../../types/summaraizeTypes";
import {getBookRow} from "./book-lib";
import openaiLib from "./openai-lib";
import {getUser} from "./user-lib";

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

const html = fs.readFileSync('templates/summary-template.html', 'utf8');

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

const getDescriptionFromPayload = async (payload: ISummaryFormPayload, user: IUser) : Promise<string> => {
    return await openaiLib({user}).generateDescriptionByPayload(payload);
};

const getSummariesFromSummarizations = (summarizations: ISummarizeResult[]) : ISummarySection[] => {
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
        path: "./output.pdf",
        type: "",
    };

    return await pdf.create(document, options);
}
