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
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase-config.js';


const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters.'),
  phone: z
    .string()
    .regex(/^\d{10}$/, 'Please enter a valid 10-digit phone number.'),
  address1: z.string().min(5, 'Address line 1 is required.'),
  address2: z.string().optional(),
  city: z.string().min(2, 'City is required.'),
  pincode: z.string().regex(/^\d{6}$/, 'Please enter a valid 6-digit pincode.'),
});

const adminProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters.'),
  username: z.string().min(2, 'Username is required.'),
});

const defaultCustomerProfile = {
  fullName: '',
  phone: '',
  address1: '',
  address2: '',
  city: '',
  pincode: '',
};

const defaultAdminProfile = {
  fullName: 'Admin User',
  username: 'admin',
};

export default function ProfilePage() {
  const { toast } = useToast();
  const [userRole, setUserRole] = React.useState(null);

  const customerForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: defaultCustomerProfile,
  });

  const adminForm = useForm({
    resolver: zodResolver(adminProfileSchema),
    defaultValues: defaultAdminProfile,
  });

  React.useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);

    const fetchCustomerProfile = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        const storedProfile = localStorage.getItem('customerProfile');
        if (storedProfile) {
          customerForm.reset(JSON.parse(storedProfile));
        }
        return;
      }

      try {
        const docRef = doc(db, "customers", userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const profileData = docSnap.data();
          customerForm.reset(profileData);
          localStorage.setItem('customerProfile', JSON.stringify(profileData));
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    if (role === 'customer') {
      fetchCustomerProfile();
    } else if (role === 'admin') {
      const storedProfile = localStorage.getItem('adminProfile');
      if (storedProfile) {
        adminForm.reset(JSON.parse(storedProfile));
      }
    }
  }, [customerForm, adminForm]);

  async function onCustomerSubmit(values) {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      toast({
        title: 'Error',
        description: 'Could not update profile. User not found.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const customerDocRef = doc(db, 'customers', userId);
      await updateDoc(customerDocRef, values);

      localStorage.setItem('customerProfile', JSON.stringify(values));
      toast({
        title: 'Profile Updated',
        description: 'Your information has been saved successfully.',
      });
      window.dispatchEvent(new Event("profileUpdated"));
    } catch (error) {
      console.error("Error updating document: ", error);
      toast({
        title: 'Error',
        description: 'There was a problem saving your profile.',
        variant: 'destructive',
      });
    }
  }

  function onAdminSubmit(values) {
    localStorage.setItem('adminProfile', JSON.stringify(values));
    toast({
      title: 'Profile Updated',
      description: 'Your information has been saved successfully.',
    });
    window.dispatchEvent(new Event("profileUpdated"));
  }

  if (!userRole) {
    return (
      <AppShell>
        <div className="flex-1 p-4 md:p-8">Loading...</div>
      </AppShell>
    );
  }

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

        {userRole === 'customer' && (
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>
                Update your personal and address details here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...customerForm}>
                <form
                  onSubmit={customerForm.handleSubmit(onCustomerSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={customerForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={customerForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="9876543210" {...field} disabled />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={customerForm.control}
                    name="address1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 1</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Flat, House no., Building, Company, Apartment"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={customerForm.control}
                    name="address2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 2 (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Area, Colony, Street, Sector, Village"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={customerForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Mumbai" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={customerForm.control}
                      name="pincode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pincode</FormLabel>
                          <FormControl>
                            <Input placeholder="400001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit">Save Changes</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {userRole === 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle>Admin Information</CardTitle>
              <CardDescription>
                Update your admin profile details here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...adminForm}>
                <form
                  onSubmit={adminForm.handleSubmit(onAdminSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={adminForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Admin User" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={adminForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="admin" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Save Changes</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
