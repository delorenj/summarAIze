import * as React from 'react';
import Modal from '@mui/material/Modal';
import {useUploadContext} from "../contexts/uploadContext";
import {useNavigate} from "react-router-dom";
import {PortraitModal} from "./PortraitModal";
import {LandscapeModal} from "./LandscapeModal";
import {useMediaQuery} from "@mui/material";
import {VERTICAL_BREAKPOINT} from "../constants";

export default function UploadModal() {
    const {uploadDialogOpen} = useUploadContext();
    const navigate = useNavigate();
    const mediaQuery = useMediaQuery(`(max-height: ${VERTICAL_BREAKPOINT}px)`)
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
