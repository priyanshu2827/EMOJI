import { DetectionEngine } from './detection-engine';
import * as unicode from './unicode';
import * as emoji from './emoji';
import { zeroWidth, Position, SteganographyMode } from './zerowidth';

async function runAdversarialBenchmark() {
    console.log('⚡ Starting Sentinel Prime - ADVERSARIAL STRESS TEST...\n');

    const results = {
        text: { tp: 0, fp: 0, tn: 0, fn: 0 },
        emoji: { tp: 0, fp: 0, tn: 0, fn: 0 },
        image: { tp: 0, fp: 0, tn: 0, fn: 0 }
    };

    // 1. Text Domain: Technical & BIDI Stress
    console.log('--- Domain: Adversarial Text ---');
    const difficultCleanTexts = [
        "The value of π is ~3.14159, and x² + y² = z².", // Mathematical symbols
        "In Arabic, 'hello' is مرحبا (Marhaba).", // Legitimate BIDI usage
        "The subscript₀ and superscript¹ are used here.", // Sub/Superscripts
        "Contact us at: 📧 info@example.com (Ref: #12345)" // Mixed symbols
    ];

    for (const text of difficultCleanTexts) {
        process.stdout.write(`  Testing FP (Natural): ${text.substring(0, 30)}...`);
        const d = await DetectionEngine.analyze(text, null, null);
        if (d.score < 30) {
            console.log(' ✅ SAFE');
            results.text.tn++;
        } else {
            console.log(` ❌ FALSE POSITIVE (Score: ${d.score}, Reasons: ${d.reasons.join(', ')})`);
            results.text.fp++;
        }

        // Subtlety Test: Tiny 1-character ZWSP Injection
        process.stdout.write(`  Testing FN (Subtle Stego - 1 char): ...`);
        const subtle = text.substring(0, 5) + '\u200B' + text.substring(5);
        const d1 = await DetectionEngine.analyze(subtle, null, null);
        if (d1.score >= 15) {
            console.log(' ✅ DETECTED');
            results.text.tp++;
        } else {
            console.log(` ❌ FAILED (Score: ${d1.score})`);
            results.text.fn++;
        }
    }

    // 2. Emoji Domain: Multi-ZWJ & Contextual Stress
    console.log('\n--- Domain: Adversarial Emoji ---');
    const complexEmojiSequences = [
        "👩‍👩‍👧‍👦", // Family (multi-ZWJ)
        "🧑‍🚀", // Astronaut (ZWJ)
        "🏳️‍🌈", // Rainbow flag (ZWJ)
        "🏴‍☠️"  // Pirate flag (ZWJ)
    ];

    for (const seq of complexEmojiSequences) {
        process.stdout.write(`  Testing FP (Complex Emoji): ${seq}...`);
        const d = await DetectionEngine.analyze(seq, null, null);
        if (d.score < 25) {
            console.log(' ✅ SAFE');
            results.emoji.tn++;
        } else {
            console.log(` ❌ FALSE POSITIVE (Score: ${d.score})`);
            results.emoji.fp++;
        }

        process.stdout.write(`  Testing FN (Spread Stego): ...`);
        const encoded = emoji.encode("X", seq); // Minimal payload
        const d2 = await DetectionEngine.analyze(encoded, null, null);
        if (d2.score >= 30) {
            console.log(' ✅ DETECTED');
            results.emoji.tp++;
        } else {
            console.log(` ❌ FAILED (Score: ${d2.score})`);
            results.emoji.fn++;
        }
    }

    // 3. Image Domain: High-ISO & Gradient Stress
    console.log('\n--- Domain: Adversarial Image ---');

    // Test 1: Smooth Synthetic Gradient (Testing Entropy Guards)
    console.log('  Testing FP (Smooth Gradient)...');
    const gradPixels = new Array(20000);
    for (let i = 0; i < 20000; i++) gradPixels[i] = Math.floor((i / 20000) * 255);
    const dGrad = await DetectionEngine.analyze("", new ArrayBuffer(20000), gradPixels);
    if (dGrad.score < 35) {
        console.log('  ✅ SAFE (Entropy Guard working)');
        results.image.tn++;
    } else {
        console.log(`  ❌ FALSE POSITIVE (Score: ${dGrad.score}, Reasons: ${dGrad.reasons.join(', ')})`);
        results.image.fp++;
    }

    // Test 2: High-ISO Noise (Simulation of Grain)
    console.log('  Testing FP (High-ISO Grain)...');
    const noisyPixels = new Array(20000);
    for (let i = 0; i < 20000; i++) noisyPixels[i] = Math.floor(Math.random() * 255);
    const dNoisy = await DetectionEngine.analyze("", new ArrayBuffer(20000), noisyPixels);
    if (dNoisy.score < 40) {
        console.log('  ✅ SAFE (Random Noise correctly ignored)');
        results.image.tn++;
    } else {
        console.log(`  ❌ FALSE POSITIVE (Score: ${dNoisy.score})`);
        results.image.fp++;
    }

    // Test 3: Low-Density LSB (0.5% - Extremely hard to detect)
    console.log('  Testing FN (0.5% LSB Embedding)...');
    const clean = new Array(40000).fill(128);
    const subtleStego = [...clean];
    for (let i = 0; i < 200; i++) {
        const idx = Math.floor(Math.random() * clean.length);
        subtleStego[idx] = (subtleStego[idx] & ~1) | (Math.random() < 0.5 ? 0 : 1);
    }
    const dSubtle = await DetectionEngine.analyze("", new ArrayBuffer(40000), subtleStego);
    if (dSubtle.score >= 10) {
        console.log(`  ✅ DETECTED (Score: ${dSubtle.score})`);
        results.image.tp++;
    } else {
        console.log(`  ❌ FAILED (Score: ${dSubtle.score})`);
        results.image.fn++;
    }

    // Final Statistics
    const finalReport = (s: any, label: string) => {
        const total = s.tp + s.tn + s.fp + s.fn;
        const acc = (s.tp + s.tn) / total;
        console.log(`\n> Adversarial ${label} Accuracy: ${(acc * 100).toFixed(2)}%`);
        console.log(`  [TP: ${s.tp}, TN: ${s.tn}, FP: ${s.fp}, FN: ${s.fn}]`);
        return acc;
    };

    const a1 = finalReport(results.text, "Text");
    const a2 = finalReport(results.emoji, "Emoji");
    const a3 = finalReport(results.image, "Image");

    console.log(`\n🛰️ ADVERSARIAL SYSTEM ACCURACY: ${((a1 + a2 + a3) / 3 * 100).toFixed(2)}%`);
}

runAdversarialBenchmark().catch(console.error);
