/**
 * Test script for SafeText features
 * Tests comprehensive homoglyphs and regional spelling detection
 */

import { detect_homoglyphs } from './unicode';
import { detectSpellingVariations } from './spelling-detector';

console.log('🧪 Testing SafeText Security Features\n');

// Test 1: Multi-Category Homoglyphs
console.log('Test 1: Multi-Category Homoglyph Detection');
// 'Н' is Cyrillic, 'ο' is Greek
const homoglyphSample = 'Нello Wοrld';
const homoglyphResult = detect_homoglyphs(homoglyphSample, true);
console.log('Sample:', homoglyphSample);
console.log('Result Summary:', JSON.stringify({
    present: homoglyphResult.present,
    categories: homoglyphResult.detailed?.categories,
    totalCount: homoglyphResult.detailed?.totalCount
}, null, 2));
console.log('Expected: Detect CYRILLIC and GREEK homoglyphs\n');

// Test 2: British Spelling
console.log('Test 2: British Spelling Detection');
const britishSample = 'The colour of the theatre was my favourite.';
const britishResult = detectSpellingVariations(britishSample);
console.log('Sample:', britishSample);
console.log('Result:', JSON.stringify({
    detected: britishResult.detected,
    likelyRegion: britishResult.likelyRegion,
    confidence: britishResult.confidence,
    counts: britishResult.stats
}, null, 2));
console.log('Expected: likelyRegion=BRITISH, high confidence\n');

// Test 3: American Spelling
console.log('Test 3: American Spelling Detection');
const americanSample = 'The color of the theater was my favorite.';
const americanResult = detectSpellingVariations(americanSample);
console.log('Sample:', americanSample);
console.log('Result:', JSON.stringify({
    detected: americanResult.detected,
    likelyRegion: americanResult.likelyRegion,
    confidence: americanResult.confidence,
    counts: americanResult.stats
}, null, 2));
console.log('Expected: likelyRegion=AMERICAN, high confidence\n');

// Test 4: Mixed Spelling (Fingerprinting Signal)
console.log('Test 4: Mixed Spelling Detection');
const mixedSample = 'I like the color of your favourite car.';
const mixedResult = detectSpellingVariations(mixedSample);
console.log('Sample:', mixedSample);
console.log('Result:', JSON.stringify({
    detected: mixedResult.detected,
    likelyRegion: mixedResult.likelyRegion,
    confidence: mixedResult.confidence,
    counts: mixedResult.stats
}, null, 2));
console.log('Expected: likelyRegion=MIXED\n');

// Test 5: Clean Text
console.log('Test 5: Clean Text');
const cleanSample = 'The quick brown fox jumps over the lazy dog.';
const cleanResult = detectSpellingVariations(cleanSample);
const cleanHomoglyphs = detect_homoglyphs(cleanSample, true);
console.log('Sample:', cleanSample);
console.log('Spelling Result Detected:', cleanResult.detected);
console.log('Homoglyph Result Present:', cleanHomoglyphs.present);
console.log('Expected: Both false\n');

console.log('✅ All tests completed!');
