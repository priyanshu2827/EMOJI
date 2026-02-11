import { DetectionEngine } from './detection-engine';
import { zeroWidth, Position, SteganographyMode } from './zerowidth';
import * as emoji from './emoji';
import * as unicode from './unicode';
import * as dotenv from 'dotenv';

dotenv.config();

async function runEliteBenchmark() {
    console.log('💎 Starting Sentinel Prime - ELITE DIFFICULTY STRESS TEST...\n');

    const results = {
        sparse: { tp: 0, fn: 0 },
        homoglyph_collision: { tn: 0, fp: 0 },
        compound: { tp: 0, fn: 0 },
        adversarial_image: { tp: 0, fn: 0 }
    };

    // 1. Ultra-Sparse Steganography (10k chars, 1 byte hidden)
    console.log('--- Case: Ultra-Sparse Steganography ---');
    const baseText = "A".repeat(10000);
    const sparseEncoded = zeroWidth.zeroEncode(baseText, "X", Position.RANDOM, 1, SteganographyMode.BINARY);
    process.stdout.write(`  Testing 10k:1 detection...`);
    const d1 = await DetectionEngine.analyze(sparseEncoded, null, null);
    if (d1.score >= 10) {
        console.log(' ✅ DETECTED');
        results.sparse.tp++;
    } else {
        console.log(` ❌ FAILED (Score: ${d1.score})`);
        results.sparse.fn++;
    }

    // 2. Homoglyph Collision (Technical context using similar chars)
    console.log('\n--- Case: Homoglyph Collision (Technical) ---');
    const technicalText = "const Т = 5; // Using Cyrillic T in code-like comment";
    process.stdout.write(`  Testing legitimate homoglyph use...`);
    const d2 = await DetectionEngine.analyze(technicalText, null, null);
    if (d2.score < 50) {
        console.log(' ✅ SAFE (Low suspicion)');
        results.homoglyph_collision.tn++;
    } else {
        console.log(` ❌ FALSE POSITIVE (Score: ${d2.score}, Reasons: ${d2.reasons.join(', ')})`);
        results.homoglyph_collision.fp++;
    }

    // 3. Compound Steganography (Nested)
    console.log('\n--- Case: Compound Steganography (Nested) ---');
    const innerEmoji = emoji.encode("HIDDEN", "🎨🚀");
    const compoundEncoded = zeroWidth.zeroEncode(innerEmoji, "NESTED", Position.BOTTOM, 1, SteganographyMode.BINARY);
    process.stdout.write(`  Testing nested emoji/zwsp...`);
    const d3 = await DetectionEngine.analyze(compoundEncoded, null, null);
    if (d3.score === 100) {
        console.log(' ✅ FULL RECOVERY');
        results.compound.tp++;
    } else {
        console.log(` ❌ PARTIAL/FAILED (Score: ${d3.score})`);
        results.compound.fn++;
    }

    // 4. Adversarial Image: Low Density + Compression Artifacts
    console.log('\n--- Case: Adversarial Image (Low Density) ---');
    const generateNoisyPixels = () => Array.from({ length: 40000 }, () => Math.floor(Math.random() * 255));
    const clean = generateNoisyPixels();
    const lowDensityStego = [...clean];
    // Embed only 4 bits (0.01% embedding rate)
    for (let i = 0; i < 4; i++) {
        const idx = Math.floor(Math.random() * clean.length);
        lowDensityStego[idx] = (lowDensityStego[idx] & ~1) | 1;
    }
    process.stdout.write(`  Testing 0.01% LSB embedding...`);
    const d4 = await DetectionEngine.analyze("", new ArrayBuffer(40000), lowDensityStego);
    if (d4.score >= 5) {
        console.log(` ✅ ALERT TRIGGERED (Score: ${d4.score})`);
        results.adversarial_image.tp++;
    } else {
        console.log(` ❌ SILENT (Score: ${d4.score})`);
        results.adversarial_image.fn++;
    }

    console.log('\n--- Elite Test Summary ---');
    console.log(`  Ultra-Sparse TP: ${results.sparse.tp}/${results.sparse.tp + results.sparse.fn}`);
    console.log(`  Technical TN: ${results.homoglyph_collision.tn}/${results.homoglyph_collision.tn + results.homoglyph_collision.fp}`);
    console.log(`  Compound TP: ${results.compound.tp}/${results.compound.tp + results.compound.fn}`);
    console.log(`  Adversarial Image TP: ${results.adversarial_image.tp}/${results.adversarial_image.tp + results.adversarial_image.fn}`);
}

runEliteBenchmark().catch(console.error);
