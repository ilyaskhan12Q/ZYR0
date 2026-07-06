import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [inspectAttr(), react()],
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
          // React core — cached long-term, rarely changes
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Supabase client
          'vendor-supabase': ['@supabase/supabase-js'],
          // Animation library
          'vendor-motion': ['framer-motion'],
          // Icon library
          'vendor-icons': ['lucide-react'],
          // Portal code split by role
          'portal-student': [
            './src/pages/student/Dashboard.tsx',
            './src/pages/student/Applications.tsx',
            './src/pages/student/Tasks.tsx',
            './src/pages/student/Messages.tsx',
            './src/pages/student/Certificates.tsx',
          ],
          'portal-company': [
            './src/pages/company/Dashboard.tsx',
            './src/pages/company/Applicants.tsx',
            './src/pages/company/Internships.tsx',
          ],
          'portal-mentor': [
            './src/pages/mentor/Dashboard.tsx',
            './src/pages/mentor/Interns.tsx',
            './src/pages/mentor/Tasks.tsx',
          ],
          'portal-admin': [
            './src/pages/admin/Dashboard.tsx',
            './src/pages/admin/Users.tsx',
            './src/pages/admin/Companies.tsx',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});

