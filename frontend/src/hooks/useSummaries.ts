// hooks/useSummaries.js
import { useState, useEffect } from 'react'

const fetchSummaries = async (jobId: string): Promise<string> => {
  // Replace this with a real API call to DynamoDB to fetch summaries by jobId
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve(`Summary data for jobId: ${jobId}`)
    }, 1000)
  )
}

export const useSummaries = (jobId: string | null) => {
  const [data, setData] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!jobId) return

    setLoading(true)
    fetchSummaries(jobId)
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
