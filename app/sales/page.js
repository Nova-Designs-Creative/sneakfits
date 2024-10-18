"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";
import Navbar from "../components/Navbar";
import MonthlySalesChart from "./MonthlySalesChart";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
const BrandCard = ({ brand, data }) => (
  <Card className="max-w">
    <CardHeader className="space-y-0 pb-0">
      <CardDescription>{brand}</CardDescription>
      <CardTitle className="flex items-baseline gap-1 text-4xl tabular-nums">
        ₱ {data.profit.toLocaleString()}
        <span className="font-sans text-sm font-normal tracking-normal text-muted-foreground">
          profit
        </span>
      </CardTitle>
    </CardHeader>

    <CardContent className="pt-4">
      <div className="flex justify-between text-sm">
        <div>Revenue: ₱{data.revenue.toLocaleString()}</div>
        <div>Shoes Sold: +{data.shoesSold}</div>
      </div>
    </CardContent>
  </Card>
);

export default function SalesAnalyticsDashboard() {
  const { data: session, status } = useSession();
  const [dateRange, setDateRange] = useState("1 week");
  const [shoes, setShoes] = useState([]);
  const [dateRangeText, setDateRangeText] = useState("");
  const [brandData, setBrandData] = useState({});

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSold, setTotalSold] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalInventory, setTotalInventory] = useState(0);
  const [showAlert, setShowAlert] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        router.push("/auth/signIn");
      }, 3000);
    }
  }, [status, router]);

  useEffect(() => {
    fetch("http://localhost:3000/api/shoes", {
      method: "GET",
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_AUTH_SECRET,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setShoes(data);
        } else {
          console.error("Fetched data is not an array:", data);
          setShoes([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching shoes:", error);
        setShoes([]);
      });
  }, []);

  const getDateRange = (range) => {
    const now = new Date();
    let start, end;

    const dateOptions = { year: "numeric", month: "short", day: "numeric" };

    switch (range) {
      case "1 week":
        const dayOfWeek = now.getDay();
        const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        start = new Date(now);
        start.setDate(now.getDate() - diffToMonday);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        break;
      case "1 month":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case "3 months":
        start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case "1 year":
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        break;
      case "YTD":
        start = new Date(now.getFullYear(), 0, 1);
        end = now;
        break;
      default:
        start = new Date(0);
        end = now;
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    setDateRangeText(
      `${start.toLocaleDateString(
        "en-US",
        dateOptions
      )} - ${end.toLocaleDateString("en-US", dateOptions)}`
    );

    return { start, end };
  };

  const filterShoesByDateRange = (shoes, range) => {
    const { start, end } = getDateRange(range);
    return shoes.filter((shoe) => {
      const shoeDate = new Date(shoe.updatedAt);
      return (
        shoeDate >= start && shoeDate <= end && shoe.availability === "sold"
      );
    });
  };

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
    updateData(newRange);
  };

  const updateData = (range) => {
    const filteredShoes = filterShoesByDateRange(shoes, range);
    const brands = ["fitz", "bryan", "ashley"];

    const newBrandData = brands.reduce((acc, brand) => {
      const brandShoes = filteredShoes.filter(
        (shoe) => shoe.soldBy.toLowerCase() === brand.toLowerCase()
      );

      acc[brand] = {
        revenue: brandShoes.reduce((sum, shoe) => sum + shoe.priceSale, 0),
        profit: filteredShoes.reduce(
          (sum, shoe) => sum + (shoe.commission[brand] || 0),
          0
        ),
        shoesSold: brandShoes.length,
        chartData: generateChartData(brandShoes, range, brand),
      };
      return acc;
    }, {});

    setBrandData(newBrandData);

    setTotalRevenue(
      brands.reduce((sum, brand) => sum + newBrandData[brand].revenue, 0)
    );
    setTotalProfit(
      filteredShoes.reduce(
        (sum, shoe) => sum + (shoe.commission.profit || 0),
        0
      )
    );
    setTotalSold(
      brands.reduce((sum, brand) => sum + newBrandData[brand].shoesSold, 0)
    );
    setTotalInventory(
      shoes.filter((shoe) => shoe.availability === "available").length
    );
  };

  const generateChartData = (shoes, range, brand) => {
    const { start, end } = getDateRange(range);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    const dataPoints = Array.from({ length: days }, (_, i) => {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      return {
        date: date.toISOString().split("T")[0],
        revenue: 0,
        profit: 0,
        shoes: 0,
      };
    });

    shoes.forEach((shoe) => {
      const shoeDate = new Date(shoe.updatedAt);
      const index = Math.floor((shoeDate - start) / (1000 * 60 * 60 * 24));
      if (index >= 0 && index < days) {
        dataPoints[index].revenue += shoe.priceSale;
        dataPoints[index].profit += shoe.commission[brand] || 0;
        dataPoints[index].shoes += 1;
      }
    });

    let cumulativeRevenue = 0;
    let cumulativeProfit = 0;
    let cumulativeShoes = 0;

    return dataPoints.map((point) => {
      cumulativeRevenue += point.revenue;
      cumulativeProfit += point.profit;
      cumulativeShoes += point.shoes;

      return {
        ...point,
        profit: cumulativeProfit,
        revenue: cumulativeRevenue,

        shoes: cumulativeShoes,
      };
    });
  };

  useEffect(() => {
    if (shoes.length > 0) {
      updateData(dateRange);
    }
  }, [shoes, dateRange]);

  return (
    <div>
      {showAlert && (
        <div className="fixed top-0 left-0 w-full bg-red-500 text-white text-center py-4 z-50">
          <p>Please login to access the dashboard.</p>
        </div>
      )}

      {status === "authenticated" && (
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₱{totalRevenue.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">
                    Total Profit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₱{totalProfit.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">
                    Total Shoes Sold
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    +{totalSold.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row md:items-center md:justify-between justify-start pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">
                    Total Inventory
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    +{totalInventory.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div></div>
            <div className="flex flex-col md:flex-row justify-between items-start mb-4">
              <div className="space-y-1 mt-4 md:mt-0">
                <div className="font-medium mb-2">Date Range</div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="w-full" variant="outline">
                      {dateRange} <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onSelect={() => handleDateRangeChange("1 week")}
                    >
                      1 week
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => handleDateRangeChange("1 month")}
                    >
                      1 month
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => handleDateRangeChange("3 months")}
                    >
                      3 months
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => handleDateRangeChange("1 year")}
                    >
                      1 year
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => handleDateRangeChange("YTD")}
                    >
                      YTD
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="text-sm text-muted-foreground">
                  {dateRangeText}
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              {Object.entries(brandData).map(([brand, data]) => (
                <>
                  <BrandCard key={brand} brand={brand} data={data} />
                </>
              ))}
            </div>

            <MonthlySalesChart chartData={shoes} />
          </main>
        </div>
      )}
    </div>
  );
}
