"use client";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import imageSignIn from "..//..//images/signinimg.png";

export const description =
  "A login page with two columns. The first column has the login form with email and password. There's feedback for successful and unsuccessful login attempts. The second column has a cover image.";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackColor, setFeedbackColor] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true when the form is submitted

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result.error) {
      setFeedbackMessage("Login failed. Please check your credentials.");
      setFeedbackColor("text-red-500");
    } else {
      setFeedbackMessage("Login successful. Redirecting to dashboard...");
      setFeedbackColor("text-green-500");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000); // Redirect after 2 seconds
    }

    setLoading(false); // Set loading to false after the process is done
  };

  return (
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-balance text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading} // Disable input when loading
              />
            </div>
            <div className="grid gap-2 mt-8">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading} // Disable input when loading
              />
            </div>
            {feedbackMessage && (
              <p className={`text-center ${feedbackColor}`}>
                {feedbackMessage}
              </p>
            )}
            <Button
              type="submit"
              className="w-full text-white"
              disabled={loading} // Disable button when loading
            >
              {loading ? "Loading..." : "Login"}
            </Button>
            <Link href="/">
              <Button variant="outline" className="w-full" disabled={loading}>
                Go Back
              </Button>
            </Link>
          </form>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src={imageSignIn}
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
