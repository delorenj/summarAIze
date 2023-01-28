import {
    Box,
    Button, Divider,
    Fade,
    LinearProgress,
    linearProgressClasses,
    List,
    ListItem,
    Stack, TextField,
    Typography
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import {useUploadContext} from "../contexts/uploadContext";
import {DragDropBox} from "./DragDropBox";
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import {styled} from "@mui/material/styles";

const BorderLinearProgress = styled(LinearProgress)(({theme}) => ({
    height: 10,
    borderRadius: 5,
    width: '100px',
    [`&.${linearProgressClasses.colorPrimary}`]: {
        backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
    },
    [`& .${linearProgressClasses.bar}`]: {
        borderRadius: 5,
        backgroundColor: theme.palette.mode === 'light' ? '#1a90ff' : '#308fe8',
    },
}));

export const LandscapeModal = () => {
    const {uploadDialogOpen, acceptedFiles} = useUploadContext();
    return (
        <Fade in={uploadDialogOpen}>
            <Box sx={{
                position: 'relative',
                width: '850px',
                height: '350px',
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
                <Grid container sx={{height: '350px'}}>
                    <Grid xs={6} className={'upload-modal-left'} p={0} m={0} overflow={'hidden'}>
                        <img src={'/girl-reading-2-5.png'} alt={'Summaraize logo'} style={{
                            width: '100%',
                            position: 'relative',
                            bottom: '7px',
                            left: '-126px',
                            padding: '0px',
                            margin: '0px',
                        }}/>
                        <DragDropBox/>
                        <List sx={{
                            position: 'absolute',
                            left: '50%',
                            transform: 'translate(-160px, 50px)',
                            top: '50%',
                        }}>
                            {acceptedFiles.map((file: any) => (
                                <ListItem key={file.path} sx={{
                                    padding: '0px',
                                }}>
                                    <Stack>
                                        <Typography>{file.name}</Typography>
                                        <BorderLinearProgress variant="determinate" value={50}/>
                                    </Stack>
                                </ListItem>
                                ))}
                        </List>
                        <em style={{
                            flex: 'none',
                            width: '350px',
                            position: 'absolute',
                            left: '0',
                            margin: 'auto',
                            bottom: '0',
                        }}>(Only *.jpeg and *.png images will be accepted)</em>
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
                                <Button variant={"contained"}><img src="/Dropbox_Icon.svg.png" alt="" width={40}/>Dropbox</Button>
                            </Stack>
                        </Stack>
                    </Grid>
                </Grid>
            </Box>
        </Fade>
    )
}
