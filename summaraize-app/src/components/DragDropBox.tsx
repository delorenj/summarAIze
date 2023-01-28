import Box from "@mui/material/Box";
import {useMediaQuery} from "@mui/material";
import Dropzone, {useDropzone} from "react-dropzone";
import {useCallback} from "react";

export const DragDropBox = () => {
    const mediaQuery = useMediaQuery('(max-height: 800px)')
    
    const PortraitMode = () => (
        <Box sx={{
            border: '3px dashed #FeFeFe',
            bgcolor: 'rgba(245, 213, 241, 0.5)',
            borderRadius: '.6rem',
            position: 'absolute',
            left: '50%',
            alignSelf: 'center',
            padding: '10px',
            transition: 'all 0.2s ease-in-out',
            "&:hover": {
                bgcolor: 'rgba(245, 213, 241, 1)',
                boxShadow: '0 5px 15px rgba(145, 92, 182, .4)'
            }
        }}>Drop docs here</Box>
    );

    const LandscapeMode = () => (
        <Box sx={{
            border: '3px dashed #FeFeFe',
            bgcolor: 'rgba(245, 213, 241, 0.5)',
            borderRadius: '.6rem',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translateX(-176px)',
            padding: '10px',
            "&:hover": {
                bgcolor: 'rgba(245, 213, 241, 1)',
                boxShadow: '0 5px 15px rgba(145, 92, 182, .4)'
            }
        }}>Drop docs here</Box>
    );

    const Content = mediaQuery ? () => <LandscapeMode/> : () => <PortraitMode/>
    return (
        <Dropzone onDrop={acceptedFiles => console.log(acceptedFiles)}>
            {({getRootProps, getInputProps}) => (
                <section style={{display: 'flex'}}>
                    <div {...getRootProps()} style={{display: 'flex'}}>
                        <input {...getInputProps()} />
                        <Content/>
                    </div>
                </section>
            )}
        </Dropzone>

    )
};
