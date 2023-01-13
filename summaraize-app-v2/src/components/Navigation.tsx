import React, {useState, FormEvent} from 'react';
import {Button, Col, Container, Form, FormGroup, InputGroup, Nav, Navbar, Row} from "react-bootstrap";
import {useTheme} from "../contexts/ThemeContext";
import {FormControl, FormLabel} from "react-bootstrap";
import Home from "./Home";

export const Navigation = () => {
    const {theme} = useTheme();
    return (
        <>
            <Navbar collapseOnSelect expand='sm' bg={theme} variant={theme}>
                <Container>
                    <Navbar.Brand href="#">summarAIze</Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav"/>
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className="mr-auto">
                            <Nav.Link href="#home">Home</Nav.Link>
                            <Nav.Link href="#about">About</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    );
};
