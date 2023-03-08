import { IBook } from '../types/summaraizeTypes'
import { text } from 'stream/consumers'

export interface SummaryWorkspaceProps {
  book: IBook
}

export const SummaryWorkspace = (props: SummaryWorkspaceProps) => {
  const { book } = props
  return (
    <div>
      <pre>{book.title}</pre>
    </div>
  )
}
