import React, { useState, useEffect, useContext } from 'react'
import { IBook, ISummaryJobStatus } from '../types/summaraizeTypes'

export interface IHomeContext {
  summaraizeDrawerOpen: boolean
  setSummaraizeDrawerOpen(open: boolean): void
  activeBook?: IBook
  setActiveBook(book: IBook | undefined): void
  myJobs: ISummaryJobStatus[]
  setMyJobs(jobs: ISummaryJobStatus[]): void
  activeBookJobs(): ISummaryJobStatusProcessed[]
}

const defaultState: IHomeContext = {
  setSummaraizeDrawerOpen(open: boolean): void {},
  summaraizeDrawerOpen: false,
  setActiveBook(book: IBook) {},
  myJobs: [],
  setMyJobs(jobs: ISummaryJobStatus[]) {},
  activeBookJobs(): ISummaryJobStatusProcessed[] {
    return []
  },
}

type Props = {
  children?: React.ReactNode
}

interface ISummaryJobStatusProcessed extends ISummaryJobStatus {
  title: string
}

export const HomeContext = React.createContext(defaultState)

const HomeContextProvider = ({ children }: Props) => {
  const [summaraizeDrawerOpen, setSummaraizeDrawerOpen] = useState<boolean>(false)
  const [activeBook, setActiveBook] = useState<IBook | undefined>()
  const [myJobs, setMyJobs] = useState<ISummaryJobStatus[]>([])

  // Open drawer when activeBook is set
  // Close drawer when activeBook is unset
  useEffect(() => {
    if (!activeBook) {
      setSummaraizeDrawerOpen(false)
      return
    }
    setSummaraizeDrawerOpen(true)
  }, [activeBook])

  const activeBookJobs = () => {
    if (!activeBook) return []
    return myJobs
      .filter((job) => job.payload.bookId === activeBook.bookId)
      .map((job) => ({
        ...job,
        title: `Chapters ${job.payload.selectedChapters.map((c) => c.name).join(', ')}`,
      }))
  }

  const state: IHomeContext = {
    summaraizeDrawerOpen,
    setSummaraizeDrawerOpen,
    activeBook,
    setActiveBook,
    myJobs,
    setMyJobs,
    activeBookJobs,
  }
  return <HomeContext.Provider value={state}>{children}</HomeContext.Provider>
}

export const useHomeContext = () => useContext(HomeContext)

export default HomeContextProvider
