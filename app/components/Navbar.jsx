"use client";
import { CircleUser, Menu, Package2 } from "lucide-react";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation"; // Import usePathname
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";

const Navbar = () => {
  const { data: session } = useSession(); // Get session data
  const pathname = usePathname(); // Get the current pathname

  // Function to determine link classes based on the current path
  const linkClass = (path) =>
    pathname === path ? "text-foreground" : "text-muted-foreground";

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <Package2 className="h-6 w-6" />
          <span className="sr-only">Sneakfits</span>
        </Link>
        <Link href="/dashboard" className={linkClass("/dashboard")}>
          Dashboard
        </Link>
        <Link href="/inventory" className={linkClass("/inventory")}>
          Inventory
        </Link>
        <Link href="/sales" className={linkClass("/sales")}>
          Sales
        </Link>
        <Link href="/return" className={linkClass("/return")}>
          Return
        </Link>
        <Link href="/store" className={linkClass("/store")}>
          Store
        </Link>
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <Package2 className="h-6 w-6" />
              <span className="sr-only">Sneakfits</span>
            </Link>
            <Link href="/dashboard" className={linkClass("/dashboard")}>
              Dashboard
            </Link>
            <Link href="/inventory" className={linkClass("/inventory")}>
              Inventory
            </Link>
            <Link href="/sales" className={linkClass("/sales")}>
              Sales
            </Link>
            <Link href="/return" className={linkClass("/return")}>
              Return
            </Link>
            <Link href="/store" className={linkClass("/store")}>
              Store
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4 flex-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuSeparator />

            <DropdownMenuSeparator />
            {session ? (
              <DropdownMenuItem onClick={() => signOut()}>
                Logout
              </DropdownMenuItem>
            ) : (
              <Link href="/auth/signIn">
                <DropdownMenuItem>Login</DropdownMenuItem>
              </Link>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Navbar;
