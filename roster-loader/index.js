console.log('Loading function');

const aws = require('aws-sdk');
const s3 = new aws.S3({ apiVersion: '2006-03-01' });

const sqs = new aws.SQS({ apiVersion: "2012-11-05" });
const QUEUE_URL = process.env.QUEUE_URL;

exports.handler = async (event, context) => {

    // Get the object from the event and show its content type
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const params = {
        Bucket: bucket,
        Key: key,
    };
    try {
        const { ContentType, Body } = await s3.getObject(params).promise();
        const players = JSON.parse(Body.toString());
        const playerPuts = players.map(player => {
            const {PlayerID, Number,FirstName,LastName,Position,PositionCategory,TeamID,Team} = player;
            const param = {
              PutRequest:{
                  Item: {
                     PlayerID,
                     Number,
                     FirstName,
                     LastName,
                     Position,
                     PositionCategory,
                     TeamID,
                     Team
                  }
              }
            };
            return param;
        })

        const batchSize = 25;
        const batched = playerPuts.reduce((acc,curr,index) => {
            const chunkIndex = Math.floor(index/batchSize);

            if(!acc[chunkIndex]) {
                acc[chunkIndex] = [] // start a new chunk
            }

            acc[chunkIndex].push(curr)

            return acc
        },[]);


        // const batchParams={
        //   MessageBody: JSON.stringify({
        //       RequestItems: {
        //         Players: batched[0]
        //       }
        //     }),
        //     QueueUrl: QUEUE_URL,
        // };

        // await sqs.sendMessage(batchParams).promise();

        const sqsBatchSize = 10;
        let id = 0;
        const sqsBatch = batched.reduce((acc,curr,index)=> {
            const chunkIndex = Math.floor(index/sqsBatchSize);
            if(!acc[chunkIndex]) {
                acc[chunkIndex] = {
                    Entries:[]
                } // start a new chunk
            }
            id++;
            acc[chunkIndex].Entries.push({
                Id: id.toString(),
                MessageBody: JSON.stringify({
                      RequestItems: {
                        Players: curr
                      }
                    })
            });
            return acc;
        },[]);


        const myPromises = sqsBatch.map( requests => {
            const batchParams = {
                Entries: requests.Entries,
                QueueUrl: QUEUE_URL,
            }

            return sqs.sendMessageBatch(batchParams).promise();
        })

        await Promise.all(myPromises).catch(err => console.log(err));


        return ContentType;
    } catch (err) {
        console.log(err);
        const message = `Error getting object ${key} from bucket ${bucket}. Make sure they exist and your bucket is in the same region as this function.`;
        console.log(message);
        throw new Error(message);
    }
};
