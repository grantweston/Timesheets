// index.js
const express = require('express');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { CloudTasksClient } = require('@google-cloud/tasks');

const app = express();
app.use(express.json());

// Add cache variable at the top level
let cachedApiKey = null;

async function accessSecret(secretName) {
    // Return cached key if available
    if (secretName === "GEMINI_API_KEY" && cachedApiKey) {
        return cachedApiKey;
    }

    const client = new SecretManagerServiceClient();
    try {
        const [version] = await client.accessSecretVersion({
            name: `projects/transit-test-451402/secrets/${secretName}/versions/latest`,
        });
        // console.log(`Successfully retrieved secret: ${secretName}`);
        const secretValue = version.payload.data.toString('utf8');
        
        // Cache the API key
        if (secretName === "GEMINI_API_KEY") {
            cachedApiKey = secretValue;
        }
        
        return secretValue;
    } catch (error) {
        console.error(`Failed to retrieve secret ${secretName}:`, error);
        throw error;
    }
}

const tasksClient = new CloudTasksClient();

// Modified main endpoint to create a task
app.post('/', async (req, res) => {
    try {
        const { screenshot, userId, startTime, endTime } = req.body;
        
        // Log request body (excluding screenshot)
        const debugBody = { ...req.body };
        if (debugBody.screenshot) debugBody.screenshot = '[base64 image data]';
        console.log('Upload handler request body:', debugBody);
        
        if (!screenshot || !userId || !startTime || !endTime) {
            return res.status(400).json({ 
                status: 'error',
                message: 'Missing required fields' 
            });
        }

        // Send immediate response
        res.status(202).json({ 
            status: '202 accepted',
            message: 'Request queued for processing'
        });

        const project = 'transit-test-451402';
        const queue = 'gemini-queue';
        const location = 'us-central1';
        
        const parent = tasksClient.queuePath(project, location, queue);

        console.log('userId:', userId);
        console.log('startTime:', startTime);
        console.log('endTime:', endTime);
        console.log('screenshot:', screenshot);

        const task = {
            httpRequest: {
                httpMethod: 'POST',
                url: 'https://us-central1-transit-test-451402.cloudfunctions.net/processGeminiTask',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: Buffer.from(JSON.stringify({ 
                    screenshot,
                    userId,
                    startTime,
                    endTime
                })).toString('base64'),
            },
        };

        console.log('2 userId:', userId);
        console.log('2 startTime:', startTime);
        console.log('2 endTime:', endTime);
        console.log('2 screenshot:', screenshot);


        await tasksClient.createTask({ parent, task });
    } catch (err) {
        console.error('Error creating task:', err);
    }
});

// Simple get route to check if the server is running
app.get('/', (req, res) => {
  res.send("UploadHandler is live! Use POST /upload");
});

// For Cloud Functions
exports.uploadHandler = app;

