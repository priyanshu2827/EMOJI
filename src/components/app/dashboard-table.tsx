'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ScanResult } from '@/lib/types';
import { suggestWhitelist } from '@/lib/actions';
import { useLogStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Loader2, History, ChevronRight, FileText, Info, ShieldCheck, ShieldAlert, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FindingsTable } from './findings-table';

type DashboardTableProps = {
  logs: ScanResult[];
};

const severityStyles = {
  CLEAN: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  SUSPICIOUS: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'HIGH-RISK': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

const severityIcons = {
  CLEAN: <ShieldCheck className="h-4 w-4 text-emerald-500" />,
  SUSPICIOUS: <ShieldAlert className="h-4 w-4 text-amber-500" />,
  'HIGH-RISK': <ShieldAlert className="h-4 w-4 text-rose-500" />,
};

export function DashboardTable({ logs }: DashboardTableProps) {
  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center text-neutral-600 p-8 space-y-4">
        <History className="h-16 w-16 opacity-20" />
        <div className="space-y-1">
          <h3 className="text-lg font-bold font-mono uppercase tracking-tighter">no_records_found</h3>
          <p className="text-xs uppercase tracking-tight">System archive initialized but currently empty.</p>
        </div>
      </div>
    )
  }
  return (
    <ScrollArea className="h-[calc(100vh-22rem)]">
      <Table>
        <TableHeader className="sticky top-0 bg-neutral-900/80 backdrop-blur-md z-10">
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead className="w-[200px] font-mono text-[10px] uppercase tracking-widest text-neutral-500">Timestamp</TableHead>
            <TableHead className="w-[120px] font-mono text-[10px] uppercase tracking-widest text-neutral-500">Modality</TableHead>
            <TableHead className="w-[160px] font-mono text-[10px] uppercase tracking-widest text-neutral-500">Classification</TableHead>
            <TableHead className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Diagnostic Summary</TableHead>
            <TableHead className="text-right w-[100px] font-mono text-[10px] uppercase tracking-widest text-neutral-500">Ref</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <DetailsDialog key={log.id} log={log} />
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}

