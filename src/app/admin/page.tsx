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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { FilePlus2, PlusCircle } from "lucide-react";

const bookings = [
  {
    id: "GAS-91384",
    customer: "Ravi Kumar",
    date: "2024-07-28",
    time: "Morning",
    type: "14.2kg",
    status: "Pending",
  },
  {
    id: "GAS-91383",
    customer: "Sunita Sharma",
    date: "2024-07-28",
    time: "Afternoon",
    type: "14.2kg",
    status: "Confirmed",
  },
  {
    id: "GAS-91382",
    customer: "Amit Singh",
    date: "2024-07-27",
    time: "Evening",
    type: "5kg",
    status: "Out for Delivery",
  },
];

const cylinders = [
  { id: 1, type: "5kg Cylinder", stock: 150, price: 450 },
  { id: 2, type: "14.2kg Cylinder", stock: 320, price: 1100 },
  { id: 3, type: "19kg Cylinder", stock: 85, price: 2200 },
];

export default function AdminPage() {
  return (
    <AppShell>
      <div className="flex-1 space-y-8 p-4 md:p-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time Slot</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
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
                            variant={booking.status === 'Pending' ? 'destructive' : 'default'}
                          >
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            Manage
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                        <TableCell className="font-semibold">{cylinder.type}</TableCell>
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
