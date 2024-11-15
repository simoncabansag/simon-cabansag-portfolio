export default class Inputs {
    keys = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        shift: false,
        space: false,
        lcontrol: false,
    }

    constructor() {
        document.addEventListener("keydown", (event) => {
            this.onKeyDown(event), false
        })
        document.addEventListener("keyup", (event) => {
            this.onKeyUp(event), false
        })
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
}
