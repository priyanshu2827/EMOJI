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
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ScanResult } from '@/lib/types';
import { suggestWhitelist } from '@/lib/actions';
import { useLogStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldQuestion } from 'lucide-react';

type DashboardTableProps = {
  logs: ScanResult[];
};

const severityStyles = {
  CLEAN: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800',
  SUSPICIOUS: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800',
  'HIGH-RISK': 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800',
};

export function DashboardTable({ logs }: DashboardTableProps) {
  if (logs.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
            <ShieldQuestion className="h-16 w-16 mb-4" />
            <h3 className="text-xl font-semibold">No Logs Found</h3>
            <p>Your scan history is empty, or no logs match your current filters.</p>
        </div>
    )
  }
  return (
    <ScrollArea className="h-[calc(100vh-22rem)]">
      <Table>
        <TableHeader className="sticky top-0 bg-card">
          <TableRow>
            <TableHead className="w-[200px]">Timestamp</TableHead>
            <TableHead className="w-[120px]">Type</TableHead>
            <TableHead className="w-[150px]">Severity</TableHead>
            <TableHead>Summary</TableHead>
            <TableHead className="text-right w-[120px]">Actions</TableHead>
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
            title: `Log marked as ${!log.isFalsePositive ? 'False Positive' : 'Active Threat'}`,
        })
    }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <TableRow className="cursor-pointer">
          <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
          <TableCell>{log.type}</TableCell>
          <TableCell>
            <Badge className={severityStyles[log.severity]}>
              {log.severity.replace('-', ' ')}
            </Badge>
            {log.isFalsePositive && <Badge variant="secondary" className="ml-2 mt-1">False Positive</Badge>}
          </TableCell>
          <TableCell className="max-w-sm truncate">{log.summary}</TableCell>
          <TableCell className="text-right">
            <Button variant="outline" size="sm">
              View
            </Button>
          </TableCell>
        </TableRow>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Scan Details</DialogTitle>
          <DialogDescription>
             Detailed report for scan performed at {new Date(log.timestamp).toLocaleString()}.
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 pr-6">
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <h4 className="font-semibold text-sm">Type</h4>
                        <p className="text-muted-foreground text-sm">{log.type}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold text-sm">Severity</h4>
                        <Badge className={severityStyles[log.severity]}>{log.severity.replace('-', ' ')}</Badge>
                    </div>
                     <div>
                        <h4 className="font-semibold text-sm">Status</h4>
                        <p className="text-muted-foreground text-sm">{log.isFalsePositive ? 'Marked as False Positive' : 'Active'}</p>
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold text-sm">Summary</h4>
                    <p className="text-muted-foreground text-sm p-3 bg-secondary/30 rounded-md border">{log.summary}</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-sm">Raw Findings</h4>
                    <p className="text-muted-foreground text-sm p-3 bg-secondary/30 rounded-md border font-mono text-xs break-words">{log.rawFindings}</p>
                </div>
                
                {log.severity !== 'CLEAN' && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">AI-Powered Whitelist Suggestions</h4>
                     <Button onClick={handleSuggestWhitelist} disabled={isWhitelistLoading} size="sm">
                        {isWhitelistLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Generate Suggestions
                    </Button>
                    {whitelistSuggestions.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <p className="text-sm text-muted-foreground">Based on the findings, here are some potential rules to reduce future false positives:</p>
                            <ul className="list-disc pl-5 space-y-1 text-sm font-mono bg-secondary/30 p-3 rounded-md border">
                                {whitelistSuggestions.map((rule, i) => <li key={i}>{rule}</li>)}
                            </ul>
                        </div>
                    )}
                  </div>
                )}
            </div>
        </ScrollArea>
        <Separator />
        <DialogFooter>
            {log.severity !== 'CLEAN' && (
                <Button variant="outline" onClick={handleFalsePositiveToggle}>
                    {log.isFalsePositive ? "Unmark as False Positive" : "Mark as False Positive"}
                </Button>
            )}
            <DialogTrigger asChild>
                <Button>Close</Button>
            </DialogTrigger>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
