// vite.config.ts
import { defineConfig } from "file:///C:/Users/HeyBo/Desktop/Project-Nurse-main/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/HeyBo/Desktop/Project-Nurse-main/frontend/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/Users/HeyBo/Desktop/Project-Nurse-main/frontend/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\HeyBo\\Desktop\\Project-Nurse-main\\frontend";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: true,
    port: 5173,
    allowedHosts: [
      ".ngrok-free.dev"
    ],
    watch: {
      usePolling: process.env.VITE_USE_POLLING === "true",
      ignored: ["**/node_modules/**", "**/dist/**", "**/.git/**"]
    },
    hmr: {
      overlay: false
    }
  },
  plugins: [
    react(),
    mode === "development" && process.env.VITE_ENABLE_COMPONENT_TAGGER === "true" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxIZXlCb1xcXFxEZXNrdG9wXFxcXFByb2plY3QtTnVyc2UtbWFpblxcXFxmcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcSGV5Qm9cXFxcRGVza3RvcFxcXFxQcm9qZWN0LU51cnNlLW1haW5cXFxcZnJvbnRlbmRcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL0hleUJvL0Rlc2t0b3AvUHJvamVjdC1OdXJzZS1tYWluL2Zyb250ZW5kL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiB0cnVlLFxuICAgIHBvcnQ6IDUxNzMsXG4gICAgYWxsb3dlZEhvc3RzOiBbXG4gICAgICBcIi5uZ3Jvay1mcmVlLmRldlwiLFxuICAgIF0sXG4gICAgd2F0Y2g6IHtcbiAgICAgIHVzZVBvbGxpbmc6IHByb2Nlc3MuZW52LlZJVEVfVVNFX1BPTExJTkcgPT09IFwidHJ1ZVwiLFxuICAgICAgaWdub3JlZDogW1wiKiovbm9kZV9tb2R1bGVzLyoqXCIsIFwiKiovZGlzdC8qKlwiLCBcIioqLy5naXQvKipcIl0sXG4gICAgfSxcbiAgICBobXI6IHtcbiAgICAgIG92ZXJsYXk6IGZhbHNlLFxuICAgIH0sXG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIG1vZGUgPT09IFwiZGV2ZWxvcG1lbnRcIiAmJlxuICAgICAgcHJvY2Vzcy5lbnYuVklURV9FTkFCTEVfQ09NUE9ORU5UX1RBR0dFUiA9PT0gXCJ0cnVlXCIgJiZcbiAgICAgIGNvbXBvbmVudFRhZ2dlcigpLFxuICBdLmZpbHRlcihCb29sZWFuKSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICB9LFxuICB9LFxufSkpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFvVixTQUFTLG9CQUFvQjtBQUNqWCxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsdUJBQXVCO0FBSGhDLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUEsRUFDekMsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sY0FBYztBQUFBLE1BQ1o7QUFBQSxJQUNGO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxZQUFZLFFBQVEsSUFBSSxxQkFBcUI7QUFBQSxNQUM3QyxTQUFTLENBQUMsc0JBQXNCLGNBQWMsWUFBWTtBQUFBLElBQzVEO0FBQUEsSUFDQSxLQUFLO0FBQUEsTUFDSCxTQUFTO0FBQUEsSUFDWDtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFNBQVMsaUJBQ1AsUUFBUSxJQUFJLGlDQUFpQyxVQUM3QyxnQkFBZ0I7QUFBQSxFQUNwQixFQUFFLE9BQU8sT0FBTztBQUFBLEVBQ2hCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFDRixFQUFFOyIsCiAgIm5hbWVzIjogW10KfQo=
