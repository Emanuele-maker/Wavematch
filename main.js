import Equation from "./game/eqn.js"
import Joystick from "./game/joystick.js"
import Obstacle from "./game/obstacle.js"
import { GAME_WIDTH, GAME_HEIGHT } from "./game/utils.js"

const canvas = document.body.appendChild(document.createElement("canvas"))
const ctx = canvas.getContext("2d")

let scale = 1
let offsetX = 0
let offsetY = 0

let difficulty = 30 / 100

const toWorld = {
    x: (screenX) => (screenX - offsetX) / scale,
    y: (screenY) => (screenY - offsetY) / scale
}

const toScreen = {
    x: (worldX) => (worldX * scale) + offsetX,
    y: (worldY) => (worldY * scale) + offsetY
}

let A = 200
let max_A = 200
let lambda = 100
let max_lambda = 200
let T = 30
let min_T = 15
let max_T = 3

const eqn = new Equation("red")
const eqnText = document.getElementById("eqn")
const scoreText = document.getElementById("score-text")
const toMatchEqn = new Equation("blue")
const joy_A = new Joystick("vertical", toWorld.x(20), GAME_HEIGHT / 2 - 100, 100, max_A * 2, eqn.A, canvas, toWorld,"A")
const joy_lambda = new Joystick("horizontal", toWorld.x(430), GAME_HEIGHT - 110, max_lambda * 2, 100, eqn.lambda * 2, canvas, toWorld, "λ")
const joy_T = new Joystick("horizontal", 550, GAME_HEIGHT - 110, 400, 100, eqn.T, canvas, toWorld, "T")

const playerNameInput = document.getElementById("player-name")
const playButton = document.getElementById("play-btn")
const homeContainer = document.getElementById("home-container")
let totalScore = 0
let remainingSeconds = 45

const waveY = (eq, x) =>
  GAME_HEIGHT / 2 +
  eq.A * Math.cos(
    (2 * Math.PI / eq.lambda) * x -
    (2 * Math.PI / eq.T) * eq.t
  )

const waveSlope = (eq, x) => {
  const h = 2 / scale
  return (waveY(eq, x + h) - waveY(eq, x - h)) / (2 * h)
}

function matchScore(target, player, leftEdge, rightEdge) {
  const sampleStep = 6 / scale
  const xTolerance = 10 / scale
  const slopeWeight = 0.2

  let posError = 0
  let slopeError = 0
  let samples = 0

  for (let x = leftEdge; x <= rightEdge; x += sampleStep) {
    const targetY = waveY(target, x)

    let bestDy = Infinity
    for (let dx = -xTolerance; dx <= xTolerance; dx += sampleStep / 4) {
      const dy = Math.abs(targetY - waveY(player, x + dx))
      if (dy < bestDy) bestDy = dy
    }

    const targetSlope = waveSlope(target, x)
    const playerSlope = waveSlope(player, x)
    const ds = Math.abs(targetSlope - playerSlope)

    posError += bestDy
    slopeError += ds
    samples++
  }

  const avgPosError = posError / samples
  const avgSlopeError = slopeError / samples

  const maxPosError = target.A * 0.3
  const maxSlopeError = target.A * 0.5

  const posScore = 1 - Math.min(1, avgPosError / maxPosError)
  const slopeScore = 1 - Math.min(1, avgSlopeError / maxSlopeError)

  return posScore * (1 - slopeWeight) + slopeScore * slopeWeight
}

function anchorJoysticks() {
  const margin = 20
  joy_A.setPosition(
    toWorld.x(margin),
    toWorld.y(canvas.height - margin - joy_A.h * scale)
  )

  joy_lambda.setPosition(
    toWorld.x(canvas.width - margin - joy_lambda.w * scale),
    toWorld.y(canvas.height - margin - joy_lambda.h * scale)
  )
}

