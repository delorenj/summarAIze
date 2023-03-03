import * as Buffer from "buffer";
export interface IUser {
  userId: string;
  email?: string;
  isAdmin?: boolean;
}

export enum JobStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
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
  text: string;
}

export interface ISummaryJobPayload {
  payload: ISummaryFormPayload;
  userId: string;
}

export interface IChapterSummary {
  chapterIndex: number;
  text: string;
}

export interface ISummaryJobStatus {
  jobId: string;
  status: JobStatus;
  userId: string;
  payload: ISummaryFormPayload;
  summaries?: IChapterSummary;
  createdAt: string;
}

export interface IBookDetails {
  book: IBook;
  bookJobs: ISummaryJobStatus[];
}

export interface IChapterText {
  chapter: IChapter; // chapter metadata
  text: string; // text of the chapter
}

export interface IChapter {
  index: number;
  bookmark: string;
  end?: string;
  page?: number;
  chapterTitle?: string;
  chapterId?: string; // for navigable chapter books
  numWords: number;
  firstFewWords: string;
  persistStrategy?: string;
  artificial?: boolean;
}

export interface IBookMetadata {
  title: string;
  cover?: string;
  fileType: {
    ext: string;
    mime: string;
  };
  author: string;
  numWords: number;
  chapters: IChapter[];
}

export interface IFileType {
  ext: string;
  mime: string;
}

export enum FileType {
  EPUB = "epub",
  PDF = "pdf",
  MOBI = "mobi",
  TEXT = "txt",
}

export interface IRawBook {
  id: string;
  url: string;
  fileType: string;
  fileContents: Buffer;
  metadata?: IBookMetadata;
}
export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

export interface IBook {
  cacheKey?: string;
  key: string;
  userId?: string;
  bookId: string;
  format: string;
  chapters: IChapter[];
  summaries?: ISummaryJobStatus[];
  title: string;
  author?: string;
  cover: string;
  sizeInBytes: number;
}

export interface IGetUserDataResponse {
  books: IBook[];
  jobs: ISummaryJobStatus[];
}

export interface IUploadBookProps {
  title?: string;
  localFilePath?: string;
}

export interface ISummarizeResult {
  summarizationId: string;
  userId: string;
  bookId: string;
  options: ISummarizeOptions;
  summary: IChapterText;
  createdAt: string;
}

export interface ISummarizeOptions {
  model: string;
  prompt: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
}

export interface IChapterIndexName {
  index: number;
  name: string;
}

export interface ISummaryFormPayload {
  bookId: string;
  complexity: number;
  depth: number;
  includeCharacterGlossary: boolean;
  selectedChapters: IChapterIndexName[];
}

export interface IUploadTask {
  file: IFile;
  progress: number;
  status: string;
  error: string;
}

export interface IFile {
  path: string;
  lastModified: number;
  lastModifiedDate: Date;
  name: string;
  size: number;
  type: string;
  webkitRelativePath: string;
}
