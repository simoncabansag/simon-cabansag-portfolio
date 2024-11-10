import { WebGLRenderer } from "three/src/renderers/WebGLRenderer.js"
import { PerspectiveCamera } from "three/src/cameras/PerspectiveCamera.js"
import { Scene } from "three/src/scenes/Scene.js"
import { BoxGeometry } from "three/src/geometries/BoxGeometry.js"
import { Mesh } from "three/src/objects/Mesh.js"
import { MeshBasicMaterial } from "three/src/materials/MeshBasicMaterial.js"
import { signInAnonymously } from "firebase/auth"
import { firebase } from "./firebase.ts"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

const serverURL = "http://localhost:8124"
const galleryModelUrl = "/gallery-model"

class Portfolio {
    threejs!: WebGLRenderer
    scene!: Scene
    camera!: PerspectiveCamera
    cube!: any
    previousRAF!: number

    constructor(serverAssets: { Gallery?: any }) {
        console.log("serverAssets.Mesh: ", serverAssets.Gallery)
        this.Initialize()
        this.RAF()
    }

    Initialize() {
        this.threejs = new WebGLRenderer({
            antialias: true,
        })
        this.threejs.setSize(window.innerWidth, window.innerHeight)
        this.threejs.setPixelRatio(window.devicePixelRatio)
        this.threejs.domElement.className = "main-canvas"
        document
            .getElementById("portfolio")
            ?.appendChild(this.threejs.domElement)

        this.scene = new Scene()

        const fov = 60
        const aspect = window.innerWidth / window.innerHeight
        const near = 1
        const far = 10000
        this.camera = new PerspectiveCamera(fov, aspect, near, far)

        const geometry = new BoxGeometry(1, 1, 1)
        const material = new MeshBasicMaterial({ color: 0x00ff00 })
        this.cube = new Mesh(geometry, material)
        this.scene.add(this.cube)

        this.camera.position.z = 5
    }

    RAF() {
        requestAnimationFrame((t) => {
            if (this.previousRAF == null) {
                this.previousRAF = t
            }

            this.cube.rotation.x += 0.01
            this.cube.rotation.y += 0.01

            this.RAF()

            if (typeof this.scene === "undefined") return
            if (typeof this.camera === "undefined") return
            this.threejs?.render(this.scene, this.camera)
            this.previousRAF = t
        })
    }
}

async function LoadGalleryModel() {
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

        return (
            await fetch(serverURL + galleryModelUrl, {
                method: "GET",
                headers: {
                    Accept: "model/gltf-binary",
                    "Content-Type": "model/gltf-binary",
                    Authorization: `Bearer ${idToken}`,
                },
            })
        )?.arrayBuffer()
    } catch (err: any) {
        throw new Error(`failed to load model: ${err.message}`)
    }
}

const serverAssets: { [key: string]: any } = {}
LoadGalleryModel().then((buffer: ArrayBuffer) => {
    new GLTFLoader().parse(
        buffer,
        "",
        (gltf) => {
            gltf.scene.name = "Gallery"
            serverAssets[gltf.scene.name] = gltf.scene
            window.dispatchEvent(new CustomEvent("loaded"))
        },
        (e) => {
            console.error(e)
        }
    )
})

window.addEventListener("loaded", () => {
    new Portfolio({})
})
