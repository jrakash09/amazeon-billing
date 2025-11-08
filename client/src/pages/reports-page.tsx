import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Download, FileSpreadsheet, TrendingUp, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsPage() {
  const { toast } = useToast();

  const { data: reportData, isLoading } = useQuery({
    queryKey: ["/api/reports/sales"],
  });

  const downloadMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("GET", "/api/reports/sales/download");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "Report downloaded!",
        description: "The sales report has been downloaded to your device.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Download failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const totalSales = reportData?.totalSales || 0;
  const b2cSales = reportData?.b2cSales || 0;
  const b2bSales = reportData?.b2bSales || 0;
  const productSales = reportData?.productSales || [];
  const categorySales = reportData?.categorySales || [];

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Sales Reports</h1>
              <p className="text-muted-foreground mt-1">Comprehensive sales analytics and insights</p>
            </div>
            <Button
              onClick={() => downloadMutation.mutate()}
              disabled={downloadMutation.isPending}
              data-testid="button-download-report"
            >
              <Download className="h-4 w-4 mr-2" />
              {downloadMutation.isPending ? "Downloading..." : "Download Excel Report"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <>
                    <div className="text-3xl font-bold" data-testid="text-total-sales">₹{totalSales.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground mt-1">All time revenue</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">B2C Sales</CardTitle>
                <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <>
                    <div className="text-3xl font-bold" data-testid="text-b2c-sales">₹{b2cSales.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {totalSales > 0 ? ((b2cSales / totalSales) * 100).toFixed(1) : 0}% of total
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">B2B Sales</CardTitle>
                <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <>
                    <div className="text-3xl font-bold" data-testid="text-b2b-sales">₹{b2bSales.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {totalSales > 0 ? ((b2bSales / totalSales) * 100).toFixed(1) : 0}% of total
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Product-wise Sales</CardTitle>
                <CardDescription>Revenue breakdown by product</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : productSales.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No product sales data</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {productSales.map((product: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                        <div>
                          <p className="text-sm font-medium">{product.productName}</p>
                          <p className="text-xs text-muted-foreground">
                            {product.quantity} units sold
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">₹{parseFloat(product.totalSales).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            {totalSales > 0 ? ((parseFloat(product.totalSales) / totalSales) * 100).toFixed(1) : 0}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category-wise Sales</CardTitle>
                <CardDescription>Revenue breakdown by category</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : categorySales.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No category sales data</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {categorySales.map((category: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                        <div>
                          <p className="text-sm font-medium">{category.category}</p>
                          <p className="text-xs text-muted-foreground">
                            {category.productCount} product(s)
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">₹{parseFloat(category.totalSales).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            {totalSales > 0 ? ((parseFloat(category.totalSales) / totalSales) * 100).toFixed(1) : 0}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
