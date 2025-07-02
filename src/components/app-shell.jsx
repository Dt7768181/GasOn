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

export function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = React.useState(null);
  const [userName, setUserName] = React.useState('');
  const [userEmail, setUserEmail] = React.useState('');
  const [isMounted, setIsMounted] = React.useState(false);

  const loadUserDataAndAuth = React.useCallback(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);

    if (role === 'admin') {
      const storedProfile = localStorage.getItem('adminProfile');
      const profile = storedProfile ? JSON.parse(storedProfile) : { fullName: 'Admin User', email: 'admin@gason.com' };
      setUserName(profile.fullName);
      setUserEmail(profile.email || 'admin@gason.com');
    } else if (role === 'customer') {
      const storedProfile = localStorage.getItem('customerProfile');
      const profile = storedProfile ? JSON.parse(storedProfile) : { fullName: 'Customer', email: '' };
      setUserName(profile.fullName);
      setUserEmail(profile.email || '');
    }

    // Auth redirection logic
    if (!role) {
      router.push('/login');
    } else if (role === 'customer' && pathname.startsWith('/admin')) {
      router.push('/');
    } else if (role === 'admin' && !pathname.startsWith('/admin') && pathname !== '/profile') {
      router.push('/admin');
    }
  }, [pathname, router]);

  React.useEffect(() => {
    setIsMounted(true);
    loadUserDataAndAuth();

    // Listen for profile updates to reload data
    window.addEventListener('profileUpdated', loadUserDataAndAuth);

    return () => {
      window.removeEventListener('profileUpdated', loadUserDataAndAuth);
    };
  }, [loadUserDataAndAuth]);

  const handleLogout = () => {
    const role = localStorage.getItem("userRole");
    localStorage.removeItem("userRole");
    if (role === 'admin') {
      localStorage.removeItem("adminProfile");
      router.push('/admin/login');
    } else {
      localStorage.removeItem("customerProfile");
      localStorage.removeItem("userId");
      router.push('/login');
    }
    setUserRole(null);
  };

  // Render nothing until client-side hydration is complete and role is determined
  if (!isMounted || !userRole) {
    return null;
  }
  
  const filteredMenuItems = menuItems.filter(item => item.role === userRole);
  
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
                  <AvatarFallback>{userName ? userName.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
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
