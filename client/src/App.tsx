import { Suspense, lazy } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

const AuthPage = lazy(() => import("@/pages/auth-page"));
const UserDashboard = lazy(() => import("@/pages/user-dashboard"));
const AdminDashboard = lazy(() => import("@/pages/admin-dashboard"));
const InvoicePage = lazy(() => import("@/pages/invoice-page"));
const B2BInvoicePage = lazy(() => import("@/pages/b2b-invoice-page"));
const InventoryPage = lazy(() => import("@/pages/inventory-page"));
const ExpensesPage = lazy(() => import("@/pages/expenses-page"));
const ReportsPage = lazy(() => import("@/pages/reports-page"));
const NotFound = lazy(() => import("@/pages/not-found"));

function DashboardRouter() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <Switch>
      <Route path="/">
        {isAdmin ? <AdminDashboard /> : <UserDashboard />}
      </Route>
      <Route path="/invoice" component={InvoicePage} />
      {isAdmin && <Route path="/b2b-invoice" component={B2BInvoicePage} />}
      {isAdmin && <Route path="/inventory" component={InventoryPage} />}
      {isAdmin && <Route path="/expenses" component={ExpensesPage} />}
      {isAdmin && <Route path="/reports" component={ReportsPage} />}
      <Route component={NotFound} />
    </Switch>
  );
}

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardRouter} />
      <ProtectedRoute path="/invoice" component={DashboardRouter} />
      <ProtectedRoute path="/b2b-invoice" component={DashboardRouter} />
      <ProtectedRoute path="/inventory" component={DashboardRouter} />
      <ProtectedRoute path="/expenses" component={DashboardRouter} />
      <ProtectedRoute path="/reports" component={DashboardRouter} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Suspense fallback={<AppFallback />}>
            <Router />
          </Suspense>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

function AppFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <span className="text-sm text-muted-foreground">Loading experience…</span>
    </div>
  );
}
