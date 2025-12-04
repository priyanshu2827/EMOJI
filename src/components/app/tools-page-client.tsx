'use client';

import { useFormState } from 'react-dom';
import { decodeEmoji, encodeEmoji } from '@/lib/actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';


function Encoder() {
  const [state, formAction] = useFormState(encodeEmoji, null);
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

  return (
    <Card>
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
        {state?.encoded && (
          <div className="mt-4">
            <Label>Encoded Output</Label>
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription className="mt-2 p-2 bg-muted rounded-md font-mono break-words text-sm">
                {state.encoded}
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Decoder() {
  const [state, formAction] = useFormState(decodeEmoji, null);
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
    <Card>
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
        {state?.decoded && (
          <div className="mt-4">
            <Label>Decoded Message</Label>
             <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription className="mt-2 p-2 bg-muted rounded-md break-words">
                  {state.decoded}
                </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function EmojiEncodeClient() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Steganography Tools</h1>
        <p className="text-muted-foreground">Encode and decode hidden messages using various techniques.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Encoder />
        <Decoder />
      </div>
    </div>
  );
}