function DetailsDialog({ log }: { log: ScanResult }) {
  const { toast } = useToast();
  const updateLog = useLogStore(state => state.updateLog);
  const [isWhitelistLoading, setIsWhitelistLoading] = useState(false);
  const [whitelistSuggestions, setWhitelistSuggestions] = useState<string[]>([]);

  const handleSuggestWhitelist = async () => {
    setIsWhitelistLoading(true);
    setWhitelistSuggestions([]);
    const result = await suggestWhitelist(log.rawFindings);
    if ('error' in result) {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    } else {
      setWhitelistSuggestions(result.suggestedRules);
    }
    setIsWhitelistLoading(false);
  }

  const handleFalsePositiveToggle = () => {
    updateLog(log.id, { isFalsePositive: !log.isFalsePositive });
    toast({
      title: `Metric Updated`,
      description: `Scan marked as ${!log.isFalsePositive ? 'False Positive' : 'Active Threat'}.`
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <TableRow className="cursor-pointer border-white/5 hover:bg-white/5 transition-colors group">
          <TableCell className="font-mono text-[11px] text-neutral-400">
            {new Date(log.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', month: 'short', day: '2-digit' })}
          </TableCell>
          <TableCell>
            <Badge variant="outline" className="font-mono text-[10px] uppercase bg-white/5 border-white/10 text-neutral-500">
              {log.type}
            </Badge>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Badge className={cn("font-mono text-[10px] uppercase tracking-tighter px-2", severityStyles[log.severity])}>
                {log.severity.replace('-', '_')}
              </Badge>
              {log.isFalsePositive && <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[9px] uppercase font-mono px-1.5 py-0">FP</Badge>}
            </div>
          </TableCell>
          <TableCell className="max-w-md truncate text-xs text-neutral-400 font-medium">{log.summary}</TableCell>
          <TableCell className="text-right">
            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight size={14} className="text-emerald-500" />
            </div>
          </TableCell>
        </TableRow>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl bg-neutral-900/95 backdrop-blur-3xl border-white/10 text-white rounded-[2rem] overflow-hidden p-0 gap-0 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
        <div className="p-8 pb-4">
          <DialogHeader>
            <div className="flex items-center gap-2 text-emerald-500 font-mono text-[10px] uppercase tracking-[0.2em] mb-2">
              <History size={12} />
              <span>Forensic Archive // {log.id.slice(0, 8)}</span>
            </div>
            <DialogTitle className="text-3xl font-bold tracking-tight bg-gradient-to-b from-white to-neutral-500 bg-clip-text text-transparent">
              Scan Report
            </DialogTitle>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[70vh]">
          <div className="px-8 pb-8 space-y-8">
            {/* Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <h4 className="font-mono text-[10px] uppercase text-neutral-500 mb-1 flex items-center gap-1.5">
                  <FileText size={10} /> Modality
                </h4>
                <p className="text-sm font-bold">{log.type}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <h4 className="font-mono text-[10px] uppercase text-neutral-500 mb-1 flex items-center gap-1.5">
                  <ShieldAlert size={10} /> Severity
                </h4>
                <Badge className={cn("font-mono text-[10px] uppercase tracking-tighter", severityStyles[log.severity])}>
                  {log.severity}
                </Badge>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <h4 className="font-mono text-[10px] uppercase text-neutral-500 mb-1 flex items-center gap-1.5">
                  <Cpu size={10} /> Status
                </h4>
                <p className="text-[11px] font-mono text-neutral-300 uppercase leading-none">
                  {log.isFalsePositive ? 'false_pos' : 'verified_threat'}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <h4 className="font-mono text-[10px] uppercase text-neutral-500 mb-1 flex items-center gap-1.5">
                  <History size={10} /> Time
                </h4>
                <p className="text-[11px] font-mono text-neutral-300 uppercase leading-none">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-mono text-[10px] uppercase text-neutral-500 tracking-widest flex items-center gap-2">
                <Info size={12} /> Diagnostic Summary
              </h4>
              <p className="text-sm text-neutral-300 leading-relaxed p-6 bg-white/5 border border-white/5 rounded-3xl font-medium italic">
                "{log.summary}"
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-mono text-[10px] uppercase text-neutral-500 tracking-widest flex items-center gap-2">
                <Cpu size={12} /> Heuristic Telemetry
              </h4>
              <div className="bg-black/40 border border-white/5 rounded-3xl overflow-hidden p-1">
                <FindingsTable data={log.rawFindings} />
              </div>
            </div>

            {log.severity !== 'CLEAN' && (
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-mono text-[10px] uppercase text-neutral-500 tracking-widest">Rule Generation</h4>
                  <Button onClick={handleSuggestWhitelist} disabled={isWhitelistLoading} size="sm" className="rounded-full bg-blue-500 hover:bg-blue-600 text-white font-mono text-[10px] h-7 px-4">
                    {isWhitelistLoading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
                    RUN AI_OPTIMIZER
                  </Button>
                </div>
                {whitelistSuggestions.length > 0 && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                    <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-tight">Suggested Forensic Exceptions:</p>
                    <div className="grid gap-2">
                      {whitelistSuggestions.map((rule, i) => (
                        <div key={i} className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl font-mono text-[10px] text-blue-400">
                          RULE_INC :: {rule}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-6 border-t border-white/5 bg-black/40 flex justify-between items-center">
          {log.severity !== 'CLEAN' && (
            <Button variant="ghost" onClick={handleFalsePositiveToggle} className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-full font-mono text-[10px] h-8">
              {log.isFalsePositive ? "UNMARK_FP" : "MARK_AS_FP"}
            </Button>
          )}
          <div className="flex-1" />
          <Button onClick={() => document.querySelector('[data-state="open"] button[aria-label="Close"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))} className="bg-white text-black hover:bg-neutral-200 rounded-full px-8 h-10 font-bold text-xs">
            CLOSE REPORT
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
