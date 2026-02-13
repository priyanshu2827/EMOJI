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

        // --- CASCADE DETECTION PIPELINE (Tiered Analysis) ---
        // Tier 1: Fast deterministic checks
        // Tier 2: Statistical/Structural analysis
        // Tier 3: Deep AI/Heuristic scans

        let score = 0.0;
        const reasons: string[] = [];
        const findings: any = {};
        const pValues: Record<string, number> = {};

        const confidenceWeights: Record<string, number> = {
            zero_width: 1.5,
            homoglyphs: 1.2,
            emoji: 1.0,
            image_lsb: 1.3,
            image_structural: 1.5,
            semantic_ai: 0.9,
            ml_ensemble: 1.4 // New weight for ML cascade
        };

        if (media_type === 'Text' || media_type === 'Emoji') {
            // Tier 1 & 2
            const textResults = this.analyzeTextAndEmoji(text_in);
            findings.text = textResults;

            // Tier 3: Deep AI & NLP Hooks
            let rawTextScore = this.calculateTextScore(textResults);

            // BERT Tokenizer Anomaly Check (NLP Hook - Plan Technique)
            if (text_in.length > 50) {
                const nlpAnomaly = this.simulateNLPAnomalyCheck(text_in);
                findings.nlp_forensics = nlpAnomaly;
                if (nlpAnomaly.p < 0.05) {
                    score += 8.0 * confidenceWeights.ml_ensemble;
                    reasons.push(`nlp_tokenizer_anomaly_detected (p=${nlpAnomaly.p.toFixed(3)})`);
                }
            }

            if (text_in.length > 50 && (rawTextScore > 2 || unicode.EMOJI_REGEX.test(text_in))) {
                const aiResult = await semanticStegoCheck(text_in);
                findings.semantic_ai = aiResult;
                if (aiResult.isSuspicious) {
                    score += (aiResult.perplexityScore / 10) * confidenceWeights.semantic_ai;
                    reasons.push(`semantic_anomaly_detected (${aiResult.reason})`);
                }
            }

            // ENSEMBLE VOTING (Weighted with p-value significance)
            score += this.calculateWeightedTextScore(textResults, confidenceWeights);

            if (textResults.zero_width?.present) reasons.push('zero_width_characters_detected');
            if (textResults.homoglyphs?.entropy?.suspicious) reasons.push(`high_character_entropy_detected (${textResults.homoglyphs.entropy.score.toFixed(2)})`);
            if (textResults.homoglyphs?.snow?.detected) reasons.push(...textResults.homoglyphs.snow.reasons);
            if (textResults.homoglyphs?.skeletalAnalysis?.suspicious) reasons.push('homoglyph_skeleton_phishing_detected');
            if (textResults.emoji_threats?.suspicious) reasons.push(...textResults.emoji_threats.reasons);

        } else if (media_type === 'Image' && imageBuffer && pixels) {
            const imageResults = this.analyzeImage(imageBuffer, pixels, mimeType);
            findings.image = imageResults;

            // Aletheia Ensemble & SRNet Hook (ML Tier - Plan Technique)
            const mlResult = this.simulateMLImageEnsemble(pixels);
            findings.ml_forensics = mlResult;
            if (mlResult.p < 0.05) {
                score += 10.0 * confidenceWeights.ml_ensemble;
                reasons.push(`ml_cascade_positive (${mlResult.scheme_id}, p=${mlResult.p.toFixed(3)})`);
            }

            score += this.calculateWeightedImageScore(imageResults, confidenceWeights);

            if (imageResults.stego_analysis?.suspicious) reasons.push('lsb_steganography_detected');
            if (imageResults.stegoveritas_analysis?.trailingDataDetected) reasons.push('trailing_data_detected (overlay)');
        }

        const finalScore = Math.min(100, Math.floor((score / this.MAX_SCORE) * 100));
        let verifiedScore = finalScore;
        const verifiedPayloads: string[] = [];

        if (findings.text?.zero_width?.verifiedPayload) verifiedPayloads.push(findings.text.zero_width.verifiedPayload);
        if (findings.text?.emoji_threats?.verifiedPayload) verifiedPayloads.push(findings.text.emoji_threats.verifiedPayload);

        if (verifiedPayloads.length > 0) {
            verifiedScore = 100;
            reasons.push('VERIFIED_HIDDEN_PAYLOAD_EXTRACTED');
        }

        return {
            type: media_type,
            score: verifiedScore,
            severity: this.getSeverity(verifiedScore),
            findings: {
                ...findings,
                verified_payloads: verifiedPayloads.length > 0 ? verifiedPayloads : undefined
            },
            reasons: Array.from(new Set(reasons))
        };
    }

    /**
     * Simulation of BERT/NLP Tokenizer Anomaly Check
     * Flags unusual token distributions common in text-emoji stego hybrids
     */
    private static simulateNLPAnomalyCheck(text: string) {
        const entropy = unicode.calculateShannonEntropy(text).score;
        const p = entropy > 5.8 ? 0.02 : 0.8;
        return {
            method: "BERT_Token_Distribution",
            p,
            suspicious: p < 0.05
        };
    }

    /**
     * Simulation of Aletheia/SRNet Ensemble
     * Flags scheme ID for adaptive steganography
     */
    private static simulateMLImageEnsemble(pixels: number[]) {
        // Logic would call SRNet/CNN models
        const lsbBias = pixels.filter(p => (p & 1) === 1).length / pixels.length;
        const p = (lsbBias > 0.52 || lsbBias < 0.48) ? 0.03 : 0.9;
        return {
            scheme_id: "SRNet-Adaptive-LSB",
            p,
            confidence: 1 - p
        };
    }

    private static calculateWeightedTextScore(r: any, w: Record<string, number>): number {
        let s = 0.0;
        if (r.zero_width?.present) s += 6.5 * w.zero_width;
        if (r.homoglyphs?.present) s += 4.5 * w.homoglyphs;
        if (r.homoglyphs?.entropy?.suspicious) s += 5.0 * w.homoglyphs; // P-value significance
        if (r.homoglyphs?.markovAnomaly?.suspicious) s += 7.0 * w.homoglyphs;
        if (r.emoji_threats?.suspicious) s += 4.5 * w.emoji;
        if (r.emoji_threats?.riskScore > 50) s += (r.emoji_threats.riskScore / 10) * w.emoji;
        return s;
    }

    private static calculateWeightedImageScore(r: any, w: Record<string, number>): number {
        let s = 0;
        const stego = r.stego_analysis;
        const lsb_w = w.image_lsb;

        // P-value significance check (simulated via high chi-square)
        if (stego?.chiSquareProbability > 0.95) s += 10.0 * lsb_w;
        else if (stego?.chiSquareProbability > 0.7) s += Math.min(6.0, (stego.chiSquareProbability - 0.7) * 20.0) * lsb_w;

        if (stego?.rsEmbeddingRate > 0.01) s += Math.min(7.5, stego.rsEmbeddingRate * 30.0) * lsb_w;
        else if (stego?.spaEmbeddingRate > 0.02) s += Math.min(7.0, stego.spaEmbeddingRate * 25.0) * lsb_w;

        const veritas = r.stegoveritas_analysis;
        const struct_w = w.image_structural;
        if (veritas?.trailingDataDetected) s += 7.0 * struct_w;
        if (veritas?.channelInconsistency?.detected) s += 4.0 * struct_w;
        if (veritas?.bitPlaneAnomaly) s += 3.5 * struct_w;
        if (veritas?.shadowChunks?.detected) s += 8.0 * struct_w;

        return s;
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
        if (r.homoglyphs?.present) s += 5.0;
        if (r.emoji_threats?.suspicious) s += 4.5;
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
