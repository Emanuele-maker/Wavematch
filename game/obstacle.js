import { GAME_HEIGHT, GAME_WIDTH, getRandomInt, randomColor } from "./utils.js"

export default class Obstacle {
    constructor() {
        this.w = 60
        this.x = 900 // spawn off-screen right
        this.speed = 3

        this.gapH = 140
        this.gapY = Math.random() * (GAME_HEIGHT - this.gapH)
    }

    update() {
        this.x -= this.speed
    }

    draw(ctx) {
        ctx.fillStyle = "white"

        // top wall
        ctx.fillRect(this.x, 0, this.w, this.gapY)

        // bottom wall
        ctx.fillRect(this.x, this.gapY + this.gapH, this.w, GAME_HEIGHT)
    }
}