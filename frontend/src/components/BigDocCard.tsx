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
        <CardContent
          sx={{
            flexGrow: 1,
          }}>
          <Typography gutterBottom variant="h5" component="h2">
            {bookDetails.book.title}
          </Typography>
        </CardContent>
        <CardActions>
          <IconButton>
            <RemoveRedEyeTwoToneIcon />
          </IconButton>
          <IconButton aria-label="add to favorites">
            <CloudDownloadTwoToneIcon />
          </IconButton>
          <IconButton>
            <SummarizeTwoToneIcon />
          </IconButton>
        </CardActions>
        <SummaraizeDrawer />
      </Card>
    </>
  ) : null
}
