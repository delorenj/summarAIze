import { useDocViewContext } from '../contexts/docViewContext'
import { Box, Tab, Tabs, Typography } from '@mui/material'
import { a11yProps, TabPanel } from './BasicTabs'
import React from 'react'
import { SummaryList } from './SummaryList'
import { RenderDocument } from './RenderDocument'
import { SummaryWorkspace } from './SummaryWorkspace'
import { ActionPanel } from "./ActionPanel";

export const DocNavigator = () => {
  const { bookDetails, activeTab, setActiveTab } = useDocViewContext()

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  return bookDetails ? (
    <>
      <Typography variant="h2">{bookDetails.book.title}</Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', textAlign: 'center' }}>
        <Tabs
          value={activeTab}
          onChange={handleChange}
          aria-label="Doc view navigator tabs"
          sx={{
            flex: 1,
            justifyContent: 'center',
          }}>
          <Tab label="Summary Workspace" {...a11yProps(0)} />
          <Tab label="Summaries" {...a11yProps(1)} />
          <Tab label="Original Contents" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <TabPanel value={activeTab} index={0}>
        <ActionPanel />
        {/*<RenderDocument book={bookDetails.book} />*/}
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        <SummaryList />
      </TabPanel>
      <TabPanel value={activeTab} index={2}>
        <SummaryWorkspace book={bookDetails.book} />
      </TabPanel>
    </>
  ) : null
}
