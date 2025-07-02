"use client";

import * as React from "react";
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

const cylinderTypes = [
  {
    id: "5kg",
    name: "5kg Cylinder",
    price: "₹450",
    description: "Ideal for small families and bachelors.",
  },
  {
    id: "14.2kg",
    name: "14.2kg Cylinder",
    price: "₹1100",
    description: "Standard household cylinder for regular use.",
  },
  {
    id: "19kg",
    name: "19kg Cylinder",
    price: "₹2200",
    description: "Commercial size, suitable for restaurants.",
  },
];

export default function BookingPage() {
  const [selectedCylinder, setSelectedCylinder] = React.useState("14.2kg");
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <AppShell>
      <div className="flex-1 space-y-8 p-4 md:p-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Book Your Gas Cylinder</h1>
            <p className="text-muted-foreground">
              Select your cylinder, choose a delivery slot, and we'll be at your doorstep.
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
                <RadioGroup
                  value={selectedCylinder}
                  onValueChange={setSelectedCylinder}
                  className="grid gap-6 md:grid-cols-3"
                >
                  {cylinderTypes.map((type) => (
                    <Label
                      key={type.id}
                      htmlFor={type.id}
                      className="cursor-pointer"
                    >
                      <Card className={`ring-2 ${selectedCylinder === type.id ? 'ring-primary' : 'ring-transparent'}`}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-lg font-medium">{type.name}</CardTitle>
                          <RadioGroupItem value={type.id} id={type.id} className="translate-y-[-12px]" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{type.price}</div>
                          <p className="text-xs text-muted-foreground">{type.description}</p>
                        </CardContent>
                      </Card>
                    </Label>
                  ))}
                </RadioGroup>
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
                    disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">Available Time Slots</h3>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (9 AM - 12 PM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (1 PM - 4 PM)</SelectItem>
                      <SelectItem value="evening">Evening (5 PM - 8 PM)</SelectItem>
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
                  <span>{cylinderTypes.find(c => c.id === selectedCylinder)?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price</span>
                  <span>{cylinderTypes.find(c => c.id === selectedCylinder)?.price || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="text-accent-foreground font-semibold">Free</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>{cylinderTypes.find(c => c.id === selectedCylinder)?.price || 'N/A'}</span>
                </div>
                <Button size="lg" className="w-full mt-4">
                  <Flame className="mr-2 h-5 w-5" />
                  Book Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
