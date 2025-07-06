"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, History, LayoutDashboard, LogOut, MapPinned, User } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
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

const customerMenuItems = [
  { href: "/", label: "Book Cylinder", icon: Flame },
  { href: "/track", label: "Track Order", icon: MapPinned },
  { href: "/history", label: "Order History", icon: History },
];

const adminMenuItems = [
  { href: "/admin", label: "Admin Dashboard", icon: LayoutDashboard },
];

export function AppShell({ children }) {
  const pathname = usePathname();
  const { user, role, logout, isLoading } = useAuth();

  // Don't render anything until the auth state is confirmed,
  // to prevent content flashing or showing pages to unauthorized users.
  if (isLoading || !role || !user) {
    return null;
  }
  
  const menuItems = role === "admin" ? adminMenuItems : customerMenuItems;
  const userName = user.fullName;
  const userEmail = user.email;
  
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
            {menuItems.map((item) => (
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
              <DropdownMenuItem onClick={logout}>
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
            {/* Header items can be added here */}
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
