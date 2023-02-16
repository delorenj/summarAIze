import {IBookMetadata, IChapter, IRawBook} from '../../../types/summaraizeTypes';
import {DocumentStrategy, wordsPerPage} from './DocumentStrategy';
import {EPub} from "epub2";
import striptags from "striptags";

const EpubDocumentStrategy = (params: { book: IRawBook }): DocumentStrategy => {
    const {book} = params;

    const epub = async (): Promise<EPub> => {
        return await EPub.createAsync(book.fileContents as unknown as string);
    }
    const wordCount = async (): Promise<number> => {
        const allWords = await getAllText();
        return allWords.split(" ").length;
    }
    const pageCount = async (): Promise<number> => {
        const totalWords = await wordCount();
        return Math.ceil(totalWords / wordsPerPage);
    };

    const getAllWords = async (): Promise<string[]> => {
        const allWords = await getAllText();
        return allWords.split(" ");
    }

    const getAllText = async (): Promise<string> => {
        const doc = await epub();
        let text = "";
        for (const chapter of doc.flow) {
            const contents = await doc.getChapterRawAsync(chapter.id as string);
            text += contents;
        }
        return striptags(text);
    }
    const parseMetadata = async (): Promise<IBookMetadata> => {
        const doc = await epub();
        if (!book.fileContents) {
            throw new Error("No file contents");
        }

        const title = doc.metadata.title || "Untitled"
        const chapters: IChapter[] = [];
        return {
            title: title || "Untitled",
            numWords: await wordCount(),
            chapters,
            fileType: {
                ext: "epub",
                mime: "application/epub+zip"
            }
        };
    };

    return {parseMetadata, getAllText};
};

export default EpubDocumentStrategy;
