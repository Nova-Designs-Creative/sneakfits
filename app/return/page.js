"use client";

import React, { useEffect, useState } from "react";
import { ArrowUpDown, Search, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Navbar from "../components/Navbar";
import Link from "next/link";
import ShoesRow from "./components/ShoesRow";
import { Label } from "@/components/ui/label";
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
  const [selectedTab, setSelectedTab] = useState("sold");
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedShoe, setSelectedShoe] = useState(null);
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
      });
  }, []);

  useEffect(() => {
    let filtered = shoes;

    if (selectedTab === "sold") {
      filtered = shoes.filter((shoe) => shoe.availability === "sold");
    }

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
    setCurrentPage(1);
  }, [selectedTab, searchQuery, shoes]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

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

  const openReturnModal = (shoe) => {
    setShowReturnModal(true);
    setSelectedShoe(shoe);
  };

  const closeReturnModal = () => {
    setShowReturnModal(false);
    setSelectedShoe(null);
  };

  const onReturn = (selectedShoe) => {
    fetch(`https://sneakfits.vercel.app/api/shoes?id=${selectedShoe._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        newCommission: {
          fitz: 0,
          bryan: 0,
          ashley: 0,
          sneakergram: 0,
          sneakfits: 0,
          profit: 0,
          dateSold: null,
        },
        newAvailability: "available",
        soldAt: null,
        soldBy: null,
        soldTo: null,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        closeReturnModal();
        // Update shoes state with the returned shoe data

        // Use router.push to navigate after the update
        router.push("/dashboard").catch((error) => {
          console.error("Error navigating:", error);
        });
      })
      .catch((error) => console.error("Error returning shoe:", error));
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
          <main className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">
                {" "}
                Return Shoes
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                type="search"
                placeholder="Search Shoe Name..."
                className="max-w"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" className="text-white">
                <Search className="mr-2 h-4 w-4 text-white" />
                Search
              </Button>
            </div>

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
                          onReturn={() => openReturnModal(shoe)}
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
          </main>

          {showReturnModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <Card className="w-[350px] mt-5">
                <CardHeader>
                  <CardTitle>Return Shoe</CardTitle>
                  <CardDescription>
                    Are you sure you want to return this shoe?
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
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={closeReturnModal}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    className="bg-blue-500"
                    onClick={() => onReturn(selectedShoe)}
                  >
                    Return
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
