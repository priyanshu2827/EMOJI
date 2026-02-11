import { DetectionEngine } from './detection-engine';
import * as unicode from './unicode';
import * as emoji from './emoji';
import { zeroWidth, Position, SteganographyMode } from './zerowidth';

async function runBenchmark() {
    console.log('🛰️ Starting Sentinel Prime - FINAL ACCURACY BENCHMARK...\n');

    const results = {
        text: { tp: 0, fp: 0, tn: 0, fn: 0 },
        emoji: { tp: 0, fp: 0, tn: 0, fn: 0 },
        image: { tp: 0, fp: 0, tn: 0, fn: 0 }
    };

    // 1. Text Domain
    console.log('--- Domain: Text ---');
    const cleanTexts = [
        "The quick brown fox jumps over the lazy dog.",
        "In the heart of the city, life moves fast.",
        "Sentinel Prime is active and monitoring."
    ];

    for (const text of cleanTexts) {
        const d = await DetectionEngine.analyze(text, null, null);
        if (d.score < 20) results.text.tn++; else results.text.fp++;

        // Binary verification
        const enc1 = zeroWidth.zeroEncode(text, "SECRET MESSAGE", Position.BOTTOM, 1, SteganographyMode.BINARY);
        const d1 = await DetectionEngine.analyze(enc1, null, null);
        if (d1.score === 100) results.text.tp++; else results.text.fn++;

        // ZWSP-Tool verification
        const enc2 = zeroWidth.zeroEncode(text, "Forensic Proof", Position.BOTTOM, 1, SteganographyMode.ZWSP_TOOL);
        const d2 = await DetectionEngine.analyze(enc2, null, null);
        if (d2.score === 100) results.text.tp++; else results.text.fn++;
    }

    // 2. Emoji Domain
    console.log('--- Domain: Emoji ---');
    const cleanEmojiStrings = ["😀🔥🚀🎨🌈", "🤖👻💡🔮🧿", "🎭🎪🎢🎡🎠"];
    for (const ces of cleanEmojiStrings) {
        const d = await DetectionEngine.analyze(ces, null, null);
        if (d.score < 20) results.emoji.tn++; else results.emoji.fp++;

        const encoded = emoji.encode("SENTINEL_PRIME_VERIFIED_100", "");
        const d2 = await DetectionEngine.analyze(encoded, null, null);
        // Verified Alphabet Decoder should trigger 100%
        if (d2.score === 100) results.emoji.tp++; else {
            console.log(`  Emoji FN - Score: ${d2.score}, Reasons: ${d2.reasons.join(', ')}`);
            results.emoji.fn++;
        }
    }

    // 3. Image Domain
    console.log('--- Domain: Image ---');
    const generateGaussianPixels = () => {
        const p = new Array(20000);
        for (let i = 0; i < 20000; i++) {
            // Natural noise simulation (Box-Muller)
            const u = Math.random();
            const v = Math.random();
            const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
            p[i] = Math.floor(Math.max(0, Math.min(255, 128 + z * 30)));
        }
        return p;
    };

    const applyLSB = (pixels: number[], rate: number) => {
        const newPixels = [...pixels];
        const count = Math.floor(pixels.length * rate);
        for (let i = 0; i < count; i++) {
            const idx = Math.floor(Math.random() * pixels.length);
            newPixels[idx] = (newPixels[idx] & ~1) | (Math.random() < 0.5 ? 0 : 1);
        }
        return newPixels;
    };

    for (let i = 0; i < 10; i++) {
        const clean = generateGaussianPixels();
        const d = await DetectionEngine.analyze("", new ArrayBuffer(20000), clean);
        if (d.score < 30) results.image.tn++; else {
            console.log(`  Image FP - Score: ${d.score}, Reasons: ${d.reasons.join(', ')}`);
            results.image.fp++;
        }

        const stego = applyLSB(clean, 0.15); // 15% embedding
        const d2 = await DetectionEngine.analyze("", new ArrayBuffer(20000), stego);
        if (d2.score >= 50) results.image.tp++; else {
            console.log(`  Image FN - Score: ${d2.score}`);
            results.image.fn++;
        }
    }

    // Final Statistics
    const finalReport = (s: any, label: string) => {
        const acc = (s.tp + s.tn) / (s.tp + s.tn + s.fp + s.fn);
        console.log(`\n> ${label} Accuracy: ${(acc * 100).toFixed(2)}%`);
        console.log(`  [TP: ${s.tp}, TN: ${s.tn}, FP: ${s.fp}, FN: ${s.fn}]`);
        return acc;
    };

    const a1 = finalReport(results.text, "Text");
    const a2 = finalReport(results.emoji, "Emoji");
    const a3 = finalReport(results.image, "Image");

    console.log(`\n🚀 PRACTICAL SYSTEM ACCURACY: ${((a1 + a2 + a3) / 3 * 100).toFixed(2)}%`);
}

runBenchmark().catch(console.error);
