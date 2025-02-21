const { app, Tray, Menu } = require('electron')
const path = require('path')

class TrayManager {
  constructor(win) {
    this.win = win
    this.tray = null
    this.isPaused = false
    this.latestSummary = 'No activity detected yet'
    this.screenshotInterval = null
  }

  init() {
    const iconPath = path.join(__dirname, '..', '..', 'assets', 'icon-screen.png')
    try {
      this.tray = new Tray(iconPath)
      if (process.platform === 'darwin') {
        this.tray.setIgnoreDoubleClickEvents(true)
      }
      this.tray.setToolTip('Capture App')
      this.updateMenu()
    } catch (error) {
      console.error('Failed to create tray icon:', error)
    }
  }

  updateSummary(summary) {
    this.latestSummary = summary
    this.updateMenu()
  }

  setScreenshotInterval(interval) {
    this.screenshotInterval = interval
  }

  updateMenu() {
    if (!this.tray) return
    
    const contextMenu = Menu.buildFromTemplate([
      { label: `Current Activity: ${this.latestSummary}`, enabled: false },
      { type: 'separator' },
      { 
        label: this.isPaused ? 'Resume Capturing' : 'Pause Capturing', 
        click: () => this.togglePause()
      },
      { label: 'Show App', click: () => this.win.show() },
      { label: 'Quit', click: () => app.quit() }
    ])
    
    this.tray.setContextMenu(contextMenu)
  }

  togglePause() {
    this.isPaused = !this.isPaused
    if (this.isPaused) {
      clearInterval(this.screenshotInterval)
      this.screenshotInterval = null
      this.tray.setImage(path.join(__dirname, '..', '..', 'assets', 'icon-idle.png'))
    } else {
      this.tray.setImage(path.join(__dirname, '..', '..', 'assets', 'icon-screen.png'))
    }
    this.updateMenu()
    return this.isPaused
  }
}

module.exports = { TrayManager } 