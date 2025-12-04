'use server';

import { summarizeFindings } from '@/ai/flows/summarize-findings';
import { generateSampleText as generateSampleTextFlow } from '@/ai/flows/generate-sample-text';
import { suggestWhitelist as suggestWhitelistFlow } from '@/ai/flows/suggest-whitelist';

import type { ContentType, ScanResult, Severity } from './types';

// Helper to simulate a delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
    // Simulate image analysis
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
    
    // Simulate text/emoji analysis
    const zeroWidthChars = /[\u200B-\u200D\uFEFF]/g;
    if (zeroWidthChars.test(text)) {
      severity = 'HIGH-RISK';
      const matches = text.match(zeroWidthChars) || [];
      rawFindings = `Detected ${matches.length} zero-width characters, a common technique for hiding data in text.`;
    } else if (text.length > 500 && text.split(' ').length < 50) {
      severity = 'SUSPICIOUS';
      rawFindings = 'Text contains a high character-to-word ratio, which could indicate encoded data rather than natural language.';
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
