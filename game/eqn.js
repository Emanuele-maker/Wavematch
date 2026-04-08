import { GAME_HEIGHT, getRandomInt, pointRect } from "./utils.js"

export default class Equation {
    constructor(color) {
        this.A = getRandomInt(30, 190)
        this.T = 10
        this.lambda = getRandomInt(80, 200)
        this.t = 0
        this.color = color
        this.difficulty = 30 / 100
    }
    reset() {
        this.A = getRandomInt(30, 200)
        // this.T = 10
        this.lambda = getRandomInt(80, 200)
        // this.t = 0
    }
    draw(ctx, leftEdge, rightEdge) {
        ctx.beginPath()
        ctx.lineWidth = 2
        ctx.strokeStyle = this.color

        for (let x = leftEdge; x <= rightEdge; x += 5) {
            const y = GAME_HEIGHT / 2 + this.A * Math.cos(
                (2 * Math.PI / this.lambda) * x -
                (2 * Math.PI / this.T) * this.t
            )

            if (x === leftEdge) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
        }

        ctx.stroke()
    }
    update() {
        this.t += this.difficulty
    }
}