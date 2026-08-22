import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiProxy = {
  "/api": {
    target: "http://127.0.0.1:5000",
    changeOrigin: true,
    secure: false, // Don't verify SSL for local backend
  },
};

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: apiProxy,
    host: "0.0.0.0", // Allow access from phones on the local network
  },
  preview: { proxy: apiProxy },
});
