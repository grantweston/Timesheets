let wasOffline = false

async function checkConnectivity() {
  try {
    const response = await fetch('https://www.google.com', { timeout: 5000 })
    const isOnline = response.status === 200
    
    if (isOnline && wasOffline) {
      console.log('Back online, will try to upload buffered screenshots in next cycle')
    }
    
    wasOffline = !isOnline
    return isOnline
  } catch (error) {
    wasOffline = true
    return false
  }
}

module.exports = { checkConnectivity } 