import React, {useContext} from 'react'
import {useNavigate} from 'react-router-dom'
import Grid from '@mui/material/Unstable_Grid2'
import {AuthContext} from '../contexts/authContext'
import Container from "@mui/material/Container";
import {useMyData} from "../hooks/useMyData";

import UploadContextProvider from "../contexts/uploadContext";
import UploadModal from "../components/UploadModal";
import {Stack} from "@mui/material";
import Typography from "@mui/material/Typography";

export const Upload = () => {
    const navigate = useNavigate()
    const auth = useContext(AuthContext)
    const {myBooks} = useMyData({skipCache: true});

    return (
        <UploadContextProvider>
            <main>
                <Container>
                    <Stack direction={"row"}>
                        <img src="/book-icon.png" alt="" width={"80"}/>
                        <Typography variant={'h6'} sx={{mt: 3}}>summarAIze</Typography>
                    </Stack>

                </Container>
                <Container sx={{py: 1}}>
                    <Grid container spacing={2}>
                        <UploadModal/>
                    </Grid>
                </Container>
            </main>
        </UploadContextProvider>
    );
}
