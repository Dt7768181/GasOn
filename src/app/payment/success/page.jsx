
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { db } from "../../../../firebase-config.js";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [message, setMessage] = React.useState(
    "Processing your payment confirmation..."
  );

  React.useEffect(() => {
    const updateOrderStatus = async () => {
      const orderId = localStorage.getItem("latestOrderId");

      if (!orderId) {
        toast({
          title: "No active order found",
          description: "Redirecting to the booking page.",
          variant: "destructive",
        });
        router.replace("/");
        return;
      }

      try {
        setMessage(`Updating status for order ${orderId}...`);
        const bookingsRef = collection(db, "bookings");
        const q = query(bookingsRef, where("id", "==", orderId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error("Booking not found in the database.");
        }

        const bookingDoc = querySnapshot.docs[0];
        if (bookingDoc.data().status === "Pending") {
          await updateDoc(bookingDoc.ref, {
            status: "Confirmed",
          });
          toast({
            title: "Payment Successful!",
            description: `Your order ${orderId} has been confirmed.`,
          });
        } else {
           toast({
            title: "Order Already Processed",
            description: `Your order ${orderId} was already confirmed.`,
          });
        }
        
        localStorage.removeItem("latestOrderId");
        setMessage("Order confirmed! Redirecting you now...");

        setTimeout(() => {
          router.replace("/");
        }, 2000);

      } catch (error) {
        console.error("Error updating order status:", error);
        toast({
          title: "Update Failed",
          description:
            "There was a problem confirming your order. Please contact support.",
          variant: "destructive",
        });
        setMessage(
          "An error occurred. Please contact support if your order status isn't updated."
        );
        localStorage.removeItem("latestOrderId");
      }
    };

    // Use a small delay to ensure localStorage is available after redirect
    const timer = setTimeout(updateOrderStatus, 500);
    return () => clearTimeout(timer);

  }, [router, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Payment Confirmation</CardTitle>
          <CardDescription>
            Please wait while we confirm your payment.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
}
