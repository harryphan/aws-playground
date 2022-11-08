const aws = require('aws-sdk');
const docClient = new aws.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const requests = JSON.parse(event.Records[0].body);
    
    await docClient.batchWrite(requests).promise();
    
    const response = {
        statusCode: 200,
        body: "OK",
    };
    return response;
};
