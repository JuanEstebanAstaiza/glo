import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Scissors,
  Calendar,
  Users,
  Gift,
  Menu,
  BookUser,
  LogOut,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GloLogo } from "./GloLogo";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuthStore } from "@/stores/authStore";
import { LanguageSwitcher } from "./LanguageSwitcher";
const manicuristNavItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/services", icon: Scissors, label: "Services" },
  { to: "/schedule", icon: Calendar, label: "Schedule" },
  { to: "/appointments", icon: BookUser, label: "Appointments" },
  { to: "/clients", icon: Users, label: "Clients" },
  { to: "/rewards", icon: Gift, label: "Rewards" },
];
const clientNavItems = [
  { to: "/client-dashboard", icon: LayoutDashboard, label: "Dashboard" },
];
const NavContent = ({ navItems }: { navItems: typeof manicuristNavItems }) => (
  <div className="flex flex-col h-full">
    <div className="p-4 border-b border-brand-charcoal/10">
      <NavLink to="/" className="flex items-center gap-2">
        <GloLogo className="h-8 w-8 text-brand-rose" />
        <span className="text-2xl font-bold text-brand-charcoal tracking-tight">
          Glo
        </span>
      </NavLink>
    </div>
    <nav className="flex-1 p-4 space-y-2">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-brand-charcoal/80 transition-all hover:text-brand-charcoal hover:bg-brand-rose/20",
              isActive && "bg-brand-rose/20 text-brand-charcoal font-medium"
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
const UserMenu = () => {
  const logoutAction = useAuthStore(state => state.logout);
  const navigate = useNavigate();
  const handleLogout = () => {
    logoutAction();
    navigate('/login');
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" className="rounded-full">
          <UserCircle className="h-5 w-5" />
          <span className="sr-only">Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export function AppShell() {
  const isMobile = useIsMobile();
  const userRole = useAuthStore(state => state.userRole);
  const navItems = userRole === 'manicurist' ? manicuristNavItems : clientNavItems;
  const HeaderContent = () => (
    <>
      <div className="flex items-center gap-2">
        <GloLogo className="h-7 w-7 text-brand-rose" />
        <span className="text-xl font-bold text-brand-charcoal tracking-tight">Glo</span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <LanguageSwitcher />
        <UserMenu />
      </div>
    </>
  );
  if (isMobile) {
    return (
      <div className="min-h-screen w-full bg-brand-cream">
        <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-brand-cream/80 backdrop-blur-lg px-4 md:px-6 z-10">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 w-64 bg-brand-cream">
              <NavContent navItems={navItems} />
            </SheetContent>
          </Sheet>
          <HeaderContent />
        </header>
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    );
  }
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr]">
      <div className="hidden border-r bg-brand-cream md:block">
        <NavContent navItems={navItems} />
      </div>
      <div className="flex flex-col bg-stone-50">
        <header className="flex h-16 items-center gap-4 border-b bg-brand-cream px-6">
          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher />
            <UserMenu />
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}