import * as unicode from './unicode';
import * as emoji from './emoji';
import * as stegoveritas from './stegoveritas-detector';
import { analyzeStego } from './steg-detector';
import { semanticStegoCheck } from './semantic-scanner';

export type ContentType = 'Text' | 'Image' | 'Emoji';

export interface DetectionResults {
    type: ContentType;
    score: number;
    severity: 'Safe' | 'Low' | 'Medium' | 'High' | 'Critical';
    findings: any;
    reasons: string[];
}

export class DetectionEngine {
    private static MAX_SCORE = 30.0;

    static async analyze(
        text: string,
        imageBuffer: ArrayBuffer | null,
        pixels: number[] | null,
        mimeType: string = 'image/png'
    ): Promise<DetectionResults> {
        let text_in = text || "";

        let media_type: ContentType = "Text";
        if (imageBuffer && imageBuffer.byteLength > 0) {
            media_type = "Image";
        } else if (unicode.EMOJI_REGEX.test(text_in)) {
            const emojiCount = (text_in.match(unicode.EMOJI_REGEX) || []).length;
            const textLength = [...text_in].length;
            if (emojiCount / textLength > 0.5) media_type = "Emoji";
        }

        let results: any = {};
        let score = 0.0;
        const reasons: string[] = [];

        if (media_type === 'Text' || media_type === 'Emoji') {
            results = this.analyzeTextAndEmoji(text_in);
            score = this.calculateTextScore(results);

            // Level 3: Semantic Perplexity AI Scan
            if (text_in.length > 50 && score > 2) {
                const aiResult = await semanticStegoCheck(text_in);
                results.semantic_ai = aiResult;
                if (aiResult.isSuspicious) {
                    score += (aiResult.perplexityScore / 10);
                    reasons.push(`semantic_anomaly_detected (${aiResult.reason})`);
                }
            }
        } else if (media_type === 'Image' && imageBuffer && pixels) {
            results = this.analyzeImage(imageBuffer, pixels, mimeType);
            score = this.calculateImageScore(results);
        }

        const finalScore = Math.min(100, Math.floor((score / this.MAX_SCORE) * 100));
        let verifiedScore = finalScore;
        const verifiedPayloads: string[] = [];
        if (results.zero_width?.verifiedPayload) verifiedPayloads.push(results.zero_width.verifiedPayload);
        if (results.emoji_threats?.verifiedPayload) verifiedPayloads.push(results.emoji_threats.verifiedPayload);

        if (verifiedPayloads.length > 0) {
            verifiedScore = 100;
            reasons.push('VERIFIED_HIDDEN_PAYLOAD_EXTRACTED');
        }

        const severity = this.getSeverity(verifiedScore);
        if (results.zero_width?.present) reasons.push('zero_width_characters_detected');
        if (results.zero_width?.bidiAnomalies?.present) reasons.push('bidi_override_anomaly_detected');
        if (results.homoglyphs?.present) reasons.push('homoglyph_characters_detected');
        if (results.homoglyphs?.markovAnomaly?.suspicious) reasons.push('unnatural_text_distribution_detected (markov)');

        return {
            type: media_type,
            score: verifiedScore,
            severity,
            findings: {
                ...results,
                verified_payloads: verifiedPayloads.length > 0 ? verifiedPayloads : undefined
            },
            reasons: Array.from(new Set(reasons))
        };
    }

    private static analyzeTextAndEmoji(text: string) {
        return {
            zero_width: unicode.detect_zero_width(text),
            homoglyphs: unicode.detect_homoglyphs(text, true),
            emoji_threats: emoji.enhancedEmojiSecurityScan(text)
        };
    }

    private static analyzeImage(buffer: ArrayBuffer, pixels: number[], mimeType: string) {
        return {
            stego_analysis: analyzeStego(pixels),
            stegoveritas_analysis: stegoveritas.analyzeStegoVeritas(buffer, pixels, mimeType)
        };
    }

    private static calculateTextScore(r: any): number {
        let s = 0.0;
        if (r.zero_width?.present) s += 6.0;
        if (r.zero_width?.bidiAnomalies?.present) s += 5.5;
        if (r.homoglyphs?.present) s += 5.0;
        if (r.homoglyphs?.markovAnomaly?.suspicious) s += 7.0;
        if (r.emoji_threats?.suspicious) s += 4.5;
        return s;
    }

    private static calculateImageScore(r: any): number {
        let s = 0;
        const stego = r.stego_analysis;
        if (stego?.chiSquareProbability > 0.7) s += Math.min(6.0, (stego.chiSquareProbability - 0.7) * 20.0);
        if (stego?.rsEmbeddingRate > 0.01) s += Math.min(7.5, stego.rsEmbeddingRate * 30.0);
        else if (stego?.spaEmbeddingRate > 0.02) s += Math.min(7.0, stego.spaEmbeddingRate * 25.0);

        const veritas = r.stegoveritas_analysis;
        if (veritas?.trailingDataDetected) s += 7.0;
        if (veritas?.channelInconsistency?.detected) s += 4.0;
        if (veritas?.bitPlaneAnomaly) s += 3.5;
        if (veritas?.shadowChunks?.detected) s += 8.0;

        return s;
    }

    private static getSeverity(score: number): any {
        if (score >= 90) return 'Critical';
        if (score >= 70) return 'High';
        if (score >= 40) return 'Medium';
        if (score >= 15) return 'Low';
        return 'Safe';
    }
}
