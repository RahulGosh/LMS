import path from "path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://lms-474m.onrender.com',
        changeOrigin: true,
        secure: false,  // Set to true if the backend uses HTTPS
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
});
