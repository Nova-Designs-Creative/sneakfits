"use client";
import React, { useEffect, useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const ShoesRow = ({ shoesRowData }) => {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false); // Set loading to false after 2 seconds
    }, 2000);

    setMounted(true); // Mark the component as mounted

    return () => clearTimeout(timer);
  }, []);

  // Placeholder when not mounted
  if (!mounted) {
    return (
      <TableRow>
        <TableCell className="table-cell">loading</TableCell>
        <TableCell className="table-cell">loading</TableCell>
        <TableCell>
          <div className="font-medium">loading</div>
          <div className="hidden text-sm text-muted-foreground md:inline">
            loading
          </div>
        </TableCell>
        <TableCell className="table-cell">loading</TableCell>
        <TableCell className="table-cell">loading</TableCell>
        <TableCell className="table-cell">loading</TableCell>
        <TableCell className="table-cell">loading</TableCell>
        <TableCell className="table-cell">loading</TableCell>
        <TableCell className="table-cell text-right">loading</TableCell>
      </TableRow>
    );
  }

  // Render the actual row after loading
  return (
    <>
      {loading ? (
        <TableRow>
          <TableCell className="table-cell">loading</TableCell>
          <TableCell className="table-cell">loading</TableCell>
          <TableCell>
            <div className="font-medium">loading</div>
            <div className="hidden text-sm text-muted-foreground md:inline">
              loading
            </div>
          </TableCell>
          <TableCell className="table-cell">loading</TableCell>
          <TableCell className="table-cell">loading</TableCell>
          <TableCell className="table-cell">loading</TableCell>
          <TableCell className="table-cell">loading</TableCell>
          <TableCell className="table-cell">loading</TableCell>
          <TableCell className="table-cell text-right">loading</TableCell>
        </TableRow>
      ) : (
        // Filter and display only available shoes
        <>
          {shoesRowData
            .filter((shoe) => shoe.availability === "available")
            .map((shoe) => (
              <TableRow key={shoe.shoeId}>
                <TableCell className="table-cell">
                  <img
                    alt="Product image"
                    className="aspect-square rounded-lg object-contain w-24 h-auto"
                    src={shoe?.shoeImage || "/placeholder-image.png"} // Fallback image
                  />
                </TableCell>
                <TableCell className="table-cell">{shoe.shoeId}</TableCell>
                <TableCell className="table-cell">{shoe.sku}</TableCell>
                <TableCell>
                  <div className="font-medium whitespace-nowrap">
                    {shoe.name}
                  </div>
                  <div className="text-sm text-muted-foreground inline">
                    {shoe.brand}
                  </div>
                </TableCell>
                <TableCell className="table-cell">{shoe.size}</TableCell>
                <TableCell className="table-cell">
                  ₱{shoe.price.toLocaleString()}
                </TableCell>
                <TableCell className="table-cell">
                  ₱{shoe.priceSale.toLocaleString()}
                </TableCell>
                <TableCell className="table-cell">{shoe.location}</TableCell>
                <TableCell className="table-cell">{shoe.owner}</TableCell>
                <TableCell className="table-cell text-right">
                  <Link href={`/dashboard/${shoe._id}`}>
                    <Button variant="secondary" className="w-full text-white">
                      Sold
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
        </>
      )}
    </>
  );
};

export default ShoesRow;
