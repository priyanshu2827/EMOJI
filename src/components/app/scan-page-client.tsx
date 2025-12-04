'use client';

import { useState } from 'react';
import { useFormState } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  FileImage,
  FileText,
  Loader2,
  Sparkles,
  Smile,
} from 'lucide-react';

import { analyzeContent, generateSampleText } from '@/lib/actions';
import { useLogStore } from '@/lib/store';
import { type ScanResult } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  textInput: z.string().optional(),
  imageInput: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const severityStyles = {
  CLEAN: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800',
  SUSPICIOUS: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800',
  'HIGH-RISK': 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800',
};

export default function ScanPageClient() {
  const { toast } = useToast();
  const addLog = useLogStore((state) => state.addLog);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { textInput: '', imageInput: undefined },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('textInput', ''); // Clear text if image is selected
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleTextChange = () => {
    if (imagePreview) {
      form.setValue('imageInput', undefined);
      setImagePreview(null);
      const fileInput = document.getElementById('imageInput') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };
  
  const handleGenerateSample = async () => {
    setIsLoading(true);
    const res = await generateSampleText('cybersecurity', 'secret message');
    if ('error' in res) {
      toast({ variant: 'destructive', title: 'Error', description: res.error });
    } else {
      form.setValue('textInput', res.sampleText);
      toast({ title: 'Sample Generated', description: 'Sample text with a hidden message has been added to the text area.' });
    }
    setIsLoading(false);
  }

  const handleSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setResult(null);

    const formData = new FormData();
    if (data.textInput) formData.append('textInput', data.textInput);
    if (data.imageInput?.[0]) formData.append('imageInput', data.imageInput[0]);

    const res = await analyzeContent(null, formData);

    if ('error' in res) {
      toast({ variant: 'destructive', title: 'Scan Failed', description: res.error });
    } else {
      setResult(res);
      addLog(res);
      toast({ title: 'Scan Complete', description: `Analysis finished with result: ${res.severity}` });
    }
    setIsLoading(false);
  };
  
  const getIconForType = (type: ScanResult['type']) => {
    switch (type) {
      case 'Text': return <FileText className="h-5 w-5" />;
      case 'Image': return <FileImage className="h-5 w-5" />;
      case 'Emoji': return <Smile className="h-5 w-5" />;
      default: return null;
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-8 flex-1">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Analyze Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="textInput"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Text Input</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste text, code, or emojis here..."
                          className="min-h-[200px] resize-y"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleTextChange();
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="relative flex items-center">
                    <div className="flex-grow border-t border-border"></div>
                    <span className="flex-shrink mx-4 text-muted-foreground text-sm">OR</span>
                    <div className="flex-grow border-t border-border"></div>
                </div>

                <FormField
                  control={form.control}
                  name="imageInput"
                  render={({ field: { onChange, value, ...rest } }) => (
                    <FormItem>
                      <FormLabel>Image Upload</FormLabel>
                      <FormControl>
                         <Input id="imageInput" type="file" accept="image/*" onChange={(e) => {
                            onChange(e.target.files);
                            handleImageChange(e);
                          }} {...rest} value={value?.fileName} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {imagePreview && (
                  <div className="mt-4 relative w-full h-48 rounded-md overflow-hidden border">
                    <img src={imagePreview} alt="Image preview" className="w-full h-full object-contain"/>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                    {isLoading ? <Loader2 className="animate-spin" /> : null}
                    <span className="ml-2">Scan Now</span>
                  </Button>
                  <Button type="button" variant="outline" onClick={handleGenerateSample} disabled={isLoading} className="w-full sm:w-auto">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Sample
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="sticky top-20">
          <Card className="min-h-[400px]">
            <CardHeader>
              <CardTitle className="font-headline">Scan Result</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground pt-16">
                  <Loader2 className="h-10 w-10 animate-spin text-accent mb-4" />
                  <p className="text-lg font-medium">Analyzing...</p>
                  <p>This may take a moment.</p>
                </div>
              )}
              {!isLoading && !result && (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-16">
                    <FileSearchIcon className="h-12 w-12 mb-4" />
                    <p className="text-lg font-medium">Awaiting analysis</p>
                    <p>Results will be displayed here once a scan is complete.</p>
                  </div>
              )}
              {result && (
                <div className="space-y-4 animate-in fade-in-50">
                   <div className="flex items-center justify-between">
                     <h3 className="text-xl font-semibold">Summary</h3>
                     <Badge className={severityStyles[result.severity]}>
                       {result.severity.replace('-', ' ')}
                     </Badge>
                   </div>
                   <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {getIconForType(result.type)}
                    <span>{result.type} Analysis</span>
                    <span className="text-border">|</span>
                    <span>{new Date(result.timestamp).toLocaleString()}</span>
                   </div>

                  <p className="text-foreground/90 bg-secondary/50 p-4 rounded-md border">{result.summary}</p>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Raw Findings</h4>
                    <p className="text-sm text-muted-foreground p-4 rounded-md border font-mono bg-muted/30 break-words">{result.rawFindings}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function FileSearchIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" />
      <path d="M14 2v6h6" />
      <path d="m3 12.5 1.7-1.7a2.8 2.8 0 0 1 4 0l1.6 1.6" />
      <path d="m2 17 3-3" />
      <circle cx="12" cy="16" r="3" />
    </svg>
  )
}
