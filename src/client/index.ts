import { WebGLRenderer } from "three/src/renderers/WebGLRenderer.js"
import { PerspectiveCamera } from "three/src/cameras/PerspectiveCamera.js"
import { Scene } from "three/src/scenes/Scene.js"
import { signInAnonymously } from "firebase/auth"
import { firebase } from "./firebase.ts"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { DirectionalLight } from "three/src/lights/DirectionalLight.js"
import { AmbientLight } from "three/src/lights/AmbientLight.js"
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js"
import {
    EquirectangularReflectionMapping,
    LinearToneMapping,
} from "three/src/constants.js"
import { FirstPersonCamera } from "./first-person-camera.ts"
import { Mesh } from "three/src/objects/Mesh.js"
import { MeshStandardMaterial } from "three/src/materials/MeshStandardMaterial.js"
import { BoxGeometry } from "three/src/geometries/BoxGeometry.js"
import { SphereGeometry } from "three/src/geometries/SphereGeometry.js"
import { Object3D, Object3DEventMap } from "three/src/core/Object3D.js"
// import { OrbitControls } from "three/examples/jsm/Addons.js"
import * as CANNON from "cannon-es"
import { PointerLockControlsCannon } from "./PointerLockControlsCannon.ts"
import { PlaneGeometry } from "three/src/geometries/PlaneGeometry.js"
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js"
import { MeshoptDecoder } from "meshoptimizer/meshopt_decoder.module.js"

const galleryModelUrl = "/gallery-model/high"
const environmentMapping = "/gallery-model/env"

let renderer: WebGLRenderer | null = new WebGLRenderer({ antialias: true })

class Portfolio {
    threejs!: WebGLRenderer
    scene!: Scene
    camera!: PerspectiveCamera
    previousRAF!: number
    serverAssets!: { [key: string]: any }
    firstPersonCamera!: FirstPersonCamera
    world!: CANNON.World
    controls!: PointerLockControlsCannon
    material: any
    gravity = -9.81
    physicsMaterial: any
    balls: CANNON.Body[] = []
    ballMeshes: Mesh<SphereGeometry, any, Object3DEventMap>[] = []
    boxes: CANNON.Body[] = []
    boxMeshes: Mesh<BoxGeometry, any, Object3DEventMap>[] = []

    constructor(serverAssets: { [key: string]: any }) {
        this.serverAssets = serverAssets
        this.Initialize()
        this.RAF()
    }

    Initialize() {
        this.threejs = renderer!
        renderer = null

        // renderer.setSize(window.innerWidth, window.innerHeight)
        // renderer.setPixelRatio(window.devicePixelRatio)

        this.threejs.setSize(window.innerWidth, window.innerHeight)
        this.threejs.setPixelRatio(window.devicePixelRatio)
        this.threejs.domElement.id = "canvas"

        document
            .querySelector("canvas.webgl")
            ?.replaceWith(this.threejs.domElement)

        const fov = 60
        const aspect = window.innerWidth / window.innerHeight
        const near = 0.1
        const far = 10000
        this.camera = new PerspectiveCamera(fov, aspect, near, far)
        // this.camera.position.set(50, 10, 50)
        this.threejs.setClearColor(0x505050)
        this.threejs.toneMapping = LinearToneMapping
        const ambient = new AmbientLight(0xffffff, 0.1)
        const light = new DirectionalLight(0xffffff, 5)
        light.position.set(0, 0, 0)
        this.scene = new Scene()
        const env = this.serverAssets["env"]
        env.mapping = EquirectangularReflectionMapping
        this.scene.background = env
        this.scene.environment = env
        this.scene.add(ambient)
        this.scene.add(light)

        const gallery: Object3D<Object3DEventMap> = this.serverAssets["gallery"]
        // const orbit = new OrbitControls(this.camera, this.threejs.domElement)
        this.scene.add(gallery)

        this.LoadCollisions()
    }

