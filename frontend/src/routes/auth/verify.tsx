import React, { useState, useContext } from 'react'

import { useNavigate } from 'react-router-dom'

import makeStyles from '@mui/styles/makeStyles';
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'

import { useValidCode, useValidEmail } from '../../hooks/useAuthHooks'
import { Code, Email } from '../../components/authComponents'

import { AuthContext } from '../../contexts/authContext'
import {sendCode} from "../../libs/cognito";

const useStyles = makeStyles({
  root: {
    height: '100vh',
  },
  hover: {
    '&:hover': { cursor: 'pointer' },
  },
})

const VerifyCode: React.FunctionComponent<{}> = () => {
  const classes = useStyles()

  const { email, setEmail, emailIsValid } = useValidEmail('')
  const { code, setCode, codeIsValid } = useValidCode('')
  const [error, setError] = useState('')

  const isValid = !emailIsValid || email.length === 0 || !codeIsValid || code.length === 0

  const navigate = useNavigate()

  const authContext = useContext(AuthContext)

  const resendClicked = async () => {
    try {
      console.log("Sending again...")
      await sendCode(email)
    } catch(err) {
      setError('Error resending code')
    }
  }

  const sendClicked = async () => {
    try {
      await authContext.verifyCode(email, code)
      navigate('signin')
    } catch (err) {
      setError('Invalid Code')
    }
  }

  const passwordResetClicked = async () => {
    navigate('/resetpassword')
  }

  return (
    <Grid className={classes.root} container direction="row" justifyContent="center" alignItems="center">
      <Grid xs={11} sm={6} lg={4} container direction="row" justifyContent="center" alignItems="center" item>
        <Paper style={{ width: '100%', padding: 32 }}>
          <Grid container direction="column" justifyContent="center" alignItems="center">
            {/* Title */}
            <Box m={2}>
              <Typography variant="h3">Send Code</Typography>
            </Box>

            {/* Sign In Form */}
            <Box width="80%" m={1}>
              {/* <Email emailIsValid={emailIsValid} setEmail={setEmail} /> */}
              <Email emailIsValid={emailIsValid} setEmail={setEmail} />{' '}
            </Box>
            <Box width="80%" m={1}>
              <Code codeIsValid={codeIsValid} setCode={setCode} />
              <Grid container direction="row" justifyContent="flex-start" alignItems="center">
                <Box onClick={resendClicked} mt={2}>
                  <Typography className={classes.hover} variant="body2">
                    Resend Code
                  </Typography>
                  <Box mt={2}>
                    <Typography color="error" variant="body2">
                      {error}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Box>

            {/* Buttons */}
            <Box mt={2}>
              <Grid container direction="row" justifyContent="center">
                <Box m={1}>
                  <Button color="secondary" variant="contained" onClick={() => navigate(-1)}>
                    Cancel
                  </Button>
                </Box>
                <Box m={1}>
                  <Button disabled={isValid} color="primary" variant="contained" onClick={sendClicked}>
                    Send
                  </Button>
                </Box>
              </Grid>
            </Box>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default VerifyCode
