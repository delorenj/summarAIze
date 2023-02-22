import { useDocViewContext } from '../contexts/docViewContext'
import { Card, CardActions, CardContent, CardMedia, Typography } from '@mui/material'
import RemoveRedEyeTwoToneIcon from '@mui/icons-material/RemoveRedEyeTwoTone'
import { SummaraizeDrawer } from './SummaraizeDrawer'
import CloudDownloadTwoToneIcon from '@mui/icons-material/CloudDownloadTwoTone'
import SummarizeTwoToneIcon from '@mui/icons-material/SummarizeTwoTone'
import { IconButton } from 'material-ui'

export const DocNavigator = () => {
  const { activeBook } = useDocViewContext()

  return activeBook ? (
    <>
      <Typography variant="h1">This Book is Boh</Typography>
    </>
  ) : null
}
