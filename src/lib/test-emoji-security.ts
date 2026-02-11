/**
 * Test script for enhanced emoji security features
 * Run this to verify all detection mechanisms are working
 */

import {
    enhancedEmojiSecurityScan,
    detectTokenExplosion,
    analyzeGraphemeClusters,
    detectVariationSelectorAbuse
} from './emoji';

console.log('🧪 Testing Enhanced Emoji Security Features\n');

// Test 1: Token Explosion (Family Emoji with ZWJ)
console.log('Test 1: Token Explosion Detection');
const tokenExplosionSample = '👨‍👩‍👧‍👦👨‍👩‍👧‍👦👨‍👩‍👧‍👦';
const tokenResult = detectTokenExplosion(tokenExplosionSample);
console.log('Sample:', tokenExplosionSample);
console.log('Result:', tokenResult);
console.log('Expected: suspicious=true, excessive_zwj_sequences detected\n');

// Test 2: Grapheme Manipulation
console.log('Test 2: Grapheme Cluster Analysis');
const graphemeSample = 'e\u0301\u0302\u0303\u0304\u0305\u0306';
const graphemeResult = analyzeGraphemeClusters(graphemeSample);
console.log('Sample:', graphemeSample);
console.log('Result:', graphemeResult);
console.log('Expected: suspicious=true, excessive_combining_marks detected\n');

// Test 3: Variation Selector Abuse
console.log('Test 3: Variation Selector Abuse Detection');
const vsSample = '☺️\uFE0F\uFE0E\uFE0F\uFE0E';
const vsResult = detectVariationSelectorAbuse(vsSample);
console.log('Sample:', vsSample);
console.log('Result:', vsResult);
console.log('Expected: suspicious=true, consecutive_variation_selectors detected\n');

// Test 4: Combined Attack
console.log('Test 4: Combined Attack (Comprehensive Scan)');
const combinedSample = '👨‍💻\u200B\u200C\u200D🔓\uFE0F';
const combinedResult = enhancedEmojiSecurityScan(combinedSample);
console.log('Sample:', combinedSample);
console.log('Result:', JSON.stringify(combinedResult, null, 2));
console.log('Expected: Multiple threats detected, high risk score\n');

// Test 5: Clean Emoji
console.log('Test 5: Clean Emoji Text');
const cleanSample = 'Hello 👋 World 🌍';
const cleanResult = enhancedEmojiSecurityScan(cleanSample);
console.log('Sample:', cleanSample);
console.log('Result:', JSON.stringify(cleanResult, null, 2));
console.log('Expected: suspicious=false, low or zero risk score\n');

// Test 6: Encoding Pattern
console.log('Test 6: Emoji Encoding Pattern');
const encodingSample = '😂😍😭🔥🤔🤯👍🎉🤩🤢🤮😱👋🙏';
const encodingResult = enhancedEmojiSecurityScan(encodingSample);
console.log('Sample:', encodingSample);
console.log('Result:', JSON.stringify(encodingResult, null, 2));
console.log('Expected: encodingPattern detected, high risk score\n');

console.log('✅ All tests completed!');
