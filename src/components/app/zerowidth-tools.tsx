'use client';

import { useActionState, useEffect, useState } from 'react';
import { encodeZeroWidth, decodeZeroWidth, cleanZeroWidth } from '@/lib/actions';
import { Position, SteganographyMode } from '@/lib/zerowidth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Terminal, Copy, Check, EyeOff, Shield, Eraser, Info, Binary } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SpotlightCard from './spotlight-card';
import { CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

function Encoder() {
  const [state, formAction] = useActionState(encodeZeroWidth, null);
  const [position, setPosition] = useState<Position>(Position.BOTTOM);
  const [mode, setMode] = useState<SteganographyMode>(SteganographyMode.BINARY);
  const [kValue, setKValue] = useState('1');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if ((state as any)?.error) {
      toast({
        variant: 'destructive',
        title: 'Encoding Error',
        description: (state as any).error,
      });
    }
  }, [state, toast]);

  const handleCopy = async () => {
    const s = state as any;
    if (s?.encoded) {
      await navigator.clipboard.writeText(s.encoded);
      setCopied(true);
      toast({ title: 'Copied!', description: 'Encoded text copied to clipboard.' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <SpotlightCard className="p-0 border-white/5 overflow-hidden bg-neutral-900/40 backdrop-blur-2xl">
      <div className="p-6 border-b border-white/5 bg-white/5">
        <div className="flex items-center gap-2 text-emerald-400 mb-1 font-mono text-[10px] tracking-widest uppercase">
          <Shield size={12} />
          <span>Zero-Width Module</span>
        </div>
        <h3 className="text-xl font-bold tracking-tight">Invisible Encoder</h3>
        <p className="text-xs text-neutral-500 mt-1 uppercase tracking-tighter">Bitmask Hydration into Text Container</p>
      </div>
      <CardContent className="p-6">
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="position" value={position} />
          <input type="hidden" name="mode" value={mode} />
          <input type="hidden" name="k" value={kValue} />

          <div className="space-y-2">
            <Label htmlFor="source-text" className="text-[10px] font-mono uppercase text-neutral-500 tracking-wider">Source Container</Label>
            <Textarea
              id="source-text"
              name="sourceText"
              placeholder="Inject hidden payload into this stream..."
              className="min-h-[120px] bg-black/40 border-white/10 focus:border-emerald-500/50 rounded-xl font-mono text-xs leading-relaxed"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secret-message" className="text-[10px] font-mono uppercase text-neutral-500 tracking-wider">Hidden Payload</Label>
            <Textarea
              id="secret-message"
              name="secretMessage"
              placeholder="Sensitive data to be masked..."
              className="min-h-[80px] bg-black/40 border-white/10 focus:border-emerald-500/50 rounded-xl font-mono text-xs leading-relaxed"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position-select" className="text-[10px] font-mono uppercase text-neutral-500 tracking-wider">Injection Point</Label>
              <Select value={position} onValueChange={(v) => setPosition(v as Position)}>
                <SelectTrigger id="position-select" className="bg-black/40 border-white/10 focus:ring-emerald-500/20 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-white/10">
                  <SelectItem value={Position.TOP}>Protocol: Header</SelectItem>
                  <SelectItem value={Position.BOTTOM}>Protocol: Footer</SelectItem>
                  <SelectItem value={Position.RANDOM}>Protocol: Scatter</SelectItem>
                  <SelectItem value={Position.NTHLINES}>Protocol: Sequential</SelectItem>
                  <SelectItem value={Position.RANDOMINLINE}>Protocol: Inline-Entropy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mode-select" className="text-[10px] font-mono uppercase text-neutral-500 tracking-wider">Encoding Cipher</Label>
              <Select value={mode} onValueChange={(v) => setMode(v as SteganographyMode)}>
                <SelectTrigger id="mode-select" className="bg-black/40 border-white/10 focus:ring-emerald-500/20 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-white/10">
                  <SelectItem value={SteganographyMode.BINARY}>Binary (2-Character)</SelectItem>
                  <SelectItem value={SteganographyMode.ZWSP_TOOL}>Base-7 (7-Character)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold uppercase tracking-widest text-xs h-12 rounded-xl">
            Authorize Injection
          </Button>
        </form>

        {(state as any)?.encoded && (
          <div className="mt-8 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                <Shield size={10} />
                <span>Encapsulated Stream</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="h-6 px-2 bg-white/5 border-white/10 text-[10px] font-mono uppercase"
              >
                {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                {copied ? 'Captured' : 'Capture'}
              </Button>
            </div>
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl font-mono text-xs break-words selection:bg-emerald-500/30 max-h-[150px] overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-500/20">
              {(state as any)?.encoded}
            </div>
          </div>
        )}
      </CardContent>
    </SpotlightCard>
  );
}

function Decoder() {
  const [state, formAction] = useActionState(decodeZeroWidth, null);
  const [mode, setMode] = useState<SteganographyMode>(SteganographyMode.BINARY);
  const { toast } = useToast();

  useEffect(() => {
    if ((state as any)?.error) {
      toast({
        variant: 'destructive',
        title: 'Decoding Error',
        description: (state as any).error,
      });
    }
  }, [state, toast]);

  return (
    <SpotlightCard className="p-0 border-white/5 overflow-hidden bg-neutral-900/40 backdrop-blur-2xl h-full">
      <div className="p-6 border-b border-white/5 bg-white/5">
        <div className="flex items-center gap-2 text-amber-400 mb-1 font-mono text-[10px] tracking-widest uppercase">
          <Terminal size={12} />
          <span>Analysis Module</span>
        </div>
        <h3 className="text-xl font-bold tracking-tight">Invisible Decoder</h3>
        <p className="text-xs text-neutral-500 mt-1 uppercase tracking-tighter">Payload Extraction & Telemetry</p>
      </div>
      <CardContent className="p-6">
        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="encoded-text" className="text-[10px] font-mono uppercase text-neutral-500 tracking-wider">Intercepted Stream</Label>
            <Textarea
              id="encoded-text"
              name="encodedText"
              placeholder="Paste suspect text stream for analysis..."
              className="min-h-[150px] bg-black/40 border-white/10 focus:border-amber-500/50 rounded-xl font-mono text-xs leading-relaxed"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mode-select-decoder" className="text-[10px] font-mono uppercase text-neutral-500 tracking-wider">Protocol Cipher</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as SteganographyMode)}>
              <SelectTrigger id="mode-select-decoder" className="bg-black/40 border-white/10 focus:ring-amber-500/20 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-white/10">
                <SelectItem value={SteganographyMode.BINARY}>Binary (2-Character)</SelectItem>
                <SelectItem value={SteganographyMode.ZWSP_TOOL}>Base-7 (7-Character)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <input type="hidden" name="mode" value={mode} />

          <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold uppercase tracking-widest text-xs h-12 rounded-xl">
            Execute Heuristic Analysis
          </Button>
        </form>

        {(state as any)?.decoded && (
          <div className="mt-8 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-2 text-[10px] font-mono text-amber-400 uppercase tracking-widest">
              <Info size={10} />
              <span>Extracted Data</span>
            </div>
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl font-mono text-xs break-words selection:bg-amber-500/30">
              {(state as any)?.decoded}
            </div>
          </div>
        )}

        {(state as any)?.decoded === '' && (
          <div className="mt-8 p-4 bg-white/5 border border-white/5 rounded-xl text-center">
            <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">No anomalies detected in stream.</p>
          </div>
        )}
      </CardContent>
    </SpotlightCard>
  );
}

function Cleaner() {
  const [state, formAction] = useActionState(cleanZeroWidth, null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if ((state as any)?.error) {
      toast({
        variant: 'destructive',
        title: 'Cleaning Error',
        description: (state as any).error,
      });
    }
  }, [state, toast]);

  const handleCopy = async () => {
    const s = state as any;
    if (s?.cleaned) {
      await navigator.clipboard.writeText(s.cleaned);
      setCopied(true);
      toast({ title: 'Copied!', description: 'Cleaned text copied to clipboard.' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <SpotlightCard className="p-0 border-white/5 overflow-hidden bg-neutral-900/40 backdrop-blur-2xl h-full">
      <div className="p-6 border-b border-white/5 bg-white/5">
        <div className="flex items-center gap-2 text-rose-400 mb-1 font-mono text-[10px] tracking-widest uppercase">
          <Eraser size={12} />
          <span>Sanitization Module</span>
        </div>
        <h3 className="text-xl font-bold tracking-tight">Invisible Cleaner</h3>
        <p className="text-xs text-neutral-500 mt-1 uppercase tracking-tighter">Payload Neutralization & Scrubbing</p>
      </div>
      <CardContent className="p-6">
        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="text-to-clean" className="text-[10px] font-mono uppercase text-neutral-500 tracking-wider">Suspect Stream</Label>
            <Textarea
              id="text-to-clean"
              name="textToClean"
              placeholder="Paste stream for zero-width neutralization..."
              className="min-h-[150px] bg-black/40 border-white/10 focus:border-rose-500/50 rounded-xl font-mono text-xs leading-relaxed"
              required
            />
          </div>

          <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600 text-black font-bold uppercase tracking-widest text-xs h-12 rounded-xl">
            Execute Neutralization
          </Button>
        </form>

        {(state as any)?.cleaned && (
          <div className="mt-8 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-mono text-rose-400 uppercase tracking-widest">
                <Shield size={10} />
                <span>Sanitized Stream</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="h-6 px-2 bg-white/5 border-white/10 text-[10px] font-mono uppercase"
              >
                {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                {copied ? 'Captured' : 'Capture'}
              </Button>
            </div>
            <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl font-mono text-xs break-words selection:bg-rose-500/30">
              {(state as any).cleaned}
            </div>
            {(state as any)?.removedCount !== undefined && (state as any)?.removedCount > 0 && (
              <p className="text-[10px] font-mono text-rose-400/70 uppercase text-center">
                Alert: {(state as any).removedCount} hidden entities neutralized.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </SpotlightCard>
  );
}

export default function ZeroWidthTools() {
  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <Encoder />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <Decoder />
        <Cleaner />
      </div>
    </div>
  );
}
