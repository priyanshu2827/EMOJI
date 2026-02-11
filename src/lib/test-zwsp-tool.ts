import { zeroWidth, SteganographyMode, Position } from './zerowidth';
import * as actions from './actions';

async function testZWSPTool() {
    console.log('🧪 Testing ZWSP-Tool Integration...');

    const source = 'The quick brown fox jumps over the lazy dog.';
    const secret = 'Hidden Secret';

    // 1. Test Encoding (ZWSP_TOOL Mode)
    console.log('\n--- Test 1: ZWSP-Tool Encoding ---');
    const encoded = zeroWidth.zeroEncode(source, secret, Position.BOTTOM, 1, SteganographyMode.ZWSP_TOOL);
    const containsZW = Array.from(encoded).some(c => ['\u200B', '\u200C', '\u200D', '\u200E', '\u200F', '\u180E', '\uFEFF'].includes(c));
    console.log('Encoded text contains ZW characters:', containsZW);
    console.log('Encoded length:', encoded.length);

    // 2. Test Decoding (ZWSP_TOOL Mode)
    console.log('\n--- Test 2: ZWSP-Tool Decoding ---');
    const decoded = zeroWidth.zeroDecode(encoded, SteganographyMode.ZWSP_TOOL);
    console.log('Decoded message:', decoded);
    console.log('Match success:', decoded === secret);

    // 3. Test Detection Logic (Actions)
    console.log('\n--- Test 3: Detection Heuristics ---');
    // We'll simulate part of analyzeContent logic here since it's an async server action that depends on many imports
    const zwspChars = ['\u200B', '\u200C', '\u200D', '\u200E', '\u200F', '\u180E', '\ufeff'];
    const longZwspRegex = new RegExp(`[${zwspChars.join('')}]{10,}`, 'g');
    const matches = encoded.match(longZwspRegex);
    console.log('ZWSP-Tool pattern detected:', !!matches);
    console.log('Match count:', matches?.length || 0);

    // 4. Verification of original binary mode
    console.log('\n--- Test 4: Binary Mode Regression ---');
    const binaryEncoded = zeroWidth.zeroEncode(source, secret, Position.BOTTOM, 1, SteganographyMode.BINARY);
    const binaryDecoded = zeroWidth.zeroDecode(binaryEncoded, SteganographyMode.BINARY);
    console.log('Binary decoding success:', binaryDecoded === secret);

    if (decoded === secret && binaryDecoded === secret && !!matches) {
        console.log('\n✅ All ZWSP-Tool integration tests passed!');
    } else {
        console.log('\n❌ Some tests failed.');
        process.exit(1);
    }
}

testZWSPTool().catch(console.error);
