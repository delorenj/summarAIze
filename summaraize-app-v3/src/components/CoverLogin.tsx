import {
    MDBBtn,
    MDBCheckbox,
    MDBContainer,
    MDBIcon,
    MDBInput, MDBTabs,
    MDBTabsContent, MDBTabsItem,
    MDBTabsLink,
    MDBTabsPane
} from "mdb-react-ui-kit";
import {useState} from "react";
import {useLoginForm} from "../contexts/LoginFormContext";

export const CoverLogin = () => {    const [justifyActive, setJustifyActive] = useState('tab1');
    const {email, setEmail, password, setPassword} = useLoginForm()
    const handleJustifyClick = (value: string) => {
        if (value === justifyActive) {
            return;
        }

        setJustifyActive(value);
    };

    return (
        <MDBContainer className="p-3 my-5 d-xl-flex flex-column w-25">
            <MDBTabs pills justify className='mb-3 d-flex flex-row justify-content-between'>
                <MDBTabsItem>
                    <MDBTabsLink onClick={() => handleJustifyClick('tab1')} active={justifyActive === 'tab1'}>
                        Login
                    </MDBTabsLink>
                </MDBTabsItem>
                <MDBTabsItem>
                    <MDBTabsLink onClick={() => handleJustifyClick('tab2')} active={justifyActive === 'tab2'}>
                        Register
                    </MDBTabsLink>
                </MDBTabsItem>
            </MDBTabs>
            <MDBTabsContent>
                <MDBTabsPane show={justifyActive === 'tab1'}>
                    <div className="text-center mb-3">
                        <p>Sign in with:</p>

                        <div className='d-flex justify-content-between mx-auto' style={{width: '40%'}}>
                            <MDBBtn tag='a' color='none' className='m-1' style={{color: '#1266f1'}}>
                                <MDBIcon fab icon='facebook-f' size="sm"/>
                            </MDBBtn>

                            <MDBBtn tag='a' color='none' className='m-1' style={{color: '#1266f1'}}>
                                <MDBIcon fab icon='twitter' size="sm"/>
                            </MDBBtn>

                            <MDBBtn tag='a' color='none' className='m-1' style={{color: '#1266f1'}}>
                                <MDBIcon fab icon='google' size="sm"/>
                            </MDBBtn>

                            <MDBBtn tag='a' color='none' className='m-1' style={{color: '#1266f1'}}>
                                <MDBIcon fab icon='github' size="sm"/>
                            </MDBBtn>
                        </div>

                        <p className="text-center mt-3">or:</p>
                    </div>
                    <form autoComplete='off'>
                    <MDBInput wrapperClass='mb-4' label='Email' value={email} id='email' type='email' autoComplete='off' onChange={(e) => {setEmail(e.currentTarget.value)}}/>
                    <MDBInput wrapperClass='mb-4' label='Password' value={password} id='password' autoComplete='off' type='password'onChange={(e) => {setPassword(e.currentTarget.value)}} />
                    </form>
                    <div className="d-flex justify-content-between mx-4 mb-4">
                        <MDBCheckbox name='flexCheck' value='' id='flexCheckDefault' label='Remember me'/>
                        <a href="!#" style={ {fontSize: '1em'}}>Forgot password?</a>
                    </div>

                    <MDBBtn className="mb-4 w-100">Sign in</MDBBtn>
                    <p className="text-center">Not a member? <a href="#!">Register</a></p>

                </MDBTabsPane>

                <MDBTabsPane show={justifyActive === 'tab2'}>

                    <div className="text-center mb-3">
                        <p>Sign un with:</p>

                        <div className='d-flex justify-content-between mx-auto' style={{width: '40%'}}>
                            <MDBBtn tag='a' color='none' className='m-1' style={{color: '#1266f1'}}>
                                <MDBIcon fab icon='facebook-f' size="sm"/>
                            </MDBBtn>

                            <MDBBtn tag='a' color='none' className='m-1' style={{color: '#1266f1'}}>
                                <MDBIcon fab icon='twitter' size="sm"/>
                            </MDBBtn>

                            <MDBBtn tag='a' color='none' className='m-1' style={{color: '#1266f1'}}>
                                <MDBIcon fab icon='google' size="sm"/>
                            </MDBBtn>

                            <MDBBtn tag='a' color='none' className='m-1' style={{color: '#1266f1'}}>
                                <MDBIcon fab icon='github' size="sm"/>
                            </MDBBtn>
                        </div>

                        <p className="text-center mt-3">or:</p>
                    </div>

                    <MDBInput wrapperClass='mb-4' label='Name' id='register-name' type='text'/>
                    <MDBInput wrapperClass='mb-4' label='Username' id='register-username' type='text'/>
                    <MDBInput wrapperClass='mb-4' label='Email' id='register-email' type='email'/>
                    <MDBInput wrapperClass='mb-4' label='Password' id='register-password' type='password'/>

                    <div className='d-flex justify-content-center mb-4'>
                        <MDBCheckbox name='flexCheck' id='flexCheckDefault' label='I have read and agree to the terms'/>
                    </div>

                    <MDBBtn className="mb-4 w-100">Sign up</MDBBtn>

                </MDBTabsPane>

            </MDBTabsContent>

        </MDBContainer>
    )
}
