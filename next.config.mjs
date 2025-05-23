
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    env: {
      API_ROOT_URL: process.env.API_ROOT_URL
    },
    typescript: {
        ignoreBuildErrors: true,
    },
  };
  export default nextConfig;
