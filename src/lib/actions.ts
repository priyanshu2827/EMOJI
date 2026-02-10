'use server';

import { randomUUID } from 'crypto';
import { summarizeFindings } from '@/ai/flows/summarize-findings';
import { generateSampleText as generateSampleTextFlow } from '@/ai/flows/generate-sample-text';
import { suggestWhitelist as suggestWhitelistFlow } from '@/ai/flows/suggest-whitelist';
import type { ContentType, ScanResult, Severity } from './types';
import * as unicode from './unicode';
import * as emoji from './emoji';
import { zeroWidth, Position } from './zerowidth';

// Helper to simulate a delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Media-type classifier ---
function classify_input(text: string | null, file_bytes: ArrayBuffer | null): ContentType {
    if (file_bytes && file_bytes.byteLength > 0) {
        return "Image";
    }
    const txt = text || "";
    if (unicode.contains_zero_width(txt)) {
        return "Text";
    }
    const clusters = unicode.get_grapheme_clusters(txt);
    if (!clusters.length) {
        return "Text";
    }
    const emoji_clusters = clusters.filter(c => unicode.EMOJI_REGEX.test(c));
    if (emoji_clusters.length >= Math.max(1, clusters.length / 2)) {
        return "Emoji";
    }
    return "Text";
}

// --- Text detectors ---
function detect_text_anomalies(text: string) {
    const suspicious = [];
    for (const ch of text) {
        const cat = unicode.get_unicode_category(ch);
        if (cat.startsWith('C') && !unicode.ZERO_WIDTH_CHARS.has(ch)) {
            suspicious.push({ char: ch, category: cat });
        }
    }
    const entropy = unicode.shannon_entropy(text);
    return { suspicious_unicode: suspicious.slice(0, 20), entropy: entropy };
}


// --- Image detectors (LSB heuristics) ---
function getPixelDataFromImageData(imageData: ImageData): number[] {
    const arr = [];
    for (let i = 0; i < imageData.data.length; i += 4) {
        arr.push(imageData.data[i]); // R
        arr.push(imageData.data[i + 1]); // G
        arr.push(imageData.data[i + 2]); // B
    }
    return arr;
}

function lsb_plane_statistics(arr: number[]) {
    let ones = 0;
    for (const val of arr) {
        if ((val & 1) === 1) {
            ones++;
        }
    }
    const total = arr.length;
    const zeros = total - ones;
    const ones_frac = ones / total;
    const zeros_frac = zeros / total;
    const dev = Math.abs(ones_frac - 0.5);
    return { ones_frac, zeros_frac, deviation_from_0_5: dev, total_bits: total };
}

function lsb_entropy_score(arr: number[]): number {
    if (arr.length === 0) return 0;
    const p1 = arr.reduce((sum, val) => sum + (val & 1), 0) / arr.length;
    if (p1 === 0 || p1 === 1) {
        return 0.0;
    }
    const p0 = 1 - p1;
    return -(p1 * Math.log2(p1) + p0 * Math.log2(p0));
}

async function image_detector(image: File) {
    const buffer = await image.arrayBuffer();
    const arr = Array.from(new Uint8Array(buffer));
    const stats = lsb_plane_statistics(arr);
    const entropy = lsb_entropy_score(arr);
    
    let suspicious = false;
    const reasons: string[] = [];
    if (stats.deviation_from_0_5 < 0.03 && entropy > 0.98) {
        suspicious = true;
        reasons.push('lsb_randomness_high');
    }
    if (stats.deviation_from_0_5 < 0.01 && stats.total_bits > 5_000_000) {
        suspicious = true;
        reasons.push('very_large_image_near_uniform_lsb');
    }

    return { suspicious, reasons, lsb_stats: stats, lsb_entropy: entropy };
}


// --- Fusion / scoring ---
function fuse_scores(media_type: ContentType, results: any): number {
    let score = 0.0;
    const max_score = 5.0;

    if (media_type === "Text" || media_type === "Emoji") { // Combine text/emoji logic
        if (results.zero_width?.present) score += 2.5;
        if (results.homoglyph?.present) score += 2.0;
        if (results.text_anom?.entropy > 4.0) score += 0.5;
        if (results.emoji_pattern?.suspicious) score += 3.0;
        if (results.variation_selectors?.suspicious) score += 3.5;
    } else if (media_type === "Image") {
        if (results.image_res?.suspicious) score += 4.0;
    }

    return Math.min(100, Math.floor((score / max_score) * 100));
}

function getSeverity(score: number): Severity {
    if (score >= 70) return 'HIGH-RISK';
    if (score >= 40) return 'SUSPICIOUS';
    return 'CLEAN';
}


