'use server';

import { summarizeFindings } from '@/ai/flows/summarize-findings';
import { generateSampleText as generateSampleTextFlow } from '@/ai/flows/generate-sample-text';
import { suggestWhitelist as suggestWhitelistFlow } from '@/ai/flows/suggest-whitelist';
import type { ContentType, ScanResult, Severity } from './types';

// Helper to simulate a delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Unicode and Text helpers ---
const ZERO_WIDTH_CHARS = new Set(['\u200B', '\u200C', '\u200D', '\uFEFF']);
const EMOJI_REGEX = /\p{Extended_Pictographic}/u;

function contains_zero_width(s: string): boolean {
    for (const char of s) {
        if (ZERO_WIDTH_CHARS.has(char)) {
            return true;
        }
    }
    return false;
}

// --- Media-type classifier ---
function classify_input(text: string | null, file_bytes: ArrayBuffer | null): ContentType {
    if (file_bytes && file_bytes.byteLength > 0) {
        return "Image";
    }
    const txt = text || "";
    if (contains_zero_width(txt)) {
        return "Text";
    }
    // This is a simplified grapheme cluster regex for JS.
    const clusters = txt.match(/(\P{Mark}\p{Mark}*)/gu) || [];
    if (!clusters.length) {
        return "Text";
    }
    const emoji_clusters = clusters.filter(c => EMOJI_REGEX.test(c));
    if (emoji_clusters.length >= Math.max(1, clusters.length / 2)) {
        return "Emoji";
    }
    return "Text";
}

// --- Text detectors ---
const HOMOGLYPHS: Record<string, string> = {
    'а': 'a', 'е': 'e', 'о': 'o', 'Ι': 'I', 'Ѕ': 'S', 'і': 'i', 'с': 'c'
};

function detect_zero_width(text: string) {
    const found = [...ZERO_WIDTH_CHARS].filter(c => text.includes(c));
    return { present: !!found.length, chars: found };
}

function detect_homoglyphs(text: string) {
    const found: { char: string, looks_like: string }[] = [];
    for (const ch of text) {
        if (ch in HOMOGLYPHS) {
            found.push({ char: ch, looks_like: HOMOGLYPHS[ch] });
        }
    }
    return { present: !!found.length, samples: found.slice(0, 5) };
}

function shannon_entropy(s: string): number {
    if (!s) {
        return 0.0;
    }
    const freq: Record<string, number> = {};
    for (const char of s) {
        freq[char] = (freq[char] || 0) + 1;
    }
    const len = s.length;
    return -Object.values(freq).reduce((acc, count) => {
        const p = count / len;
        return acc + p * Math.log2(p);
    }, 0);
}

// Unicode category check is complex in JS without heavy libraries. We'll simulate.
function detect_text_anomalies(text: string) {
    const suspicious = (text.match(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g) || []).map(ch => ({ char: ch, category: "Cc" }));
    const entropy = shannon_entropy(text);
    return { suspicious_unicode: suspicious.slice(0, 20), entropy: entropy };
}


// --- Emoji detectors ---
function detect_emoji_patterns(text: string) {
    const clusters = text.match(/(\P{Mark}\p{Mark}*)/gu) || [];
    const emoji_clusters = clusters.filter(c => EMOJI_REGEX.test(c));
    let suspicious = false;
    const reason: string[] = [];
    if (emoji_clusters.length > 8) {
        suspicious = true;
        reason.push('high_emoji_density');
    }
    const repeats = text.match(/((\p{Extended_Pictographic})\2{3,})/u);
    if (repeats) {
        suspicious = true;
        reason.push('repeated_grapheme_sequences');
    }
    return { suspicious: suspicious, reasons: reason, emoji_clusters_sample: emoji_clusters.slice(0, 10) };
}


// --- Image detectors (LSB heuristics) ---
function getPixelDataFromImageData(imageData: ImageData): number[] {
    // In a real scenario, you might use a canvas to draw the image and get pixel data.
    // For this simulation, we'll create a simplified representation.
    // This is NOT real pixel data.
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
    const p1 = arr.reduce((sum, val) => sum + (val & 1), 0) / arr.length;
    if (p1 === 0 || p1 === 1) {
        return 0.0;
    }
    const p0 = 1 - p1;
    return -(p1 * Math.log2(p1) + p0 * Math.log2(p0));
}

async function image_detector(image: File) {
    const buffer = await image.arrayBuffer();
    // We can't use PIL/Numpy, so we'll simulate LSB analysis by looking at file properties.
    // This is a major simplification.
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

    if (media_type === "Text") {
        if (results.zero_width?.present) score += 2.5;
        if (results.homoglyph?.present) score += 2.0;
        if (results.text_anom?.entropy > 4.0) score += 0.5;
    } else if (media_type === "Emoji") {
        if (results.emoji_pattern?.suspicious) score += 3.0;
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
  await sleep(1000); // Simulate processing time

  const text = formData.get('textInput') as string | null;
  const imageFile = formData.get('imageInput') as File | null;
  const imageBuffer = imageFile && imageFile.size > 0 ? await imageFile.arrayBuffer() : null;

  if (!text && !imageBuffer) {
    return { error: 'No content provided to analyze.' };
  }

  const contentType = classify_input(text, imageBuffer);
  
  let results: any = {};
  let rawFindings = {};

  if (contentType === 'Text') {
      const z = detect_zero_width(text!);
      const h = detect_homoglyphs(text!);
      const ta = detect_text_anomalies(text!);
      results = { zero_width: z, homoglyph: h, text_anom: ta };
      rawFindings = results;
  } else if (contentType === 'Emoji') {
      const ep = detect_emoji_patterns(text!);
      results = { emoji_pattern: ep };
      rawFindings = results;
  } else if (contentType === 'Image') {
      try {
          const ir = await image_detector(imageFile!);
          results = { image_res: ir };
          rawFindings = results;
      } catch (e) {
          console.error(e);
          return { error: 'Image processing failed.' };
      }
  }

  const score = fuse_scores(contentType, results);
  const severity = getSeverity(score);

  try {
    const summaryResult = await summarizeFindings({
      findings: JSON.stringify(rawFindings, null, 2),
      type: contentType,
      severity: severity === 'HIGH-RISK' ? 'HIGH-RISK STEGANOGRAPHY DETECTED' : severity,
    });
    
    return {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: contentType,
      severity: severity,
      summary: summaryResult.summary,
      rawFindings: JSON.stringify(rawFindings, null, 2),
      score: score
    };

  } catch (e) {
    console.error(e);
    return { error: 'Failed to get summary from AI. Please try again.' };
  }
}


// These functions remain the same as they call Genkit flows.
export async function generateSampleText(topic: string, hiddenMessage: string) {
    try {
        const result = await generateSampleTextFlow({ topic, hiddenMessage });
        // The flow now handles encoding, so we just return the result.
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
