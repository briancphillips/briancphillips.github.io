const gridCanvas = document.querySelector("canvas#editor");
const gridCtx = gridCanvas.getContext("2d");

const miniCanvas = document.querySelector("#miniCanvas");
const miniCtx = miniCanvas.getContext("2d");

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

const bufferCanvas = document.createElement("canvas");
const bufferCtx = bufferCanvas.getContext("2d");

let tileW = 32;
let tileH = 32;

let zoom = 1;
let mouseX = 0;
let mouseY = 0;
let miniMouseX = 0;
let miniMouseY = 0;
let prevRect1x = 0;
let prevRect1y = 0;

let cols = 546;
let rows = 42;

let displayCols = 40;
let displayRows = 21;

let MOUSE_DOWN = false;

let mode = "view";
document.querySelector("#mode").textContent = mode;

const matrix = new Array(rows).fill(0).map(() => new Array(cols).fill(0));

canvas.width = displayCols * tileW;
gridCanvas.width = displayCols * tileW;
canvas.height = tileH * displayRows;
gridCanvas.height = tileH * displayRows;
bufferCanvas.width = tileW * cols;
bufferCanvas.height = tileH * rows;

let scaledWidth = canvas.width;
let scaledHeight = canvas.height;

miniCanvas.width = canvas.width;
miniCanvas.height = tileH;

ctx.strokeStyle = "red";
ctx.strokeRect(0, 0, canvas.width, canvas.height);

class Cursor {
  constructor() {
    this.col = 0;
    this.row = 0;
    this.color = "rgba(255,255,0,0.5";
  }
}
class Grid {
  constructor() {
    this.color = "rgba(255,255,255,0.8)";
  }

  drawGrid() {
    let s = tileW * zoom;
    gridCtx.strokeStyle = this.color;
    gridCtx.beginPath();
    for (let x = 0; x < gridCanvas.width; x += s) {
      gridCtx.moveTo(x, 0);
      gridCtx.lineTo(x, gridCanvas.height);
    }
    for (let y = 0; y < gridCanvas.height; y += s) {
      gridCtx.moveTo(0, y);
      gridCtx.lineTo(gridCanvas.width, y);
    }
    gridCtx.stroke();
    highlightCell({
      x: Math.floor(mouseX / (scaledWidth / 40)) * tileW,
      y: Math.floor(mouseY / (scaledHeight / 21)) * tileH,
    });
  }
}

class Camera {
  constructor() {
    this.pos = { x: 0, y: 0 };

    this.offsetX = 0;
    this.offsetY = 0;
    this.offsetCol = 0;
    this.offsetRow = 0;
    this.visibleCols = displayCols;
    this.visibleRows = displayRows;
  }

