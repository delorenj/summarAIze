import * as AWS from "aws-sdk";
import Handlebars from "handlebars";
import PDFDocument from "pdfkit";
import {ISummarizeResult, ISummaryFormPayload, IUser} from "../../types/summaraizeTypes";
import {getBookRow, stripNewlinesAndCollapseSpaces} from "./book-lib";
import openaiLib from "./openai-lib";
import {getUser} from "./user-lib";

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

const titleOptions = {
    align: 'center',
}
const titleFont = 'Helvetica-Bold';
const titleSize = 20;
const options = {
    format: 'A4',
    orientation: 'portrait',
    border: '20mm',
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
            summaryTitle:
                summarization.summary.chapter.chapterTitle ||
                summarization.summary.chapter.chapterId as string ||
                summarization.summary.chapter.index as unknown as string,
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

    const doc = new PDFDocument();

    doc.font(titleFont).fontSize(titleSize).text(bookRow.title, titleOptions);
    doc.moveDown(1);
    doc.font('Helvetica-Oblique').fontSize(12).text(description, {align: 'justify'});
    doc.moveDown(2);
    htmlData.summaries.forEach((summary) => {
        doc.font('Helvetica-Bold').fontSize(14).text('Summary of ' + summary.summaryTitle, {align: 'center'});
        doc.moveDown(1);
        doc.font('Helvetica').fontSize(12).text(stripNewlinesAndCollapseSpaces(summary.summaryText), {align: 'justify'});
        doc.moveDown(1);
    });
    const pdfBytes = await new Promise((resolve) => {
        const chunks: any = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.end();
    });
    await uploadBlobStreamToS3(pdfBytes, userId, payload.bookId);
}

export const uploadBlobStreamToS3 = async (buffer: any, userId: string, bookId: string) => {

    const params = {
        Bucket: "summaraize-book",
        Key: `${userId}/summaries/${bookId}.pdf`,
        Body: buffer,
        ContentType: "application/pdf",
    };
    console.log("params", params);
    const result = await s3.upload(params).promise();
    console.log("result", result);
    return result;
}
