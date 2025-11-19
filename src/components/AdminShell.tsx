import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Settings,
  Menu,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { GloLogo } from "./GloLogo";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
const navItems = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/manicurists", icon: Users, label: "Manicurists" },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
];
const NavContent = () => (
  <div className="flex flex-col h-full">
    <div className="p-4 border-b flex items-center gap-2">
      <ShieldCheck className="h-8 w-8 text-brand-rose" />
      <span className="text-xl font-bold text-brand-charcoal tracking-tight">
        Glo Admin
      </span>
    </div>
    <nav className="flex-1 p-4 space-y-2">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              isActive && "bg-muted text-primary font-semibold"
            )
          }
        >
          <item.icon className="h-5 w-5" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  </div>
);
export function AdminShell() {
  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <div className="min-h-screen w-full bg-background">
        <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-10">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 w-64">
              <NavContent />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
             <ShieldCheck className="h-7 w-7 text-brand-rose" />
             <span className="text-xl font-bold text-brand-charcoal tracking-tight">Glo Admin</span>
          </div>
        </header>
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    );
  }
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <NavContent />
      </div>
      <div className="flex flex-col">
        <main className="flex-1 overflow-auto bg-muted/40">
          <Outlet />
        </main>
      </div>
    </div>
  );
}