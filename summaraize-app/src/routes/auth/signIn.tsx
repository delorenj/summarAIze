import React, {useContext, useState} from 'react'

import {useHistory} from 'react-router-dom'
import makeStyles from '@mui/styles/makeStyles';
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'

import {useValidEmail, useValidPassword} from '../../hooks/useAuthHooks'
import {Email, Password} from '../../components/authComponents'

import {AuthContext} from '../../contexts/authContext'
import {Checkbox, FormControlLabel, Link} from "@mui/material";

const useStyles = makeStyles({
    root: {
        height: '100vh',
    },
    hover: {
        '&:hover': {cursor: 'pointer'},
    },
})

function Copyright(props: any) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © '}
            <Link color="inherit" href="https://mui.com/">
                summarAIze
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

const SignIn: React.FunctionComponent<{}> = () => {
    const classes = useStyles()

    const {email, setEmail, emailIsValid} = useValidEmail('')
    const {password, setPassword, passwordIsValid} = useValidPassword('')
    const [error, setError] = useState('')

    const isValid = !emailIsValid || email.length === 0 || !passwordIsValid || password.length === 0

    const history = useHistory()

    const authContext = useContext(AuthContext)

    const signInClicked = async () => {
        try {
            await authContext.signInWithEmail(email, password)
            history.push('home')
        } catch (err: any) {
            if (err.code === 'UserNotConfirmedException') {
                history.push('verify')
            } else {
                setError(err.message)
            }
        }
    }

    const passwordResetClicked = async () => {
        history.push('requestcode')
    }
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        console.log({
            email: data.get('email'),
            password: data.get('password'),
        });
    };
    return (
        <Grid container component="main" sx={{height: '100vh'}}>
            <Grid
                item
                xs={false}
                sm={4}
                md={7}
                sx={{
                    backgroundImage: 'url(http://localhost:3000/bg-book-2.png)',
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: (t) =>
                        t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />
            <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                <Box
                    sx={{
                        my: 8,
                        mx: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <img width='100' src='./book-icon.png'/>
                    <Typography component="h1" variant="h5">
                        Sign in
                    </Typography>
                    <Box component="form" noValidate onSubmit={handleSubmit} sx={{mt: 1}}>
                        <Box mb={2}>
                            <Email emailIsValid={emailIsValid} setEmail={setEmail}/>
                        </Box>
                        <Box mb={0}>
                            <Password label="Password" passwordIsValid={passwordIsValid} setPassword={setPassword}/>
                        </Box>
                        <Box width="100%" m={1}>
                            <Grid container direction="row" justifyContent="flex-start" alignItems="center">
                                <Box onClick={passwordResetClicked} mt={2}>
                                    <Typography className={classes.hover} variant="body2">
                                        Forgot Password?
                                    </Typography>
                                </Box>
                            </Grid>
                        </Box>
                        <FormControlLabel
                            control={<Checkbox value="remember" color="primary"/>}
                            label="Remember me"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{mt: 3, mb: 2}}
                            onClick={signInClicked}
                        >
                            Sign In
                        </Button>
                        <Grid container>
                            <Grid item>
                                <Link variant="body2" onClick={() => history.push('signup')}>
                                    {"Don't have an account? Sign Up"}
                                </Link>
                            </Grid>
                        </Grid>
                        <Copyright sx={{mt: 5}}/>
                    </Box>
                </Box>
            </Grid>
        </Grid>
    );
}

export default SignIn
