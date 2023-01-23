import React from 'react'
import './App.scss'

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

import {
  createTheme,
  ThemeProvider,
  StyledEngineProvider,
  responsiveFontSizes,
} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline'

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import SignIn from './routes/auth/signIn'
import SignUp from './routes/auth/signUp'
import VerifyCode from './routes/auth/verify'
import RequestCode from './routes/auth/requestCode'
import ForgotPassword from './routes/auth/forgotPassword'
import ChangePassword from './routes/auth/changePassword'
import Landing from './routes/landing'
import {Home} from './routes/home'
import AuthProvider, {AuthIsNotSignedIn, AuthIsSignedIn} from "./contexts/authContext";

let lightTheme = createTheme(({
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
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/verify" element={<VerifyCode />} />
      <Route path="/requestcode" element={<RequestCode />} />
      <Route path="/forgotpassword" element={<ForgotPassword />} />
      <Route path="/" element={<Landing />} />
    </Routes>
  </Router>
)

const MainRoute: React.FunctionComponent = () => (
  <Router>
    <Routes>
      <Route path="/changepassword" element={<ChangePassword />} />
      <Route path="/" element={<Home />} />
    </Routes>
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
