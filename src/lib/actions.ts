'use server';

import { summarizeFindings } from '@/ai/flows/summarize-findings';
import { generateSampleText as generateSampleTextFlow } from '@/ai/flows/generate-sample-text';
import { suggestWhitelist as suggestWhitelistFlow } from '@/ai/flows/suggest-whitelist';
// Note: The 'z-w-c' library was removed due to being unavailable on the npm registry.
// We are reverting to a simulated analysis for text.

import type { ContentType, ScanResult, Severity } from './types';

// Helper to simulate a delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// This is a simple library-less implementation to detect zero-width characters.
const zeroWidthChars = [
    '\u200b', // Zero-width space
    '\u200c', // Zero-width non-joiner
    '\u200d', // Zero-width joiner
    '\uFEFF'  // Zero-width no-break space
];
const charToBinary = (char: string) => char.charCodeAt(0).toString(2).padStart(16, '0');
const binaryToChar = (bin: string) => String.fromCharCode(parseInt(bin, 2));

const decodeText = (text: string): string => {
    let binaryString = '';
    for (const char of text) {
        if (char === zeroWidthChars[0]) binaryString += '0';
        if (char === zeroWidthChars[1]) binaryString += '1';
    }
    
    let message = '';
    for (let i = 0; i < binaryString.length; i += 16) {
        const chunk = binaryString.slice(i, i + 16);
        if (chunk.length === 16) {
            message += binaryToChar(chunk);
        }
    }
    return message;
};

const encodeText = (text: string, message: string): string => {
    let binaryMessage = '';
    for (const char of message) {
        binaryMessage += charToBinary(char);
    }

    let encodedText = text;
    for (const bit of binaryMessage) {
        encodedText += bit === '0' ? zeroWidthChars[0] : zeroWidthChars[1];
    }
    return encodedText;
};


export async function analyzeContent(
  prevState: any,
  formData: FormData
): Promise<ScanResult | { error: string }> {
  await sleep(1500); // Simulate network and processing time

  const text = formData.get('textInput') as string;
  const image = formData.get('imageInput') as File;

  let contentType: ContentType = 'Text';
  let severity: Severity = 'CLEAN';
  let rawFindings = 'No anomalies detected.';

  if (image && image.size > 0) {
    contentType = 'Image';
    // Simulate image analysis - this part remains the same as the library is for text
    if (image.size > 1 * 1024 * 1024) { // > 1MB
      severity = 'SUSPICIOUS';
      rawFindings = `Image size (${(image.size / 1024 / 1024).toFixed(2)}MB) is larger than typical, potentially indicating hidden data payloads.`;
    }
    if (/(secret|hidden|confidential)/i.test(image.name)) {
      severity = 'HIGH-RISK';
      rawFindings = `Image filename "${image.name}" contains suspicious keywords. Files may be intentionally concealed.`;
    }
  } else if (text) {
    contentType = /[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(text)
      ? 'Emoji'
      : 'Text';
    
    const decodedMessage = decodeText(text);

    if (decodedMessage) {
        severity = 'HIGH-RISK';
        rawFindings = `Hidden message found: "${decodedMessage}"`;
    } else {
        rawFindings = 'No zero-width characters found for decoding.';
        if (text.length > 500 && text.split(' ').length < 50) {
            severity = 'SUSPICIOUS';
            rawFindings = 'Text contains a high character-to-word ratio, which could indicate encoded data rather than natural language.';
        }
    }
  } else {
    return { error: 'No content provided to analyze.' };
  }

  try {
    const summaryResult = await summarizeFindings({
      findings: rawFindings,
      type: contentType,
      severity: severity === 'HIGH-RISK' ? 'HIGH-RISK STEGANOGRAPHY DETECTED' : severity,
    });
    
    return {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: contentType,
      severity,
      summary: summaryResult.summary,
      rawFindings,
    };

  } catch (e) {
    console.error(e);
    return { error: 'Failed to get summary from AI. Please try again.' };
  }
}

export async function generateSampleText(topic: string, hiddenMessage: string) {
    try {
        const result = await generateSampleTextFlow({ topic, hiddenMessage });
        if ('sampleText' in result) {
            // Re-encode with our local function to ensure it's detectable
            const encodedText = encodeText(result.sampleText, hiddenMessage);
            return { ...result, sampleText: encodedText };
        }
        return result;
    } catch(e) {
        console.error(e);
        return { error: 'Failed to generate sample text.' };
    }
}


export async function suggestWhitelist(scanResults: string) {
    try {
        const result = await suggestWhitelistFlow({ scanResults, numSuggestions: 3 });
        return result;
    } catch(e) {
        console.error(e);
        return { error: 'Failed to get whitelist suggestions.' };
    }
}
