import AWS from "aws-sdk";
import {IBookMetadata, IChapter, IRawBook} from '../../../types/summaraizeTypes';
import {ChapterPersistenceStrategy} from "./ChapterPersistenceStrategy";
import {getUserIdFromRawBook} from "../book-lib";

const S3 = new AWS.S3();

const S3ChapterPersistenceStrategy = (params: { book: IRawBook }): ChapterPersistenceStrategy => {
    const {book} = params;
    const saveChapter = async (chapterText: string, chapterIndex: number): Promise<string> => {
        console.log("Saving chapter to S3", chapterText, chapterIndex);
        const userId = getUserIdFromRawBook(book);
        const bookId = book.id;
        const key = `${userId}/chapters/${bookId}/${chapterIndex}.txt`;
        console.log("About to save chapter to S3", key, chapterText);
        const response = await S3.putObject({
            Bucket: "summaraize-book",
            Key: key,
            Body: chapterText,
            ContentType: "text/plain"
        });
        console.log("Saved chapter to S3", response);
        return key;
    }
    return {saveChapter};
};

export default S3ChapterPersistenceStrategy;
