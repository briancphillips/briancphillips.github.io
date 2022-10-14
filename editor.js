const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const buffer = document.createElement("canvas");
const bufferCtx = buffer.getContext("2d");

let tileW = 32;
let tileH = 32;
let scale = 1;
let zoom = 1;
let offsetCols = 0;
let offsetRows = 0;
let scaleFactor = 40 / 21;
let mouseX, mouseY;

canvas.width = 1280;

canvas.height = tileH * 21;
buffer.width = tileW * 546;
buffer.height = tileH * 42;

let cols = 40;
let rows = 42;

canvas.setAttribute("style", "background-color:black");
class Camera {
  constructor() {
    this.offsetX = 0;
    this.offsetY = 0;
  }
}

let rect1x = 0,
  rect1y = 0,
  rect2x = 0,
  rect2y = 0;

let MOUSE_DOWN = false;
ctx.strokeStyle = "red";
ctx.strokeRect(0, 0, canvas.width, canvas.height);

function loadImage(url) {
  return new Promise((resolve) => {
    const image = new Image();
    image.addEventListener("load", () => {
      resolve(image);
    });
    image.src = url;
  });
}

async function loadJson(url) {
  const data = await fetch(url);
  return data.json();
}

async function parseJson(url) {
  try {
    const json_data = await loadJson(url);
    return json_data;
  } catch (e) {}
}

const level = parseJson("./map.json").then((m) => {
  const layers = m.layers;
  const cols = m.width;
  const tileMapCols = m.tilewidth;
  bufferCtx.fillStyle = "black";
  bufferCtx.fillRect(0, 0, buffer.width, buffer.height);

  layers.forEach((layer) => {
    loadImage("./images/tiles32x32.png").then((img) => {
      layer.data.forEach((element, i) => {
        const col = i % cols;
        const row = parseInt(i / cols, 10);
        const tilemapX = (element - 1) % tileMapCols;
        const tileMapY = Math.floor((element - 1) / tileMapCols);

        bufferCtx.drawImage(
          img,
          tilemapX * tileW,
          tileMapY * tileH,
          tileW,
          tileH,
          col * tileW,
          row * tileH,
          tileW,
          tileH
        );
      });
    });
  });
});

function drawGrid() {
  let s = 32;
  let nX = Math.floor(buffer.width / s) - 2;
  let nY = Math.floor(buffer.height / s) - 2;
  let pX = buffer.width - nX * s;
  let pY = buffer.height - nY * s;

  let pL = 0;
  let pT = 0;
  let pR = 0;
  let pB = 0;

  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.beginPath();
  for (let x = pL; x <= buffer.width - pR; x += s) {
    ctx.moveTo(x, pT);
    ctx.lineTo(x, buffer.height - pB);
  }
  for (let y = pT; y <= buffer.height - pB; y += s) {
    ctx.moveTo(pL, y);
    ctx.lineTo(buffer.width - pR, y);
  }
  ctx.stroke();
}