export async function analyzeContent(
  prevState: any,
  formData: FormData
): Promise<ScanResult | { error: string }> {
  try {
    await sleep(1000); // Simulate processing time

    const text = formData.get('textInput') as string | null;
    const imageFile = formData.get('imageInput') as File | null;
    const imageBuffer = imageFile && imageFile.size > 0 ? await imageFile.arrayBuffer() : null;

    if (!text && !imageBuffer) {
      return { error: 'No content provided to analyze.' };
    }
    
    const text_in = unicode.expand_unicode_escapes(text || "");
    const media_type = classify_input(text_in, imageBuffer);
    
    let results: any = {};
    let rawFindings = {};

    if (media_type === 'Text' || media_type === 'Emoji') {
        const z = unicode.detect_zero_width(text_in);
        const h = unicode.detect_homoglyphs(text_in);
        const ta = detect_text_anomalies(text_in);
        const ep = emoji.detect_emoji_patterns(text_in);
        const vs = unicode.detect_variation_selectors(text_in);
        results = { zero_width: z, homoglyph: h, text_anom: ta, emoji_pattern: ep, variation_selectors: vs };
        rawFindings = results;
    } else if (media_type === 'Image') {
        try {
            const ir = await image_detector(imageFile!);
            results = { image_res: ir };
            rawFindings = results;
        } catch (e) {
            console.error(e);
            return { error: 'Image processing failed.' };
        }
    }

    const score = fuse_scores(media_type, results);
    const severity = getSeverity(score);

    const summaryResult = await summarizeFindings({
      findings: JSON.stringify(rawFindings, null, 2),
      type: media_type,
      severity: severity === 'HIGH-RISK' ? 'HIGH-RISK STEGANOGRAPHY DETECTED' : severity,
    });
    
    return {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      type: media_type,
      severity: severity,
      summary: summaryResult.summary,
      rawFindings: JSON.stringify(rawFindings, null, 2),
      score: score
    };

  } catch (e: any) {
    console.error("An unexpected error occurred in analyzeContent:", e);
    return { error: e.message || 'An unexpected server error occurred during analysis.' };
  }
}

// These functions call Genkit flows and don't need to change.
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


// --- EmojiEncode actions ---

export async function encodeEmoji(
    prevState: any,
    formData: FormData
) : Promise<{encoded: string} | {error: string}> {
    const message = formData.get('message') as string;
    const password = formData.get('password') as string;

    if (!message) {
        return { error: 'Message cannot be empty.' };
    }
    try {
        const encoded = emoji.encode(message, password);
        return { encoded };
    } catch (e: any) {
        return { error: e.message || "Encoding failed." };
    }
}

export async function decodeEmoji(
    prevState: any,
    formData: FormData
) : Promise<{decoded: string} | {error: string}> {
    const encodedMessage = formData.get('encodedMessage') as string;
    const password = formData.get('password') as string;

    if (!encodedMessage) {
        return { error: 'Encoded message cannot be empty.' };
    }
    try {
        const decoded = emoji.decode(encodedMessage, password);
        return { decoded };
    } catch (e: any) {
        return { error: e.message || "Decoding failed. Check your input and password." };
    }
}


// --- Zero-Width Steganography actions ---

export async function encodeZeroWidth(
    prevState: any,
    formData: FormData
) : Promise<{encoded: string} | {error: string}> {
    const sourceText = formData.get('sourceText') as string;
    const secretMessage = formData.get('secretMessage') as string;
    const position = formData.get('position') as Position;
    const k = parseInt(formData.get('k') as string) || 1;

    if (!sourceText) {
        return { error: 'Source text cannot be empty.' };
    }
    if (!secretMessage) {
        return { error: 'Secret message cannot be empty.' };
    }
    try {
        const encoded = zeroWidth.zeroEncode(sourceText, secretMessage, position, k);
        return { encoded };
    } catch (e: any) {
        return { error: e.message || "Encoding failed." };
    }
}

export async function decodeZeroWidth(
    prevState: any,
    formData: FormData
) : Promise<{decoded: string} | {error: string}> {
    const encodedText = formData.get('encodedText') as string;

    if (!encodedText) {
        return { error: 'Encoded text cannot be empty.' };
    }
    try {
        const decoded = zeroWidth.zeroDecode(encodedText);
        return { decoded };
    } catch (e: any) {
        return { error: e.message || "Decoding failed." };
    }
}

export async function cleanZeroWidth(
    prevState: any,
    formData: FormData
) : Promise<{cleaned: string; removedCount?: number} | {error: string}> {
    const textToClean = formData.get('textToClean') as string;

    if (!textToClean) {
        return { error: 'Text to clean cannot be empty.' };
    }
    try {
        const cleaned = zeroWidth.cleanString(textToClean);
        const removedCount = textToClean.length - cleaned.length;
        return { cleaned, removedCount };
    } catch (e: any) {
        return { error: e.message || "Cleaning failed." };
    }
}

export async function generateZeroWidthSample(topic: string, secretMessage: string) {
    try {
        // Generate sample text using AI
        const result = await generateSampleTextFlow({ topic, hiddenMessage: secretMessage });
        
        if ('error' in result) {
            return result;
        }
        
        // Encode the secret message into the generated text using zero-width characters
        const encoded = zeroWidth.zeroEncode(
            result.sampleText,
            secretMessage,
            Position.BOTTOM,
            1
        );
        
        return { sampleText: encoded };
    } catch(e) {
        console.error(e);
        return { error: 'Failed to generate zero-width sample text.' };
    }
}
