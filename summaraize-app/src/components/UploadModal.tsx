import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Typography from '@mui/material/Typography';
import {useUploadContext} from "../contexts/uploadContext";
import {useNavigate} from "react-router-dom";
import Grid from "@mui/material/Unstable_Grid2";
import {PortraitModal} from "./PortraitModal";
import {LandscapeModal} from "./LandscapeModal";
import {useMediaQuery} from "@mui/material";


export default function UploadModal() {
    const {uploadDialogOpen} = useUploadContext();
    const navigate = useNavigate();
    const mediaQuery = useMediaQuery('(max-height: 800px)')
    const CustomModal = mediaQuery ? () => <LandscapeModal /> : () => <PortraitModal />

    return (
        <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            open={uploadDialogOpen}
            onClose={() => navigate('/')}
            closeAfterTransition
            style={{alignItems: 'center', justifyContent: 'center'}}

        >
            <CustomModal />
        </Modal>
    );
}
