import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../contexts/authContext'
import { signOut } from '../libs/cognito'
import { useNavigate } from 'react-router-dom'
import { IBook, IBookDetails, IGetUserDataResponse, IUploadBookProps } from '../../../types/summaraizeTypes'
import { useHomeContext } from '../contexts/homeContext'
import { usePollJobStatus } from './usePollJobStatus'

const defaultBook: IBook = {
  key: '',
  bookId: '',
  format: 'epub',
  title: '',
  chapters: [],
  summaries: [],
  cover: '',
  sizeInBytes: 0,
}

export const createBook = (props: IBook) => {
  return defaultBook
}

export const uploadBook = (props: IUploadBookProps): IBook => {
  return createBook({ ...{ title: 'Ass' }, ...defaultBook })
}

export interface UseMyDataProps {
  skipCache?: boolean
}

export const useMyData = (props: UseMyDataProps) => {
  const { myJobs, setMyJobs } = useHomeContext()
  const { sessionInfo } = useAuth()
  const [myBooks, setMyBooks] = useState<IBook[]>([])
  const navigate = useNavigate()
  const { skipCache } = props || false

  const { startPolling } = usePollJobStatus(false)

  useEffect(() => {
    const storedBooks = localStorage.getItem('books')

    const fetchData = async () => {
      try {
        if (!sessionInfo || !sessionInfo.idToken) return
        // Create the headers object with the cognito token
        const headers = {
          Authorization: `Bearer ${sessionInfo.idToken}`,
        }

        const { data } = await axios.get<IGetUserDataResponse>(
          'https://4kx4cryfxd.execute-api.us-east-1.amazonaws.com/dev/user',
          { headers }
        )

        console.log('data', data)
        setMyBooks(data.books)
        setMyJobs(data.jobs)
        localStorage.setItem('books', JSON.stringify(data.books))
      } catch (err) {
        console.log(err)
        // @ts-ignore
        if (err.response.status === 401) {
          signOut()
          navigate('/signin', { replace: true })
        }
      }
    }

    if (!storedBooks || skipCache) {
      console.log('No stored book found. About to call fetchData()...')
      fetchData()
    } else {
      console.log('stored books found!', storedBooks)
      setMyBooks(JSON.parse(storedBooks))
      console.log('Just set storedBooks', JSON.parse(storedBooks))
    }
  }, [])

  const getBookDetails = async (bookId: string): Promise<IBookDetails> => {
    if (!bookId || typeof bookId !== 'string') throw new Error('Invalid bookId')
    try {
      if (!sessionInfo || !sessionInfo.idToken) {
        return Promise.reject(new Error('No session info'))
      }
      // Create the headers object with the cognito token
      const headers = {
        Authorization: `Bearer ${sessionInfo.idToken}`,
      }

      const { data } = await axios.get<IBookDetails>(
        `https://4kx4cryfxd.execute-api.us-east-1.amazonaws.com/dev/book/${bookId}`,
        { headers }
      )

      console.log('Got book details', data)
      return data
    } catch (err) {
      console.log(err)
      // @ts-ignore
      if (err.response.status === 401) {
        return Promise.reject(err)
      }
    }
    return Promise.reject(new Error('Unknown error'))
  }
  return { myBooks, myJobs, setMyJobs, startPolling, getBookDetails }
}
