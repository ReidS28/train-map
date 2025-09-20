import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: true,
    proxy: {
      // PROTOMAPS PROXY RULE
      "/pmtiles": {
        target: "https://demo-bucket.protomaps.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/pmtiles/, ""),
      },
      // OVERTURE MAPS PROXY RULE
      "/overture": {
        target: "https://overturemaps-tiles-us-west-2-beta.s3.amazonaws.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/overture/, ""),
      },
    },
  },
  optimizeDeps: {
    include: ["maplibre-gl"],
  },
});