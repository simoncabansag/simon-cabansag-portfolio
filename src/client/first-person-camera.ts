import { PerspectiveCamera } from "three/src/cameras/PerspectiveCamera.js"
import { Quaternion } from "three/src/math/Quaternion.js"
import { Vector3 } from "three/src/math/Vector3.js"
import { clamp } from "three/src/math/MathUtils.js"
import { Inputs } from "./inputs"

export class FirstPersonCamera {
    camera!: PerspectiveCamera
    input = new Inputs()
    rotation = new Quaternion()
    translation = new Vector3()
    phi = 0
    theta = 0
    deltaTime!: number

    constructor(camera: PerspectiveCamera) {
        this.camera = camera
        document.addEventListener(
            "mousemove",
            (e) => {
                this.input.onMouseMove(e)
                this.updateRotation()
                this.input.update()
            },
            false
        )
        document.addEventListener("keydown", (e) => {
            this.input.onKeyDown(e), false
        })
        document.addEventListener("keyup", (e) => {
            this.input.onKeyUp(e), false
        })
    }

    updateCamera() {
        this.camera.quaternion.copy(this.rotation)
        this.camera.position.copy(this.translation)
    }

    updateRotation() {
        const xh = this.input.current.mouseXDelta / window.innerWidth
        const yh = this.input.current.mouseYDelta / window.innerHeight

        this.phi += -xh * 5
        this.theta = clamp(this.theta + -yh * 5, -Math.PI / 3, Math.PI / 3)

        const qx = new Quaternion()
        qx.setFromAxisAngle(new Vector3(0, 1, 0), this.phi)
        const qz = new Quaternion()
        qz.setFromAxisAngle(new Vector3(1, 0, 0), this.theta)
        const q = new Quaternion()
        q.multiply(qx)
        q.multiply(qz)

        this.rotation.copy(q)
    }

    updateTranslation() {
        const forwardVelocity =
            (this.input.keys.forward ? 1 : 0) +
            (this.input.keys.backward ? -1 : 0)
        const strafeVelocity =
            (this.input.keys.left ? 1 : 0) + (this.input.keys.right ? -1 : 0)

        const qx = new Quaternion()
        qx.setFromAxisAngle(new Vector3(0, 1, 0), this.phi)

        const forward = new Vector3(0, 0, -1)
        forward.applyQuaternion(qx)
        forward.multiplyScalar(forwardVelocity * this.deltaTime * 10)

        const left = new Vector3(-1, 0, 0)
        left.applyQuaternion(qx)
        left.multiplyScalar(strafeVelocity * this.deltaTime * 10)

        this.translation.add(forward)
        this.translation.add(left)
    }
}
