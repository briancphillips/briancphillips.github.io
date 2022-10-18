const grid = document.querySelector("canvas");
const gridCtx = grid.getContext("2d");

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

const buffer = document.createElement("canvas");
const bufferCtx = buffer.getContext("2d");

let tileW = 32;
let tileH = 32;
let scale = 1;
let zoom = 1;
let offsetCols = 0;
let offsetRows = 0;
let scaleFactor = 1;
let mouseX, mouseY;

let rect1x = 0,
  rect1y = 0,
  rect2x = 0,
  rect2y = 0;

let cols = 40;
let rows = 42;
let MOUSE_DOWN = false;

canvas.width = 1280;
grid.width = 1280;

canvas.height = tileH * 21;
grid.height = tileH * 21;
buffer.width = tileW * 546;
buffer.height = tileH * 42;

//canvas.setAttribute("style", "background-color:black");

ctx.strokeStyle = "red";
ctx.strokeRect(0, 0, canvas.width, canvas.height);

class Cursor {
  constructor() {
    this.col = 0;
    this.row = 0;
    this.color = "rgba(255,255,0,0.5";
  }
}
class Camera {
  constructor() {
    this.offsetX = 0;
    this.offsetY = 0;
    this.offsetCol = 0;
    this.offsetRow = 0;
    this.visibleCols = cols;
    this.visibleRows = rows;
  }

  update() {
    this.visibleCols = canvas.width / (tileW * scaleFactor);
    this.visibleRows = canvas.height / (tileH * scaleFactor);
  }
}

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
  let s = 32 * scaleFactor;
  let nX = Math.floor(canvas.width / s) - 0;
  let nY = Math.floor(canvas.height / s) - 0;
  let pX = buffer.width - nX * s;
  let pY = buffer.height - nY * s;

  let pL = 0;
  let pT = 0;
  let pR = 0;
  let pB = 0;
  //ctx.clearRect(0, 0, canvas.width, canvas.height);
  gridCtx.strokeStyle = "rgba(255,255,255,0.5)";
  gridCtx.beginPath();
  for (let x = pL; x <= grid.width - pR; x += s) {
    gridCtx.moveTo(x, pT);
    gridCtx.lineTo(x, grid.height - pB);
  }
  for (let y = pT; y <= grid.height - pB; y += s) {
    gridCtx.moveTo(pL, y);
    gridCtx.lineTo(grid.width - pR, y);
  }
  gridCtx.stroke();
  highlightCell({
    x: Math.floor(mouseX / tileW) * tileW,
    y: Math.floor(mouseY / tileH) * tileH,
  });
}

const camera = new Camera();
const cursor = new Cursor();
window.camera = camera;
function update() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(
    buffer,
    rect1x * tileW,
    rect1y * tileH,
    canvas.width,
    canvas.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  gridCtx.drawImage(canvas, 0, 0);
  drawGrid();

  //console.log(camera);
  window.requestAnimationFrame(update);
}
update();

function scaleCanvas(scale) {
  offsetCols = scale > 1 ? (cols - canvas.width / (tileH * scale)) / 2 : 0;

  offsetRows = scale > 1 ? (rows / 2 - canvas.height / (tileH * scale)) / 2 : 0;

  if (scaleFactor < 1) {
    scaleFactor = 1;
    return;
  }

  if (scaleFactor == 1) {
    if (cursor.row > rows / 2) rect1y = rows / 2;
    if (cursor.row < rows / 2) rect1y = 0;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  drawGrid();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(canvas.width / 2, canvas.height / 2);

  ctx.scale(scale, scale);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);
  // gridCtx.fillStyle = "black";
  // gridCtx.fillRect(0, 0, canvas.width, canvas.height);
  // ctx.drawImage(
  //   buffer,
  //   rect1x * tileW,
  //   rect1y * tileH,
  //   canvas.width,
  //   canvas.height,
  //   0,
  //   0,
  //   canvas.width,
  //   canvas.height
  // );
  // gridCtx.drawImage(canvas, 0, 0);
  //drawGrid();
  console.log(offsetCols, offsetRows);
  //update rectx1 and recty1
}

function highlightCell(pos) {
  gridCtx.fillStyle = cursor.color;
  gridCtx.fillRect(
    Math.floor(pos.x / (tileW * scaleFactor)) * tileW * scaleFactor,
    Math.floor(pos.y / (tileH * scaleFactor)) * tileH * scaleFactor,
    tileW * scaleFactor,
    tileH * scaleFactor
  );
  cursor.col = Math.floor(
    pos.x / (tileW * scaleFactor) + camera.offsetCol + offsetCols
  );
  cursor.row = Math.floor(
    pos.y / (tileH * scaleFactor) + camera.offsetRow + offsetRows
  );
  //console.log(cursor.col, cursor.row);
}

function getMousePos(evt) {
  let rect = grid.getBoundingClientRect();

  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top,
  };
}

window.rect1x = rect1x;
window.scaleFactor = scaleFactor;
document.getElementById("btnScaleUp").addEventListener("click", (e) => {
  scaleFactor += 1;
  scaleCanvas(scaleFactor);
});
document.getElementById("btnScaleDown").addEventListener("click", (e) => {
  scaleFactor -= 1;
  scaleCanvas(scaleFactor);
});
grid.addEventListener("mousemove", (e) => {
  let mousePosition = getMousePos(e);

  mouseX = mousePosition.x;
  mouseY = mousePosition.y;

  if (MOUSE_DOWN) {
    rect1x = rect1x - e.movementX;
    rect1y = rect1y - e.movementY;

    rect2x = mousePosition.x;
    rect2y = mousePosition.y;
    if (rect1x < 0 - offsetCols) rect1x = 0 - offsetCols;
    if (rect1x > buffer.width / tileW - canvas.width / tileW + offsetCols)
      rect1x = buffer.width / tileW - canvas.width / tileW + offsetCols;

    if (rect1y < 0 - offsetRows) rect1y = 0 - offsetRows;
    if (rect1y > buffer.height / tileH - canvas.height / tileH + offsetRows)
      rect1y = buffer.height / tileH - canvas.height / tileH + offsetRows;

    camera.offsetCol = rect1x;
    camera.offsetRow = rect1y;

    camera.offsetX = rect1x * tileW;
    camera.offsetY = rect1y * tileH;
  }
});
grid.addEventListener("click", (e) => {
  console.log(cursor);
});
grid.addEventListener("mouseup", (e) => {
  MOUSE_DOWN = false;
});

grid.addEventListener("mouseleave", (e) => {
  MOUSE_DOWN = false;
});

grid.addEventListener("mousedown", (e) => {
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

  camera.offsetCol = rect1x;
  camera.offsetRow = rect1y;

  camera.offsetX = rect1x * tileW;
  camera.offsetY = rect1y * tileH;

  //console.log(rect1y);
});

grid.addEventListener("contextmenu", (e) => e.preventDefault());

window.addEventListener("resize", (e) => {
  // const cs = getComputedStyle(canvas);
  // const width = parseInt(cs.getPropertyValue("width"), 10);
  // const height = parseInt(cs.getPropertyValue("height"), 10);
  // canvas.width = width;
  // canvas.height = height;
});
window.addEventListener("load", (e) => {
  // const cs = getComputedStyle(canvas);
  // const width = parseInt(cs.getPropertyValue("width"), 10);
  // const height = parseInt(cs.getPropertyValue("height"), 10);
  // canvas.width = width;
  // canvas.height = height;
});