    LoadCollisions() {
        this.world = new CANNON.World()
        this.world.defaultContactMaterial.contactEquationStiffness = 1e9
        this.world.defaultContactMaterial.contactEquationRelaxation = 4
        const solver = new CANNON.GSSolver()
        solver.iterations = 7
        solver.tolerance = 0.1
        this.world.solver = new CANNON.SplitSolver(solver)
        this.world.gravity.set(0, this.gravity, 0)
        this.physicsMaterial = new CANNON.Material("physics")
        const physics_physics = new CANNON.ContactMaterial(
            this.physicsMaterial,
            this.physicsMaterial,
            {
                friction: 0.0,
                restitution: 0.0,
            }
        )
        this.world.addContactMaterial(physics_physics)

        const floorGeometry = new PlaneGeometry(10, 20)
        floorGeometry.rotateX(-Math.PI / 2)
        const floor = new Mesh(floorGeometry, this.material)
        floor.position.set(0, 0, 0)
        floor.receiveShadow = true

        this.material = new MeshStandardMaterial({ color: "red" })
        const northWall = new Mesh(new PlaneGeometry(10, 8), this.material)
        northWall.receiveShadow = true
        northWall.position.set(0, 2, -8.11)

        const westWall = new Mesh(new PlaneGeometry(17, 8), this.material)
        westWall.geometry.rotateY(Math.PI / 2)
        westWall.receiveShadow = true
        westWall.position.set(-3.88, 2, 0)

        const eastWall = new Mesh(new PlaneGeometry(17, 8), this.material)
        eastWall.geometry.rotateY(-Math.PI / 2)
        eastWall.receiveShadow = true
        eastWall.position.set(3.68, 2, 0)

        const southWall = new Mesh(new PlaneGeometry(10, 8), this.material)
        southWall.geometry.rotateX(Math.PI)
        southWall.receiveShadow = true
        southWall.position.set(0, 2, 7.37)

        // this.scene.add(floor, southWall, northWall, westWall, eastWall)

        const { width: floorWidth, height: floorHeight } =
            floor.geometry.parameters
        const { x: floorX, y: floorY, z: floorZ } = floor.position
        const { width: northWallWidth, height: northWallHeight } =
            northWall.geometry.parameters
        const {
            x: northWallX,
            y: northWallY,
            z: northWallZ,
        } = northWall.position
        const { width: westWallWidth, height: westWallHeight } =
            westWall.geometry.parameters
        const { x: westWallX, y: westWallY, z: westWallZ } = westWall.position
        const { width: eastWallWidth, height: eastWallHeight } =
            eastWall.geometry.parameters
        const { x: eastWallX, y: eastWallY, z: eastWallZ } = eastWall.position
        const { width: southWallWidth, height: southWallHeight } =
            southWall.geometry.parameters
        const {
            x: southWallX,
            y: southWallY,
            z: southWallZ,
        } = southWall.position

        const floorBody = new CANNON.Body({
            mass: 0,
            material: this.physicsMaterial,
            position: new CANNON.Vec3(floorX, floorY, floorZ),
        })

        const northWallBody = new CANNON.Body({
            mass: 0,
            material: this.physicsMaterial,
            position: new CANNON.Vec3(northWallX, northWallY, northWallZ),
        })
        const westWallBody = new CANNON.Body({
            mass: 0,
            material: this.physicsMaterial,
            position: new CANNON.Vec3(westWallX, westWallY, westWallZ),
        })
        const eastWallBody = new CANNON.Body({
            mass: 0,
            material: this.physicsMaterial,
            position: new CANNON.Vec3(eastWallX, eastWallY, eastWallZ),
        })
        const southWallBody = new CANNON.Body({
            mass: 0,
            material: this.physicsMaterial,
            position: new CANNON.Vec3(southWallX, southWallY, southWallZ),
        })

        floorBody.addShape(
            new CANNON.Box(
                new CANNON.Vec3(floorWidth / 2, floorHeight / 2, 0.1)
            )
        )
        northWallBody.addShape(
            new CANNON.Box(
                new CANNON.Vec3(northWallWidth / 2, northWallHeight / 2, 0.1)
            )
        )
        westWallBody.addShape(
            new CANNON.Box(
                new CANNON.Vec3(westWallWidth / 2, westWallHeight / 2, 0.1)
            )
        )
        eastWallBody.addShape(
            new CANNON.Box(
                new CANNON.Vec3(eastWallWidth / 2, eastWallHeight / 2, 0.1)
            )
        )
        southWallBody.addShape(
            new CANNON.Box(
                new CANNON.Vec3(southWallWidth / 2, southWallHeight / 2, 0.1)
            )
        )

        floorBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
        northWallBody.quaternion.setFromEuler(0, 0, 0)
        westWallBody.quaternion.setFromEuler(0, Math.PI / 2, 0)
        eastWallBody.quaternion.setFromEuler(0, -Math.PI / 2, 0)
        southWallBody.quaternion.setFromEuler(Math.PI, 0, 0)

        this.world.addBody(floorBody)
        this.world.addBody(northWallBody)
        this.world.addBody(westWallBody)
        this.world.addBody(eastWallBody)
        this.world.addBody(southWallBody)

        const playerBody = new CANNON.Body({
            mass: 1,
            material: this.physicsMaterial,
        })
        playerBody.addShape(new CANNON.Box(new CANNON.Vec3(0.5, 1.2, 0.5)))
        playerBody.position.set(0, 5, 0)
        playerBody.linearDamping = 0.9
        this.world.addBody(playerBody)

        this.controls = new PointerLockControlsCannon(
            this.camera,
            playerBody,
            this.gravity
        )

        this.scene.add(this.controls.getObject())
        this.controls.enabled = true

        this.threejs?.render(this.scene, this.camera)
    }

