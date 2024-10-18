"use client";
import React, { useEffect, useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

const ShoesRow = ({ shoesRowData, onReturn }) => {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    setMounted(true);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <TableRow>
        {Array.from({ length: 9 }).map((_, index) => (
          <TableCell key={index} className="table-cell">
            loading
          </TableCell>
        ))}
      </TableRow>
    );
  }

  return (
    <>
      {loading ? (
        <TableRow>
          {Array.from({ length: 9 }).map((_, index) => (
            <TableCell key={index} className="table-cell">
              loading
            </TableCell>
          ))}
        </TableRow>
      ) : (
        <TableRow key={shoesRowData?.shoeId}>
          <TableCell className="table-cell">
            <div className="relative flex flex-col items-center">
              <img
                alt="Product image"
                className="aspect-square rounded-lg object-contain w-24 h-auto"
                src={shoesRowData?.shoeImage || "/placeholder-image.png"} // Fallback image
              />
            </div>
          </TableCell>
          <TableCell className="table-cell">{shoesRowData?.shoeId}</TableCell>
          <TableCell className="table-cell">{shoesRowData?.sku}</TableCell>
          <TableCell>
            <div className="font-medium whitespace-nowrap">
              {shoesRowData?.name}
            </div>
            <div className="text-sm text-muted-foreground inline">
              {shoesRowData?.brand}
            </div>
          </TableCell>
          <TableCell className="table-cell">{shoesRowData?.size}</TableCell>
          <TableCell className="table-cell">
            ₱{shoesRowData?.price.toLocaleString()}
          </TableCell>
          <TableCell className="table-cell">
            ₱{shoesRowData?.priceSale.toLocaleString()}
          </TableCell>
          <TableCell className="table-cell">{shoesRowData?.location}</TableCell>
          <TableCell className="table-cell">{shoesRowData?.owner}</TableCell>
          <TableCell className="table-cell">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {shoesRowData.availability === "sold" && (
                  <DropdownMenuItem onClick={() => onReturn(shoesRowData)}>
                    Return
                  </DropdownMenuItem>
                )}
                {/* Add other menu items as needed */}
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default ShoesRow;
