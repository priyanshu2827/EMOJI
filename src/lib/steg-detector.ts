/**
 * Steg-Detector Library
 * Port of core heuristics from StegExpose (Java) to TypeScript
 * Detects LSB steganography using statistical analysis.
 */

export interface StegoAnalysisResult {
    suspicious: boolean;
    chiSquareProbability: number;
    spaEmbeddingRate: number;
    reasons: string[];
}

/**
 * Chi-Square Attack (Westfeld, 2000)
 * Analyzes Pairs of Values (PoVs) to check for statistical equalization
 * caused by LSB replacement.
 */
export function chiSquareAttack(pixelData: number[]): number {
    if (pixelData.length === 0) return 0;

    // 1. Count frequencies of each pixel value (0-255)
    const frequencies = new Array(256).fill(0);
    for (const pixel of pixelData) {
        frequencies[pixel]++;
    }

    // 2. Calculate observed and expected counts for Pairs of Values (PoVs)
    // Pair (2i, 2i+1)
    let chiSquareSum = 0;
    let df = 0; // Degrees of freedom

    for (let i = 0; i < 128; i++) {
        const obs1 = frequencies[2 * i];
        const obs2 = frequencies[2 * i + 1];

        // Total observed in the pair
        const totalPoV = obs1 + obs2;

        // Only consider pairs with data
        if (totalPoV > 5) {
            const expected = totalPoV / 2;

            // Chi-Square formula: Σ ( (O - E)^2 / E )
            // (obs1 - expected)^2 / expected + (obs2 - expected)^2 / expected
            chiSquareSum += Math.pow(obs1 - expected, 2) / expected;
            chiSquareSum += Math.pow(obs2 - expected, 2) / expected;
            df++;
        }
    }

    if (df === 0) return 0;

    // 3. Return a probability (simplified p-value estimation)
    // In a real implementation we'd use a Gamma function / Incomplete Gamma,
    // but for steganography detection, a high chiSquareSum relative to df 
    // already indicates a strong signal.

    // Normalized score: Higher means more likely steganographic
    // Probability = 1 - CDF_ChiSquare(chiSquareSum, df)
    // We use a lookup-free approximation for common stego detection:
    const probability = chiSquareSum / (df * 2);
    return Math.min(1, probability);
}

/**
 * Sample Pair Analysis (SPA) (Dumitrescu, 2003)
 * Estimates the embedding rate by analyzing transitions in pixel pairs.
 */
export function samplePairAnalysis(pixelData: number[]): number {
    if (pixelData.length < 2) return 0;

    let x = 0, y = 0, z = 0, w = 0;
    let x_prime = 0, y_prime = 0, z_prime = 0, w_prime = 0;

    // Scan adjacent pixel pairs
    for (let i = 0; i < pixelData.length - 1; i += 2) {
        const u = pixelData[i];
        const v = pixelData[i + 1];

        // Check properties of the pair
        // Based on Dumitrescu's algorithm for partitioning the set of pairs
        if ((v % 2 === 0 && u < v) || (v % 2 !== 0 && u > v)) x++;
        if ((v % 2 === 0 && u > v) || (v % 2 !== 0 && u < v)) y++;

        // Check parity transitions
        if (u % 2 === v % 2) z++;
        else w++;

        // Flip bits and check again (simulated)
        const u_f = u ^ 1;
        const v_f = v ^ 1;

        if ((v_f % 2 === 0 && u_f < v_f) || (v_f % 2 !== 0 && u_f > v_f)) x_prime++;
        if ((v_f % 2 === 0 && u_f > v_f) || (v_f % 2 !== 0 && u_f < v_f)) y_prime++;
        if (u_f % 2 === v_f % 2) z_prime++;
        else w_prime++;
    }

    // Calculate embedding rate (p) using the quadratic equation from the paper
    // Simplified version:
    const delta = 2 * (z - w);
    if (delta === 0) return 0;

    const p = (x - y) / (z - w);
    return Math.max(0, Math.min(1, Math.abs(p)));
}

export function analyzeStego(pixelData: number[]): StegoAnalysisResult {
    const prob = chiSquareAttack(pixelData);
    const rate = samplePairAnalysis(pixelData);

    const reasons: string[] = [];
    if (prob > 0.8) reasons.push('chi_square_anomaly_detected');
    if (rate > 0.1) reasons.push('high_lsb_embedding_rate_estimated');

    return {
        suspicious: prob > 0.6 || rate > 0.05,
        chiSquareProbability: prob,
        spaEmbeddingRate: rate,
        reasons
    };
}
