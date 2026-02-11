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
    bitPlaneAnomaly: boolean;
    channelInconsistency: {
        detected: boolean;
        scores: { r: number; g: number; b: number };
    };
    shadowChunks: {
        detected: boolean;
        chunks: string[];
    };
    entropyMap: number[];
    filterAnomaly: boolean;
    frameDelayAnomaly: {
        detected: boolean;
        variance: number;
    };
    reasons: string[];
}

export function detectTrailingData(buffer: ArrayBufferLike, mimeType: string): { detected: boolean; size: number } {
    const bytes = new Uint8Array(buffer);
    let eofIndex = -1;
    if (mimeType.includes('png')) {
        const iend = [0x49, 0x45, 0x4E, 0x44];
        for (let i = bytes.length - 8; i >= 0; i--) {
            if (bytes[i] === iend[0] && bytes[i + 1] === iend[1] && bytes[i + 2] === iend[2] && bytes[i + 3] === iend[3]) {
                eofIndex = i + 8;
                break;
            }
        }
    } else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
        for (let i = bytes.length - 2; i >= 0; i--) {
            if (bytes[i] === 0xFF && bytes[i + 1] === 0xD9) {
                eofIndex = i + 2;
                break;
            }
        }
    }
    if (eofIndex !== -1 && eofIndex < bytes.length - 4) return { detected: true, size: bytes.length - eofIndex };
    return { detected: false, size: 0 };
}

export function detectMetadataAnomalies(buffer: ArrayBufferLike): string[] {
    const bytes = new Uint8Array(buffer);
    const anomalies: string[] = [];
    const sampleSize = Math.min(bytes.length, 4096);
    const headerContent = String.fromCharCode(...bytes.slice(0, sampleSize));
    const suspiciousMarkers = [/stegHide/i, /OutGuess/i, /JPHIDE/i, /F5/i];
    for (const marker of suspiciousMarkers) {
        if (marker.test(headerContent)) anomalies.push(`Known tool signature detected: ${marker.source}`);
    }
    return anomalies;
}

export function detectShadowChunks(buffer: ArrayBufferLike): { detected: boolean; chunks: string[] } {
    const bytes = new Uint8Array(buffer);
    const standardChunks = new Set(['IHDR', 'PLTE', 'IDAT', 'IEND', 'tRNS', 'cHRM', 'gAMA', 'iCCP', 'sBIT', 'sRGB', 'pHYs', 'sPLT', 'tIME', 'iTXt', 'tEXt', 'zTXt', 'bKGD', 'hIST']);
    const found: string[] = [];
    let pos = 8;
    while (pos < bytes.length - 8) {
        const length = (bytes[pos] << 24) | (bytes[pos + 1] << 16) | (bytes[pos + 2] << 8) | bytes[pos + 3];
        const type = String.fromCharCode(bytes[pos + 4], bytes[pos + 5], bytes[pos + 6], bytes[pos + 7]);
        if (!/^[a-zA-Z]{4}$/.test(type)) break;
        if (!standardChunks.has(type)) found.push(type);
        pos += 12 + length;
    }
    return { detected: found.length > 0, chunks: found };
}

export function calculateEntropyMap(buffer: ArrayBufferLike): number[] {
    const bytes = new Uint8Array(buffer);
    const chunkSize = 1024;
    const map: number[] = [];
    for (let i = 0; i < bytes.length; i += chunkSize) {
        const slice = bytes.slice(i, i + chunkSize);
        const freq = new Array(256).fill(0);
        for (const b of slice) freq[b]++;
        let entropy = 0;
        for (const f of freq) {
            if (f > 0) {
                const p = f / slice.length;
                entropy -= p * Math.log2(p);
            }
        }
        map.push(entropy / 8);
    }
    return map;
}

export function detectFilterAnomaly(buffer: ArrayBufferLike): boolean {
    const bytes = new Uint8Array(buffer);
    let idatContent: number[] = [];
    let pos = 8;
    while (pos < bytes.length - 8) {
        const length = (bytes[pos] << 24) | (bytes[pos + 1] << 16) | (bytes[pos + 2] << 8) | bytes[pos + 3];
        const type = String.fromCharCode(bytes[pos + 4], bytes[pos + 5], bytes[pos + 6], bytes[pos + 7]);
        if (type === 'IDAT') for (let i = 0; i < Math.min(length, 100); i++) idatContent.push(bytes[pos + 8 + i]);
        pos += 12 + length;
    }
    if (idatContent.length < 50) return false;
    const freq = new Array(256).fill(0);
    for (const b of idatContent) freq[b]++;
    const variance = freq.reduce((sum, f) => sum + Math.pow(f - (idatContent.length / 256), 2), 0) / 256;
    return variance < 0.05;
}