    RAF() {
        const lastUpdate = 0
        requestAnimationFrame((t) => {
            if (this.scene == null || this.camera == null) return
            if (this.previousRAF == null) this.previousRAF = t

            this.threejs?.render(this.scene, this.camera)
            this.Step(t - this.previousRAF, lastUpdate)
            this.previousRAF = t
            this.RAF()
        })
    }

    Step(timeElapsed: number, lastUpdate: number) {
        const _timeElapsed = Math.min(1 / 30, timeElapsed * 0.001)

        if (Math.abs(_timeElapsed - (lastUpdate ?? 0)) >= 0.0021) {
            if (this.controls.enabled) {
                this.world.step(_timeElapsed)
            }
            this.world.step(_timeElapsed, lastUpdate)
            this.controls.update(_timeElapsed)
            // console.log(
            //     this.controls.moveForward,
            //     this.controls.moveBackward,
            //     this.controls.moveLeft,
            //     this.controls.moveRight
            // )
            // this.firstPersonCamera.deltaTime = _timeElapsed
            // this.firstPersonCamera.update()
            lastUpdate = _timeElapsed
        }
    }
}

async function LoadGallery(token: string, url: string) {
    return await new Promise((resolve) => {
        const loader = new GLTFLoader()

        const KTX2loader = new KTX2Loader()
        // KTX2loader.setTranscoderPath("three/examples/jsm/libs/basis/")
        KTX2loader.setTranscoderPath(
            "https://cdn.jsdelivr.net/gh/pmndrs/drei-assets/basis/"
        )
        KTX2loader.detectSupport(renderer!)

        loader.requestHeader = {
            "Accept-Encoding": "gzip",
            Authorization: `Bearer ${token}`,
        }
        loader.setKTX2Loader(KTX2loader)
        loader.setMeshoptDecoder(MeshoptDecoder)
        loader.load(url, (gltf) => {
            gltf.scene.name = "gallery"
            resolve(gltf.scene)
        })
    })
}

async function LoadServerAssets(t0: number) {
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
            throw new Error("User Not Authenticated")
        }

        const t1 = performance.now()
        const gallery: any = await LoadGallery(idToken, galleryModelUrl)
        const diff = t1 - t0
        console.warn(`Loading took ${diff}ms`)

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
        throw new Error(`Failed to load model: ${err.message}`)
    }
}

const t0 = performance.now()
const loading = document.createElement("h3")
loading.style.cssText = `max-width:fit-content;
    margin: 35vh auto;
    font-size:4rem;
    `
document.body.appendChild(loading)
loading.innerText = "Loading..."

LoadServerAssets(t0).then((assets: any) => {
    loading.innerText = "Click to start"
    loading.style.cursor = "pointer"
    loading.style.userSelect = "none"
    new Portfolio(assets)
})
