import React, { useState, useContext } from 'react'

import { useHistory } from 'react-router-dom'

import makeStyles from '@mui/styles/makeStyles';
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'

import { useValidEmail, useValidPassword, useValidPhone } from '../../hooks/useAuthHooks'
import { Email, Password, Phone } from '../../components/authComponents'

import { AuthContext } from '../../contexts/authContext'

const useStyles = makeStyles({
  root: {
    height: '100vh',
  },
})

const SignUp: React.FunctionComponent<{}> = () => {
  const classes = useStyles()

  const { email, setEmail, emailIsValid } = useValidEmail('')
  const { password, setPassword, passwordIsValid } = useValidPassword('')
  const { phone, setPhone, phoneIsValid } = useValidPhone('')
  const [error, setError] = useState('')
  const [created, setCreated] = useState(false)

  const isValid =
    !emailIsValid ||
    email.length === 0 ||
    !phoneIsValid ||
    phone.length === 0 ||
    !passwordIsValid ||
    password.length === 0

  const history = useHistory()

  const authContext = useContext(AuthContext)

  const signInClicked = async () => {
    try {
        if(phone.length === 10) {
            setPhone(phone)
        }
      await authContext.signUpWithEmail(phone, email, password)
      setCreated(true)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      }
    }
  }

  const signUp = (
    <>
      <Box width="80%" m={1}>
        <Email emailIsValid={emailIsValid} setEmail={setEmail} />
      </Box>
      <Box width="80%" m={1}>
        <Phone phoneIsValid={phoneIsValid} setPhone={setPhone} />
      </Box>
      <Box width="80%" m={1}>
        <Password label="Password" passwordIsValid={passwordIsValid} setPassword={setPassword} />
      </Box>
      <Box mt={2}>
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      </Box>

      {/* Buttons */}
      <Box mt={2}>
        <Grid container direction="row" justifyContent="center">
          <Box m={1}>
            <Button onClick={() => history.goBack()} color="secondary" variant="contained">
              Cancel
            </Button>
          </Box>
          <Box m={1}>
            <Button disabled={isValid} color="primary" variant="contained" onClick={signInClicked}>
              Sign Up
            </Button>
          </Box>
        </Grid>
      </Box>
    </>
  )

  const accountCreated = (
    <>
      <Typography variant="h5">{`Created ${phone} account`}</Typography>
      <Typography variant="h6">{`Verfiy Code sent to ${email}`}</Typography>

      <Box m={4}>
        <Button onClick={() => history.push('/verify')} color="primary" variant="contained">
          Verify Code
        </Button>
      </Box>
    </>
  )

  return (
    <Grid className={classes.root} container direction="row" justifyContent="center" alignItems="center">
      <Grid xs={11} sm={6} lg={4} container direction="row" justifyContent="center" alignItems="center" item>
        <Paper style={{ width: '100%', padding: 16 }}>
          <Grid container direction="column" justifyContent="center" alignItems="center">
            {/* Title */}
            <Box m={3}>
              <Grid container direction="row" justifyContent="center" alignItems="center">
                <Typography variant="h3">Sign Up</Typography>
              </Grid>
            </Box>

            {!created ? signUp : accountCreated}
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default SignUp
