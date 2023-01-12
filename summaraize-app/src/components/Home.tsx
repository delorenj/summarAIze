import React, { useState, FormEvent } from 'react';
import {Button, Col, Container, Form, FormGroup, InputGroup, Row} from "reactstrap";
import {themes, useTheme} from "../contexts/ThemeContext";
import {FormControl, FormLabel} from "react-bootstrap";

const Home = () => {
  const {theme, changeTheme} = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [darkMode, setDarkMode] = useState<boolean>(true);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    console.log('Email:', email);
    console.log('Password:', password);
    // Add code to handle login here
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col xs={6}>
          <InputGroup>
              <Button
                color="link"
                onClick={() => {
                  setDarkMode(!darkMode);
                  changeTheme(darkMode ? themes.light : themes.dark);
                }}
              >
                <i className={darkMode ? 'fas fa-sun' : 'fas fa-moon'}></i>
                <span className="d-lg-none d-md-block">Switch mode</span>
              </Button>
          </InputGroup>
          <Form onSubmit={handleSubmit}>
            <FormGroup controlId="formBasicEmail">
              <FormLabel>Email address</FormLabel>
              <FormControl
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </FormGroup>

            <FormGroup controlId="formBasicPassword">
              <FormLabel>Password</FormLabel>
              <FormControl
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </FormGroup>

            <Button variant="primary" type="submit">
              Login
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
