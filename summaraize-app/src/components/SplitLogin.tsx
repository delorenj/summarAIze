import {
    MDBBtn,
    MDBCheckbox, MDBCol,
    MDBContainer,
    MDBIcon,
    MDBInput, MDBRow, MDBTabs,
    MDBTabsContent, MDBTabsItem,
    MDBTabsLink,
    MDBTabsPane
} from "mdb-react-ui-kit";
import {useState} from "react";
import {useLoginForm} from "../contexts/LoginFormContext";

export const SplitLogin = () => {
    const [justifyActive, setJustifyActive] = useState('tab1');
    const {email, setEmail, password, setPassword} = useLoginForm()
    const handleJustifyClick = (value: string) => {
        if (value === justifyActive) {
            return;
        }

        setJustifyActive(value);
    };

    return (
        <MDBContainer className="my-5 gradient-form">
            <MDBRow>
                <MDBCol col='6' className="mb-5">
                    <div className="d-flex flex-column ms-5">
                        <div className="text-center">
                            <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/lotus.webp"
                                 style={{width: '185px'}} alt="logo"/>
                            <h4 className="mt-1 mb-5 pb-1">We are The Lotus Team</h4>
                        </div>
                        <p>Please login to your account</p>
                        <MDBInput wrapperClass='mb-4' label='Email address' id='form1' type='email'/>
                        <MDBInput wrapperClass='mb-4' label='Password' id='form2' type='password'/>
                        <div className="text-center pt-1 mb-5 pb-1">
                            <MDBBtn className="mb-4 w-100">Sign in</MDBBtn>
                            <a className="text-muted" href="#!">Forgot password?</a>
                        </div>

                        <div className="d-flex flex-row align-items-center justify-content-center pb-4 mb-4">
                            <p className="mb-0">Don't have an account?</p>
                            <MDBBtn outline className='mx-2' color='danger'>
                                Danger
                            </MDBBtn>
                        </div>
                    </div>
                </MDBCol>
                <MDBCol col='6' className="mb-5">
                    <div className="d-flex flex-column  justify-content-center gradient-custom-2 h-100 mb-4">

                    </div>
                </MDBCol>
            </MDBRow>
        </MDBContainer>
    )
}
