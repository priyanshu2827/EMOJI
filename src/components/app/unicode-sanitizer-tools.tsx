'use client';

import { useActionState, useEffect, useState } from 'react';
import { sanitizeUnicodeText, generateUnicodeThreatSample } from '@/lib/actions';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Terminal, Copy, Check, Shield, AlertTriangle, Binary, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SpotlightCard from './spotlight-card';
import { CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

function Sanitizer() {
  const [state, formAction] = useActionState(sanitizeUnicodeText, null);
  const [allowEmoji, setAllowEmoji] = useState(false);
  const [detectPromptInjection, setDetectPromptInjection] = useState(true);
  const [stripHTML, setStripHTML] = useState(true);
  const [stripMarkdown, setStripMarkdown] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (state && 'error' in (state as any)) {
      toast({
        variant: 'destructive',
        title: 'Sanitization Error',
        description: (state as any).error,
      });
    }
  }, [state, toast]);

  const handleCopy = async () => {
    if (state && 'cleaned' in (state as any)) {
      await navigator.clipboard.writeText((state as any).cleaned);
      setCopied(true);
      toast({ title: 'Copied!', description: 'Sanitized text copied to clipboard.' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <SpotlightCard className="p-0 border-white/5 overflow-hidden bg-neutral-900/40 backdrop-blur-2xl">
      <div className="p-6 border-b border-white/5 bg-white/5">
        <div className="flex items-center gap-2 text-emerald-400 mb-1 font-mono text-[10px] tracking-widest uppercase">
          <Shield size={12} />
          <span>Sanitization Module</span>
        </div>
        <h3 className="text-xl font-bold tracking-tight">Unicode Sanitizer</h3>
        <p className="text-xs text-neutral-500 mt-1 uppercase tracking-tighter">Multi-Layer Threat Neutralization</p>
      </div>
      <CardContent className="p-6">
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="allowEmoji" value={allowEmoji.toString()} />
          <input type="hidden" name="detectPromptInjection" value={detectPromptInjection.toString()} />
          <input type="hidden" name="stripHTML" value={stripHTML.toString()} />
          <input type="hidden" name="stripMarkdown" value={stripMarkdown.toString()} />

          <div className="space-y-2">
            <Label htmlFor="text-to-sanitize" className="text-[10px] font-mono uppercase text-neutral-500 tracking-wider">Suspect Stream</Label>
            <Textarea
              id="text-to-sanitize"
              name="text"
              placeholder="Paste stream for heavy-duty threat analysis and cleaning..."
              className="min-h-[200px] bg-black/40 border-white/10 focus:border-emerald-500/50 rounded-xl font-mono text-xs leading-relaxed"
              required
            />
          </div>

          <div className="space-y-4">
            <Label className="text-[10px] font-mono uppercase text-neutral-500 tracking-wider">Sanitization Protocols</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                <Checkbox
                  id="allow-emoji"
                  checked={allowEmoji}
                  onCheckedChange={(checked) => setAllowEmoji(checked as boolean)}
                  className="border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-none"
                />
                <label htmlFor="allow-emoji" className="text-xs font-mono uppercase text-neutral-400 cursor-pointer select-none">
                  Allow Emojis
                </label>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                <Checkbox
                  id="detect-injection"
                  checked={detectPromptInjection}
                  onCheckedChange={(checked) => setDetectPromptInjection(checked as boolean)}
                  className="border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-none"
                />
                <label htmlFor="detect-injection" className="text-xs font-mono uppercase text-neutral-400 cursor-pointer select-none">
                  Prompt Injection
                </label>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold uppercase tracking-widest text-xs h-12 rounded-xl">
            Execute Sanitization Protocol
          </Button>
        </form>

        {state && 'cleaned' in (state as any) && (
          <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                <Terminal size={10} />
                <span>Sanitized Data Stream</span>
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

            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl font-mono text-xs break-words selection:bg-emerald-500/30 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-500/20">
              {(state as any).cleaned || <span className="text-neutral-600 italic">STREAM_EMPTY // ALL_ENTITIES_NEUTRALIZED</span>}
            </div>

            {(state as any).report && (state as any).report.stats.issuesFound > 0 && (
              <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-400">
                  <AlertTriangle size={14} />
                  <span className="text-[10px] font-mono uppercase tracking-widest">Threats Identified</span>
                </div>
                <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20 font-mono text-xs">
                  {(state as any).report.stats.issuesFound} ISSUES
                </Badge>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </SpotlightCard>
  );
}

export default function UnicodeSanitizerTools() {
  return (
    <div className="animate-in fade-in duration-1000">
      <Sanitizer />
    </div>
  );
}
