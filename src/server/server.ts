import { readFileSync } from "node:fs"
import { join } from "node:path"
import express from "express"
import { createServer as createHttpServer } from "http"

const buildDir = "dist"
const isProduction = process.env.NODE_ENV === "production"
if (!isProduction) {
    const dotenv = await import("dotenv")
    dotenv.config()
}

async function startServer() {
    const PORT = process.env.PORT
    const app = express()
    const server = createHttpServer(app) // customise the server e.g. include custom https cert

    if (!isProduction) {
        const { createServer: createViteServer } = await import("vite")
        const vite = await createViteServer({
            server: {
                middlewareMode: true,
                hmr: server,
            },
            appType: "custom", // spa default, custom - (SSR and frameworks with custom HTML handling)
        })

        app.use(vite.middlewares)

        app.get("/", async (req, res) => {
            let template = readFileSync(join(process.cwd(), "/index.html"), {
                encoding: "utf-8",
            })

            template = await vite.transformIndexHtml(req.url, template)
            res.status(200).set({ "Content-Type": "text/html" }).end(template)
        })
    } else {
        app.use(express.static(join(process.cwd(), buildDir)))
    }

    app.use(express.json())

    app.get("/api/hello", (_req, res) => {
        res.json({ message: "Hello from the server!" })
    })

    app.get("*", (_req, res) => {
        res.status(404).send({ message: "404 not found" })
    })

    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    })
}

startServer()
