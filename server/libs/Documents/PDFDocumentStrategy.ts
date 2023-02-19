import {IBookMetadata, IChapter, IRawBook} from '../../../types/summaraizeTypes';
import {DocumentStrategy} from './DocumentStrategy';
import pdfParse from 'pdf-parse';
import {getTitleFromUrl} from "../book-lib";
import striptags from "striptags";

const PDFDocumentStrategy = (params: { book: IRawBook }): DocumentStrategy => {
    const {book} = params;
    const pdf = async (): Promise<any> => {
        return await pdfParse(book.fileContents);
    }
    const wordCount = async (): Promise<number> => {
        const allWords = await getAllText();
        return allWords.split(" ").length;
    }

    const getAllText = async (): Promise<string> => {
        const doc = await pdf();
        return striptags(doc.text);
    }

    const parseMetadata = async (): Promise<IBookMetadata> => {
        const doc = await pdf();
        console.log("Got PDF doc");
        const title = doc.info.Title || getTitleFromUrl(book.url) || "Untitled";
        const chapters:IChapter[] = [];
        return {
            title,
            numWords: await wordCount(),
            chapters,
            fileType: {
                ext: "pdf",
                mime: "application/pdf"
            }
        };
    };

    return {parseMetadata, getAllText, book};
};

export default PDFDocumentStrategy;
