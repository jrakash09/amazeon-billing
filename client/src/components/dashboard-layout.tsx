import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ShoppingBag, LayoutDashboard, Package, FileText, Receipt, DollarSign, LogOut, FileSpreadsheet } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const isAdmin = user?.role === "admin";

  const userNavItems = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/invoice", icon: FileText, label: "Create Invoice" },
  ];

  const adminNavItems = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/invoice", icon: FileText, label: "B2C Invoice" },
    { href: "/b2b-invoice", icon: Receipt, label: "B2B Invoice" },
    { href: "/inventory", icon: Package, label: "Inventory" },
    { href: "/expenses", icon: DollarSign, label: "Expenses" },
    { href: "/reports", icon: FileSpreadsheet, label: "Reports" },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-primary flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-sidebar-foreground">Amazeon</h1>
                <p className="text-xs text-muted-foreground">Shopping</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.href;
                    return (
                      <SidebarMenuItem key={item.href}>
                        <Link href={item.href}>
                          <a>
                            <SidebarMenuButton isActive={isActive} data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}>
                              <Icon className="h-5 w-5" />
                              <span>{item.label}</span>
                            </SidebarMenuButton>
                          </a>
                        </Link>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-sidebar-border p-4">
            <div className="space-y-4">
              <div className="px-2 py-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Logged in as</p>
                <p className="text-sm font-semibold text-sidebar-foreground" data-testid="text-current-user">{user?.username}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
