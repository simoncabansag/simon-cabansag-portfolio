import { readFileSync } from "node:fs"
import { join } from "node:path"
import express from "express"
import { createServer as createHttpServer } from "http"
import { initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { cert } from "firebase-admin/app"
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import { fromEnv } from "@aws-sdk/credential-providers"
import { Readable } from "stream"

// need to add this for vite development
const isProduction = process.env.NODE_ENV === "production"
if (!isProduction) {
    const dotenv = await import("dotenv")
    dotenv.config()
}
const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY)
const bucketName = process.env.R2_BUCKET_NAME
const r2client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: fromEnv(),
})

const buildDir = "dist"
const galleryUrl = "art-gallery.glb.gz"
const galleryLowUrl = "art-gallery-low.glb.gz"
const galleryEnvUrl = "rosendal_plains_2_1k.hdr.gz"

;(async () => {
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

    app.get("/gallery-model/:resource", (req, res) => {
        if (!req.headers.authorization) {
            res.status(500).json("Unauthorised!")
        }

        const token = req.headers.authorization?.split(" ")[1]
        getAuth()
            .verifyIdToken(token!)
            .then(async () => {
                let modelUrl
                switch (req.params.resource) {
                    case "low":
                        modelUrl = galleryLowUrl
                        break
                    case "high":
                        modelUrl = galleryUrl
                        break
                    case "env":
                        modelUrl = galleryEnvUrl
                        break
                    default:
                        throw new Error()
                }

                const command = new GetObjectCommand({
                    Bucket: bucketName,
                    Key: modelUrl,
                })

                const data = await r2client.send(command)
                res.status(200).set({
                    "Content-Type": "application/gzip",
                    "Content-Encoding": "gzip",
                })
                ;(data.Body as Readable).pipe(res)
                ;(data.Body as Readable).on("error", () => {
                    res.status(500).json({ error: "Failed to stream file" })
                })
            })
            .catch((err) => {
                console.error(err.message)
                res.status(500).json({ error: "Failed to fetch file" })
            })
    })

    app.get("*", (_req, res) => {
        res.status(404).send({ message: "404 not found" })
    })

    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    })
})()
