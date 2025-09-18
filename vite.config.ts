import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      // Replace <ref> with your Supabase project ref
      '/edge': {
        target: 'https://ytigoauzuwnfkfxoglkp.functions.supabase.co',
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/edge/, ''),
      },
    },
  },
});
