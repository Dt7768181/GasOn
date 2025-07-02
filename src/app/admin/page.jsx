"use client";

import * as React from "react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { FilePlus2, PlusCircle } from "lucide-react";
import { db } from "../../../firebase-config.js";
import {
  collection,
  query,
  getDocs,
  orderBy,
  doc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const statusSteps = [
  "Pending",
  "Booked",
  "Confirmed",
  "Out for Delivery",
  "Delivered",
];

export default function AdminPage() {
  const [bookings, setBookings] = React.useState([]);
  const [loadingBookings, setLoadingBookings] = React.useState(true);
  const [cylinders, setCylinders] = React.useState([]);
  const [loadingCylinders, setLoadingCylinders] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchBookings = async () => {
      setLoadingBookings(true);
      try {
        const q = query(
          collection(db, "bookings"),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const fetchedBookings = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          docId: doc.id,
        }));
        setBookings(fetchedBookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoadingBookings(false);
      }
    };

    const initializeAndFetchCylinders = async () => {
      setLoadingCylinders(true);
      const cylindersRef = collection(db, "cylinders");
      try {
        const querySnapshot = await getDocs(cylindersRef);
        if (querySnapshot.empty) {
          toast({
            title: "Initializing Cylinder Stock",
            description: "First-time setup: creating cylinder inventory.",
          });
          const initialCylinders = [
            {
              id: "5kg",
              name: "5kg Cylinder",
              stock: 150,
              price: 450,
              deliveryCharge: 50,
              description: "Ideal for small families and bachelors.",
            },
            {
              id: "14.2kg",
              name: "14.2kg Cylinder",
              stock: 320,
              price: 1100,
              deliveryCharge: 100,
              description: "Standard household cylinder for regular use.",
            },
            {
              id: "19kg",
              name: "19kg Cylinder",
              stock: 85,
              price: 2200,
              deliveryCharge: 500,
              description: "Commercial size, suitable for restaurants.",
            },
          ];
          for (const cyl of initialCylinders) {
            await setDoc(doc(db, "cylinders", cyl.id), cyl);
          }
          setCylinders(initialCylinders.map((c) => ({ ...c, type: c.name })));
        } else {
          const fetchedCylinders = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
            type: doc.data().name,
          }));
          setCylinders(fetchedCylinders);
        }
      } catch (error) {
        console.error("Error fetching/initializing cylinders:", error);
        toast({
          title: "Error",
          description: "Could not load cylinder data.",
          variant: "destructive",
        });
      } finally {
        setLoadingCylinders(false);
      }
    };

    fetchBookings();
    initializeAndFetchCylinders();
  }, [toast]);

  const handleStatusUpdate = async (docId, newStatus) => {
    try {
      const bookingRef = doc(db, "bookings", docId);
      await updateDoc(bookingRef, {
        status: newStatus,
      });

      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.docId === docId ? { ...booking, status: newStatus } : booking
        )
      );

      toast({
        title: "Status Updated",
        description: `Booking status has been changed to ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Update Failed",
        description: "Could not update the booking status.",
        variant: "destructive",
      });
    }
  };

  const getBadgeVariant = (status) => {
    switch (status) {
      case "Pending":
        return "destructive";
      case "Booked":
      case "Confirmed":
        return "secondary";
      case "Out for Delivery":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <AppShell>
      <div className="flex-1 space-y-8 p-4 md:p-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage bookings, cylinders, and deliveries.
            </p>
          </div>
        </div>

        <Tabs defaultValue="bookings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="cylinders">Cylinders</TabsTrigger>
            <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
          </TabsList>
          <TabsContent value="bookings" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Current Bookings</CardTitle>
                  <CardDescription>
                    Manage and track all incoming orders.
                  </CardDescription>
                </div>
                <Button>
                  <FilePlus2 className="mr-2 h-4 w-4" /> Create Booking
                </Button>
              </CardHeader>
              <CardContent>
                {loadingBookings ? (
                  <p className="text-center text-muted-foreground">
                    Loading bookings...
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time Slot</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>{booking.id}</TableCell>
                          <TableCell>{booking.customer}</TableCell>
                          <TableCell>{booking.date}</TableCell>
                          <TableCell>{booking.time}</TableCell>
                          <TableCell>{booking.type}</TableCell>
                          <TableCell>
                            <Badge
                              variant={getBadgeVariant(booking.status)}
                              className={cn(
                                booking.status === "Delivered" &&
                                  "bg-accent text-accent-foreground hover:bg-accent/80"
                              )}
                            >
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  Manage
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>
                                  Change Status
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {statusSteps.map((status) => (
                                  <DropdownMenuItem
                                    key={status}
                                    onClick={() =>
                                      handleStatusUpdate(booking.docId, status)
                                    }
                                    disabled={booking.status === status}
                                  >
                                    {status}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="cylinders" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Cylinder Inventory</CardTitle>
                  <CardDescription>
                    View and manage cylinder stock and prices.
                  </CardDescription>
                </div>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Cylinder Type
                </Button>
              </CardHeader>
              <CardContent>
                {loadingCylinders ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cylinder Type</TableHead>
                        <TableHead>In Stock</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cylinders.map((cylinder) => (
                        <TableRow key={cylinder.id}>
                          <TableCell className="font-semibold">
                            {cylinder.type}
                          </TableCell>
                          <TableCell>{cylinder.stock}</TableCell>
                          <TableCell>₹{cylinder.price.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}