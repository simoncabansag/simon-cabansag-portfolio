import { PointerLockControlsCannon } from "./PointerLockControlsCannon"

export class Tour {
    controls!: PointerLockControlsCannon

    constructor(controls: PointerLockControlsCannon) {
        this.controls = controls
        this.Init()
        this.StartTour().then(() => (this.controls.enabled = true))
    }

    Init() {
        this.controls.enabled = false
        this.controls.pitchObject.rotation.set(0, 0, 0)
        this.controls.yawObject.rotation.set(0, 0, 0)
    }

    async StartTour() {
        const paintings = [
            this.work,
            this.socials,
            this.yt,
            this.kingdomagape,
            this.gamma,
            this.graphics,
            this.languages,
            this.udk,
            this.fundtap,
        ]

        for (const f of paintings) {
            f.call(this)
            await new Promise((resolve) => setTimeout(resolve, 2500))
        }
    }

    work() {
        this.controls.getObject().position.set(-1.6, 1.8, -6.02)
        this.controls.getObject().rotation.set(0, Math.PI / 2, 0)
    }

    socials() {
        this.controls.getObject().position.set(-1.9, 2.1, -2.9)
        this.controls.getObject().rotation.set(0, Math.PI / 2, 0)
    }
    yt() {
        this.controls.getObject().position.set(-2.685, 1.8, -6.5)
        this.controls.getObject().rotation.set(0, 0, 0)
    }
    kingdomagape() {
        this.controls.getObject().position.set(2.5, 1.8, -6.5)
        this.controls.getObject().rotation.set(0, 0, 0)
    }
    gamma() {
        this.controls.getObject().position.set(2.8, 0.77, -3.92)
        this.controls.getObject().rotation.set(0, -Math.PI / 2, 0)
    }
    graphics() {
        this.controls.getObject().position.set(0.9, 1.7, -0.5)
        this.controls.getObject().rotation.set(0, -Math.PI / 2, 0)
    }
    languages() {
        this.controls.getObject().position.set(3.2, 2.78, 2.17)
        this.controls.getObject().rotation.set(0, -Math.PI / 2, 0)
    }
    udk() {
        this.controls.getObject().position.set(3.1, 2.69, 3.03)
        this.controls.getObject().rotation.set(0, -Math.PI / 2, 0)
    }
    fundtap() {
        this.controls.getObject().position.set(1.6, 1.35, 2.7)
        this.controls.getObject().rotation.set(0, -Math.PI / 2, 0)
    }
}
