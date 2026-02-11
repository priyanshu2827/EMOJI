/**
 * stegoVeritas-Detector Library
 * Port of core heuristics from stegoVeritas (Python) to TypeScript.
 * Focuses on non-LSB anomalies and channel inconsistencies.
 */

export interface StegoVeritasResult {
    suspicious: boolean;
    trailingDataDetected: boolean;
    trailingDataSize: number;
    metadataAnomalies: string[];
    channelInconsistency: {
        detected: boolean;
        scores: { r: number; g: number; b: number };
    };
    reasons: string[];
}

/**
 * Detects data appended after the standard end-of-file (EOF) markers.
 */
export function detectTrailingData(buffer: ArrayBuffer, mimeType: string): { detected: boolean; size: number } {
    const bytes = new Uint8Array(buffer);
    let eofIndex = -1;

    if (mimeType.includes('png')) {
        // PNG EOF marker is the 'IEND' chunk followed by its CRC (8 bytes total)
        // Structure: [CRC (4)] IEND (4) [CRC (4)]
        // Actually, IEND marks the end of chunks.
        const iend = [0x49, 0x45, 0x4E, 0x44]; // 'IEND'
        for (let i = bytes.length - 8; i >= 0; i--) {
            if (bytes[i] === iend[0] && bytes[i + 1] === iend[1] && bytes[i + 2] === iend[2] && bytes[i + 3] === iend[3]) {
                eofIndex = i + 8; // IEND chunk + 4 bytes CRC
                break;
            }
        }
    } else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
        // JPEG EOF marker is FF D9
        for (let i = bytes.length - 2; i >= 0; i--) {
            if (bytes[i] === 0xFF && bytes[i + 1] === 0xD9) {
                eofIndex = i + 2;
                break;
            }
        }
    }

    if (eofIndex !== -1 && eofIndex < bytes.length - 4) {
        // We allow a few bytes of slack for common padding
        return { detected: true, size: bytes.length - eofIndex };
    }

    return { detected: false, size: 0 };
}

/**
 * Scans for unusual strings or markers in metadata/header sections.
 */
export function detectMetadataAnomalies(buffer: ArrayBuffer): string[] {
    const bytes = new Uint8Array(buffer);
    const anomalies: string[] = [];

    // Look for suspicious tool markers (e.g., 'STEG', 'SECRET', 'stegHide')
    // We'll convert chunk to string for easy regex matching
    const sampleSize = Math.min(bytes.length, 4096); // Check first 4KB
    const headerContent = String.fromCharCode(...bytes.slice(0, sampleSize));

    const suspiciousMarkers = [/stegHide/i, /OutGuess/i, /JPHIDE/i, /F5/i];
    for (const marker of suspiciousMarkers) {
        if (marker.test(headerContent)) {
            anomalies.push(`Known tool signature detected: ${marker.source}`);
        }
    }

    return anomalies;
}

/**
 * Compares LSB entropy across RGB channels to detect targeted embedding.
 */
export function analyzeRGBInconsistency(pixelData: number[]): { detected: boolean; scores: { r: number; g: number; b: number } } {
    if (pixelData.length < 3) return { detected: false, scores: { r: 0, g: 0, b: 0 } };

    const channels = { r: [] as number[], g: [] as number[], b: [] as number[] };
    for (let i = 0; i < pixelData.length; i += 3) {
        channels.r.push(pixelData[i]);
        channels.g.push(pixelData[i + 1]);
        channels.b.push(pixelData[i + 2]);
    }

    const getEntropy = (arr: number[]) => {
        const p1 = arr.reduce((sum, val) => sum + (val & 1), 0) / arr.length;
        if (p1 === 0 || p1 === 1) return 0;
        return -(p1 * Math.log2(p1) + (1 - p1) * Math.log2(1 - p1));
    };

    const scores = {
        r: getEntropy(channels.r),
        g: getEntropy(channels.g),
        b: getEntropy(channels.b)
    };

    const max = Math.max(scores.r, scores.g, scores.b);
    const min = Math.min(scores.r, scores.g, scores.b);

    // If one channel has significantly higher entropy than others (> 0.2 difference)
    // it suggests data might only be hidden in that channel.
    const detected = (max - min) > 0.2 && max > 0.8;

    return { detected, scores };
}

export function analyzeStegoVeritas(buffer: ArrayBuffer, pixelData: number[], mimeType: string): StegoVeritasResult {
    const trailing = detectTrailingData(buffer, mimeType);
    const anomalies = detectMetadataAnomalies(buffer);
    const inconsistency = analyzeRGBInconsistency(pixelData);

    const reasons: string[] = [];
    if (trailing.detected) reasons.push(`trailing_data_detected (${trailing.size} bytes)`);
    if (anomalies.length > 0) reasons.push('metadata_anomaly_markers_found');
    if (inconsistency.detected) reasons.push('rgb_channel_inconsistency_detected');

    return {
        suspicious: trailing.detected || anomalies.length > 0 || inconsistency.detected,
        trailingDataDetected: trailing.detected,
        trailingDataSize: trailing.size,
        metadataAnomalies: anomalies,
        channelInconsistency: inconsistency,
        reasons
    };
}
