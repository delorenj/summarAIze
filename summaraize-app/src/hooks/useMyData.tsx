import {useEffect, useState} from 'react'
import axios from 'axios'
import {useAuth} from "../contexts/authContext";

interface IBook {
    key: string,
    bookId: string,
    format: string,
    title: string,
    cover: string,
    sizeInMB: number
}

interface IGetUserDataResponse {
    Items: IBook[],
    Count: number,
    ScannedCount: number
}

export const useMyData = () => {
    const {sessionInfo} = useAuth();
    const [myBooks, setMyBooks] = useState<IBook[]>([])

    useEffect(() => {
        if (!sessionInfo || !sessionInfo.accessToken) return;

        // Create the headers object with the cognito token
        const headers = {
            'Authorization': `Bearer ${sessionInfo.idToken}`
        };

        axios.get<IGetUserDataResponse>('https://iu8ukmknea.execute-api.us-east-1.amazonaws.com/dev/user',
            {headers})
            .then((response) => {
                setMyBooks(response.data.Items);
            })
            .catch(error => {
                console.log(error);
            });
    }, [])

    return {myBooks}
}
