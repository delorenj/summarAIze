import React, { useContext, useEffect, useState } from 'react'
import { IBookDetails, ISummaryJobStatus } from '../types/summaraizeTypes'
import { useMyData } from '../hooks/useMyData'
import { useParams } from 'react-router-dom'

export interface IDocViewContext {
  bookDetails?: IBookDetails
  setBookDetails(bookDetails: IBookDetails | undefined): void
  activeTab: number
  setActiveTab(activeTab: number): void
  getSummaryFromBookDetailsByJobId(jobId: string): ISummaryJobStatus
}

const defaultState: IDocViewContext = {
  setBookDetails(bookDetails: IBookDetails) {},
  activeTab: 0,
  setActiveTab(activeTab: number) {
    throw new Error('Function not implemented.')
  },
  getSummaryFromBookDetailsByJobId(jobId: string) {
    throw new Error('Function not implemented.')
  },
}

type Props = {
  children?: React.ReactNode
}

export const DocViewContext = React.createContext(defaultState)

const DocViewContextProvider = ({ children }: Props) => {
  const [bookDetails, setBookDetails] = useState<IBookDetails>()
  const [activeTab, setActiveTab] = useState<number>(0)
  const { bookId } = useParams()
  const { getBookDetails } = useMyData({ skipCache: true })
  const state: IDocViewContext = {
    bookDetails,
    setBookDetails: function (bookDetails: any): void {
      throw new Error('Function not implemented.')
    },
    activeTab,
    setActiveTab,
    getSummaryFromBookDetailsByJobId: (jobId: string) => {
      if (!bookDetails) return {} as ISummaryJobStatus
      const summary = bookDetails.bookJobs.find((summary) => summary.jobId === jobId)
      return summary || ({} as ISummaryJobStatus)
    },
  }

  useEffect(() => {
    if (!bookId) return

    const fetch = async () => {
      const response = await getBookDetails(bookId)
      console.log('Got book details', response)
      setBookDetails(response)
    }
    fetch()
  }, [])
  return <DocViewContext.Provider value={state}>{children}</DocViewContext.Provider>
}

export const useDocViewContext = () => useContext(DocViewContext)

export default DocViewContextProvider
