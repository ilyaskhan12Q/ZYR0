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
            './src/pages/student/Internships.tsx',
            './src/pages/student/Applications.tsx',
            './src/pages/student/Tasks.tsx',
            './src/pages/student/Progress.tsx',
            './src/pages/student/Messages.tsx',
            './src/pages/student/Certificates.tsx',
            './src/pages/student/Portfolio.tsx',
            './src/pages/student/Profile.tsx',
            './src/pages/student/Settings.tsx',
            './src/pages/student/OfferLetters.tsx',
            './src/pages/student/Workspace.tsx',
          ],
          'portal-company': [
            './src/pages/company/Dashboard.tsx',
            './src/pages/company/Profile.tsx',
            './src/pages/company/Internships.tsx',
            './src/pages/company/PostInternship.tsx',
            './src/pages/company/Applicants.tsx',
            './src/pages/company/Interns.tsx',
            './src/pages/company/Tasks.tsx',
            './src/pages/company/Analytics.tsx',
            './src/pages/company/Certificates.tsx',
            './src/pages/company/Team.tsx',
            './src/pages/company/Settings.tsx',
            './src/pages/company/OfferLetters.tsx',
          ],
          'portal-mentor': [
            './src/pages/mentor/Dashboard.tsx',
            './src/pages/mentor/Interns.tsx',
            './src/pages/mentor/Tasks.tsx',
            './src/pages/mentor/Evaluations.tsx',
            './src/pages/mentor/Messages.tsx',
            './src/pages/mentor/Profile.tsx',
            './src/pages/mentor/Settings.tsx',
          ],
          'portal-admin': [
            './src/pages/admin/Dashboard.tsx',
            './src/pages/admin/Users.tsx',
            './src/pages/admin/Companies.tsx',
            './src/pages/admin/Internships.tsx',
            './src/pages/admin/Certificates.tsx',
            './src/pages/admin/Applications.tsx',
            './src/pages/admin/Analytics.tsx',
            './src/pages/admin/Reports.tsx',
            './src/pages/admin/Settings.tsx',
            './src/pages/admin/Logs.tsx',
            './src/pages/admin/OfferLetters.tsx',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
  };
});

