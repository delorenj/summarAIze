import {useEffect, useState} from 'react'
import axios from 'axios'
import {useAuth} from "../contexts/authContext";

export interface IBook {
    cacheKey?: string,
    key: string,
    bookId: string,
    format: string,
    title: string,
    cover: string,
    sizeInMB: number
}

const defaultBook: IBook = {
    key: '',
    bookId: '',
    format: 'epub',
    title: '',
    cover: '',
    sizeInMB: 0
}

interface IGetUserDataResponse {
    Items: IBook[],
    Count: number,
    ScannedCount: number
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

export const useMyData = () => {
    const {sessionInfo} = useAuth();
    const [myBooks, setMyBooks] = useState<IBook[]>([])

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
                    'https://iu8ukmknea.execute-api.us-east-1.amazonaws.com/dev/user',
                    {headers}
                );

                console.log("fetchData()", data);
                setMyBooks(data.Items);
                localStorage.setItem("books", JSON.stringify(data.Items));
                console.log("set localStorage to:", JSON.stringify(data.Items));
            } catch (err) {
                console.log(err);
            }
        };
        
        if (!storedBooks) {
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
