import {useState} from 'react';
import AWS from 'aws-sdk';
import {useAuth} from "../contexts/authContext";
import {IFile} from "../contexts/uploadContext";

export const useS3Upload = () => {
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState(null);
    const {sessionInfo, attrInfo} = useAuth();
    const identityPoolId = process.env.REACT_APP_IDENTITY_POOL_ID;
    const userPoolId = process.env.REACT_APP_USERPOOL_ID;
    //this is a function the takes an array of CognitoUserAttribute objects and returns the value of 'sub'
    const getSubAttribute = (attributes: any) => {
        return attributes.filter((attribute: any) =>
            attribute.getName() === 'sub')[0].getValue();
    }
    const uploadFile = (file: IFile) => {
        const s3 = new AWS.S3({
            region: 'us-east-1',
            credentials: new AWS.CognitoIdentityCredentials({
                IdentityPoolId: identityPoolId as string,
                Logins: {
                    [`cognito-idp.us-east-1.amazonaws.com/${userPoolId}`]: sessionInfo?.idToken as string
                }
            })
        });
        console.log("AWS.S3", s3, sessionInfo);
        const attributes = attrInfo;
        console.log("attributes", attributes);
        const username = getSubAttribute(attributes);
        console.log("username", username);

        const params = {
            Bucket: process.env.REACT_APP_BOOK_BUCKET as string,
            Key: `${username}/${file.name}`,
            Body: file,
            ContentType: file.type
        };

        console.log("S3 params", params);

        s3.upload(params, (err: any, data: any) => {
            if (err) {
                setUploadError(err);
            } else {
                setUploadProgress(100);
            }
        }).on('httpUploadProgress', (progress) => {
            setUploadProgress(Math.round((progress.loaded * 100) / progress.total));
        });
    }

    return {uploadFile, uploadProgress, uploadError};
}