  update() {
    this.visibleCols = canvas.width / (tileW * zoom);
    this.visibleRows = canvas.height / (tileH * zoom);
  }
}
class Minimap {
  constructor() {
    this.w = 0;
    this.h = 0;
    this.cursorX = 0;
    this.cursorY = miniCanvas.height / 2;

    this.tileW = miniCanvas.width / cols;
    this.tileH = miniCanvas.height / rows;
    this.tileZoomRatioW = displayCols / zoom;
    this.tileZoomRatioH = displayRows / zoom;

    this.cursorW = this.tileZoomRatioW * this.tileW;
    this.cursorH = miniCanvas.height;
    this.cursorViewX = this.cursorW / zoom;
    this.cursorViewY = miniCanvas.height / 2;
    this.cursorViewW = this.tileZoomRatioW * this.tileW;
    this.cursorViewH = miniCanvas.height;
  }
  updateViewportOnClick() {
    this.cursorW = this.tileZoomRatioW * this.tileW;
    this.cursorH = miniCanvas.height;
    this.cursorX = miniMouseX - this.cursorW / 2;

    if (this.cursorX <= 0) this.cursorX = 0;
    if (this.cursorX >= miniCanvas.width - this.cursorW)
      this.cursorX = miniCanvas.width - this.cursorW;

    this.cursorY = miniMouseY;
    this.cursorViewX = this.cursorX + this.cursorW;

    this.cursorViewY = this.cursorY + this.cursorH / 2;
    if (this.cursorViewY >= miniCanvas.height)
      this.cursorViewY = miniCanvas.height;

    this.cursorViewW = this.tileZoomRatioW * this.tileW;
    this.cursorViewH = this.tileZoomRatioH * this.tileH;
  }
  updateViewport() {
    this.cursorW = this.tileZoomRatioW * this.tileW;
    this.cursorH = miniCanvas.height;
    this.cursorViewX =
      camera.pos.x * this.tileW + this.tileZoomRatioW * this.tileW;
    this.cursorViewY =
      camera.pos.y * this.tileH + this.tileZoomRatioH * this.tileH;
    this.cursorViewW = this.tileZoomRatioW * this.tileW;
    this.cursorViewH = this.tileZoomRatioH * this.tileH;
  }
  draw() {
    miniCtx.drawImage(
      bufferCanvas,
      0,
      0,
      bufferCanvas.width,
      bufferCanvas.height,
      0,
      0,
      miniCanvas.width,
      miniCanvas.height
    );

    miniCtx.fillStyle = "rgba(100,100,100,.2)";

    miniCtx.fillRect(this.cursorX, 0, this.cursorW, this.cursorH);

    miniCtx.fillStyle = "rgba(255,255,0,.4)";

    miniCtx.fillRect(
      this.cursorViewX - this.cursorViewW,
      this.cursorViewY - this.cursorViewH,
      this.cursorViewW,
      this.cursorViewH
    );
  }
  update() {
    this.updateViewport();
    this.draw();
  }
}

let tileSelected = 0;

