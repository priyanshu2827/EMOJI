'use client';

import { useActionState, useEffect, useState } from 'react';
import { decodeEmoji, encodeEmoji } from '@/lib/actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Terminal, Smile, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Hyperspeed from './hyperspeed';
import { hyperspeedPresets } from './hyperspeed-presets';
import ZeroWidthTools from './zerowidth-tools';
import UnicodeSanitizerTools from './unicode-sanitizer-tools';


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
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>EmojiEncoder</CardTitle>
        <CardDescription>Hide a secret message within a block of emojis. Provide an optional password for encryption.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Secret Message</Label>
            <Textarea id="message" name="message" placeholder="Your secret message..." required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-encode">Password (optional)</Label>
            <Input id="password-encode" name="password" type="password" placeholder="Password to encrypt the message" />
          </div>
          <Button type="submit">Encode</Button>
        </form>
        {(state as any)?.encoded && (
          <div className="mt-4">
            <Label>Encoded Output</Label>
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription className="mt-2 p-2 bg-muted rounded-md font-mono break-words text-sm">
                {(state as any)?.encoded}
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
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
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>EmojiDecoder</CardTitle>
        <CardDescription>Extract a secret message from a block of emojis. Provide the password if it was encrypted.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="encodedMessage">Encoded Message</Label>
            <Textarea id="encodedMessage" name="encodedMessage" placeholder="Paste the emoji message here..." required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-decode">Password</Label>
            <Input id="password-decode" name="password" type="password" placeholder="Password used during encoding" />
          </div>
          <Button type="submit">Decode</Button>
        </form>
        {(state as any)?.decoded && (
          <div className="mt-4">
            <Label>Decoded Message</Label>
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription className="mt-2 p-2 bg-muted rounded-md break-words">
                {(state as any)?.decoded}
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function EmojiEncodeClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="container mx-auto p-4 md:p-8 relative z-10 min-h-[60vh]">
        <div className="mb-8 animate-pulse">
          <div className="h-10 w-64 bg-muted rounded mb-2"></div>
          <div className="h-4 w-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 relative z-10">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Hyperspeed effectOptions={hyperspeedPresets.one} />
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight font-headline text-white">Steganography Tools</h1>
        <p className="text-muted-foreground">Encode and decode hidden messages using various techniques.</p>
      </div>

      <Tabs defaultValue="emoji" className="w-full">
        <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-8">
          <TabsTrigger value="emoji" className="flex items-center gap-2">
            <Smile className="h-4 w-4" />
            Emoji Tools
          </TabsTrigger>
          <TabsTrigger value="zerowidth" className="flex items-center gap-2">
            <EyeOff className="h-4 w-4" />
            Zero-Width
          </TabsTrigger>
          <TabsTrigger value="unicode" className="flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            Unicode Sanitizer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="emoji">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <Encoder />
            <Decoder />
          </div>
        </TabsContent>

        <TabsContent value="zerowidth">
          <ZeroWidthTools />
        </TabsContent>

        <TabsContent value="unicode">
          <UnicodeSanitizerTools />
        </TabsContent>
      </Tabs>
    </div>
  );
}