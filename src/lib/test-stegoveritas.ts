import * as veritas from './stegoveritas-detector';

function generateFakePNGWithTrailing(dataSize: number): ArrayBuffer {
    const iend = [0x49, 0x45, 0x4E, 0x44];
    const crc = [0x00, 0x00, 0x00, 0x00];
    const base = new Uint8Array([0x89, 0x50, 0x4E, 0x47, ...iend, ...crc]);
    const final = new Uint8Array(base.length + dataSize);
    final.set(base);
    for (let i = 0; i < dataSize; i++) {
        final[base.length + i] = 0xAA; // Fake payload
    }
    return final.buffer;
}

function generateInconsistentPixels(size: number): number[] {
    const pixels = [];
    for (let i = 0; i < size; i++) {
        // Red channel has high LSB entropy (simulated stego)
        const r = (Math.floor(Math.random() * 256) & ~1) | (Math.random() > 0.5 ? 1 : 0);
        // Green/Blue have zero LSB entropy (clean)
        const g = (Math.floor(Math.random() * 256) & ~1);
        const b = (Math.floor(Math.random() * 256) & ~1);
        pixels.push(r, g, b);
    }
    return pixels;
}

function testStegoVeritas() {
    console.log('🧪 Testing stegoVeritas Integration...');

    // 1. Test Trailing Data
    console.log('\n--- Test 1: Trailing Data Detection ---');
    const bufferWithTrailing = generateFakePNGWithTrailing(128);
    const trailingResult = veritas.detectTrailingData(bufferWithTrailing, 'image/png');
    console.log('Detected:', trailingResult.detected);
    console.log('Size:', trailingResult.size);

    // 2. Test Channel Inconsistency
    console.log('\n--- Test 2: Channel Inconsistency ---');
    const pixels = generateInconsistentPixels(1000);
    const channelResult = veritas.analyzeRGBInconsistency(pixels);
    console.log('Detected:', channelResult.detected);
    console.log('R Entropy:', channelResult.scores.r.toFixed(4));
    console.log('G Entropy:', channelResult.scores.g.toFixed(4));

    // 3. Test Metadata scan
    console.log('\n--- Test 3: Metadata Anomaly ---');
    const header = new TextEncoder().encode('Some random data with stegHide markers.');
    const metaResult = veritas.detectMetadataAnomalies(header.buffer);
    console.log('Anomalies found:', metaResult.length);
    console.log('First anomaly:', metaResult[0]);

    if (trailingResult.detected && channelResult.detected && metaResult.length > 0) {
        console.log('\n✅ stegoVeritas integration logic verified!');
    } else {
        console.log('\n❌ Detection logic failed.');
        process.exit(1);
    }
}

testStegoVeritas();
