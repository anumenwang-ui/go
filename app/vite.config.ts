import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "GO",
        short_name: "GO",
        description: "GO - 个人生活助理，每日焦点、阅读室、会员资产一站式管理",
        theme_color: "#fafaf9",
        background_color: "#fafaf9",
        display: "standalone",
        orientation: "portrait-primary",
        start_url: "./",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.unsplash\.com\/.*$/i,
            handler: "StaleWhileRevalidate",
          },
        ],
      },
    }),
  ],
});
