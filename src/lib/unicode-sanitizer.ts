/**
 * Unicode & Prompt-Injection Sanitizer
 * TypeScript port of Black_Box_Emoji_Fix
 * https://github.com/reneemgagnon/Black_Box_Emoji_Fix
 */

export interface Issue {
  kind: string;
  span: [number, number];
  excerpt: string;
  detail?: Record<string, any>;
}

export interface SanitizeReport {
  issues: Issue[];
  stats: {
    originalLength: number;
    finalLength: number;
    issuesFound: number;
  };
}

export interface SecurityConfig {
  allowEmoji?: boolean;
  detectPromptInjection?: boolean;
  maxTokensPerCluster?: number;
  maxRepeatedChar?: number;
  stripHTML?: boolean;
  stripMarkdown?: boolean;
  detectBiDi?: boolean;
  detectExoticSpaces?: boolean;
}

// Unicode character sets
const ZERO_WIDTH_CHARS = new Set([
  '\u200B', // ZERO WIDTH SPACE
  '\u200C', // ZERO WIDTH NON-JOINER
  '\u200D', // ZERO WIDTH JOINER
  '\u2060', // WORD JOINER
  '\uFEFF', // ZERO WIDTH NO-BREAK SPACE
  '\uFE0E', // VARIATION SELECTOR-15
  '\uFE0F', // VARIATION SELECTOR-16
]);

const BIDI_CHARS = new Set([
  '\u202A', // LEFT-TO-RIGHT EMBEDDING
  '\u202B', // RIGHT-TO-LEFT EMBEDDING
  '\u202D', // LEFT-TO-RIGHT OVERRIDE
  '\u202E', // RIGHT-TO-LEFT OVERRIDE
  '\u202C', // POP DIRECTIONAL FORMATTING
  '\u2066', // LEFT-TO-RIGHT ISOLATE
  '\u2067', // RIGHT-TO-LEFT ISOLATE
  '\u2068', // FIRST STRONG ISOLATE
  '\u2069', // POP DIRECTIONAL ISOLATE
  '\u200E', // LEFT-TO-RIGHT MARK
  '\u200F', // RIGHT-TO-LEFT MARK
]);

const EXOTIC_SPACES = new Set([
  '\u00A0', // NO-BREAK SPACE
  '\u1680', // OGHAM SPACE MARK
  '\u180E', // MONGOLIAN VOWEL SEPARATOR
  '\u2000', '\u2001', '\u2002', '\u2003', '\u2004',
  '\u2005', '\u2006', '\u2007', '\u2008', '\u2009',
  '\u200A', // Various EN/EM/THIN spaces
  '\u202F', // NARROW NO-BREAK SPACE
  '\u205F', // MEDIUM MATHEMATICAL SPACE
  '\u3000', // IDEOGRAPHIC SPACE
]);

const DISALLOWED_CHARS = new Set([
  ...ZERO_WIDTH_CHARS,
  ...BIDI_CHARS,
  ...EXOTIC_SPACES,
]);

// Prompt injection patterns
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all|any|previous|prior)\s+(instructions|rules)/i,
  /disregard\s+(the\s+)?(above|earlier)\s+(content|directions)/i,
  /you\s+are\s+(now\s+)?(chatgpt|an?\s+ai|no\s+longer\s+bound)/i,
  /pretend\s+to\s+be/i,
  /without\s+(following|respecting)\s+(the\s+)?rules/i,
  /override\s+(the\s+)?(guardrails|safety|constraints)/i,
  /developer\s+mode/i,
  /jailbreak/i,
  /prompt\s+injection/i,
  /bypass\s+(content|safety|policy)/i,
  /###\s*system/i,
  /begin(_|\s)system(\s|_)?prompt/i,
  /follow\s+only\s+my\s+next\s+message/i,
  /forget\s+(your\s+)?(instructions|safety)/i,
];

// Emoji detection using Unicode ranges
function isEmoji(char: string): boolean {
  const code = char.codePointAt(0);
  if (!code) return false;
  
  // Common emoji ranges
  return (
    (code >= 0x1F300 && code <= 0x1F9FF) || // Misc Symbols and Pictographs, Emoticons, Transport
    (code >= 0x2600 && code <= 0x26FF) ||   // Misc symbols
    (code >= 0x2700 && code <= 0x27BF) ||   // Dingbats
    (code >= 0xFE00 && code <= 0xFE0F) ||   // Variation Selectors
    (code >= 0x1F000 && code <= 0x1F02F) || // Mahjong Tiles, Domino Tiles
    (code >= 0x1F0A0 && code <= 0x1F0FF) || // Playing Cards
    (code >= 0x1F100 && code <= 0x1F64F) || // Enclosed characters, Emoticons
    (code >= 0x1F680 && code <= 0x1F6FF) || // Transport and Map
    (code >= 0x1F900 && code <= 0x1F9FF)    // Supplemental Symbols
  );
}

// Split text into grapheme clusters (simplified)
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
    
    // Combine with following combining marks and zero-width chars
    while (i < text.length && isCombining(text[i])) {
      cluster += text[i];
      i++;
    }
    
    clusters.push(cluster);
  }
  
  return clusters;
}

function isLowSurrogate(code: number): boolean {
  return code >= 0xDC00 && code <= 0xDFFF;
}

