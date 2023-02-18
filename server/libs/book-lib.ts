import * as AWS from "aws-sdk";
import {fileTypeFromBuffer} from 'file-type';
import {EPub} from 'epub2';
import pdf from 'fork-pdf-parse-with-pagepertext';
import striptags from "striptags";
import {
    FileType,
    IBookMetadata,
    IBookRow,
    IChapter,
    IChapterParserOptions,
    IChapterText,
    IFileType,
    IPagePerText,
    IRawBook,
    ISummaryFormPayload,
    LogLevel
} from "../../types/summaraizeTypes";
import {promises as fs} from "fs";
import {dirname as getDirName} from "path";
import {getBooks} from "./user-lib";
import EpubDocumentStrategy from "./Documents/EpubDocumentStrategy";
import {createDocumentContext, DocumentContext} from "./Documents/DocumentContext";
import PDFDocumentStrategy from "./Documents/PDFDocumentStrategy";
import {createChapterParser} from "./Documents/ChapterParserContext";
import PlainTextDocumentStrategy from "./Documents/PlainTextDocumentStrategy";
import S3ChapterPersistenceStrategy from "./Documents/S3ChapterPersistenceStrategy";
import {LookForChapterHeadingParserStrategy} from "./Documents/LookForChapterHeadingParserStrategy";
import {DocumentStrategy} from "./Documents/DocumentStrategy";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const s3 = new AWS.S3();

export const getUserIdFromRawBook = (book: IRawBook): string => {
    if (!book.url) {
        throw new Error("No book url");
    }
    return book.url.split("/")[0];
}
export const getChapterUrlByRawBook = (book: IRawBook, chapterIndex: number): string => {
    if (!book.url) {
        throw new Error("No book url");
    }
    const bookKey = book.url.split("/").pop();
    return `${getUserIdFromRawBook(book)}/chapters/${bookKey}/${chapterIndex}.txt`;
}

export const getChapterTextByPayload = async (payload: ISummaryFormPayload, userId: string): Promise<IChapterText[]> => {
    const bookRow = await getBookRow(payload.bookId, userId);
    const rawBook = await getBookFromFileSystemOrS3(bookRow.userId + "/" + bookRow.key);
    const chapterTexts = [];
    for (const selectedChapter of payload.selectedChapters) {
        console.log("selectedChapter", selectedChapter);
        const chapter = getRawChapterByIndex(bookRow, selectedChapter.index);
        console.log("chapter", chapter);
        const chapterText = await getTextByChapter(rawBook, chapter);
        console.log("chapterText", chapterText);
        chapterTexts.push({chapter, text: chapterText});
    }
    return chapterTexts;
};

const getEpubChapterText = async (book: IRawBook, chapter: IChapter): Promise<string> => {
    const epub = await EPub.createAsync(book.fileContents as unknown as string);
    const chapterText = await epub.getChapterRawAsync(chapter.chapterId);
    return striptags(chapterText);
}

//TODO: This is not working yet
const getPdfChapterText = async (book: IRawBook, chapter: IChapter): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
        pdf(book.fileContents as unknown as Buffer, (err: Error, data: IPagePerText) => {
            if (err) {
                reject(err);
            }
            const chapterText = "PDF: TO BE IMPLEMENTED"; //data.text.slice(chapter.start, chapter.end);
            resolve(chapterText);
        });
    });
}

//TODO: This is not working yet
const getGenericChapterText = async (book: IRawBook, chapter: IChapter): Promise<string> => {
    return new Promise<string>((resolve) => {
        const chapterText = "Generic/Txt: TO BE IMPLEMENTED"; //data.text.slice(chapter.start, chapter.end);
        resolve(chapterText);
    });
}

