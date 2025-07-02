"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import {
  Flame,
  History,
  LayoutDashboard,
  LogOut,
  MapPinned,
  User,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";

const menuItems = [
  { href: "/", label: "Book Cylinder", icon: Flame, role: "customer" },
  { href: "/track", label: "Track Order", icon: MapPinned, role: "customer" },
  { href: "/history", label: "Order History", icon: History, role: "customer" },
  { href: "/admin", label: "Admin Dashboard", icon: LayoutDashboard, role: "admin" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);

    // Redirect logic for protected routes
    if (!role) {
      router.push('/login');
    } else if (role === 'customer' && pathname.startsWith('/admin')) {
      router.push('/'); // customer trying to access admin
    } else if (role === 'admin' && !pathname.startsWith('/admin') && pathname !== '/profile') {
      // admin trying to access customer pages, redirect to admin dashboard
      router.push('/admin');
    }

  }, [pathname, router]);

  const handleLogout = () => {
    const role = localStorage.getItem("userRole");
    localStorage.removeItem("userRole");
    if (role === 'admin') {
      router.push('/admin/login');
    } else {
      router.push('/login');
    }
  };

  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Render nothing until client-side hydration is complete and role is determined
  if (!isMounted || !userRole) {
    return null;
  }
  
  const filteredMenuItems = menuItems.filter(item => item.role === userRole);
  
  const isAdmin = userRole === 'admin';
  const userName = isAdmin ? 'Admin User' : 'Customer User';
  const userEmail = isAdmin ? 'admin@gason.com' : 'customer@example.com';

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Flame className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-bold">GasOn</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {filteredMenuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                >
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2 p-2 h-auto">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://placehold.co/40x40.png" alt="@user" />
                  <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mb-2 ml-2" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userEmail}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-2 border-b md:justify-end">
          <SidebarTrigger className="md:hidden" />
          <div className="pr-2">
            {/* Can add header items here */}
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
