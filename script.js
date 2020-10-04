$ = (e) => document.querySelector(e)
$$ = (e) => document.querySelectorAll(e)


clamp = (e, mn, mx) => Math.min(Math.max(e, mn), mx)

dragula($("#colours"))

let width = 1920
let height = 1080
let scale = 10
let variance = 50
let varianceScale = 100
let p = 7919
let fillStyle = "gradient"
let gradient;
let rotation = 45;

let c = $("#result")
let ctx = c.getContext("2d")
let s = $("#sampler")
let sctx = s.getContext("2d")

ctx.strokeWeight = 1

let noise = new SimplexNoise()

updateGradient();
draw()

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
  let l = Math.sqrt((width/2)**2+(height/2)**2)
  let t1 = (rotation+180) * (Math.PI/180)
  let t2 = rotation * (Math.PI/180)
  let x1 = l * Math.cos(t1) + width / 2
  let y1 = l * Math.sin(t1) + height / 2
  let x2 = l * Math.cos(t2) + width / 2
  let y2 = l * Math.sin(t2) + height / 2
  gradient = sctx.createLinearGradient(x1, y1, x2, y2)
  let a = 1 / ($$("#colours input").length - 1);
  [...$$("#colours input")].forEach(function (e, i) {
    gradient.addColorStop(a * i, e.value)
  })
  sctx.fillStyle = gradient
  sctx.fillRect(0, 0, width, height)
  draw()
}

function updateRotation(e) {
  rotation = parseFloat(e.value) || 0
  updateGradient()
}

function addColour() {
  $("#colours div").insertAdjacentHTML("beforebegin", `<input type="color" value="#000000" oninput="updateGradient(this)" />`)
  updateGradient()
}

function removeColour() {
  let ee = $$("#colours input")
  if (ee.length > 2) {
    let e = ee[ee.length-1]
    e.parentElement.removeChild(e)
    updateGradient()
  }
}

function updateWidth(e) {
  width = parseInt(e.value) || 0
  c.setAttribute("width", width)
  s.setAttribute("width", width)
  updateGradient()
  draw()
}

function updateHeight(e) {
  height = parseInt(e.value) || 0
  c.setAttribute("height", height)
  s.setAttribute("height", height)
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
