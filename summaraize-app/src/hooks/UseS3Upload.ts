import { useState } from 'react';
import AWS from 'aws-sdk';
import {useAuth} from "../contexts/authContext";
import {IFile} from "../contexts/uploadContext";
export function useS3Upload() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const {sessionInfo} = useAuth();
  const identityPoolId = process.env.IDENTITY_POOL_ID;
  const userPoolId = process.env.USER_POOL_ID;
  const uploadFile = (file: IFile) => {
    const s3 = new AWS.S3({
      region: 'us-east-1',
      credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: identityPoolId || "ass",
        Logins: {
          [`cognito-idp.us-east-1.amazonaws.com/${userPoolId}`]: sessionInfo?.idToken || "balls"
        }
      })
    });
    console.log("AWS.S3", s3, sessionInfo);

    const params = {
      Bucket: 'your-bucket-name',
      Key: `${sessionInfo?.username}/${file.name}`,
      Body: file,
      ContentType: file.type
    };

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

  return { uploadFile, uploadProgress, uploadError };
}
