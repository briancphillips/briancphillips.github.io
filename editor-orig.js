const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const buffer = document.createElement("canvas");
const bufferCtx = buffer.getContext("2d");

//canvas.setAttribute("style", "transform:scale(2,2)");
//ctx.imageSmoothingEnabled = false;
let tileW = 32;
let tileH = 32;
let scale = 1;
let mouseX, mouseY;
//canvas.width = window.innerWidth;
canvas.width = 1280;
//canvas.height = 400;
canvas.height = tileH * 21;
buffer.width = tileW * 546;
buffer.height = tileH * 42;

canvas.setAttribute("style", "background-color:black");
// class Camera {
//   constructor(pos, dim) {
//     this.pos = pos;
//     this.dim = dim;
//     this.bounds = { x1: 0, y1: 0, x2: 0, y2: 0 };
//     this.offset = { x: 0, y: 0 };
//   }

//   draw() {
//     ctx.drawImage(
//       buffer,
//       camera.bounds.x1 - camera.offset.x,
//       camera.bounds.y1 - camera.offset.y,
//       canvas.width,
//       canvas.height,
//       0,
//       0,
//       canvas.width,
//       canvas.height
//     );
//   }

//   update(px, py) {
//     this.offset.x = Math.floor(this.dim.x / 2 - px);
//     this.offset.y = Math.floor(this.dim.y / 2 - py);
//     this.pos.x = this.offset.x;
//     this.pos.y = this.offset.y;
//     const tile = {
//       x: px - player.pos.x,
//       y: py - player.pos.y,
//     };

//     this.bounds.x1 = tile.x - this.dim.x / 2;
//     this.bounds.y1 = tile.y - this.dim.y / 2;

//     if (this.bounds.x1 < 0) this.bounds.x1 = 0;
//     if (this.bounds.y1 < 0) this.bounds.y1 = 0;

//     this.bounds.x2 = tile.x + this.dim.x / 2;
//     this.bounds.y2 = tile.y + this.dim.y / 2;

//     if (this.bounds.x2 >= buffer.width) this.bounds.x2 = buffer.width;
//     // if (this.bounds.y2 >= buffer.height - tileH)
//     //   this.bounds.y2 = buffer.height + tileH;
//     //console.log(this.pos.x, this.pos.y);
//     this.draw();
//     //console.log(camera);
//   }
// }

// class Player {
//   constructor(pos, vel) {
//     this.pos = pos;
//     this.vel = vel;
//     this.prev = this.vel;
//     this.w = 96;
//     this.h = 128;
//   }
//   draw() {
//     ctx.fillStyle = "red";
//     ctx.fillRect(
//       this.pos.x + camera.offset.x,
//       this.pos.y + camera.offset.y,
//       this.w,
//       this.h
//     );
//   }

//   update() {
//     this.pos.x += this.vel.x;
//     this.pos.y += this.vel.y;
//     if (this.pos.x < 640) {
//       this.pos.x = 640;
//       this.vel.x = 0;
//     }
//     if (this.pos.x + this.w > buffer.width) {
//       this.pos.x = buffer.width - this.w;
//       this.vel.x = 0;
//     }
//     if (this.pos.y < tileH) {
//       this.pos.y = tileH;
//       this.vel.y = 0;
//     }
//     if (this.pos.y + this.h > buffer.height - tileH) {
//       this.pos.y = buffer.height - this.h - tileH;
//       this.vel.y = 0;
//     }
//     camera.update(this.pos.x, this.pos.y);
//     //console.log(this.pos.x, this.pos.y);
//     this.vel.x = 0;
//     this.vel.y = 0;
//     this.draw();
//   }
// }

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
  } catch (e) {
    //console.log(e);
  }
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

  // Bonus code for choosing nX instead of s
  /* let nX = 20
    let s = Math.floor(buffer.width / (nX + 2))
    let pX = buffer.width - nX * s
    let nY = Math.floor((buffer.height - pX) / (buffer.width - pX) * nX)
    let pY = buffer.height - nY * s */

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
  //   return {
  //     x: Math.ceil((evt.clientX - rect.left) / tileW),
  //     y: Math.ceil((evt.clientY - rect.top) / tileH),
  //   };
  return {
    x: Math.floor(Math.round(evt.clientX - rect.left) / tileW),
    y: Math.floor(Math.round(evt.clientY - rect.top) / tileH),
  };
}

function update() {
  //ctx.clearRect(0, 0, canvas.width, canvas.height);
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
  //ctx.fillRect(rect1x, rect1y, rect2x - rect1x, rect2y - rect1y);
  drawGrid();
  highlightCell({
    x: Math.ceil((mouseX * tileW) / scale),
    y: Math.ceil((mouseY * tileH) / scale),
  });

  window.requestAnimationFrame(update);
}
update();
window.rect1x = rect1x;

canvas.addEventListener("mousemove", (e) => {
  let mousePosition = getMousePos(e);

  mouseX = mousePosition.x;
  mouseY = mousePosition.y;
  //console.log(mouseX, mouseY);
  if (MOUSE_DOWN) {
    rect1x = rect1x - e.movementX;
    rect1y = rect1y - e.movementY;
    rect2x = mousePosition.x;
    rect2y = mousePosition.y;
    if (rect1x < 0) rect1x = 0;
    if (rect1x > buffer.width / tileW - canvas.width / tileW)
      rect1x = buffer.width / tileW - canvas.width / tileW;

    if (rect1y < 0) rect1y = 0;
    if (rect1y > buffer.height / tileH - canvas.height / tileH)
      rect1y = buffer.height / tileH - canvas.height / tileH;

    console.log(rect1x, rect1y);
  }
});

canvas.addEventListener("mouseup", (e) => {
  MOUSE_DOWN = false;
});

canvas.addEventListener("mouseleave", (e) => {
  MOUSE_DOWN = false;
});

canvas.addEventListener("mousedown", (e) => {
  //console.log("button " + e.button);
  if (MOUSE_DOWN) {
    MOUSE_DOWN = false;
  } else {
    if (e.button === 1) MOUSE_DOWN = true;
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

  if (rect1y < 0) rect1y = 0;
  if (rect1y > buffer.height / tileH - canvas.height / scale / tileH)
    rect1y = buffer.height / tileH - canvas.height / scale / tileH;
  //console.log(e);
  console.log(rect1x, rect1y);
});

canvas.addEventListener("contextmenu", (e) => e.preventDefault());

document.getElementById("btnScaleUp").addEventListener("click", (e) => {
  if (scale > 4) return;

  ctx.restore();
  ctx.translate(canvas.width / 4, canvas.height / 4);
  scale += 5 / 3;
  ctx.translate(-canvas.width / 4, -canvas.height / 4);
  scaleCanvas(scale);
  //drawGrid();
  // ctx.translate(-1, -1);
});
document.getElementById("btnScaleDown").addEventListener("click", (e) => {
  ctx.restore();
  if (scale > 5 / 3) scale -= 5 / 3;

  scaleCanvas(scale);
  //drawGrid();
});

function scaleCanvas(scale) {
  ctx.scale(1, 1);
  ctx.save();
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
  //drawGrid();
  console.log(width, height);
});
window.addEventListener("load", (e) => {
  const cs = getComputedStyle(canvas);
  const width = parseInt(cs.getPropertyValue("width"), 10);
  const height = parseInt(cs.getPropertyValue("height"), 10);

  canvas.width = width;
  canvas.height = height;
  console.log(tileW, tileH);
});
