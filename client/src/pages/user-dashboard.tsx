import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, DollarSign, FileText, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserDashboard() {
  const [, setLocation] = useLocation();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats/user"],
  });

  const todaySales = stats?.todaySales ?? 0;
  const last7DaysSales = stats?.last7DaysSales ?? [];
  const totalLast7Days = last7DaysSales.reduce((sum: number, day: any) => sum + parseFloat(day.total || 0), 0);

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Overview of your sales and quick actions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    <div className="text-3xl font-bold" data-testid="text-today-sales">₹{todaySales.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Total revenue today</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last 7 Days</CardTitle>
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <>
                    <div className="text-3xl font-bold" data-testid="text-week-sales">₹{totalLast7Days.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Total revenue this week</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quick Action</CardTitle>
                <FileText className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-4">
                <Button
                  className="w-full"
                  onClick={() => setLocation("/invoice")}
                  data-testid="button-create-invoice"
                >
                  Create New Invoice
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {!isLoading && last7DaysSales.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Sales Trend (Last 7 Days)</CardTitle>
                <CardDescription>Daily sales breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {last7DaysSales.map((day: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                      <span className="text-sm font-medium">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      <span className="text-sm font-bold">₹{parseFloat(day.total || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
