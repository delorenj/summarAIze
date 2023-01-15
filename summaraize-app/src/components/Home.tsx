import React, {useEffect, useState} from 'react';
import {
    MDBContainer,
    MDBTabs,
    MDBTabsItem,
    MDBTabsLink,
    MDBTabsContent,
    MDBTabsPane,
    MDBBtn,
    MDBIcon,
    MDBInput,
    MDBCheckbox
}
    from 'mdb-react-ui-kit';
import LoginFormProvider from "./LoginFormProvider";
import {CoverLogin} from "./CoverLogin";
import {SplitLogin} from "./SplitLogin";

export const Home = () => {

    return (
        <LoginFormProvider>
            <SplitLogin/>
        </LoginFormProvider>
    );
}

export default Home;
