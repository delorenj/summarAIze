import React, {useContext} from 'react';
import {HashRouter, Route, Routes} from 'react-router-dom';
import Landing from "./components/Landing";
import {Navigation} from "./components/Navigation";
import {DarkModeToggle} from "./components/DarkModeToggle";
import {Container, Row} from "react-bootstrap";
import AuthProvider, {AuthContext, AuthIsNotSignedIn, AuthIsSignedIn} from "./contexts/AuthContext";

export const App = () => {
    const auth = useContext(AuthContext)

    function signOutClicked() {
        auth.signOut()
        // history.push('/')
    }

    function changePasswordClicked() {
        // history.push('changepassword')
    }

    const SignInRoute: React.FunctionComponent = () => (
        <HashRouter>
            <Navigation/>
            <Container className='content'>
                <Row className={"d-flex justify-content-end"}>
                    <DarkModeToggle/>
                </Row>
                <Row>
                    <Routes>
                        <Route path="/signin" element={SignIn}/>
                        <Route path="/signup" element={SignUp}/>
                        <Route path="/verify" element={VerifyCode}/>
                        <Route path="/requestcode" element={RequestCode}/>
                        <Route path="/forgotpassword" element={ForgotPassword}/>
                        <Route path="/" element={<Landing />}/>
                    </Routes>
                </Row>
            </Container>
        </HashRouter>
    )

    const MainRoute: React.FunctionComponent = () => (
        <HashRouter>
            <Routes>
                <Route path="/changepassword" element={ChangePassword}/>
                <Route path="/" element={Landing}/>
            </Routes>
        </HashRouter>
    )

    return (
        <AuthProvider>
            <AuthIsSignedIn>
                <MainRoute/>
            </AuthIsSignedIn>
            <AuthIsNotSignedIn>
                <SignInRoute/>
            </AuthIsNotSignedIn>
        </AuthProvider>
    );
}
