/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensures build does not fail due to ESLint issues.
  eslint: {
    ignoreDuringBuilds: true,
  },

  webpack: (config) => {
    // Windows-only: Next/webpack globbing can hit protected directories like:
    // C:\Users\<user>\Application Data
    // This is a pragmatic guard to reduce scanning during build.
    config.watchOptions = {
      ...(config.watchOptions || {}),
      ignored: ['**/Application Data/**'],
    }

    // Also prevent watchers/snapshots from touching node_modules scans outside the project.
    config.snapshot = {
      ...(config.snapshot || {}),
      managedPaths: [/(node_modules\/)/],
    }

    return config
  },
}

module.exports = nextConfig


