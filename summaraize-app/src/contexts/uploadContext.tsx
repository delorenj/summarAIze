import React, {useContext, useEffect, useState} from 'react'
import {useS3Upload} from "../hooks/UseS3Upload";

export interface IUploadContext {
    uploadDialogOpen: boolean,
    setUploadDialogOpen(open: boolean): void,
    acceptedFiles: IFile[],
    uploadTasks: IUploadTask[],
    addAcceptedFiles(files: IFile[]): IFile[]
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

const defaultState: IUploadContext = {
    setUploadDialogOpen(open: boolean): void {
    },
    uploadDialogOpen: true,
    acceptedFiles: [],
    uploadTasks: [],
    addAcceptedFiles(files: IFile[]): IFile[] {
        return []
    }
}

type Props = {
    children?: React.ReactNode
}

export const UploadContext = React.createContext(defaultState)

const UploadContextProvider = ({children}: Props) => {
    const [uploadDialogOpen, setUploadDialogOpen] = useState<boolean>(true)
    const [acceptedFiles, setAcceptedFiles] = useState<IFile[]>([]);
    const [uploadTasks, setUploadTasks] = useState<IUploadTask[]>([]);
    const {uploadFile, uploadProgress, uploadError} = useS3Upload();

    useEffect(() => {
        console.log("Files accepted", acceptedFiles);
        acceptedFiles.forEach((file: IFile) => {
            const uploadTask: IUploadTask = {
                file,
                progress: 0,
                status: 'pending',
                error: ''
            }
            setUploadTasks([...uploadTasks, uploadTask])
        })
    }, [acceptedFiles]);

    useEffect(() => {
        console.log("Upload tasks", uploadTasks);
        uploadTasks.forEach((uploadTask: IUploadTask) => {
            const {file} = uploadTask;
            uploadFile(file);
        });
    }, [uploadTasks]);

    useEffect(() => {
        console.log("Upload progress", uploadProgress);
    }, [uploadProgress]);

    useEffect(() => {
        console.log("Upload error", uploadError);
    }, [uploadError]);

    const state: IUploadContext = {
        uploadDialogOpen,
        setUploadDialogOpen,
        acceptedFiles,
        uploadTasks,
        addAcceptedFiles: (files: IFile[]) => {
            setAcceptedFiles([...acceptedFiles, ...files])
            return acceptedFiles
        }
    }
    return <UploadContext.Provider value={state}>{children}</UploadContext.Provider>
}

export const useUploadContext = () => (useContext(UploadContext));

export default UploadContextProvider;
