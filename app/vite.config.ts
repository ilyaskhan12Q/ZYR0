import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const siteUrl = (env.VITE_SITE_URL || 'https://zyroo.dpdns.org').replace(/\/+$/, '');

  return {
    base: '/',
    plugins: [
      inspectAttr(), 
      react(),
      {
        name: 'html-transform',
        transformIndexHtml(html) {
          return html.replace(/%VITE_SITE_URL%/g, siteUrl);
        }
      }
    ],
    server: {
      port: 3000,
    },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-motion': ['framer-motion'],
          'vendor-icons': ['lucide-react'],
          'vendor-recharts': ['recharts'],
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
  };
});

