import { useHomeContext } from '../contexts/homeContext'
import { IconButton, List, ListItem, ListItemButton, Stack } from '@mui/material'
import { JobStatus } from '../types/summaraizeTypes'
import CircularProgressBar from './CircularProgressBar'
import DownloadIcon from '@mui/icons-material/Download'
import PreviewIcon from '@mui/icons-material/Preview'
import ListItemText from '@mui/material/ListItemText'
export const SummaryList = () => {
  const { activeBookJobs } = useHomeContext()

  return (
    <List>
      {!activeBookJobs() && <ListItem>No summaries yet</ListItem>}
      {activeBookJobs()
        ?.filter((summary) => summary.status === JobStatus.COMPLETED)
        .map((summary) => (
          <ListItem>
            <ListItemText>{summary.title}</ListItemText>
            <IconButton component="a" href="#balls" aria-label="download">
              <DownloadIcon />
            </IconButton>
            <IconButton component={'a'} href="#balls2" aria-label="view">
              <PreviewIcon />
            </IconButton>
          </ListItem>
        ))}
    </List>
  )
}
