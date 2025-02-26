import { Scene } from "three/src/scenes/Scene.js"
import { Camera } from "three/src/cameras/Camera.js"
import { Raycaster } from "three/src/core/Raycaster.js"
import { Vector2 } from "three/src/math/Vector2.js"
import { intersects, mapping, overlays } from "./paintings"
import { gsap } from "gsap"
import { Mesh } from "three/src/objects/Mesh.js"
import { MeshStandardMaterial } from "three/src/materials/MeshStandardMaterial.js"

export class Interaction {
    camera: Camera
    raycaster = new Raycaster()
    readonly center = new Vector2(0, 0)
    readonly raycastInterval = 300
    scene: Scene
    lastRaycastTime = 0
    intersects: MeshStandardMaterial[]
    recentIntersects = new Set<MeshStandardMaterial>()

    constructor(
        camera: Camera,
        scene: Scene,
        intersects: MeshStandardMaterial[]
    ) {
        this.camera = camera
        this.scene = scene
        this.intersects = intersects

        this.Init()
    }

    Init() {
        intersects.forEach((name) => {
            const obj = this.scene.getObjectByName(name) as Mesh
            ;(obj.material as MeshStandardMaterial).name = name
        })

        overlays.forEach((name) => {
            const obj = this.scene.getObjectByName(name) as Mesh
            ;(obj.material as MeshStandardMaterial).name = name
        })
    }

    castRay() {
        const now = performance.now()
        if (now - this.lastRaycastTime < this.raycastInterval) return
        this.lastRaycastTime = now

        const check = intersects
            .map((name) => {
                return this.scene.getObjectByName(name)
            })
            .filter((o) => o !== undefined)

        this.raycaster.setFromCamera(this.center, this.camera)
        const i = this.raycaster.intersectObjects(check, true)

        const currentlyIntersected = new Set<MeshStandardMaterial>()

        if (i.length > 0 && i[0]) {
            const p = this.scene.getObjectByName(i[0].object.name)
            const m = p as Mesh
            const mm = m.material as MeshStandardMaterial

            const om = (
                this.scene.getObjectByName(
                    mapping[i[0].object.name] ?? ""
                )! as Mesh
            ).material as MeshStandardMaterial

            gsap.to(om, {
                duration: 0.3,
                opacity: 1,
                ease: "power1.inOut",
                onStart: () => {
                    om.visible = true
                },
            })
            currentlyIntersected.add(mm)
            if (!this.recentIntersects.has(mm)) {
                gsap.to(mm, {
                    duration: 0.3,
                    opacity: 0,
                    ease: "power1.inOut",
                    onComplete: () => {
                        mm.visible = false
                    },
                })
                this.recentIntersects.add(mm)
            }
        }

        const matsToRestore = Array.from(this.recentIntersects).filter(
            (mm) => !currentlyIntersected.has(mm)
        )

        matsToRestore.forEach((m) => {
            gsap.to(m, {
                duration: 0.3,
                opacity: 1,
                ease: "power1.inOut",
                onStart: () => {
                    m.visible = true
                },
            })
            this.recentIntersects.delete(m)

            const m1 = (this.scene.getObjectByName(mapping[m.name]!) as Mesh)
                .material as MeshStandardMaterial

            gsap.to(m1, {
                duration: 0.3,
                opacity: 0,
                ease: "power1.inOut",
                onComplete: () => {
                    m1.visible = false
                },
            })
        })
    }
}
