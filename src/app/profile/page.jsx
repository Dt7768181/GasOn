'use client';

import * as React from 'react';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase-config.js';
import { useAuth } from '@/hooks/use-auth.js';
import { Skeleton } from '@/components/ui/skeleton.jsx';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters.'),
  phone: z
    .string()
    .regex(/^\d{10}$/, 'Please enter a valid 10-digit phone number.'),
  email: z.string().email('Please enter a valid email address.'),
  address1: z.string().min(5, 'Address line 1 is required.'),
  address2: z.string().optional(),
  city: z.string().min(2, 'City is required.'),
  pincode: z.string().regex(/^\d{6}$/, 'Please enter a valid 6-digit pincode.'),
});

const adminProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters.'),
  username: z.string().min(2, 'Username is required.'),
  email: z.string().email('Please enter a valid email address.'),
});

export default function ProfilePage() {
  const { toast } = useToast();
  const { user, role, isLoading } = useAuth();

  const form = useForm({
    resolver: role === 'admin' ? zodResolver(adminProfileSchema) : zodResolver(profileSchema),
  });
  
  // When the user data is loaded by the auth hook, reset the form with the new data.
  React.useEffect(() => {
    if (user) {
      form.reset(user);
    }
  }, [user, form]);


  async function onSubmit(values) {
    // Notify other components (like AppShell) that the profile has changed.
    const dispatchProfileUpdate = () => window.dispatchEvent(new Event("profileUpdated"));
    
    try {
      if (role === 'customer') {
          const userId = localStorage.getItem('userId');
          if (!userId) throw new Error("Could not update profile. User not found.");
          
          const customerDocRef = doc(db, 'customers', userId);
          await updateDoc(customerDocRef, values);
      } else if (role === 'admin') {
          // For the demo, admin profile is saved to local storage
          localStorage.setItem('adminProfile', JSON.stringify(values));
      }
      
      toast({
        title: 'Profile Updated',
        description: 'Your information has been saved successfully.',
      });
      dispatchProfileUpdate();

    } catch (error) {
      console.error("Error updating profile: ", error);
      toast({
        title: 'Error',
        description: error.message || 'There was a problem saving your profile.',
        variant: 'destructive',
      });
    }
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex-1 p-4 md:p-8 space-y-4">
            <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-64 w-full" />
        </div>
      </AppShell>
    );
  }

  const renderCustomerForm = () => (
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
          <CardDescription>
            Update your personal and address details here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField control={form.control} name="fullName" render={({ field }) => ( <FormItem> <FormLabel>Full Name</FormLabel> <FormControl> <Input placeholder="John Doe" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem> <FormLabel>Phone Number</FormLabel> <FormControl> <Input placeholder="9876543210" {...field} disabled /> </FormControl> <FormMessage /> </FormItem> )} />
              </div>
              <FormField control={form.control} name="email" render={({ field }) => ( <FormItem> <FormLabel>Email Address</FormLabel> <FormControl> <Input placeholder="john.doe@example.com" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
              <FormField control={form.control} name="address1" render={({ field }) => ( <FormItem> <FormLabel>Address Line 1</FormLabel> <FormControl> <Input placeholder="Flat, House no., Building, Company, Apartment" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
              <FormField control={form.control} name="address2" render={({ field }) => ( <FormItem> <FormLabel>Address Line 2 (Optional)</FormLabel> <FormControl> <Input placeholder="Area, Colony, Street, Sector, Village" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField control={form.control} name="city" render={({ field }) => ( <FormItem> <FormLabel>City</FormLabel> <FormControl> <Input placeholder="Mumbai" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="pincode" render={({ field }) => ( <FormItem> <FormLabel>Pincode</FormLabel> <FormControl> <Input placeholder="400001" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
              </div>
              <Button type="submit">Save Changes</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
  )

  const renderAdminForm = () => (
     <Card>
        <CardHeader>
            <CardTitle>Admin Information</CardTitle>
            <CardDescription>Update your admin profile details here.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="fullName" render={({ field }) => ( <FormItem> <FormLabel>Full Name</FormLabel> <FormControl> <Input placeholder="Admin User" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="username" render={({ field }) => ( <FormItem> <FormLabel>Username</FormLabel> <FormControl> <Input placeholder="admin" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                </div>
                <FormField control={form.control} name="email" render={({ field }) => ( <FormItem> <FormLabel>Email</FormLabel> <FormControl> <Input placeholder="admin@gason.com" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                <Button type="submit">Save Changes</Button>
            </form>
            </Form>
        </CardContent>
     </Card>
  )

  return (
    <AppShell>
      <div className="flex-1 space-y-8 p-4 md:p-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
            <p className="text-muted-foreground">
              View and manage your personal information.
            </p>
          </div>
        </div>
        {role === 'customer' ? renderCustomerForm() : renderAdminForm()}
      </div>
    </AppShell>
  );
}
