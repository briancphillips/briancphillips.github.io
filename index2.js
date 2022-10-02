const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const buffer = document.createElement("canvas");
const bufferCtx = buffer.getContext("2d");

//canvas.setAttribute("style", "transform:scale(2,2)");
//ctx.imageSmoothingEnabled = false;
const tileW = 32;
const tileH = 32;
const mapW = 546;
const mapH = 44;
//canvas.width = window.innerWidth;
canvas.width = 1280;
//canvas.height = 400;
canvas.height = tileH * 22;
buffer.width = tileW * 546;
buffer.height = tileH * 44;

class Viewport {
  constructor(pos, dim) {
    this.pos = pos;
    this.dim = dim;
    this.bounds = { x1: 0, y1: 0, x2: 0, y2: 0 };
    this.offset = { x: 0, y: 0 };
  }

  draw() {}

  update(px, py) {
    this.offset.x = this.dim.x / 2 - px;
    this.offset.y = this.dim.y / 2 - py;

    const tile = {
      x: px - player.pos.x,
      y: py - player.pos.y,
    };

    this.bounds.x1 = tile.x - this.dim.x / 2;
    this.bounds.y1 = tile.y - this.dim.y / 2;

    if (this.bounds.x1 < 0) this.bounds.x1 = 0;
    if (this.bounds.y1 < 0) this.bounds.y1 = 0;

    this.bounds.x2 = tile.x + this.dim.x / 2;
    this.bounds.y2 = tile.y + this.dim.y / 2;

    if (this.bounds.x2 >= buffer.width) this.bounds.x2 = buffer.width - 32;
    if (this.bounds.y2 >= buffer.height) this.bounds.y2 = buffer.height - 32;

    //console.log(viewport);
  }
}

class Camera {
  constructor(pos) {
    this.pos = pos;
    this.w = canvas.width;
    this.h = canvas.height;
  }

  draw() {
    // ctx.drawImage(
    //   buffer,
    //   this.pos.x,
    //   this.pos.y,
    //   canvas.width,
    //   canvas.height,
    //   0,
    //   0,
    //   canvas.width,
    //   canvas.height
    // );
    // ctx.fillStyle = "black";
    // ctx.fillRect(0, 0, canvas.width, canvas.height);
    // ctx.lineWidth = 5;
    // ctx.strokeStyle = "white";
    // ctx.moveTo(0, buffer.height / 2);
    // ctx.lineTo(canvas.width, buffer.height / 2);
    // ctx.stroke();
    // ctx.lineWidth = 5;
    // ctx.strokeStyle = "purple";
    // ctx.moveTo(0, canvas.height - 100);
    // ctx.lineTo(canvas.width, canvas.height - 100);
    // ctx.moveTo(0, 1024);
    // ctx.lineTo(canvas.width, 1024);
    //ctx.stroke();
  }
  update() {
    this.draw();
  }
}

class Player {
  constructor(pos, vel) {
    this.pos = pos;
    this.vel = vel;
    this.prev = this.vel;
    this.w = 96;
    this.h = 128;
  }
  draw() {
    ctx.fillStyle = "red";
    ctx.fillRect(
      this.pos.x + viewport.offset.x,
      this.pos.y + viewport.offset.y,
      this.w,
      this.h
    );
  }

  update() {
    if (this.pos.x < 0) {
      this.pos.x = 0;
      this.vel.x = 0;
    }
    if (this.pos.x + player.w > buffer.width) {
      this.pos.x = buffer.width - player.w;
      this.vel.x = 0;
    }
    if (this.pos.y < 0) {
      this.pos.y = 0;
      this.vel.y = 0;
    }
    if (this.pos.y + player.h > buffer.height) {
      this.pos.y = buffer.height - player.h;
      this.vel.y = 0;
    }

    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
    viewport.update(player.pos.x, player.pos.y);
    // if (this.pos.x < 640) this.pos.x = 640;
    // if (this.pos.x + this.w >= buffer.width) this.pos.x = buffer.width - this.w;
    // if (this.pos.y <= tileH) this.pos.y = tileH;
    // if (this.pos.y + this.h > buffer.height - tileH * 2)
    //   this.pos.y = buffer.height - tileH * 2 - this.h;

    // camera.pos.x = this.pos.x;
    // camera.pos.y = this.pos.y;

    // if (camera.pos.y <= 0) camera.pos.y = 0;
    // if (camera.pos.y >= buffer.height / 2)
    //   camera.pos.y = buffer.height / 2 + tileH / 2;
    this.draw();
    // this.vel.x = 0;
    // this.vel.y = 0;
    //console.log(this.pos.x);
  }
}

