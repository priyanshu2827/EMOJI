// This file contains a port of the text analysis logic from 
// https://github.com/lorossi/invisify/blob/main/app.py
// and combines it with variation selector logic inspired by
// https://github.com/lewislovelock/UnicodeVariationSelectorTool

const ESC_RE = /\\u([0-9A-Fa-f]{4})|\\U([0-9A-Fa-f]{8})/g;

export function expand_unicode_escapes(s: string): string {
    if (!s) return s;
    return s.replace(ESC_RE, (_, hex4, hex8) => {
        const code = parseInt(hex4 || hex8, 16);
        try {
            return String.fromCodePoint(code);
        } catch {
            return '';
        }
    });
}

export const EMOJI_REGEX = /\p{Extended_Pictographic}/u;

// BIDI Control Characters (Sentinel Prime: Final 10)
export const BIDI_CHARS = new Set([
    '\u202A', '\u202B', '\u202C', '\u202D', '\u202E', // LRE, RLE, PDF, LRO, RLO
    '\u2066', '\u2067', '\u2068', '\u2069'           // LRI, RLI, FSI, PDI
]);

export const ZERO_WIDTH_CHARS = new Set([
    '\u200B', // ZERO WIDTH SPACE
    '\u200C', // ZERO WIDTH NON-JOINER
    '\u200D', // ZERO WIDTH JOINER
    '\uFEFF', // ZERO WIDTH NO-BREAK SPACE
    '\u200E', // LEFT-TO-RIGHT MARK
    '\u200F', // RIGHT-TO-LEFT MARK
    '\u180E', // MONGOLIAN VOWEL SEPARATOR
]);

export const ZWSP_TOOL_CHARS = [
    '\u200B', '\u200C', '\u200D', '\u200E', '\u200F', '\u180E', '\ufeff',
];

export const VARIATION_SELECTORS = new Set([
    '\uFE00', '\uFE01', '\uFE02', '\uFE03', '\uFE04', '\uFE05', '\uFE06', '\uFE07',
    '\uFE08', '\uFE09', '\uFE0A', '\uFE0B', '\uFE0C', '\uFE0D', '\uFE0E', '\uFE0F'
]);

export function contains_zero_width(s: string): boolean {
    for (const char of s) {
        if (ZERO_WIDTH_CHARS.has(char)) return true;
    }
    return false;
}

export function get_grapheme_clusters(s: string): string[] {
    return s.match(/(\P{Mark}\p{Mark}*)/gu) || [];
}

export const HOMOGLYPH_CATEGORIES = {
    CYRILLIC: {
        'а': 'a', 'с': 'c', 'ԁ': 'd', 'е': 'e', 'һ': 'h', 'і': 'i',
        'ј': 'j', 'о': 'o', 'р': 'p', 'ѕ': 's', 'ѵ': 'v', 'х': 'x', 'у': 'y',
        'А': 'A', 'в': 'B', 'В': 'B', 'С': 'C', 'Е': 'E', 'ғ': 'F', 'Ғ': 'F',
        'ԍ': 'G', 'Ԍ': 'G', 'н': 'H', 'Н': 'H', 'І': 'I', 'Ј': 'J', 'к': 'K',
        'К': 'K', 'м': 'M', 'М': 'M', 'О': 'O', 'Р': 'P', 'Ѕ': 'S', 'т': 'T',
        'Т': 'T', 'Х': 'X', 'У': 'Y',
        'З': '3', 'Ч': '4', 'б': '6', 'Ъ': 'B',
    },
    GREEK: {
        'ϲ': 'c', 'ί': 'i', 'ο': 'o', 'ρ': 'p', 'ω': 'w', 'ν': 'v',
        'Α': 'A', 'Β': 'B', 'Ϲ': 'C', 'Ε': 'E', 'Η': 'H', 'Ι': 'I', 'Ϳ': 'J',
        'Κ': 'K', 'κ': 'k', 'Μ': 'M', 'Ϻ': 'M', 'Ν': 'N', 'Ο': 'O', 'Τ': 'T',
        'υ': 'U', 'Χ': 'X', 'Υ': 'Y', 'Ζ': 'Z',
    },
    ARMENIAN: {
        'ց': 'g', 'օ': 'o', 'յ': 'j', 'հ': 'h', 'ո': 'n', 'ս': 'u', 'զ': 'q',
        'Լ': 'L', 'Օ': 'O', 'Ս': 'U', 'Տ': 'S',
        'Ձ': '2', 'շ': '2', 'Յ': '3', 'վ': '4',
    },
    HEBREW: { 'וֹ': 'i', 'ח': 'n', 'ס': 'O' },
    SCRIPT: { 'í': 'i' },
} as const;

export const HOMOGLYPHS: Record<string, string> = {
    ...HOMOGLYPH_CATEGORIES.CYRILLIC,
    ...HOMOGLYPH_CATEGORIES.GREEK,
    ...HOMOGLYPH_CATEGORIES.ARMENIAN,
    ...HOMOGLYPH_CATEGORIES.HEBREW,
    ...HOMOGLYPH_CATEGORIES.SCRIPT,
};

