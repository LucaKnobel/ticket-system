import { loadEnv } from "vite";
import path from "node:path";
import { defineConfig } from "vitest/config";

const rootDir = import.meta.dirname;

export default defineConfig(({ mode }) => ({
  resolve: {
    alias: {
      "@application": path.resolve(rootDir, "./src/application"),
      "@infrastructure": path.resolve(rootDir, "./src/infrastructure"),
      "@generated": path.resolve(rootDir, "./generated"),
      "@config": path.resolve(rootDir, "./src/config"),
      "@src": path.resolve(rootDir, "./src"),
    },
  },
  test: {
    environment: "node",
    env: loadEnv(mode, process.cwd(), ""),
  },
}));
