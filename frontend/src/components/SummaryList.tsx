// SummaryList.tsx
import React, { useState, useEffect } from 'react'
import { IconButton, List, ListItem, ListItemButton, Stack, LinearProgress, Box } from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import PreviewIcon from '@mui/icons-material/Preview'
import ListItemText from '@mui/material/ListItemText'
import { useDocViewContext } from '../contexts/docViewContext'
import { useSummaries } from '../hooks/useSummaries'
import { ISummaryJobStatus } from '../types/summaraizeTypes'

export const SummaryList: React.FC = () => {
  const { bookDetails } = useDocViewContext()
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const { data, loading } = useSummaries(expandedRow)

  useEffect(() => {
    console.log(bookDetails)
  }, [bookDetails])

  const handlePreviewClick = (event: React.MouseEvent, jobId: string) => {
    event.stopPropagation()
    setExpandedRow(expandedRow === jobId ? null : jobId)
  }

  return (
    <List>
      {bookDetails?.bookJobs.length === 0 && <ListItem>No summaries yet</ListItem>}
      {bookDetails?.bookJobs.map((job: ISummaryJobStatus) => (
        <React.Fragment key={job.jobId}>
          <ListItem>
            <ListItemButton>
              <Stack direction="row" alignItems="center">
                <ListItemText primary={job.payload.bookId} secondary={job.status} />
                <IconButton>
                  <DownloadIcon />
                </IconButton>
                <IconButton onClick={(event) => handlePreviewClick(event, job.jobId)}>
                  <PreviewIcon />
                </IconButton>
              </Stack>
            </ListItemButton>
          </ListItem>
          {expandedRow === job.jobId && (
            <ListItem>
              {loading ? (
                <Box sx={{ width: '100%' }}>
                  <LinearProgress />
                </Box>
              ) : (
                <ListItemText primary={data} />
              )}
            </ListItem>
          )}
        </React.Fragment>
      ))}
    </List>
  )
}
