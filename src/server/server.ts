import { readFileSync } from "node:fs"
import { join } from "node:path"
import express from "express"
import { createServer as createHttpServer } from "http"
import { initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { cert } from "firebase-admin/app"

const buildDir = "dist"
const isProduction = process.env.NODE_ENV === "production"

;(async () => {
    if (!isProduction) {
        const dotenv = await import("dotenv")
        dotenv.config()
    }

    const serviceAccount = join(process.cwd(), process.env.FIREBASE_ADMIN_KEY)

    initializeApp({
        credential: cert(serviceAccount),
    })

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

    app.use((req, _res, next) => {
        console.log(`${req.method} ${req.path}`)
        next()
    })

    app.use(express.json())

    app.get("/gallery-model", (req, res) => {
        if (!req.headers.authorization) {
            res.status(500).json("Unauthorised!")
        }

        const token = req.headers.authorization?.split(" ")[1]
        getAuth()
            .verifyIdToken(token!)
            .then(() => {
                let template = readFileSync(
                    join(process.cwd(), "/model/art-gallery.glb")
                )

                res.status(200)
                    .set({ "Content-Type": "model/gltf-binary" })
                    .end(template)
            })
            .catch((err) => {
                console.error(err.message)
                res.status(500).json("Couldn't verify token")
            })
    })

    app.get("/environment-mapping", (req, res) => {
        if (!req.headers.authorization) {
            res.status(500).json("Unauthorised!")
        }

        const token = req.headers.authorization?.split(" ")[1]
        getAuth()
            .verifyIdToken(token!)
            .then(() => {
                let template = readFileSync(
                    join(process.cwd(), "/model/rosendal_plains_2_1k.hdr")
                )

                res.status(200)
                    .set({ "Content-Type": "application/octet-stream" })
                    .end(template)
            })
            .catch((err) => {
                console.error(err.message)
                res.status(500).json("Couldn't verify token")
            })
    })

    app.get("*", (_req, res) => {
        res.status(404).send({ message: "404 not found" })
    })

    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    })
})()
