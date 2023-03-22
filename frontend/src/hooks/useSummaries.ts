// hooks/useSummaries.js
import { useState, useEffect } from 'react'
import { ISummaryJobStatus } from '../types/summaraizeTypes'
import axios from 'axios'
import { useAuth } from '../contexts/authContext'

const fetchSummaries = async (jobId: string, sessionInfo: any): Promise<any> => {
  try {
    if (!sessionInfo || !sessionInfo.idToken) return
    // Create the headers object with the cognito token
    const headers = {
      Authorization: `Bearer ${sessionInfo.idToken}`,
    }

    const { data } = await axios.get<ISummaryJobStatus>(
      'https://4kx4cryfxd.execute-api.us-east-1.amazonaws.com/dev/summary/' + jobId,
      { headers }
    )
    console.log('data', data)
    return data
  } catch (error) {
    console.error('Error fetching summary data:', error)
    throw new Error('Error fetching summary data')
  }
}

export const useSummaries = (jobId: string | null) => {
  const [data, setData] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const { sessionInfo } = useAuth()
  useEffect(() => {
    if (!jobId) return

    setLoading(true)
    fetchSummaries(jobId, sessionInfo)
      .then((result) => {
        setData(result)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching summaries:', error)
        setLoading(false)
      })
  }, [jobId])

  return { data, loading }
}
