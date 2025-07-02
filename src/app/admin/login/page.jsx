"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    // In a real app, you'd have auth logic here.
    // We'll simulate login and redirect to the admin dashboard.
    localStorage.setItem("userRole", "admin");
    router.push("/admin");
    router.refresh(); // To re-trigger server components and layout logic
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
           <div className="flex justify-center items-center mb-4">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>
            Enter your administrator credentials to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" placeholder="admin" defaultValue="admin" required />
            </div>
             <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" defaultValue="password" required />
            </div>
          </div>
          <Button className="w-full mt-6" onClick={handleLogin}>
            Log In
          </Button>
           <div className="mt-4 text-center text-xs">
            <Link href="/login" className="underline text-muted-foreground hover:text-primary">
              For Customers
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
