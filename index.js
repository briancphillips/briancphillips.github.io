const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const buffer = document.createElement("canvas");
const bufferCtx = buffer.getContext("2d");

//canvas.setAttribute("style", "transform:scale(2,2)");
//ctx.imageSmoothingEnabled = false;
const tileW = 32;
const tileH = 32;

canvas.width = window.innerWidth;
canvas.height = tileH * 24;
buffer.width = tileW * 546;
buffer.height = tileH * 44;
class Camera {
  constructor(pos) {
    this.pos = pos;
  }

  draw() {
    ctx.drawImage(
      buffer,
      this.pos.x,
      this.pos.y,
      canvas.width,
      canvas.height,
      0,
      0,
      canvas.width,
      canvas.height
    );
  }
  update() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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
      this.pos.x - camera.pos.x,
      this.pos.y - camera.pos.y,
      this.w,
      this.h
    );
  }

  update() {
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
    if (this.pos.x < 640) this.pos.x = 640;
    if (this.pos.x > 17250) this.pos.x = 17250;

    if (this.pos.y < tileH) this.pos.y = tileH;
    if (this.pos.y + this.h > buffer.height - tileH)
      this.pos.y = buffer.height - this.h - tileH;
    if (this.pos.x > 864 && this.pos.x + this.w < buffer.width - 864)
      camera.pos.x = this.pos.x - canvas.width / 2;
    if (this.pos.y <= 1024 && this.pos.y >= 384)
      camera.pos.y = this.pos.y - canvas.height / 2;
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
  camera.update();

  // ctx.fillStyle = "green";
  // ctx.fillRect(0, canvas.height - tileH, canvas.width, canvas.height);
  ctx.lineWidth = 5;
  ctx.strokeStyle = "white";
  ctx.moveTo(0, buffer.height / 2);
  ctx.lineTo(canvas.width, buffer.height / 2);
  ctx.stroke();
  player.update();
  // console.log({ CAMX: camera.pos.x, CAMY: camera.pos.y });
  // console.log({
  //   PLYX: player.pos.x,
  //   PLYY: player.pos.y,
  //   PLYCAMVELX: player.pos.x - camera.pos.x,
  // });
  //console.log(camera.scrollBounds.y1);
  console.log(
    { CX: camera.pos.x, CY: camera.pos.y },
    { PX: player.pos.x, PY: player.pos.y },
    { BW: buffer.width, BH: buffer.height }
  );
  window.requestAnimationFrame(animate);
}

const player = new Player({ x: 640, y: 384 }, { x: 0, y: 0 });
const camera = new Camera({ x: 0, y: 0 });
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
  //console.log(e.code);
});
// window.addEventListener("resize", (e) => {
//   canvas.width = window.innerWidth;
//   //canvas.height=window.height;
// });
