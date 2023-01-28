import React, {useState, useEffect, useContext, useCallback} from 'react'
import {useDropzone} from "react-dropzone";
export interface IUploadContext {
  uploadDialogOpen: boolean,
  setUploadDialogOpen(open: boolean): void,
  getRootProps(): any,
  getInputProps(): any
  isDragActive: boolean,
  acceptedFiles: any,
  fileRejections: any
}

const defaultState: IUploadContext = {
  acceptedFiles: [], fileRejections: [],
  getInputProps(): any {
  }, getRootProps(): any {
  },
  isDragActive: false,
  setUploadDialogOpen(open: boolean): void {},
  uploadDialogOpen: true
}

type Props = {
  children?: React.ReactNode
}

export const UploadContext = React.createContext(defaultState)

const UploadContextProvider = ({ children }: Props) => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState<boolean>(true)
  const onDrop = useCallback((acceptedFiles: any) => {
    console.log("File drop!", acceptedFiles);
  }, [])
    const {
        acceptedFiles,
        fileRejections,
        getRootProps,
        getInputProps,
        isDragActive,
    } = useDropzone({
        onDrop,
        accept: {
            'epub': [],
            'pdf': [],
            'txt': [],
            'mobi': []
        }
    });
  const state: IUploadContext = {
    acceptedFiles,
    fileRejections,
    getInputProps,
    getRootProps,
    isDragActive,
    uploadDialogOpen,
    setUploadDialogOpen

  }
  return <UploadContext.Provider value={state}>{children}</UploadContext.Provider>
}

export const useUploadContext = () => (useContext(UploadContext));

export default UploadContextProvider;
