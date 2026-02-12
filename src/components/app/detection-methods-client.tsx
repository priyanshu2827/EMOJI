'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Type,
  Info,
  Terminal as TerminalIcon,
  Search,
  CheckCircle2
} from 'lucide-react';
import dynamic from 'next/dynamic';
const Hyperspeed = dynamic(() => import('./hyperspeed'), { ssr: false });
import { hyperspeedPresets } from './hyperspeed-presets';
import SpotlightCard from './spotlight-card';
import { CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

function ReportHeader({ title, icon: Icon, badge, colorClass }: { title: string, icon: any, badge?: string, colorClass: string }) {
  return (
    <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
      <div>
        <div className={cn("flex items-center gap-2 mb-1 font-mono text-[10px] tracking-widest uppercase", colorClass)}>
          <Icon size={12} />
          <span>Forensic Methodology</span>
        </div>
        <h3 className="text-xl font-bold tracking-tight">{title}</h3>
      </div>
      {badge && (
        <Badge variant="outline" className={cn("bg-white/5 border-white/10 font-mono text-[10px] py-1", colorClass)}>
          {badge}
        </Badge>
      )}
    </div>
  );
}

function ZeroWidthSection() {
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <SpotlightCard className="p-0 border-white/5 overflow-hidden bg-neutral-900/40 backdrop-blur-2xl">
        <ReportHeader title="Zero-Width Character Analysis" icon={EyeOff} badge="Protocol: ZW-10" colorClass="text-emerald-400" />
        <CardContent className="p-6 space-y-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                <Info size={12} />
                <span>Detection Vector</span>
              </div>
              <p className="text-sm text-neutral-300 leading-relaxed font-medium">
                Zero-width characters are invisible Unicode entities that occupy no visual space but reside within the byte-stream.
                Our engine performs a multi-pass sweep to identify non-printing code points used for data masking.
              </p>
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
                {[
                  { code: 'U+200B', label: 'ZW-SPACE' },
                  { code: 'U+200C', label: 'ZW-NON-JOINER' },
                  { code: 'U+200D', label: 'ZW-JOINER' },
                  { code: 'U+FEFF', label: 'BYTE-ORDER-MARK' }
                ].map((item) => (
                  <div key={item.code} className="p-3 bg-black/40 border border-white/5 rounded-xl flex flex-col gap-1">
                    <span className="text-neutral-500">{item.label}</span>
                    <span className="text-emerald-400 font-bold">{item.code}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl flex gap-4 items-start">
            <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h4 className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest mb-1 text-glow-rose">Security Implications</h4>
              <p className="text-xs text-neutral-400 leading-relaxed uppercase tracking-tighter">
                Adversaries utilize zero-width steganography to embed hidden watermarks for internal leak tracking or to hide command-and-control payloads within sanitised text streams.
              </p>
            </div>
          </div>
        </CardContent>
      </SpotlightCard>
    </div>
  );
}

function EntropySection() {
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <SpotlightCard className="p-0 border-white/5 overflow-hidden bg-neutral-900/40 backdrop-blur-2xl">
        <ReportHeader title="Shannon Entropy Telemetry" icon={BarChart3} badge="Accuracy: 99.8%" colorClass="text-amber-400" />
        <CardContent className="p-6 space-y-8">
          <p className="text-sm text-neutral-300 leading-relaxed font-medium">
            Entropy measures the unpredictability of informational content. High entropy in textual data often indicates
            the presence of encrypted or encoded payloads that deviate from natural language frequency distributions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
            {[
              { range: '0.0 - 3.0', label: 'NOMINAL', color: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20' },
              { range: '3.0 - 4.5', label: 'NATURAL', color: 'text-neutral-400', bg: 'bg-white/5', border: 'border-white/5' },
              { range: '4.5 - 8.0', label: 'ANOMALOUS', color: 'text-rose-400', bg: 'bg-rose-500/5', border: 'border-rose-500/20' }
            ].map((item) => (
              <div key={item.label} className={cn("p-6 rounded-3xl border flex flex-col gap-2", item.bg, item.border)}>
                <span className="text-[10px] uppercase tracking-widest opacity-50">{item.label}</span>
                <span className={cn("text-2xl font-black italic tracking-tighter", item.color)}>{item.range}</span>
              </div>
            ))}
          </div>

          <div className="p-4 bg-black/40 border border-white/10 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Code size={14} className="text-amber-400" />
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Mathematical Basis</span>
            </div>
            <code className="block p-4 bg-black/60 rounded-xl text-xs font-mono text-amber-500 text-glow-amber">
              H(X) = -Σ p(x) × log₂(p(x))
            </code>
          </div>
        </CardContent>
      </SpotlightCard>
    </div>
  );
}

function HomoglyphSection() {
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <SpotlightCard className="p-0 border-white/5 overflow-hidden bg-neutral-900/40 backdrop-blur-2xl">
        <ReportHeader title="Homoglyph Visual Validation" icon={Type} badge="Module: V-SCAN" colorClass="text-emerald-400" />
        <CardContent className="p-6 space-y-8">
          <p className="text-sm text-neutral-300 leading-relaxed font-medium">
            Homoglyph attacks exploit the visual similarity between characters from different script blocks (e.g., Cyrillic 'а' vs Latin 'a').
            Our analyzer cross-references Unicode code points against expected script domains to identify spoofed identifiers.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Identified Clusters</div>
              {[
                { char: 'а', target: 'a', block: 'CYRILLIC' },
                { char: 'е', target: 'e', block: 'CYRILLIC' },
                { char: 'о', target: 'o', block: 'CYRILLIC' },
                { char: 'Ι', target: 'I', block: 'GREEK' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-xl">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-black text-emerald-400">{item.char}</span>
                    <ArrowRight size={12} className="text-neutral-700" />
                    <span className="text-2xl font-black text-neutral-300">{item.target}</span>
                  </div>
                  <Badge variant="outline" className="font-mono text-[9px] uppercase border-white/10">{item.block}</Badge>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Attack Vectors</div>
              <div className="space-y-3 font-mono text-[10px]">
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-emerald-400 mb-1 tracking-widest">DOMAIN SPOOFING</div>
                  <p className="text-neutral-500">Impersonating critical infrastructure URIs using lookalike characters.</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-emerald-400 mb-1 tracking-widest">FILTER EVASION</div>
                  <p className="text-neutral-500">Injecting homoglyphs to bypass keyword-based intrusion detection.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </SpotlightCard>
    </div>
  );
}

function UnicodeThreatSection() {
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <SpotlightCard className="p-0 border-white/5 overflow-hidden bg-neutral-900/40 backdrop-blur-2xl">
        <ReportHeader title="Extended Unicode Analysis" icon={Shield} badge="Security V4.2" colorClass="text-rose-400" />
        <CardContent className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SpotlightCard className="p-6 bg-rose-500/5 border-rose-500/10">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="destructive" className="bg-rose-500/20 text-rose-400 rounded-sm">CRITICAL</Badge>
                <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400">BIDI-OVERRIDE</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed uppercase tracking-tighter mb-4">
                Bidirectional characters like U+202E reverse text layout, enabling file extension spoofing (e.g., harmless.exe becomes exe.sselmlah).
              </p>
              <div className="p-3 bg-black/40 rounded-xl font-mono text-[10px] text-rose-300 border border-rose-500/20">
                THREAT_SIGNATURE: U+202E [RLO]
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-6 bg-amber-500/5 border-amber-500/10">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="border-amber-500/20 text-amber-400 rounded-sm uppercase font-mono text-[10px]">Warning</Badge>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400">Exotic Whitespace</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed uppercase tracking-tighter mb-4">
                Non-standard spaces (U+00A0, U+2000-U+200A) are used as timing side-channels or to evade simple regex sanitization.
              </p>
              <div className="p-3 bg-black/40 rounded-xl font-mono text-[10px] text-amber-300 border border-amber-500/20">
                ANOMALY_INDEX: HIGH_ENTROPY_SPACING
              </div>
            </SpotlightCard>
          </div>
        </CardContent>
      </SpotlightCard>
    </div>
  );
}

function EmojiSection() {
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <SpotlightCard className="p-0 border-white/5 overflow-hidden bg-neutral-900/40 backdrop-blur-2xl">
        <ReportHeader title="Emoji-Linked Steganography" icon={Fingerprint} badge="Protocol: EM-GUARD" colorClass="text-emerald-400" />
        <CardContent className="p-6 space-y-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-4">
              <p className="text-sm text-neutral-300 leading-relaxed font-medium">
                Emoji encodings hide data by mapping bit-patterns to specific emoji sequences or ZWJ (Zero Width Joiner) combinations.
                Our scanner detects unnatural emoji density and structural anomalies in multi-part emoji symbols.
              </p>
              <div className="grid grid-cols-1 gap-2">
                {['Density-to-Text Ratio Analysis', 'Structural ZWJ Validation', 'Skin Tone Variation Sequencing'].map((t) => (
                  <div key={t} className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl font-mono text-[10px] uppercase text-neutral-500">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    {t}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Fingerprint size={80} />
                </div>
                <h4 className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest mb-3">Engine Mechanics</h4>
                <p className="text-xs text-neutral-400 leading-relaxed uppercase tracking-tighter">
                  EmojiEncode technology decomposes payloads into binary packets, which are then cross-referenced against a dynamic emoji lookup-table during both sanitisation and extraction phases.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </SpotlightCard>
    </div>
  );
}

function ImageSection() {
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <SpotlightCard className="p-0 border-white/5 overflow-hidden bg-neutral-900/40 backdrop-blur-2xl">
        <ReportHeader title="Image LSB Bitstream Analysis" icon={Binary} badge="Forensic V2" colorClass="text-emerald-400" />
        <CardContent className="p-6 space-y-8">
          <p className="text-sm text-neutral-300 leading-relaxed font-medium">
            LSB steganography manipulates the least significant bits of pixel data to embed hidden packets. While visually imperceptible,
            these modifications alter the statistical distribution of the lower bit-planes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="p-6 bg-black/40 border border-white/10 rounded-3xl space-y-4">
              <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Statistical Distribution</div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-mono text-neutral-600 uppercase">
                    <span>Natural Variance</span>
                    <span>~0.5</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500/50 w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-mono text-neutral-600 uppercase">
                    <span>Anomalous Bias</span>
                    <span>{'>'}0.98</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500/50 w-[98%]" />
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 font-mono text-[9px]">
                <div className="text-emerald-400 uppercase mb-1 tracking-widest">LSB ENTROPY ANALYSIS</div>
                <p className="text-neutral-500">Calculating bit-plane randomness to detect non-natural data alignment.</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 font-mono text-[9px]">
                <div className="text-emerald-400 uppercase mb-1 tracking-widest">HEURISTIC RS-DETECTION</div>
                <p className="text-neutral-500">Analyzing the proportion of regular and singular groups in the image signal.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </SpotlightCard>
    </div>
  );
}

function ArrowRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export default function DetectionMethodsClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 overflow-x-hidden pt-24 pb-20">
      {/* Background Effect */}
      <div className="fixed inset-0 z-0">
        <Hyperspeed effectOptions={hyperspeedPresets.one} />
        <div className="absolute inset-0 bg-black/60 pointer-events-none" />
      </div>

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 mb-2 font-mono text-xs tracking-widest uppercase">
              <TerminalIcon size={14} />
              <span>Intelligence Database // Repository</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-b from-white to-neutral-500 bg-clip-text text-transparent">
              Detection Methods
            </h1>
          </div>
        </div>

        <Tabs defaultValue="zero-width" className="w-full">
          <TabsList className="flex items-center justify-start gap-4 h-auto bg-transparent border-b border-white/5 rounded-none p-0 mb-10 overflow-x-auto pb-px scrollbar-none">
            {[
              { id: 'zero-width', label: 'Zero-Width', icon: EyeOff },
              { id: 'entropy', label: 'Entropy', icon: BarChart3 },
              { id: 'homoglyph', label: 'Homoglyphs', icon: Type },
              { id: 'unicode', label: 'Unicode Threats', icon: Shield },
              { id: 'emoji', label: 'Emoji Stego', icon: Fingerprint },
              { id: 'image', label: 'Image LSB', icon: Binary },
            ].map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest py-4 border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-emerald-400 text-neutral-500 bg-transparent rounded-none transition-all px-4"
              >
                <tab.icon size={14} />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="zero-width" className="mt-0 outline-none">
            <ZeroWidthSection />
          </TabsContent>

          <TabsContent value="entropy" className="mt-0 outline-none">
            <EntropySection />
          </TabsContent>

          <TabsContent value="homoglyph" className="mt-0 outline-none">
            <HomoglyphSection />
          </TabsContent>

          <TabsContent value="unicode" className="mt-0 outline-none">
            <UnicodeThreatSection />
          </TabsContent>

          <TabsContent value="emoji" className="mt-0 outline-none">
            <EmojiSection />
          </TabsContent>

          <TabsContent value="image" className="mt-0 outline-none">
            <ImageSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
