import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Loading() {
  return (
    <div className="container mx-auto p-4 md:p-8 flex-1">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h2>
          <p className="text-muted-foreground">Loading scan history...</p>
        </div>
        <Skeleton className="h-10 w-48" />
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]"><Skeleton className="h-5 w-24" /></TableHead>
              <TableHead className="w-[100px]"><Skeleton className="h-5 w-16" /></TableHead>
              <TableHead><Skeleton className="h-5 w-20" /></TableHead>
              <TableHead><Skeleton className="h-5 w-48" /></TableHead>
              <TableHead className="text-right w-[120px]"><Skeleton className="h-5 w-16 ml-auto" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-full max-w-sm" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
