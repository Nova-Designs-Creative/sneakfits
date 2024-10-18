"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Activity,
  ArrowUpDown,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  CircleUser,
  CreditCard,
  DollarSign,
  Menu,
  Package2,
  Search,
  Sidebar,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "../components/Navbar";
import ShoesRow from "./components/ShoesRow";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [shoes, setShoes] = useState([]);
  const [filteredShoes, setFilteredShoes] = useState([]);
  const [soldShoes, setSoldShoes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState("1m");
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSold, setTotalSold] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalInventory, setTotalInventory] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [dateRangeText, setDateRangeText] = useState("");
  const itemsPerPage = 5;
  const [showAlert, setShowAlert] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        router.push("/auth/signIn");
      }, 3000);
    } else if (status === "authenticated") {
      fetchShoesData();
    }
  }, [status, router]);

  const fetchShoesData = async () => {
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
          setFilteredShoes(data);
          updateShoeCounts(data);
          handleDateRangeChange("1m");
        } else {
          console.error("Fetched data is not an array:", data);
          setShoes([]);
          setFilteredShoes([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching shoes:", error);
        setShoes([]);
        setFilteredShoes([]);
      })
      .finally(() => setIsLoading(false));
  };

  const getDateRange = (range) => {
    const now = new Date();
    let start, end;

    const dateOptions = { year: "numeric", month: "short", day: "numeric" };

    switch (range) {
      case "1w":
        const dayOfWeek = now?.getDay();

        // Calculate the start of the week (Monday)
        const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        start = new Date(now);
        start.setDate(now?.getDate() - diffToMonday); // Adjust to Monday

        // Calculate the end of the week (Sunday)
        end = new Date(start);
        end.setDate(start?.getDate() + 6); // Add 6 days to Monday to get Sunday

        // Set the date range text from Monday to Sunday
        setDateRangeText(
          `${start.toLocaleDateString(
            "en-US",
            dateOptions
          )} - ${end?.toLocaleDateString("en-US", dateOptions)}`
        );
        break;
      case "1m":
        start = new Date(now?.getFullYear(), now?.getMonth(), 1);
        end = new Date(now?.getFullYear(), now?.getMonth() + 1, 0);
        setDateRangeText(
          `${start.toLocaleDateString(
            "en-US",
            dateOptions
          )} - ${end.toLocaleDateString("en-US", dateOptions)}`
        );
        break;
      case "3m":
        start = new Date(now?.getFullYear(), now?.getMonth() - 2, 1); // First day of 3 months ago
        end = new Date(now?.getFullYear(), now?.getMonth() + 1, 0); // Last day of current month
        setDateRangeText(
          `${start?.toLocaleDateString(
            "en-US",
            dateOptions
          )} - ${end?.toLocaleDateString("en-US", dateOptions)}`
        );

        break;
      case "1y":
        start = new Date(now?.getFullYear(), 0, 1); // First day of the current year
        end = new Date(now?.getFullYear(), 11, 31); // Last day of the current year
        setDateRangeText(
          `${start?.toLocaleDateString(
            "en-US",
            dateOptions
          )} - ${end?.toLocaleDateString("en-US", dateOptions)}`
        );

        break;
      case "ytd":
        start = new Date(now?.getFullYear(), 0, 1);
        end = now;
        setDateRangeText(
          `${start?.toLocaleDateString(
            "en-US",
            dateOptions
          )} - ${end?.toLocaleDateString("en-US", dateOptions)}`
        );
        break;
      default:
        start = new Date(0);
        end = now;
        setDateRangeText("All time");
    }

    start?.setHours(0, 0, 0, 0);
    end?.setHours(23, 59, 59, 999);

    return { start, end };
  };

  const filterShoesByDateRange = (shoes, range) => {
    if (!Array?.isArray(shoes)) {
      console.error("Shoes is not an array:", shoes);
      return [];
    }
    const { start, end } = getDateRange(range);
    const filteredShoes = shoes?.filter((shoe) => {
      const shoeDate = new Date(shoe?.updatedAt);
      return !isNaN(shoeDate) && shoeDate >= start && shoeDate <= end;
    });

    return filteredShoes;
  };

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
    const soldShoes =
      shoes?.filter((shoe) => shoe?.availability === "sold") || [];
    const filteredSoldShoes = filterShoesByDateRange(soldShoes, newRange);
    updateShoeCounts(shoes, filteredSoldShoes);
  };

  const updateShoeCounts = (allShoes, filteredSoldShoes) => {
    if (!Array?.isArray(allShoes)) {
      console.error("allShoes is not an array:", allShoes);
      return;
    }
    const availableShoes =
      allShoes?.filter((shoe) => shoe?.availability === "available") || [];

    setTotalInventory(availableShoes?.length);
    setSoldShoes(filteredSoldShoes);
    calculateTotalRevenue(filteredSoldShoes);
    calculateTotalSold(filteredSoldShoes);
    calculateTotalProfit(filteredSoldShoes);
  };

  const calculateTotalRevenue = (soldShoesList) => {
    if (!Array?.isArray(soldShoesList)) {
      console.error("soldShoesList is not an array:", soldShoesList);
      return;
    }
    const revenue = soldShoesList?.reduce(
      (sum, shoe) => sum + (shoe?.priceSale || 0),
      0
    );

    setTotalRevenue(revenue);
  };

  const calculateTotalSold = (soldShoesList) => {
    if (!Array?.isArray(soldShoesList)) {
      console.error("soldShoesList is not an array:", soldShoesList);
      return;
    }

    setTotalSold(soldShoesList?.length);
  };

  const calculateTotalProfit = (soldShoesList) => {
    if (!Array?.isArray(soldShoesList)) {
      console.error("soldShoesList is not an array:", soldShoesList);
      return;
    }
    const profit = soldShoesList?.reduce(
      (sum, shoe) => sum + (shoe?.commission?.profit || 0),
      0
    );

    setTotalProfit(profit);
  };

  // useEffect to handle shoe updates based on date range
  useEffect(() => {
    if (shoes) {
      const soldShoes = shoes.filter((shoe) => shoe.availability === "sold");
      const filteredSoldShoes = filterShoesByDateRange(soldShoes, dateRange);
      updateShoeCounts(shoes, filteredSoldShoes);
    }
  }, [shoes, dateRange]); // Runs when shoes or dateRange changes

  // Implement search logic here
  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);

    const filtered = shoes.filter(
      (shoe) =>
        shoe.name.toLowerCase().includes(query.toLowerCase()) ||
        shoe.shoeId.toLowerCase().includes(query.toLowerCase()) ||
        shoe.sku.toLowerCase().includes(query.toLowerCase()) ||
        shoe.location.toLowerCase().includes(query.toLowerCase()) ||
        shoe.owner.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredShoes(filtered);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Implement pagination logic here
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Implement sorting logic here
  const handleSort = (column) => {
    const direction =
      sortColumn === column && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortDirection(direction);

    const sortedData = [...shoes].sort((a, b) => {
      if (a[column] < b[column]) return direction === "asc" ? -1 : 1;
      if (a[column] > b[column]) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredShoes(sortedData);
  };

  const totalPages = Math.ceil(
    (filteredShoes?.length || shoes?.length) / itemsPerPage
  );

  const currentShoes = (filteredShoes?.length ? filteredShoes : shoes).slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      {showAlert && (
        <div className="fixed top-0 left-0 w-full bg-red-500 text-white text-center py-4 z-50">
          <p>Please login to access the dashboard.</p>
        </div>
      )}

      {status === "authenticated" && (
        <div className="flex min-h-screen w-full flex-col">
          <Navbar />

          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <Select value={dateRange} onValueChange={handleDateRangeChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1w">Last Week</SelectItem>
                  <SelectItem value="1m">Last Month</SelectItem>
                  <SelectItem value="3m">Last 3 Months</SelectItem>
                  <SelectItem value="1y">Last Year</SelectItem>
                  <SelectItem value="ytd">Year to Date</SelectItem>
                  <SelectItem value="custom">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₱{totalRevenue.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dateRangeText}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Sold
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold"> +{totalSold}</div>
                  <p className="text-xs text-muted-foreground">
                    {dateRangeText}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Profit
                  </CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₱{totalProfit.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dateRangeText}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Inventory
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+{totalInventory}</div>
                  <p className="text-xs text-muted-foreground"></p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader className="flex md:flex-row flex-col md:items-center items-start justify-between gap-5 md:gap-0">
                <div>
                  <CardTitle>Available Shoes</CardTitle>
                  <CardDescription>
                    Current available shoes from your inventory.
                  </CardDescription>
                </div>
                <div className="flex items-center md:w-auto w-full justify-between md:justify-end space-x-2 ">
                  <form className="ml-auto flex-1 sm:flex-initial">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search Shoe Name..."
                        className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                        value={searchQuery}
                        onChange={handleSearchChange} // Updated to handle search change
                      />
                    </div>
                  </form>
                  <Button asChild size="sm">
                    <Link href="/inventory" className="text-white">
                      View All
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        onClick={() => handleSort("id")}
                        className="table-cell cursor-pointer"
                      >
                        <div className="flex flex-row items-center justify-between">
                          Images <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead
                        onClick={() => handleSort("shoeId")}
                        className={`table-cell cursor-pointer ${
                          sortColumn === "shoeId" ? "text-blue-500" : ""
                        }`}
                      >
                        <div className="flex flex-row items-center gap-2 whitespace-nowrap">
                          Shoe ID
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead
                        onClick={() => handleSort("sku")}
                        className={`table-cell cursor-pointer ${
                          sortColumn === "sku" ? "text-blue-500" : ""
                        }`}
                      >
                        <div className="flex flex-row items-center gap-2 whitespace-nowrap">
                          SKU NO
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead
                        onClick={() => handleSort("name")}
                        className={`table-cell cursor-pointer ${
                          sortColumn === "name" ? "text-blue-500" : ""
                        }`}
                      >
                        <div className="flex flex-row items-center gap-2">
                          Name
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead
                        onClick={() => handleSort("size")}
                        className={`table-cell cursor-pointer ${
                          sortColumn === "size" ? "text-blue-500" : ""
                        }`}
                      >
                        <div className="flex flex-row items-center gap-2">
                          Size
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead
                        onClick={() => handleSort("price")}
                        className={`table-cell cursor-pointer ${
                          sortColumn === "price" ? "text-blue-500" : ""
                        }`}
                      >
                        <div className="flex flex-row items-center gap-2">
                          Price
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead
                        onClick={() => handleSort("priceSale")}
                        className={`table-cell cursor-pointer ${
                          sortColumn === "priceSale" ? "text-blue-500" : ""
                        }`}
                      >
                        <div className="flex flex-row items-center gap-2 whitespace-nowrap">
                          Price Sale
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead
                        onClick={() => handleSort("location")}
                        className={`table-cell cursor-pointer ${
                          sortColumn === "location" ? "text-blue-500" : ""
                        }`}
                      >
                        <div className="flex flex-row items-center gap-2">
                          Location
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead
                        onClick={() => handleSort("owner")}
                        className={`table-cell cursor-pointer ${
                          sortColumn === "owner" ? "text-blue-500" : ""
                        }`}
                      >
                        <div className="flex flex-row items-center gap-2">
                          Owner
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="table-cell cursor-pointer text-right
                    "
                      >
                        <div className="flex flex-row items-center gap-2">
                          Actions
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <ShoesRow shoesRowData={currentShoes} />
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <div className="flex justify-between mt-4">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                variant="outline"
              >
                Previous Page
              </Button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant="outline"
              >
                Next Page
              </Button>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
