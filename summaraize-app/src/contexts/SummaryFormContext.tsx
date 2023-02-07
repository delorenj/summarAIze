import React, {useState, useEffect, useContext, useMemo} from 'react'
import {useHomeContext} from "./homeContext";

export interface ISummaryFormContext {
    bookId: string, setBookId: (bookId: string) => void,
    complexity: number, setComplexity: (complexity: number) => void, handleSetComplexity: (event: Event, newValue: number | number[]) => void,
    depth: number, setDepth: (depth: number) => void, handleSetDepth: (event: Event, newValue: number | number[]) => void,
    includeCharacterGlossary: boolean, setIncludeCharacterGlossary: (includeCharacterGlossary: boolean) => void,
    selectedChapters: string[], setSelectedChapters: (chapters: string[]) => void,
    numWordsSelected: number
}

const defaultState: ISummaryFormContext = {
    bookId: "unset", setBookId: () => { throw new Error("implement me")},
    complexity: 50, setComplexity: () => { throw new Error("implement me")}, handleSetComplexity: () => { throw new Error("implement me")},
    depth: 50, setDepth: () => { throw new Error("implement me")}, handleSetDepth: () => { throw new Error("implement me")},
    includeCharacterGlossary: false, setIncludeCharacterGlossary: () => { throw new Error("implement me")},
    selectedChapters: [], setSelectedChapters: () => { throw new Error("implement me")},
    numWordsSelected: 0
}

type Props = {
    children?: React.ReactNode
}

export const SummaryFormContext = React.createContext(defaultState)

const SummaryFormContextProvider = ({children}: Props) => {
    const {activeBook} = useHomeContext();
    const [complexity, setComplexity] = useState<number>(defaultState.complexity);
    const [depth, setDepth] = useState<number>(defaultState.depth);
    const [includeCharacterGlossary, setIncludeCharacterGlossary] = useState<boolean>(defaultState.includeCharacterGlossary);
    const [selectedChapters, setSelectedChapters] = useState<string[]>(defaultState.selectedChapters);
    const [bookId, setBookId] = useState<string>(activeBook?.bookId || defaultState.bookId);

    const handleSetComplexity = (event: Event, newValue: number | number[]) => {
        setComplexity(newValue as number);
    }
    const handleSetDepth = (event: Event, newValue: number | number[]) => {
        setDepth(newValue as number);
    }

    const numWordsSelected = useMemo(() => {
        return selectedChapters.reduce((acc, chapterId) => {
            const chapter = activeBook?.chapters.find(chapter => chapter.id === chapterId);
            return acc + (chapter?.numWords || 0);
        }, 0);
    }, [selectedChapters, activeBook]);

    const initialState = {
        bookId, setBookId,
        complexity, setComplexity, handleSetComplexity,
        depth, setDepth, handleSetDepth,
        includeCharacterGlossary, setIncludeCharacterGlossary,
        selectedChapters, setSelectedChapters,
        numWordsSelected
    }
    return <SummaryFormContext.Provider value={initialState}>{children}</SummaryFormContext.Provider>
}

export const useSummaryFormContext = () => (useContext(SummaryFormContext));

export default SummaryFormContextProvider
