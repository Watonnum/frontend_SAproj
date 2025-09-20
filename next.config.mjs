/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow remote avatars from ui-avatars.com used in the Table component
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
    ],
  },
};

export default nextConfig;
