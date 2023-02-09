import * as AWS from "aws-sdk";

const s3 = new AWS.S3();

export const handler = async (event:any) => {
    const fetch = async () => {
        try {
            const thefile = await s3
                .getObject({
                    Key: 'a-modern-utopia.epub',
                    Bucket: 'summaraize-book'
                })
                .promise();

            console.log("Got thefile!");
            console.log("Returning: ", thefile);
            return thefile;

        } catch (err) {
            console.log("Problem getting S3 object:", err);
        }
    };
    const object = await fetch();
    console.log("object", object);

    return {
        statusCode: 200,
        body: {
            object: JSON.stringify(object)
        }
    };
};
