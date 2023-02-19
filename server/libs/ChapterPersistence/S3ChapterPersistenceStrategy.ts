import AWS from "aws-sdk";
import {IBookMetadata, IChapter, IRawBook} from '../../../types/summaraizeTypes';
import {ChapterPersistenceStrategy} from "./ChapterPersistenceStrategy";
import {getChapterUrlByRawBook, getUserIdFromRawBook} from "../book-lib";
import {DocumentContext} from "../Documents/DocumentContext";

const S3 = new AWS.S3();

const S3ChapterPersistenceStrategy = (doc:DocumentContext): ChapterPersistenceStrategy => {
    const book:IRawBook = doc.book;
    const TYPE = "S3";
    const saveChapter = async (chapterText: string, chapterIndex: number): Promise<string> => {
        console.log("Saving chapter to S3", chapterText, chapterIndex);
        const userId = getUserIdFromRawBook(book);
        const bookKey = book.url.split("/").pop();
        const key = getChapterUrlByRawBook(book, chapterIndex);

        try {
            const data = await S3.putObject({
                Bucket: "summaraize-book",
                Key: key,
                Body: chapterText
            }).promise();
            console.log("Successfully saved chapter to S3", data);
            return key;
        } catch (err) {
            console.log("Error saving chapter to S3", err);
            throw err;
        }
    }
    return {TYPE, saveChapter};
};


export default S3ChapterPersistenceStrategy;
