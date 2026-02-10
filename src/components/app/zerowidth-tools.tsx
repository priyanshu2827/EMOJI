'use client';

import { useActionState, useEffect, useState } from 'react';
import { encodeZeroWidth, decodeZeroWidth, cleanZeroWidth } from '@/lib/actions';
import { Position } from '@/lib/zerowidth';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Terminal, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function Encoder() {
  const [state, formAction] = useActionState(encodeZeroWidth, null);
  const [position, setPosition] = useState<Position>(Position.BOTTOM);
  const [kValue, setKValue] = useState('1');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.error) {
      toast({
        variant: 'destructive',
        title: 'Encoding Error',
        description: state.error,
      });
    }
  }, [state, toast]);

  const handleCopy = async () => {
    if (state?.encoded) {
      await navigator.clipboard.writeText(state.encoded);
      setCopied(true);
      toast({ title: 'Copied!', description: 'Encoded text copied to clipboard.' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Zero-Width Encoder</CardTitle>
        <CardDescription>
          Hide a secret message inside normal text using invisible zero-width characters.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="position" value={position} />
          <input type="hidden" name="k" value={kValue} />
          
          <div className="space-y-2">
            <Label htmlFor="source-text">Source Text (Container)</Label>
            <Textarea
              id="source-text"
              name="sourceText"
              placeholder="Enter the text that will contain your hidden message..."
              className="min-h-[120px] resize-y font-mono text-sm"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="secret-message">Secret Message</Label>
            <Textarea
              id="secret-message"
              name="secretMessage"
              placeholder="Your secret message to hide..."
              className="min-h-[80px] resize-y font-mono text-sm"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position-select">Position</Label>
              <Select value={position} onValueChange={(v) => setPosition(v as Position)}>
                <SelectTrigger id="position-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Position.TOP}>Top - Before first line</SelectItem>
                  <SelectItem value={Position.BOTTOM}>Bottom - After last line</SelectItem>
                  <SelectItem value={Position.RANDOM}>Random - Random positions</SelectItem>
                  <SelectItem value={Position.NTHLINES}>Nth Lines - Every nth line</SelectItem>
                  <SelectItem value={Position.RANDOMINLINE}>Random Inline - Random in lines</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(position === Position.RANDOM || position === Position.NTHLINES || position === Position.RANDOMINLINE) && (
              <div className="space-y-2">
                <Label htmlFor="k-value">
                  {position === Position.RANDOM ? 'Occurrences' : 
                   position === Position.NTHLINES ? 'Every N Lines' : 'Every N Lines'}
                </Label>
                <Input
                  id="k-value"
                  type="number"
                  min="1"
                  value={kValue}
                  onChange={(e) => setKValue(e.target.value)}
                  placeholder="1"
                />
              </div>
            )}
          </div>
          
          <Button type="submit" className="w-full">Encode Message</Button>
        </form>
        
        {state?.encoded && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <Label>Encoded Output</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="h-8"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription className="mt-2 p-2 bg-muted rounded-md font-mono break-words text-sm max-h-[200px] overflow-y-auto">
                {state.encoded}
              </AlertDescription>
            </Alert>
            <p className="text-xs text-muted-foreground">
              ✨ Your secret message is now hidden using invisible characters. The text looks identical but contains hidden data!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Decoder() {
  const [state, formAction] = useActionState(decodeZeroWidth, null);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.error) {
      toast({
        variant: 'destructive',
        title: 'Decoding Error',
        description: state.error,
      });
    }
  }, [state, toast]);

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Zero-Width Decoder</CardTitle>
        <CardDescription>
          Extract hidden messages from text containing zero-width characters.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="encoded-text">Text with Hidden Message</Label>
            <Textarea
              id="encoded-text"
              name="encodedText"
              placeholder="Paste text that may contain hidden zero-width characters..."
              className="min-h-[200px] resize-y font-mono text-sm"
              required
            />
          </div>
          
          <Button type="submit" className="w-full">Decode Message</Button>
        </form>
        
        {state?.decoded && (
          <div className="mt-4">
            <Label>Decoded Message</Label>
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>Message Found!</AlertTitle>
              <AlertDescription className="mt-2 p-2 bg-muted rounded-md break-words">
                {state.decoded || '(No hidden message found)'}
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        {state?.decoded === '' && (
          <div className="mt-4">
            <Alert>
              <AlertTitle>No Hidden Message</AlertTitle>
              <AlertDescription>
                The text doesn't appear to contain any zero-width steganography.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Cleaner() {
  const [state, formAction] = useActionState(cleanZeroWidth, null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.error) {
      toast({
        variant: 'destructive',
        title: 'Cleaning Error',
        description: state.error,
      });
    }
  }, [state, toast]);

  const handleCopy = async () => {
    if (state?.cleaned) {
      await navigator.clipboard.writeText(state.cleaned);
      setCopied(true);
      toast({ title: 'Copied!', description: 'Cleaned text copied to clipboard.' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Zero-Width Cleaner</CardTitle>
        <CardDescription>
          Remove all hidden zero-width characters from text.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text-to-clean">Text to Clean</Label>
            <Textarea
              id="text-to-clean"
              name="textToClean"
              placeholder="Paste text to remove any hidden zero-width characters..."
              className="min-h-[200px] resize-y font-mono text-sm"
              required
            />
          </div>
          
          <Button type="submit" className="w-full">Clean Text</Button>
        </form>
        
        {state?.cleaned && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <Label>Cleaned Output</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="h-8"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>Cleaned Successfully!</AlertTitle>
              <AlertDescription className="mt-2 p-2 bg-muted rounded-md font-mono break-words text-sm max-h-[200px] overflow-y-auto">
                {state.cleaned}
              </AlertDescription>
            </Alert>
            {state.removedCount !== undefined && state.removedCount > 0 && (
              <p className="text-xs text-muted-foreground">
                🧹 Removed {state.removedCount} hidden zero-width character(s)
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ZeroWidthTools() {
  return (
    <div className="grid grid-cols-1 gap-8">
      <Encoder />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Decoder />
        <Cleaner />
      </div>
    </div>
  );
}
