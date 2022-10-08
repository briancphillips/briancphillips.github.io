const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const buffer = document.createElement("canvas");
const bufferCtx = buffer.getContext("2d");

const tileW = 32;
const tileH = 32;
const mapW = 546;
const mapH = 44;

canvas.width = 1280;
canvas.height = tileH * 21;
buffer.width = tileW * 546;
buffer.height = tileH * 42;

class Camera {
  constructor(pos, dim) {
    this.pos = pos;
    this.dim = dim;
    this.bounds = { x1: 0, y1: 0, x2: 0, y2: 0 };
    this.offset = { x: 0, y: 0 };
  }

  draw() {
    ctx.drawImage(
      buffer,
      camera.bounds.x1 - camera.offset.x,
      camera.bounds.y1 - camera.offset.y,
      canvas.width,
      canvas.height,
      0,
      0,
      canvas.width,
      canvas.height
    );
  }

  update(px, py) {
    this.offset.x = Math.floor(this.dim.x / 2 - px);
    this.offset.y = Math.floor(this.dim.y / 2 - py);
    this.pos.x = this.offset.x;
    this.pos.y = this.offset.y;
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

    if (this.bounds.x2 >= buffer.width) this.bounds.x2 = buffer.width;
    // if (this.bounds.y2 >= buffer.height - tileH)
    //   this.bounds.y2 = buffer.height + tileH;
    console.log(this.pos.x, this.pos.y);
    this.draw();
    //console.log(camera);
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
      this.pos.x + camera.offset.x,
      this.pos.y + camera.offset.y,
      this.w,
      this.h
    );
  }

  update() {
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
    if (this.pos.x < 640) {
      this.pos.x = 640;
      this.vel.x = 0;
    }
    if (this.pos.x + this.w > buffer.width) {
      this.pos.x = buffer.width - this.w;
      this.vel.x = 0;
    }
    if (this.pos.y < tileH) {
      this.pos.y = tileH;
      this.vel.y = 0;
    }
    if (this.pos.y + this.h > buffer.height - tileH) {
      this.pos.y = buffer.height - this.h - tileH;
      this.vel.y = 0;
    }
    camera.update(this.pos.x, this.pos.y);
    //console.log(this.pos.x, this.pos.y);
    this.vel.x = 0;
    this.vel.y = 0;
    this.draw();
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

  player.update();

  window.requestAnimationFrame(animate);
}

const player = new Player({ x: 640, y: 384 - 64 }, { x: 0, y: 0 });

const camera = new Camera(
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

  //console.log(camera);
});
// window.addEventListener("resize", (e) => {
//   canvas.width = window.innerWidth;
//   //canvas.height=window.height;
// });
