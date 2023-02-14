import React, {useState, useEffect, useContext, useMemo} from 'react'
import {useHomeContext} from "./homeContext";
import axios, {AxiosError, AxiosResponse} from "axios";
import {useAuth} from "./authContext";
import {ISummaryFormPayload, ISummaryJobStatus} from "../../../types/summaraizeTypes";
import {useNavigate} from "react-router-dom";
import {useMyData} from "../hooks/useMyData";

export interface ISummaryFormContext {
    bookId: string, setBookId: (bookId: string) => void,
    complexity: number, setComplexity: (complexity: number) => void, handleSetComplexity: (event: Event, newValue: number | number[]) => void,
    depth: number, setDepth: (depth: number) => void, handleSetDepth: (event: Event, newValue: number | number[]) => void,
    includeCharacterGlossary: boolean, setIncludeCharacterGlossary: (includeCharacterGlossary: boolean) => void,
    selectedChapters: string[], setSelectedChapters: (chapters: string[]) => void,
    numWordsSelected: number,
    onGenerateSummary: () => void,
}


const defaultState: ISummaryFormContext = {
    bookId: "unset", setBookId: () => { throw new Error("implement me")},
    complexity: 50, setComplexity: () => { throw new Error("implement me")}, handleSetComplexity: () => { throw new Error("implement me")},
    depth: 50, setDepth: () => { throw new Error("implement me")}, handleSetDepth: () => { throw new Error("implement me")},
    includeCharacterGlossary: false, setIncludeCharacterGlossary: () => { throw new Error("implement me")},
    selectedChapters: [], setSelectedChapters: () => { throw new Error("implement me")},
    numWordsSelected: 0,
    onGenerateSummary: () => { throw new Error("implement me")}
};

type Props = {
    children?: React.ReactNode
}

export const SummaryFormContext = React.createContext(defaultState)

const SummaryFormContextProvider = ({children}: Props) => {
    const navigate = useNavigate();
    const {sessionInfo} = useAuth();
    const {setMyJobs, myJobs, pollForJobs} = useMyData({skipCache: true});
    const {activeBook} = useHomeContext();
    const [complexity, setComplexity] = useState<number>(defaultState.complexity);
    const [depth, setDepth] = useState<number>(defaultState.depth);
    const [includeCharacterGlossary, setIncludeCharacterGlossary] = useState<boolean>(defaultState.includeCharacterGlossary);
    const [selectedChapters, setSelectedChapters] = useState<string[]>(defaultState.selectedChapters);
    const [bookId, setBookId] = useState<string>(activeBook?.bookId || defaultState.bookId);

    useEffect(() => {
        const pendingJobs = myJobs.filter(job => job.status === "PENDING");
        if (pendingJobs.length > 0) {
            pollForJobs();
        }
    }, [myJobs]);

    const handleSetComplexity = (event: Event, newValue: number | number[]) => {
        setComplexity(newValue as number);
    };

    const handleSetDepth = (event: Event, newValue: number | number[]) => {
        setDepth(newValue as number);
    };

    const onCompleteGenerateSummary = (response:AxiosResponse<ISummaryJobStatus>) => {
        console.log("onCompletedGenerateSummary", response);
        setMyJobs([...myJobs, response.data]);
    };

    const onErrorGenerateSummary = (error: AxiosError) => {
        console.log("onErrorGenerateSummary", error);
        if(error?.response?.status === 401) {
            console.log("token expired");
            navigate("/")
        }
    };

    const onGenerateSummary = () => {
        const data: ISummaryFormPayload = {
            bookId,
            complexity,
            depth,
            includeCharacterGlossary,
            selectedChapters
        }

        try {
            if (!sessionInfo || !sessionInfo.idToken) return;
            axios.post("https://4kx4cryfxd.execute-api.us-east-1.amazonaws.com/dev/summarize", data,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${sessionInfo.idToken}`
                    }
                })
                .then(response => {
                    onCompleteGenerateSummary(response);
                })
                .catch(error => {
                    onErrorGenerateSummary(error);
                })
                .finally(() => {
                    console.log("finally");
                });
        } catch (error) {
            onErrorGenerateSummary(new AxiosError("Error generating summary"));
        }
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
        numWordsSelected,
        onGenerateSummary
    }
    return <SummaryFormContext.Provider value={initialState}>{children}</SummaryFormContext.Provider>
}

export const useSummaryFormContext = () => (useContext(SummaryFormContext));

export default SummaryFormContextProvider
