import { EventDispatcher, BaseEvent } from "three/src/core/EventDispatcher.js"
import { Vector3 } from "three/src/math/Vector3.js"
import { Euler } from "three/src/math/Euler.js"
import { Quaternion } from "three/src/math/Quaternion.js"
import { Object3DEventMap, Object3D } from "three/src/core/Object3D.js"
import { Vec3 } from "cannon-es"
import { Inputs } from "./inputs"

class PointerLockControlsCannon extends EventDispatcher<{
    [key: string]: BaseEvent<string>
}> {
    enabled: boolean
    cannonBody: any
    velocityFactor: number
    jumpVelocity: number
    pitchObject: Object3D<Object3DEventMap>
    yawObject: Object3D<Object3DEventMap>
    quaternion: Quaternion
    velocity: any
    inputVelocity: Vector3
    euler: Euler
    isLocked!: boolean
    lockEvent: { type: "lock" }
    unlockEvent: { type: string }
    inputs: Inputs

    constructor(camera: any, cannonBody: any, gravity: number) {
        super()

        this.enabled = false
        this.cannonBody = cannonBody
        this.cannonBody.position
        this.velocityFactor = 0.2
        this.jumpVelocity = Math.abs(gravity)
        this.pitchObject = new Object3D()
        this.pitchObject.add(camera)
        this.yawObject = new Object3D()
        this.yawObject.position.y = 2
        this.yawObject.add(this.pitchObject)
        this.quaternion = new Quaternion()
        this.inputs = new Inputs()

        const contactNormal = new Vec3() // Normal in the contact, pointing *out* of whatever the player touched
        const upAxis = new Vec3(0, 1, 0)
        this.cannonBody.addEventListener(
            "collide",
            (event: { contact: any }) => {
                const { contact } = event

                // contact.bi and contact.bj are the colliding bodies, and contact.ni is the collision normal.
                // We do not yet know which one is which! Let's check.
                if (contact.bi.id === this.cannonBody.id) {
                    // bi is the player body, flip the contact normal
                    contact.ni.negate(contactNormal)
                } else {
                    // bi is something else. Keep the normal as it is
                    contactNormal.copy(contact.ni)
                }

                // If contactNormal.dot(upAxis) is between 0 and 1, we know that the contact normal is somewhat in the up direction.
                if (contactNormal.dot(upAxis) > 0.5) {
                    // Use a "good" threshold value between 0 and 1 here!
                    this.inputs.canJump = true
                }
            }
        )

        this.velocity = this.cannonBody.velocity

        // Moves the camera to the cannon.js object position and adds velocity to the object if the run key is down
        this.inputVelocity = new Vector3()
        this.euler = new Euler()

        this.lockEvent = { type: "lock" }
        this.unlockEvent = { type: "unlock" }

        this.connect()
    }

    connect() {
        document.addEventListener("mousemove", (e) => {
            this.inputs.onPointerMove(e)
            this.updateCamera()
        })
        document.addEventListener("touchmove", (e) => {
            this.inputs.onPointerMove(e)
            this.updateCamera()
        })
        document.addEventListener("touchstart", (e) =>
            this.inputs.touchStart(e)
        )
        document.addEventListener("touchend", (e) => this.inputs.touchEnd(e))
        document.addEventListener("pointerlockchange", this.onPointerlockChange)
        document.addEventListener("pointerlockerror", this.onPointerlockError)
        document.addEventListener("keydown", this.inputs.onKeyDown)
        document.addEventListener("keyup", this.inputs.onKeyUp)
    }

    disconnect() {
        document.removeEventListener("mousemove", this.inputs.onPointerMove)
        document.removeEventListener("touchmove", this.inputs.onPointerMove)
        document.removeEventListener("touchstart", this.inputs.onPointerMove)
        document.removeEventListener("touchend", this.inputs.onPointerMove)
        document.removeEventListener(
            "pointerlockchange",
            this.onPointerlockChange
        )
        document.removeEventListener(
            "pointerlockerror",
            this.onPointerlockError
        )
        document.removeEventListener("keydown", this.inputs.onKeyDown)
        document.removeEventListener("keyup", this.inputs.onKeyUp)
    }

    dispose() {
        this.disconnect()
    }

    lock() {
        document.body.requestPointerLock()
    }

    unlock() {
        document.exitPointerLock()
    }

    onPointerlockChange = () => {
        if (document.pointerLockElement) {
            this.dispatchEvent(this.lockEvent)

            this.isLocked = true
        } else {
            this.dispatchEvent(this.unlockEvent)

            this.isLocked = false
        }
    }

    onPointerlockError = () => {
        console.error(
            "PointerLockControlsCannon: Unable to use Pointer Lock API"
        )
    }

    updateCamera = () => {
        if (!this.enabled) return

        const { movementX, movementY } = this.inputs.curr
        this.yawObject.rotation.y -= movementX * 0.002
        this.pitchObject.rotation.x -= movementY * 0.002

        this.pitchObject.rotation.x = Math.max(
            -Math.PI / 2,
            Math.min(Math.PI / 2, this.pitchObject.rotation.x)
        )
    }

    getObject() {
        return this.yawObject
    }

    update(delta: number) {
        this.updateTranslation(delta)
    }

    // updateCamera() {}
    // updateTranslation() {}
    // updateHeadBob() {}

    updateTranslation(delta: number) {
        if (this.enabled === false) {
            return
        }

        delta *= 1000
        delta *= 0.1

        this.inputVelocity.set(0, 0, 0)

        if (this.inputs.moveForward) {
            this.inputVelocity.z = -this.velocityFactor * delta
        }
        if (this.inputs.moveBackward) {
            this.inputVelocity.z = this.velocityFactor * delta
        }

        if (this.inputs.moveLeft) {
            this.inputVelocity.x = -this.velocityFactor * delta
        }
        if (this.inputs.moveRight) {
            this.inputVelocity.x = this.velocityFactor * delta
        }

        // Convert velocity to world coordinates
        this.euler.x = this.pitchObject.rotation.x
        this.euler.y = this.yawObject.rotation.y
        this.euler.order = "XYZ"
        this.quaternion.setFromEuler(this.euler)
        this.inputVelocity.applyQuaternion(this.quaternion)

        // Add to the object
        this.velocity.x += this.inputVelocity.x
        this.velocity.z += this.inputVelocity.z

        this.yawObject.position.copy(this.cannonBody.position)
    }
}

export { PointerLockControlsCannon }
