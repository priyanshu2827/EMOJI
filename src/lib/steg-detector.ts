/**
 * Steg-Detector Library
 * Port of core heuristics from StegExpose (Java) to TypeScript
 * Detects LSB steganography using statistical analysis.
 */

export interface StegoAnalysisResult {
    suspicious: boolean;
    chiSquareProbability: number;
    spaEmbeddingRate: number;
    rsEmbeddingRate: number;
    bitCycleAnomaly: {
        detected: boolean;
        periodicity: number;
    };
    noiseFingerprint: {
        suspicious: boolean;
        varianceSpread: number;
    };
    reasons: string[];
}

export function chiSquareAttack(pixelData: number[]): number {
    if (pixelData.length === 0) return 0;
    const frequencies = new Array(256).fill(0);
    for (const pixel of pixelData) frequencies[pixel]++;
    let chiSquareSum = 0;
    let df = 0;
    for (let i = 0; i < 128; i++) {
        const obs1 = frequencies[2 * i];
        const obs2 = frequencies[2 * i + 1];
        const totalPoV = obs1 + obs2;
        if (totalPoV > 10) {
            const expected = totalPoV / 2;
            chiSquareSum += Math.pow(obs1 - expected, 2) / expected;
            df++;
        }
    }
    if (df === 0) return 0;
    const x = chiSquareSum / 2;
    const k = df / 2;
    let sum = 1.0;
    let term = 1.0;
    for (let i = 1; i < k; i++) {
        term *= x / i;
        sum += term;
    }
    const pValue = 1.0 - Math.exp(-x) * sum;
    return Math.max(0, Math.min(1, pValue));
}

export function samplePairAnalysis(pixelData: number[]): number {
    if (pixelData.length < 4) return 0;
    let r0 = 0, s0 = 0, r1 = 0, s1 = 0;
    for (let i = 0; i < pixelData.length - 1; i += 2) {
        const u = pixelData[i];
        const v = pixelData[i + 1];
        const isX = (v % 2 === 0 && u < v) || (v % 2 !== 0 && u > v);
        const isY = (v % 2 === 0 && u > v) || (v % 2 !== 0 && u < v);
        if (isX) r0++;
        if (isY) s0++;
        if (u % 2 === v % 2) r1++; else s1++;
    }
    const a = 2 * (r1 + s1);
    const b = (s0 - r0) - (2 * r1 + s1);
    const c = r0 - s0;
    if (a === 0) return 0;
    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return 0;
    const p1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const p2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    const results = [p1, p2].filter(v => v > 0 && v <= 1);
    const p = results.length > 0 ? Math.min(...results) : 0;
    if ((r0 + s0) < (r1 + s1) * 0.05) return 0;
    return p;
}

export function rsAnalysis(pixelData: number[]): number {
    if (pixelData.length < 128) return 0;
    const flip = (x: number) => (x % 2 === 0 ? x + 1 : x - 1);
    const invert = (x: number) => (x === 255 ? 254 : (x === 0 ? 1 : (x % 2 === 0 ? x - 1 : x + 1)));
    const calculateF = (group: number[], m: number[]) => {
        let score = 0;
        const flipped = group.map((x, i) => {
            if (m[i] === 1) return flip(x);
            if (m[i] === -1) return invert(x);
            return x;
        });
        for (let i = 0; i < flipped.length - 1; i++) score += Math.abs(flipped[i] - flipped[i + 1]);
        return score;
    };
    let Rm = 0, Sm = 0, R_m = 0, S_m = 0;
    const groupSize = 4;
    const mask = [0, 1, 1, 0];
    const inverseMask = [0, -1, -1, 0];
    for (let i = 0; i <= pixelData.length - groupSize; i += groupSize) {
        const group = pixelData.slice(i, i + groupSize);
        const f0 = calculateF(group, [0, 0, 0, 0]);
        const fm = calculateF(group, mask);
        if (fm > f0) Rm++; else if (fm < f0) Sm++;
        const f_m = calculateF(group, inverseMask);
        if (f_m > f0) R_m++; else if (f_m < f0) S_m++;
    }
    const n = Math.floor(pixelData.length / groupSize);
    const d0 = (Rm - Sm) / n;
    const d1 = (R_m - S_m) / n;
    if (Rm + Sm > n * 0.9 && Math.abs(d0 - d1) < 0.05) return 0;
    const z = d1 - d0;
    if (Math.abs(z) < 0.0001) return 0;
    return Math.max(0, Math.min(1, Math.abs(d0 / z)));
}

export function analyzeBitCycle(pixelData: number[]): { detected: boolean; periodicity: number } {
    const lsb = pixelData.map(p => p & 1);
    const maxLag = 32;
    const correlations: number[] = [];
    for (let lag = 1; lag <= maxLag; lag++) {
        let matches = 0;
        let trials = 0;
        for (let i = 0; i < lsb.length - lag; i++) {
            if (lsb[i] === lsb[i + lag]) matches++;
            trials++;
        }
        correlations.push(matches / trials);
    }
    let maxCorr = 0, period = 0;
    for (let i = 0; i < correlations.length; i++) {
        if (correlations[i] > maxCorr) { maxCorr = correlations[i]; period = i + 1; }
    }
    return { detected: maxCorr > 0.65, periodicity: period };
}

export function analyzeNoiseFingerprint(pixelData: number[]): { suspicious: boolean; varianceSpread: number } {
    if (pixelData.length < 4096) return { suspicious: false, varianceSpread: 0 };
    const blockSize = 1024;
    const variances: number[] = [];
    for (let i = 0; i < pixelData.length; i += blockSize) {
        const block = pixelData.slice(i, i + blockSize);
        const lsb = block.map(p => p & 1);
        const mean = lsb.reduce((a, b) => a + b, 0) / lsb.length;
        const variance = lsb.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / lsb.length;
        variances.push(variance);
    }
    const max = Math.max(...variances), min = Math.min(...variances);
    const spread = max - min;
    return { suspicious: spread > 0.15 && max > 0.2, varianceSpread: spread };
}

export function analyzeStego(pixelData: number[]): StegoAnalysisResult {
    const prob = chiSquareAttack(pixelData);
    const rate_spa = samplePairAnalysis(pixelData);
    const rate_rs = rsAnalysis(pixelData);
    const bitCycle = analyzeBitCycle(pixelData);
    const noisePrint = analyzeNoiseFingerprint(pixelData);
    const reasons: string[] = [];
    if (prob > 0.85) reasons.push('chi_square_anomaly_detected');
    if (rate_spa > 0.15) reasons.push('lsb_embedding_detected (spa)');
    if (rate_rs > 0.15) reasons.push('lsb_embedding_detected (rs)');
    if (bitCycle.detected) reasons.push(`periodic_lsb_pattern_detected (period: ${bitCycle.periodicity})`);
    if (noisePrint.suspicious) reasons.push('noise_floor_inconsistency_detected');

    const isSuspicious = (prob > 0.95) || (rate_rs > 0.12) || (rate_spa > 0.15 && prob > 0.5) || (rate_rs > 0.05 && rate_spa > 0.05) || bitCycle.detected || noisePrint.suspicious;
    return { suspicious: isSuspicious, chiSquareProbability: prob, spaEmbeddingRate: rate_spa, rsEmbeddingRate: rate_rs, bitCycleAnomaly: bitCycle, noiseFingerprint: noisePrint, reasons };
}
