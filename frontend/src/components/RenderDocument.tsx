import { IBook } from '../types/summaraizeTypes'
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer'

export interface RenderDocumentProps {
  book: IBook
}

export const RenderDocument = (props: RenderDocumentProps) => {
  const docs = [
    {
      uri: require('../the-last-necromancer.pdf').default,
    },
  ]

  const { book } = props
  return <DocViewer pluginRenderers={DocViewerRenderers} documents={docs} />
}
