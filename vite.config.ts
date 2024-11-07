import { defineConfig } from "vite"
import path from "node:path"

export default defineConfig({
    root: path.resolve(__dirname),
    server: {
        middlewareMode: true,
    },
    build: {
        outDir: "dist",
    },
})
