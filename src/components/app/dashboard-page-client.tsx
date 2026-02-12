'use client';

import { useMemo, useState, useEffect } from 'react';
import { useLogStore } from '@/lib/store';
import { exportToCsv, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ContentType, Severity } from '@/lib/types';
import { DashboardTable } from './dashboard-table';
import { Download, Filter, Trash2, History, Database, Search, LayoutGrid, List } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import dynamic from 'next/dynamic';
const Hyperspeed = dynamic(() => import('./hyperspeed'), { ssr: false });
import { hyperspeedPresets } from './hyperspeed-presets';
import SpotlightCard from './spotlight-card';

export default function DashboardPageClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { logs, clearLogs } = useLogStore();
  const { toast } = useToast();
  const [severityFilter, setSeverityFilter] = useState<Severity | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<ContentType | 'ALL'>('ALL');

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const severityMatch = severityFilter === 'ALL' || log.severity === severityFilter;
      const typeMatch = typeFilter === 'ALL' || log.type === typeFilter;
      return severityMatch && typeMatch;
    });
  }, [logs, severityFilter, typeFilter]);

  const handleExport = () => {
    if (filteredLogs.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: 'No data streams available for export.',
      });
      return;
    }
    exportToCsv(`invisify-forensics-${new Date().toISOString()}.csv`, filteredLogs);
    toast({
      title: 'Export Complete',
      description: 'Forensic data exported successfully.',
    });
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <div className="flex items-center gap-2 text-blue-400 mb-2 font-mono text-xs tracking-widest uppercase">
              <Database size={14} />
              <span>Archive System // v1.0</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-b from-white to-neutral-500 bg-clip-text text-transparent">
              Scan History
            </h1>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} className="rounded-full bg-white/5 border-white/10 hover:bg-white/10">
              <Download size={14} className="mr-2" /> Export Logs
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20">
                  <Trash2 size={14} className="mr-2" /> WIPE ARCHIVE
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-neutral-900 border-white/10 text-white rounded-3xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Authorize Archive Deletion?</AlertDialogTitle>
                  <AlertDialogDescription className="text-neutral-400">
                    This will permanently scrub all stored scan metrics. This action is irreversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-2xl">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearLogs} className="bg-rose-500 hover:bg-rose-600 text-white rounded-2xl">Confirm Wipe</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Integrated Command Center Panel */}
        <SpotlightCard className="p-0 border-white/5 overflow-hidden bg-neutral-900/40 backdrop-blur-2xl">
          <div className="flex flex-col">
            {/* Filter Bar */}
            <div className="p-6 border-b border-white/5 bg-white/5 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-neutral-500" />
                <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">Filters</span>
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                <Select
                  value={severityFilter}
                  onValueChange={(v) => setSeverityFilter(v as Severity | 'ALL')}
                >
                  <SelectTrigger className="w-[160px] bg-black/40 border-white/10 rounded-xl h-10 text-xs font-medium">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-white/10 text-white">
                    <SelectItem value="ALL">All Severities</SelectItem>
                    <SelectItem value="CLEAN">Clean Only</SelectItem>
                    <SelectItem value="SUSPICIOUS">Suspicious Only</SelectItem>
                    <SelectItem value="HIGH-RISK">High-Risk Only</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={typeFilter}
                  onValueChange={(v) => setTypeFilter(v as ContentType | 'ALL')}
                >
                  <SelectTrigger className="w-[160px] bg-black/40 border-white/10 rounded-xl h-10 text-xs font-medium">
                    <SelectValue placeholder="Content Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-white/10 text-white">
                    <SelectItem value="ALL">All Modalities</SelectItem>
                    <SelectItem value="Text">Text Streams</SelectItem>
                    <SelectItem value="Emoji">Emoji Payloads</SelectItem>
                    <SelectItem value="Image">Image Buffers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="ml-auto flex items-center gap-3">
                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-neutral-500">
                  RECORDS: {logs.length}
                </div>
                <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-mono text-blue-400">
                  FILTERED: {filteredLogs.length}
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[500px] p-2">
              {filteredLogs.length === 0 ? (
                <div className="h-[500px] flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-700">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-600">
                    <History size={32} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-neutral-400 font-mono tracking-tighter">ARCHIVE_EMPTY</h3>
                    <p className="text-[10px] text-neutral-600 uppercase tracking-tight">No historical records match current query params.</p>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <DashboardTable logs={filteredLogs} />
                </div>
              )}
            </div>

            {/* Terminal Footer */}
            <div className="p-6 border-t border-white/5 bg-black/20 flex items-center justify-between">
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Database Linked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Local Session Storage</span>
                </div>
              </div>
              <div className="text-[10px] font-mono text-neutral-600 flex items-center gap-4">
                <span>ARCHIVE_INTEGRITY: 100%</span>
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">ST_DASH // 097</span>
              </div>
            </div>
          </div>
        </SpotlightCard>
      </div>
    </div>
  );
}
