import {useEffect, useState} from 'react';
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../contexts/authContext";
import {IFile} from "../../../types/summaraizeTypes";

window.Buffer = window.Buffer || require("buffer").Buffer;


export const useS3Upload = (setStatusByFile: any) => {
    const [blobData, setBlobData] = useState<Blob>();
    const [uploadUrl, setUploadUrl] = useState<string>();
    const [file, setFile] = useState<IFile>();
    const navigate = useNavigate();
    const {signOut} = useAuth();

    const signedUploadUrl = `${process.env.REACT_APP_INVOKE_URL}/${process.env.REACT_APP_STAGE}/signed/upload`

    useEffect(() => {
        console.log("Blob & Upload", blobData, uploadUrl);
        if (!blobData || !uploadUrl) return;
        const upload = async () => {
            console.log("About to call fetch on uploadUrl", uploadUrl);
            fetch(uploadUrl, {
                method: 'PUT',
                body: blobData
            }).then(() => {
                console.log("Setting file to complete (inner) for file", file);
                setStatusByFile(file as IFile, 'complete');

            });
            setBlobData(undefined);
            setUploadUrl(undefined);
        };
        console.log("About to upload file to S3", blobData, uploadUrl);
        upload().then(() => {
            console.log("Setting file to complete (outer)")
            setStatusByFile(file as IFile, 'complete');
            setFile(undefined);
        }).catch((err) => {
            console.log("Error uploading file to S3", err);
            setStatusByFile(file as IFile, 'error');
            setFile(undefined);
            setUploadUrl(undefined);
        });

    }, [blobData, uploadUrl, file]);
    const uploadFile = async (file: IFile) => {
        const customSignedUploadUrl = `${signedUploadUrl}?ft=${encodeURIComponent(file.type)}&fn=${encodeURIComponent(file.name)}`;
        setFile(file);
        let response = {};
        try {
            response = await axios({
                method: 'GET',
                url: customSignedUploadUrl,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('idToken')
                }
            });
            console.log("signedUploadURL Response:", response);

            // @ts-ignore
            setUploadUrl(response.data.uploadURL)

            const reader = new FileReader();
            // @ts-ignore
            reader.readAsArrayBuffer(file);
            reader.onloadend = function () {
                console.log("About to set blobData with reader result", reader.result)
                // @ts-ignore
                setBlobData(new Blob([reader.result], {type: file.type}));
            };
        } catch (e: any) {
            console.log("Error getting signedUploadURL", e);
            if (e.response.status === 401) {
                await signOut();
                navigate('/signin', {replace: true});
            }
        }

    }

    return {uploadFile};
}
