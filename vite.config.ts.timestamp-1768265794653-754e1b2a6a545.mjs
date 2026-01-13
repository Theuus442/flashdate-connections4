// vite.config.ts
import { defineConfig } from "file:///root/app/code/node_modules/vite/dist/node/index.js";
import react from "file:///root/app/code/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
var __vite_injected_original_dirname = "/root/app/code";
var vite_config_default = defineConfig(({ mode }) => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://kdwnptqxwnnzvdinhhin.supabase.co";
  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        // Proxy REST API calls from Supabase SDK
        "/rest/": {
          target: supabaseUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path2) => path2
        },
        // Proxy auth-related calls
        "/auth/": {
          target: supabaseUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path2) => path2
        },
        // Proxy realtime connections
        "/realtime/": {
          target: supabaseUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path2) => path2
        },
        // Proxy storage calls
        "/storage/": {
          target: supabaseUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path2) => path2
        }
      }
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src")
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvcm9vdC9hcHAvY29kZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL3Jvb3QvYXBwL2NvZGUvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL3Jvb3QvYXBwL2NvZGUvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XG4gIGNvbnN0IHN1cGFiYXNlVXJsID0gcHJvY2Vzcy5lbnYuVklURV9TVVBBQkFTRV9VUkwgfHwgJ2h0dHBzOi8va2R3bnB0cXh3bm56dmRpbmhoaW4uc3VwYWJhc2UuY28nO1xuXG4gIHJldHVybiB7XG4gICAgc2VydmVyOiB7XG4gICAgICBob3N0OiBcIjo6XCIsXG4gICAgICBwb3J0OiA4MDgwLFxuICAgICAgcHJveHk6IHtcbiAgICAgICAgLy8gUHJveHkgUkVTVCBBUEkgY2FsbHMgZnJvbSBTdXBhYmFzZSBTREtcbiAgICAgICAgJy9yZXN0Lyc6IHtcbiAgICAgICAgICB0YXJnZXQ6IHN1cGFiYXNlVXJsLFxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgICBzZWN1cmU6IGZhbHNlLFxuICAgICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLFxuICAgICAgICB9LFxuICAgICAgICAvLyBQcm94eSBhdXRoLXJlbGF0ZWQgY2FsbHNcbiAgICAgICAgJy9hdXRoLyc6IHtcbiAgICAgICAgICB0YXJnZXQ6IHN1cGFiYXNlVXJsLFxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgICBzZWN1cmU6IGZhbHNlLFxuICAgICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLFxuICAgICAgICB9LFxuICAgICAgICAvLyBQcm94eSByZWFsdGltZSBjb25uZWN0aW9uc1xuICAgICAgICAnL3JlYWx0aW1lLyc6IHtcbiAgICAgICAgICB0YXJnZXQ6IHN1cGFiYXNlVXJsLFxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgICBzZWN1cmU6IGZhbHNlLFxuICAgICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLFxuICAgICAgICB9LFxuICAgICAgICAvLyBQcm94eSBzdG9yYWdlIGNhbGxzXG4gICAgICAgICcvc3RvcmFnZS8nOiB7XG4gICAgICAgICAgdGFyZ2V0OiBzdXBhYmFzZVVybCxcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgICAgc2VjdXJlOiBmYWxzZSxcbiAgICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aCxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgICB9LFxuICAgIH0sXG4gIH07XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNE4sU0FBUyxvQkFBb0I7QUFDelAsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUZqQixJQUFNLG1DQUFtQztBQUt6QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUN4QyxRQUFNLGNBQWMsUUFBUSxJQUFJLHFCQUFxQjtBQUVyRCxTQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixPQUFPO0FBQUE7QUFBQSxRQUVMLFVBQVU7QUFBQSxVQUNSLFFBQVE7QUFBQSxVQUNSLGNBQWM7QUFBQSxVQUNkLFFBQVE7QUFBQSxVQUNSLFNBQVMsQ0FBQ0EsVUFBU0E7QUFBQSxRQUNyQjtBQUFBO0FBQUEsUUFFQSxVQUFVO0FBQUEsVUFDUixRQUFRO0FBQUEsVUFDUixjQUFjO0FBQUEsVUFDZCxRQUFRO0FBQUEsVUFDUixTQUFTLENBQUNBLFVBQVNBO0FBQUEsUUFDckI7QUFBQTtBQUFBLFFBRUEsY0FBYztBQUFBLFVBQ1osUUFBUTtBQUFBLFVBQ1IsY0FBYztBQUFBLFVBQ2QsUUFBUTtBQUFBLFVBQ1IsU0FBUyxDQUFDQSxVQUFTQTtBQUFBLFFBQ3JCO0FBQUE7QUFBQSxRQUVBLGFBQWE7QUFBQSxVQUNYLFFBQVE7QUFBQSxVQUNSLGNBQWM7QUFBQSxVQUNkLFFBQVE7QUFBQSxVQUNSLFNBQVMsQ0FBQ0EsVUFBU0E7QUFBQSxRQUNyQjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsSUFDakIsU0FBUztBQUFBLE1BQ1AsT0FBTztBQUFBLFFBQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLE1BQ3RDO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogWyJwYXRoIl0KfQo=
