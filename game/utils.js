const GAME_WIDTH = 1280
const GAME_HEIGHT = 720

const roundRect = (ctx, x, y, width, height, radius) => {
  if (width < 2 * radius) radius = width / 2
  if (height < 2 * radius) radius = height / 2
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + width, y, x + width, y + height, radius)
  ctx.arcTo(x + width, y + height, x, y + height, radius)
  ctx.arcTo(x, y + height, x, y, radius)
  ctx.arcTo(x, y, x + width, y, radius)
  ctx.closePath()
}

const pointCircle = (px, py, cx, cy, r) => {
  const distX = px - cx
  const distY = py - cy
  const distance = Math.sqrt( (distX*distX) + (distY*distY) )

  return distance <= r
}

const pointRect = (px, py, rx, ry, rw, rh) => px >= rx && px <= rx + rw && py >= ry && py <= ry + rh

const randomColor = () => {
  const chars = "0123456789ABCDEF"
  let color = "#"
  for (let i = 0; i < 6; i++) {
    color += chars[Math.floor(Math.random() * chars.length)]
  }
  return color
}

const getRandomInt = (min, max) => {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
}


export {
    GAME_WIDTH,
    GAME_HEIGHT,
    roundRect,
    pointCircle,
    pointRect,
    randomColor,
    getRandomInt
}