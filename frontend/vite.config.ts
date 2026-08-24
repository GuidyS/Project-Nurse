import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: true,
    port: 5173,
    allowedHosts: [
      ".ngrok-free.dev",
    ],
    watch: {
      usePolling: process.env.VITE_USE_POLLING === "true",
      ignored: ["**/node_modules/**", "**/dist/**", "**/.git/**"],
    },
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" &&
      process.env.VITE_ENABLE_COMPONENT_TAGGER === "true" &&
      componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
