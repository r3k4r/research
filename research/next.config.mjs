/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
    images: {
      domains: ['localhost', 'images.unsplash.com', 'lh3.googleusercontent.com'],
    },
  }
  
  export default nextConfig