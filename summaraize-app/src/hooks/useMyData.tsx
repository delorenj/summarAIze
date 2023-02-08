import {useEffect, useState} from 'react'
import axios from 'axios'
import {useAuth} from "../contexts/authContext";
import {signOut} from "../libs/cognito";
import {useNavigate} from "react-router-dom";

export interface IChapter {
    id: string,
    title: string,
    numWords: number,
    firstFewWords: string,
}

export interface ISummary {
    id: string,
    title: string,
    complexity: number,
    depth: number,
    numWords: number,
    fileUrl: string,
    fileFormat: string,
    createdAt: string,
    status: string,
}

export interface IBook {
    cacheKey?: string,
    key: string,
    bookId: string,
    format: string,
    chapters: IChapter[],
    summaries: ISummary[],
    title: string,
    cover: string,
    sizeInBytes: number
}

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

interface IGetUserDataResponse {
    books: IBook[]
}

interface UploadBookProps {
    title?: string,
    localFilePath?: string,
}

export const createBook = (props: IBook) => {
    return defaultBook
}

export const uploadBook = (props: UploadBookProps): IBook => {
    return createBook({...{title: "Ass"}, ...defaultBook})
}
export interface UseMyDataProps {
    skipCache?: boolean
}

export const useMyData = (props: UseMyDataProps) => {
    const {sessionInfo} = useAuth();
    const [myBooks, setMyBooks] = useState<IBook[]>([])
    const navigate = useNavigate();
    const {skipCache} = props || false;

    useEffect(() => {
        const storedBooks = localStorage.getItem("books");
        console.log("storedBooks", storedBooks);

        const fetchData = async () => {
            try {
                if (!sessionInfo || !sessionInfo.accessToken) return;
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

    return {myBooks}
}
