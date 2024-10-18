"use client";

import React, { useEffect, useState } from "react";
import { ArrowUpDown, Search, ListFilter, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "../components/Navbar";
import Link from "next/link";
import ShoesRow from "./components/ShoesRow";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Component() {
  const { data: session, status } = useSession();
  const [shoes, setShoes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredShoes, setFilteredShoes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortColumn, setSortColumn] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedTab, setSelectedTab] = useState("available"); // New state for selected tab
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedShoe, setSelectedShoe] = useState(null);
  const [missingStoreShoes, setMissingStoreShoes] = useState([]);
  const [showAlert, setShowAlert] = useState(false); // New state to handle alert
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      setShowAlert(true);
      const timer = setTimeout(() => {
        router.push("/auth/signIn");
      }, 3000);

      // Cleanup the timeout to prevent memory leaks
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  useEffect(() => {
    fetch("https://sneakfits.vercel.app/api/shoes", {
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

          // Group shoes by SKU
          const shoesBySku = data.reduce((acc, shoe) => {
            if (!acc[shoe.sku]) acc[shoe.sku] = [];
            acc[shoe.sku].push(shoe);
            return acc;
          }, {});

          // Find SKUs where there's no available shoe at the store but there's an available shoe at the house
          const missingSku = Object.entries(shoesBySku).filter(
            ([sku, shoes]) => {
              const noAvailableAtStore = !shoes.some(
                (shoe) =>
                  shoe.location.toLowerCase() === "store" &&
                  shoe.availability === "available"
              );
              const availableAtHouse = shoes.some(
                (shoe) =>
                  shoe.location.toLowerCase() === "house" &&
                  shoe.availability === "available"
              );

              return noAvailableAtStore && availableAtHouse;
            }
          );

          // Get the first shoe of each missing SKU for notification
          const missing = missingSku.map(([sku, shoes]) => shoes[0]);

          setMissingStoreShoes(missing);
        } else {
          console.error("Fetched data is not an array:", data);
          setShoes([]);
          setFilteredShoes([]);
          setMissingStoreShoes([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching shoes:", error);
        setShoes([]);
        setFilteredShoes([]);
        setMissingStoreShoes([]);
      });
  }, []);

  // Implement filtering based on selected tab
  useEffect(() => {
    let filtered = shoes;

    if (selectedTab === "available") {
      filtered = shoes.filter((shoe) => shoe.availability === "available");
    } else if (selectedTab === "sold") {
      filtered = shoes.filter((shoe) => shoe.availability === "sold");
    }

    // Apply search filtering on the currently filtered shoes
    if (searchQuery) {
      filtered = filtered.filter(
        (shoe) =>
          shoe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shoe.shoeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shoe.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shoe.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shoe.owner.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredShoes(filtered);
    setCurrentPage(1); // Reset to first page on new tab selection or search
  }, [selectedTab, searchQuery, shoes]);

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

    const sortedData = [...filteredShoes].sort((a, b) => {
      if (a[column] < b[column]) return direction === "asc" ? -1 : 1;
      if (a[column] > b[column]) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredShoes(sortedData);
  };

  const totalPages = Math.ceil(filteredShoes.length / itemsPerPage);
  const currentShoes = filteredShoes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Function to handle opening the delete modal
  const openDeleteModal = (shoe) => {
    setShowDeleteModal(true);
    setSelectedShoe(shoe);
  };

  // Function to close the delete modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedShoe(null);
  };

  const onDelete = (selectedShoe) => {
    fetch(`https://sneakfits.vercel.app/api/shoes?id=${selectedShoe._id}`, {
      method: "DELETE",
    })
      .then(() => {
        closeDeleteModal();

        setShoes(shoes.filter((shoe) => shoe._id !== selectedShoe._id));
        router.refresh();
      })

      .catch((error) => console.error("Error deleting shoe:", error));
  };

  return (
    <div>
      {showAlert && (
        <div className="fixed top-0 left-0 w-full bg-red-500 text-white text-center py-4 z-50">
          <p>Please login to access the dashboard.</p>
        </div>
      )}
      {status === "authenticated" && (
        <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
          <Navbar />
          {missingStoreShoes.length > 0 && (
            <div className="flex flex-col items-center justify-center bg-red-500 p-4">
              {missingStoreShoes.map((shoe, index) => (
                <div key={index} className="text-white text-center">
                  No Shoes Displayed at Store. Shoe Name: {shoe.name}, Shoe SKU:{" "}
                  {shoe.sku}
                </div>
              ))}
            </div>
          )}

          <main className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Products</h2>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                type="search"
                placeholder="Search Shoe Name..."
                className="max-w"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} // Update searchQuery state
              />
              <Button type="submit" className="text-white">
                <Search className="mr-2 h-4 w-4 text-white" />
                Search
              </Button>
            </div>
            <Tabs defaultValue="available" className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <TabsList className="flex flex-wrap items-center justify-center">
                  <TabsTrigger
                    value="available"
                    onClick={() => setSelectedTab("available")}
                  >
                    Available
                  </TabsTrigger>
                  <TabsTrigger
                    value="sold"
                    onClick={() => setSelectedTab("sold")}
                  >
                    Sold
                  </TabsTrigger>
                  <TabsTrigger
                    value="all"
                    onClick={() => setSelectedTab("all")}
                  >
                    All
                  </TabsTrigger>
                </TabsList>

                <div className="mt-4 md:mt-0 md:ml-auto flex items-center space-x-2 justify-between">
                  <Link href={"/addShoes"}>
                    <Button size="sm" className="flex h-8 text-white">
                      <PlusCircle className="mr-2 h-4 w-4 text-white" />
                      Add Product
                    </Button>
                  </Link>
                </div>
              </div>

              <TabsContent value={selectedTab} className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
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
                            onClick={() => handleSort("price_sale")}
                            className={`table-cell cursor-pointer ${
                              sortColumn === "price_sale" ? "text-blue-500" : ""
                            }`}
                          >
                            <div className="flex flex-row items-center gap-2">
                              Sale Price
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
                          <TableHead className={"table-cell cursor-pointer"}>
                            <div className="flex flex-row items-center gap-2">
                              Actions
                            </div>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentShoes.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center">
                              No results found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          currentShoes.map((shoe) => (
                            <ShoesRow
                              key={shoe.shoeId}
                              shoesRowData={shoe}
                              onDelete={() => openDeleteModal(shoe)}
                            />
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div>
                      <span>
                        Page {currentPage} of {totalPages}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        disabled={currentPage === 1}
                        variant="outline"
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        Prev
                      </Button>
                      <Button
                        disabled={currentPage === totalPages}
                        variant="outline"
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </main>

          {showDeleteModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <Card className="w-[350px] mt-5">
                <CardHeader>
                  <CardTitle>Delete Shoe</CardTitle>
                  <CardDescription>
                    Are you sure you want to delete this shoe?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label>Shoe Id</Label>
                      <Input value={selectedShoe?.shoeId} disabled />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label>Name</Label>
                      <Input value={selectedShoe?.name} disabled />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label>SKU</Label>
                      <Input value={selectedShoe?.sku} disabled />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label>Owner</Label>
                      <Input value={selectedShoe?.owner} disabled />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label>Location</Label>
                      <Input value={selectedShoe?.location} disabled />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label>Availability</Label>
                      <Input value={selectedShoe?.availability} disabled />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={closeDeleteModal}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => onDelete(selectedShoe)}
                  >
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
