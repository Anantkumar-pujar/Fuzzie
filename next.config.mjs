/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'ucarecdn.com',
      },
      {
        //Uploadcare projects with a custom CDN CNAME deliver from
        //<subdomain>.ucarecd.net instead of ucarecdn.com, and the uploader
        //returns whichever host the project is configured for.
        protocol: 'https',
        hostname: '**.ucarecd.net',
      },
    ],
  },
}

export default nextConfig