export function analyzeFrameDelays(buffer: ArrayBufferLike): { detected: boolean; variance: number } {
    const bytes = new Uint8Array(buffer);
    const delays: number[] = [];
    for (let i = 0; i < bytes.length - 5; i++) {
        if (bytes[i] === 0x21 && bytes[i + 1] === 0xF9) {
            const delay = bytes[i + 4] | (bytes[i + 5] << 8);
            if (delay > 0) delays.push(delay);
        }
    }
    for (let i = 0; i < bytes.length - 28; i++) {
        if (String.fromCharCode(bytes[i], bytes[i + 1], bytes[i + 2], bytes[i + 3]) === 'fcTL') delays.push(bytes[i + 20] | (bytes[i + 21] << 8));
    }
    if (delays.length < 5) return { detected: false, variance: 0 };
    const mean = delays.reduce((a, b) => a + b, 0) / delays.length;
    const variance = delays.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / delays.length;
    return { detected: variance > 0.5, variance };
}

export function analyzeRGBInconsistency(pixelData: number[]): { detected: boolean; scores: { r: number; g: number; b: number } } {
    if (pixelData.length < 3) return { detected: false, scores: { r: 0, g: 0, b: 0 } };
    const channels = { r: [] as number[], g: [] as number[], b: [] as number[] };
    for (let i = 0; i < pixelData.length; i += 3) {
        channels.r.push(pixelData[i]);
        channels.g.push(pixelData[i + 1]);
        channels.b.push(pixelData[i + 2]);
    }
    const getLsbEntropy = (arr: number[]) => {
        const p1 = arr.reduce((sum, val) => sum + (val & 1), 0) / arr.length;
        if (p1 === 0 || p1 === 1) return 0;
        return -(p1 * Math.log2(p1) + (1 - p1) * Math.log2(1 - p1));
    };
    const scores = { r: getLsbEntropy(channels.r), g: getLsbEntropy(channels.g), b: getLsbEntropy(channels.b) };
    const max = Math.max(scores.r, scores.g, scores.b);
    const min = Math.min(scores.r, scores.g, scores.b);
    return { detected: (max - min) > 0.15 && max > 0.85, scores };
}

export function detectBitPlaneAnomaly(pixelData: number[]): boolean {
    if (pixelData.length < 1000) return false;
    let correlationBit01 = 0;
    const sampleSize = Math.min(pixelData.length, 10000);
    for (let i = 0; i < sampleSize; i++) if ((pixelData[i] & 1) === ((pixelData[i] >> 1) & 1)) correlationBit01++;
    const density = correlationBit01 / sampleSize;
    return density > 0.48 && density < 0.52;
}

export function analyzeStegoVeritas(buffer: ArrayBufferLike, pixelData: number[], mimeType: string): StegoVeritasResult {
    const trailing = detectTrailingData(buffer, mimeType);
    const anomalies = detectMetadataAnomalies(buffer);
    const inconsistency = analyzeRGBInconsistency(pixelData);
    const bitPlaneAnomaly = detectBitPlaneAnomaly(pixelData);
    const shadowChunks = detectShadowChunks(buffer);
    const entropyMap = calculateEntropyMap(buffer);
    const filterAnomaly = detectFilterAnomaly(buffer);
    const frameDelay = analyzeFrameDelays(buffer);
    const reasons: string[] = [];
    if (trailing.detected) reasons.push(`trailing_data_detected (${trailing.size} bytes)`);
    if (anomalies.length > 0) reasons.push('metadata_anomaly_markers_found');
    if (inconsistency.detected) reasons.push('rgb_channel_inconsistency_detected');
    if (bitPlaneAnomaly) reasons.push('bit_plane_noise_anomaly_detected');
    if (shadowChunks.detected) reasons.push(`shadow_chunks_detected (${shadowChunks.chunks.join(', ')})`);
    if (filterAnomaly) reasons.push('png_filter_structure_anomaly');
    if (frameDelay.detected) reasons.push('multi_frame_delay_anomaly_detected');

    return {
        suspicious: reasons.length > 0,
        trailingDataDetected: trailing.detected,
        trailingDataSize: trailing.size,
        metadataAnomalies: anomalies,
        bitPlaneAnomaly,
        channelInconsistency: inconsistency,
        shadowChunks,
        entropyMap,
        filterAnomaly,
        frameDelayAnomaly: frameDelay,
        reasons
    };
}
