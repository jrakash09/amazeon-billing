import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import AuthPage from "@/pages/auth-page";
import UserDashboard from "@/pages/user-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import InvoicePage from "@/pages/invoice-page";
import B2BInvoicePage from "@/pages/b2b-invoice-page";
import InventoryPage from "@/pages/inventory-page";
import ExpensesPage from "@/pages/expenses-page";
import ReportsPage from "@/pages/reports-page";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/use-auth";

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
          <Router />
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
