import Box from "@mui/material/Box";
import {useMediaQuery} from "@mui/material";
import Dropzone, {DropzoneRef, useDropzone} from "react-dropzone";
import {createRef, Ref, useCallback, useEffect} from "react";
import {useUploadContext} from "../contexts/uploadContext";
import {VERTICAL_BREAKPOINT} from "../constants";

export const DragDropBox = () => {
        const mediaQuery = useMediaQuery(`(max-height: ${VERTICAL_BREAKPOINT}px)`)
        const {addAcceptedFiles, acceptedFiles} = useUploadContext();

        const accept = {
            'application/epub+zip': [],
            'application/pdf': [],
            'text/plain': [],
            'application/vnd.openxmlformats': [],
            'application/x-mobipocket-ebook': [],
        }

        const onDrop = useCallback((acceptedFiles: any) => {
            console.log("File drop!", acceptedFiles);
            addAcceptedFiles(acceptedFiles);
        }, []);

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
            <Dropzone onDrop={onDrop} accept={accept}
                      maxFiles={3 - acceptedFiles.length} disabled={acceptedFiles.length > 2}>
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
    }
;
