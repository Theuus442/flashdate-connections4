import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://kdwnptqxwnnzvdinhhin.supabase.co';

  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        // Proxy REST API calls from Supabase SDK
        '/rest/': {
          target: supabaseUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
        },
        // Proxy auth-related calls
        '/auth/': {
          target: supabaseUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
        },
        // Proxy realtime connections
        '/realtime/': {
          target: supabaseUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
        },
        // Proxy storage API calls (including images and files)
        '/storage/': {
          target: supabaseUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
          ws: true,
        },
        // Proxy functions
        '/functions/': {
          target: supabaseUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
