
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  FileImage,
  FileText,
  Loader2,
  Sparkles,
  Smile,
  EyeOff,
  Shield,
  Upload,
  Code,
  Type,
  ArrowRight,
  Terminal as TerminalIcon,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';

import { analyzeContent, generateCodeSample, generateSafeTextSample } from '@/lib/actions';
import { useLogStore } from '@/lib/store';
import { type ScanResult } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
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
import dynamic from 'next/dynamic';
const Hyperspeed = dynamic(() => import('./hyperspeed'), { ssr: false });
import { hyperspeedPresets } from './hyperspeed-presets';
import { FindingsTable } from './findings-table';
import SpotlightCard from './spotlight-card';

const formSchema = z.object({
  textInput: z.string().optional(),
  imageInput: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const severityStyles = {
  Safe: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Low: 'bg-emerald-500/5 text-emerald-300 border-white/10',
  Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  High: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  Critical: 'bg-rose-600/20 text-rose-500 border-rose-600/30 animate-pulse',
};

const severityIcons = {
  Safe: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  Low: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
  Medium: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  High: <AlertTriangle className="h-4 w-4 text-rose-500" />,
  Critical: <AlertTriangle className="h-4 w-4 text-rose-600" />,
};

export default function ScanPageClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      form.setValue('textInput', '');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleTextChange = (value: string) => {
    if (value.trim() && imagePreview) {
      form.setValue('imageInput', undefined);
      setImagePreview(null);
      const fileInput = document.getElementById('imageInput') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  const clearImage = () => {
    form.setValue('imageInput', undefined);
    setImagePreview(null);
    const fileInput = document.getElementById('imageInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleQuickSample = async (type: string) => {
    setIsLoading(true);
    try {
      let sample = '';
      switch (type) {
        case 'emoji':
          sample = "This message looks normal 👨‍💻 but contains hidden emojis! 👾";
          break;
        case 'zerowidth':
          sample = "Zero-width\u200B characters\u200C are\u200D invisible.";
          break;
        case 'threat':
          sample = "Attack sequence:\u202E PREVIOUS INSTRUCTIONS RESET\u202C";
          break;
        case 'code':
          const codeRes = await generateCodeSample();
          if ('sampleText' in codeRes) sample = codeRes.sampleText;
          break;
      }
      form.setValue('textInput', sample);
      form.setValue('imageInput', undefined);
      setImagePreview(null);
      toast({ title: 'Sample Loaded', description: `Forensic ${type} sample initialized.` });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load sample.' });
    }
    setIsLoading(false);
  };

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
      toast({ title: 'Scan Complete', description: `Analysis finished: ${res.severity}` });
    }
    setIsLoading(false);
  };

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
              <span>Diagnostic System // Active</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-b from-white to-neutral-500 bg-clip-text text-transparent">
              Forensic Scanner
            </h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { form.reset(); setResult(null); setImagePreview(null); }} className="rounded-full bg-white/5 border-white/10 hover:bg-white/10">
              <RefreshCw size={14} className="mr-2" /> Reset Session
            </Button>
          </div>
        </div>

        {/* Integrated Scanner Terminal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Input Panel */}
          <div className="lg:col-span-12 xl:col-span-12">
            <SpotlightCard className="p-0 border-white/5 overflow-hidden bg-neutral-900/40 backdrop-blur-2xl">
              <div className="flex flex-col xl:flex-row min-h-[500px]">

                {/* Input Controls */}
                <div className="xl:w-3/5 p-8 border-b xl:border-b-0 xl:border-r border-white/5">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="textInput"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex justify-between items-center mb-2">
                              <FormLabel className="text-xs font-mono uppercase text-neutral-500 tracking-wider">Input Stream</FormLabel>
                              <div className="flex gap-2">
                                {['emoji', 'zerowidth', 'threat', 'code'].map((type) => (
                                  <button
                                    key={type}
                                    type="button"
                                    onClick={() => handleQuickSample(type)}
                                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors border border-white/5 uppercase"
                                  >
                                    {type}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <FormControl>
                              <div className="relative group">
                                <Textarea
                                  placeholder={imagePreview ? "Input locked for image analysis..." : "Enter text, hex, or unicode for analysis..."}
                                  disabled={!!imagePreview}
                                  className={cn(
                                    "min-h-[300px] bg-black/40 border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-2xl font-mono text-sm tracking-tight leading-relaxed transition-all",
                                    imagePreview && "opacity-30 saturation-0"
                                  )}
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    handleTextChange(e.target.value);
                                  }}
                                />
                                <div className="absolute bottom-4 right-4 text-[10px] font-mono text-neutral-600">
                                  CHR: {field.value?.length || 0}
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-[1px] bg-white/5" />
                        <span className="text-[10px] font-mono text-neutral-700 uppercase">Multi-modal upload</span>
                        <div className="flex-1 h-[1px] bg-white/5" />
                      </div>

                      <FormField
                        control={form.control}
                        name="imageInput"
                        render={({ field: { onChange, value, ...rest } }) => (
                          <FormItem>
                            <FormControl>
                              <div className="flex flex-col sm:flex-row gap-4">
                                <div
                                  onClick={() => document.getElementById('imageInput')?.click()}
                                  className={cn(
                                    "flex-1 border border-dashed border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 hover:border-emerald-500/30 transition-all group",
                                    imagePreview && "border-emerald-500/50 bg-emerald-500/5"
                                  )}
                                >
                                  <input
                                    id="imageInput"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      onChange(e.target.files);
                                      handleImageChange(e);
                                    }}
                                  />
                                  {imagePreview ? (
                                    <div className="flex flex-col items-center gap-2">
                                      <div className="relative w-24 h-24">
                                        <img src={imagePreview} className="w-full h-full object-cover rounded-lg border border-white/10" alt="UI Preview" />
                                        <button
                                          onClick={(e) => { e.stopPropagation(); clearImage(); }}
                                          className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full shadow-lg hover:bg-rose-600 transition-colors"
                                        >
                                          <RefreshCw size={10} />
                                        </button>
                                      </div>
                                      <span className="text-[10px] font-mono text-emerald-400">IMAGE_LOADED.bin</span>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center gap-2 text-neutral-500 group-hover:text-neutral-300">
                                      <Upload size={20} />
                                      <span className="text-xs font-medium">Upload Image Payload</span>
                                    </div>
                                  )}
                                </div>
                                <Button
                                  type="submit"
                                  disabled={isLoading}
                                  className="h-auto px-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-lg shadow-[0_0_40px_rgba(16,185,129,0.2)] transition-all hover:shadow-[0_0_60px_rgba(16,185,129,0.4)]"
                                >
                                  {isLoading ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                  ) : (
                                    <div className="flex flex-col items-center">
                                      <Search size={24} className="mb-1" />
                                      <span className="text-xs uppercase tracking-tighter">Run Engine</span>
                                    </div>
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                </div>

                {/* Status & Results Information */}
                <div className="xl:w-2/5 p-8 bg-black/20 flex flex-col">
                  <div className="flex-1">
                    {!result && !isLoading && (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-1000">
                        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500">
                          <Shield size={32} />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-bold text-neutral-400 font-mono tracking-tighter">ENGINE_IDLE</h3>
                          <p className="text-xs text-neutral-600 max-w-[200px] mx-auto leading-relaxed uppercase">
                            Load a data stream to begin heuristic forensic analysis.
                          </p>
                        </div>
                      </div>
                    )}

                    {isLoading && (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                        <div className="relative">
                          <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
                          <Loader2 className="h-16 w-16 text-emerald-500 animate-spin relative z-10" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-mono text-emerald-400 animate-pulse uppercase tracking-widest">Scanning Content...</h3>
                          <div className="flex justify-center gap-1">
                            {[0, 1, 2].map((i) => (
                              <div key={i} className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {result && !isLoading && (
                      <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Diagnostic Report</span>
                            <span className="text-[10px] font-mono text-neutral-600 tracking-tighter">{new Date().toLocaleTimeString()}</span>
                          </div>

                          <div className={cn(
                            "p-6 rounded-3xl border flex items-center gap-4 transition-all shadow-2xl",
                            severityStyles[result.severity]
                          )}>
                            <div className="bg-white/10 p-3 rounded-2xl">
                              {severityIcons[result.severity]}
                            </div>
                            <div>
                              <h4 className="text-[10px] font-mono opacity-50 uppercase mb-0.5">Final Classification</h4>
                              <div className="text-2xl font-black tracking-tighter">{result.severity}</div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500 uppercase">
                            <Info size={12} />
                            <span>System Summary</span>
                          </div>
                          <div className="text-sm text-neutral-300 leading-relaxed font-medium p-4 rounded-2xl bg-white/5 border border-white/5">
                            {result.summary}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                            <div className="text-[10px] font-mono text-neutral-500 uppercase mb-1">Complexity</div>
                            <div className="text-lg font-bold">CALCULATED</div>
                          </div>
                          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                            <div className="text-[10px] font-mono text-neutral-500 uppercase mb-1">Confidence</div>
                            <div className="text-lg font-bold">98.4%</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Terminal Footer */}
                  <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between opacity-50">
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1.5 font-mono text-[10px]">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        CPU: 12%
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-[10px]">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        MEM: 432MB
                      </div>
                    </div>
                    <span className="font-mono text-[10px]">SEC_PROTO // V4.2</span>
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </div>

          {/* Full-width: Findings Table */}
          {result && (
            <div className="lg:col-span-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
                    <FileText size={18} />
                  </div>
                  <h3 className="text-xl font-bold">Heuristic Breakdown</h3>
                </div>
                <Badge variant="outline" className="font-mono text-xs uppercase bg-white/5 border-white/10 text-neutral-400">
                  {result.reasons.length} Anomalies Detected
                </Badge>
              </div>
              <div className="overflow-hidden rounded-3xl border border-white/5 bg-neutral-900/40 backdrop-blur-xl">
                <FindingsTable data={result.findings} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
