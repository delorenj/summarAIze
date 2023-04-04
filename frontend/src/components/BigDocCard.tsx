import { useDocViewContext } from '../contexts/docViewContext'
import { Card, CardActions, CardContent, CardMedia, IconButton, Typography } from '@mui/material'
import RemoveRedEyeTwoToneIcon from '@mui/icons-material/RemoveRedEyeTwoTone'
import { SummaraizeDrawer } from './SummaraizeDrawer'
import CloudDownloadTwoToneIcon from '@mui/icons-material/CloudDownloadTwoTone'
import SummarizeTwoToneIcon from '@mui/icons-material/SummarizeTwoTone'

export const BigDocCard = () => {
  const { bookDetails } = useDocViewContext()
  return bookDetails ? (
    <>
      <Card
        raised
        sx={{
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1,
        }}>
        <CardMedia component="img" image={bookDetails.book.cover} alt={bookDetails.book.title} height={undefined} />
        <CardActions>
          <IconButton aria-label="add to favorites">
            <CloudDownloadTwoToneIcon />
          </IconButton>
          <Typography variant='button'>Download</Typography>
        </CardActions>
        <SummaraizeDrawer />
      </Card>
    </>
  ) : null
}
