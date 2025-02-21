const { app, desktopCapturer } = require('electron')
const path = require('path')
const fs = require('fs')

async function captureScreen() {
  try {
    // Only capture the primary display
    const sources = await desktopCapturer.getSources({ 
      types: ['screen'],
      thumbnailSize: { width: 1920, height: 1080 },
      fetchWindowIcons: false
    })
    
    const primarySource = sources[0]
    if (!primarySource) {
      throw new Error('No screen source found')
    }

    const buffer = primarySource.thumbnail.toPNG()

    // Explicitly clean up
    primarySource.thumbnail = null
    sources.forEach(source => {
      if (source.thumbnail) source.thumbnail = null
    })

    return buffer
  } catch (error) {
    console.error('Screenshot failed:', error)
    throw error
  }
}

function saveScreenshot(buffer) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const screenshotPath = path.join(app.getPath('desktop'), 'screenshots')
  
  if (!fs.existsSync(screenshotPath)) {
    fs.mkdirSync(screenshotPath)
  }

  const filePath = path.join(screenshotPath, `screenshot-${timestamp}.png`)
  fs.writeFileSync(filePath, buffer)
  return filePath
}

module.exports = { captureScreen, saveScreenshot } 