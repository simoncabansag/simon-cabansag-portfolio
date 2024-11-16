export class Inputs {
    current = {
        leftButton: false,
        rightButton: false,
        mouseX: 0,
        mouseY: 0,
        mouseXDelta: 0,
        mouseYDelta: 0,
    }
    previousKeys = {}
    keys = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        shift: false,
        space: false,
        lcontrol: false,
    }
    previous!: {
        leftButton: boolean
        rightButton: boolean
        mouseX: number
        mouseY: number
        mouseXDelta: number
        mouseYDelta: number
    } | null

    onMouseDown(e: MouseEvent) {
        switch (e.button) {
            case 0: {
                this.current.leftButton = true
                break
            }
            case 2: {
                this.current.rightButton = true
                break
            }
        }
    }

    onMouseUp(e: MouseEvent) {
        switch (e.button) {
            case 0: {
                this.current.leftButton = false
                break
            }
            case 2: {
                this.current.rightButton = false
                break
            }
        }
    }

    onMouseMove(e: MouseEvent) {
        this.current.mouseX = e.pageX - window.innerWidth / 2
        this.current.mouseY = e.pageY - window.innerHeight / 2

        if (this.previous == null) {
            this.previous = { ...this.current }
        }

        this.current.mouseXDelta = this.current.mouseX - this.previous.mouseX
        this.current.mouseYDelta = this.current.mouseY - this.previous.mouseY
    }

    onKeyDown(e: KeyboardEvent) {
        switch (e.key) {
            case "w":
                this.keys.forward = true
                break
            case "a":
                this.keys.left = true
                break
            case "s":
                this.keys.backward = true
                break
            case "d":
                this.keys.right = true
                break
            case " ":
                this.keys.space = true
                break
            case "Control":
                this.keys.lcontrol = true
                break
        }
    }

    onKeyUp(e: KeyboardEvent) {
        switch (e.key) {
            case "w":
                this.keys.forward = false
                break
            case "a":
                this.keys.left = false
                break
            case "s":
                this.keys.backward = false
                break
            case "d":
                this.keys.right = false
                break
            case " ":
                this.keys.space = false
                break
            case "Control":
                this.keys.lcontrol = true
                break
        }
    }

    update() {
        this.previous = { ...this.current }
    }
}
