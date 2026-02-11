// This is a TypeScript port of the logic from https://github.com/mauricelambert/EmojiEncode

const EMOJI_CHARS = "😂😍😭🔥🤔🤯👍🎉🤩🤢🤮😱👋🙏🤝👏👎🤡🤑😎🤓🧐🤖👽👻💀👾🐸🐵🙈🙉🙊🐒🐔🐧🐦🐤🐣🐺🐗🐴🦄🐝🐛🦋🐌🐞🐜🦗🕷🦂🐢🐍🦎🐙🦑🦐🦞🦀🐡🐠🐟🐬🐳🐋🦈🐊🐅🐆🦓🦍🐘🦛🐪🦒𦘘🐃🐂🐄🐎🐖🐏🐑🦙🐐🦌🐕🐩🐈🐓🦃🦚🦜🦢🕊🐇🦝🦡🐁🐀🐿𦔔🐾🐉🐲🌵🎄🌲🌳🌴🌱🌿☘️🍀🎍🎋🍃🍂🍁🍄🌾💐🌷🌹🥀🌺🌸🌼🌻🌞🌝";

function xor(data: Uint8Array, key: string): Uint8Array {
    if (!key) return data;
    const keyBytes = new TextEncoder().encode(key);
    const result = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
        result[i] = data[i] ^ keyBytes[i % keyBytes.length];
    }
    return result;
}

export function encode(message: string, key: string = ''): string {
    const encoder = new TextEncoder();
    const messageBytes = encoder.encode(message);
    const encryptedBytes = xor(messageBytes, key);

    let binaryString = '';
    for (const byte of encryptedBytes) {
        binaryString += byte.toString(2).padStart(8, '0');
    }

    const emojiMap = [...EMOJI_CHARS];
    let emojiString = '';
    for (let i = 0; i < binaryString.length; i += 7) {
        const chunk = binaryString.substring(i, i + 7).padEnd(7, '0');
        const index = parseInt(chunk, 2);
        emojiString += emojiMap[index % emojiMap.length];
    }
    return emojiString;
}


export function decode(emojiString: string, key: string = ''): string {
    const emojiMap = [...EMOJI_CHARS];
    const emojiToIndex = new Map(emojiMap.map((emoji, i) => [emoji, i]));

    let binaryString = '';
    const emojiChars = [...emojiString]; // Split string into an array of grapheme clusters (emojis)

    for (const emoji of emojiChars) {
        const index = emojiToIndex.get(emoji);
        if (index === undefined) {
            // This case handles situations where an emoji might be followed by a variation selector
            // which is a separate character but part of the same visual glyph.
            // We just try to decode the base emoji.
            if (emoji.length > 1) {
                const baseEmoji = emoji[0];
                const baseIndex = emojiToIndex.get(baseEmoji);
                if (baseIndex !== undefined) {
                    binaryString += baseIndex.toString(2).padStart(7, '0');
                    continue;
                }
            }
            throw new Error(`Invalid emoji character detected: ${emoji}`);
        }
        binaryString += index.toString(2).padStart(7, '0');
    }

    const byteLength = Math.floor(binaryString.length / 8);
    const bytes = new Uint8Array(byteLength);
    for (let i = 0; i < byteLength; i++) {
        const byte = binaryString.substring(i * 8, (i + 1) * 8);
        bytes[i] = parseInt(byte, 2);
    }

    const decryptedBytes = xor(bytes, key);
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBytes);
}

// Enhanced emoji security configuration
export interface EmojiSecurityConfig {
    maxTokensPerCluster?: number;
    detectTokenExplosion?: boolean;
    detectGraphemeManipulation?: boolean;
    detectVariationSelectors?: boolean;
    strictMode?: boolean;
}

export interface EmojiThreatReport {
    suspicious: boolean;
    threats: {
        tokenExplosion?: { clusters: string[]; count: number };
        graphemeManipulation?: { clusters: string[]; count: number };
        variationSelectorAbuse?: { positions: number[]; count: number };
        encodingPattern?: { detected: boolean; confidence: number };
    };
    reasons: string[];
    riskScore: number;
}

// Zero-width joiners and variation selectors
const ZERO_WIDTH_JOINER = '\u200D';
const VARIATION_SELECTOR_15 = '\uFE0E'; // Text presentation
const VARIATION_SELECTOR_16 = '\uFE0F'; // Emoji presentation

