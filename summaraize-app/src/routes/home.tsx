import React, { useContext } from 'react'

import { useNavigate } from 'react-router-dom'

import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Unstable_Grid2'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import GitHubIcon from '@mui/icons-material/GitHub'
import Link from '@mui/material/Link'

import logoImage from './logo.png'

import { AuthContext } from '../contexts/authContext'
import ResponsiveAppBar from "../components/AppBar";

export const Home = () => {
  const navigate = useNavigate()
  const auth = useContext(AuthContext)

  function signOutClicked() {
    auth.signOut()
    navigate('/')
  }

  function changePasswordClicked() {
    navigate('changepassword')
  }

  return (
    <Grid container>
      <ResponsiveAppBar />
      <Grid container direction="column" justifyContent="center" alignItems="center">
        <Box>Hi</Box>
      </Grid>
    </Grid>
  );
}
