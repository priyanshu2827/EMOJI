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
export const ZERO_WIDTH_CHARS = new Set(['\u200B', '\u200C', '\u200D', '\uFEFF']);
export const VARIATION_SELECTORS = new Set([
    '\uFE00', '\uFE01', '\uFE02', '\uFE03', '\uFE04', '\uFE05', '\uFE06', '\uFE07',
    '\uFE08', '\uFE09', '\uFE0A', '\uFE0B', '\uFE0C', '\uFE0D', '\uFE0E', '\uFE0F'
]);


export function contains_zero_width(s: string): boolean {
    for (const char of s) {
        if (ZERO_WIDTH_CHARS.has(char)) {
            return true;
        }
    }
    return false;
}

export function get_grapheme_clusters(s: string): string[] {
    return s.match(/(\P{Mark}\p{Mark}*)/gu) || [];
}


export const HOMOGLYPHS: Record<string, string> = {
    'а': 'a', 'е': 'e', 'о': 'o', 'Ι': 'I', 'Ѕ': 'S', 'і': 'i', 'с': 'c'
};

export function detect_zero_width(text: string) {
    const found = [...ZERO_WIDTH_CHARS].filter(c => text.includes(c));
    return { present: !!found.length, chars: found };
}

export function detect_homoglyphs(text: string) {
    const found: { char: string, looks_like: string }[] = [];
    for (const ch of text) {
        if (ch in HOMOGLYPHS) {
            found.push({ char: ch, looks_like: HOMOGLYPHS[ch] });
        }
    }
    return { present: !!found.length, samples: found.slice(0, 5) };
}

export function shannon_entropy(s: string): number {
    if (!s) return 0.0;
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

// This is a simplified stand-in for unicodedata.category
// A full implementation is very large. This covers common control chars.
export function get_unicode_category(ch: string): string {
    const code = ch.charCodeAt(0);
    if (code >= 0x00 && code <= 0x1F) return "Cc"; // C0 controls
    if (code >= 0x7F && code <= 0x9F) return "Cc"; // DEL and C1 controls
    if (ch.trim() === '') return 'Zs'; // Space separator
    // Add more categories as needed for a more robust solution
    return "Lo"; // Letter, other (default)
}

export function detect_variation_selectors(text: string) {
    let count = 0;
    let suspicious = false;
    for (const char of text) {
        if (VARIATION_SELECTORS.has(char)) {
            count++;
        }
    }
    // If more than a few selectors are used, it might be suspicious
    if (count > 3) {
        suspicious = true;
    }
    return { suspicious, count };
}