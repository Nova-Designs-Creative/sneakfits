import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const ShoesRow = ({ shoesRowData, onDelete, isLoading }) => {
  // Function to render availability badge
  const renderAvailabilityBadge = () => {
    switch (shoesRowData?.availability) {
      case "available":
        return <Badge className="bg-white">Available</Badge>;
      case "sold":
        return <Badge variant="destructive">Sold</Badge>;
      case "preorder":
        return <Badge variant="info">Preorder</Badge>;
      default:
        return <Badge variant="neutral">Unknown</Badge>;
    }
  };

  return (
    <TableRow>
      {isLoading ? (
        // Render loading state for the row
        Array.from({ length: 10 }).map((_, index) => (
          <TableCell key={index} className="table-cell">
            loading
          </TableCell>
        ))
      ) : (
        // Render the actual shoes data if not loading
        <>
          <TableCell className="table-cell">
            <div className="relative flex flex-col items-center">
              <div className="mb-2">{renderAvailabilityBadge()}</div>
              <img
                alt="Product image"
                className="aspect-square rounded-lg object-contain w-24 h-auto"
                src={shoesRowData?.shoeImage || "/placeholder-image.png"}
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
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                {shoesRowData?.availability === "available" && (
                  <Link href={`/inventory/${shoesRowData?._id}`}>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                  </Link>
                )}
                <DropdownMenuItem onClick={() => onDelete(shoesRowData)}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </>
      )}
    </TableRow>
  );
};

export default ShoesRow;