const getTextByChapter = async (book: IRawBook, chapter: IChapter): Promise<string> => {
    if (!book.fileContents) {
        throw new Error("No file contents");
    }
    switch (book.fileType) {
        case FileType.EPUB:
            return await getEpubChapterText(book, chapter);
        case FileType.PDF:
            return await getPdfChapterText(book, chapter);
        case FileType.TEXT:
        default:
            return await getGenericChapterText(book, chapter);
    }
}

const getRawChapterByIndex = (book: IBookRow, chapterIndex: number): IChapter => {
    const filteredChapters = book.chapters.filter(chapter => chapter.index === chapterIndex);
    if (filteredChapters.length === 0) {
        throw new Error(`Could not find chapter with index ${chapterIndex}`);
    }
    return filteredChapters[0];
}

export const getBookRow = async (bookId: string, userId: string): Promise<IBookRow> => {
    const books = await getBooks(userId);
    console.log("jong books", books)
    const book = books.filter(book => book.bookId === bookId);
    if (!book) {
        throw new Error(`Could not find book with id ${bookId}`);
    }
    return book[0] as IBookRow;
}

export const getBookFromFileSystemOrS3ById = async (bookId: string, userId: string): Promise<IRawBook> => {
    const bookItem = await getBookRow(bookId, userId);
    return await getBookFromFileSystemOrS3(bookItem.userId + "/" + bookItem.key);
}

export const getBookFromFileSystemOrS3 = async (url: string): Promise<IRawBook> => {
    // Always get the book from S3 for now
    // try {
    //     const book = await readFileFromTemp(url);
    //     console.log("Book read from /tmp");
    //     const metadata = await getBookMetadata(book);
    //     return {
    //         url,
    //         fileContents: book.fileContents,
    //         metadata
    //     };
    // } catch (err) {
    //     console.log("Problem getting book from /tmp:", err);
    const book: IRawBook = await readFileFromS3Bucket(url);
    if (!book) {
        throw new Error(`Could not find book at ${url}`);
    }
    const metadata: IBookMetadata = await getBookMetadata(book);
    await writeBookToTemp(book);
    return {
        url,
        fileType: book.fileType,
        fileContents: book.fileContents,
        metadata,
        id: book.id
    };
    // };
};

export const writeMetadataToDB = async (userId: string, book: IRawBook) => {
    const params: any = {
        TableName: process.env.booksTableName,
        Item: {
            // The attributes of the item to be created
            userId: userId,
            bookId: book.id, // The book's s3 ETag
            format: book.metadata?.fileType.ext,
            title: book.metadata?.title,
            chapters: book.metadata?.chapters,
            numWords: book.metadata?.numWords,
            key: getKeyFromUrl(book.url),
            sizeInBytes: book.fileContents?.length,
            createdAt: Date.now(), // Current Unix timestamp
        },
    };

    try {
        console.log("Writing to DB", params);
        await dynamoDb.put(params).promise();
    } catch (err) {
        console.log("Problem writing to DB:", err);
    }
};

///////////// Private functions

// a function to write the files to tmp on the lambda
const writeBookToTemp = async (book: IRawBook) => {
    console.log(`writing cached books to /tmp`, `/tmp/${book.url}`, book.fileContents);
    await fs.mkdir(`/tmp/${getDirName(book.url)}`, {recursive: true});
    await fs.writeFile(`/tmp/${book.url}`, book.fileContents);
    console.log("Book written to /tmp");
};

// a function to read the cached files from tmp
// async function readFileFromTemp(url) {
//     const file = await fs.readFile(`/tmp/${url}`);
//     console.log("readFileFromTemp", url, file);
//     return {
//         url: url,
//         fileContents: file,
//     };
// }

// a function to pull the files from an s3 bucket before caching them locally
const readFileFromS3Bucket = async (url: string): Promise<IRawBook> => {
    console.log('readFileFromS3Bucket', url);

    try {
        const object = await s3
            .getObject({
                Key: url,
                Bucket: 'summaraize-book'
            })
            .promise();

        console.log("Got object!");
        console.log("Returning: ", object);
        return {
            url: url,
            fileType: url.split(".").pop() || "txt",
            fileContents: object.Body as Buffer,
            id: object.ETag
        };

    } catch (err) {
        console.log("Problem getting S3 object:", err);
        throw err;
    }
}

