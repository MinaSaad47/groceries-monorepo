import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/graphql": "http://localhost:3000/",
      "/api": "http://localhost:3000/",
      "/auth": "http://localhost:3000/",
      "/oauth": "http://localhost:3000/",
    },
  },
});
