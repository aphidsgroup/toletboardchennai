const withPWA = require('next-pwa')({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'picsum.photos',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
        ],
    },
    experimental: {
        // Cache pages client-side so back/forward navigation is instant
        staleTimes: {
            dynamic: 30,  // Cache dynamic pages for 30 seconds
            static: 180,  // Cache static pages for 3 minutes
        },
    },
};

module.exports = withPWA(nextConfig);
