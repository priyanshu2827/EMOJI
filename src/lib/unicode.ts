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
export const ZERO_WIDTH_CHARS = new Set([
    '\u200B', // ZERO WIDTH SPACE
    '\u200C', // ZERO WIDTH NON-JOINER
    '\u200D', // ZERO WIDTH JOINER
    '\uFEFF', // ZERO WIDTH NO-BREAK SPACE
    '\u200E', // LEFT-TO-RIGHT MARK
    '\u200F', // RIGHT-TO-LEFT MARK
    '\u180E', // MONGOLIAN VOWEL SEPARATOR
]);

// Character set used specifically for ZWSP-Tool base-7 encoding
export const ZWSP_TOOL_CHARS = [
    '\u200B', // ZERO WIDTH SPACE
    '\u200C', // ZERO WIDTH NON-JOINER
    '\u200D', // ZERO WIDTH JOINER
    '\u200E', // LEFT-TO-RIGHT MARK
    '\u200F', // RIGHT-TO-LEFT MARK
    '\u180E', // MONGOLIAN VOWEL SEPARATOR
    '\ufeff', // ZERO WIDTH NO-BREAK SPACE
];
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



// Comprehensive homoglyph database from SafeText
// Organized by character set for better categorization
export const HOMOGLYPH_CATEGORIES = {
    CYRILLIC: {
        // Lowercase
        'а': 'a', 'ь': 'b', 'с': 'c', 'ԁ': 'd', 'е': 'e', 'һ': 'h', 'і': 'i',
        'ј': 'j', 'о': 'o', 'р': 'p', 'ѕ': 's', 'ѵ': 'v', 'х': 'x', 'у': 'y',
        // Uppercase
        'А': 'A', 'в': 'B', 'В': 'B', 'С': 'C', 'Е': 'E', 'ғ': 'F', 'Ғ': 'F',
        'ԍ': 'G', 'Ԍ': 'G', 'н': 'H', 'Н': 'H', 'І': 'I', 'Ј': 'J', 'к': 'K',
        'К': 'K', 'м': 'M', 'М': 'M', 'О': 'O', 'Р': 'P', 'Ѕ': 'S', 'т': 'T',
        'Т': 'T', 'Х': 'X', 'У': 'Y',
        // Additional Cyrillic
        'З': '3', 'Ч': '4', 'б': '6', 'Ъ': 'B',
    },
    GREEK: {
        // Lowercase
        'ϲ': 'c', 'ί': 'i', 'ο': 'o', 'ρ': 'p', 'ω': 'w', 'ν': 'v',
        // Uppercase
        'Α': 'A', 'Β': 'B', 'Ϲ': 'C', 'Ε': 'E', 'Η': 'H', 'Ι': 'I', 'Ϳ': 'J',
        'Κ': 'K', 'κ': 'k', 'Μ': 'M', 'Ϻ': 'M', 'Ν': 'N', 'Ο': 'O', 'Τ': 'T',
        'υ': 'U', 'Χ': 'X', 'Υ': 'Y', 'Ζ': 'Z',
    },
    ARMENIAN: {
        // Lowercase
        'ց': 'g', 'օ': 'o', 'յ': 'j', 'հ': 'h', 'ո': 'n', 'ս': 'u', 'զ': 'q',
        // Uppercase
        'Լ': 'L', 'Օ': 'O', 'Ս': 'U', 'Տ': 'S',
        // Numbers/Others
        'Ձ': '2', 'շ': '2', 'Յ': '3', 'վ': '4',
    },
    HEBREW: {
        'וֹ': 'i', 'ח': 'n', 'ס': 'O',
    },
    SCRIPT: {
        'í': 'i',
    },
} as const;

// Flattened homoglyph map for backward compatibility
export const HOMOGLYPHS: Record<string, string> = {
    ...HOMOGLYPH_CATEGORIES.CYRILLIC,
    ...HOMOGLYPH_CATEGORIES.GREEK,
    ...HOMOGLYPH_CATEGORIES.ARMENIAN,
    ...HOMOGLYPH_CATEGORIES.HEBREW,
    ...HOMOGLYPH_CATEGORIES.SCRIPT,
};

export function detect_zero_width(text: string) {
    const found = [...ZERO_WIDTH_CHARS].filter(c => text.includes(c));
    return { present: !!found.length, chars: found };
}

// Enhanced homoglyph detection with category information
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
}

export function detect_homoglyphs(text: string, detailed: boolean = false): HomoglyphResult {
    const found: { char: string, looks_like: string }[] = [];
    const byCategory: Record<string, HomoglyphDetection[]> = {};

    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch in HOMOGLYPHS) {
            found.push({ char: ch, looks_like: HOMOGLYPHS[ch] });

            if (detailed) {
                // Find which category this homoglyph belongs to
                let category = 'UNKNOWN';
                for (const [cat, chars] of Object.entries(HOMOGLYPH_CATEGORIES)) {
                    if (ch in (chars as any)) {
                        category = cat;
                        break;
                    }
                }

                if (!byCategory[category]) {
                    byCategory[category] = [];
                }
                byCategory[category].push({
                    char: ch,
                    looksLike: HOMOGLYPHS[ch],
                    position: i,
                    category,
                });
            }
        }
    }

    const result: HomoglyphResult = {
        present: !!found.length,
        samples: found.slice(0, 5),
    };

    if (detailed && found.length > 0) {
        result.detailed = {
            byCategory,
            totalCount: found.length,
            categories: Object.keys(byCategory),
        };
    }

    return result;
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