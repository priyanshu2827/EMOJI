
document.getElementById('checkNow').addEventListener('click', () => {
    // Open the main dashboard in a new tab
    chrome.tabs.create({ url: 'http://localhost:3000' });
});

// Update status if needed (could check if backend is reachable)
async function checkBackendStatus() {
    try {
        const response = await fetch('http://localhost:3000/api/scan', {
            method: 'OPTIONS'
        });
        if (response.ok) {
            console.log('Sentinel Prime Backend is reachable.');
        }
    } catch (e) {
        console.warn('Sentinel Prime Backend is offline or unreachable.');
        // Update UI to show offline state if desired
    }
}

checkBackendStatus();
