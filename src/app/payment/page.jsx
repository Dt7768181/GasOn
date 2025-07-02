
"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreditCard, IndianRupee } from "lucide-react";
import { db } from "../../../firebase-config.js";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [bookingDetails, setBookingDetails] = React.useState(null);
  const [bookingDocId, setBookingDocId] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const orderId = searchParams.get("orderId");

  React.useEffect(() => {
    if (!orderId) {
      toast({
        title: "Error",
        description: "No order ID found. Redirecting to home.",
        variant: "destructive",
      });
      router.push("/");
      return;
    }

    const fetchBooking = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "bookings"),
          where("id", "==", orderId)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          toast({
            title: "Not Found",
            description: `No booking found with ID: ${orderId}`,
            variant: "destructive",
          });
          setBookingDetails(null);
        } else {
          const bookingDoc = querySnapshot.docs[0];
          setBookingDetails(bookingDoc.data());
          setBookingDocId(bookingDoc.id);
        }
      } catch (error) {
        console.error("Error fetching booking:", error);
        toast({
          title: "Error",
          description: "Could not fetch booking details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [orderId, router, toast]);

  const handlePayment = async () => {
    if (!bookingDocId) {
      toast({
        title: "Error",
        description: "Could not process payment. Booking details not found.",
        variant: "destructive",
      });
      return;
    }

    // This is where a real payment gateway integration would go.
    // For now, we'll simulate a successful payment and update the status.
    try {
      const bookingRef = doc(db, "bookings", bookingDocId);
      await updateDoc(bookingRef, {
        status: "Confirmed",
      });

      toast({
        title: "Payment Successful!",
        description: "Your order has been confirmed and is being processed.",
      });

      router.push("/history");
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast({
        title: "Payment Failed",
        description:
          "There was an issue confirming your order. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AppShell>
      <div className="flex-1 space-y-8 p-4 md:p-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Complete Your Payment
            </h1>
            <p className="text-muted-foreground">
              Review your order and proceed to payment.
            </p>
          </div>
        </div>
        <div className="flex justify-center">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>
                Please confirm the details for Order ID:{" "}
                <span className="font-semibold text-primary">{orderId}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : bookingDetails ? (
                <>
                  <div className="flex justify-between items-center text-lg">
                    <span>Cylinder Type:</span>
                    <span className="font-semibold">{bookingDetails.type}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg">
                    <span>Delivery Date:</span>
                    <span className="font-semibold">
                      {bookingDetails.date}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-lg">
                    <span>Time Slot:</span>
                    <span className="font-semibold">
                      {bookingDetails.time}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t text-2xl font-bold">
                    <span>Total Amount:</span>
                    <div className="flex items-center">
                      <IndianRupee className="h-6 w-6 mr-1" />
                      <span>{bookingDetails.amount.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Could not load order details.
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                onClick={handlePayment}
                disabled={loading || !bookingDetails}
              >
                <CreditCard className="mr-2 h-5 w-5" />
                Pay Now
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
