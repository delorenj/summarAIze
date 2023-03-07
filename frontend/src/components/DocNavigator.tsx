import { useDocViewContext } from '../contexts/docViewContext'
import { Box, Tab, Tabs, Typography } from '@mui/material'
import { a11yProps, TabPanel } from './BasicTabs'
import React from 'react'
import { SummaryList } from './SummaryList'

export const DocNavigator = () => {
  const { bookDetails, activeTab, setActiveTab } = useDocViewContext()

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  return bookDetails ? (
    <>
      <Typography variant="h1">This Book is Boh</Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', textAlign: 'center' }}>
        <Tabs
          value={activeTab}
          onChange={handleChange}
          aria-label="Doc view navigator tabs"
          sx={{
            flex: 1,
            justifyContent: 'center',
          }}
          variant="fullWidth">
          <Tab label="Original Contents" {...a11yProps(0)} />
          <Tab label="Summaries" {...a11yProps(1)} />
          <Tab label="Summary Workspace" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <TabPanel value={activeTab} index={0}>
        <RenderDocument bookId={bookDetails.book.bookId} />
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        <SummaryList />
      </TabPanel>
      <TabPanel value={activeTab} index={2}>
        <SummaryWorkspace bookId={bookDetails.book.bookId} />
      </TabPanel>
    </>
  ) : null
}
