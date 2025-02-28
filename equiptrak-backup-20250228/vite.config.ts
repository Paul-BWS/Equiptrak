import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: true,
    hmr: {
      protocol: 'ws',
      timeout: 0
    }
  },
  optimizeDeps: {
    entries: ['src/**/*.{ts,tsx}']
  },
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 1000
  }
});
