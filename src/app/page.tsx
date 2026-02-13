import Link from 'next/link';
import { Button } from '@/components/ui/button';
import DecryptedText from '@/components/app/decrypted-text';
import { StegoShieldLogo } from '@/components/app/icons';
import { ArrowRight, ShieldCheck, Zap, Eye, Image as ImageIcon, FileText, Search, Mail, Download, CheckCircle2 } from 'lucide-react';
import SpotlightCard from '@/components/app/spotlight-card';
import { BentoGrid } from '@/components/app/bento-grid';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-emerald-500/30">
      {/* Grid Background */}
      <div className="fixed inset-0 z-0 bg-grid-white pointer-events-none" />

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8 animate-fade-in">
            <ShieldCheck size={16} />
            <span>Next-Generation Steganography Detection</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
            <DecryptedText
              text="INVISIFY"
              speed={50}
              maxIterations={20}
              animateOn="view"
              sequential={true}
              revealDirection="center"
              className="text-white"
              encryptedClassName="text-emerald-500"
            />
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-neutral-400 mb-10 leading-relaxed">
            Uncover hidden data with forensic precision. Our advanced engine detects steganography across
            text, images, and binary streams—now including real-time protection with our Email Guard extension.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="h-12 px-8 bg-white text-black hover:bg-neutral-200 transition-all font-semibold rounded-full">
              <Link href="/scan">
                Start Forensic Scan <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button variant="ghost" className="h-12 px-8 text-white hover:bg-white/5 border border-white/10 rounded-full">
              View Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* Bento Features Section */}
      <section className="relative z-10 px-6 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Powerful Detection Capabilities</h2>
            <p className="text-neutral-500">Advanced tools designed for security researchers and forensic analysts.</p>
          </div>

          <BentoGrid className="max-w-7xl mx-auto">
            {/* Main Feature - 2x1 */}
            <SpotlightCard className="md:col-span-2 md:row-span-1 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                  <Eye size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Real-time Vision Engine</h3>
                  <p className="text-neutral-400">Scan images for LSB substitution, Chi-Square attacks, and Sample Pair Analysis with instant risk scoring.</p>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between text-sm">
                <span className="text-emerald-400 font-mono">SC-01 // IMAGE_ANALYSIS</span>
                <Link href="/scan" className="text-white hover:underline flex items-center gap-1">
                  Launch Analyzer <ArrowRight size={14} />
                </Link>
              </div>
            </SpotlightCard>

            {/* Unicode Scanner */}
            <SpotlightCard className="flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Unicode Sanitizer</h3>
                  <p className="text-sm text-neutral-400">Detect and remove zero-width characters, BIDI overrides, and homoglyph attacks in text streams.</p>
                </div>
              </div>
              <div className="mt-4 text-xs font-mono text-neutral-600">TX-04 // TEXT_FORENSICS</div>
            </SpotlightCard>


            {/* Deep Insight */}
            <SpotlightCard className="md:col-span-2 flex flex-col justify-between group">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="h-12 w-12 shrink-0 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <Search size={24} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Deep Heuristic Scan</h3>
                  <p className="text-neutral-400">Our engine cross-references multiple detection methods to minimize false positives and identify even the most subtle anomalies.</p>
                </div>
              </div>
              <div className="mt-8 flex gap-2">
                <span className="px-2 py-1 rounded bg-white/5 text-[10px] text-neutral-500 uppercase font-bold tracking-widest">LSB</span>
                <span className="px-2 py-1 rounded bg-white/5 text-[10px] text-neutral-500 uppercase font-bold tracking-widest">CHI-SQ</span>
                <span className="px-2 py-1 rounded bg-white/5 text-[10px] text-neutral-500 uppercase font-bold tracking-widest">BIDI</span>
              </div>
            </SpotlightCard>
          </BentoGrid>
        </div>
      </section>

      {/* Browser Extension Section */}
      <section className="relative z-10 px-6 pb-32">
        <div className="max-w-5xl mx-auto">
          <SpotlightCard className="p-0 border-white/5 overflow-hidden bg-emerald-500/5 backdrop-blur-3xl">
            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/10">
              <div className="md:w-3/5 p-8 md:p-12 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Sentinel Prime: Email Guard</h2>
                    <p className="text-xs font-mono text-emerald-500/70 uppercase tracking-widest">Browser Extension // v0.1.0</p>
                  </div>
                </div>

                <p className="text-neutral-300 leading-relaxed font-medium">
                  Extend your forensic capabilities to your inbox. Our browser extension monitors your Gmail stream for hidden payloads,
                  protecting you from sophisticated steganographic phishing and data leaks in real-time.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500 uppercase">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    <span>Real-time Gmail Scan</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500 uppercase">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    <span>Payload Extraction</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500 uppercase">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    <span>Visual Warnings</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500 uppercase">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    <span>Auto-Sanitization</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold h-12 px-8 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <a href="/downloads/sentinel-prime-extension.zip" download="sentinel-prime-extension.zip">
                      <Download size={18} className="mr-2" /> Download Extension
                    </a>
                  </Button>
                </div>
              </div>

              <div className="md:w-2/5 p-8 md:p-12 bg-black/40 space-y-6">
                <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-neutral-400">Installation Node</h3>
                <div className="space-y-4">
                  {[
                    "1. Download and extract the extension module.",
                    "2. Navigate to chrome://extensions in your browser.",
                    "3. Activate 'Developer Mode' (top-right toggle).",
                    "4. Execute 'Load Unpacked' and select the directory."
                  ].map((step, i) => (
                    <div key={i} className="flex gap-3 items-start group">
                      <span className="text-[10px] font-mono text-emerald-500/50 mt-1">{i + 1}</span>
                      <p className="text-xs text-neutral-400 font-mono leading-tight group-hover:text-emerald-400 transition-colors uppercase italic tracking-tighter">
                        {step.split('. ')[1]}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="pt-6 mt-6 border-t border-white/5 opacity-30">
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    SYSTEM_READY // SEC_PROTO_MAIL
                  </div>
                </div>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </section>

      {/* Footer-like section */}
      <footer className="relative z-10 border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <StegoShieldLogo className="w-8 h-8" />
            <span className="font-bold tracking-tight">INVISIFY</span>
          </div>
          <div className="text-neutral-500 text-sm">
            © 2024 Invisify Security. Forensic-grade steganography detection.
          </div>
        </div>
      </footer>
    </div>
  );
}
