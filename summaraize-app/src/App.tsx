import React from 'react'
import './App.scss'

import { HashRouter as Router, Route, Switch } from 'react-router-dom'

import {
  createTheme,
  ThemeProvider,
  StyledEngineProvider,
  responsiveFontSizes,
  adaptV4Theme,
} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline'

import AuthProvider, { AuthIsSignedIn, AuthIsNotSignedIn } from './contexts/authContext'

import SignIn from './routes/auth/signIn'
import SignUp from './routes/auth/signUp'
import VerifyCode from './routes/auth/verify'
import RequestCode from './routes/auth/requestCode'
import ForgotPassword from './routes/auth/forgotPassword'
import ChangePassword from './routes/auth/changePassword'
import Landing from './routes/landing'
import Home from './routes/home'



let lightTheme = createTheme(adaptV4Theme({
  palette: {
    mode: 'light',
  },
}))
lightTheme = responsiveFontSizes(lightTheme)

// let darkTheme = createMuiTheme({
//   palette: {
//     mode: 'dark',
//   },
// })
// darkTheme = responsiveFontSizes(darkTheme)

const SignInRoute: React.FunctionComponent = () => (
  <Router>
    <Switch>
      <Route path="/signin" component={SignIn} />
      <Route path="/signup" component={SignUp} />
      <Route path="/verify" component={VerifyCode} />
      <Route path="/requestcode" component={RequestCode} />
      <Route path="/forgotpassword" component={ForgotPassword} />
      <Route path="/" component={Landing} />
    </Switch>
  </Router>
)

const MainRoute: React.FunctionComponent = () => (
  <Router>
    <Switch>
      <Route path="/changepassword" component={ChangePassword} />
      <Route path="/" component={Home} />
    </Switch>
  </Router>
)

const App: React.FunctionComponent = () => (
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <AuthProvider>
        <AuthIsSignedIn>
          <MainRoute />
        </AuthIsSignedIn>
        <AuthIsNotSignedIn>
          <SignInRoute />
        </AuthIsNotSignedIn>
      </AuthProvider>
    </ThemeProvider>
  </StyledEngineProvider>
)

export default App
