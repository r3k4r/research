import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function NumbersSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="overflow-hidden border shadow-sm">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-3 w-16 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-6 w-20 bg-muted rounded animate-pulse"></div>
              </div>
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ChartSkeleton({ title }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="p-3 pb-1">
        <div className="h-5 w-24 bg-muted rounded animate-pulse"></div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="h-[220px] w-full bg-muted/30 rounded flex items-center justify-center animate-pulse">
          <p className="text-muted-foreground text-sm">Loading {title}...</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function TableSkeleton({ title }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="p-3 pb-1">
        <div className="h-5 w-32 bg-muted rounded animate-pulse"></div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/40 text-xs">
              <tr>
                <th className="text-left p-2 pl-3">
                  <div className="h-3 w-20 bg-muted rounded animate-pulse"></div>
                </th>
                <th className="text-right p-2">
                  <div className="h-3 w-16 bg-muted rounded animate-pulse ml-auto"></div>
                </th>
                <th className="text-right p-2 pr-3">
                  <div className="h-3 w-16 bg-muted rounded animate-pulse ml-auto"></div>
                </th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2 pl-3">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                  </td>
                  <td className="p-2 text-right">
                    <div className="h-4 w-10 bg-muted rounded animate-pulse ml-auto"></div>
                  </td>
                  <td className="p-2 pr-3 text-right">
                    <div className="h-4 w-16 bg-muted rounded animate-pulse ml-auto"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
