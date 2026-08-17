import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import electron from "vite-plugin-electron";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "e-sekooly",
        short_name: "e-sekooly",
        description: "Gestion scolaire premium — offline first",
        theme_color: "#2389DE",
        background_color: "#0A1120",
        display: "standalone",
        icons: [{ src: "/logo.svg", sizes: "any", type: "image/svg+xml" }],
      },
    }),
    electron([
      {
        entry: "electron/main.ts",
        vite: {
          build: {
            outDir: "dist-electron",
          },
        },
      },
      {
        entry: "electron/preload.ts",
        vite: {
          build: {
            outDir: "dist-electron",
          },
        },
      },
    ]),
  ],
  server: {
    port: 5173,
    proxy: {
      '/uploads': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
