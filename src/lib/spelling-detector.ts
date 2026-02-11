/**
 * Spelling variation detector module
 * Detects regional spelling variations (British vs American) 
 * for document fingerprinting and source identification.
 */

export interface SpellingVariation {
    word: string;
    variant: 'BRITISH' | 'AMERICAN';
    original: string;
    position: number;
    lineNumber: number;
}

export interface SpellingDetectionResult {
    detected: boolean;
    variations: SpellingVariation[];
    likelyRegion: 'BRITISH' | 'AMERICAN' | 'MIXED' | 'UNKNOWN';
    confidence: number;
    stats: {
        britishCount: number;
        americanCount: number;
    };
}

// Dictionary of common regional spelling variations
// Format: { british: american }
const REGIONAL_VARIATIONS: Record<string, string> = {
    'colour': 'color',
    'flavour': 'flavor',
    'humour': 'humor',
    'labour': 'labor',
    'neighbour': 'neighbor',
    'favourite': 'favorite',
    'honour': 'honor',
    'glamour': 'glamor',
    'behaviour': 'behavior',
    'valour': 'valor',
    'rumour': 'rumor',
    'centre': 'center',
    'theatre': 'theater',
    'metre': 'meter',
    'litre': 'liter',
    'fibre': 'fiber',
    'lustre': 'luster',
    'analyse': 'analyze',
    'organise': 'organize',
    'realise': 'realize',
    'recognise': 'recognize',
    'initialise': 'initialize',
    'maximise': 'maximize',
    'minimise': 'minimize',
    'emphasise': 'emphasize',
    'defence': 'defense',
    'offence': 'offense',
    'licence': 'license',
    'pretence': 'pretense',
    'travelling': 'traveling',
    'cancelled': 'canceled',
    'modelling': 'modeling',
    'jewellery': 'jewelry',
    'programme': 'program',
    'catalogue': 'catalog',
    'dialogue': 'dialog',
    'analog': 'analogue',
    'gray': 'grey', // This one is flipped commonness
    'artifact': 'artefact',
    'judgment': 'judgement', // Both used, but regional preference
    'ax': 'axe',
};

// Inverse map for American to British
const AMERICAN_TO_BRITISH: Record<string, string> = {};
for (const [british, american] of Object.entries(REGIONAL_VARIATIONS)) {
    AMERICAN_TO_BRITISH[american] = british;
}

/**
 * Detects regional spelling variations in text
 */
export function detectSpellingVariations(text: string): SpellingDetectionResult {
    const variations: SpellingVariation[] = [];
    const lines = text.split('\n');
    let britishCount = 0;
    let americanCount = 0;

    // Simple word boundaries regex
    const wordRegex = /\b(\w+)\b/g;

    lines.forEach((line, lineIdx) => {
        let match;
        while ((match = wordRegex.exec(line)) !== null) {
            const word = match[1].toLowerCase();
            const pos = match.index;

            if (word in REGIONAL_VARIATIONS) {
                variations.push({
                    word: word,
                    variant: 'BRITISH',
                    original: match[1],
                    position: pos,
                    lineNumber: lineIdx + 1
                });
                britishCount++;
            } else if (word in AMERICAN_TO_BRITISH) {
                variations.push({
                    word: word,
                    variant: 'AMERICAN',
                    original: match[1],
                    position: pos,
                    lineNumber: lineIdx + 1
                });
                americanCount++;
            }
        }
    });

    let likelyRegion: SpellingDetectionResult['likelyRegion'] = 'UNKNOWN';
    let confidence = 0;

    if (britishCount > 0 && americanCount === 0) {
        likelyRegion = 'BRITISH';
        confidence = Math.min(100, britishCount * 25);
    } else if (americanCount > 0 && britishCount === 0) {
        likelyRegion = 'AMERICAN';
        confidence = Math.min(100, americanCount * 25);
    } else if (britishCount > 0 && americanCount > 0) {
        likelyRegion = 'MIXED';
        confidence = Math.max(50, (Math.abs(britishCount - americanCount) / (britishCount + americanCount)) * 100);
    }

    return {
        detected: variations.length > 0,
        variations,
        likelyRegion,
        confidence,
        stats: {
            britishCount,
            americanCount
        }
    };
}
