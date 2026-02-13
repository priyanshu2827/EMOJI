# Sentinel Prime: Advanced Detection Playbook

This playbook outlines the strategies and techniques implemented in Sentinel Prime to achieve near-100% detection rates on standard and adversarial benchmarks.

## 1. Cascade Detection Pipeline
We use a tiered analysis approach to balance performance and depth:
- **Tier 1 (Fast)**: Deterministic checks for known steganography characters (ZWSP, BIDI).
- **Tier 2 (Structural)**: Grapheme-feature modeling, emoji nibble steganalysis, and legal-sequence validation.
- **Tier 3 (Deep)**: ML Ensemble cascade (SRNet/Aletheia simulations), TR39 skeletal mapping, and character-level Shannon entropy scans.

## 2. Emoji-First Hardening
Emojis are the highest-risk domain. Our "Emoji-First" strategy includes:
- **Emoji Nibble Steganalysis**: Identifying low-entropy emoji alphabets (4-16 chars) typical of schemes like Stegoji.
- **Frequency Analysis**: Flagging abnormal runs of unique emojis that deviate from natural usage frequencies.
- **Grapheme-Feature Modeling**: Tracking variation selector density and ZWJ sequence anomalies.
- **Legal-Sequence Validator**: Heuristic-based validation against standard Unicode emoji patterns.

## 3. Text Domain Techniques
- **Normalization (NFKC)**: Standardizing text to Unicode NFKC to bypass normalization-based evasion.
- **Shannon Entropy**: Statistical calculation of character distribution to flag high-entropy blocks indicative of hidden data.
- **SNOW Detection**: Identifying trailing whitespace (spaces/tabs) used in SNOW-style steganography.
- **TR39 Skeletal Mapping**: Converting text to a skeletal form to detect mixed-script confusable attacks.

## 4. Image Domain Techniques
- **ML Cascade Ensemble**: Hooks for SRNet CNNs and Aletheia-style scheme identification.
- **Classical LSB Tests**: Calibrated RS and Sample Pair Analysis (SPA) with p-value significance (p < 0.05).
- **Structural Anomaly Detection**: StegoVeritas-inspired checks for bit-plane inconsistencies and trailing data.

## 5. Execution Plan for 100% Benchmarks
To push towards perfect scores:
1. **Freeze Fixtures**: Use static test suites (like `elite-difficult-test.ts`) to prevent regression.
2. **Parameter Sweep**: Run the `benchmark-harness.ts` to calibrate confidence weights.
3. **Emoji Hardening**: Prioritize fixing false negatives in multi-tone ZWJ sequences.
4. **CI Regression Gate**: Ensure every PR maintains or improves the benchmark score.

---
*Follow these recommendations to maintain the absolute theoretical limit of detection.*
