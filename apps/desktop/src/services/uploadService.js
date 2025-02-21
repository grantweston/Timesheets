const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

let cachedToken = null;
let tokenExpiryTime = null;
const TOKEN_CACHE_DURATION = 55 * 60 * 1000; // 55 minutes in milliseconds

async function getAuthToken() {
  const now = Date.now();
  if (cachedToken && tokenExpiryTime && now < tokenExpiryTime) {
    return cachedToken;
  }

  try {
    const { stdout } = await execAsync('gcloud auth print-identity-token');
    cachedToken = stdout.trim();
    tokenExpiryTime = now + TOKEN_CACHE_DURATION;
    return cachedToken;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    throw error;
  }
}

async function uploadScreenshot(screenshot, userId, startTime, endTime) {
  try {
    const token = await getAuthToken();
    const response = await fetch('https://us-central1-transit-test-451402.cloudfunctions.net/uploadHandler', {
      method: 'POST',
      headers: {
        'Authorization': `bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Developer',
        screenshot: screenshot.toString('base64'),
        userId,
        startTime,
        endTime
      })
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('GCP Response:', responseData);
    return responseData;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

module.exports = {
  uploadScreenshot
}; 