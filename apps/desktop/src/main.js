const { app, BrowserWindow, ipcMain } = require('electron')
const { SCREENSHOT_INTERVAL, ENABLE_GEMINI_ANALYSIS, ENABLE_SCREENSHOTS } = require('./config')
const { captureScreen, saveScreenshot } = require('./services/screenshotService')
const { checkConnectivity } = require('./services/networkService')
const { uploadScreenshot } = require('./services/uploadService')
const { TrayManager } = require('./utils/trayManager')
const path = require('path')
const os = require('os')
const crypto = require('crypto')

let win = null
let trayManager = null
let networkCheckInterval = null
let authWindow = null

// Generate a unique device ID using hostname and a random UUID
const deviceId = crypto.createHash('sha256')
  .update(`${os.hostname()}-${crypto.randomUUID()}`)
  .digest('hex')

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
    const screenshot = await captureScreen()
    
    if (ENABLE_GEMINI_ANALYSIS) {
      try {
        const startTime = new Date().toISOString()
        const endTime = startTime
        await uploadScreenshot(screenshot, global.userId, startTime, endTime)
        trayManager.updateSummary('Screenshot uploaded successfully')
      } catch (error) {
        console.error('Upload failed:', error)
        const savedPath = saveScreenshot(screenshot)
        console.log('Screenshot saved locally:', savedPath)
        trayManager.updateSummary('Error uploading screenshot - saved locally')
      }
    } else {
      const savedPath = saveScreenshot(screenshot)
      console.log('Screenshot saved locally (Gemini analysis disabled):', savedPath)
      trayManager.updateSummary('Screenshot saved locally')
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
    console.log('Sending verification request to Supabase edge function...')
    const response = await fetch('https://zdaugjexoekzsjxrelee.supabase.co/functions/v1/validate-link-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        code,
        device_id: deviceId
      })
    });

    const data = await response.json();
    console.log('Edge function response:', data)
    if (data.code === 'SUCCESS') {
      global.userId = data.data.user_id;
      startScreenshotCycle();
      return { success: true };
    }
    console.log('Verification failed: Invalid code')
    return { success: false, error: 'Invalid code' };
  } catch (error) {
    console.error('Edge function verification failed:', error);
    return { success: false, error: 'Connection failed' };
  }
}

// Add this handler for the preload bridge
ipcMain.handle('verify-device-code', async (event, code) => {
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
  
  // Start screenshot cycle only if enabled
  if (ENABLE_SCREENSHOTS) {
    console.log('Starting screenshot cycle...')
    const interval = setInterval(startScreenshotCycle, SCREENSHOT_INTERVAL)
    trayManager.setScreenshotInterval(interval)
  } else {
    console.log('Screenshot mechanism is disabled')
    trayManager.updateSummary('Screenshot capture disabled')
  }

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