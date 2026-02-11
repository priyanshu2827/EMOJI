import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    XCircle,
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
        return <span className="text-muted-foreground italic text-xs">Empty</span>;
    }

    if (typeof value === 'boolean') {
        return (
            <Badge
                variant={value ? "destructive" : "outline"}
                className={cn(
                    "gap-1 pl-1 pr-2 py-0.5 font-normal tracking-wide",
                    value
                        ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"
                        : "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20"
                )}
            >
                {value ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                {value ? 'Detected' : 'Clean'}
            </Badge>
        );
    }

    if (typeof value === 'string' || typeof value === 'number') {
        if (typeof value === 'string' && (value.startsWith('http') || value.startsWith('https'))) {
            return (
                <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 hover:underline break-all inline-flex items-center gap-1"
                >
                    <FileText className="w-3 h-3" />
                    {value}
                </a>
            );
        }
        return <span className="break-all font-mono text-xs text-foreground/90">{value}</span>;
    }

    if (Array.isArray(value)) {
        if (value.length === 0) return <span className="text-muted-foreground text-xs">[]</span>;
        return (
            <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 p-0 hover:bg-transparent text-muted-foreground hover:text-foreground">
                        {isOpen ? <ChevronDown className="w-3 h-3 mr-1" /> : <ChevronRight className="w-3 h-3 mr-1" />}
                        <span className="text-xs font-medium flex items-center gap-1">
                            <List className="w-3 h-3" />
                            Array ({value.length} items)
                        </span>
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 mt-2 space-y-2 border-l border-border/40">
                    {value.map((item, index) => (
                        <div key={index} className="text-sm">
                            <RenderValue value={item} depth={depth + 1} />
                        </div>
                    ))}
                </CollapsibleContent>
            </Collapsible>
        );
    }

    if (typeof value === 'object') {
        if (Object.keys(value).length === 0) return <span className="text-muted-foreground text-xs">{"{}"}</span>;

        // For root level or if it's not nested too deep, show as full width table or cards
        // but here we are inside a cell, so better use collapsible
        return (
            <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 p-0 hover:bg-transparent text-muted-foreground hover:text-foreground">
                        {isOpen ? <ChevronDown className="w-3 h-3 mr-1" /> : <ChevronRight className="w-3 h-3 mr-1" />}
                        <span className="text-xs font-medium flex items-center gap-1">
                            <Binary className="w-3 h-3" />
                            Object ({Object.keys(value).length} keys)
                        </span>
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 text-sm bg-muted/10 rounded-md border border-border/20 overflow-hidden">
                    <Table>
                        <TableBody>
                            {Object.entries(value).map(([k, v]) => (
                                <TableRow key={k} className="hover:bg-muted/10 border-b border-border/30 last:border-0">
                                    <TableCell className="py-2 px-3 align-top font-medium text-muted-foreground text-xs w-[120px]">
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
            <div className="p-4 border rounded-md bg-muted/20 font-mono text-sm">
                {String(parsedData)}
            </div>
        )
    }

    // Identify top-level sections for a cleaner look if possible
    const entries = Object.entries(parsedData);

    return (
        <div className={cn("grid gap-4", className)}>
            {entries.map(([key, value]) => {
                const isComplex = typeof value === 'object' && value !== null;
                return (
                    <Card key={key} className="bg-card/40 backdrop-blur-sm border-accent/10 shadow-sm overflow-hidden transition-all hover:bg-card/60 hover:shadow-md hover:border-accent/20">
                        <CardHeader className="py-3 px-4 bg-muted/5 border-b border-border/30 flex flex-row items-center gap-2">
                            <div className="p-1.5 rounded-md bg-accent/10 text-accent">
                                {isComplex ? <Binary className="w-4 h-4" /> : <Type className="w-4 h-4" />}
                            </div>
                            <CardTitle className="text-sm font-medium tracking-wide text-foreground/90 uppercase">
                                {formatKey(key)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isComplex && !Array.isArray(value) ? (
                                <Table>
                                    <TableBody>
                                        {Object.entries(value).map(([k, v]) => (
                                            <TableRow key={k} className="hover:bg-muted/5 border-b border-border/30 last:border-0">
                                                <TableCell className="w-[180px] py-3 px-4 font-medium text-xs text-muted-foreground bg-muted/5">
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
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    );
}
