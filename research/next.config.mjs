/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
    images: {
      domains: ['localhost', 'images.unsplash.com'],
    },
  }
  
  export default nextConfig