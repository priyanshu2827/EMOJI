'use client';

import { useMemo, useState } from 'react';
import { useLogStore } from '@/lib/store';
import { exportToCsv } from '@/lib/utils';
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
import { Download, Filter, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Hyperspeed from './hyperspeed';
import { hyperspeedPresets } from './hyperspeed-presets';

export default function DashboardPageClient() {
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
        description: 'No logs to export.',
      });
      return;
    }
    exportToCsv(`invisify-logs-${new Date().toISOString()}.csv`, filteredLogs);
    toast({
      title: 'Export Successful',
      description: 'Your logs have been downloaded as a CSV file.',
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-8 flex-1 flex flex-col relative z-10">
       <div className="absolute inset-0 -z-10">
        <Hyperspeed effectOptions={hyperspeedPresets.one} />
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline text-white">Dashboard</h2>
          <p className="text-muted-foreground">Review and manage your scan history.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
           <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2" />
            Export CSV
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2" />
                Clear Logs
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all scan logs.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearLogs}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 p-4 bg-card/80 backdrop-blur-sm border rounded-lg">
        <Filter className="h-5 w-5 text-muted-foreground"/>
        <span className="font-medium mr-4">Filters:</span>
        <Select
          value={severityFilter}
          onValueChange={(v) => setSeverityFilter(v as Severity | 'ALL')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by severity..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Severities</SelectItem>
            <SelectItem value="CLEAN">Clean</SelectItem>
            <SelectItem value="SUSPICIOUS">Suspicious</SelectItem>
            <SelectItem value="HIGH-RISK">High-Risk</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v as ContentType | 'ALL')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="Text">Text</SelectItem>
            <SelectItem value="Emoji">Emoji</SelectItem>
            <SelectItem value="Image">Image</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="border rounded-lg flex-1 bg-card/80 backdrop-blur-sm">
        <DashboardTable logs={filteredLogs} />
      </div>
    </div>
  );
}
