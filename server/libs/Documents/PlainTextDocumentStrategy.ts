import {IBookMetadata, IChapter, IRawBook} from '../../../types/summaraizeTypes';
import {DocumentStrategy} from './DocumentStrategy';
import {getTitleFromUrl} from "../book-lib";
import striptags from "striptags";

const PlainTextDocumentStrategy = (params: { book: IRawBook }): DocumentStrategy => {
    const {book} = params;
    const plainText = (): string => {
        return book.fileContents.toString('utf8');
    }
    const wordCount = async (): Promise<number> => {
        const allWords = await getAllText();
        return allWords.split(" ").length;
    }

    const getAllText = async (): Promise<string> => {
        const doc = plainText();
        return striptags(doc);
    }

    const parseMetadata = async (): Promise<IBookMetadata> => {
        const doc = plainText();
        console.log("Got PlainText doc");
        const title = getTitleFromUrl(book.url) || "Untitled";
        const chapters:IChapter[] = [];
        console.log("chapters", chapters);
        return {
            title,
            numWords: await wordCount(),
            chapters,
            fileType: {
                ext: "plainText",
                mime: "application/plainText"
            }
        };
    };

    return {parseMetadata, getAllText, book};
};

export default PlainTextDocumentStrategy;
