import {IBookMetadata, IChapter, IRawBook} from '../../../types/summaraizeTypes';
import {DocumentStrategy} from './DocumentStrategy';
import pdfParse from 'fork-pdf-parse-with-pagepertext';
import fullPdfParse from 'pdf-parse';
import {findChapterBreaks, getTitleFromUrl, numberOfWords, stripNewlinesAndCollapseSpaces} from "../book-lib";
import striptags from "striptags";

const PDFDocumentStrategy = (params: { book: IRawBook }): DocumentStrategy => {
    const {book} = params;
    const pdf = async (): Promise<any> => {
        return await pdfParse(book.fileContents);
    }
    const fullPdf = async (): Promise<any> => {
        return await fullPdfParse(book.fileContents);
    }
    const getPage = async (pageNumber: number): Promise<string> => {
        const doc = await pdf();
        const numPages = doc.textPerPage.length;
        if (pageNumber >= numPages) {
            throw new Error("Page number is out of range");
        }
        return doc.textPerPage[pageNumber - 1];
    };

    const pageCount = async (): Promise<number> => {
        const doc = await pdf();
        return doc.textPerPage.length + 1;
    };

    const getAllText = async (): Promise<string> => {
        const doc = await fullPdf();
        return striptags(doc.text);
    }

    const parseMetadata = async (): Promise<IBookMetadata> => {
        const doc = await pdf();
        console.log("Got PDF doc");
        const fullDoc = await fullPdf();
        console.log("Got full PDF doc");
        const title = doc.info.Title || getTitleFromUrl(book.url) || "Untitled";
        const chapters = findChapterBreaks(doc, fullDoc);
        const info = doc.info;
        const metadata = doc.metadata;
        console.log("PDF metadata", {title, chapters, info, metadata});
        console.log("chapters", chapters);
        return {
            title,
            numWords: numberOfWords(fullDoc.text),
            chapters,
            fileType: {
                ext: "pdf",
                mime: "application/pdf"
            }
        };
    };

    return {getPage, pageCount, parseMetadata, getAllText};
};

export default PDFDocumentStrategy;
