'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  EyeOff, 
  Binary, 
  AlertTriangle, 
  Shield, 
  Fingerprint,
  BarChart3,
  Code,
  Type
} from 'lucide-react';
import Hyperspeed from './hyperspeed';
import { hyperspeedPresets } from './hyperspeed-presets';

function ZeroWidthSection() {
  return (
    <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <EyeOff className="h-5 w-5 text-primary" />
            What are Zero-Width Characters?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Zero-width characters are invisible Unicode characters that take up no visual space but exist in the text. 
            They can be used to hide secret messages, fingerprint text, or bypass content filters.
          </p>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Characters We Detect</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between items-center">
                    <code className="bg-background px-2 py-1 rounded">U+200B</code>
                    <span className="text-muted-foreground">Zero Width Space (ZWS)</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <code className="bg-background px-2 py-1 rounded">U+200C</code>
                    <span className="text-muted-foreground">Zero Width Non-Joiner (ZWNJ)</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <code className="bg-background px-2 py-1 rounded">U+200D</code>
                    <span className="text-muted-foreground">Zero Width Joiner (ZWJ)</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <code className="bg-background px-2 py-1 rounded">U+FEFF</code>
                    <span className="text-muted-foreground">Byte Order Mark (BOM)</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Detection Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Our scanner iterates through each character and checks against a predefined set of zero-width Unicode code points.</p>
                <p>When found, we report their positions and count, allowing you to identify potential hidden data or fingerprinting.</p>
              </CardContent>
            </Card>
          </div>

          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <h4 className="font-medium text-destructive flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4" />
              Security Risk
            </h4>
            <p className="text-sm text-muted-foreground">
              Zero-width steganography can embed hidden watermarks to track document leaks, hide malicious payloads, 
              or encode messages that evade keyword-based security filters.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EntropySection() {
  return (
    <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Shannon Entropy Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Shannon entropy measures the randomness or unpredictability in text. Natural language has predictable patterns, 
            while hidden data or encrypted content typically shows higher entropy.
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-green-500/10 border-green-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-400">Low Entropy (0-3)</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Repetitive text, simple patterns. Generally safe and normal.
              </CardContent>
            </Card>

            <Card className="bg-yellow-500/10 border-yellow-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-yellow-400">Medium Entropy (3-4.5)</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Normal natural language. Expected range for regular text content.
              </CardContent>
            </Card>

            <Card className="bg-red-500/10 border-red-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-400">High Entropy (4.5+)</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Random or encoded data. May indicate hidden content or encryption.
              </CardContent>
            </Card>
          </div>

          <Card className="bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Code className="h-4 w-4" />
                How We Calculate
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>We use the Shannon entropy formula:</p>
              <code className="block bg-background p-3 rounded text-xs font-mono">
                H(X) = -Σ p(x) × log₂(p(x))
              </code>
              <p>Where p(x) is the probability of each unique character appearing in the text.</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}

function HomoglyphSection() {
  return (
    <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5 text-primary" />
            Homoglyph Detection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Homoglyphs are characters from different scripts that look identical or very similar to common ASCII characters. 
            They are often used in phishing attacks, spoofing URLs, or bypassing content filters.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Common Homoglyph Pairs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-4 p-2 bg-background rounded">
                    <span className="font-mono text-lg">а</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-mono text-lg">a</span>
                    <Badge variant="outline" className="ml-auto">Cyrillic</Badge>
                  </div>
                  <div className="flex items-center gap-4 p-2 bg-background rounded">
                    <span className="font-mono text-lg">е</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-mono text-lg">e</span>
                    <Badge variant="outline" className="ml-auto">Cyrillic</Badge>
                  </div>
                  <div className="flex items-center gap-4 p-2 bg-background rounded">
                    <span className="font-mono text-lg">о</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-mono text-lg">o</span>
                    <Badge variant="outline" className="ml-auto">Cyrillic</Badge>
                  </div>
                  <div className="flex items-center gap-4 p-2 bg-background rounded">
                    <span className="font-mono text-lg">Ι</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-mono text-lg">I</span>
                    <Badge variant="outline" className="ml-auto">Greek</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Attack Scenarios</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="p-2 bg-background rounded">
                  <span className="font-medium text-foreground">URL Spoofing:</span>
                  <p>аpple.com vs apple.com</p>
                </div>
                <div className="p-2 bg-background rounded">
                  <span className="font-medium text-foreground">Filter Bypass:</span>
                  <p>Using lookalikes to evade keyword blocks</p>
                </div>
                <div className="p-2 bg-background rounded">
                  <span className="font-medium text-foreground">Identity Spoofing:</span>
                  <p>Impersonating usernames or brands</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UnicodeThreatSection() {
  return (
    <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Unicode Threat Detection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Beyond zero-width characters, Unicode contains many other characters that can be exploited for malicious purposes. 
            Our scanner detects multiple categories of Unicode-based threats.
          </p>

          <div className="space-y-4">
            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Badge variant="destructive">High Risk</Badge>
                  Bidirectional Override Characters
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p className="mb-2">Characters like U+202E (Right-to-Left Override) can reverse text display, hiding malicious content:</p>
                <code className="block bg-background p-2 rounded text-xs">
                  "harmless.exe" displays as "exe.sselmlah"
                </code>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Badge variant="secondary">Medium Risk</Badge>
                  Exotic Space Characters
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ul className="space-y-1">
                  <li><code className="bg-background px-1 rounded">U+00A0</code> - Non-Breaking Space</li>
                  <li><code className="bg-background px-1 rounded">U+2000-U+200A</code> - Various Width Spaces</li>
                  <li><code className="bg-background px-1 rounded">U+3000</code> - Ideographic Space</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Badge variant="destructive">Critical</Badge>
                  Prompt Injection Patterns
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p className="mb-2">We detect text patterns commonly used to manipulate AI systems:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>"IGNORE ALL PREVIOUS INSTRUCTIONS"</li>
                  <li>"Disregard the above"</li>
                  <li>"You are now..."</li>
                  <li>System prompt extraction attempts</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Badge variant="outline">Info</Badge>
                  Variation Selectors
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>U+FE00 to U+FE0F modify the appearance of preceding characters. While often legitimate (like emoji presentation), 
                excessive use can indicate data hiding or fingerprinting.</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EmojiSection() {
  return (
    <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5 text-primary" />
            Emoji Steganography
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Emojis can hide secret messages by encoding data in the selection and sequence of emoji characters. 
            Our scanner analyzes emoji patterns for suspicious encoding.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Detection Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div className="p-2 bg-background rounded">
                  <span className="font-medium text-foreground">Pattern Analysis:</span>
                  <p>Detecting unnatural emoji sequences</p>
                </div>
                <div className="p-2 bg-background rounded">
                  <span className="font-medium text-foreground">Density Check:</span>
                  <p>Flagging unusually high emoji-to-text ratios</p>
                </div>
                <div className="p-2 bg-background rounded">
                  <span className="font-medium text-foreground">ZWJ Sequences:</span>
                  <p>Analyzing Zero Width Joiner in emoji combinations</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Encoding Techniques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Emoji steganography tools can:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Map binary data to emoji selections</li>
                  <li>Use variation selectors between emojis</li>
                  <li>Encode in skin tone modifiers</li>
                  <li>Hide data in ZWJ sequences</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <h4 className="font-medium flex items-center gap-2 mb-2">
              <Binary className="h-4 w-4" />
              How EmojiEncode Works
            </h4>
            <p className="text-sm text-muted-foreground">
              Our EmojiEncode tool converts text to binary, then maps each bit pattern to a specific emoji. 
              The decoder reverses this process by analyzing the emoji sequence and extracting the hidden binary data.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ImageSection() {
  return (
    <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Binary className="h-5 w-5 text-primary" />
            Image LSB Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Least Significant Bit (LSB) steganography hides data in the least important bits of image pixels. 
            Our scanner uses statistical analysis to detect this type of hidden content.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">LSB Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>We analyze the distribution of least significant bits:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Natural images have ~50% ones/zeros</li>
                  <li>Random data shows near-perfect 50/50 split</li>
                  <li>Deviation from 0.5 ratio indicates modification</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Entropy Score</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>LSB entropy measures randomness in the bit plane:</p>
                <ul className="space-y-1">
                  <li><span className="text-green-400">{"< 0.9"}</span> - Likely natural</li>
                  <li><span className="text-yellow-400">0.9-0.98</span> - Suspicious</li>
                  <li><span className="text-red-400">{"> 0.98"}</span> - High probability of hidden data</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Detection Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-2 text-sm">
                <div className="p-2 bg-background rounded flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Deviation {"<"} 0.03 + Entropy {">"} 0.98</span>
                </div>
                <div className="p-2 bg-background rounded flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Large image + Near-uniform LSB</span>
                </div>
                <div className="p-2 bg-background rounded flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>Unusual bit distribution patterns</span>
                </div>
                <div className="p-2 bg-background rounded flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Natural variance in bit plane</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DetectionMethodsClient() {
  return (
    <div className="container mx-auto p-4 md:p-8 relative z-10">
      <div className="absolute inset-0 -z-10">
        <Hyperspeed effectOptions={hyperspeedPresets.one} />
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight font-headline text-white">Detection Methods</h1>
        <p className="text-muted-foreground">
          Learn how INVISIFY identifies hidden content, steganography, and Unicode-based security threats.
        </p>
      </div>
      
      <Tabs defaultValue="zero-width" className="w-full">
        <TabsList className="flex flex-wrap justify-start gap-2 h-auto bg-transparent mb-8">
          <TabsTrigger value="zero-width" className="flex items-center gap-2 data-[state=active]:bg-primary/20">
            <EyeOff className="h-4 w-4" />
            Zero-Width
          </TabsTrigger>
          <TabsTrigger value="entropy" className="flex items-center gap-2 data-[state=active]:bg-primary/20">
            <BarChart3 className="h-4 w-4" />
            Entropy
          </TabsTrigger>
          <TabsTrigger value="homoglyph" className="flex items-center gap-2 data-[state=active]:bg-primary/20">
            <Type className="h-4 w-4" />
            Homoglyphs
          </TabsTrigger>
          <TabsTrigger value="unicode" className="flex items-center gap-2 data-[state=active]:bg-primary/20">
            <Shield className="h-4 w-4" />
            Unicode Threats
          </TabsTrigger>
          <TabsTrigger value="emoji" className="flex items-center gap-2 data-[state=active]:bg-primary/20">
            <Fingerprint className="h-4 w-4" />
            Emoji Stego
          </TabsTrigger>
          <TabsTrigger value="image" className="flex items-center gap-2 data-[state=active]:bg-primary/20">
            <Binary className="h-4 w-4" />
            Image LSB
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="zero-width">
          <ZeroWidthSection />
        </TabsContent>
        
        <TabsContent value="entropy">
          <EntropySection />
        </TabsContent>
        
        <TabsContent value="homoglyph">
          <HomoglyphSection />
        </TabsContent>
        
        <TabsContent value="unicode">
          <UnicodeThreatSection />
        </TabsContent>
        
        <TabsContent value="emoji">
          <EmojiSection />
        </TabsContent>
        
        <TabsContent value="image">
          <ImageSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
