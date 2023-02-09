import React, {useContext, useEffect, useState} from 'react'
import {useS3Upload} from "../hooks/useS3Upload";

export interface IUploadContext {
    uploadDialogOpen: boolean,

    setUploadDialogOpen(open: boolean): void,

    acceptedFiles: IFile[],
    uploadTasks: IUploadTask[],

    addAcceptedFiles(files: IFile[]): IFile[],

    setStatusByFile(file: IFile, status: string): void
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
    },
    setStatusByFile(file: IFile, status: string): void {
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

    const setStatusByFile = (file: IFile, status: string): void => {
        const task = uploadTasks.find((t: IUploadTask) => t.file.name === file.name);
        console.log("Setting status", status, "for", file.name, "task", task)
        const newTasks = uploadTasks.map((t: IUploadTask) => {
            if (t.file.name === file.name) {
                return {...t, status};
            }
            return t;
        })
        console.log("New tasks", newTasks);
        setUploadTasks(newTasks);
    };

    const {uploadFile} = useS3Upload(setStatusByFile);

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
            //Remove from acceptedFiles
            setAcceptedFiles(acceptedFiles.filter((f: IFile) => f.name !== file.name));
        })
    }, [acceptedFiles]);

    useEffect(() => {
        console.log("Upload tasks", uploadTasks);
        uploadTasks.forEach((uploadTask: IUploadTask) => {
            if (uploadTask.status === 'uploading' || uploadTask.status === 'removing') return;
            if (uploadTask.status === 'complete') {
                uploadTask.status = 'removing';
                uploadTask.progress = 100;
                setUploadTasks([...uploadTasks]);
                setTimeout(() => {
                    console.log("Removing from uploadTasks", uploadTask)
                    setUploadTasks(uploadTasks.filter(
                        (t: IUploadTask) => t.file.name !== uploadTask.file.name));
                }, 3000);
                localStorage.removeItem('books');
                return;
            }
            if (uploadTask.status === 'pending') {
                const {file} = uploadTask;
                uploadTask.status = 'uploading';
                uploadTask.progress = 58
                uploadFile(file);
            }
        });
    }, [uploadTasks]);

    const state: IUploadContext = {
        uploadDialogOpen,
        setUploadDialogOpen,
        acceptedFiles,
        uploadTasks,
        addAcceptedFiles: (files: IFile[]) => {
            setAcceptedFiles([...acceptedFiles, ...files])
            return acceptedFiles
        },
        setStatusByFile
    }
    return <UploadContext.Provider value={state}>{children}</UploadContext.Provider>
}

export const useUploadContext = () => (useContext(UploadContext));

export default UploadContextProvider;
