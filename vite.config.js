import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components')
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  build: {
    // Generate manifest for production
    manifest: true,
    rollupOptions: {
      input: '/src/entry/entry-client.tsx'
    },
    outDir: 'dist'
  },
  ssr: {
    noExternal: ['react-router-dom']
  }
})
