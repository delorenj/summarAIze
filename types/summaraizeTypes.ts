import * as Buffer from "buffer";
import { ChapterPersistenceStrategy } from "../server/libs/ChapterPersistence/ChapterPersistenceStrategy";
import { JobStatus } from "../server/libs/sqs-lib";

export interface IUser {
    userId: string,
    email?: string,
    isAdmin?: boolean,
}

export interface IChapterParserOptions {
    persistChapter?: boolean;
    logLevel?: LogLevel;

}

export interface IChapterPlaceholder {
        chapterNumber: number;
        pageStart: number;
        lineStart: number;
        pageEnd?: number;
        lineEnd?: number;
        text: string;
        artificial: boolean;
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
    chapters: IChapter[],
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
    index: number,
    bookmark: string,
    end?: string,
    page?: number,
    chapterTitle?: string,
    chapterId?: string,     // for navigable chapter books
    numWords: number,
    firstFewWords: string,
    persistStrategy?: string,
    artificial?: boolean,

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
export enum LogLevel {
    DEBUG = "debug",
    INFO = "info",
    WARN = "warn",
    ERROR = "error",
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
    books: IBook[],
    jobs: ISummaryJobStatus[],
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
      model: string,
      prompt: string,
      temperature: number,
      max_tokens: number,
      top_p: number,
      frequency_penalty: number,
      presence_penalty: number,
}

export interface IChapterIndexName {
    index: number,
    name: string
}

export interface ISummaryFormPayload {
    bookId: string,
    complexity: number,
    depth: number,
    includeCharacterGlossary: boolean,
    selectedChapters: IChapterIndexName[]
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