export interface ZeroWidthDetection {
    present: boolean;
    chars: string[];
    verifiedPayload?: string;
    bidiAnomalies?: {
        present: boolean;
        chars: string[];
    };
}

export function detect_zero_width(text: string): ZeroWidthDetection {
    const found = [...ZERO_WIDTH_CHARS].filter(c => text.includes(c));
    const bidiFound = [...BIDI_CHARS].filter(c => text.includes(c));
    const verified = bruteForceDecodeZeroWidth(text);

    return {
        present: found.length > 0 || bidiFound.length > 0,
        chars: found,
        verifiedPayload: verified || undefined,
        bidiAnomalies: { present: bidiFound.length > 0, chars: bidiFound }
    };
}

export interface HomoglyphDetection {
    char: string;
    looksLike: string;
    position: number;
    category: string;
}

export interface HomoglyphResult {
    present: boolean;
    samples: Array<{ char: string; looks_like: string }>;
    detailed?: {
        byCategory: Record<string, HomoglyphDetection[]>;
        totalCount: number;
        categories: string[];
    };
    markovAnomaly?: {
        score: number;
        suspicious: boolean;
    };
    visualSpoofing?: {
        detected: boolean;
        pairs: Array<{ original: string; spoof: string; similarity: number }>;
    };
}

export function detect_homoglyphs(text: string, detailed: boolean = false): HomoglyphResult {
    const found: { char: string, looks_like: string }[] = [];
    const byCategory: Record<string, HomoglyphDetection[]> = {};
    const usedScripts = new Set<string>();
    const markov = analyzeMarkovChain(text);
    const visualSpoofs: Array<{ original: string; spoof: string; similarity: number }> = [];

    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (HOMOGLYPHS[ch]) {
            const looksLike = HOMOGLYPHS[ch];
            found.push({ char: ch, looks_like: looksLike });

            // Level 8: Visual Similarity Heuristic (High-risk pairs)
            const highRiskChars = ['З', 'б', 'ѵ', 'օ', 'Տ', 'Ձ'];
            if (highRiskChars.includes(ch)) {
                visualSpoofs.push({ original: looksLike, spoof: ch, similarity: 0.99 });
            }

            if (detailed) {
                const category = Object.keys(HOMOGLYPH_CATEGORIES).find(cat =>
                    (HOMOGLYPH_CATEGORIES as any)[cat][ch]
                ) || 'UNKNOWN';
                usedScripts.add(category);
                if (!byCategory[category]) byCategory[category] = [];
                byCategory[category].push({ char: ch, looksLike, position: i, category });
            }
        }
    }

    return {
        present: found.length > 0,
        samples: found,
        detailed: detailed ? {
            byCategory,
            totalCount: found.length,
            categories: Array.from(usedScripts)
        } : undefined,
        markovAnomaly: markov,
        visualSpoofing: {
            detected: visualSpoofs.length > 0,
            pairs: visualSpoofs
        }
    };
}

/**
 * Sentinel Prime: Brute-Force Decoder
 */
function bruteForceDecodeZeroWidth(text: string): string | null {
    const stream = [...text].filter(c => ZERO_WIDTH_CHARS.has(c)).join('');
    if (stream.length < 8) return null;
    const binary = stream.replace(/\u200B/g, '0').replace(/\uFEFF/g, '1');
    if (/^[01]+$/.test(binary)) {
        const decoded = binaryToText(binary);
        if (isValidPayload(decoded)) return decoded;
    }
    const base7Codes = stream.split('').map(c => ZWSP_TOOL_CHARS.indexOf(c)).filter(idx => idx !== -1);
    if (base7Codes.length > 20) return "[VERIFIED ZWSP-TOOL PAYLOAD]";
    return null;
}

function binaryToText(bin: string): string {
    let result = '';
    for (let i = 0; i < bin.length; i += 8) {
        const byte = bin.substring(i, i + 8);
        if (byte.length === 8) result += String.fromCharCode(parseInt(byte, 2));
    }
    return result;
}

function isValidPayload(s: string): boolean {
    if (!s) return false;
    return /^[\x20-\x7E\s]{4,}$/.test(s);
}

/**
 * Sentinel Prime (Final 10): Markov n-gram Statistical Analysis
 */
export function analyzeMarkovChain(text: string): { score: number; suspicious: boolean } {
    if (text.length < 20) return { score: 0, suspicious: false };
    const chars = [...text];
    const transitions: Record<string, number> = {};
    let total = 0;
    for (let i = 0; i < chars.length - 1; i++) {
        const key = chars[i] + chars[i + 1];
        transitions[key] = (transitions[key] || 0) + 1;
        total++;
    }
    let entropy = 0;
    for (const key in transitions) {
        const p = transitions[key] / total;
        entropy -= p * Math.log2(p);
    }
    const score = entropy / Math.max(1, Math.log2(total));
    const suspicious = score > 0.85 || (score < 0.3 && text.length > 50);
    return { score, suspicious };
}