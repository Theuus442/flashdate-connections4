import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';

  return {
    server: {
      host: "::",
      port: 8080,
      ...(supabaseUrl && {
        proxy: {
          '/supabase-api': {
            target: supabaseUrl,
            changeOrigin: true,
            rewrite: (path) => {
              // Remove the /supabase-api prefix and forward the rest
              return path.replace(/^\/supabase-api/, '');
            },
            ws: true,
            secure: true,
          },
        },
      }),
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
