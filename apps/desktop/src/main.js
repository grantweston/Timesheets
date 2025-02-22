const { app, BrowserWindow, ipcMain } = require('electron')
const { SCREENSHOT_INTERVAL } = require('./config')
const { captureScreen, saveScreenshot } = require('./services/screenshotService')
const { checkConnectivity } = require('./services/networkService')
const { uploadScreenshot } = require('./services/uploadService')
const { TrayManager } = require('./utils/trayManager')
const path = require('path')
const os = require('os')


let win = null
let trayManager = null
let networkCheckInterval = null
let authWindow = null

// TODO: This should be set after OAuth login with Clerk
// For now using a placeholder. This needs to be replaced with the actual user ID
// from the Clerk OAuth flow when the user logs in with Google/Microsoft
global.userId = "123e4567-e89b-12d3-a456-426614174000";

function createWindow() {
  win = new BrowserWindow({
    width: 400,
    height: 500,
    webPreferences: {
      preload: path.join(__dirname, 'preload-auth.js')
    }
  });

  win.loadFile('src/auth.html');
}

async function startScreenshotCycle() {
  try {
    /* Meeting detection to be implemented later
    const [isInZoom, isInMeet] = await Promise.all([
      isInZoomMeeting(),
      isInGoogleMeet()
    ])

    if (isInZoom) {
      console.log('User is currently in a Zoom meeting')
    } else if (isInMeet) {
      console.log('User is currently in a Google Meet')
    } else {
      console.log('User is not in any video meetings')
    }
    */
    
    // console.log('Taking screenshot...')
    const screenshot = await captureScreen()
    // console.log('Screenshot captured, analyzing with Gemini...')
    try {
      const startTime = new Date().toISOString()
      const endTime = startTime // For now, using same time since it's instant
      await uploadScreenshot(screenshot, global.userId, startTime, endTime)
      trayManager.updateSummary('Screenshot uploaded successfully')
    } catch (error) {
      console.error('Upload failed:', error)
      const savedPath = saveScreenshot(screenshot)
      console.log('Screenshot saved locally:', savedPath)
      trayManager.updateSummary('Error uploading screenshot - saved locally')
    }
  } catch (error) {
    console.error('Screenshot capture failed:', error)
  }
}

function createAuthWindow() {
  authWindow = new BrowserWindow({
    width: 400,
    height: 500,
    webPreferences: {
      preload: path.join(__dirname, 'preload-auth.js')
    }
  });

  authWindow.loadFile('src/auth.html');
}

async function verifyPairingCode(code) {
  try {
    const response = await fetch('YOUR_API_URL/api/device-pairing/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        code,
        deviceName: os.hostname()
      })
    });

    const data = await response.json();
    if (data.success) {
      global.userId = data.userId;
      startScreenshotCycle();
      return { success: true };
    }
    return { success: false, error: 'Invalid code' };
  } catch (error) {
    console.error('Verification failed:', error);
    return { success: false, error: 'Connection failed' };
  }
}

// Add this handler for the preload bridge
ipcMain.handle('verifyDeviceCode', async (event, code) => {
  return await verifyPairingCode(code);
});

ipcMain.on('close-auth-window', () => {
  if (authWindow) {
    authWindow.close();
    authWindow = null;
  }
});

app.whenReady().then(async () => {
  createWindow()
  
  trayManager = new TrayManager(win)
  trayManager.init()
  
  // Initial network check
  console.log('Starting network monitoring...')
  await checkConnectivity()
  
  // Start screenshot cycle
  const interval = setInterval(startScreenshotCycle, SCREENSHOT_INTERVAL)
  trayManager.setScreenshotInterval(interval)

  // Check network connectivity every 30 seconds
  networkCheckInterval = setInterval(() => {
    checkConnectivity().catch(err => {
      console.error('Network check interval failed:', err)
    })
  }, 30000)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  if (trayManager && trayManager.screenshotInterval) {
    clearInterval(trayManager.screenshotInterval)
  }
  if (networkCheckInterval) {
    clearInterval(networkCheckInterval)
  }
}) 