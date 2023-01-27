import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Slide from '@mui/material/Slide';
import Typography from '@mui/material/Typography';
import {useUploadContext} from "../contexts/uploadContext";
import {useNavigate} from "react-router-dom";
import Grid from "@mui/material/Unstable_Grid2";

export default function UploadModal() {
    const {uploadDialogOpen} = useUploadContext();
    const navigate = useNavigate();
    return (
        <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            open={uploadDialogOpen}
            onClose={() => navigate('/')}
            closeAfterTransition
            style={{alignItems: 'center', justifyContent: 'center'}}

        >
            <Slide in={uploadDialogOpen} direction="up">
                <Box sx={{
                    position: 'absolute',
                    width: '500px',
                    left: '500px',
                    top: '200px',
                    bgcolor: 'background.paper',
                    border: '0px solid #000',
                    borderRadius: 2,
                    boxShadow: 24,
                    p: 4,
                }}>
                    <Grid container>
                        <Grid xs={12} lg={6} xl={12} sx={{backgroundColor: 'gray'}}>
                            <Typography id="transition-modal-title" variant="h6" component="h2">
                                Text in a modal
                            </Typography>
                        </Grid>
                        <Grid xs={12} lg={6} xl={12} sx={{backgroundColor: 'secondary'}}>
                            <Typography id="transition-modal-description" sx={{mt: 2}}>
                                Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
            </Slide>
        </Modal>
    );
}
