import {IBookMetadata, IChapter, IRawBook} from '../../../types/summaraizeTypes';
import {DocumentStrategy, wordsPerPage} from './DocumentStrategy';
import {EPub} from "epub2";
import {numberOfWords, stripNewlinesAndCollapseSpaces} from "../book-lib";
import striptags from "striptags";

const EpubDocumentStrategy = (params: { book: IRawBook }): DocumentStrategy => {
    const {book} = params;

    const epub = async (): Promise<EPub> => {
        return await EPub.createAsync(book.fileContents as unknown as string);
    }
    const getPage = async (pageNumber: number): Promise<string> => {
        const doc = await epub();
        const totalPages = await pageCount();
        if (pageNumber >= totalPages) {
            throw new Error("Page number is out of range");
        }
        const allWords = await getAllWords();
        const startWord = (pageNumber - 1) * wordsPerPage;
        const endWord = pageNumber * wordsPerPage;
        const pageWords = allWords.slice(startWord, endWord);
        return pageWords.join(" ");
    };

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
        return striptags(doc.containerFile);
    }
    const parseMetadata = async (): Promise<IBookMetadata> => {
        const doc = await epub();
        if (!book.fileContents) {
            throw new Error("No file contents");
        }

        const title = doc.metadata.title || "Untitled"
        const chapters: IChapter[] = [];
        let totalNumWords = 0;
        let chapterCount = 0;
        console.log("doc.flow", doc.flow);
        console.log("epub", doc);
        for (const chapter of doc.flow) {
            chapterCount += 1;
            if (!chapter.id) {
                console.log("skipping chapter", chapter);
                continue;
            }
            const rawChapter = await doc.getChapterAsync(chapter.id);
            const noTagText = stripNewlinesAndCollapseSpaces(striptags(rawChapter));
            const numWords = numberOfWords(noTagText);
            totalNumWords += numWords;
            const chapterResult = {
                id: chapter.id,
                chapter: chapterCount,
                title: chapter.title,
                page: chapter.order,
                numWords,
                firstFewWords: noTagText.split(" ").slice(0, 250).join(" ")
            };
            chapters.push(chapterResult);
        }
        console.log("about to return", chapters, JSON.stringify(chapters), "chapterCount=" + chapterCount);
        return {
            title: title || "Untitled",
            numWords: totalNumWords,
            chapters,
            fileType: {
                ext: "epub",
                mime: "application/epub+zip"
            }
        };
    };

    return {getPage, pageCount, parseMetadata, getAllText};
};

export default EpubDocumentStrategy;
