import * as AWS from "aws-sdk";
import fs from "fs";
import pdf from "pdf-creator-node";
import { ISummarizeResult, ISummaryFormPayload } from "../../types/summaraizeTypes";

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

const html = fs.readFileSync('summary-template.html', 'utf8');

const options = {
    format: 'A4',
    orientation: 'portrait',
    border: '10mm',
};

interface ISummarySection {
    summaryTitle: string,
    summaryText: string,
}

const data = {
    title: 'My Document',
    description: 'This is a document about something',
    summaries: [
        {
            summaryTitle: 'Summary 1',
            summaryText: 'This is a summary of something',
        },
        {
            summaryTitle: 'Summary 2',
            summaryText: 'This is another summary of something',
        },
    ],
};

interface ISummaryTemplate {
    title: string,
    description: string,
    summaries: ISummarySection[],
}
export const createSummaryDocument = (summarizations: ISummarizeResult[], payload: ISummaryFormPayload, userId: string) => {
    const document: ISummaryTemplate = {
        title: getTitleFromPayload(payload),
        description: getDescriptionFromPayload(payload),
        summaries: getSummariesFromSummarizations(summarizations),
    };

    const pdfDocument = pdf.create(html, options);
    pdfDocument.generate(data, (err, result) => {
        if (err) {
            console.error(err);
        } else {
            fs.writeFileSync('output.pdf', result);
        }
    });

    return document;
}
