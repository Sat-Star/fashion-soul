import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            if (req.method === 'POST') {
              proxyReq.setHeader('Content-Type', 'application/x-www-form-urlencoded');
            }
          });
          proxy.on('error', (err, req, res) => {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Proxy error');
          });
        }
      },
    },
    historyApiFallback: {
      disableDotRule: true,
      rewrites: [
        { from: /^\/shop\/phonepe-return/, to: '/index.html' },
        { from: /\/shop\/payment-/, to: '/index.html' },
        { from: /^\/auth/, to: '/index.html' }
      ]
    }
  }
});