// Simple tokenizer for token explosion detection
function simpleTokenize(text: string): string[] {
    // Split on whitespace and punctuation
    return text.split(/[\s\p{P}]+/u).filter(t => t.length > 0);
}

// Detect token explosion in grapheme clusters
export function detectTokenExplosion(text: string, maxTokensPerCluster: number = 3): {
    suspicious: boolean;
    clusters: string[];
    reasons: string[]
} {
    const clusters = getGraphemeClusters(text);
    const suspiciousClusters: string[] = [];
    const reasons: string[] = [];

    for (const cluster of clusters) {
        const tokens = simpleTokenize(cluster);

        // Check for excessive ZWJ sequences (family emojis, etc.)
        const zwjCount = (cluster.match(/\u200D/g) || []).length;
        if (zwjCount > 2) {
            suspiciousClusters.push(cluster);
            reasons.push(`excessive_zwj_sequences (${zwjCount} joiners)`);
            continue;
        }

        // Check token count per cluster
        if (tokens.length > maxTokensPerCluster && cluster.length < 10) {
            suspiciousClusters.push(cluster);
            reasons.push(`token_explosion (${tokens.length} tokens in small cluster)`);
        }
    }

    return {
        suspicious: suspiciousClusters.length > 0,
        clusters: suspiciousClusters,
        reasons: Array.from(new Set(reasons))
    };
}

// Get grapheme clusters (simplified implementation)
function getGraphemeClusters(text: string): string[] {
    const clusters: string[] = [];
    let i = 0;

    while (i < text.length) {
        let cluster = text[i];
        i++;

        // Handle surrogate pairs
        if (i < text.length && isLowSurrogate(text.charCodeAt(i))) {
            cluster += text[i];
            i++;
        }

        // Combine with ZWJ sequences and variation selectors
        while (i < text.length && (
            text[i] === ZERO_WIDTH_JOINER ||
            text[i] === VARIATION_SELECTOR_15 ||
            text[i] === VARIATION_SELECTOR_16 ||
            isCombiningMark(text[i])
        )) {
            cluster += text[i];
            i++;

            // After ZWJ, include the next character (emoji)
            if (text[i - 1] === ZERO_WIDTH_JOINER && i < text.length) {
                cluster += text[i];
                i++;
                if (i < text.length && isLowSurrogate(text.charCodeAt(i))) {
                    cluster += text[i];
                    i++;
                }
            }
        }

        clusters.push(cluster);
    }

    return clusters;
}

function isLowSurrogate(code: number): boolean {
    return code >= 0xDC00 && code <= 0xDFFF;
}

function isCombiningMark(char: string): boolean {
    const code = char.charCodeAt(0);
    return (
        (code >= 0x0300 && code <= 0x036F) ||
        (code >= 0x1AB0 && code <= 0x1AFF) ||
        (code >= 0x1DC0 && code <= 0x1DFF) ||
        (code >= 0x20D0 && code <= 0x20FF) ||
        (code >= 0xFE20 && code <= 0xFE2F)
    );
}

// Analyze grapheme clusters for manipulation
export function analyzeGraphemeClusters(text: string): {
    suspicious: boolean;
    complexClusters: string[];
    reasons: string[]
} {
    const clusters = getGraphemeClusters(text);
    const complexClusters: string[] = [];
    const reasons: string[] = [];

    for (const cluster of clusters) {
        // Check for overly complex clusters
        if (cluster.length > 10) {
            complexClusters.push(cluster);
            reasons.push(`overly_complex_cluster (${cluster.length} chars)`);
            continue;
        }

        // Check for multiple combining marks
        const combiningCount = Array.from(cluster).filter(isCombiningMark).length;
        if (combiningCount > 3) {
            complexClusters.push(cluster);
            reasons.push(`excessive_combining_marks (${combiningCount} marks)`);
        }

        // Check for mixed ZWJ and variation selectors
        const hasZWJ = cluster.includes(ZERO_WIDTH_JOINER);
        const hasVS = cluster.includes(VARIATION_SELECTOR_15) || cluster.includes(VARIATION_SELECTOR_16);
        if (hasZWJ && hasVS && cluster.length > 5) {
            complexClusters.push(cluster);
            reasons.push('mixed_zwj_and_variation_selectors');
        }
    }

    return {
        suspicious: complexClusters.length > 0,
        complexClusters,
        reasons: Array.from(new Set(reasons))
    };
}

