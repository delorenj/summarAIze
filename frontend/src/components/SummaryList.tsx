// SummaryList.tsx
import React, { useState, useEffect } from 'react'
import { IconButton, List, ListItem, ListItemButton, Stack, LinearProgress, Box } from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import PreviewIcon from '@mui/icons-material/Preview'
import ListItemText from '@mui/material/ListItemText'
import { useDocViewContext } from '../contexts/docViewContext'
import { ISummaryJobStatus } from '../types/summaraizeTypes'
import { SummaryView } from './SummaryView'

export const SummaryList: React.FC = () => {
  const { bookDetails, getSummaryFromBookDetailsByJobId } = useDocViewContext()
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  useEffect(() => {
    console.log(bookDetails)
  }, [bookDetails])

  const handlePreviewClick = (event: React.MouseEvent, jobId: string) => {
    event.stopPropagation()
    setExpandedRow(expandedRow === jobId ? null : jobId)
  }

  const renderJobDescription = (job: ISummaryJobStatus) => {
    return (
      (job.payload.selectedChapters.length > 1 ? 'Summaries' : 'Summary') +
      ' of ' +
      (job.payload.selectedChapters.length > 1 ? 'chapters ' : 'chapter ') +
      job.payload.selectedChapters.map((c) => c.index).join(', ')
    )
  }
  return (
    <List>
      {bookDetails?.bookJobs.length === 0 && <ListItem>No summaries yet</ListItem>}
      {bookDetails?.bookJobs
        ?.filter((job) => job.status !== 'FAILED')
        .map((job: ISummaryJobStatus) => (
          <React.Fragment key={job.jobId}>
            <ListItem>
              <ListItemButton>
                <Stack direction="row" alignItems="center">
                  <ListItemText primary={renderJobDescription(job)} secondary={job.status} />
                  <IconButton>
                    <DownloadIcon />
                  </IconButton>
                  <IconButton onClick={(event) => handlePreviewClick(event, job.jobId)}>
                    <PreviewIcon />
                  </IconButton>
                </Stack>
              </ListItemButton>
            </ListItem>
            {expandedRow === job.jobId && <SummaryView summaryJob={getSummaryFromBookDetailsByJobId(job.jobId)} />}
          </React.Fragment>
        ))}
    </List>
  )
}
