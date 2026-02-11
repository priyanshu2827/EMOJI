export type Severity = 'CLEAN' | 'SUSPICIOUS' | 'HIGH-RISK';
export type ContentType = 'Text' | 'Image' | 'Emoji';

export type ScanResult = {
  id: string;
  timestamp: string;
  type: ContentType;
  severity: Severity;
  summary: string;
  rawFindings: string;
  isFalsePositive?: boolean;
  score?: number;
};

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

export interface CodeAnalysisResult {
  smartQuotes: SmartQuoteResult;
  composition: CharacterComposition;
  suspicious: boolean;
  riskScore: number;
  reasons: string[];
}

export interface HomoglyphDetection {
  char: string;
  looksLike: string;
  position: number;
  category: string;
}

export interface HomoglyphResult {
  present: boolean;
  samples: Array<{ char: string; looks_like: string }>;
  detailed?: {
    byCategory: Record<string, HomoglyphDetection[]>;
    totalCount: number;
    categories: string[];
  };
}

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

export interface StegoAnalysisResult {
  suspicious: boolean;
  chiSquareProbability: number;
  spaEmbeddingRate: number;
  reasons: string[];
}

export interface StegoVeritasResult {
  suspicious: boolean;
  trailingDataDetected: boolean;
  trailingDataSize: number;
  metadataAnomalies: string[];
  channelInconsistency: {
    detected: boolean;
    scores: { r: number; g: number; b: number };
  };
  reasons: string[];
}

