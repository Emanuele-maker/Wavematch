import { pointCircle, pointRect, roundRect } from "./utils.js"

export default class Joystick {
    constructor(mode, x, y, w, h, defaultValue, canvas, toWorld, label) {
        this.mode = mode
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.canvas = canvas
        this.toWorld = toWorld
        this.value = defaultValue
        this.handler = mode === "horizontal" ? {
            x: this.x + defaultValue,
            y: this.y + this.h / 2,
            r: this.h * 40 / 100,
            color: "#0fad69"
        } : {
            x: this.x + this.w / 2,
            y: this.y + defaultValue,
            r: this.w * 40 / 100,
            color: "#0fad69"
        }
        this.label = label

        this.canvas.style.touchAction = "none"

        this.canvas.addEventListener("pointerdown", this.onPointerDown)
        this.canvas.addEventListener("pointermove", this.onPointerMove)
        this.canvas.addEventListener("pointerup", this.onPointerUp)
        this.canvas.addEventListener("pointercancel", this.onPointerUp)
    }

    setPosition(x, y) {
        this.x = x
        this.y = y

        if (this.mode === "horizontal") {
            if (!this.active) this.handler.y = this.y + this.h / 2;
            this.handler.x = Math.min(
            Math.max(this.handler.x, this.x + this.handler.r),
            this.x + this.w - this.handler.r
            )
        } else {
            if (!this.active) this.handler.x = this.x + this.w / 2;
            this.handler.y = Math.min(
            Math.max(this.handler.y, this.y + this.handler.r),
            this.y + this.h - this.handler.r
            )
        }
    }

    getPointerWorldPos(e) {
        const rect = this.canvas.getBoundingClientRect()
        const screenX = e.clientX - rect.left
        const screenY = e.clientY - rect.top

        return {
            x: this.toWorld.x(screenX),
            y: this.toWorld.y(screenY)
        }
    }

    onPointerDown = (e) => {
        const p = this.getPointerWorldPos(e)

        if (pointRect(p.x, p.y, this.x, this.y, this.w, this.h)) {
            this.active = true
            this.pointerId = e.pointerId
            this.canvas.setPointerCapture(e.pointerId)
            e.preventDefault()
        }
    }

    onPointerMove = (e) => {
        if (!this.active || e.pointerId !== this.pointerId) return

        const p = this.getPointerWorldPos(e)

        if (this.mode === "horizontal") this.handler.x = p.x
        if (this.mode === "vertical") this.handler.y = p.y
        e.preventDefault()
    }

    onPointerUp = (e) => {
        if (e.pointerId !== this.pointerId) return
        this.active = false
        this.canvas.releasePointerCapture(e.pointerId)
        e.preventDefault()
    }

    update() {
        if (this.handler.x - this.handler.r <= this.x) this.handler.x = this.x + this.handler.r
        if (this.handler.y - this.handler.r <= this.y) this.handler.y = this.y + this.handler.r
        if (this.handler.y + this.handler.r >= this.y + this.h) this.handler.y = this.y + this.h - this.handler.r
        if (this.handler.x + this.handler.r >= this.x + this.w) this.handler.x = this.x + this.w - this.handler.r
        this.value = this.mode === "vertical" ? (this.handler.y - this.y) / this.h * 200 : (this.handler.x - this.x) / this.w * 200
    }

    draw(ctx) {
        ctx.strokeStyle = "#FFFFFF"
        ctx.fillStyle = this.handler.color
        ctx.lineWidth = 3
        roundRect(ctx, this.x, this.y, this.w, this.h, this.h / 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(this.handler.x, this.handler.y, this.handler.r, 0, 2 * Math.PI)
        ctx.fill()
        ctx.fillStyle = "#FFFFFF"
        ctx.font = "bold 30px TASA Orbiter"
        ctx.fillText(this.label, this.handler.x - 10, this.handler.y + 5)
    }
}