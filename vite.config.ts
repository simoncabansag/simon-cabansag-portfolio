import { defineConfig } from "vite"
import path from "node:path"

export default defineConfig({
    esbuild: {
        supported: {
            "top-level-await": true,
        },
    },
    root: path.resolve(__dirname),
    server: {
        middlewareMode: true,
    },
    build: {
        outDir: "dist",
    },
})
