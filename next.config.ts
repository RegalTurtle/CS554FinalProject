import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  /*uncomment to show dev tool*/
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '', // Optional: usually empty for standard HTTP/HTTPS ports
        pathname: '/**', // Optional: allows any path under this hostname.
                        // You can be more specific, e.g., '/40/**' if all images are under /40/
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos', // Add this if you're using picsum.photos as well
        port: '',
        pathname: '/**',
      },
      // Add other hostnames if needed
    ],
  },
  
};

export default nextConfig;
