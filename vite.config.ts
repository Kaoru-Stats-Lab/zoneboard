import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { boardSpaShellPlugin } from "./vite-plugin-board-spa-shell";
import { siteConsentPlugin } from "./vite-plugin-site-consent";
import { siteDocRoutesPlugin } from "./vite-plugin-site-doc-routes";

export default defineConfig({
  plugins: [
    react(),
    siteDocRoutesPlugin(),
    siteConsentPlugin(),
    boardSpaShellPlugin(),
  ],
});
