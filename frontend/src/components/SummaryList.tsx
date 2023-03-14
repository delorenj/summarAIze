import { useHomeContext } from '../contexts/homeContext'
import { IconButton, List, ListItem, ListItemButton, Stack } from '@mui/material'
import { JobStatus } from '../types/summaraizeTypes'
import CircularProgressBar from './CircularProgressBar'
import DownloadIcon from '@mui/icons-material/Download'
import PreviewIcon from '@mui/icons-material/Preview'
import ListItemText from '@mui/material/ListItemText'
import { useEffect } from 'react'
import { useDocViewContext } from '../contexts/docViewContext'
export const SummaryList = () => {
  const { bookDetails } = useDocViewContext()
  useEffect(() => {
    console.log(bookDetails)
  }, [bookDetails])

  return (
    <List>
      {bookDetails?.bookJobs.length === 0 && <ListItem>No summaries yet</ListItem>}
      {bookDetails?.bookJobs.map((job) => (
        <ListItem key={job.jobId}>
          <ListItemButton>
            <Stack direction="row" alignItems="center">
              <ListItemText primary={job.payload.bookId} secondary={job.status} />
              <IconButton>
                <DownloadIcon />
              </IconButton>
              <IconButton>
                <PreviewIcon />
              </IconButton>
            </Stack>
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  )
}
