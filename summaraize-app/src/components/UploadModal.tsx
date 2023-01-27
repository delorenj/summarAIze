import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
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
            <Fade in={uploadDialogOpen}>
                <Box sx={{
                    position: 'relative',
                    width: '500px',
                    height: '650px',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    bgcolor: '#3c424b',
                    border: '0px solid #000',
                    color: 'white',
                    borderRadius: 2,
                    boxShadow: 24,
                    p: 0,
                }}>
                    <Grid container sx={{height: '450px'}}>
                        <Grid xs={12} className={'upload-modal-top'} p={0} m={0} overflow={'hidden'}>
                            <img src={'/girl-reading-2-5.png'} alt={'Summaraize logo'} style={{
                                width: '100%',
                                position: 'relative',
                                bottom: '0px',
                                left: '-170px',
                                padding: '0px',
                                margin: '0px',
                            }}/>

                        </Grid>
                        <Grid xs={12} sx={{backgroundColor: 'secondary'}}>
                            <Typography id="transition-modal-description" sx={{mt: 2}}>
                                Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
            </Fade>
        </Modal>
    );
}
