import React, {useState, FormEvent} from 'react';
import {Button, Card, Col, Container, Form, FormGroup, InputGroup, Row} from "react-bootstrap";
import {FormControl, FormLabel} from "react-bootstrap";
import {MDBBtn, MDBCheckbox, MDBCol, MDBContainer, MDBIcon, MDBInput, MDBRow} from "mdb-react-ui-kit";


const Home = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        console.log('Email:', email);
        console.log('Password:', password);
        // Add code to handle login here
    };

    return (
        <MDBContainer fluid className="p-3 my-5">
            <MDBRow>
                <MDBCol md='4' className="bg-gradient">
                    <img src="/girl-reading-2-5.png"
                         className="img-fluid" alt="Girl, reading a book"/>
                </MDBCol>
                <MDBCol md='4'>
                    <MDBInput wrapperClass='mb-4' label='Email address' id='formControlLg' type='email' size="lg"/>
                    <MDBInput wrapperClass='mb-4' label='Password' id='formControlLg' type='password' size="lg"/>
                    <div className="d-flex justify-content-between mx-4 mb-4">
                        <MDBCheckbox name='flexCheck' value='' id='flexCheckDefault' label='Remember me'/>
                        <a href="!#">Forgot password?</a>
                    </div>
                    <MDBBtn className="mb-4 w-100" size="lg">Sign in</MDBBtn>
                    <div className="divider d-flex align-items-center my-4">
                        <p className="text-center fw-bold mx-3 mb-0">OR</p>
                    </div>
                    <MDBBtn className="mb-4 w-100" size="lg" style={{backgroundColor: '#3b5998'}}>
                        <MDBIcon fab icon="facebook-f" className="mx-2"/>
                        Continue with facebook
                    </MDBBtn>
                    <MDBBtn className="mb-4 w-100" size="lg" style={{backgroundColor: '#55acee'}}>
                        <MDBIcon fab icon="google" className="mx-2"/>
                        Continue with Google
                    </MDBBtn>
                </MDBCol>
            </MDBRow>
        </MDBContainer>
    );
};

export default Home;
