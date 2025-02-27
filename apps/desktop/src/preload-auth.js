const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  verifyDeviceCode: (code) => ipcRenderer.invoke('verify-device-code', code),
  closeAuthWindow: () => ipcRenderer.send('close-auth-window')
}) 