// const scaleX = window.innerWidth / canvas.width;
// const scaleY = window.innerHeight / canvas.height;

// const scaleToFit = Math.min(scaleX, scaleY);
// const scaleToCover = Math.max(scaleX, scaleY);

// canvas.style.transformOrigin = "0 0"; //scale from top left
// canvas.style.transform = `scale(${scaleToFit})`;
// document.querySelector("div.container").appendChild(canvas);

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
    console.log(e);
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

function animate() {
  //camera.update();
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  console.log(player.pos.x, player.pos.y);
  ctx.drawImage(
    buffer,
    viewport.bounds.x1 - viewport.offset.x,
    viewport.bounds.y1 - viewport.offset.y,
    canvas.width,
    canvas.height,
    0,
    0,
    canvas.width,
    canvas.height
  );
  // player.pos.x += viewport.offset.x;
  // player.pos.y += viewport.offset.y;

  // ctx.fillStyle = "green";
  // ctx.fillRect(0, canvas.height - tileH, canvas.width, canvas.height);
  // ctx.beginPath();
  // ctx.lineWidth = 5;
  // ctx.strokeStyle = "white";
  // ctx.moveTo(0, buffer.height / 2);
  // ctx.lineTo(canvas.width, buffer.height / 2);
  // ctx.stroke();
  // ctx.beginPath();
  // ctx.lineWidth = 5;
  // ctx.strokeStyle = "purple";
  // ctx.moveTo(0, canvas.height);
  // ctx.lineTo(canvas.width, canvas.height);
  // ctx.lineWidth = 5;
  // ctx.stroke();
  //console.log(viewport.offset.x, viewport.offset.y, player.pos.x, player.pos.y);
  player.update();

  // console.log({ CAMX: camera.pos.x, CAMY: camera.pos.y });
  // console.log({
  //   PLYX: player.pos.x,
  //   PLYY: player.pos.y,
  //   PLYCAMVELX: player.pos.x - camera.pos.x,
  // });
  //console.log(camera.scrollBounds.y1);

  window.requestAnimationFrame(animate);
}

const player = new Player({ x: 0, y: 0 }, { x: 0, y: 0 });
const camera = new Camera({ x: 0, y: 0 });
const viewport = new Viewport(
  { x: 0, y: 0 },
  { x: canvas.width, y: canvas.height }
);
window.camera = camera;
animate();
window.level = level;

window.addEventListener("keydown", (e) => {
  e.preventDefault();
  player.prev.x = player.vel.x;
  player.prev.y = player.vel.y;

  if (e.code === "Space") {
    if (player.vel.x === 0 && player.vel.y === 0) {
      player.vel.x = player.prev.x;
      player.vel.y = player.prev.y;
    } else {
      player.vel.x = 0;
      player.vel.y = 0;
    }
  }

  if (e.code === "ArrowRight") {
    if (player.vel.x <= 0) {
      player.vel.x = 32;
    }
  }

  if (e.code === "ArrowLeft") {
    if (player.vel.x >= 0) {
      player.vel.x = -32;
    }
  }

  if (e.code === "ArrowDown") {
    if (player.vel.y <= 0) {
      player.vel.y = 32;
    }
  }

  if (e.code === "ArrowUp") {
    if (player.vel.y >= 0) {
      player.vel.y = -32;
    }
  }

  // console.log(
  //   { CX: camera.pos.x, CY: camera.pos.y },
  //   { PX: player.pos.x, PY: player.pos.y },
  //   { BW: buffer.width, BH: buffer.height }
  // );
  //console.log(e.code);
});
// window.addEventListener("resize", (e) => {
//   canvas.width = window.innerWidth;
//   //canvas.height=window.height;
// });
