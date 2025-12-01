import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "/TEAM4/",  // GitHub Pages repo path
  plugins: [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist"), // IMPORTANT: dist folder for GitHub Pages
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    host: true,
  },
});
