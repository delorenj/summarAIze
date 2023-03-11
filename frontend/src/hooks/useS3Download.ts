import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/authContext'

window.Buffer = window.Buffer || require('buffer').Buffer

export const useS3Download = () => {
  const [downloadUrl, setDownloadUrl] = useState<string>()
  const navigate = useNavigate()
  const { signOut } = useAuth()

  const signedDownloadUrl = `${process.env.REACT_APP_INVOKE_URL}/${process.env.REACT_APP_STAGE}/signed/download`

  const downloadFile = async (bookId: string) => {
    const customSignedDownloadUrl = `${signedDownloadUrl}?id=${encodeURIComponent(bookId)}`
    let response = {}
    try {
      response = await axios({
        method: 'GET',
        url: customSignedDownloadUrl,
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('idToken'),
        },
      })
      console.log('signedDownloadURL Response:', response)
      // @ts-ignore
      setDownloadUrl(response.data.downloadURL)
      // Navigate to download URL
      window.open(downloadUrl, '_blank')
    } catch (e: any) {
      console.log('Error getting signedDownloadURL', e)
      if (e.response.status === 401) {
        await signOut()
        navigate('/signin', { replace: true })
      }
    }
  }

  return { downloadFile, downloadUrl }
}
