/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // no me tumbes el build por reglas de eslint
    ignoreDuringBuilds: true,
  },
  typescript: {
    // no me tumbes el build por errores de TypeScript
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
