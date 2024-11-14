import { WebGLRenderer } from "three/src/renderers/WebGLRenderer.js"
import { PerspectiveCamera } from "three/src/cameras/PerspectiveCamera.js"
import { Scene } from "three/src/scenes/Scene.js"
import { signInAnonymously } from "firebase/auth"
import { firebase } from "./firebase.ts"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { DirectionalLight } from "three/src/lights/DirectionalLight.js"
import { AmbientLight } from "three/src/lights/AmbientLight.js"
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js"
import {
    EquirectangularReflectionMapping,
    LinearToneMapping,
} from "three/src/constants.js"

const galleryModelUrl = "/gallery-model"
const environmentMapping = "/environment-mapping"

class Portfolio {
    threejs!: WebGLRenderer
    scene!: Scene
    camera!: PerspectiveCamera
    previousRAF!: number
    serverAssets!: { [key: string]: any }

    constructor(serverAssets: { [key: string]: any }) {
        this.serverAssets = serverAssets
        this.Initialize()
        this.RAF()
    }

    Initialize() {
        this.threejs = new WebGLRenderer({
            antialias: true,
        })
        this.threejs.setSize(window.innerWidth, window.innerHeight)
        this.threejs.setPixelRatio(window.devicePixelRatio)
        this.threejs.domElement.id = "canvas"
        document
            .getElementById("portfolio")
            ?.appendChild(this.threejs.domElement)
        this.threejs.domElement.style.display = "none"

        const fov = 60
        const aspect = window.innerWidth / window.innerHeight
        const near = 1
        const far = 10000
        this.camera = new PerspectiveCamera(fov, aspect, near, far)
        const controls = new OrbitControls(this.camera, this.threejs.domElement)
        this.threejs.setClearColor(0x505050)
        this.threejs.toneMapping = LinearToneMapping
        const ambient = new AmbientLight(0xffffff, 0.1)
        const light = new DirectionalLight(0xffffff, 5)
        light.position.set(0, 0, 0)
        const env = this.serverAssets["env"]
        env.mapping = EquirectangularReflectionMapping

        this.scene = new Scene()
        this.scene.background = env
        this.scene.environment = env
        this.scene.add(ambient)
        this.scene.add(light)
        this.scene.add(this.serverAssets["gallery"])
        this.camera.position.set(0, 4, 7)
        controls.update()

        this.threejs?.render(this.scene, this.camera)
    }

    RAF() {
        requestAnimationFrame((t) => {
            if (this.scene == null || this.camera == null) return
            if (this.previousRAF == null) this.previousRAF = t

            this.threejs?.render(this.scene, this.camera)
            this.previousRAF = t
            this.RAF()
        })
    }
}

async function LoadServerAssets() {
    try {
        await signInAnonymously(firebase)
            .then(() => {
                console.log("signed in!")
            })
            .catch((error) => {
                throw new Error(error)
            })

        const idToken = await firebase.currentUser?.getIdToken(true)

        if (!idToken) {
            throw new Error("user not authenticated")
        }

        const gallery: any = await new Promise((resolve) => {
            const loader = new GLTFLoader()
            loader.requestHeader = {
                Accept: "model/gltf-binary",
                "Content-Type": "model/gltf-binary",
                Authorization: `Bearer ${idToken}`,
            }
            loader.load(galleryModelUrl, (gltf) => {
                gltf.scene.name = "gallery"
                resolve(gltf.scene)
            })
        })

        const env: any = await new Promise((resolve) => {
            const loader = new RGBELoader()
            loader.requestHeader = {
                Accept: "application/octet-stream",
                "Content-Type": "application/octet-stream",
                Authorization: `Bearer ${idToken}`,
            }
            loader.load(environmentMapping, (env) => {
                env.name = "env"
                resolve(env)
            })
        })
        const serverAssets: { [key: string]: any } = {}
        serverAssets[gallery.name] = gallery
        serverAssets["env"] = env

        return new Promise((resolve) => resolve(serverAssets))
    } catch (err: any) {
        throw new Error(`failed to load model: ${err.message}`)
    }
}

const t0 = performance.now()
const loading = document.createElement("h3")
loading.style.cssText = `max-width:fit-content;
    margin: 35vh auto;
    font-size:4rem;
    font-family:\"Inter\"
    `
document.body.appendChild(loading)
loading.innerText = "Loading..."

await LoadServerAssets().then((assets: any) => {
    loading.innerText = "Click to start"
    loading.style.cursor = "pointer"
    loading.style.userSelect = "none"
    new Portfolio(assets)
    const t1 = performance.now()
    console.warn(`Loading took ${t1 - t0}ms`)

    loading.addEventListener("click", () => {
        document.getElementById("canvas")!.style.display = "block"
        loading.remove()
    })
})

// window.addEventListener("DOMContentLoaded", () => {
