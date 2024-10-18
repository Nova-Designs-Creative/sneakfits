/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.stockx.com",
        pathname: "/**", // Matches any path under this hostname
      },
      // Add more patterns as needed
    ],
  },
};

export default nextConfig;