const level = parseJson("./map.json").then((m) => {
  const layers = m.layers;

  const tileMapCols = 5;

  bufferCtx.fillStyle = "black";
  bufferCtx.fillRect(0, 0, bufferCanvas.width, bufferCanvas.height);

  layers.forEach((layer) => {
    loadImage("./images/tiles.png").then((img) => {
      layer.data.forEach((element, i) => {
        const col = i % cols;
        const row = parseInt(i / cols, 10);
        const tilemapX = element % tileMapCols;
        const tileMapY = Math.floor(element / tileMapCols);
        matrix[row][col] = element;

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

const grid = new Grid();
const camera = new Camera();
const cursor = new Cursor();
const miniMap = new Minimap();
window.camera = camera;
function update() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(
    bufferCanvas,
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
  miniMap.update();
  grid.drawGrid();
  camera.update();

  window.requestAnimationFrame(update);
}
update();

function scaleCanvas(scale) {
  if (zoom < 1) {
    zoom = 1;
    return;
  }

  if (zoom == 1) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // camera.pos.x = prevRect1x;
    // camera.pos.y = prevRect1y;
  }

  grid.drawGrid();
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
  document.querySelector("#tileNumber").textContent =
    matrix[cursor.row][cursor.col];
}

function getMousePos(evt, src) {
  let rect = src.getBoundingClientRect();

  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top,
  };
}

window.camera.pos.x = camera.pos.x;
window.zoom = zoom;
window.miniMap = miniMap;

gridCanvas.addEventListener("mousemove", (e) => {
  let mousePosition = getMousePos(e, gridCanvas);

  mouseX = mousePosition.x;
  mouseY = mousePosition.y;

  if (MOUSE_DOWN) {
    gridCanvas.setAttribute("style", "cursor: all-scroll");
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

    miniMap.cursorX =
      camera.pos.x * miniMap.tileW +
      miniMap.tileZoomRatioW * miniMap.tileW -
      miniMap.cursorW;
    miniMap.cursorY = 0;
    miniMap.updateViewport();
  }
});

gridCanvas.addEventListener("mouseup", (e) => {
  MOUSE_DOWN = false;

  gridCanvas.removeAttribute("style", "cursor: all-scroll");
  prevRect1x = camera.pos.x;
  prevRect1y = camera.pos.y;
});

gridCanvas.addEventListener("mouseleave", (e) => {
  MOUSE_DOWN = false;
});

gridCanvas.addEventListener("mousedown", (e) => {
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
    miniMap.tileZoomRatioW = displayCols / zoom;
    miniMap.tileZoomRatioH = displayRows / zoom;
    miniMap.update();
    miniMap.updateViewport();
  }
  if (e.code === "Minus") {
    zoom -= 1;
    scaleCanvas(zoom);
    miniMap.tileZoomRatioW = displayCols / zoom;
    miniMap.tileZoomRatioH = displayRows / zoom;
    miniMap.update();
    miniMap.updateViewport();
  }
  if (e.code === "Equal") {
    zoom += 1;
    scaleCanvas(zoom);
    miniMap.tileZoomRatioW = displayCols / zoom;
    miniMap.tileZoomRatioH = displayRows / zoom;
    miniMap.update();
    miniMap.updateViewport();
  }

  if (e.code === "ArrowLeft") {
    camera.pos.x = camera.pos.x - 1;
    miniMap.cursorX =
      camera.pos.x * miniMap.tileW +
      miniMap.tileZoomRatioW * miniMap.tileW -
      miniMap.cursorW;
    miniMap.updateViewport();
    miniMap.update();
  }
  if (e.code === "ArrowRight") {
    camera.pos.x = camera.pos.x + 1;
    miniMap.cursorX =
      camera.pos.x * miniMap.tileW +
      miniMap.tileZoomRatioW * miniMap.tileW -
      miniMap.cursorW;
    miniMap.updateViewport();
    miniMap.update();
  }
  if (e.code === "ArrowUp") {
    camera.pos.y = camera.pos.y - 1;
    miniMap.cursorViewY =
      camera.pos.y * miniMap.tileH + miniMap.tileZoomRatioH * miniMap.tileH;
    miniMap.updateViewport();
    miniMap.update();
  }
  if (e.code === "ArrowDown") {
    camera.pos.y = camera.pos.y + 1;
    miniMap.cursorViewY =
      camera.pos.y * miniMap.tileH + miniMap.tileZoomRatioH * miniMap.tileH;
    miniMap.updateViewport();
    miniMap.update();
  }

  if (e.code === "Backquote") {
    if (mode === "view") {
      mode = "edit";
    } else {
      mode = "view";
    }
    document.querySelector("#mode").textContent = mode;
  }

  if (camera.pos.x < 0) camera.pos.x = 0;
  if (camera.pos.x > bufferCanvas.width / tileW - canvas.width / tileW)
    camera.pos.x = bufferCanvas.width / tileW - canvas.width / tileW;

  if (camera.pos.y < 0) camera.pos.y = 0;
  if (camera.pos.y >= Math.ceil(rows - camera.visibleRows))
    camera.pos.y = Math.ceil(rows - camera.visibleRows);

  camera.offsetCol = camera.pos.x;
  camera.offsetRow = camera.pos.y;

  camera.offsetX = camera.pos.x * tileW;
  camera.offsetY = camera.pos.y * tileH;
});

gridCanvas.addEventListener("contextmenu", (e) => e.preventDefault());
miniCanvas.addEventListener("contextmenu", (e) => e.preventDefault());

miniCanvas.addEventListener("click", (e) => {
  let mousePosition = getMousePos(e, miniCanvas);

  miniMouseX = mousePosition.x;
  miniMouseY = mousePosition.y;

  miniMap.updateViewportOnClick();

  camera.pos.x = Math.floor(miniMap.cursorX * (cols / miniCanvas.width));
  camera.pos.y = Math.floor(miniMap.cursorY * (rows / miniCanvas.height));

  if (camera.pos.y < 0) camera.pos.y = 0;
  if (camera.pos.y >= Math.ceil(rows - camera.visibleRows))
    camera.pos.y = Math.ceil(rows - camera.visibleRows);
});

miniCanvas.addEventListener("mousemove", (e) => {
  let mousePosition = getMousePos(e, miniCanvas);

  miniMouseX = mousePosition.x;
  miniMouseY = mousePosition.y;

  if (MOUSE_DOWN) {
    miniCanvas.setAttribute("style", "cursor: all-scroll");
    miniMap.cursorW = miniMap.tileZoomRatioW * miniMap.tileW;
    miniMap.cursorH = miniCanvas.height;
    miniMap.cursorX = miniMouseX - miniMap.cursorW / 2;

    if (miniMap.cursorX <= 0) miniMap.cursorX = 0;
    if (miniMap.cursorX >= miniCanvas.width - miniMap.cursorW)
      miniMap.cursorX = miniCanvas.width - miniMap.cursorW;

    miniMap.cursorY = miniMouseY;
    miniMap.cursorViewX = miniMap.cursorX + miniMap.cursorW;

    miniMap.cursorViewY = miniMap.cursorY + miniMap.cursorH / 2;
    if (miniMap.cursorViewY >= miniCanvas.height)
      miniMap.cursorViewY = miniCanvas.height;

    miniMap.cursorViewW = miniMap.tileZoomRatioW * miniMap.tileW;
    miniMap.cursorViewH = miniMap.tileZoomRatioH * miniMap.tileH;

    camera.pos.x = Math.floor(miniMap.cursorX * (cols / miniCanvas.width));
    camera.pos.y = Math.floor(miniMap.cursorY * (rows / miniCanvas.height));

    if (camera.pos.y < 0) camera.pos.y = 0;
    if (camera.pos.y >= Math.ceil(rows - camera.visibleRows))
      camera.pos.y = Math.ceil(rows - camera.visibleRows);
  }
});

miniCanvas.addEventListener("mouseup", (e) => {
  MOUSE_DOWN = false;
  prevRect1x = camera.pos.x;
  prevRect1y = camera.pos.y;
  miniCanvas.removeAttribute("style", "cursor: all-scroll");
});

window.addEventListener("mouseup", (e) => {
  MOUSE_DOWN = false;
  gridCanvas.removeAttribute("style", "cursor: all-scroll");

  miniCanvas.removeAttribute("style", "cursor: all-scroll");
});

miniCanvas.addEventListener("mousedown", (e) => {
  if (MOUSE_DOWN) {
    MOUSE_DOWN = false;
  } else {
    if (e.button === 0) MOUSE_DOWN = true;
  }
});

window.addEventListener("resize", (e) => {
  const cs = getComputedStyle(gridCanvas);
  scaledWidth = parseInt(cs.getPropertyValue("width"), 10);
  scaledHeight = parseInt(cs.getPropertyValue("height"), 10);
  miniCanvas.width = scaledWidth;
  miniMap.tileW = scaledWidth / cols;
  //miniMap.tileH = miniCanvas.height / rows;
});
window.addEventListener("load", (e) => {
  const cs = getComputedStyle(gridCanvas);
  scaledWidth = parseInt(cs.getPropertyValue("width"), 10);
  scaledHeight = parseInt(cs.getPropertyValue("height"), 10);
  miniCanvas.width = scaledWidth;
  miniMap.tileW = scaledWidth / cols;
  //miniMap.tileH = miniCanvas.height / rows;

  miniMap.updateViewport();
});

window.addEventListener("mousemove", (e) => {
  gridCanvas.onmouseover = (e) => {};
});

window.addEventListener("contextmenu", (e) => {
  e.preventDefault();

  if (e.button === 2) {
    MOUSE_DOWN = false;
    if (mode === "view") {
      mode = "edit";
    } else {
      mode = "view";
    }
    document.querySelector("#mode").textContent = mode;
  }
});

// tiles used in 32x32.png
// 4,7,1,6,11,23,0,20,21,25,26,22,44,72,30,23
