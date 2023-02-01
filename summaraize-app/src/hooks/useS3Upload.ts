import {useEffect, useState} from 'react';
import {IFile, useUploadContext} from "../contexts/uploadContext";
import axios from "axios";

window.Buffer = window.Buffer || require("buffer").Buffer;


export const useS3Upload = (setStatusByFile: any) => {
    const [blobData, setBlobData] = useState<Blob>();
    const [uploadUrl, setUploadUrl] = useState<string>();
    const [file, setFile] = useState<IFile>();

    const signedUploadUrl = `${process.env.REACT_APP_INVOKE_URL}/${process.env.REACT_APP_STAGE}/signed/upload`
    //this is a function the takes an array of CognitoUserAttribute objects and returns the value of 'sub'
    const getSubAttribute = (attributes: any) => {
        return attributes.filter((attribute: any) =>
            attribute.getName() === 'sub')[0].getValue();
    }

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
        const customSignedUploadUrl = `${signedUploadUrl}?ft=${file.type}&fn=${file.name}`;
        setFile(file);
        const response = await axios({
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
    }

    return {uploadFile};
}
