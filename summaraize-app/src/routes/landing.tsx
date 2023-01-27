import React from 'react'

import { useNavigate } from 'react-router-dom'

import makeStyles from '@mui/styles/makeStyles';

import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'

import logoImage from './book-icon.png'

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
  },
  title: {
    textAlign: 'center',
  },
}))

const Landing: React.FunctionComponent = () => {
  const classes = useStyles()

  const navigate = useNavigate()

  const signIn = () => {
    navigate('/signin')
  }

  return (
    <Grid container className='bg'>
      <Grid className={classes.root} container direction="column" justifyContent="center" alignItems="center">
        <Box m={2}>
          <img src={logoImage} width={224} height={224} alt="logo" />
        </Box>
        <Box m={2}>
          <Link underline="none" color="inherit" href="https://summaraize.io">
            <Grid container direction="row" justifyContent="center" alignItems="center">
              <Typography className={classes.title} variant="h3">
                summarAIze
              </Typography>
            </Grid>
          </Link>
        </Box>
        <Box m={2}>
          <Button onClick={signIn} variant="contained" color="primary">
            SIGN IN
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
}

export default Landing
