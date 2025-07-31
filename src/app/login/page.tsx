"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from 'react';
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
import { Flame, Loader2 } from "lucide-react";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase-config.js';
import { useToast } from "@/hooks/use-toast";


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('password'); // Default for demo
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async () => {
    if (!phone) {
      toast({
        title: 'Login Failed',
        description: 'Please enter a phone number.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const userRef = doc(db, "customers", phone);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        localStorage.setItem("userRole", "customer");
        localStorage.setItem("userId", phone);
        localStorage.setItem("customerProfile", JSON.stringify(userDoc.data()));
        router.push("/");
      } else {
        toast({
          title: 'Login Failed',
          description: 'No account found with this phone number. Please register first.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error("Error logging in: ", error);
       toast({
        title: 'Error',
        description: 'An error occurred during login. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
           <div className="flex justify-center items-center mb-4">
            <Flame className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Customer Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="9876543210" required value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isLoading} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
            </div>
          </div>
          <Button className="w-full mt-6" onClick={handleLogin} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Log In
          </Button>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="underline text-primary">
              Register
            </Link>
          </div>
           <div className="mt-4 text-center text-xs">
            <Link href="/admin/login" className="underline text-muted-foreground hover:text-primary">
              For Admins
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
