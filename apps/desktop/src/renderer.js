// Add pairing UI state
let isPairing = false;

function showPairingUI() {
  isPairing = true;
  const container = document.querySelector('.container');
  container.innerHTML = `
    <h1>Enter Pairing Code</h1>
    <div class="input-group">
      <input type="text" id="pairingCode" maxlength="6" pattern="\\d{6}" placeholder="Enter 6-digit code" />
    </div>
    <button id="verifyBtn" class="primary-button">Verify</button>
    <p id="pairingStatus" class="status-message"></p>
  `;

  const codeInput = document.getElementById('pairingCode');
  const verifyBtn = document.getElementById('verifyBtn');
  const status = document.getElementById('pairingStatus');

  verifyBtn.addEventListener('click', async () => {
    const code = codeInput.value;
    if (code.length !== 6) {
      status.textContent = 'Please enter a 6-digit code';
      return;
    }

    status.textContent = 'Verifying...';
    const result = await window.electron.invoke('verify-pairing-code', code);
    
    if (result.success) {
      status.textContent = 'Successfully paired!';
      // Start the app
      window.electron.send('start-capture');
    } else {
      status.textContent = 'Invalid code. Please try again.';
    }
  });
}

// Modify the existing init function to handle pairing
async function init() {
  if (!await window.electron.invoke('is-paired')) {
    showPairingUI();
    return;
  }
  
  // ... existing auth logic ...
}

init(); 