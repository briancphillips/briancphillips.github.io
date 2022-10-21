const grid = document.querySelector("canvas#editor");
const gridCtx = grid.getContext("2d");

const miniCanvas = document.querySelector("#miniCanvas");
const miniCtx = miniCanvas.getContext("2d");

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

const buffer = document.createElement("canvas");
const bufferCtx = buffer.getContext("2d");

let tileW = 32;
let tileH = 32;

let zoom = 1;
let mouseX, mouseY;
let prevRect1x = 0;
let prevRect1y = 0;

let cols = 546;
let rows = 42;
let MOUSE_DOWN = false;

const matrix = new Array(rows).fill(0).map(() => new Array(cols).fill(0));

canvas.width = 1280;
grid.width = 1280;
canvas.height = tileH * 21;
grid.height = tileH * 21;
buffer.width = tileW * 546;
buffer.height = tileH * 42;

let scaledWidth = canvas.width;
let scaledHeight = canvas.height;

miniCanvas.width = 200;
miniCanvas.height = 105;

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
    this.pos = { x: 0, y: 0 };

    this.offsetX = 0;
    this.offsetY = 0;
    this.offsetCol = 0;
    this.offsetRow = 0;
    this.visibleCols = 40;
    this.visibleRows = 21;
  }

  update() {
    this.visibleCols = canvas.width / (tileW * zoom);
    this.visibleRows = canvas.height / (tileH * zoom);
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

//const tileSheet = document.querySelector("img");
let tileSelected = 0;

//for (x = 0; x < tileSheet.width; x += 32) {}

const level = parseJson("./map.json").then((m) => {
  const layers = m.layers;

  const tileMapCols = 8;

  //console.log(matrix); // 0

  bufferCtx.fillStyle = "black";
  bufferCtx.fillRect(0, 0, buffer.width, buffer.height);

  layers.forEach((layer) => {
    loadImage("./images/tiles32x32.png").then((img) => {
      layer.data.forEach((element, i) => {
        const col = i % cols;
        const row = parseInt(i / cols, 10);
        const tilemapX = (element - 1) % tileMapCols;
        const tileMapY = Math.floor((element - 1) / tileMapCols);
        matrix[row][col] = element - 1;
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
  let s = 32 * zoom;

  //ctx.clearRect(0, 0, canvas.width, canvas.height);
  gridCtx.strokeStyle = "rgba(255,255,255,0.8)";
  gridCtx.beginPath();
  for (let x = 0; x < grid.width; x += s) {
    gridCtx.moveTo(x, 0);
    gridCtx.lineTo(x, grid.height);
  }
  for (let y = 0; y < grid.height; y += s) {
    gridCtx.moveTo(0, y);
    gridCtx.lineTo(grid.width, y);
  }
  gridCtx.stroke();
  highlightCell({
    x: Math.floor(mouseX / (scaledWidth / 40)) * tileW,
    y: Math.floor(mouseY / (scaledHeight / 21)) * tileH,
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
    camera.pos.x * tileW,
    camera.pos.y * tileH,
    canvas.width,
    canvas.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  gridCtx.drawImage(canvas, 0, 0);
  miniCtx.drawImage(
    canvas,
    0,
    0,
    canvas.width,
    canvas.height,
    0,
    0,
    miniCanvas.width,
    miniCanvas.height
  );
  drawGrid();
  camera.update();
  //console.log(camera);
  window.requestAnimationFrame(update);
}
update();

function scaleCanvas(scale) {
  // prevRect1x = camera.pos.x;
  // prevRect1y = camera.pos.y;

  if (zoom < 1) {
    zoom = 1;
    return;
  }

  if (zoom == 1) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    camera.pos.x = prevRect1x;
    camera.pos.y = prevRect1y;
  }

  drawGrid();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(scale, scale);
  document.querySelector("#zoom").textContent = zoom;
}

function highlightCell(pos) {
  gridCtx.fillStyle = cursor.color;
  gridCtx.fillRect(
    Math.floor(pos.x / (tileW * zoom)) * tileW * zoom,
    Math.floor(pos.y / (tileH * zoom)) * tileH * zoom,
    tileW * zoom,
    tileH * zoom
  );
  cursor.col = Math.floor(pos.x / (tileW * zoom) + camera.offsetCol);
  cursor.row = Math.floor(pos.y / (tileH * zoom) + camera.offsetRow);
  document.querySelector("#col").textContent = cursor.col;
  document.querySelector("#row").textContent = cursor.row;
}

function getMousePos(evt) {
  let rect = grid.getBoundingClientRect();

  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top,
  };
}

window.camera.pos.x = camera.pos.x;
window.zoom = zoom;

// document.getElementById("btnScaleUp").addEventListener("click", (e) => {
//   zoom += 1;
//   scaleCanvas(zoom);
// });
// document.getElementById("btnScaleDown").addEventListener("click", (e) => {
//   zoom -= 1;
//   scaleCanvas(zoom);
// });
grid.addEventListener("mousemove", (e) => {
  let mousePosition = getMousePos(e);

  mouseX = mousePosition.x;
  mouseY = mousePosition.y;

  if (MOUSE_DOWN) {
    grid.setAttribute("style", "cursor: all-scroll");
    camera.pos.x = camera.pos.x - e.movementX;
    camera.pos.y = camera.pos.y - e.movementY;

    if (camera.pos.x < 0) camera.pos.x = 0;
    if (camera.pos.x >= Math.ceil(cols - camera.visibleCols))
      camera.pos.x = Math.ceil(cols - camera.visibleCols);

    if (camera.pos.y < 0) camera.pos.y = 0;
    if (camera.pos.y >= Math.ceil(rows - camera.visibleRows))
      camera.pos.y = Math.ceil(rows - camera.visibleRows);

    camera.offsetCol = camera.pos.x;
    camera.offsetRow = camera.pos.y;

    camera.offsetX = camera.pos.x * tileW;
    camera.offsetY = camera.pos.y * tileH;
  }
});
grid.addEventListener("click", (e) => {
  console.log(cursor);
  console.log(matrix[cursor.row][cursor.col]);
  // bufferCtx.fillStyle = "blue";
  // bufferCtx.fillRect(cursor.col * tileW, cursor.row * tileH, 32, 32);
});
grid.addEventListener("mouseup", (e) => {
  MOUSE_DOWN = false;
  grid.removeAttribute("style", "cursor: all-scroll");
  prevRect1x = camera.pos.x;
  prevRect1y = camera.pos.y;
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
  if (e.code === "Digit0") {
    zoom = 1;
    scaleCanvas(zoom);
  }
  if (e.code === "Minus") {
    zoom -= 1;
    scaleCanvas(zoom);
  }
  if (e.code === "Equal") {
    zoom += 1;
    scaleCanvas(zoom);
  }

  if (e.code === "ArrowLeft") {
    camera.pos.x = camera.pos.x - 1;
  }
  if (e.code === "ArrowRight") {
    camera.pos.x = camera.pos.x + 1;
  }
  if (e.code === "ArrowUp") {
    camera.pos.y = camera.pos.y - 1;
  }
  if (e.code === "ArrowDown") {
    camera.pos.y = camera.pos.y + 1;
  }
  if (camera.pos.x < 0) camera.pos.x = 0;
  if (camera.pos.x > buffer.width / tileW - canvas.width / tileW)
    camera.pos.x = buffer.width / tileW - canvas.width / tileW;

  if (camera.pos.y < 0) camera.pos.y = 0;
  if (camera.pos.y >= Math.ceil(rows - camera.visibleRows))
    camera.pos.y = Math.ceil(rows - camera.visibleRows);

  camera.offsetCol = camera.pos.x;
  camera.offsetRow = camera.pos.y;

  camera.offsetX = camera.pos.x * tileW;
  camera.offsetY = camera.pos.y * tileH;
});

grid.addEventListener("contextmenu", (e) => e.preventDefault());

window.addEventListener("resize", (e) => {
  const cs = getComputedStyle(grid);
  scaledWidth = parseInt(cs.getPropertyValue("width"), 10);
  scaledHeight = parseInt(cs.getPropertyValue("height"), 10);
});
window.addEventListener("load", (e) => {
  const cs = getComputedStyle(grid);
  scaledWidth = parseInt(cs.getPropertyValue("width"), 10);
  scaledHeight = parseInt(cs.getPropertyValue("height"), 10);
});

// tiles used in 32x32.png
// 4,7,1,6,11,23,0,20,21,25,26,22,44,72,30,23
