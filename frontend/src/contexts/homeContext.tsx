import React, {useState, useEffect, useContext} from 'react'
import {IBook, ISummaryJobStatus} from "../../../types/summaraizeTypes";

export interface IHomeContext {
    summaraizeDrawerOpen: boolean,
    setSummaraizeDrawerOpen(open: boolean): void,
    activeBook?: IBook,
    setActiveBook(book: IBook | undefined): void,
    myJobs: ISummaryJobStatus[],
    setMyJobs(jobs: ISummaryJobStatus[]): void,
}

const defaultState: IHomeContext = {
    setSummaraizeDrawerOpen(open: boolean): void {
    },
    summaraizeDrawerOpen: false,
    setActiveBook(book: IBook) {
    },
    myJobs: [],
    setMyJobs(jobs: ISummaryJobStatus[]) {
    }
}

type Props = {
    children?: React.ReactNode
}

export const HomeContext = React.createContext(defaultState)

const HomeContextProvider = ({children}: Props) => {
    const [summaraizeDrawerOpen, setSummaraizeDrawerOpen] = useState<boolean>(false)
    const [activeBook, setActiveBook] = useState<IBook | undefined>()
    const [myJobs, setMyJobs] = useState<ISummaryJobStatus[]>([])

    // Open drawer when activeBook is set
    // Close drawer when activeBook is unset
    useEffect(() => {
        if (!activeBook) {
            setSummaraizeDrawerOpen(false);
            return;
        }
        setSummaraizeDrawerOpen(true);
    }, [activeBook]);

    const state: IHomeContext = {
        summaraizeDrawerOpen,
        setSummaraizeDrawerOpen,
        activeBook,
        setActiveBook,
        myJobs,
        setMyJobs,
    }
    return <HomeContext.Provider value={state}>{children}</HomeContext.Provider>
}

export const useHomeContext = () => (useContext(HomeContext));

export default HomeContextProvider
