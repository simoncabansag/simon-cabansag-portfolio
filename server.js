import { createServer } from "node:http"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import express from "express"
import dotenv from "dotenv"

if (process.env.NODE_ENV !== "production") {
    dotenv.config()
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const server = createServer(app)
const PORT = process.env.PORT

app.use(express.json())
app.use(express.static(join(__dirname, "./client")))

app.use("*", (_req, res) => {
    res.status(404).json({ Message: "404 not found" })
})

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
