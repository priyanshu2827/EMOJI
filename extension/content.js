
/**
 * Sentinel Prime: Email Guard - Content Script
 * Intercepts 'Send' actions in Gmail to scan for steganography.
 */

console.log('🛡️ Sentinel Prime: Email Guard Active');

const SCAN_API_URL = 'http://localhost:3000/api/scan';

/**
 * Comprehensive Sanitization: Removes ZW chars, BIDI overrides, and exotic spaces.
 */
function comprehensiveClean(text) {
    if (!text) return '';
    // 1. Harmful Zero-Width and BIDI Control characters
    const harmfulChars = /[\u200B\u200C\u200E\u200F\u202A-\u202E\u2066-\u2069\uFEFF\u180E]/g;
    let cleaned = text.replace(harmfulChars, '');

    // 2. Exotic/Suspicious spaces (replaced with regular space)
    const exoticSpaces = /[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g;
    cleaned = cleaned.replace(exoticSpaces, ' ');

    return cleaned;
}

/**
 * Real-time detection: Periodically scan the compose window for hidden chars
 */
setInterval(() => {
    const editors = document.querySelectorAll('[role="textbox"]');
    editors.forEach(editor => {
        const text = editor.innerText;
        // Check for harmful chars specifically
        const harmfullZwChars = /[\u200B\u200C\u200E\u200F\uFEFF\u180E\u202A-\u202E\u2066-\u2069]/g;

        if (harmfullZwChars.test(text) && !editor.dataset.sentinelWarned) {
            console.warn('🛡️ Sentinel Prime: Hidden characters detected in editor!');
            editor.style.border = '2px solid #f97316'; // Orange instead of red (suspicious)
            editor.dataset.sentinelWarned = 'true';
            injectToast('Warning: Potential steganography detected in compose window.', 'warning', () => {
                // Clean function
                editor.innerText = comprehensiveClean(text);
                editor.style.border = '';
                injectToast('Text cleaned successfully.', 'info');
            });
        }
    });
}, 3000);

function injectToast(message, type = 'info', onClean = null) {
    // Check if toast already exists to avoid stacking
    const existing = document.querySelector('.sentinel-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'sentinel-toast';

    let bgColor = '#0369a1'; // Info
    if (type === 'danger') bgColor = '#ef4444';
    if (type === 'warning') bgColor = '#f97316';

    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 10000;
        font-family: sans-serif;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideIn 0.3s ease-out;
    `;

    toast.innerHTML = `
        <div style="display: flex; flex-direction: column;">
            <span style="font-weight: bold; font-size: 14px;">Sentinel Prime</span>
            <span style="font-size: 13px; opacity: 0.9;">${message}</span>
        </div>
    `;

    if (onClean) {
        const cleanBtn = document.createElement('button');
        cleanBtn.innerText = 'Clean Text';
        cleanBtn.style.cssText = `
            background: white;
            color: ${bgColor};
            border: none;
            padding: 4px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            font-size: 12px;
            white-space: nowrap;
        `;
        cleanBtn.addEventListener('click', () => {
            onClean();
            toast.remove();
        });
        toast.appendChild(cleanBtn);
    }

    document.body.appendChild(toast);

    // Auto-remove if not a high-risk warning
    if (!onClean) {
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.5s';
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    }
}

async function scanContent(text, images = []) {
    if (images.length > 0) {
        // Use Multipart for images
        const formData = new FormData();
        formData.append('text', text);
        for (let i = 0; i < images.length; i++) {
            formData.append('image', images[i]);
        }
        const response = await fetch(SCAN_API_URL, {
            method: 'POST',
            body: formData
        });
        return await response.json();
    } else {
        // Use JSON for text only
        const response = await fetch(SCAN_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        return await response.json();
    }
}

/**
 * Inbound Protection: Detect and scan opened emails
 */
const observedEmails = new WeakSet();

function scanInboundEmail(emailBody) {
    if (observedEmails.has(emailBody)) return;
    observedEmails.add(emailBody);

    const text = emailBody.innerText;
    if (!text) return;

    console.log('🛡️ Sentinel Prime: Scanning inbound email...');

    // Inline images in received emails
    const images = [];
    const imgElements = emailBody.querySelectorAll('img');
    imgElements.forEach(img => {
        if (img.src.startsWith('data:image') || img.src.includes('googleusercontent.com')) {
            // Note: External images might have CORS issues, but we try
            fetch(img.src).then(res => res.blob()).then(blob => images.push(blob)).catch(() => { });
        }
    });

    scanContent(text, images).then(result => {
        if (!result || result.error) {
            console.warn('Sentinel Prime: Scan failed or returned error', result?.error);
            return;
        }
        if (result.severity === 'HIGH-RISK' || result.severity === 'SUSPICIOUS') {
            injectInboundWarning(emailBody, result);
        }
    }).catch(err => {
        console.error('Inbound Scan Error:', err);
    });
}

function injectInboundWarning(emailBody, result) {
    if (!result) return;

    // Check if warning already exists
    if (emailBody.querySelector('.sentinel-inbound-warning')) return;

    const warning = document.createElement('div');
    warning.className = 'sentinel-inbound-warning';
    const isHighRisk = result.severity === 'HIGH-RISK';

    warning.style.cssText = `
        background: ${isHighRisk ? '#fef2f2' : '#fff7ed'};
        border-left: 4px solid ${isHighRisk ? '#ef4444' : '#f97316'};
        padding: 16px;
        margin-bottom: 12px;
        border-radius: 4px;
        color: ${isHighRisk ? '#991b1b' : '#9a3412'};
        font-family: sans-serif;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
    `;

    let reasonsText = Array.isArray(result.reasons) ? result.reasons.join(', ') : 'Unknown detection';
    if (result.findings?.link_analysis?.detected) {
        reasonsText += ' (Possible Phishing Links)';
    }

    const infoDiv = document.createElement('div');
    infoDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; font-weight: bold; margin-bottom: 4px;">
            <span>${isHighRisk ? '🚨 SECURITY ALERT' : '⚠️ SECURITY WARNING'}</span>
        </div>
        <div style="font-size: 14px;">
            Sentinel Prime has detected <strong>${result.severity}</strong> hidden data in this message.
            <br/><span style="font-size: 12px; opacity: 0.8;">Reasons: ${reasonsText}</span>
        </div>
    `;
    warning.appendChild(infoDiv);

    const sanitizeBtn = document.createElement('button');
    sanitizeBtn.innerText = 'Sanitize Content';
    sanitizeBtn.style.cssText = `
        background: ${isHighRisk ? '#ef4444' : '#f97316'};
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        font-size: 12px;
        white-space: nowrap;
    `;
    sanitizeBtn.onclick = () => {
        emailBody.innerText = comprehensiveClean(emailBody.innerText);
        warning.remove();
        injectToast('Email content has been sanitized.', 'info');
    };
    warning.appendChild(sanitizeBtn);

    emailBody.prepend(warning);
}

// Observe Gmail DOM for opened emails
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
            if (node.nodeType === 1) { // Element
                // .a3s is common, but let's be more robust
                const emailBodies = node.querySelectorAll('.a3s, [role="gridcell"] .ii.gt');
                emailBodies.forEach(scanInboundEmail);
                if (node.classList.contains('a3s')) scanInboundEmail(node);
            }
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });

