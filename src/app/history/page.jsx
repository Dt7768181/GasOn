
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
import { db } from "../../../firebase-config.js";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchOrders = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "bookings"),
          where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(q);
        const fetchedOrders = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          docId: doc.id,
        }));
        
        // Sort orders by creation date on the client-side
        fetchedOrders.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : 0;
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : 0;
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
            <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
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
              <p className="text-center text-muted-foreground">
                Loading your order history...
              </p>
            ) : orders.length === 0 ? (
              <p className="text-center text-muted-foreground">
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>{order.type}</TableCell>
                      <TableCell className="text-right">
                        ₹{order.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        {order.status === "Pending" ? (
                          <Button
                            size="sm"
                            onClick={() => router.push(`/checkout?orderId=${order.id}`)}
                          >
                            Complete Payment
                          </Button>
                        ) : (
                          <Badge
                            variant={getBadgeVariant(order.status)}
                            className={cn(
                                order.status === "Delivered" &&
                                "bg-accent text-accent-foreground hover:bg-accent/80"
                            )}
                          >
                            {order.status}
                          </Badge>
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
  );
}
