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
import Navbar from "../../components/Navbar";
import { useRouter } from "next/navigation";

function ShoeCombobox({
  value,
  setValue,
  setShoeImage,
  setSku,
  setBrand,
  name,
}) {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("Jordan 1");
  const [isSearching, setIsSearching] = useState(false);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const fetchProducts = useCallback(async () => {
    if (searchTerm.length < 3) {
      setProducts([]);
      return;
    }
    setIsSearching(true);
    const api = new StockXAPI(StockXLocation.US);
    try {
      const result = await api.searchProducts(searchTerm, { limit: 20 });

      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const searchTerms = lowerCaseSearchTerm.split(" ");

      const filteredAndSortedProducts = result.hits
        .filter((product) => {
          const title = product.title.toLowerCase();
          return searchTerms.some((term) => title.includes(term));
        })
        .sort((a, b) => {
          const aTitle = a.title.toLowerCase();
          const bTitle = b.title.toLowerCase();
          const aExactMatch = aTitle === lowerCaseSearchTerm;
          const bExactMatch = bTitle === lowerCaseSearchTerm;
          if (aExactMatch && !bExactMatch) return -1;
          if (!aExactMatch && bExactMatch) return 1;
          return 0;
        });

      setProducts(filteredAndSortedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsSearching(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    setIsDebouncing(true);
    const debounce = setTimeout(() => {
      setIsDebouncing(false);
      fetchProducts();
    }, 300);

    return () => {
      clearTimeout(debounce);
    };
  }, [searchTerm, fetchProducts]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? products.find((product) => product.title === value)?.title
            : "Select shoe..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Search shoe..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {isSearching ? (
              <CommandItem>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </CommandItem>
            ) : (
              <CommandGroup>
                {products.length > 0 ? ( // Use filteredProducts here
                  products.map((product) => (
                    <CommandItem
                      key={product.id}
                      value={product.title}
                      onSelect={(currentValue) => {
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
                          value === product.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {product.title}
                    </CommandItem>
                  ))
                ) : (
                  <CommandEmpty>No products found.</CommandEmpty>
                )}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function CreateProductDashboard({
  id,
  shoeImage,
  shoeId,
  sku,
  name,
  size,
  price,
  priceSale,
  owner,
  location,
  brand,
}) {
  const { setTheme } = useTheme();
  const [newName, setNewName] = useState(name || "");
  const [newSelectedSize, setNewSelectedSize] = useState(size || "");
  const [selectedShoe, setSelectedShoe] = useState(name || "");
  const [newShoeId, setNewShoeId] = useState(shoeId || "");
  const [newSku, setNewSku] = useState(sku || "");
  const [newShoeImage, setShoeImage] = useState(shoeImage);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [newPrice, setNewPrice] = useState(price || "");
  const [newPriceSale, setNewPriceSale] = useState(priceSale || "");
  const [newOwner, setNewOwner] = useState(owner || "");
  const [newLocation, setNewLocation] = useState(location || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [sizeOptions, setSizeOptions] = useState("M");
  const [isSearching, setIsSearching] = useState(false);
  const [newBrand, setNewBrand] = useState(brand || ""); // New state for brand

  const router = useRouter();

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
      !newShoeId ||
      !newSku ||
      !newPrice ||
      !newPriceSale ||
      !newShoeImage ||
      !newSelectedSize ||
      !newOwner ||
      !newLocation
    ) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    const shoeData = {
      newShoeImage: newShoeImage,
      newShoeId: newShoeId,
      newSku: newSku,
      newName: selectedShoe,
      newSize: newSelectedSize,
      newPrice: newPrice,
      newPriceSale: newPriceSale,
      newOwner: newOwner,
      newLocation: newLocation,
      newBrand: newBrand,
    };

    try {
      const response = await fetch(
        `https://sneakfits.vercel.app/api/shoes/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(shoeData),
        }
      );

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
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-card rounded-lg shadow-lg p-6 space-y-8">
          <h1 className="text-3xl font-bold text-center">Create New Product</h1>
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
                  src={newShoeImage}
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
                  setSku={setNewSku}
                  setBrand={setNewBrand}
                  name={newName}
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
                    value={newShoeId}
                    onChange={(e) => setNewShoeId(e.target.value)}
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
                  value={newSku}
                  onChange={(e) => setNewSku(e.target.value)}
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
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
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
                    value={newPriceSale}
                    onChange={(e) => setNewPriceSale(e.target.value)}
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
                    variant={size === newSelectedSize ? "default" : "outline"}
                    className="w-17 h-17 rounded-full text-white"
                    onClick={(e) => {
                      e.preventDefault();
                      setNewSelectedSize(size);
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
                <Select value={newLocation} onValueChange={setNewLocation}>
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
                <Select value={newOwner} onValueChange={setNewOwner}>
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
              <Button className="text-white" type="submit" disabled={loading}>
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
  );
}
