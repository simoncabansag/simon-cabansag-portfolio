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
    deltaTime!: number
    phi = 0
    theta = 0
    speed = 2
    headBobTimer = 0
    headBobActive = false
    headBobSpeed = 10
    headBobHeight = 0.05
    height = 0.3

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
        this.camera.position.y +=
            this.height +
            Math.sin(this.headBobTimer * this.headBobSpeed) * this.headBobHeight
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
        forward.multiplyScalar(forwardVelocity * this.deltaTime * this.speed)

        const left = new Vector3(-1, 0, 0)
        left.applyQuaternion(qx)
        left.multiplyScalar(strafeVelocity * this.deltaTime * this.speed)

        this.translation.add(forward)
        this.translation.add(left)

        if (forwardVelocity != 0 || strafeVelocity != 0) {
            this.headBobActive = true
        }
    }

    updateHeadBob() {
        if (this.headBobActive) {
            const waveLength = Math.PI
            const nextStep =
                1 +
                Math.floor(
                    ((this.headBobTimer + 0.000001) * this.headBobSpeed) /
                        waveLength
                )
            const nextStepTime = (nextStep * waveLength) / this.headBobSpeed
            this.headBobTimer = Math.min(
                this.headBobTimer + this.deltaTime,
                nextStepTime
            )

            if (this.headBobTimer == nextStepTime) this.headBobActive = false
        }
    }
}
