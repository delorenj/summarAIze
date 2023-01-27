import * as React from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Slide from '@mui/material/Slide';
import Typography from '@mui/material/Typography';
import {useUploadContext} from "../contexts/uploadContext";
import {useNavigate} from "react-router-dom";

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    transition: 'transform 2s',
    bgcolor: 'background.paper',
    border: '0px solid #000',
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
};

export default function UploadModal() {
    const {uploadDialogOpen} = useUploadContext();
    const navigate = useNavigate();
    return (
        <div>
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                open={uploadDialogOpen}
                onClose={() => navigate('/')}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
            >
                <Slide in={uploadDialogOpen} direction="up" mountOnEnter unmountOnExit>
                    <Box sx={style}>
                        <Typography id="transition-modal-title" variant="h6" component="h2">
                            Text in a modal
                        </Typography>
                        <Typography id="transition-modal-description" sx={{mt: 2}}>
                            Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        </Typography>
                    </Box>
                </Slide>
            </Modal>
        </div>
    );
}
