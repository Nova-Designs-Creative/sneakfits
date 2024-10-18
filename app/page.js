"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <Link href="/" className="text-2xl font-bold flex items-center">
              <ShoppingBag className="mr-2" />
              Sneakfits
            </Link>
            <nav className="hidden md:flex space-x-4">
              <Link href="/" className="hover:underline">
                Home
              </Link>
              <Link href="/store" className="hover:underline">
                Shop
              </Link>
            </nav>
            <div className="hidden md:flex space-x-2">
              <Link href="/auth/signIn">
                <Button className="text-white">Sign In</Button>
              </Link>
            </div>
            <button
              className="md:hidden"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden border-t">
            <nav className="flex flex-col space-y-2 p-4">
              <Link href="#" className="hover:underline">
                Home
              </Link>
              <Link href="/store" className="hover:underline">
                Shop
              </Link>

              <Link href="/auth/signIn">
                <Button className="w-full text-white">Sign In</Button>
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main>
        <section className="py-20 text-center">
          <div className="container mx-auto px-4 flex flex-col items-center">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-full w-1/2 mb-10 md:mb-0">
                <h1 className="text-4xl md:text-6xl font-bold mb-4">
                  Elevate Your Style
                </h1>
                <p className="text-xl mb-6">
                  Discover the perfect fit for your feet with Sneakfits.
                </p>
                <Button size="lg">Shop Now</Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-10 text-center">
              Why Choose Sneakfits?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Quality Assurance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    We source only the best sneakers from trusted brands to
                    ensure your satisfaction.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Extensive Collection</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    From classic styles to the latest trends, we have something
                    for every sneaker enthusiast.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Expert Advice</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Our team of sneaker experts is always ready to help you find
                    the perfect fit.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-10 text-center">
              Stay in the Loop
            </h2>
            <div className="max-w-md mx-auto">
              <p className="text-center mb-6">
                Subscribe to our newsletter for the latest releases and
                exclusive offers.
              </p>
              <form className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-grow"
                />
                <Button type="submit">Subscribe</Button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Link href="/" className="text-2xl font-bold flex items-center">
                <ShoppingBag className="mr-2" />
                Sneakfits
              </Link>
            </div>
            <nav className="flex flex-wrap justify-center gap-4">
              <Link href="#" className="hover:underline">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:underline">
                Terms of Service
              </Link>
              <Link href="#" className="hover:underline">
                Contact Us
              </Link>
            </nav>
          </div>
          <div className="mt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Sneakfits. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
