
const aws = require('aws-sdk');

aws.config.update({
    accessKeyId: 'dummy',
    secretAccessKey: 'dummy',
    region:'us-east-2',
})

const s3 = new aws.S3({
    endpoint: `http://localhost:4566`, // This two lines are
    s3ForcePathStyle: true,                                     // only needed for LocalStack.
});

exports.handler = async (event, context) => {
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const params = {
        Bucket: bucket,
        Key: key,
    };
    console.log(context)
    try {
        const { ContentType,Body } = await s3.getObject(params).promise();
        console.log(JSON.parse(Body.toString()));
        return ContentType;
    } catch (err) {
        console.log(err);
        const message = `Error getting object ${key} from bucket ${bucket}. Make sure they exist and your bucket is in the same region as this function.`;
        console.log(message);
        throw new Error(message);
    }
};