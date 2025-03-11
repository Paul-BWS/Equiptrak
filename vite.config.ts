import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Expose environment variables to the client
    define: {
      // Make sure to stringify the values for proper JSON
      '__APP_ENV__': JSON.stringify(env.VITE_APP_ENV || 'development'),
      // You can add more environment variables here if needed
    },
    server: {
      port: 3000,
      host: true,
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 3000,
        clientPort: 3000,
        timeout: 120000
      },
      watch: {
        usePolling: true,
        interval: 1000,
      }
    },
    optimizeDeps: {
      entries: ['src/**/*.{ts,tsx}']
    },
    build: {
      sourcemap: true,
      chunkSizeWarningLimit: 1000
    }
  };
});
