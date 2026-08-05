import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  //Guide pages are authored as .mdx alongside the app routes.
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
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

const withMDX = createMDX({})

export default withMDX(nextConfig)
