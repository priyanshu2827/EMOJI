# 🛡️ Sentinel Prime: Advanced Steganography Detection

Sentinel Prime is a state-of-the-art forensic detection system designed to identify hidden data and security threats across Text, Emoji, and Image domains.

## 🚀 Key Features

- **Cascade Detection Pipeline**: Multi-tiered analysis (Deterministic → Statistical → AI).
- **Emoji-First Hardening**: Advanced grapheme-feature modeling and legal-sequence validation.
- **Text Forensics**: TR39 skeletal mapping, confusable detection, and Markov-chain distribution analysis.
- **Image Steganalysis**: Improved LSB Chi-Square and SPA tests combined with structural bit-plane analysis.
- **Ensemble Voting**: Calibrated weighted scoring system for high-precision results.

## 📚 Documentation

Detailed technical strategies and benchmark-focused execution plans are available in the **[Detection Playbook](docs/PLAYBOOK.md)**.

## 🛠️ Performance Tuning

To calibrate the system for your specific environment:
1. Run the `src/lib/benchmark-harness.ts` script.
2. Review the scores against your benchmark suites.
3. Adjust the `confidenceWeights` in `src/lib/detection-engine.ts`.

## 🧪 Testing

Run the elite difficulty stress test to verify your detection capabilities:
```bash
npx tsx src/lib/elite-difficult-test.ts
```

---
*Developed for maximum theoretical limit of detection.*