const resize = () => {
  canvas.style.width = window.innerWidth + "px"
  canvas.style.height = window.innerHeight + "px"

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const scaleX = canvas.width / GAME_WIDTH
  const scaleY = canvas.height / GAME_HEIGHT
  scale = Math.min(scaleX, scaleY)

  const WORLD_WIDTH = GAME_WIDTH * scale
  const WORLD_HEIGHT = GAME_HEIGHT * scale
  offsetX = (canvas.width - WORLD_WIDTH) / 2
  offsetY = (canvas.height - WORLD_HEIGHT) / 2

  ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY)
  
  if (joy_A && joy_lambda) anchorJoysticks()
}

window.addEventListener("resize", resize)
resize()

let state = "home"
const gameOverScreen = document.getElementById("game-over")
const restartButton = document.getElementById("restart-btn")
let intervalId

const startClock = () => intervalId = setInterval(() => remainingSeconds--, 1000)

playButton.onclick = () => {
  if (playerNameInput.value.length < 3) return
  clearInterval(intervalId)
  startClock()
  state = "game"
  toMatchEqn.reset()
  eqnText.style.display = "block"
  homeContainer.style.display = "none"
  totalScore = 0
  render()
}

restartButton.onclick = () => {
  clearInterval(intervalId)
  startClock()
  state = "game"
  toMatchEqn.reset()
  eqnText.style.display = "block"
  gameOverScreen.style.display = "none"
  totalScore = 0
  render()
}

const submitScore = () => {
  fetch("https://csphotosport.com/beluga/wavematch/submit-score", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      player: playerNameInput.value,
      score: totalScore
    })
  })
}

const render = () => {
  ctx.clearRect(-offsetX / scale, -offsetY / scale, canvas.width / scale, canvas.height / scale)

  if (remainingSeconds <= 0) {
    state = "over"
    clearInterval(intervalId)
    remainingSeconds = 45
    eqnText.style.display = "none"
    submitScore()
  }
  if (state === "over") return gameOverScreen.style.display = "flex"

  const leftEdge = toWorld.x(0)
  const rightEdge = toWorld.x(ctx.canvas.width)
    
  eqn.update()
  joy_A.update()
  joy_lambda.update()
  // joy_T.update()
  toMatchEqn.update()
  // obstacles.forEach(o => o.update())
  eqn.A = max_A - joy_A.value
  eqn.lambda = joy_lambda.value + 50
  // eqn.T = min_T + (joy_T.value / 200) * (max_T - min_T)
  const accuracy = matchScore(toMatchEqn, eqn, leftEdge, rightEdge) + 0.02

  if (accuracy >= 0.9) {
    totalScore++
    toMatchEqn.reset()
  }
  
  // obstacles.forEach(o => o.draw(ctx))
  toMatchEqn.draw(ctx, leftEdge, rightEdge)
  eqn.draw(ctx, leftEdge, rightEdge)
  joy_A.draw(ctx)
  joy_lambda.draw(ctx)
  // joy_T.draw(ctx)

  ctx.font = "40px TASA Orbiter"
  ctx.fillText(`Accuratezza: ${Math.round(accuracy * 100)}%`, toWorld.x(20), 95)
  ctx.fillText(`Punteggio: ${totalScore}`, toWorld.x(20), 45)
  ctx.fillText(`Tempo: ${remainingSeconds}s`, GAME_WIDTH / 2 - 120, 45)
  const str = `$$
  ${Math.round(eqn.A)}\\cos\\left(\\frac{2\\pi}{${Math.round(eqn.lambda)}}x - \\frac{2\\pi}{${eqn.T}}t\\right)
  $$`
  
  eqnText.innerHTML = str
  scoreText.innerText = `Punteggio: ${totalScore}`
  MathJax.typesetClear([eqnText])
  MathJax.typesetPromise([eqnText])
  
  requestAnimationFrame(render)
}

await document.fonts.load("16px TASA Orbiter")
await document.fonts.ready
render()