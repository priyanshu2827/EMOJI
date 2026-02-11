/**
 * Test script for code detection features
 * Tests smart quote detection and character composition analysis
 */

import {
    analyzeCode,
    detectSmartQuotes,
    analyzeCharacterComposition
} from './code-detector';

console.log('🧪 Testing Code Detection Features\n');

// Test 1: Smart Quotes Detection
console.log('Test 1: Smart Quote Detection');
const smartQuoteSample = 'const message = "Hello World";'; // Smart quotes
const smartQuoteResult = detectSmartQuotes(smartQuoteSample);
console.log('Sample:', smartQuoteSample);
console.log('Result:', JSON.stringify(smartQuoteResult, null, 2));
console.log('Expected: Detect LEFT_DOUBLE_QUOTE and RIGHT_DOUBLE_QUOTE\n');

// Test 2: Multiple Smart Quotes
console.log('Test 2: Multiple Smart Quote Types');
const mixedQuoteSample = '"Hello" and 'World' with «angles»';
const mixedQuoteResult = detectSmartQuotes(mixedQuoteSample);
console.log('Sample:', mixedQuoteSample);
console.log('Result:', JSON.stringify(mixedQuoteResult, null, 2));
console.log('Expected: Detect multiple quote types\n');

// Test 3: Character Composition - Normal Text
console.log('Test 3: Character Composition - Normal Text');
const normalText = 'Hello World! This is a normal sentence with 123 numbers.';
const normalComposition = analyzeCharacterComposition(normalText);
console.log('Sample:', normalText);
console.log('Result:', JSON.stringify(normalComposition, null, 2));
console.log('Expected: suspicious=false, balanced composition\n');

// Test 4: Character Composition - High Control Characters
console.log('Test 4: Character Composition - High Control Characters');
const controlCharSample = 'Text\u200B\u200C\u200D\uFEFF\u200B\u200C\u200D\uFEFF';
const controlComposition = analyzeCharacterComposition(controlCharSample);
console.log('Sample:', controlCharSample);
console.log('Result:', JSON.stringify(controlComposition, null, 2));
console.log('Expected: suspicious=true, high_invisible_char_ratio\n');

// Test 5: Character Composition - High Symbol Ratio
console.log('Test 5: Character Composition - High Symbol Ratio');
const symbolSample = '!!!@@@###$$$%%%^^^&&&***((()))';
const symbolComposition = analyzeCharacterComposition(symbolSample);
console.log('Sample:', symbolSample);
console.log('Result:', JSON.stringify(symbolComposition, null, 2));
console.log('Expected: suspicious=true, high_symbol_ratio\n');

// Test 6: Comprehensive Code Analysis
console.log('Test 6: Comprehensive Code Analysis');
const codeSample = 'const msg = "Hello"\u200B; // Hidden char';
const codeAnalysis = analyzeCode(codeSample);
console.log('Sample:', codeSample);
console.log('Result:', JSON.stringify(codeAnalysis, null, 2));
console.log('Expected: Smart quotes + invisible chars detected\n');

// Test 7: Clean Code
console.log('Test 7: Clean Code');
const cleanCode = 'function hello() { return "world"; }';
const cleanAnalysis = analyzeCode(cleanCode);
console.log('Sample:', cleanCode);
console.log('Result:', JSON.stringify(cleanAnalysis, null, 2));
console.log('Expected: suspicious=false, no threats\n');

console.log('✅ All tests completed!');
