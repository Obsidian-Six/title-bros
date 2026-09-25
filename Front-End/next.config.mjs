// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   /* config options here */
// };

// export default nextConfig;

import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin(
  "./src/i18n/request.js"
);

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "title-bros-backend.onrender.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.onrender.com",
      },
    ],
  },
};

export default withNextIntl(nextConfig);