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
    IChapterText,
    IFileType,
    IPagePerText,
    IRawBook,
    ISummaryFormPayload
} from "../../types/summaraizeTypes";
import fullPdf from 'pdf-parse';
import {promises as fs} from "fs";
import {dirname as getDirName} from "path";
import {QueryInput} from "aws-sdk/clients/dynamodb";
import {getBooks} from "./user-lib";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const s3 = new AWS.S3();

export const getChapterTextByPayload = async (payload: ISummaryFormPayload, userId: string): Promise<IChapterText[]> => {
    const bookRow = await getBookRow(payload.bookId, userId);
    const rawBook = await getBookFromFileSystemOrS3(bookRow.userId + "/" + bookRow.key);
    const chapterTexts = [];
    for (const selectedChapter of payload.selectedChapters) {
        console.log("selectedChapter", selectedChapter);
        const chapter = getRawChapterById(bookRow, selectedChapter);
        console.log("chapter", chapter);
        const chapterText = await getTextByChapter(rawBook, chapter);
        console.log("chapterText", chapterText);
        chapterTexts.push({chapter, text: chapterText});
    }
    return chapterTexts;
};

const getEpubChapterText = async (book: IRawBook, chapter: IChapter): Promise<string> => {
    const epub = await EPub.createAsync(book.fileContents as unknown as string);
    const chapterText = await epub.getChapterRawAsync(chapter.id);
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

const getRawChapterById = (book: IBookRow, chapterId: string): IChapter => {
    const filteredChapters = book.chapters.filter(chapter => chapter.id === chapterId);
    if (filteredChapters.length === 0) {
        throw new Error(`Could not find chapter with id ${chapterId}`);
    }
    return filteredChapters[0];
}

export const getBookRow = async (bookId: string, userId: string): Promise<IBookRow> => {
    const books = await getBooks(userId);
    console.log("jong books", books)
    const book = books.filter(book => book.bookId === bookId);
    if(!book) {
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

const numberOfWords = (text: string): number => {
    return text?.split(" ").length || 0;
};

export const stripNewlinesAndCollapseSpaces = (str: string): string => {
    return str.replace(/(\r\n|\n|\r|\t|\s{2,})/gm, " ").trim();
};

// This method is called by the client to get the book metadata
const getEpubMetadata = async (book: IRawBook): Promise<IBookMetadata> => {
    if (!book.fileContents) {
        throw new Error("No file contents");
    }

    const epub = await EPub.createAsync(book.fileContents as unknown as string);
    const title = epub.metadata.title;
    const chapters: IChapter[] = [];
    let totalNumWords = 0;
    let chapterCount = 0;
    for (const chapter of epub.flow) {
        chapterCount += 1;
        const rawChapter = await epub.getChapterAsync(chapter.id);
        const noTagText = stripNewlinesAndCollapseSpaces(striptags(rawChapter));
        const numWords = numberOfWords(noTagText);
        totalNumWords += numWords;
        const chapterResult = {
            id: chapter.id,
            chapter: chapterCount,
            title: chapter.title,
            numWords,
            firstFewWords: noTagText.split(" ").slice(0, 250).join(" ")
        };
        chapters.push(chapterResult);
    }
    console.log("about to return", chapters, JSON.stringify(chapters), "chapterCount=" + chapterCount);
    return {
        title,
        numWords: totalNumWords,
        chapters,
        fileType: {
            ext: "epub",
            mime: "application/epub+zip"
        }
    };
};

const findChapterBreaks = (doc: any, fullDoc: any): IChapter[] => {
        const numPages = doc.textPerPage.length;
        console.log("Number of pages", numPages);
        const chapterBreaks: IChapter[] = [];
        const numWords = numberOfWords(fullDoc.text);
        for (let i = 0; i < numPages; i++) {
            let numWordsPerChapter = 0;
            const page = doc.textPerPage[i];
            const lines = page.text.match(/[^\r\n]+/g);
            let chapterCount = 0;
            try {
                // Loop through the lines on the page and look for "Chapter" keyword
                for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                    const line = lines[lineIndex];
                    numWordsPerChapter += numberOfWords(stripNewlinesAndCollapseSpaces(line));
                    if (line.toLowerCase().includes('chapter')) {
                        chapterCount += 1;
                        chapterBreaks.push({
                            id: `page-${i}-line-${lineIndex}`,
                            page: i,
                            chapter: chapterCount,
                            numWords: numWordsPerChapter,
                            firstFewWords: lines.slice(lineIndex, lineIndex + 3).join(" ")
                        });
                        console.log("Found chapter break", chapterBreaks);
                        break;
                    }
                }
            } catch (e) {
                console.log("error parsing chapter breaks", e);
            }
        }
        if (chapterBreaks.length === 0) {
            console.log("No chapter breaks found, adding one at the beginning of the book");
            let firstFewWords = '';
            try {
                firstFewWords = doc.textPerPage[0].text.split(" ").slice(0, 250).join(" ");
            } catch (err) {
                console.log("Problem getting first few words", err);
            }
            chapterBreaks.push({
                id: "all",
                page: 1,
                chapter: 1,
                numWords,
                firstFewWords
            });
        }
        console.log("Chapter breaks", chapterBreaks);
        return chapterBreaks;
    }
;

const getPdfMetadata = async (book: IRawBook): Promise<IBookMetadata> => {
    const doc = await pdf(book.fileContents);
    console.log("Got PDF doc");
    const fullDoc = await fullPdf(book.fileContents);
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

const getTitleFromUrl = (url: string): string | undefined => {
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

const getGenericMetadata = async (book: IRawBook) => {
    if (!book.fileContents) {
        throw new Error("No file contents");
    }
    const text = book.fileContents.toString();

    const textPerPage = splitStringIntoArray(text);
    console.log('num pages', textPerPage.length);
    const paginatedBook = {
        ...book,
        ...{textPerPage}
    };
    const fullDoc = {
        text
    };
    console.log('paginatedBook', paginatedBook);
    const chapters: IChapter[] = findChapterBreaks(paginatedBook, fullDoc);
    return {
        title: getTitleFromUrl(book.url),
        numWords: numberOfWords(fullDoc.text),
        chapters
    };
};

//This method is called by the client to get the book metadata
const getBookMetadata = async (book: IRawBook): Promise<IBookMetadata> => {
    if (!book.fileContents) {
        throw new Error("No file contents");
    }
    const fileType = await fileTypeFromBuffer(book.fileContents) || {ext: "txt", mime: "plain/text"};
    console.log("fileTypeFromBuffer", fileType);
    let metadata;
    if (isPlainText(fileType)) {
        //Generic metadata for other file types
        console.log("Generic metatdata detected...");
        metadata = await getGenericMetadata(book);
    } else if (isEpub(fileType)) {
        metadata = await getEpubMetadata(book);
    } else if (isPdf(fileType)) {
        metadata = await getPdfMetadata(book);
    } else {
        //Generic metadata for other file types
        console.log("Generic metatdata detected...");
        metadata = await getGenericMetadata(book);
    }
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

