/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'www.gravatar.com', // Existing domain
      'st3.depositphotos.com', // Add this domain
    ],
  },
};

export default nextConfig;