function isCombining(char: string): boolean {
  const code = char.charCodeAt(0);
  // Combining Diacritical Marks and other combining characters
  return (
    (code >= 0x0300 && code <= 0x036F) ||
    (code >= 0x1AB0 && code <= 0x1AFF) ||
    (code >= 0x1DC0 && code <= 0x1DFF) ||
    (code >= 0x20D0 && code <= 0x20FF) ||
    (code >= 0xFE20 && code <= 0xFE2F) ||
    ZERO_WIDTH_CHARS.has(char)
  );
}

// Clamp repeated characters
function clampRepeats(text: string, maxRep: number): string {
  if (maxRep <= 0) return text;
  
  let result = '';
  let prevChar = '';
  let count = 0;
  
  for (const char of text) {
    if (char === prevChar) {
      count++;
      if (count <= maxRep) {
        result += char;
      }
    } else {
      result += char;
      prevChar = char;
      count = 1;
    }
  }
  
  return result;
}

// Strip HTML tags
function stripHTML(text: string): string {
  return text.replace(/<[^>]+>/g, '');
}

// Strip Markdown links
function stripMarkdownLinks(text: string): string {
  // Remove image links ![alt](url)
  text = text.replace(/!\[[^\]]*\]\([^)]+\)/g, '');
  // Convert [text](url) to just text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  // Remove code fences
  text = text.replace(/```[\s\S]*?```/g, '');
  return text;
}

// Detect prompt injection
function detectPromptInjection(text: string): Issue[] {
  const issues: Issue[] = [];
  
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    const matches = text.matchAll(new RegExp(pattern.source, 'gi'));
    for (const match of matches) {
      if (match.index !== undefined) {
        issues.push({
          kind: 'prompt_injection',
          span: [match.index, match.index + match[0].length],
          excerpt: match[0],
          detail: { pattern: pattern.source }
        });
      }
    }
  }
  
  return issues;
}

// Main sanitization function
export function sanitizeText(
  text: string,
  config: SecurityConfig = {}
): { cleaned: string; report: SanitizeReport } {
  const cfg = {
    allowEmoji: false,
    detectPromptInjection: true,
    maxTokensPerCluster: 3,
    maxRepeatedChar: 4,
    stripHTML: true,
    stripMarkdown: true,
    detectBiDi: true,
    detectExoticSpaces: true,
    ...config,
  };
  
  const report: SanitizeReport = {
    issues: [],
    stats: {
      originalLength: text.length,
      finalLength: 0,
      issuesFound: 0,
    },
  };
  
  const originalText = text;
  
  // Step 1: Strip HTML if configured
  if (cfg.stripHTML) {
    const htmlMatches = text.match(/<[^>]+>/g);
    if (htmlMatches) {
      htmlMatches.forEach(tag => {
        report.issues.push({
          kind: 'html_tag',
          span: [0, 0],
          excerpt: tag,
        });
      });
      text = stripHTML(text);
    }
  }
  
  // Step 2: Strip Markdown if configured
  if (cfg.stripMarkdown) {
    const beforeMd = text;
    text = stripMarkdownLinks(text);
    if (beforeMd !== text) {
      report.issues.push({
        kind: 'markdown_stripped',
        span: [0, 0],
        excerpt: 'Markdown links/images removed',
      });
    }
  }
  
  // Step 3: Detect prompt injection
  if (cfg.detectPromptInjection) {
    const injectionIssues = detectPromptInjection(text);
    report.issues.push(...injectionIssues);
  }
  
  // Step 4: Clamp repeated characters
  text = clampRepeats(text, cfg.maxRepeatedChar);
  
  // Step 5: Process grapheme clusters
  const clusters = getGraphemeClusters(text);
  const cleanedClusters: string[] = [];
  
  for (const cluster of clusters) {
    let keep = true;
    const issues: string[] = [];
    
    // Check for disallowed characters
    for (const char of cluster) {
      if (DISALLOWED_CHARS.has(char)) {
        keep = false;
        if (ZERO_WIDTH_CHARS.has(char)) {
          issues.push('zero_width');
        } else if (BIDI_CHARS.has(char)) {
          issues.push('bidi_char');
        } else if (EXOTIC_SPACES.has(char)) {
          issues.push('exotic_space');
        }
      }
    }
    
    // Check for emoji
    if (!cfg.allowEmoji && Array.from(cluster).some(isEmoji)) {
      keep = false;
      issues.push('emoji');
    }
    
    if (!keep) {
      report.issues.push({
        kind: 'unicode_cluster_removed',
        span: [0, cluster.length],
        excerpt: cluster,
        detail: { reasons: issues },
      });
    } else {
      cleanedClusters.push(cluster);
    }
  }
  
  const cleaned = cleanedClusters.join('');
  
  report.stats.finalLength = cleaned.length;
  report.stats.issuesFound = report.issues.length;
  
  return { cleaned, report };
}

// Analyze text for threats without sanitizing
export function analyzeText(text: string): SanitizeReport {
  const { report } = sanitizeText(text, {
    allowEmoji: true, // Don't remove, just detect
    stripHTML: false,
    stripMarkdown: false,
  });
  
  return report;
}

// Quick checks
export function hasZeroWidthChars(text: string): boolean {
  return Array.from(text).some(char => ZERO_WIDTH_CHARS.has(char));
}

export function hasBiDiChars(text: string): boolean {
  return Array.from(text).some(char => BIDI_CHARS.has(char));
}

export function hasExoticSpaces(text: string): boolean {
  return Array.from(text).some(char => EXOTIC_SPACES.has(char));
}

export function hasPromptInjection(text: string): boolean {
  return PROMPT_INJECTION_PATTERNS.some(pattern => pattern.test(text));
}