/**
 * Initial scan for emails already present in the DOM
 */
function scanAllInitialEmails() {
    console.log('🛡️ Sentinel Prime: Performing initial scan for existing emails...');
    const emailBodies = document.querySelectorAll('.a3s, [role="gridcell"] .ii.gt');
    emailBodies.forEach(scanInboundEmail);
}

// Start initial scan after a short delay to let Gmail load
setTimeout(scanAllInitialEmails, 4000);

// Intercept clicks on the 'Send' button in Gmail
document.addEventListener('click', async (e) => {
    const target = e.target.closest('[role="button"]');
    if (target && (target.innerText === 'Send' || target.getAttribute('aria-label')?.includes('Send'))) {
        console.log('🔍 Intercepted Send Action. Scanning for steganography...');

        // Find the compose window
        const composeWindow = target.closest('.M9');
        if (!composeWindow) return;

        const editor = composeWindow.querySelector('[role="textbox"]');
        const text = editor ? editor.innerText : '';

        // Extract images (inline or attachments)
        const images = [];
        const imgElements = composeWindow.querySelectorAll('img');
        for (const img of imgElements) {
            if (img.src.startsWith('data:image')) {
                const res = await fetch(img.src);
                const blob = await res.blob();
                images.push(blob);
            }
        }

        if (!text && images.length === 0) return;

        injectToast('Performing Forensic Security Scan...');

        try {
            const result = await scanContent(text, images);

            if (result.severity === 'HIGH-RISK') {
                e.preventDefault();
                e.stopPropagation();
                injectToast('CRITICAL: High-risk data detected. Send blocked.', 'danger');

                let alertMsg = '🚨 SENTINEL PRIME ALERT: Security Threat Detected! \n\n';
                if (result.reasons.includes('homoglyph_links_detected')) {
                    alertMsg += '⚠️ PHISHING ALERT: Suspicious links detected (Homoglyph Attack).\n';
                    const links = result.findings.link_analysis.suspiciousLinks;
                    links.forEach(l => alertMsg += `  - ${l.domain} (looks like ${l.decoded})\n`);
                }
                if (result.reasons.includes('zero_width_characters_detected')) {
                    alertMsg += '⚠️ STEGANOGRAPHY ALERT: Hidden data detected in text.\n';
                }

                alertMsg += '\nDetails: ' + result.reasons.join(', ');
                alert(alertMsg);
            } else if (result.severity === 'SUSPICIOUS') {
                injectToast('Warning: Suspicious patterns detected. Exercise caution.', 'info');
            } else {
                injectToast('Email verified clean. Safe to send.');
            }
        } catch (error) {
            console.error('Sentinel Scan Error:', error);
            injectToast('Error: Unable to connect to Sentinel Prime Engine.');
        }
    }
}, true);
