$ = (e) => document.querySelector(e)
$$ = (e) => document.querySelectorAll(e)


clamp = (e, mn, mx) => Math.min(Math.max(e, mn), mx)

dragula($("#colours"))

let width = 1920
let height = 1080
let prevWidth = width
let prevHeight = height
let scale = 10
let variance = 50
let varianceScale = 100
let p = 7919
let fillStyle = "gradient"
let gradient
let pos1 = { x: 0, y: 0 }
let pos2 = { x: width, y: height }

let c = $("#result")
let ctx = c.getContext("2d")
let s = $("#sampler")
let sctx = s.getContext("2d")

ctx.strokeWeight = 1

let noise = new SimplexNoise()

let factor = 1
let padding = 50
let dotSize = 16
let dragging = false
let dragElement = undefined

updateGradient()
draw()
updateCanvas()
$("#dot1").style.display = "block"
$("#dot2").style.display = "block"

window.addEventListener("resize", updateCanvas)

function draw() {
  let size = (width + height) / 2 / 100 * scale
  let m = variance / 100 * size
  for (let x = -m; x < width + m; x += size) {
    for (let y = -m; y < height + m; y += size) {
      let x1 = x + n(x, y) * m
      let y1 = y + n(x, y + p) * m

      let x2 = x + size + n(x + size, y) * m
      let y2 = y + n(x + size, y + p) * m

      let x3 = x + n(x, y + size) * m
      let y3 = y + size + n(x, y + size + p) * m

      let x4 = x + size + n(x + size, y + size) * m
      let y4 = y + size + n(x + size, y + size + p) * m

      let swap = noise.noise2D((x + p) / 100, y / 100) > 0

      let averageX = (x1 + x2 + x3) / 3
      let averageY = (y1 + y2 + y3) / 3
      let a = sctx.getImageData(clamp(averageX, 0, width - 1), clamp(averageY, 0, height - 1), 1, 1).data
      ctx.fillStyle = ctx.strokeStyle = `rgb(${a[0]},${a[1]},${a[2]})`
      if (swap) drawTriangle(x1, y1, x2, y2, x3, y3)
      else drawTriangle(x1, y1, x2, y2, x4, y4)

      averageX = (x2 + x3 + x4) / 3
      averageY = (y2 + y3 + y4) / 3
      a = sctx.getImageData(clamp(averageX, 0, width - 1), clamp(averageY, 0, height - 1), 1, 1).data
      ctx.fillStyle = ctx.strokeStyle = `rgb(${a[0]},${a[1]},${a[2]})`
      if (swap) drawTriangle(x2, y2, x3, y3, x4, y4)
      else drawTriangle(x1, y1, x3, y3, x4, y4)
    }
  }
}

function updateGradient() {
  gradient = sctx.createLinearGradient(pos1.x, pos1.y, pos2.x, pos2.y)
  let a = 1 / ($$("#colours input").length - 1);
  [...$$("#colours input")].forEach(function (e, i) {
    gradient.addColorStop(a * i, e.value)
  })
  sctx.fillStyle = gradient
  sctx.fillRect(0, 0, width, height)
  draw()
}

function addColour() {
  $("#colours div").insertAdjacentHTML("beforebegin", `<input type="color" value="#000000" oninput="updateGradient(this)" />`)
  updateGradient()
}

function removeColour() {
  let ee = $$("#colours input")
  if (ee.length > 2) {
    let e = ee[ee.length - 1]
    e.parentElement.removeChild(e)
    updateGradient()
  }
}

function updateWidth(e) {
  prevWidth = width
  width = parseInt(e.value) || 0
  c.setAttribute("width", width)
  s.setAttribute("width", width)
  updateCanvas()
  updateGradient()
  draw()
}

function updateHeight(e) {
  prevHeight = height
  height = parseInt(e.value) || 0
  c.setAttribute("height", height)
  s.setAttribute("height", height)
  updateCanvas()
  updateGradient()
  draw()
}

function updateScale(e) {
  scale = parseFloat(e.value) || 1
  draw()
}

function updateVariance(e) {
  variance = parseFloat(e.value) || 0
  draw()
}

function updateVarianceScale(e) {
  varianceScale = parseFloat(e.value) || 0
  draw()
}

function updateSeed(e) {
  if (e.value == "") noise = new SimplexNoise()
  else noise = new SimplexNoise(e.value)
  draw()
}


function updateCanvas() {
  let w = window.innerWidth - $("#toolbar").clientWidth - 2 * padding
  let h = window.innerHeight - 2 * padding
  if (w / h > width / height) {
    c.style.height = h + "px"
    factor = h / height
    c.style.width = factor * width + "px"
  } else {
    c.style.width = w + "px"
    factor = w / width
    c.style.height = factor * height + "px"
  }

  if (prevWidth == 0) pos2.x += width
  else pos2.x *= width / prevWidth
  if (prevHeight == 0) pos2.y += height
  else pos2.y *= height / prevHeight

  prevWidth = width
  prevHeight = height

  let r = $("#result").getBoundingClientRect()

  let x1 = r.x + padding - 8 + pos1.x * factor
  let y1 = r.y + padding - 8 + pos1.y * factor
  let x2 = r.x + padding - 8 + pos2.x * factor
  let y2 = r.y + padding - 8 + pos2.y * factor

  $("#dot1").style.left = x1 + "px"
  $("#dot1").style.top = y1 + "px"
  $("#dot2").style.left = x2 + "px"
  $("#dot2").style.top = y2 + "px"
}

document.body.addEventListener("mousedown", function (e) {
  if (e.target.classList.contains("dot")) {
    dragElement = e.target
    dragging = true
    e.preventDefault()
  }
})

document.body.addEventListener("mouseup", function (e) {
  dragging = false
})

document.body.addEventListener("mousemove", function (e) {
  if (dragging) {
    let r = $("#result").getBoundingClientRect()
    let mx = e.pageX
    let my = e.pageY
    if (Math.abs(mx - padding - r.x) < 10) mx = r.x + padding
    if (Math.abs(mx + padding - r.right) < 10) mx = r.right - padding
    if (Math.abs(my - padding - r.y) < 10) my = r.y + padding
    if (Math.abs(my + padding - r.bottom) < 10) my = r.bottom - padding
    dragElement.style.left = mx - dotSize / 2 + "px"
    dragElement.style.top = my - dotSize / 2 + "px"

    let x = (mx - r.x - padding + 8) / factor - dotSize
    let y = (my - r.y - padding + 8) / factor - dotSize
    if (dragElement.id == "dot1") {
      pos1.x = x || 0
      pos1.y = y || 0
    } else {
      pos2.x = x || 0
      pos2.y = y || 0
    }
    updateGradient()
    e.preventDefault()
  }
})

function n(x, y) {
  return noise.noise2D(x / 100 * (varianceScale / 1000 * scale), y / 100 * (varianceScale / 1000 * scale))
}

function drawTriangle(x1, y1, x2, y2, x3, y3) {
  with (ctx) {
    beginPath()
    moveTo(x1, y1)
    lineTo(x2, y2)
    lineTo(x3, y3)
    closePath()
    stroke()
    fill()
  }
}
