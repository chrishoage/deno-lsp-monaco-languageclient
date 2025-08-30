import { defineConfig } from "vite";
import importMetaUrlPlugin from "@codingame/esbuild-import-meta-url-plugin";

export default defineConfig({
  build: {
    target: "ES2022",
  },
  rollupOptions: {
    index: "./index.html",
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [importMetaUrlPlugin],
    },
    include: ["vscode-textmate", "vscode-oniguruma"],
  },
  worker: {
    format: "es",
  },
  esbuild: {
    minifySyntax: false,
  },
  server: {
    port: 5173,
  },
});
