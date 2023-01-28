import React, {useContext, useState} from 'react'

export interface IUploadContext {
    uploadDialogOpen: boolean,
    setUploadDialogOpen(open: boolean): void,
    acceptedFiles: IFile[],
    addAcceptedFiles(files: IFile[]): IFile[]
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

    const state: IUploadContext = {
        uploadDialogOpen,
        setUploadDialogOpen,
        acceptedFiles,
        addAcceptedFiles: (files: IFile[]) => {
            setAcceptedFiles([...acceptedFiles, ...files])
            return acceptedFiles
        }
    }
    return <UploadContext.Provider value={state}>{children}</UploadContext.Provider>
}

export const useUploadContext = () => (useContext(UploadContext));

export default UploadContextProvider;
