"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  CircleDot,
  CircleCheck,
  Truck,
  PackageCheck,
  BookmarkCheck,
  XCircle,
  Loader2,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { db } from "../../../firebase-config.js";
import { collection, query, where, getDocs, DocumentData } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface StatusStep {
  name: string;
  icon: LucideIcon;
  description: string;
}

const statusSteps: StatusStep[] = [
  { name: "Pending", icon: CircleDot, description: "Your booking is received and is waiting for confirmation." },
  { name: "Booked", icon: BookmarkCheck, description: "Your booking is confirmed and will be processed shortly." },
  { name: "Confirmed", icon: CircleCheck, description: "Your payment has been received and your booking is confirmed." },
  { name: "Out for Delivery", icon: Truck, description: "Your cylinder is on its way to your address." },
  { name: "Delivered", icon: PackageCheck, description: "Your cylinder has been successfully delivered." },
];

interface BookingDetails extends DocumentData {
  id: string;
  customer: string;
  status: string;
}

export default function TrackPage() {
  const [bookingId, setBookingId] = useState("");
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleTrack = async () => {
    if (!bookingId) {
      toast({ title: "Error", description: "Please enter a booking ID.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setBookingDetails(null);

    try {
      const q = query(collection(db, "bookings"), where("id", "==", bookingId.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({ title: "Not Found", description: `No booking found with ID: ${bookingId}`, variant: "destructive" });
      } else {
        const bookingData = querySnapshot.docs[0].data() as BookingDetails;
        setBookingDetails(bookingData);
      }
    } catch (error) {
      console.error("Error tracking booking:", error);
      toast({ title: "Error", description: "An error occurred while tracking the booking.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const currentStatus = bookingDetails?.status;
  const activeIndex = statusSteps.findIndex(
    (step) => step.name === currentStatus
  );

  return (
    <AppShell>
      <div className="flex-1 space-y-8 p-4 md:p-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Track Your Order
            </h1>
            <p className="text-muted-foreground">
              Enter your booking ID to see the latest status of your delivery.
            </p>
          </div>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Enter Booking ID</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                placeholder="e.g., GAS-12345"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
              />
              <Button onClick={handleTrack} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Track
              </Button>
            </div>
          </CardContent>
        </Card>

        {isLoading && (
            <Card>
                <CardHeader>
                    <CardTitle><Skeleton className="h-7 w-48" /></CardTitle>
                    <CardDescription className="space-y-2 pt-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-32 w-full" />
                </CardContent>
            </Card>
        )}

        {bookingDetails && !isLoading && (
          bookingDetails.status.startsWith("Cancelled") ? (
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center items-center mb-2">
                  <XCircle className="w-12 h-12 text-destructive" />
                </div>
                <CardTitle className="text-destructive">
                  Booking Cancelled
                </CardTitle>
                <CardDescription>
                  This booking ({bookingDetails.id}) has been cancelled.
                  {bookingDetails.status === 'Cancelled - Out of Stock' && ' This was due to the item being out of stock.'}
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Booking Status</CardTitle>
                <CardDescription>
                  <p>ID: <span className="font-semibold text-primary">{bookingDetails.id}</span> | Customer: <span className="font-semibold">{bookingDetails.customer}</span></p>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-border -z-10" />
                  <ul className="space-y-8">
                    {statusSteps.map((step, index) => {
                      const isActive = index <= activeIndex;
                      return (
                        <li key={step.name} className="flex items-start">
                          <div
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-full border-2",
                              isActive
                                ? "bg-primary border-primary text-primary-foreground"
                                : "bg-muted border-border"
                            )}
                          >
                            <step.icon className="h-5 w-5" />
                          </div>
                          <div className="ml-4">
                            <h3 className={cn("font-semibold", isActive ? "text-foreground" : "text-muted-foreground")}>
                              {step.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {step.description}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </AppShell>
  );
}
