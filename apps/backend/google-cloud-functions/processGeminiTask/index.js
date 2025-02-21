const { createClient } = require('@supabase/supabase-js');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const express = require('express');

const app = express();
app.use(express.json());

// Cache for all secrets
const secretsCache = new Map();

async function accessSecret(secretName) {
    // Return cached secret if available
    if (secretsCache.has(secretName)) {
        return secretsCache.get(secretName);
    }

    const client = new SecretManagerServiceClient();
    try {
        const [version] = await client.accessSecretVersion({
            name: `projects/transit-test-451402/secrets/${secretName}/versions/latest`,
        });
        const secretValue = version.payload.data.toString('utf8');
        
        // Cache the secret
        secretsCache.set(secretName, secretValue);
        
        return secretValue;
    } catch (error) {
        console.error(`Failed to retrieve secret ${secretName}:`, error);
        throw error;
    }
}

exports.processGeminiTask = async (req, res) => {
    try {

        const [supabaseUrl, supabaseKey] = await Promise.all([
            accessSecret('SUPABASE_URL'),
            accessSecret('SUPABASE_KEY')
        ]);

        // Log request body (excluding screenshot)
        const debugBody = { ...req.body };
        if (debugBody.screenshot) debugBody.screenshot = '[base64 image data]';
        console.log('Process Gemini task request body:', debugBody);

        const supabase = createClient(supabaseUrl, supabaseKey);
        
        const geminiKey = await accessSecret('GEMINI_API_KEY');
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const { screenshot, userId, startTime, endTime } = req.body;

        console.log('userId:', userId);
        console.log('startTime:', startTime);
        console.log('endTime:', endTime);

        const result = await model.generateContent([
            {
                inlineData: { data: screenshot, mimeType: "image/jpeg" }
            },
            "Give me a 5 word summary of this screenshot"
        ]);

        const response = await result.response;
        const analysis = response.text();

        console.log("🔥 Time block created with Gemini analysis: ", analysis);

        // Store in time_blocks table
        const { data, error } = await supabase
            .from('time_blocks')
            .insert([
                { 
                    user_id: userId,
                    start_time: startTime,
                    end_time: endTime,
                    task_label: analysis,
                    is_billable: true, // default to billable
                    classification: {
                        raw_analysis: analysis,
                        source: 'gemini'
                    },
                    created_at: new Date().toISOString()
                }
            ]);

        if (error) throw error;

        console.log("🔥 Time block created on Supabase: ", data[0]);

        return res.status(200).json({ 
            status: 'success',
            timeBlock: data[0],
            analysis
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ 
            status: 'error',
            message: error.message
        });
    }
};
