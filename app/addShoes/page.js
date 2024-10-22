"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Check, ChevronsUpDown, Loader } from "lucide-react";
import { StockXAPI, StockXLocation } from "@vlourme/stockx-api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

function ShoeCombobox({
  value,
  setValue,
  setShoeImage,
  setSku,
  setBrand,
  externalSku,
}) {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [searchType, setSearchType] = useState("name");

  const fetchProducts = useCallback(async () => {
    const currentSearchTerm = searchType === "sku" ? externalSku : searchTerm;

    console.log("Fetching products with:", {
      searchTerm: currentSearchTerm,
      searchType,
      externalSku,
    });

    if (searchType === "name" && currentSearchTerm.length < 3) {
      console.log("Search term too short, clearing products");
      setProducts([]);
      return;
    }

    if (searchType === "sku" && !currentSearchTerm) {
      console.log("No SKU provided, clearing products");
      setProducts([]);
      return;
    }

    setIsSearching(true);
    const api = new StockXAPI(StockXLocation.US);

    try {
      const result = await api.searchProducts(currentSearchTerm, { limit: 20 });
      console.log("API response:", result);

      const filteredAndSortedProducts = result.hits
        .filter((product) => {
          if (searchType === "sku") {
            return product.sku
              .toLowerCase()
              .includes(currentSearchTerm.toLowerCase());
          } else {
            const title = product.title.toLowerCase();
            const terms = currentSearchTerm.toLowerCase().split(" ");
            return terms.some((term) => title.includes(term));
          }
        })
        .sort((a, b) => {
          if (searchType === "sku") {
            const aExactMatch =
              a.sku.toLowerCase() === currentSearchTerm.toLowerCase();
            const bExactMatch =
              b.sku.toLowerCase() === currentSearchTerm.toLowerCase();
            if (aExactMatch && !bExactMatch) return -1;
            if (!aExactMatch && bExactMatch) return 1;
          } else {
            const aTitle = a.title.toLowerCase();
            const bTitle = b.title.toLowerCase();
            const searchTermLower = currentSearchTerm.toLowerCase();
            const aExactMatch = aTitle === searchTermLower;
            const bExactMatch = bTitle === searchTermLower;
            if (aExactMatch && !bExactMatch) return -1;
            if (!aExactMatch && bExactMatch) return 1;
          }
          return 0;
        });

      console.log("Filtered and sorted products:", filteredAndSortedProducts);
      setProducts(filteredAndSortedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsSearching(false);
    }
  }, [searchTerm, searchType, externalSku]);

  // Effect for handling SKU changes from external input
  useEffect(() => {
    if (externalSku && externalSku.length >= 3) {
      setSearchType("sku");
      setOpen(true); // Open the popover when searching by SKU
      fetchProducts();
    }
  }, [externalSku, fetchProducts]);

  // Effect for handling name search changes
  useEffect(() => {
    if (searchTerm && searchType === "name") {
      setIsDebouncing(true);
      const debounce = setTimeout(() => {
        setIsDebouncing(false);
        fetchProducts();
      }, 300);

      return () => clearTimeout(debounce);
    }
  }, [searchTerm, fetchProducts]);

  return (
    <div className="space-y-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value
              ? products.find((product) => product?.title === value)?.title
              : "Select shoe..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput
              placeholder="Search shoe..."
              value={searchTerm}
              onValueChange={(newValue) => {
                setSearchTerm(newValue);
                setSearchType("name");
              }}
            />
            <CommandList>
              {isDebouncing || isSearching ? (
                <CommandItem>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Searching for shoes...
                </CommandItem>
              ) : searchTerm.length > 0 || externalSku.length > 0 ? (
                <CommandGroup>
                  {products.length > 0 ? (
                    products.map((product) => (
                      <CommandItem
                        key={product.id}
                        value={product.title}
                        onSelect={(currentValue) => {
                          console.log("Selected product:", product);
                          setValue(currentValue === value ? "" : currentValue);
                          setShoeImage(product.image);
                          setSku(product.sku);
                          setBrand(product.brand);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === product.title
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {product.title} - {product.sku}
                      </CommandItem>
                    ))
                  ) : (
                    <CommandEmpty>No products found.</CommandEmpty>
                  )}
                </CommandGroup>
              ) : null}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default function CreateProductDashboard() {
  const { data: session, status } = useSession();
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedShoe, setSelectedShoe] = useState("");
  const [shoeId, setShoeId] = useState("");
  const [sku, setSku] = useState("");
  const [shoeImage, setShoeImage] = useState("./shoeImages/air-max-90.png");
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [price, setPrice] = useState("");
  const [priceSale, setPriceSale] = useState("");
  const [owner, setOwner] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [sizeOptions, setSizeOptions] = useState("M");
  const [isSearching, setIsSearching] = useState(false);
  const [brand, setBrand] = useState(""); // New state for brand
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

  const allSizeOptions = {
    TD: ["2C", "3C", "4C", "5C", "6C", "7C"],
    PS: [
      "10.5C",
      "11C",
      "11.5C",
      "12C",
      "12.5C",
      "13C",
      "1Y",
      "1.5Y",
      "2Y",
      "2.5Y",
      "3Y",
    ],
    GS: ["3.5Y", "4Y", "4.5Y", "5Y", "5.5Y", "6Y", "6.5Y", "7Y"],
    M: [
      "US 3M",
      "US 3.5M",
      "US 4M",
      "US 4.5M",
      "US 5M",
      "US 5.5M",
      "US 6M",
      "US 6.5M",
      "US 7M",
      "US 7.5M",
      "US 8M",
      "US 8.5M",
      "US 9M",
      "US 9.5M",
      "US 10M",
      "US 10.5M",
      "US 11M",
      "US 11.5M",
      "US 12M",
      "US 12.5M",
      "US 13M",
      "US 13.5M",
      "US 14M",
      "US 3.5M",
      "US 15M",
    ],
    W: [
      "US 3W",
      "US 3.5W",
      "US 4W",
      "US 4.5W",
      "US 5W",
      "US 5.5W",
      "US 6W",
      "US 6.5W",
      "US 7W",
      "US 7.5W",
      "US 8W",
      "US 8.5W",
      "US 9W",
      "US 9.5W",
      "US 10W",
      "US 10.5W",
      "US 11W",
      "US 11.5W",
      "US 12W",
      "US 12.5W",
      "US 13W",
      "US 13.5W",
      "US 14W",
      "US 14.5W",
      "US 15W",
    ],
  };

  let dynamicSizes = allSizeOptions[sizeOptions] || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validation
    if (
      !selectedShoe ||
      !shoeId ||
      !sku ||
      !price ||
      !selectedSize ||
      !owner ||
      !location
    ) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    const shoeData = {
      shoeImage,
      shoeId: "F" + shoeId,
      sku,
      name: selectedShoe,
      size: selectedSize,
      price,
      priceSale,
      owner,
      location,
      brand,
      availability: "available",
    };

    try {
      const response = await fetch("https://sneakfits.vercel.app/api/shoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_AUTH_SECRET,
        },

        body: JSON.stringify(shoeData),
      });

      if (!response.ok) {
        throw new Error("Failed to create shoe");
      }

      const result = await response.json();

      setSuccess(true);
      router.push("/inventory");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetShoeImage = (imageUrl) => {
    setIsImageLoading(true); // Set loading state to true before changing the image
    setShoeImage(imageUrl);
  };

  return (
    <div>
      {showAlert && (
        <div className="fixed top-0 left-0 w-full bg-red-500 text-white text-center py-4 z-50">
          <p>Please login to access the dashboard.</p>
        </div>
      )}

      {status === "authenticated" && (
        <div className="min-h-screen">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto bg-card rounded-lg shadow-lg p-6 space-y-8">
              <h1 className="text-3xl font-bold text-center">
                Create New Product
              </h1>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="image" className="text-lg font-medium">
                    Product Image
                  </Label>
                  <div className="relative w-3/5 h-auto mx-auto border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden group hover:border-primary transition-colors">
                    {isImageLoading && (
                      <div className="  3/5 h-auto absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                        <Loader className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    )}
                    <img
                      src={shoeImage}
                      alt="Selected shoe"
                      className="w-full h-full object-fill"
                      onLoad={() => setIsImageLoading(false)}
                      style={{ display: isImageLoading ? "hidden" : "block" }}
                    />
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Shoe Name <span className="text-red-500">*</span>
                    </Label>
                    <ShoeCombobox
                      value={selectedShoe}
                      setValue={setSelectedShoe}
                      setShoeImage={handleSetShoeImage}
                      setSku={setSku}
                      setBrand={setBrand}
                      externalSku={sku}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="id" className="text-sm font-medium">
                      ID <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                        F
                      </span>
                      <Input
                        id="id"
                        placeholder="Enter product ID"
                        className="pl-7 w-full"
                        value={shoeId}
                        onChange={(e) => setShoeId(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku" className="text-sm font-medium">
                      SKU <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="sku"
                      placeholder="Enter SKU"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-medium">
                      Price <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                        ₱
                      </span>
                      <Input
                        id="price"
                        type="number"
                        placeholder="Enter price"
                        className="pl-7"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sale" className="text-sm font-medium">
                      Sale Price
                    </Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                        ₱
                      </span>
                      <Input
                        id="sale"
                        type="number"
                        placeholder="Enter sale price"
                        className="pl-7"
                        value={priceSale}
                        onChange={(e) => setPriceSale(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2 flex flex-col gap-3">
                  <Label className="text-sm font-medium">
                    Size <span className="text-red-500">*</span>
                  </Label>

                  <Select onValueChange={setSizeOptions} className="mb-8">
                    <SelectTrigger id="sizeOptions" className="w-1/4 ">
                      <SelectValue placeholder="Select Size Options" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Men's</SelectItem>
                      <SelectItem value="W">Women's</SelectItem>
                      <SelectItem value="GS">Grade School</SelectItem>
                      <SelectItem value="PS">Pre-School</SelectItem>
                      <SelectItem value="TD">Toddlers</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex flex-wrap gap-2">
                    {dynamicSizes.map((size) => (
                      <Button
                        key={size}
                        variant={size === selectedSize ? "default" : "outline"}
                        className="w-17 h-17 rounded-full text-white"
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedSize(size);
                        }}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-medium">
                      Location <span className="text-red-500">*</span>
                    </Label>
                    <Select onValueChange={setLocation}>
                      <SelectTrigger id="location">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Store">Store</SelectItem>
                        <SelectItem value="House">House</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="owner" className="text-sm font-medium">
                      Owner <span className="text-red-500">*</span>
                    </Label>
                    <Select onValueChange={setOwner}>
                      <SelectTrigger id="owner">
                        <SelectValue placeholder="Select owner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bryan">Bryan</SelectItem>
                        <SelectItem value="Fitz">Fitz</SelectItem>
                        <SelectItem value="Ashley">Ashley</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="text-right gap-4 flex justify-end items-center">
                  <Link href={"/inventory"}>
                    <Button variant="secondary" type="button">
                      Discard
                    </Button>
                  </Link>
                  <Button
                    className="text-white"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create Shoes"}
                  </Button>
                </div>
                {error && <p className="text-red-500">{error}</p>}
                {success && (
                  <p className="text-green-500">Shoe created successfully!</p>
                )}
              </form>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
