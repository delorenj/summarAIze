import React, {useContext} from 'react'
import {useNavigate} from 'react-router-dom'
import Grid from '@mui/material/Unstable_Grid2'
import {AuthContext} from '../contexts/authContext'
import ResponsiveAppBar from "../components/AppBar";
import Container from "@mui/material/Container";
import StickyFooter from "../components/StickyFooter";
import {useMyData} from "../hooks/useMyData";
import {BookCard} from "../components/BookCard";
import HomeContextProvider from "../contexts/homeContext";
import {Button, Modal, Stack} from "@mui/material";
import {Add, Logout} from "@mui/icons-material";
import Typography from "@mui/material/Typography";
import UploadContextProvider from "../contexts/uploadContext";
import UploadModal from "../components/UploadModal";

export const Upload = () => {
    const navigate = useNavigate()
    const auth = useContext(AuthContext)
    const {myBooks} = useMyData();

    return (
        <UploadContextProvider>
            <ResponsiveAppBar />
            <main>
                <Container sx={{py: 1}}>
                    <Grid container spacing={2}>
                        <UploadModal />
                    </Grid>
                </Container>
            </main>
        </UploadContextProvider>
    );
}
