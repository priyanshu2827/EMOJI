/**
 * Code-specific detection module
 * Detects smart quotes, character composition, and other code-related issues
 */

// Smart quotes that can break code syntax
export const SMART_QUOTES = {
    LEFT_DOUBLE: '\u201C',  // "
    RIGHT_DOUBLE: '\u201D', // "
    LEFT_SINGLE: '\u2018',  // '
    RIGHT_SINGLE: '\u2019', // '
    DOUBLE_LOW_9: '\u201E', // „
    SINGLE_LOW_9: '\u201A', // ‚
    DOUBLE_ANGLE_LEFT: '\u00AB',  // «
    DOUBLE_ANGLE_RIGHT: '\u00BB', // »
    SINGLE_ANGLE_LEFT: '\u2039',  // ‹
    SINGLE_ANGLE_RIGHT: '\u203A', // ›
} as const;

export interface SmartQuoteDetection {
    char: string;
    position: number;
    type: string;
    replacement: string;
}

export interface SmartQuoteResult {
    detected: boolean;
    positions: SmartQuoteDetection[];
    count: number;
}

// Detect smart quotes in text
export function detectSmartQuotes(text: string): SmartQuoteResult {
    const positions: SmartQuoteDetection[] = [];

    const quoteMap: Record<string, { type: string; replacement: string }> = {
        [SMART_QUOTES.LEFT_DOUBLE]: { type: 'LEFT_DOUBLE_QUOTE', replacement: '"' },
        [SMART_QUOTES.RIGHT_DOUBLE]: { type: 'RIGHT_DOUBLE_QUOTE', replacement: '"' },
        [SMART_QUOTES.LEFT_SINGLE]: { type: 'LEFT_SINGLE_QUOTE', replacement: "'" },
        [SMART_QUOTES.RIGHT_SINGLE]: { type: 'RIGHT_SINGLE_QUOTE', replacement: "'" },
        [SMART_QUOTES.DOUBLE_LOW_9]: { type: 'DOUBLE_LOW_9_QUOTE', replacement: '"' },
        [SMART_QUOTES.SINGLE_LOW_9]: { type: 'SINGLE_LOW_9_QUOTE', replacement: "'" },
        [SMART_QUOTES.DOUBLE_ANGLE_LEFT]: { type: 'DOUBLE_ANGLE_LEFT', replacement: '"' },
        [SMART_QUOTES.DOUBLE_ANGLE_RIGHT]: { type: 'DOUBLE_ANGLE_RIGHT', replacement: '"' },
        [SMART_QUOTES.SINGLE_ANGLE_LEFT]: { type: 'SINGLE_ANGLE_LEFT', replacement: "'" },
        [SMART_QUOTES.SINGLE_ANGLE_RIGHT]: { type: 'SINGLE_ANGLE_RIGHT', replacement: "'" },
    };

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char in quoteMap) {
            positions.push({
                char,
                position: i,
                type: quoteMap[char].type,
                replacement: quoteMap[char].replacement,
            });
        }
    }

    return {
        detected: positions.length > 0,
        positions,
        count: positions.length,
    };
}

// Character composition analysis
export interface CharacterComposition {
    alphabetic: number;
    numeric: number;
    whitespace: number;
    symbols: number;
    control: number;
    invisible: number;
    total: number;
    percentages: {
        alphabetic: number;
        numeric: number;
        whitespace: number;
        symbols: number;
        control: number;
        invisible: number;
    };
    suspicious: boolean;
    suspicionReasons: string[];
}

