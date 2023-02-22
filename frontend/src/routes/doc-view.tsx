import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import Grid from '@mui/material/Unstable_Grid2'
import { AuthContext } from '../contexts/authContext'
import ResponsiveAppBar from '../components/AppBar'
import Container from '@mui/material/Container'
import StickyFooter from '../components/StickyFooter'
import DocViewContextProvider from '../contexts/docViewContext'
import { BigDocCard } from '../components/BigDocCard'
import { DocNavigator } from '../components/DocNavigator'
export const DocView = () => {
  const navigate = useNavigate()
  const auth = useContext(AuthContext)

  return (
    <DocViewContextProvider>
      <ResponsiveAppBar />
      <main>
        <Container>
          <Grid container sx={{ py: 3 }}>
            <Grid xs={4}>
              <BigDocCard />
            </Grid>
            <Grid xs={8}>
              <DocNavigator />
            </Grid>
          </Grid>
        </Container>
      </main>
      <StickyFooter />
    </DocViewContextProvider>
  )
}
