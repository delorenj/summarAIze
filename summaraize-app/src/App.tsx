import React from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Home from "./components/Home";
import {Navigation} from "./components/Navigation";
import {DarkModeToggle} from "./components/DarkModeToggle";
import {Container, Row} from "react-bootstrap";

export const App = () => {
    return (
        <BrowserRouter>
            <Navigation/>
            <Container className='content'>
                <Row className={"d-flex justify-content-end"}>
                    <DarkModeToggle/>
                </Row>
                <Row>
                    <Routes>
                        <Route path='/' element={<Home/>}/>
                    </Routes>
                </Row>

            </Container>

        </BrowserRouter>

    );
}
