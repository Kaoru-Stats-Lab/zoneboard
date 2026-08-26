import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { boardSpaShellPlugin } from "./vite-plugin-board-spa-shell";
import { siteConsentPlugin } from "./vite-plugin-site-consent";

export default defineConfig({
  plugins: [react(), siteConsentPlugin(), boardSpaShellPlugin()],
});
