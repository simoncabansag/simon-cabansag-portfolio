export class Inputs {
    moveForward = false
    moveBackward = false
    moveLeft = false
    moveRight = false
    canJump = false

    center: { screenX: number; screenY: number } | null = null
    prev: { screenX: number; screenY: number } | null = null
    curr = {
        movementX: 0,
        movementY: 0,
    }

    onKeyDown = (event: { code: any }) => {
        switch (event.code) {
            case "KeyW":
            case "ArrowUp":
                this.moveForward = true
                break

            case "KeyA":
            case "ArrowLeft":
                this.moveLeft = true
                break

            case "KeyS":
            case "ArrowDown":
                this.moveBackward = true
                break

            case "KeyD":
            case "ArrowRight":
                this.moveRight = true
                break

            case "Space":
                // if (this.canJump) {
                //     this.velocity.y = this.jumpVelocity
                // }
                this.canJump = false
                break
        }
    }

    onKeyUp = (event: { code: any }) => {
        switch (event.code) {
            case "KeyW":
            case "ArrowUp":
                this.moveForward = false
                break

            case "KeyA":
            case "ArrowLeft":
                this.moveLeft = false
                break

            case "KeyS":
            case "ArrowDown":
                this.moveBackward = false
                break

            case "KeyD":
            case "ArrowRight":
                this.moveRight = false
                break
        }
    }

    touchStart(e: TouchEvent) {
        if (!this.center) {
            this.center = {
                screenX: e.touches[0]?.screenX ?? 0,
                screenY: e.touches[0]?.screenY ?? 0,
            }
            this.prev = { ...this.center }
            return
        }
    }

    touchEnd(e: TouchEvent) {
        this.center = null
    }

    onPointerMove(e: MouseEvent | TouchEvent) {
        let screenX: number, screenY: number
        if (e instanceof MouseEvent) {
            const { movementX, movementY } = e
            this.curr.movementX = movementX
            this.curr.movementY = movementY
            return
        } else if (e instanceof TouchEvent && e.touches.length === 1) {
            if (!this.prev || !this.center) return

            screenX = e.touches[0]?.screenX ?? 0
            screenY = e.touches[0]?.screenY ?? 0

            this.curr.movementX = screenX - this.center.screenX
            this.curr.movementY = screenY - this.center.screenY

            this.prev = { screenX, screenY }
        }
    }
}

// export class Inputs {
//     current = {
//         leftButton: false,
//         rightButton: false,
//         mouseX: 0,
//         mouseY: 0,
//         mouseXDelta: 0,
//         mouseYDelta: 0,
//     }
//     previousKeys = {}
//     keys = {
//         forward: false,
//         backward: false,
//         left: false,
//         right: false,
//         shift: false,
//         space: false,
//         lcontrol: false,
//     }
//     previous!: {
//         leftButton: boolean
//         rightButton: boolean
//         mouseX: number
//         mouseY: number
//         mouseXDelta: number
//         mouseYDelta: number
//     } | null

//     onMouseDown(e: MouseEvent) {
//         switch (e.button) {
//             case 0: {
//                 this.current.leftButton = true
//                 break
//             }
//             case 2: {
//                 this.current.rightButton = true
//                 break
//             }
//         }
//     }

//     onMouseUp(e: MouseEvent) {
//         switch (e.button) {
//             case 0: {
//                 this.current.leftButton = false
//                 break
//             }
//             case 2: {
//                 this.current.rightButton = false
//                 break
//             }
//         }
//     }

//     onMouseMove(e: MouseEvent | TouchEvent) {
//         let clientX: number, clientY: number

//         if ("touches" in e && e.touches.length > 0) {
//             clientX =
//         } else if ("clientX" in e) {
//             // mouse event
//             clientX = e.clientX
//             clientY = e.clientY
//         } else {
//             return // exit
//         }

//         this.current.mouseX = e.clientX - window.innerWidth / 2
//         this.current.mouseY = e.clientY - window.innerHeight / 2

//         if (this.previous == null) {
//             this.previous = { ...this.current }
//         }

//         this.current.mouseXDelta = this.current.mouseX - this.previous.mouseX
//         this.current.mouseYDelta = this.current.mouseY - this.previous.mouseY

//         this.previous.mouseX = this.current.mouseX
//         this.previous.mouseY = this.current.mouseY
//     }

//     onKeyDown(e: KeyboardEvent) {
//         switch (e.key) {
//             case "w":
//                 this.keys.forward = true
//                 break
//             case "a":
//                 this.keys.left = true
//                 break
//             case "s":
//                 this.keys.backward = true
//                 break
//             case "d":
//                 this.keys.right = true
//                 break
//             case " ":
//                 this.keys.space = true
//                 break
//             case "Control":
//                 this.keys.lcontrol = true
//                 break
//         }
//     }

//     onKeyUp(e: KeyboardEvent) {
//         switch (e.key) {
//             case "w":
//                 this.keys.forward = false
//                 break
//             case "a":
//                 this.keys.left = false
//                 break
//             case "s":
//                 this.keys.backward = false
//                 break
//             case "d":
//                 this.keys.right = false
//                 break
//             case " ":
//                 this.keys.space = false
//                 break
//             case "Control":
//                 this.keys.lcontrol = true
//                 break
//         }
//     }

//     update() {
//         this.previous = { ...this.current }
//     }
// }
