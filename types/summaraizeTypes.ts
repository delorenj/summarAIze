import * as Buffer from "buffer";

export interface IPagePerText {
    text: string,
}

export interface IChapter {
    id?: string,
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

export interface IRawBook {
    id: string | undefined,
    url: string,
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
