import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Check if the credentials match
        if (
          credentials.email === "sneakfits@novadesigns.com" &&
          credentials.password === "@sneakfits2024_novadesigns"
        ) {
          return { id: 1, name: "Admin", email: credentials.email };
        }
        return null; // Return null for failed login
      },
    }),
  ],
  pages: {
    signIn: "/auth/signIn", // Ensure this matches your sign-in page path
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const GET = (req, res) => NextAuth(req, res, authOptions);
export const POST = (req, res) => NextAuth(req, res, authOptions);
