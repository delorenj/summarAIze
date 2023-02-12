import * as Buffer from "buffer";
import { JobStatus } from "../server/libs/sqs-lib";

export interface IUser {
    userId: string,
    email?: string,
    isAdmin?: boolean,
}

export interface IPagePerText {
    text: string,
}

export interface ISummaryJobPayload {
    payload: ISummaryFormPayload,
    userId: string,
}

export interface ISummaryJobStatus {
    jobId: string,
    status: JobStatus,
    userId: string,
    payload: ISummaryFormPayload,
    createdAt: string,
}

export interface IBookRow {
    userId: string,
    key: string,
    bookId: string,
    title: string,
    chapters: [{
        id: string,
        chapter: number,
        numWords: number,
        firstFewWords: string,
    }],
    format: string,
    cover: string,
    numWords: number,
    sizeInBytes: number,
    createdAt: string,
}
export interface IChapterText {
    chapter: IChapter, // chapter metadata
    text: string, // text of the chapter
}

export interface IChapter {
    id: string,
    page?: number,
    chapter?: number,
    title?: string,
    numWords: number,
    firstFewWords: string,

}

export interface ISummary {
    id: string,
    title: string,
    complexity: number,
    depth: number,
    numWords: number,
    fileUrl: string,
    fileFormat: string,
    createdAt: string,
    status: string,
}

export interface IBookMetadata {
    title: string,
    fileType: {
        ext: string,
        mime: string
    },
    numWords: number,
    chapters: IChapter[],
}

export interface IFileType {
    ext: string,
    mime: string
}

export enum FileType {
    EPUB = "epub",
    PDF = "pdf",
    MOBI = "mobi",
    TEXT = "txt",
}

export interface IRawBook {
    id: string | undefined,
    url: string,
    fileType: string,
    fileContents: Buffer,
    metadata?: IBookMetadata
}

export interface IBook {
    cacheKey?: string,
    key: string,
    bookId: string,
    format: string,
    chapters: IChapter[],
    summaries: ISummary[],
    title: string,
    cover: string,
    sizeInBytes: number
}

export interface IGetUserDataResponse {
    books: IBook[]
}

export interface IUploadBookProps {
    title?: string,
    localFilePath?: string,
}

export interface ISummarizeResult {
    summarizationId: string,
    userId: string,
    bookId: string,
    options: ISummarizeOptions,
    summary: IChapterText,
    createdAt: string,
}

export interface ISummarizeOptions {
      model: "text-davinci-003",
      prompt: "",
      temperature: 0.5,
      max_tokens: 60,
      top_p: 1.0,
      frequency_penalty: 0.8,
      presence_penalty: 0.0,
}
export interface ISummaryFormPayload {
    bookId: string,
    complexity: number,
    depth: number,
    includeCharacterGlossary: boolean,
    selectedChapters: string[]
}

export interface IUploadTask {
    file: IFile,
    progress: number,
    status: string,
    error: string
}

export interface IFile {
    path: string,
    lastModified: number,
    lastModifiedDate: Date,
    name: string,
    size: number,
    type: string,
    webkitRelativePath: string
}