function getMousePos(evt) {
  let rect = canvas.getBoundingClientRect();
  return {
    x: Math.floor(Math.round(evt.clientX - rect.left) / tileW),
    y: Math.floor(Math.round(evt.clientY - rect.top) / tileH),
  };
}
const camera = new Camera();
window.camera = camera;
function update() {
  ctx.drawImage(
    buffer,
    camera.offsetX * tileW + rect1x * tileW,
    rect1y * tileH,
    canvas.width,
    canvas.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  drawGrid();
  highlightCell({
    x: Math.ceil((mouseX * tileW) / scaleFactor),
    y: Math.ceil((mouseY * tileH) / scaleFactor),
  });

  window.requestAnimationFrame(update);
}
update();

window.rect1x = rect1x;

canvas.addEventListener("mousemove", (e) => {
  let mousePosition = getMousePos(e);

  mouseX = mousePosition.x;
  mouseY = mousePosition.y;

  if (MOUSE_DOWN) {
    rect1x = rect1x - e.movementX - camera.offsetX;
    rect1y = rect1y - e.movementY - camera.offsetY;
    rect2x = mousePosition.x;
    rect2y = mousePosition.y;
    if (rect1x < 0) rect1x = 0;
    if (rect1x > buffer.width / tileW - canvas.width / tileW)
      rect1x = buffer.width / tileW - canvas.width / tileW;

    if (rect1y < 0 - offsetRows) rect1y = 0 - offsetRows;
    if (rect1y > buffer.height / tileH - canvas.height / tileH + offsetRows)
      rect1y = buffer.height / tileH - canvas.height / tileH + offsetRows;
  }
});

canvas.addEventListener("mouseup", (e) => {
  MOUSE_DOWN = false;
});

canvas.addEventListener("mouseleave", (e) => {
  MOUSE_DOWN = false;
});

canvas.addEventListener("mousedown", (e) => {
  if (MOUSE_DOWN) {
    MOUSE_DOWN = false;
  } else {
    if (e.button === 0) MOUSE_DOWN = true;
  }
});

window.addEventListener("keydown", (e) => {
  if (e.code === "ArrowLeft") {
    rect1x = rect1x - 1;
  }
  if (e.code === "ArrowRight") {
    rect1x = rect1x + 1;
  }
  if (e.code === "ArrowUp") {
    rect1y = rect1y - 1;
  }
  if (e.code === "ArrowDown") {
    rect1y = rect1y + 1;
  }
  if (rect1x < 0) rect1x = 0;
  if (rect1x > buffer.width / tileW - canvas.width / tileW)
    rect1x = buffer.width / tileW - canvas.width / tileW;

  if (rect1y < 0 - offsetRows) rect1y = 0 - offsetRows;
  if (rect1y > buffer.height / tileH - canvas.height / tileH + offsetRows)
    rect1y = buffer.height / tileH - canvas.height / tileH + offsetRows;

  console.log(rect1y);
});

canvas.addEventListener("contextmenu", (e) => e.preventDefault());

document.getElementById("btnScaleUp").addEventListener("click", (e) => {
  if (zoom > 3) {
    zoom = 3;
    return;
  }
  zoom++;
  ctx.translate(canvas.width / 2, canvas.height / 2);

  scaleCanvas(scaleFactor);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);
});
document.getElementById("btnScaleDown").addEventListener("click", (e) => {
  if (zoom <= 1) {
    zoom = 1;
    return;
  }
  zoom--;
  ctx.translate(canvas.width / 2, canvas.height / 2);

  scaleCanvas(1 / scaleFactor);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);
});

function scaleCanvas(scale) {
  offsetCols = (cols * scaleFactor) / 2 / 2;

  offsetRows =
    zoom > 1
      ? Math.ceil(
          rows / 2 - canvas.height / (tileH * (scaleFactor * (zoom - 1)))
        ) / 2
      : 0;
  console.log(offsetCols, offsetRows, scaleFactor);
  ctx.scale(scale, scale);
}

function highlightCell(pos) {
  ctx.fillStyle = "rgba(255,0,0,.2)";
  ctx.fillRect(
    Math.floor(pos.x / 32) * 32,
    Math.floor(pos.y / 32) * 32,
    tileW,
    tileH
  );
}

window.addEventListener("resize", (e) => {
  const cs = getComputedStyle(canvas);
  const width = parseInt(cs.getPropertyValue("width"), 10);
  const height = parseInt(cs.getPropertyValue("height"), 10);

  canvas.width = width;
  canvas.height = height;
});
window.addEventListener("load", (e) => {
  const cs = getComputedStyle(canvas);
  const width = parseInt(cs.getPropertyValue("width"), 10);
  const height = parseInt(cs.getPropertyValue("height"), 10);

  canvas.width = width;
  canvas.height = height;
});
