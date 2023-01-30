import {useState} from 'react';
import {useAuth} from "../contexts/authContext";
import {IFile} from "../contexts/uploadContext";
import S3 from 'react-aws-s3';
window.Buffer = window.Buffer || require("buffer").Buffer;


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
            console.log("chops");

        // const s3 = new AWS.S3({
        //     region: 'us-east-1',
        //     credentials: new AWS.CognitoIdentityCredentials({
        //         secretAccessKey: process.env.REACT_APP_AWS_CLIENTUSER_CLIENT_KEY,
        //         IdentityPoolId: identityPoolId as string,
        //         Logins: {
        //             [`cognito-idp.us-east-1.amazonaws.com/${userPoolId}`]: sessionInfo?.idToken as string
        //         }
        //     })
        // });
        const username = getSubAttribute(attrInfo);

        const config = {
            bucketName: process.env.REACT_APP_BOOK_BUCKET as string,
            dirName: username,
            // region: 'us-east-1',
            accessKeyId: process.env.REACT_APP_AWS_CLIENTUSER_CLIENT_KEY,
            secretAccessKey: process.env.REACT_APP_AWS_CLIENTUSER_CLIENT_SECRET,
        };


        console.log("S3 params", config);
        const s3upload = new S3(config);

        s3upload.uploadFile(file).then((data: any) => {
            console.log(data);
            if (data.status === 204) {
                console.log("success");

            } else {
                console.log("fail");
             }
        }).catch((err: any) => {
            console.log(err);
            setUploadError(err);
        });
    }

    return {uploadFile, uploadProgress, uploadError};
}
