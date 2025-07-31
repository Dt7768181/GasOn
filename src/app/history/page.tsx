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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "../../../firebase-config.js";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  runTransaction,
  DocumentData,
  Timestamp,
} from "firebase/firestore";
import { cn, getBadgeVariant } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const SkeletonRow = () => (
  <TableRow>
    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
    <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
    <TableCell className="text-center"><Skeleton className="h-8 w-36 mx-auto" /></TableCell>
    <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
  </TableRow>
);

interface Order extends DocumentData {
  docId: string;
  id: string;
  date: string;
  type: string;
  amount: number;
  status: string;
  createdAt: Timestamp;
  cylinderId?: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);

  const canBeCancelled = (status: string) => {
    return ["Pending", "Booked", "Confirmed"].includes(status);
  };

  React.useEffect(() => {
    const fetchOrders = async () => {
      if (typeof window === "undefined") return;
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const q = query(
          collection(db, "bookings"),
          where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(q);
        const fetchedOrders = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          docId: doc.id,
        })) as Order[];

        fetchedOrders.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
          return dateB - dateA;
        });

        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleCancelBooking = async () => {
    if (!selectedOrder) return;

    if (!canBeCancelled(selectedOrder.status)) {
       toast({
        title: "Cancellation Failed",
        description: "This booking cannot be cancelled at its current stage.",
        variant: "destructive",
      });
      setIsAlertOpen(false);
      return;
    }

    try {
      await runTransaction(db, async (transaction) => {
        const bookingRef = doc(db, "bookings", selectedOrder.docId);
        const bookingDoc = await transaction.get(bookingRef);

        if (!bookingDoc.exists()) throw new Error("Booking not found.");
        
        const bookingData = bookingDoc.data();
        if (!canBeCancelled(bookingData.status)) throw new Error("This booking can no longer be cancelled.");

        const shouldRestock = ["Confirmed", "Booked"].includes(bookingData.status);

        if (shouldRestock && bookingData.cylinderId) {
            const cylinderRef = doc(db, "cylinders", bookingData.cylinderId);
            const cylinderDoc = await transaction.get(cylinderRef);

            if (cylinderDoc.exists()) {
              const newStock = cylinderDoc.data().stock + 1;
              transaction.update(cylinderRef, { stock: newStock });
            } else {
              console.error(`Cylinder ${bookingData.cylinderId} not found for restocking.`);
            }
        }
        
        transaction.update(bookingRef, { status: "Cancelled" });
      });

      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o.docId === selectedOrder.docId
            ? { ...o, status: "Cancelled" }
            : o
        )
      );

      toast({
        title: "Booking Cancelled",
        description: `Your booking ${selectedOrder.id} has been successfully cancelled.`,
      });
    } catch (error: any) {
      console.error("Error cancelling booking:", error);
      toast({
        title: "Cancellation Failed",
        description: error.message || "Could not cancel the booking.",
        variant: "destructive",
      });
    } finally {
      setIsAlertOpen(false);
      setSelectedOrder(null);
    }
  };

  const openCancelDialog = (order: Order) => {
    setSelectedOrder(order);
    setIsAlertOpen(true);
  };

  return (
    <>
      <AppShell>
        <div className="flex-1 space-y-8 p-4 md:p-8">
          <div className="flex items-center justify-between space-y-2">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Order History
              </h1>
              <p className="text-muted-foreground">
                A list of all your past gas cylinder bookings.
              </p>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                {loading
                  ? "Loading your orders..."
                  : `You have made ${orders.length} orders in total.`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Cylinder Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}
                  </TableBody>
                </Table>
              ) : orders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  You have no past orders.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Cylinder Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.id}
                        </TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>{order.type}</TableCell>
                        <TableCell className="text-right">
                          ₹{order.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          {order.status === "Pending" ? (
                            <Button
                              size="sm"
                              onClick={() =>
                                router.push(`/checkout?orderId=${order.id}`)
                              }
                            >
                              Complete Payment
                            </Button>
                          ) : (
                            <Badge
                              variant={getBadgeVariant(order.status)}
                              className={cn(
                                order.status === "Delivered" &&
                                  "text-accent-foreground"
                              )}
                            >
                              {order.status}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {canBeCancelled(order.status) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openCancelDialog(order)}
                            >
                              Cancel
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </AppShell>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to cancel?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. If you paid by card, your refund
              will be processed within 24 hours.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedOrder(null)}>
              Go Back
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelBooking}>
              Yes, Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
