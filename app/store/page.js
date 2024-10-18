"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Facebook,
  House,
  Instagram,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import Image from "next/image";
import storeLogo from "./sneakfitsLogo.png";
import Link from "next/link";

const ShoeStore = () => {
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [shoes, setShoes] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    const fetchShoesData = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/shoes", {
          method: "GET",
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_AUTH_SECRET, // Include your API key here
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // FILTER data to only include available shoes
        const availableShoes = data.filter(
          (shoe) => shoe.availability === "available"
        );
        setShoes(availableShoes);

        const uniqueBrands = [...new Set(data.map((shoe) => shoe.brand))];
        setBrands(uniqueBrands);
      } catch (error) {
        console.error("Failed to fetch shoes data:", error);
      }
    };

    fetchShoesData();
  }, []);

  const getCategory = (size) => {
    if (size.endsWith("M")) return "Men";
    if (size.endsWith("W")) return "Women";
    if (size.endsWith("C")) return "Toddlers";
    if (size.endsWith("Y")) return "Others";
    return null;
  };

  const getUniqueSizesByCategory = () => {
    if (selectedCategories.length === 0) return [];
    const filteredShoes = shoes.filter((shoe) =>
      selectedCategories.includes(getCategory(shoe.size))
    );
    const uniqueSizes = [...new Set(filteredShoes.map((shoe) => shoe.size))];
    return uniqueSizes;
  };

  const filteredShoes = shoes.filter((shoe) => {
    const matchesSearch = shoe.name
      .toLowerCase()
      .includes(searchInput.toLowerCase());
    const matchesBrand =
      selectedBrands.length === 0 || selectedBrands.includes(shoe.brand);
    const matchesSize =
      selectedSizes.length === 0 || selectedSizes.includes(shoe.size);
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(getCategory(shoe.size));

    return matchesSearch && matchesBrand && matchesSize && matchesCategory;
  });

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="min-h-screen ">
      <header className="shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Image
                  src={storeLogo}
                  alt="Sneakfits Logo"
                  width={80}
                  height={80}
                />
                <h1 className=" text-3xl font-bold md:block hidden">
                  Sneakfits
                </h1>
              </div>
              <div className="flex flex-col gap-4 justify-center ml-2">
                <div className="flex gap-2">
                  <House size={20} />
                  <Link href="https://www.google.com/maps/place/SNEAKFITS+SHOE+STORE/@14.1900607,121.1650097,17z/data=!3m1!4b1!4m6!3m5!1s0x33bd63000b931015:0x206aa16277c4d276!8m2!3d14.1900607!4d121.1675846!16s%2Fg%2F11w8r1j916?entry=ttu&g_ep=EgoyMDI0MTAxMy4wIKXMDSoASAFQAw%3D%3D">
                    <abbr title="Go To Google Maps" className="no-underline">
                      <p className="text-base text-gray-500 hover:text-blue-500 transition-all duration-300 hidden md:inline">
                        347 MULAWIN STREET, BRGY. BUCAL, CALAMBA CITY, LAGUNA
                      </p>
                      <span className="text-base text-gray-500 hover:text-blue-500 transition-all duration-300 md:hidden">
                        Store
                      </span>
                    </abbr>
                  </Link>
                </div>
                <div className="flex flex-col gap-4">
                  <a
                    href="https://www.facebook.com/sneakergram.ph"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Facebook size={20} />
                    <span className="text-gray-500 hover:text-blue-500 transition-all duration-300">
                      sneakfits.ph
                    </span>
                  </a>
                  <a
                    href="https://www.instagram.com/sneakfits.ph"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Instagram size={20} />
                    <span className="text-gray-500 hover:text-blue-500 transition-all duration-300">
                      sneakfits.ph
                    </span>
                  </a>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Search shoes..."
                  className="pl-10 pr-4 py-2 w-full sm:w-64"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="ml-2 lg:hidden"
                onClick={() => setShowFilters(!showFilters)} // Toggle filter visibility
              >
                <SlidersHorizontal size={20} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside
            className={`lg:w-64 ${showFilters ? "block" : "hidden"} lg:block`}
          >
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Brands</h2>
                <div className="space-y-2">
                  {brands.map((brand) => (
                    <div key={brand} className="flex items-center">
                      <Checkbox
                        id={brand}
                        checked={selectedBrands.includes(brand)}
                        onCheckedChange={(checked) => {
                          setSelectedBrands(
                            checked
                              ? [...selectedBrands, brand]
                              : selectedBrands.filter((b) => b !== brand)
                          );
                        }}
                      />
                      <Label htmlFor={brand} className="ml-2">
                        {brand}
                      </Label>
                    </div>
                  ))}
                </div>

                <h2 className="text-lg font-semibold mb-4 mt-6">Sizes</h2>
                <div className="space-y-2">
                  {selectedCategories.length > 0 &&
                  getUniqueSizesByCategory().length > 0 ? (
                    getUniqueSizesByCategory().map((size) => (
                      <div key={size} className="flex items-center">
                        <Checkbox
                          id={size}
                          checked={selectedSizes.includes(size)}
                          onCheckedChange={(checked) => {
                            setSelectedSizes(
                              checked
                                ? [...selectedSizes, size]
                                : selectedSizes.filter((s) => s !== size)
                            );
                          }}
                        />
                        <Label htmlFor={size} className="ml-2">
                          {size}
                        </Label>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">
                      Select a category to see sizes
                    </p>
                  )}
                </div>

                <h2 className="text-lg font-semibold mb-4 mt-6">Categories</h2>
                <div className="flex flex-col space-y-2">
                  {["Men", "Women", "Toddlers", "Others"].map((category) => (
                    <Button
                      key={category}
                      variant={
                        selectedCategories.includes(category)
                          ? "default"
                          : "outline"
                      }
                      onClick={() => toggleCategory(category)}
                      className="w-full text-white"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>

          <div className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {filteredShoes.map((shoe) => (
                <Card key={shoe.id} className="overflow-hidden w-full">
                  <Image
                    src={shoe.shoeImage}
                    alt={shoe.name}
                    width={300}
                    height={300}
                    className="w-full h-70 object-fill"
                  />
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold">{shoe.name}</h3>
                    <p className="text-sm text-gray-600">{shoe.brand}</p>
                    <p className="text-sm text-gray-600">{shoe.size}</p>
                    <p className="text-lg font-bold mt-2">₱{shoe.priceSale}</p>
                    <a
                      href={
                        shoe.owner === "Fitz"
                          ? "https://m.me/sneakfits.ph"
                          : "https://m.me/sneakergram.ph"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="w-full mt-4 text-white">
                        Inquire
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShoeStore;
