import {Box, Fade, Typography} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import {useUploadContext} from "../contexts/uploadContext";
import {DragDropBox} from "./DragDropBox";

export const PortraitModal = () => {
    const {uploadDialogOpen} = useUploadContext();
    return (
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
                            <DragDropBox />
                        </Grid>
                        <Grid xs={12} className={'upload-modal-bottom'} sx={{backgroundColor: 'secondary'}}>
                            <Typography id="transition-modal-description" sx={{mt: 2}}>
                                Portrait Jiggler
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
            </Fade>
    )
}
