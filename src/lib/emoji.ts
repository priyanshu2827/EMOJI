// This is a TypeScript port of the logic from https://github.com/mauricelambert/EmojiEncode

const EMOJI_CHARS = "😂😍😭🔥🤔🤯👍🎉🤩🤢🤮😱👋🙏🤝👏👎🤡🤑😎🤓🧐🤖👽👻💀👾🐸🐵🙈🙉🙊🐒🐔🐧🐦🐤🐣🐺🐗🐴🦄🐝🐛🦋🐌🐞🐜🦗🕷🦂🐢🐍🦎🐙🦑🦐🦞🦀🐡🐠🐟🐬🐳🐋🦈🐊🐅🐆🦓🦍🐘🦛🐪🦒𦘘🐃🐂🐄🐎🐖🐏🐑𦙙🐐🦌🐕🐩🐈🐓🦃𦚚🦜🦢🕊🐇𦛛𦜜🐁🐀🐿𦔔🐾🐉🐲🌵🎄🌲🌳🌴🌱🌿☘️🍀🎍🎋🍃🍂🍁🍄🌾💐🌷🌹🥀🌺🌸🌼🌻🌞🌝";

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
    for (const byte of encryptedBytes) binaryString += byte.toString(2).padStart(8, '0');
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
    const emojiChars = [...emojiString];
    for (const emoji of emojiChars) {
        const index = emojiToIndex.get(emoji);
        if (index === undefined) {
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
    return new TextDecoder().decode(decryptedBytes);
}

export interface EmojiSecurityConfig {
    maxTokensPerCluster?: number;
    detectTokenExplosion?: boolean;
    detectGraphemeManipulation?: boolean;
    detectVariationSelectors?: boolean;
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
    verifiedPayload?: string;
}

const ZERO_WIDTH_JOINER = '\u200D';
export const VARIATION_SELECTORS_EXTENDED = new Array(16).fill(0).map((_, i) =>
    String.fromCharCode(0xFE00 + i)
);

function simpleTokenize(text: string): string[] {
    return text.split(/[\s\p{P}]+/u).filter(t => t.length > 0);
}

export function detectTokenExplosion(text: string, maxTokensPerCluster: number = 3) {
    const clusters = getGraphemeClusters(text);
    const suspiciousClusters: string[] = [];
    const reasons: string[] = [];
    for (const cluster of clusters) {
        const tokens = simpleTokenize(cluster);
        const zwjCount = (cluster.match(/\u200D/g) || []).length;
        if (zwjCount > 2) {
            suspiciousClusters.push(cluster);
            reasons.push(`excessive_zwj_sequences (${zwjCount} joiners)`);
            continue;
        }
        if (tokens.length > maxTokensPerCluster && cluster.length < 10) {
            suspiciousClusters.push(cluster);
            reasons.push(`token_explosion (${tokens.length} tokens )`);
        }
    }
    return { suspicious: suspiciousClusters.length > 0, clusters: suspiciousClusters, reasons };
}

function getGraphemeClusters(text: string): string[] {
    const clusters: string[] = [];
    let i = 0;
    while (i < text.length) {
        let cluster = text[i++];
        if (i < text.length && isLowSurrogate(text.charCodeAt(i))) cluster += text[i++];
        while (i < text.length && (text[i] === ZERO_WIDTH_JOINER || VARIATION_SELECTORS_EXTENDED.includes(text[i]) || isCombiningMark(text[i]))) {
            cluster += text[i++];
            if (text[i - 1] === ZERO_WIDTH_JOINER && i < text.length) {
                cluster += text[i++];
                if (i < text.length && isLowSurrogate(text.charCodeAt(i))) cluster += text[i++];
            }
        }
        clusters.push(cluster);
    }
    return clusters;
}

function isLowSurrogate(code: number): boolean { return code >= 0xDC00 && code <= 0xDFFF; }
function isCombiningMark(char: string): boolean {
    const code = char.charCodeAt(0);
    return (code >= 0x0300 && code <= 0x036F) || (code >= 0x1AB0 && code <= 0x1AFF) || (code >= 0x1DC0 && code <= 0x1DFF) || (code >= 0x20D0 && code <= 0x20FF) || (code >= 0xFE20 && code <= 0xFE2F);
}

export function analyzeGraphemeClusters(text: string) {
    const clusters = getGraphemeClusters(text);
    const complexClusters: string[] = [];
    const reasons: string[] = [];
    for (const cluster of clusters) {
        if (cluster.length > 10) {
            complexClusters.push(cluster);
            reasons.push(`overly_complex_cluster (${cluster.length} chars)`);
            continue;
        }
        const combiningCount = Array.from(cluster).filter(isCombiningMark).length;
        if (combiningCount > 3) {
            complexClusters.push(cluster);
            reasons.push(`excessive_combining_marks (${combiningCount} marks)`);
        }
        const hasZWJ = cluster.includes(ZERO_WIDTH_JOINER);
        const hasVS = VARIATION_SELECTORS_EXTENDED.some(vs => cluster.includes(vs));
        if (hasZWJ && hasVS && cluster.length > 5) {
            complexClusters.push(cluster);
            reasons.push('mixed_zwj_and_variation_selectors');
        }
    }
    return { suspicious: complexClusters.length > 0, complexClusters, reasons };
}

export function detectEmojiPatternFrequency(text: string) {
    const clusters = getGraphemeClusters(text);
    const complexClusters = clusters.filter(c => c.includes(ZERO_WIDTH_JOINER) || VARIATION_SELECTORS_EXTENDED.some(vs => c.includes(vs)));
    if (complexClusters.length < 5) return { suspicious: false, frequencyScore: 0, reasons: [] };
    const tailFreq: Record<string, number> = {};
    for (const cluster of complexClusters) {
        const tail = [...cluster].slice(1).join('');
        if (tail) tailFreq[tail] = (tailFreq[tail] || 0) + 1;
    }
    const uniqueTails = Object.keys(tailFreq).length;
    const frequencyScore = (complexClusters.length - uniqueTails) / complexClusters.length;

    // Sentinel Prime Decoder
    const verified = bruteForceDecodeEmoji(text);
    const reasons: string[] = [];
    if (frequencyScore > 0.7 && complexClusters.length > 8) reasons.push('high_repetition_of_stego_patterns_detected');
    if (verified) reasons.push('verified_emoji_stego_payload_found');

    return { suspicious: reasons.length > 0 || !!verified, frequencyScore, reasons, verifiedPayload: verified || undefined };
}

export function enhancedEmojiSecurityScan(text: string, config: EmojiSecurityConfig = {}): EmojiThreatReport {
    const threats: EmojiThreatReport['threats'] = {};
    const reasons: string[] = [];
    let riskScore = 0;
    let verifiedPayload: string | undefined;

    const encodingCheck = detect_emoji_patterns(text);
    if (encodingCheck.suspicious) {
        threats.encodingPattern = { detected: true, confidence: 0.9 };
        reasons.push(...encodingCheck.reasons);
        riskScore += 60; // Increased weight for specific alphabet detection
    }

    const tokenCheck = detectTokenExplosion(text, config.maxTokensPerCluster);
    if (tokenCheck.suspicious) {
        threats.tokenExplosion = { clusters: tokenCheck.clusters, count: tokenCheck.clusters.length };
        reasons.push(...tokenCheck.reasons);
        riskScore += 35;
    }

    const graphemeCheck = analyzeGraphemeClusters(text);
    if (graphemeCheck.suspicious) {
        threats.graphemeManipulation = { clusters: graphemeCheck.complexClusters, count: graphemeCheck.complexClusters.length };
        reasons.push(...graphemeCheck.reasons);
        riskScore += 30;
    }

    const vsCheck = detectVariationSelectorAbuse(text);
    if (vsCheck.suspicious) {
        threats.variationSelectorAbuse = { positions: vsCheck.positions, count: vsCheck.positions.length };
        reasons.push(...vsCheck.reasons);
        riskScore += 25;
    }

    const frequencyCheck = detectEmojiPatternFrequency(text);
    if (frequencyCheck.suspicious) {
        reasons.push(...frequencyCheck.reasons);
        riskScore += 20;
        if (frequencyCheck.verifiedPayload) verifiedPayload = frequencyCheck.verifiedPayload;
    }

    return {
        suspicious: riskScore > 0,
        threats,
        reasons: Array.from(new Set(reasons)),
        riskScore: Math.min(100, riskScore),
        verifiedPayload
    };
}

export function detectVariationSelectorAbuse(text: string) {
    const positions: number[] = [];
    const reasons: string[] = [];
    let vsCount = 0;
    for (let i = 0; i < text.length; i++) {
        if (VARIATION_SELECTORS_EXTENDED.includes(text[i])) {
            vsCount++;
            positions.push(i);
            if (i > 0 && VARIATION_SELECTORS_EXTENDED.includes(text[i - 1])) reasons.push('consecutive_variation_selectors');
        }
    }
    const vsRatio = vsCount / Math.max(1, text.length);
    if (vsRatio > 0.05) reasons.push(`high_variation_selector_density (${(vsRatio * 100).toFixed(1)}%)`);
    return { suspicious: reasons.length > 0, positions, reasons };
}

function bruteForceDecodeEmoji(text: string): string | null {
    const chars = [...text];
    const vsStream = chars.filter(c => VARIATION_SELECTORS_EXTENDED.includes(c));
    if (vsStream.length >= 10) {
        const binary = vsStream.map(v => (v === '\uFE0F' ? '1' : '0')).join('');
        if (binary.length >= 8) {
            let result = '';
            for (let i = 0; i < binary.length; i += 8) {
                const byte = binary.substring(i, i + 8);
                if (byte.length === 8) result += String.fromCharCode(parseInt(byte, 2));
            }
            if (/^[\x20-\x7E\s]{4,}$/.test(result)) return result;
        }
    }
    const emojiMap = [...EMOJI_CHARS];
    const emojiIndices = chars.map(c => emojiMap.indexOf(c)).filter(idx => idx !== -1);
    if (emojiIndices.length > 5 && emojiIndices.length === chars.length) {
        try {
            const result = decode(text, "");
            if (/^[\x20-\x7E\s]{4,}$/.test(result)) return `[DECODED]: ${result}`;
        } catch (e) { }
    }
    return null;
}

export function detect_emoji_patterns(text: string) {
    const emojiMap = [...text];
    const emojiSet = new Set([...EMOJI_CHARS]);
    let encCount = 0;
    for (const char of emojiMap) if (emojiSet.has(char)) encCount++;
    const density = encCount / Math.max(1, emojiMap.length);
    const suspicious = (density > 0.8 && text.length > 5) || (density > 0.5 && text.length > 15);
    if (suspicious) return { suspicious: true, reasons: ['high_density_of_specific_encoding_emojis'] };
    return { suspicious: false, reasons: [] };
}
