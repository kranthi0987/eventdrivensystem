import AWS from 'aws-sdk';

import dotenv from 'dotenv';
dotenv.config(); // for Production
import { CONFIG } from "./config/config";
const sqs = new AWS.SQS({ region: CONFIG.AWS_REGION });

const QUEUE_URL = CONFIG.SQS_QUEUE_URL;
// Load environment variables
// dotenv.config({ path: ['.env.dev', '.env'] }); // for development

export async function sendToQueue(event: any) {
    const params = {
        QueueUrl: QUEUE_URL,
        MessageBody: JSON.stringify(event)
    };
    await sqs.sendMessage(params).promise();
    console.log('Event sent to queue:', event);
}