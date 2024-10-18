"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/app/components/Navbar";

import { useRouter } from "next/navigation";

const ShoeSellingForm = ({
  id,
  shoeImage,
  shoeId,
  sku,
  name,
  size,
  price,
  priceSale: initialPriceSale,
  owner,
  location,
  soldBy: initialSoldBy,
  soldAt: initialSoldAt,
  soldTo: initialSoldTo,
}) => {
  const [formPrice, setFormPrice] = useState(price);
  const [priceSale, setPriceSale] = useState(initialPriceSale || "");
  const [profit, setProfit] = useState(0);
  const [profitToPut, setProfitToPut] = useState(profit);

  const [commissions, setCommissions] = useState({
    fitz: 0,
    bryan: 0,
    ashley: 0,
  });
  const [soldBy, setSoldBy] = useState(initialSoldBy || "");
  const [soldAt, setSoldAt] = useState(initialSoldAt || "");
  const [soldTo, setSoldTo] = useState(initialSoldTo || "");
  const [dateSold, setDateSold] = useState(
    new Date().toLocaleDateString("en-US")
  );
  const router = useRouter();

  const players = ["Fitz", "Bryan", "Ashley"];

  useEffect(() => {
    const newProfit = priceSale - formPrice;
    setProfit(newProfit);
    calculateCommissions(newProfit);
  }, [priceSale, formPrice, soldBy, soldAt]);

  const calculateCommissions = (newProfit) => {
    let newCommissions = { fitz: 0, bryan: 0, ashley: 0 };

    if (soldAt === "Store") {
      if (owner === soldBy) {
        newCommissions[owner.toLowerCase()] = newProfit * 0.8;
        players.forEach((player) => {
          if (player.toLowerCase() !== owner.toLowerCase()) {
            newCommissions[player.toLowerCase()] = newProfit * 0.1;
          }
        });
      } else {
        newCommissions[owner.toLowerCase()] = newProfit * 0.45;
        newCommissions[soldBy.toLowerCase()] = newProfit * 0.45;
        players.forEach((player) => {
          if (
            player.toLowerCase() !== owner.toLowerCase() &&
            player.toLowerCase() !== soldBy.toLowerCase()
          ) {
            newCommissions[player.toLowerCase()] = newProfit * 0.1;
          }
        });
      }
    } else if (soldAt === "Sneakergram" || soldAt === "Sneakfits") {
      if (owner === soldBy) {
        newCommissions[owner.toLowerCase()] = newProfit;
      } else {
        newCommissions[owner.toLowerCase()] = newProfit * 0.5;
        newCommissions[soldBy.toLowerCase()] = newProfit * 0.5;
      }
    } else if (soldAt === "Marketplace") {
      if (owner === soldBy) {
        newCommissions[owner.toLowerCase()] = newProfit;
      } else {
        newCommissions[owner.toLowerCase()] = newProfit * 0.5;
        newCommissions[soldBy.toLowerCase()] = newProfit * 0.5;
      }
    } else if (soldAt === "Random") {
      if (owner === soldBy) {
        newCommissions[owner.toLowerCase()] = newProfit * 0.4;
        setSoldBy(owner);
        players.forEach((player) => {
          if (player.toLowerCase() !== owner.toLowerCase()) {
            newCommissions[player.toLowerCase()] = newProfit * 0.3;
          }
        });
      }
    }

    setCommissions(newCommissions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!priceSale || !soldBy || !soldAt || !soldTo) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const putData = {
        newAvailability: "sold",
        newPriceSale: priceSale,
        newSoldBy: soldBy,
        newSoldAt: soldAt,
        newSoldTo: soldTo,
        newCommission: {
          fitz: commissions.fitz,
          bryan: commissions.bryan,
          ashley: commissions.ashley,
          sneakergram: 0, // Add this if needed
          sneakfits: 0, // Add this if needed
          profit: profit,
          dateSold: dateSold,
        },
      };

      const response = await fetch(`http://localhost:3000/api/shoes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(putData),
      });

      if (!response.ok) {
        throw new Error("Failed to update shoe availability");
      }

      const result = await response.json();
      alert("Shoe sold successfully and inventory updated!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error processing shoe sale:", error);
      alert("Failed to process shoe sale. Please try again.");
    }
  };

  const renderCommissions = () => (
    <Card className="shadow-lg rounded-lg p-6 ">
      <CardHeader>
        <CardTitle>Sale Summary</CardTitle>
        <CardDescription>
          View the sale summary and commission breakdown
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Sold Price</Label>
            <div className="mt-1 text-2xl font-bold">₱{priceSale}</div>
          </div>
          <div>
            <Label>Profit</Label>
            <div className="mt-1 text-2xl font-bold text-green-600">
              ₱{profit !== null ? profit.toFixed(2) : "N/A"}
            </div>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {Object.keys(commissions).map((key) => (
            <div key={key}>
              <div className="flex flex-col mb-4 gap-1">
                <Label>{`${
                  key.charAt(0).toUpperCase() + key.slice(1)
                } Commission`}</Label>
              </div>
              <div className="mt-1 text-2xl font-bold">
                ₱{commissions[key].toFixed(2)}{" "}
                {/* Update the commission value accordingly */}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/30">
      <div className="flex flex-col">
        <Navbar />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="mx-auto grid max-w-[59rem] flex-1 auto-rows-max gap-4">
            <div className="flex items-center gap-4 mt-5">
              <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                Shoe Selling Form
              </h1>
              <Badge variant="outline" className="ml-auto sm:ml-0">
                New Entry
              </Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Shoe Information</CardTitle>
                  <CardDescription>
                    Enter the details of the shoe you're selling
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Shoe Name</Label>
                      <Input
                        value={name}
                        id="name"
                        type="text"
                        disabled
                        placeholder="Enter shoe name"
                      />
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                          value={sku}
                          id="sku"
                          type="text"
                          disabled
                          placeholder="Enter SKU"
                        />
                      </div>
                      <div>
                        <Label htmlFor="id">Shoe ID</Label>
                        <Input
                          value={shoeId}
                          id="id"
                          type="text"
                          placeholder="Enter shoe ID"
                          disabled
                        />
                      </div>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="price">Price</Label>
                        <Input
                          value={price}
                          id="price"
                          type="number"
                          disabled
                          placeholder="Enter price"
                        />
                      </div>
                      <div>
                        <Label htmlFor="sale-price">Sale Price</Label>
                        <Input
                          value={priceSale}
                          onChange={(e) => setPriceSale(e.target.value)}
                          id="sale-price"
                          type="number"
                          placeholder="Enter sale price"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        value={location}
                        id="location"
                        type="text"
                        disabled
                        placeholder="Enter location"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Shoe Image</CardTitle>
                  <CardDescription>
                    an image of the shoe you're selling right now
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <img
                      alt="Shoe image"
                      className="aspect-square h-auto w-full rounded-md object-contain"
                      src={shoeImage || "/shoeImages/air-max-90.png"}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
                <CardDescription>
                  Enter the order details and view commissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="owner">Owner</Label>
                    <Select value={owner} disabled>
                      <SelectTrigger id="owner">
                        <SelectValue placeholder="Select owner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fitz">Fitz</SelectItem>
                        <SelectItem value="Bryan">Bryan</SelectItem>
                        <SelectItem value="Ashley">Ashley</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sold-by">Sold By</Label>
                    <Select value={soldBy} onValueChange={setSoldBy}>
                      <SelectTrigger id="sold-by">
                        <SelectValue placeholder="Select seller" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fitz">Fitz</SelectItem>
                        <SelectItem value="Bryan">Bryan</SelectItem>
                        <SelectItem value="Ashley">Ashley</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sold-at">Sold At</Label>
                    <Select value={soldAt} onValueChange={setSoldAt}>
                      <SelectTrigger id="sold-at">
                        <SelectValue placeholder="Select where it was sold" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Store">Store</SelectItem>

                        <SelectItem value="Sneakergram">Sneakergram</SelectItem>
                        <SelectItem value="Sneakfits">Sneakfits</SelectItem>
                        <SelectItem value="Marketplace">Marketplace</SelectItem>
                        <SelectItem value="Random">Random Walk</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sold-to">Sold To</Label>
                    <Input
                      value={soldTo}
                      onChange={(e) => setSoldTo(e.target.value)}
                      id="sold-to"
                      type="text"
                      placeholder="Enter buyer's name"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Sale Summary</CardTitle>
                <CardDescription>
                  View the sale summary and commission breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>{renderCommissions()}</CardContent>
            </Card>
            <div className="flex justify-end gap-4 mb-6">
              <Link href={"/dashboard"}>
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button onClick={handleSubmit} className="text-white">
                Sold Shoe
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ShoeSellingForm;
