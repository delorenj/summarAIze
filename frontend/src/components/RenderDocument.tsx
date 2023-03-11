import { IBook } from '../types/summaraizeTypes'
import { useS3Download } from '../hooks/useS3Download'
import { useEffect, useState } from 'react'
import fileSaver from 'file-saver'

export interface RenderDocumentProps {
  book: IBook
}

export const RenderDocument = (props: RenderDocumentProps) => {
  const { downloadUrl, downloadFile } = useS3Download()
  const [doc, setDoc] = useState<any>([])

  useEffect(() => {
    downloadFile(props.book.bookId)
  }, [])

  useEffect(() => {
    setDoc([
      {
        uri: downloadUrl,
      },
    ])
  }, [downloadUrl])

  const { book } = props

  const handleDownload = () => {
    if (!downloadUrl) return
    const xhr = new XMLHttpRequest()
    xhr.responseType = 'blob'
    xhr.onload = () => {
      fileSaver.saveAs(xhr.response, `${book.title}.${book.key.split('.').pop()}`)
    }
    xhr.open('GET', downloadUrl)
    xhr.send()
  }

  return (
    <a href="#" onClick={handleDownload}>
      Download original file
    </a>
  )
}
