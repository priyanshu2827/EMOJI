import { stegDetector } from './steg-detector' // Wait, I didn't export it like that... let's check

import * as steg from './steg-detector';

function generateCleanPixels(size: number): number[] {
    const pixels = [];
    for (let i = 0; i < size; i++) {
        pixels.push(Math.floor(Math.random() * 256));
    }
    return pixels;
}

function generateStegoPixels(size: number, rate: number): number[] {
    const pixels = generateCleanPixels(size);
    // Hide bits in LSB
    for (let i = 0; i < size * rate; i++) {
        const bit = Math.random() > 0.5 ? 1 : 0;
        pixels[i] = (pixels[i] & ~1) | bit;
    }
    return pixels;
}

function testStegDetector() {
    console.log('🧪 Testing StegExpose Integration...');

    const size = 10000;

    // 1. Test Clean Image
    console.log('\n--- Test 1: Clean Image ---');
    const cleanPixels = generateCleanPixels(size);
    const cleanResult = steg.analyzeStego(cleanPixels);
    console.log('Suspicious:', cleanResult.suspicious);
    console.log('Chi-Square Prob:', cleanResult.chiSquareProbability.toFixed(4));
    console.log('SPA Rate:', cleanResult.spaEmbeddingRate.toFixed(4));

    // 2. Test Stego Image (High embedding)
    console.log('\n--- Test 2: Stego Image (50% LSB modified) ---');
    const stegoPixels = generateStegoPixels(size, 0.5);
    const stegoResult = steg.analyzeStego(stegoPixels);
    console.log('Suspicious:', stegoResult.suspicious);
    console.log('Chi-Square Prob:', stegoResult.chiSquareProbability.toFixed(4));
    console.log('SPA Rate:', stegoResult.spaEmbeddingRate.toFixed(4));
    console.log('Reasons:', stegoResult.reasons);

    // 3. Test Low Capacity Stego
    console.log('\n--- Test 3: Stego Image (10% LSB modified) ---');
    const lowStegoPixels = generateStegoPixels(size, 0.1);
    const lowResult = steg.analyzeStego(lowStegoPixels);
    console.log('Suspicious:', lowResult.suspicious);
    console.log('Chi-Square Prob:', lowResult.chiSquareProbability.toFixed(4));
    console.log('SPA Rate:', lowResult.spaEmbeddingRate.toFixed(4));

    if (!cleanResult.suspicious && stegoResult.suspicious) {
        console.log('\n✅ StegExpose integration logic verified!');
    } else {
        console.log('\n❌ Detection logic failed.');
        process.exit(1);
    }
}

testStegDetector();
