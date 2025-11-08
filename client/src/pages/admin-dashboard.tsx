import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, TrendingUp, Calendar, Wallet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats/admin"],
  });

  const todaySales = stats?.todaySales ?? 0;
  const weekSales = stats?.weekSales ?? 0;
  const monthSales = stats?.monthSales ?? 0;
  const totalExpenses = stats?.totalExpenses ?? 0;

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Complete overview of your business performance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
                <DollarSign className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <>
                    <div className="text-3xl font-bold" data-testid="text-admin-today-sales">₹{todaySales.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Total revenue today</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Week's Sales</CardTitle>
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <>
                    <div className="text-3xl font-bold" data-testid="text-admin-week-sales">₹{weekSales.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Month's Sales</CardTitle>
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <>
                    <div className="text-3xl font-bold" data-testid="text-admin-month-sales">₹{monthSales.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Current month</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <Wallet className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <>
                    <div className="text-3xl font-bold" data-testid="text-admin-expenses">₹{totalExpenses.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground mt-1">This month</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Business performance at a glance</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                      <span className="text-sm font-medium">Net Profit (This Month)</span>
                      <span className="text-sm font-bold text-primary">₹{(monthSales - totalExpenses).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                      <span className="text-sm font-medium">B2C Invoices</span>
                      <span className="text-sm font-bold">{stats?.b2cCount ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                      <span className="text-sm font-medium">B2B Invoices</span>
                      <span className="text-sm font-bold">{stats?.b2bCount ?? 0}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : stats?.recentInvoices && stats.recentInvoices.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recentInvoices.slice(0, 5).map((invoice: any) => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                        <div>
                          <p className="text-sm font-medium">{invoice.invoiceNumber}</p>
                          <p className="text-xs text-muted-foreground">{invoice.customerName}</p>
                        </div>
                        <span className="text-sm font-bold">₹{parseFloat(invoice.totalAmount).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No recent invoices</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
