import { WebGLRenderer } from "three/src/renderers/WebGLRenderer.js"
import { PerspectiveCamera } from "three/src/cameras/PerspectiveCamera.js"
import { Scene } from "three/src/scenes/Scene.js"
import { BoxGeometry } from "three/src/geometries/BoxGeometry.js"
import { Mesh } from "three/src/objects/Mesh.js"
import { MeshBasicMaterial } from "three/src/materials/MeshBasicMaterial.js"

class Portfolio {
    threejs!: WebGLRenderer
    scene!: Scene
    camera!: PerspectiveCamera
    cube!: any
    previousRAF!: number

    constructor() {
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

window.addEventListener("DOMContentLoaded", () => {
    new Portfolio()
})
