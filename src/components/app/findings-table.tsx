import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    ChevronDown,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
    FileText,
    List,
    Type,
    Binary
} from "lucide-react";

interface FindingsTableProps {
    data: any;
    className?: string;
}

const formatKey = (key: string) => {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
};

const RenderValue = ({ value, depth = 0 }: { value: any, depth?: number }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    if (value === null || value === undefined) {
        return <span className="text-neutral-600 italic text-[10px] font-mono">NULL</span>;
    }

    if (typeof value === 'boolean') {
        return (
            <Badge
                variant="outline"
                className={cn(
                    "gap-1 px-2 py-0.5 font-mono text-[10px] uppercase tracking-tighter",
                    value
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                )}
            >
                {value ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                {value ? 'DET_TRUE' : 'DET_FALSE'}
            </Badge>
        );
    }

    if (typeof value === 'string' || typeof value === 'number') {
        if (typeof value === 'string' && (value.startsWith('http'))) {
            return (
                <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 hover:underline break-all inline-flex items-center gap-1 font-mono text-[10px]"
                >
                    <FileText className="w-3 h-3" />
                    EXT_LINK
                </a>
            );
        }
        return <span className="break-all font-mono text-[11px] text-neutral-300 tracking-tight leading-relaxed">{value}</span>;
    }

    if (Array.isArray(value)) {
        if (value.length === 0) return <span className="text-neutral-700 font-mono text-[10px]">[]</span>;
        return (
            <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 p-0 hover:bg-transparent text-neutral-500 hover:text-neutral-300">
                        {isOpen ? <ChevronDown className="w-3 h-3 mr-1" /> : <ChevronRight className="w-3 h-3 mr-1" />}
                        <span className="text-[10px] font-mono flex items-center gap-1 uppercase">
                            <List className="w-3 h-3" />
                            ARRAY[{value.length}]
                        </span>
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 mt-2 space-y-1.5 border-l border-white/5">
                    {value.map((item, index) => (
                        <div key={index} className="text-xs">
                            <RenderValue value={item} depth={depth + 1} />
                        </div>
                    ))}
                </CollapsibleContent>
            </Collapsible>
        );
    }

    if (typeof value === 'object') {
        if (Object.keys(value).length === 0) return <span className="text-neutral-700 font-mono text-[10px]">{ }</span>;

        return (
            <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 p-0 hover:bg-transparent text-neutral-500 hover:text-neutral-300">
                        {isOpen ? <ChevronDown className="w-3 h-3 mr-1" /> : <ChevronRight className="w-3 h-3 mr-1" />}
                        <span className="text-[10px] font-mono flex items-center gap-1 uppercase">
                            <Binary className="w-3 h-3" />
                            OBJ_MAP
                        </span>
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 text-sm bg-black/40 rounded-xl border border-white/5 overflow-hidden">
                    <Table>
                        <TableBody>
                            {Object.entries(value).map(([k, v]) => (
                                <TableRow key={k} className="hover:bg-white/5 border-white/5 last:border-0">
                                    <TableCell className="py-2 px-3 align-top font-mono text-[10px] uppercase text-neutral-500 w-[120px]">
                                        {formatKey(k)}
                                    </TableCell>
                                    <TableCell className="py-2 px-3 align-top">
                                        <RenderValue value={v} depth={depth + 1} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CollapsibleContent>
            </Collapsible>
        );
    }

    return String(value);
};

export function FindingsTable({ data, className }: FindingsTableProps) {
    const parsedData = typeof data === 'string' ? JSON.parse(data) : data;

    if (typeof parsedData !== 'object' || parsedData === null) {
        return (
            <div className="p-4 border border-white/5 bg-black/40 rounded-2xl font-mono text-[11px] text-neutral-400">
                {String(parsedData)}
            </div>
        )
    }

    const entries = Object.entries(parsedData);

    return (
        <div className={cn("space-y-4", className)}>
            {entries.map(([key, value]) => {
                const isComplex = typeof value === 'object' && value !== null;
                return (
                    <div key={key} className="overflow-hidden rounded-2xl border border-white/5 bg-black/20 backdrop-blur-sm">
                        <div className="py-2 px-4 bg-white/5 border-b border-white/5 flex items-center gap-3">
                            <div className="text-neutral-500">
                                {isComplex ? <Binary size={12} /> : <Type size={12} />}
                            </div>
                            <span className="text-[10px] font-mono font-bold tracking-widest text-neutral-500 uppercase">
                                {formatKey(key)}
                            </span>
                        </div>
                        <div className="p-0">
                            {isComplex && !Array.isArray(value) ? (
                                <Table>
                                    <TableBody>
                                        {Object.entries(value).map(([k, v]) => (
                                            <TableRow key={k} className="hover:bg-white/5 border-white/5 last:border-0 border-b">
                                                <TableCell className="w-[200px] py-3 px-4 font-mono text-[10px] uppercase text-neutral-500 bg-white/5">
                                                    {formatKey(k)}
                                                </TableCell>
                                                <TableCell className="py-3 px-4">
                                                    <RenderValue value={v} />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="p-4">
                                    <RenderValue value={value} />
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    );
}
