import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import type { ProxyOptions } from 'vite';
import { IncomingMessage } from 'http';

// Extend IncomingMessage to include body property
interface ExtendedIncomingMessage extends IncomingMessage {
  body?: any;
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      nodePolyfills({
        // Whether to polyfill `node:` protocol imports.
        protocolImports: true,
        // Whether to polyfill specific globals.
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Expose environment variables to the client
    define: {
      // Make sure to stringify the values for proper JSON
      '__APP_ENV__': JSON.stringify(env.VITE_APP_ENV || 'development'),
      '__APP_VERSION__': JSON.stringify('1.0.9'),
      'process.env.APP_VERSION': JSON.stringify('1.0.9')
    },
    server: {
      port: 3000,
      host: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
          ws: true,
          rewrite: (path) => path,
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.error('❌ API Proxy Error:', err);
              // If the response hasn't been sent and we can set headers
              if (!res.headersSent) {
                res.writeHead(500, {
                  'Content-Type': 'application/json'
                });
                const errorMessage = JSON.stringify({ error: 'Proxy Error: ' + err.message });
                res.end(errorMessage);
              }
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('📤 Outgoing API Request:', req.method, req.url);
              // Log the request body for debugging POST requests
              const extendedReq = req as ExtendedIncomingMessage;
              if (req.method === 'POST' && extendedReq.body) {
                console.log('Request body:', extendedReq.body);
              }
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('📥 Incoming API Response:', proxyRes.statusCode, req.url);
              // Log response headers for debugging
              console.log('Response headers:', proxyRes.headers);
            });
          }
        } as ProxyOptions,
      },
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
      include: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
      esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
          global: 'globalThis',
        },
      },
    },
    build: {
      sourcemap: true,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        // External packages that should not be bundled
        external: [],
      },
    }
  };
});
