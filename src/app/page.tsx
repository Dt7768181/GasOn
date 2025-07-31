"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Flame } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "../../firebase-config.js";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  DocumentData,
} from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface CylinderType extends DocumentData {
  id: string;
  name: string;
  price: number;
  description: string;
  stock: number;
  deliveryCharge: number;
}

export default function BookingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, role } = useAuth();

  const [cylinderTypes, setCylinderTypes] = React.useState<CylinderType[]>([]);
  const [loadingCylinders, setLoadingCylinders] = React.useState(true);
  const [selectedCylinder, setSelectedCylinder] = React.useState("14.2kg");
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [timeSlot, setTimeSlot] = React.useState("");

  React.useEffect(() => {
    const fetchCylinders = async () => {
      setLoadingCylinders(true);
      try {
        const querySnapshot = await getDocs(collection(db, "cylinders"));
        const fetchedCylinders = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as CylinderType[];
        fetchedCylinders.sort((a,b) => a.price - b.price);
        setCylinderTypes(fetchedCylinders);
      } catch (error) {
        console.error("Error fetching cylinders:", error);
        toast({
          title: "Error",
          description: "Could not load cylinder types.",
          variant: "destructive",
        });
      } finally {
        setLoadingCylinders(false);
      }
    };
    fetchCylinders();
  }, [toast]);

  const currentCylinder = React.useMemo(
    () => cylinderTypes.find((c) => c.id === selectedCylinder),
    [cylinderTypes, selectedCylinder]
  );

  const totalPrice = React.useMemo(() => {
    if (!currentCylinder) return null;
    return parseFloat(currentCylinder.price.toString()) + currentCylinder.deliveryCharge;
  }, [currentCylinder]);

  const handleBooking = async () => {
    if (role !== "customer" || !user) {
      toast({
        title: "Please Login",
        description: "You need to be logged in to book a cylinder.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    if (!timeSlot) {
      toast({
        title: "Missing Information",
        description: "Please select a delivery time slot.",
        variant: "destructive",
      });
      return;
    }

    if (!currentCylinder || currentCylinder.stock <= 0) {
      toast({
        title: "Out of Stock",
        description: "This cylinder type is currently unavailable.",
        variant: "destructive",
      });
      return;
    }

    if (!date) {
      toast({
        title: "Missing Information",
        description: "Please select a delivery date.",
        variant: "destructive",
      });
      return;
    }

    try {
      const orderId = `GAS-${Math.floor(10000 + Math.random() * 90000)}`;

      await addDoc(collection(db, "bookings"), {
        id: orderId,
        userId: user.phone,
        customer: user.fullName,
        customerEmail: user.email,
        date: date.toISOString().split("T")[0],
        time: timeSlot,
        type: currentCylinder.name,
        cylinderId: selectedCylinder,
        amount: totalPrice,
        status: "Pending",
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Booking Created!",
        description: `Redirecting to checkout for order ${orderId}.`,
      });

      router.push(`/checkout?orderId=${orderId}`);
    } catch (error) {
      console.error("Error creating booking: ", error);
      toast({
        title: "Booking Failed",
        description: "There was an error placing your order. Please try again.",
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
              Book Your Gas Cylinder
            </h1>
            <p className="text-muted-foreground">
              Select your cylinder, choose a delivery slot, and we'll be at your
              doorstep.
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>1. Select Cylinder Type</CardTitle>
                <CardDescription>
                  Choose the size that best fits your needs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingCylinders ? (
                  <div className="grid gap-6 md:grid-cols-3">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                  </div>
                ) : (
                  <RadioGroup
                    value={selectedCylinder}
                    onValueChange={setSelectedCylinder}
                    className="grid gap-6 md:grid-cols-3"
                  >
                    {cylinderTypes.map((type) => (
                      <Label
                        key={type.id}
                        htmlFor={type.id}
                        className={cn(
                          "cursor-pointer",
                          type.stock <= 0 && "cursor-not-allowed opacity-50"
                        )}
                      >
                        <Card
                          className={cn(
                            "ring-2",
                            selectedCylinder === type.id
                              ? "ring-primary"
                              : "ring-transparent",
                            type.stock <= 0 && "bg-muted"
                          )}
                        >
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-medium">
                              {type.name}
                            </CardTitle>
                            <RadioGroupItem
                              value={type.id}
                              id={type.id}
                              className="translate-y-[-12px]"
                              disabled={type.stock <= 0}
                            />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              ₹{type.price}
                            </div>
                            {type.stock > 0 ? (
                              <p className="text-xs text-muted-foreground">
                                {type.description}
                              </p>
                            ) : (
                              <p className="text-xs font-semibold text-destructive mt-2">
                                Out of Stock
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      </Label>
                    ))}
                  </RadioGroup>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Select Delivery Slot</CardTitle>
                <CardDescription>
                  Pick a convenient date and time for your delivery.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                    disabled={(date) =>
                      date <
                      new Date(new Date().setDate(new Date().getDate() - 1))
                    }
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">Available Time Slots</h3>
                  <Select value={timeSlot} onValueChange={setTimeSlot}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Morning">
                        Morning (9 AM - 12 PM)
                      </SelectItem>
                      <SelectItem value="Afternoon">
                        Afternoon (1 PM - 4 PM)
                      </SelectItem>
                      <SelectItem value="Evening">
                        Evening (5 PM - 8 PM)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Cylinder Type</span>
                  <span>{currentCylinder?.name || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price</span>
                  <span>₹{currentCylinder?.price?.toFixed(2) || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span>
                    ₹
                    {currentCylinder?.deliveryCharge
                      ? currentCylinder.deliveryCharge.toFixed(2)
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>
                    ₹{totalPrice !== null ? totalPrice.toFixed(2) : "N/A"}
                  </span>
                </div>
                <Button
                  size="lg"
                  className="w-full mt-4"
                  onClick={handleBooking}
                  disabled={
                    !timeSlot || !currentCylinder || currentCylinder.stock <= 0
                  }
                >
                  <Flame className="mr-2 h-5 w-5" />
                  {currentCylinder?.stock ?? 0 > 0 ? "Book Now" : "Out of Stock"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
