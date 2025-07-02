
"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IndianRupee } from "lucide-react";
import { db } from "../../../firebase-config.js";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [bookingDetails, setBookingDetails] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const razorpayContainerRef = React.useRef(null);

  const orderId = searchParams.get("orderId");

  React.useEffect(() => {
    if (!orderId) {
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

  React.useEffect(() => {
    if (
      !loading &&
      bookingDetails &&
      bookingDetails.type === "5kg Cylinder" &&
      razorpayContainerRef.current
    ) {
      // Ensure the container is empty before appending
      razorpayContainerRef.current.innerHTML = "";

      const form = document.createElement("form");

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/payment-button.js";
      script.async = true;
      script.setAttribute("data-payment_button_id", "pl_Qo94mvwgmkGpjZ");
      
      // Pass our internal booking ID in the notes for reliable webhook processing
      script.setAttribute("data-notes.booking_id", bookingDetails.id);

      // Pre-fill customer details to make checkout easier
      script.setAttribute("data-prefill.contact", bookingDetails.userId);
      if (bookingDetails.customerEmail) {
        script.setAttribute("data-prefill.email", bookingDetails.customerEmail);
      }

      form.appendChild(script);
      razorpayContainerRef.current.appendChild(form);
    }
  }, [loading, bookingDetails]);

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
              <div className="w-full flex justify-center">
                {loading && <Skeleton className="h-12 w-full" />}

                {!loading &&
                  bookingDetails &&
                  bookingDetails.type === "5kg Cylinder" && (
                    <div ref={razorpayContainerRef}></div>
                  )}

                {!loading &&
                  bookingDetails &&
                  bookingDetails.type !== "5kg Cylinder" && (
                    <p className="text-center text-muted-foreground">
                      Online payment is not yet available for this cylinder
                      type.
                    </p>
                  )}
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
