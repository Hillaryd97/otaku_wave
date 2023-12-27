/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = nextConfig;
// next.config.js

module.exports = {
  // Other configurations...

  images: {
    domains: ["s4.anilist.co", "firebasestorage.googleapis.com", "cdn.myanimelist.net"],
  },
};
