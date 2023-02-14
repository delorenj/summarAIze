import {useCallback, useEffect, useState} from 'react'
import axios from 'axios'
import {useAuth} from "../contexts/authContext";
import {signOut} from "../libs/cognito";
import {useNavigate} from "react-router-dom";
import {IBook, IGetUserDataResponse, ISummaryJobStatus, IUploadBookProps} from "../../../types/summaraizeTypes";
import {useHomeContext} from "../contexts/homeContext";


const defaultBook: IBook = {
    key: '',
    bookId: '',
    format: 'epub',
    title: '',
    chapters: [],
    summaries: [],
    cover: '',
    sizeInBytes: 0
}

export const createBook = (props: IBook) => {
    return defaultBook
}

export const uploadBook = (props: IUploadBookProps): IBook => {
    return createBook({...{title: "Ass"}, ...defaultBook})
}

export interface UseMyDataProps {
    skipCache?: boolean
}

export const useMyData = (props: UseMyDataProps) => {
    const {myJobs, setMyJobs} = useHomeContext();
    const {sessionInfo} = useAuth();
    const [myBooks, setMyBooks] = useState<IBook[]>([])
    const navigate = useNavigate();
    const [poller, setPoller] = useState<NodeJS.Timeout>();
    const {skipCache} = props || false;

    const pollForJobs = useCallback(() => {
        console.log("pollForJobs(): inside useCallback");
        const fetchData = (async () => {
            console.log("pollForJobs(): inside fetchData()");
            try {
                if (!sessionInfo || !sessionInfo.idToken) return;
                const headers = {
                    'Authorization': `Bearer ${sessionInfo.idToken}`
                };

                const {data} = await axios.get<ISummaryJobStatus[]>(
                    'https://4kx4cryfxd.execute-api.us-east-1.amazonaws.com/dev/user/jobs',
                    {headers}
                );
                setMyJobs(data);
                if (data.filter(job => job.status === 'PENDING').length > 0) {
                    console.log("pollForJobs(): still pending jobs. About to setPoller() again...");
                    setPoller(setTimeout(() => {
                        fetchData();
                    }, 2000));
                } else {
                    console.log("pollForJobs(): no pending jobs. About to clearTimeout()...");
                    clearTimeout(poller as NodeJS.Timeout);
                }
            } catch (err) {
                console.log(err);
            }
        });
        console.log("pollForJobs(): about to call initial fetchData()...");
        fetchData();
    }, [sessionInfo, setMyJobs, poller, setPoller]);

    useEffect(() => {
        const storedBooks = localStorage.getItem("books");
        console.log("storedBooks", storedBooks);

        const fetchData = async () => {
            try {
                if (!sessionInfo || !sessionInfo.idToken) return;
                // Create the headers object with the cognito token
                const headers = {
                    'Authorization': `Bearer ${sessionInfo.idToken}`
                };

                const {data} = await axios.get<IGetUserDataResponse>(
                    'https://4kx4cryfxd.execute-api.us-east-1.amazonaws.com/dev/user',
                    {headers}
                );

                console.log("data", data);
                setMyBooks(data.books);
                setMyJobs(data.jobs);
                localStorage.setItem("books", JSON.stringify(data.books));
                console.log("set localStorage to:", JSON.stringify(data.books));

            } catch (err) {
                console.log(err);
                // @ts-ignore
                if (err.response.status === 401) {
                    signOut();
                    navigate('/signin', {replace: true});
                }
            }
        };

        if (!storedBooks || skipCache) {
            console.log("No stored book found. About to call fetchData()...")
            fetchData();
        } else {
            console.log("stored books found!", storedBooks)
            setMyBooks(JSON.parse(storedBooks))
            console.log("Just set storedBooks", JSON.parse(storedBooks));
        }
    }, [])

    return {myBooks, myJobs, setMyJobs, pollForJobs}
}
