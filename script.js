$ = (e) => document.querySelector(e)
$$ = (e) => document.querySelectorAll(e)


clamp = (e, mn, mx) => Math.min(Math.max(e, mn), mx)

let width = 1920
let height = 1080
let prevWidth = width
let prevHeight = height
let scale = 10
let variance = 100
let varianceScale = 100
let p = 7919
let fillStyle = "gradient"
let gradient
let colours = [
  [0, "#FF0000"],
  [1, "#FFFF00"]
]
let dotIndex = 0
let dots = {
  dotStart: {
    pos: {
      x: 0,
      y: 0
    },
    colour: "#FFFF00"
  },
  dotEnd: {
    pos: {
      x: width,
      y: height
    },
    colour: "#F0006C"
  }
}

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
let activeElement = $("#dotStart")
let dragTip = false

window.addEventListener("load", function () {
  updateGradient()
  draw()
  updateCanvas()

  $("#dotStart").style.display = "block"
  $("#dotEnd").style.display = "block"
})

window.addEventListener("resize", updateCanvas)
window.addEventListener("resize", updateCenterDots)

function draw() {
  let size = (width + height) / 2 / 100 * scale
  let m = variance
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
  gradient = sctx.createLinearGradient(dots["dotStart"].pos.x, dots["dotStart"].pos.y, dots["dotEnd"].pos.x, dots["dotEnd"].pos.y)
  let a = 1 / ($$("#colours input").length - 1);
  for (let e in dots) {
    let offset = .5
    if (e == "dotStart") offset = 0
    else if (e == "dotEnd") offset = 1
    else offset = dots[e].pos
    gradient.addColorStop(offset, dots[e].colour)
  }
  sctx.fillStyle = gradient
  sctx.fillRect(0, 0, width, height)
  draw()
}

function updateColour() {
  let colour = $("#colourInput").value || "#000000"
  dots[activeElement.getAttribute("dotindex")].colour = colour
  activeElement.style.background = colour
  updateGradient()
}

function addColour() {
  let d = document.createElement("div");
  d.className = "dot";
  d.setAttribute("dotindex", dotIndex)
  dots[dotIndex] = {
    pos: Math.random(),
    el: d,
    colour: "#FF0000"
  }
  dotIndex++
  document.body.appendChild(d)
  activeElement.classList.remove("active")
  activeElement = d
  activeElement.classList.add("active")
  $("#colourInput").value = "#FF0000"
  updateCenterDots()
  updateGradient()
}

function removeColour() {
  if (activeElement.id == "dotStart" || activeElement.id == "dotEnd") return
  let i = activeElement.getAttribute("dotindex")
  dots[i].el.remove()
  delete dots[i]
  activeElement = $("#dotStart")
  activeElement.classList.add("active")
  updateGradient()
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
  let p1 = dots["dotStart"].pos
  let p2 = dots["dotEnd"].pos
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

  if (prevWidth == 0) p2.x += width
  else {
    if (p2.x > p1.x) p2.x *= width / prevWidth
    else p1.x *= width / prevWidth
  }
  if (prevHeight == 0) p2.y += height
  else {
    if (p2.y > p1.y) p2.y *= height / prevHeight
    else p1.y *= height / prevHeight
  }

  prevWidth = width
  prevHeight = height

  let r = $("#result").getBoundingClientRect()

  let x1 = r.x + padding - 8 + p1.x * factor
  let y1 = r.y + padding - 8 + p1.y * factor
  let x2 = r.x + padding - 8 + p2.x * factor
  let y2 = r.y + padding - 8 + p2.y * factor

  $("#dotStart").style.left = x1 + "px"
  $("#dotStart").style.top = y1 + "px"
  $("#dotEnd").style.left = x2 + "px"
  $("#dotEnd").style.top = y2 + "px"
}

function updateCenterDots() {
  let p1 = dots["dotStart"].pos
  let p2 = dots["dotEnd"].pos

  for (const k in dots) {
    if (k == "dotStart" || k == "dotEnd") continue

    let r = $("#result").getBoundingClientRect()

    let vx = p1.x + (p2.x - p1.x) * dots[k].pos
    let vy = p1.y + (p2.y - p1.y) * dots[k].pos
    dots[k].el.style.left = r.x + padding - 8 + vx * factor + "px"
    dots[k].el.style.top = r.y + padding - 8 + vy * factor + "px"
  }
}

document.body.addEventListener("mousedown", function (e) {
  if (e.target.classList.contains("dot")) {
    dragElement = e.target
    activeElement.classList.remove("active")
    activeElement = e.target
    activeElement.classList.add("active")
    if (dragElement.id == "dotStart" || dragElement.id == "dotEnd") dragTip = true
    else dragTip = false
    dragging = true
    $("#colourInput").value = dots[dragElement.getAttribute("dotindex")].colour
    e.preventDefault()
  }
})

document.body.addEventListener("mouseup", function (e) {
  dragging = false
})

document.body.addEventListener("mousemove", function (e) {
  if (dragging) {
    let mx = e.pageX
    let my = e.pageY
    let r = $("#result").getBoundingClientRect()
    if (dragTip) {
      if (Math.abs(mx - padding - r.x) < 10) mx = r.x + padding
      if (Math.abs(mx + padding - r.right) < 10) mx = r.right - padding
      if (Math.abs(my - padding - r.y) < 10) my = r.y + padding
      if (Math.abs(my + padding - r.bottom) < 10) my = r.bottom - padding
      dragElement.style.left = mx - dotSize / 2 + "px"
      dragElement.style.top = my - dotSize / 2 + "px"

      let x = (mx - r.x - padding + 8) / factor - dotSize
      let y = (my - r.y - padding + 8) / factor - dotSize
      if (dragElement.id == "dotStart") {
        dots["dotStart"].pos.x = x || 0
        dots["dotStart"].pos.y = y || 0
      } else {
        dots["dotEnd"].pos.x = x || 0
        dots["dotEnd"].pos.y = y || 0
      }
    } else {
      let x = (mx - r.x - padding + 8) / factor - dotSize
      let y = (my - r.y - padding + 8) / factor - dotSize
      let dX = dots["dotEnd"].pos.x - dots["dotStart"].pos.x
      let dY = dots["dotEnd"].pos.y - dots["dotStart"].pos.y
      let dx = x - dots["dotStart"].pos.x
      let dy = y - dots["dotStart"].pos.y
      dots[dragElement.getAttribute("dotindex")].pos = clamp(Math.cos(Math.atan(dX / dY) - Math.atan(dx / dy)) * Math.sqrt(dx ** 2 + dy ** 2) / Math.sqrt(dX ** 2 + dY ** 2), 0, 1)
    }

    updateCenterDots()
    updateGradient()
    e.preventDefault()
  }
})

function saveImage(e) {
  e.href = c.toDataURL("image/jpg")
}

function n(x, y) {
  return noise.noise2D(x / 100 * (varianceScale / 500), y / 100 * (varianceScale / 500))
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
