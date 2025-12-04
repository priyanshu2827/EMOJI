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
};
