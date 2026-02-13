import { DetectionEngine } from './detection-engine';
import { zeroWidth, Position, SteganographyMode } from './zerowidth';
import * as emoji from './emoji';

async function runCalibration() {
    console.log('--- Sentinel Prime: Benchmark Calibration Harness ---');

    // Test sets
    const cases = [
        { name: 'Ultra-Sparse ZWSP', text: "A".repeat(1000) + zeroWidth.zeroEncode("", "X", Position.RANDOM, 1, SteganographyMode.BINARY) + "A".repeat(1000) },
        { name: 'Emoji Stego', text: emoji.encode("HIDDEN", "🚀") },
        { name: 'Homoglyph Phishing', text: "Visit https://googlе.com" }, // Cyrillic e
        { name: 'Safe Text', text: "This is a perfectly normal sentence with no hidden data." }
    ];

    console.log('\nRunning parameter sweep...');

    for (const c of cases) {
        const result = await DetectionEngine.analyze(c.text, null, null);
        console.log(`[${c.name}] Score: ${result.score}% | Severity: ${result.severity}`);
    }

    console.log('\nCalibration Complete. Adjust confidenceWeights in detection-engine.ts based on these results.');
}

if (require.main === module) {
    runCalibration().catch(console.error);
}
