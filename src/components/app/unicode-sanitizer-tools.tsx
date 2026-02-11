'use client';

import { useActionState, useEffect, useState } from 'react';
import { sanitizeUnicodeText, generateUnicodeThreatSample } from '@/lib/actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Terminal, Copy, Check, Shield, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Unicode Sanitizer</CardTitle>
        <CardDescription>
          Remove malicious Unicode characters, BiDi attacks, prompt injections, and emoji-based threats.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="allowEmoji" value={allowEmoji.toString()} />
          <input type="hidden" name="detectPromptInjection" value={detectPromptInjection.toString()} />
          <input type="hidden" name="stripHTML" value={stripHTML.toString()} />
          <input type="hidden" name="stripMarkdown" value={stripMarkdown.toString()} />

          <div className="space-y-2">
            <Label htmlFor="text-to-sanitize">Text to Sanitize</Label>
            <Textarea
              id="text-to-sanitize"
              name="text"
              placeholder="Paste text that may contain malicious Unicode characters..."
              className="min-h-[200px] resize-y font-mono text-sm"
              required
            />
          </div>

          <div className="space-y-3">
            <Label>Sanitization Options</Label>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allow-emoji"
                  checked={allowEmoji}
                  onCheckedChange={(checked) => setAllowEmoji(checked as boolean)}
                />
                <label htmlFor="allow-emoji" className="text-sm cursor-pointer">
                  Allow Emojis
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="detect-injection"
                  checked={detectPromptInjection}
                  onCheckedChange={(checked) => setDetectPromptInjection(checked as boolean)}
                />
                <label htmlFor="detect-injection" className="text-sm cursor-pointer">
                  Detect Prompt Injection
                </label>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full">Sanitize Text</Button>
        </form>

        {state && 'cleaned' in (state as any) && (
          <div className="mt-6 space-y-4">
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>Sanitization Complete</AlertTitle>
              <AlertDescription className="mt-2 p-2 bg-muted rounded-md font-mono break-words text-sm max-h-[200px] overflow-y-auto">
                {(state as any).cleaned || '(Empty after sanitization)'}
              </AlertDescription>
            </Alert>

            {(state as any).report && (state as any).report.stats.issuesFound > 0 && (
              <div className="p-3 bg-muted rounded-md space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Issues Found:</span>
                  <Badge variant="destructive">{(state as any).report.stats.issuesFound}</Badge>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function UnicodeSanitizerTools() {
  return (
    <div className="grid grid-cols-1 gap-8">
      <Sanitizer />
    </div>
  );
}
