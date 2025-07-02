
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
  updateDoc,
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

    const fetchAndPrepareBooking = async () => {
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
          let bookingData = bookingDoc.data();

          // If the order is pending, update its status to "Booked"
          if (bookingData.status === "Pending") {
            await updateDoc(bookingDoc.ref, {
              status: "Booked",
            });
            // Update the local data to reflect this change
            bookingData = { ...bookingData, status: "Booked" };
            toast({
              title: "Booking Initiated",
              description:
                "Your slot is reserved. Please complete the payment.",
            });
          }
          setBookingDetails(bookingData);
        }
      } catch (error) {
        console.error("Error fetching or updating booking:", error);
        toast({
          title: "Error",
          description: "Could not fetch booking details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAndPrepareBooking();
  }, [orderId, router, toast]);

  React.useEffect(() => {
    // IMPORTANT: You need to create a separate "Payment Button" in your Razorpay
    // dashboard for each cylinder type to ensure the correct amount is charged.
    // The button for 5kg is working. You should create buttons for the other
    // two sizes and replace their IDs below.
    const paymentButtonIds = {
      "5kg Cylinder": "pl_Qo94mvwgmkGpjZ", // This one is working
      "14.2kg Cylinder": "pl_Qo94mvwgmkGpjZ", // TODO: Replace with your 14.2kg button ID
      "19kg Cylinder": "pl_Qo94mvwgmkGpjZ", // TODO: Replace with your 19kg button ID
    };

    if (!loading && bookingDetails && razorpayContainerRef.current) {
      const buttonId = paymentButtonIds[bookingDetails.type];

      // Ensure the container is empty before appending
      razorpayContainerRef.current.innerHTML = "";

      if (buttonId) {
        const form = document.createElement("form");
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/payment-button.js";
        script.async = true;
        script.setAttribute("data-payment_button_id", buttonId);
        form.appendChild(script);
        razorpayContainerRef.current.appendChild(form);
      } else {
        razorpayContainerRef.current.innerHTML = `<p class="text-center text-muted-foreground">Online payment is not configured for this cylinder type.</p>`;
      }
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
              <div
                className="w-full flex justify-center"
                ref={razorpayContainerRef}
              >
                {loading && <Skeleton className="h-12 w-full" />}
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
