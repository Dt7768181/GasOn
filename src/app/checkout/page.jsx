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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IndianRupee, Loader2 } from "lucide-react";
import { db } from "../../../firebase-config.js";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  runTransaction,
  updateDoc
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const orderId = searchParams.get("orderId");
  
  const [bookingDetails, setBookingDetails] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [isProcessing, setIsProcessing] = React.useState(false);

  React.useEffect(() => {
    if (!orderId) {
      toast({ title: "Error", description: "No order ID found.", variant: "destructive" });
      router.push("/");
      return;
    }

    const fetchBooking = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "bookings"), where("id", "==", orderId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          toast({ title: "Not Found", description: `No booking found with ID: ${orderId}`, variant: "destructive" });
          setBookingDetails(null);
        } else {
          const bookingDoc = querySnapshot.docs[0];
          const bookingData = bookingDoc.data();
          if (bookingData.status !== 'Pending') {
            toast({ title: "Order Already Processed", description: `This order has already been processed.`});
            router.push('/history');
            return;
          }
          setBookingDetails({...bookingData, docId: bookingDoc.id});
        }
      } catch (error) {
        console.error("Error fetching booking:", error);
        toast({ title: "Error", description: "Could not fetch booking details.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [orderId, router, toast]);

  const handlePayment = async (paymentMethod) => {
    setIsProcessing(true);
    
    try {
      if (!bookingDetails) {
        throw new Error("Booking details not loaded yet.");
      }

      await runTransaction(db, async (transaction) => {
        const bookingRef = doc(db, "bookings", bookingDetails.docId);
        const cylinderRef = doc(db, "cylinders", bookingDetails.cylinderId);

        const cylinderDoc = await transaction.get(cylinderRef);
        if (!cylinderDoc.exists()) {
          throw new Error("Cylinder not found.");
        }
        
        const bookingDoc = await transaction.get(bookingRef);
        if(bookingDoc.data().status !== 'Pending') {
            throw new Error("Order already processed.");
        }

        const currentStock = cylinderDoc.data().stock;
        if (currentStock <= 0) {
          throw new Error("Cylinder is out of stock.");
        }

        transaction.update(cylinderRef, { stock: currentStock - 1 });
        transaction.update(bookingRef, { 
          status: "Confirmed",
          paymentMethod: paymentMethod,
        });
      });

      toast({
        title: "Booking Confirmed!",
        description: `Your order ${orderId} has been confirmed.`,
      });
      router.push('/history');

    } catch (error) {
      console.error("Payment failed:", error);
      const errorMessage = error.message || "Could not process your booking. Please try again.";
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive",
      });

      if (error.message === 'Cylinder is out of stock.') {
         const bookingRef = doc(db, "bookings", bookingDetails.docId);
         await updateDoc(bookingRef, { status: "Cancelled - Out of Stock" });
         router.push('/history');
      } else if (error.message === 'Order already processed.') {
         router.push('/history');
      }

    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AppShell>
      <div className="flex-1 space-y-8 p-4 md:p-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
            <p className="text-muted-foreground">Confirm your order and choose a payment method.</p>
          </div>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>
                  For Order ID: <span className="font-semibold text-primary">{orderId}</span>
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
                      <span className="font-semibold">{bookingDetails.date}</span>
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
                  <p className="text-center text-muted-foreground py-8">Could not load order details.</p>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Select how you would like to pay.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="mb-4 text-lg font-medium">Pay with Card (Fake)</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="card-number">Card Number</Label>
                      <Input id="card-number" placeholder="1234 5678 9012 3456" defaultValue="4242 4242 4242 4242" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input id="expiry" placeholder="MM/YY" defaultValue="12/28" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" defaultValue="123"/>
                      </div>
                    </div>
                  </div>
                </div>
                 <Button className="w-full" onClick={() => handlePayment('Card')} disabled={isProcessing || loading || !bookingDetails}>
                    {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Pay ₹{bookingDetails?.amount.toFixed(2) || '...'}
                 </Button>
              </CardContent>
              <CardFooter className="flex-col gap-4">
                <div className="relative w-full">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or</span>
                    </div>
                </div>
                <Button variant="secondary" className="w-full" onClick={() => handlePayment('Cash on Delivery')} disabled={isProcessing || loading || !bookingDetails}>
                   {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                   Pay with Cash on Delivery
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
