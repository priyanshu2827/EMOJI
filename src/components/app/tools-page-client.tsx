'use client';

import { useActionState, useEffect, useState } from 'react';
import { decodeEmoji, encodeEmoji } from '@/lib/actions';

import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Terminal, Smile, EyeOff, Shield, Binary, RefreshCw, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
const Hyperspeed = dynamic(() => import('./hyperspeed'), { ssr: false });
import { hyperspeedPresets } from './hyperspeed-presets';
import ZeroWidthTools from './zerowidth-tools';
import UnicodeSanitizerTools from './unicode-sanitizer-tools';
import SpotlightCard from './spotlight-card';

function Encoder() {
  const [state, formAction] = useActionState(encodeEmoji, null);
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

  return (
    <SpotlightCard className="p-0 border-white/5 overflow-hidden bg-neutral-900/40 backdrop-blur-2xl h-full">
      <div className="p-6 border-b border-white/5 bg-white/5">
        <div className="flex items-center gap-2 text-emerald-400 mb-1 font-mono text-[10px] tracking-widest uppercase">
          <Binary size={12} />
          <span>Encoder Module</span>
        </div>
        <h3 className="text-xl font-bold tracking-tight">EmojiEncoder</h3>
        <p className="text-xs text-neutral-500 mt-1 uppercase tracking-tighter">Steganographic Payload Initialization</p>
      </div>
      <CardContent className="p-6">
        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="message" className="text-[10px] font-mono uppercase text-neutral-500 tracking-wider">Secret Message</Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Enter sensitive data for encapsulation..."
              required
              className="min-h-[120px] bg-black/40 border-white/10 focus:border-emerald-500/50 rounded-xl font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-encode" className="text-[10px] font-mono uppercase text-neutral-500 tracking-wider">Encryption Key (Optional)</Label>
            <Input
              id="password-encode"
              name="password"
              type="password"
              placeholder="AES-256 derived key..."
              className="bg-black/40 border-white/10 focus:border-emerald-500/50 rounded-xl font-mono text-sm"
            />
          </div>
          <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold uppercase tracking-widest text-xs h-12 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            Run Encryption Engine
          </Button>
        </form>

        {(state as any)?.encoded && (
          <div className="mt-8 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
              <Shield size={10} />
              <span>Output Stream Verified</span>
            </div>
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl font-mono text-sm break-words selection:bg-emerald-500/30">
              {(state as any)?.encoded}
            </div>
          </div>
        )}
      </CardContent>
    </SpotlightCard>
  );
}

function Decoder() {
  const [state, formAction] = useActionState(decodeEmoji, null);
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
          <span>Decoder Module</span>
        </div>
        <h3 className="text-xl font-bold tracking-tight">EmojiDecoder</h3>
        <p className="text-xs text-neutral-500 mt-1 uppercase tracking-tighter">Payload Extraction & Verification</p>
      </div>
      <CardContent className="p-6">
        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="encodedMessage" className="text-[10px] font-mono uppercase text-neutral-500 tracking-wider">Encoded Input</Label>
            <Textarea
              id="encodedMessage"
              name="encodedMessage"
              placeholder="Paste steganographic emoji stream..."
              required
              className="min-h-[120px] bg-black/40 border-white/10 focus:border-amber-500/50 rounded-xl font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-decode" className="text-[10px] font-mono uppercase text-neutral-500 tracking-wider">Decryption Key</Label>
            <Input
              id="password-decode"
              name="password"
              type="password"
              placeholder="Enter key for extraction..."
              className="bg-black/40 border-white/10 focus:border-amber-500/50 rounded-xl font-mono text-sm"
            />
          </div>
          <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold uppercase tracking-widest text-xs h-12 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.1)]">
            Execute Extraction
          </Button>
        </form>

        {(state as any)?.decoded && (
          <div className="mt-8 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-2 text-[10px] font-mono text-amber-400 uppercase tracking-widest">
              <Info size={10} />
              <span>Decrypted Data Found</span>
            </div>
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl font-mono text-sm break-words selection:bg-amber-500/30">
              {(state as any)?.decoded}
            </div>
          </div>
        )}
      </CardContent>
    </SpotlightCard>
  );
}

export default function EmojiEncodeClient() {
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
              <Shield size={14} />
              <span>Crypto Operations // Active</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-b from-white to-neutral-500 bg-clip-text text-transparent">
              Forensic Tools
            </h1>
          </div>
        </div>

        <Tabs defaultValue="emoji" className="w-full">
          <TabsList className="flex items-center justify-start gap-4 h-auto bg-transparent border-b border-white/5 rounded-none p-0 mb-10 overflow-x-auto pb-px scrollbar-none">
            {[
              { id: 'emoji', label: 'Emoji Stego', icon: Smile },
              { id: 'zerowidth', label: 'Zero-Width', icon: EyeOff },
              { id: 'unicode', label: 'Unicode Sanitize', icon: Terminal },
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

          <TabsContent value="emoji" className="mt-0 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              <Encoder />
              <Decoder />
            </div>
          </TabsContent>

          <TabsContent value="zerowidth" className="mt-0 outline-none">
            <ZeroWidthTools />
          </TabsContent>

          <TabsContent value="unicode" className="mt-0 outline-none">
            <UnicodeSanitizerTools />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