// Detect variation selector abuse
export function detectVariationSelectorAbuse(text: string): {
    suspicious: boolean;
    positions: number[];
    reasons: string[]
} {
    const positions: number[] = [];
    const reasons: string[] = [];
    let vsCount = 0;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === VARIATION_SELECTOR_15 || char === VARIATION_SELECTOR_16) {
            vsCount++;
            positions.push(i);

            // Check for consecutive variation selectors
            if (i > 0 && (text[i - 1] === VARIATION_SELECTOR_15 || text[i - 1] === VARIATION_SELECTOR_16)) {
                reasons.push('consecutive_variation_selectors');
            }
        }
    }

    // Check for excessive variation selectors
    const vsRatio = vsCount / Math.max(1, text.length);
    if (vsRatio > 0.1) {
        reasons.push(`high_variation_selector_density (${(vsRatio * 100).toFixed(1)}%)`);
    }

    return {
        suspicious: reasons.length > 0,
        positions,
        reasons: Array.from(new Set(reasons))
    };
}

// Enhanced emoji security scan
export function enhancedEmojiSecurityScan(
    text: string,
    config: EmojiSecurityConfig = {}
): EmojiThreatReport {
    const cfg = {
        maxTokensPerCluster: 3,
        detectTokenExplosion: true,
        detectGraphemeManipulation: true,
        detectVariationSelectors: true,
        strictMode: false,
        ...config
    };

    const threats: EmojiThreatReport['threats'] = {};
    const reasons: string[] = [];
    let riskScore = 0;

    // Check for encoding pattern (original detection)
    const encodingCheck = detect_emoji_patterns(text);
    if (encodingCheck.suspicious) {
        threats.encodingPattern = { detected: true, confidence: 0.9 };
        reasons.push(...encodingCheck.reasons);
        riskScore += 40;
    }

    // Token explosion detection
    if (cfg.detectTokenExplosion) {
        const tokenCheck = detectTokenExplosion(text, cfg.maxTokensPerCluster);
        if (tokenCheck.suspicious) {
            threats.tokenExplosion = {
                clusters: tokenCheck.clusters,
                count: tokenCheck.clusters.length
            };
            reasons.push(...tokenCheck.reasons);
            riskScore += 35;
        }
    }

    // Grapheme cluster analysis
    if (cfg.detectGraphemeManipulation) {
        const graphemeCheck = analyzeGraphemeClusters(text);
        if (graphemeCheck.suspicious) {
            threats.graphemeManipulation = {
                clusters: graphemeCheck.complexClusters,
                count: graphemeCheck.complexClusters.length
            };
            reasons.push(...graphemeCheck.reasons);
            riskScore += 30;
        }
    }

    // Variation selector detection
    if (cfg.detectVariationSelectors) {
        const vsCheck = detectVariationSelectorAbuse(text);
        if (vsCheck.suspicious) {
            threats.variationSelectorAbuse = {
                positions: vsCheck.positions,
                count: vsCheck.positions.length
            };
            reasons.push(...vsCheck.reasons);
            riskScore += 25;
        }
    }

    return {
        suspicious: riskScore > 0,
        threats,
        reasons: Array.from(new Set(reasons)),
        riskScore: Math.min(100, riskScore)
    };
}

// Legacy function for backward compatibility
export function detect_emoji_patterns(text: string) {
    // This is a simplified check to see if the text consists ONLY of the
    // special emoji characters used for encoding. A real scenario might
    // be more complex.
    const uniqueChars = new Set([...text]);
    const emojiSet = new Set([...EMOJI_CHARS]);
    let suspicious = false;
    const reasons: string[] = [];

    let emojiOnly = true;
    for (const char of uniqueChars) {
        if (!emojiSet.has(char)) {
            emojiOnly = false;
            break;
        }
    }

    if (emojiOnly && text.length > 10) {
        suspicious = true;
        reasons.push('high_density_of_specific_encoding_emojis');
    }

    return { suspicious, reasons };
}