const isPlainText = (fileType: IFileType) => {
    return fileType && fileType.mime === "text/plain";
};

const isEpub = (fileType: IFileType) => {
    return fileType && fileType.mime === "application/epub+zip";
};

const isPdf = (fileType: IFileType) => {
    return fileType && fileType.mime === "application/pdf";
};

export const numberOfWords = (text: string): number => {
    return text?.split(" ").length || 0;
};

export const stripNewlinesAndCollapseSpaces = (str: string): string => {
    return str.replace(/(\r\n|\n|\r|\t|\s{2,})/gm, " ").trim();
};

export const getTitleFromUrl = (url: string): string | undefined => {
    return url.split("/").pop()?.split(".")[0];
};

const getKeyFromUrl = (url: string): string | undefined => {
    return url.split("/").pop();
};

const splitStringIntoArray = (str: string): IPagePerText[] => {
    const words = str.split(' ');
    let wordCount = 0;
    const result = [];
    let currentString = "";
    for (const word of words) {
        wordCount += 1;
        if (wordCount <= 500) {
            currentString += `${word} `;
        } else {
            result.push({text: currentString});
            currentString = "";
            wordCount = 0;
        }
    }
    if (currentString) {
        result.push({text: currentString});
    }
    return result;
};

const getGenericMetadata = async (book: IRawBook): Promise<IBookMetadata> => {
    // Skip this for now
    // if (!book.fileContents) {
    //     throw new Error("No file contents");
    // }
    // const text = book.fileContents.toString();
    //
    // const doc = createDocumentContext(GenericDocumentStrategy({book});
    // const chapters: IChapter[] = await findChapterBreaks(doc);
    // return {
    //     title: getTitleFromUrl(book.url),
    //     numWords: numberOfWords(fullDoc.text),
    //     chapters
    // };
    return {
        title: 'mock',
        numWords: 0,
        chapters: [],
        fileType: {ext: "txt", mime: "plain/text"}
    }
};

//This method is called by the client to get the book metadata
const getBookMetadata = async (book: IRawBook): Promise<IBookMetadata> => {
    if (!book.fileContents) {
        throw new Error("No file contents");
    }
    const fileType = await fileTypeFromBuffer(book.fileContents) || {ext: "txt", mime: "plain/text"};
    console.log("fileTypeFromBuffer", fileType);
    let metadata;
    const parserOptions: IChapterParserOptions = {
        persistChapter: true,
        persistStrategy: S3ChapterPersistenceStrategy({book}),
        logLevel: LogLevel.DEBUG,
        book
    };

    const chapterParser = createChapterParser(LookForChapterHeadingParserStrategy(parserOptions));
    let docStrategy: DocumentStrategy;

    if (isEpub(fileType)) {
        docStrategy = EpubDocumentStrategy({book});
    } else if (isPdf(fileType)) {
        docStrategy = PDFDocumentStrategy({book});
    } else {
        console.log("Unknown file type, treating as plain text", fileType);
        docStrategy = PlainTextDocumentStrategy({book});
    }
    
    const documentContext = createDocumentContext(docStrategy);
    metadata = await documentContext.parseMetadata();
    console.log("Got book metadata", metadata);
    const chapters = await chapterParser.parse(documentContext);
    console.log("Got Chapters", chapters);
    metadata.chapters = chapters;

    console.log("Got book metadata", {
        fileType: fileType,
        title: metadata.title,
        numWords: metadata.numWords,
        chapters: metadata.chapters
    });

    return {
        fileType: fileType,
        title: metadata.title || "Untitled",
        numWords: metadata.numWords,
        chapters: metadata.chapters
    };
};

