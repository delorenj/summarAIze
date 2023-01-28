import {Box, Divider, Fade, Stack, Typography, useTheme} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import {useUploadContext} from "../contexts/uploadContext";
import {DragDropBox} from "./DragDropBox";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

export const PortraitModal = () => {

    const {uploadDialogOpen} = useUploadContext();
    return (
        <Fade in={uploadDialogOpen}>
            <Box sx={{
                position: 'relative',
                width: '500px',
                height: '700px',
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
                <Grid container sx={{height: '444px'}}>
                    <Grid xs={12} className={'upload-modal-top'} p={0} m={0} overflow={'hidden'} sx={{
                        display: 'flex',
                    }}>
                        <img src={'/girl-reading-2-5.png'} alt={'Summaraize logo'} style={{
                            width: '100%',
                            position: 'relative',
                            bottom: '-40px',
                            left: '-130px',
                            padding: '0px',
                            margin: '0px',
                        }}/>
                        <DragDropBox/>
                        <em style={{
                            flex: 'none',
                            width: '350px',
                            position: 'relative',
                            right: '283px',
                            margin: 'auto',
                            top: '46%',
                        }}>(Only *.jpeg and *.png images will be accepted)</em>
                    </Grid>
                </Grid>
                <Grid xs={6} className={'upload-modal-bottom'} sx={{
                    backgroundColor: 'secondary',
                    alignSelf: 'center',
                }}>
                    <Stack sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <Button sx={{
                            textTransform: 'inherit'
                        }}>
                            <DriveFolderUploadIcon sx={{mr: '10px'}}/>Choose a document
                        </Button>
                        <Divider sx={{
                            width: '35%',
                            "&::before, &::after": {
                                borderColor: "rgba(255, 255, 255, 0.35)",
                            }
                        }}>
                            <Typography sx={{
                                mx: '10px',
                            }}>or</Typography>
                        </Divider>
                        <TextField id="outlined-basic" label="Paste a URL" variant="outlined" sx={{
                            my: '10px',
                            color: 'white',
                            "#outlined-basic-label": {
                                color: 'white'
                            },
                            ".MuiFormLabel-root-MuiInputLabel-root": {
                                color: 'success.main',
                            },
                            "MuiInputBase-root-MuiOutlinedInput-root": {
                                color: 'white'
                            },
                            "MuiInputBase-root-MuiOutlinedInput-root-hover": {
                                color: 'white'
                            },
                            "MuiFormLabel-root-MuiInputLabel-root": {
                                color: 'white'
                            },
                        }} inputProps={{
                            style: {
                                color: 'white',
                            }
                        }}/>
                        <Divider sx={{
                            width: '35%',
                            "&::before, &::after": {
                                borderColor: "rgba(255, 255, 255, 0.35)",
                            }
                        }}>
                            <Typography sx={{
                                mx: '10px',
                            }}>or</Typography>
                        </Divider>
                        <Stack direction={'row'} spacing={4} p={4}>
                            <Button variant={"contained"}><img src="/Google_Drive_icon.png " alt="" width={40}/>Google
                                Drive</Button>
                            <Button variant={"contained"}><img src="/Dropbox_Icon.svg.png" alt=""
                                                               width={40}/>Dropbox</Button>
                        </Stack>
                    </Stack>
                </Grid>
            </Box>
        </Fade>
    )
}
