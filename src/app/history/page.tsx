import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";

const orders = [
  {
    id: "GAS-87923",
    date: "2024-05-15",
    cylinderType: "14.2kg Cylinder",
    amount: 1100,
    status: "Delivered",
  },
  {
    id: "GAS-87812",
    date: "2024-04-21",
    cylinderType: "14.2kg Cylinder",
    amount: 1100,
    status: "Delivered",
  },
  {
    id: "GAS-87705",
    date: "2024-03-18",
    cylinderType: "14.2kg Cylinder",
    amount: 1050,
    status: "Delivered",
  },
  {
    id: "GAS-87640",
    date: "2024-02-11",
    cylinderType: "5kg Cylinder",
    amount: 450,
    status: "Delivered",
  },
  {
    id: "GAS-87555",
    date: "2024-01-05",
    cylinderType: "14.2kg Cylinder",
    amount: 1050,
    status: "Delivered",
  },
];

export default function HistoryPage() {
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
            <CardDescription>You have made {orders.length} orders in total.</CardDescription>
          </CardHeader>
          <CardContent>
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
                    <TableCell>{order.cylinderType}</TableCell>
                    <TableCell className="text-right">
                      ₹{order.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={cn(
                          order.status === "Delivered" &&
                            "bg-accent text-accent-foreground hover:bg-accent/80",
                          order.status === "Pending" &&
                            "bg-yellow-500/20 text-yellow-700",
                          order.status === "Cancelled" && "bg-red-500/20 text-red-700"
                        )}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