// Analyze character composition of text
export function analyzeCharacterComposition(text: string): CharacterComposition {
    let alphabetic = 0;
    let numeric = 0;
    let whitespace = 0;
    let symbols = 0;
    let control = 0;
    let invisible = 0;

    const invisibleChars = new Set([
        '\u200B', '\u200C', '\u200D', '\uFEFF', // Zero-width
        '\u200E', '\u200F', // LTR/RTL marks
        '\u202A', '\u202B', '\u202C', '\u202D', '\u202E', // BiDi
        '\u2066', '\u2067', '\u2068', '\u2069', // Isolates
        '\uFE0E', '\uFE0F', // Variation selectors
    ]);

    for (const char of text) {
        const code = char.charCodeAt(0);

        // Check for invisible characters
        if (invisibleChars.has(char)) {
            invisible++;
            control++;
            continue;
        }

        // Control characters (0x00-0x1F, 0x7F-0x9F)
        if ((code >= 0x00 && code <= 0x1F) || (code >= 0x7F && code <= 0x9F)) {
            control++;
        }
        // Alphabetic (A-Z, a-z, and Unicode letters)
        else if (/\p{L}/u.test(char)) {
            alphabetic++;
        }
        // Numeric (0-9 and Unicode numbers)
        else if (/\p{N}/u.test(char)) {
            numeric++;
        }
        // Whitespace
        else if (/\s/.test(char)) {
            whitespace++;
        }
        // Everything else is a symbol
        else {
            symbols++;
        }
    }

    const total = text.length;
    const percentages = {
        alphabetic: total > 0 ? (alphabetic / total) * 100 : 0,
        numeric: total > 0 ? (numeric / total) * 100 : 0,
        whitespace: total > 0 ? (whitespace / total) * 100 : 0,
        symbols: total > 0 ? (symbols / total) * 100 : 0,
        control: total > 0 ? (control / total) * 100 : 0,
        invisible: total > 0 ? (invisible / total) * 100 : 0,
    };

    // Determine if composition is suspicious
    const suspicionReasons: string[] = [];
    let suspicious = false;

    // High ratio of control characters (>5%)
    if (percentages.control > 5) {
        suspicious = true;
        suspicionReasons.push(`high_control_char_ratio (${percentages.control.toFixed(1)}%)`);
    }

    // High ratio of invisible characters (>2%)
    if (percentages.invisible > 2) {
        suspicious = true;
        suspicionReasons.push(`high_invisible_char_ratio (${percentages.invisible.toFixed(1)}%)`);
    }

    // Very low alphabetic content in text with reasonable length (< 20%)
    if (total > 50 && percentages.alphabetic < 20 && percentages.numeric < 20) {
        suspicious = true;
        suspicionReasons.push(`low_readable_content (${(percentages.alphabetic + percentages.numeric).toFixed(1)}%)`);
    }

    // Extremely high symbol ratio (>50%)
    if (percentages.symbols > 50 && total > 20) {
        suspicious = true;
        suspicionReasons.push(`high_symbol_ratio (${percentages.symbols.toFixed(1)}%)`);
    }

    return {
        alphabetic,
        numeric,
        whitespace,
        symbols,
        control,
        invisible,
        total,
        percentages,
        suspicious,
        suspicionReasons,
    };
}

// Comprehensive code analysis
export interface CodeAnalysisResult {
    smartQuotes: SmartQuoteResult;
    composition: CharacterComposition;
    suspicious: boolean;
    riskScore: number;
    reasons: string[];
}

export function analyzeCode(text: string): CodeAnalysisResult {
    const smartQuotes = detectSmartQuotes(text);
    const composition = analyzeCharacterComposition(text);

    const reasons: string[] = [];
    let riskScore = 0;

    // Smart quotes add minor risk (syntax errors)
    if (smartQuotes.detected) {
        reasons.push(`smart_quotes_detected (${smartQuotes.count} instances)`);
        riskScore += Math.min(15, smartQuotes.count * 2);
    }

    // Suspicious composition adds significant risk
    if (composition.suspicious) {
        reasons.push(...composition.suspicionReasons);
        riskScore += 25;
    }

    return {
        smartQuotes,
        composition,
        suspicious: smartQuotes.detected || composition.suspicious,
        riskScore: Math.min(100, riskScore),
        reasons,
    };
}
