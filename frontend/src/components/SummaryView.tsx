// SummaryView.tsx
import ListItemText from '@mui/material/ListItemText'
import { IChapterSummary, ISummaryJobStatus } from '../types/summaraizeTypes'
import React, { useEffect } from 'react'
import { ListItem } from '@mui/material'

interface SummaryViewProps {
  summaryJob: ISummaryJobStatus
}
export const SummaryView = ({ summaryJob }: SummaryViewProps) => {
  useEffect(() => {
    console.log(summaryJob.summaries)
  }, [])

  return (
    <>
      {summaryJob?.summaries?.map((chapterSummary: IChapterSummary) => (
        <ListItem key={`chapter-summary-${chapterSummary.chapterIndex}`}>
          {/* Define the type of the chapter text */}
          <ListItemText
            secondary={chapterSummary.text}
            primary={<h1>Chapter {chapterSummary.chapterIndex} Summary</h1>}
          />
        </ListItem>
      ))}
    </>
  )
}
