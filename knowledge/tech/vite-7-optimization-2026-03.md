# Vite 7 — React Optimization & Build Config 2025

## Summary
Vite 7 (June 2025) = fast dev server + optimized prod builds. Node 20.19+. Auto code-splitting, tree-shaking, HMR. Key: React.lazy for routes, manualChunks for vendors, image optimization.

## Dev Config (vite.config.js)
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@services': '/src/services',
    }
  },
  
  server: {
    port: 3000,
    open: true,
  },
  
  build: {
    minify: true,
    cssMinify: true,
    cssCodeSplit: true,
    sourcemap: false,        // disable in prod
    chunkSizeWarningLimit: 500,
    
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'supabase': ['@supabase/supabase-js'],
          'charts': ['apexcharts', 'recharts'],
          'pdf': ['jspdf', 'html2canvas'],
          'ui': ['framer-motion', 'lucide-react'],
        }
      }
    }
  }
})
```

## Performance Optimizations

### 1. Code Splitting with React.lazy
```javascript
// ✅ Lazy load heavy pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'))
const AdminPanel = React.lazy(() => import('./pages/admin/AdminPanel'))

// In router
<Suspense fallback={<LoadingSpinner />}>
  <Dashboard />
</Suspense>
```

### 2. Dynamic Import for Heavy Libraries
```javascript
// ✅ Only load jsPDF when needed
async function generatePDF() {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF()
  // ...
}
```

### 3. Image Optimization
- Use WebP/AVIF formats
- Lazy load images: `<img loading="lazy" />`
- Use `vite-plugin-image-optimizer` for build-time compression
- SVGs: use `vite-plugin-svgr` for React components

### 4. Tree Shaking
```javascript
// ✅ GOOD: named import (tree-shakeable)
import { motion } from 'framer-motion'
import { Menu, Home } from 'lucide-react'

// ❌ BAD: default import (imports everything)
import * as icons from 'lucide-react'
```

## Useful Plugins
| Plugin | Purpose |
|--------|---------|
| `@vitejs/plugin-react` | React Fast Refresh |
| `vite-plugin-pwa` | PWA support |
| `vite-plugin-image-optimizer` | Image compression |
| `vite-plugin-svgr` | SVG as React components |
| `vite-bundle-analyzer` | Bundle size analysis |
| `@vitejs/plugin-legacy` | Old browser support |

## Bundle Analysis
```bash
# Visualize bundle
npx vite-bundle-visualizer
```

## Build Best Practices
- ✅ `manualChunks` for vendor splitting
- ✅ Dynamic import for heavy libraries (PDF, charts)
- ✅ React.lazy for page-level code splitting
- ✅ Named imports for tree shaking
- ✅ Image lazy loading + compression
- ❌ Don't import entire libraries (`import * as X`)
- ❌ Don't bundle source maps in production

## Date: 2026-03-17 | Sources: vite.dev, medium.com, logrocket.com
