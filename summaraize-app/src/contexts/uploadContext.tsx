import React, {useState, useEffect, useContext, useCallback} from 'react'
export interface IUploadContext {
  uploadDialogOpen: boolean,
  setUploadDialogOpen(open: boolean): void
}

const defaultState: IUploadContext = {
  setUploadDialogOpen(open: boolean): void {},
  uploadDialogOpen: true
}

type Props = {
  children?: React.ReactNode
}

export const UploadContext = React.createContext(defaultState)

const UploadContextProvider = ({ children }: Props) => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState<boolean>(true)

  const state: IUploadContext = {
    uploadDialogOpen,
    setUploadDialogOpen,
  }
  return <UploadContext.Provider value={state}>{children}</UploadContext.Provider>
}

export const useUploadContext = () => (useContext(UploadContext));

export default UploadContextProvider;
