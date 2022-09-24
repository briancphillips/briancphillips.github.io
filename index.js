const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const buffer = document.createElement("canvas");
const bufferCtx = buffer.getContext("2d");

//canvas.setAttribute("style", "transform:scale(2,2)");
//ctx.imageSmoothingEnabled = false;
const tileW = 32;
const tileH = 32;

canvas.width = window.innerWidth;
canvas.height = 32 * 25;
buffer.width = 32 * 546;
buffer.height = 32 * 47;
class Camera {
  constructor(pos) {
    this.pos = pos;
  }
  update() {
    this.pos.x = player.pos.x - canvas.width / 2;
    this.pos.y = player.pos.y - canvas.height / 2;
    // if (this.pos.x >= 0) this.pos.x = player.pos.x;
    // if (this.pos.x < 0) this.pos.x = 0;
    // if (this.pos.x > buffer.width - canvas.width)
    //   this.pos.x = buffer.width - canvas.width;

    // if (this.pos.y > 0) this.pos.y = player.pos.y;
    // if (this.pos.y < 0) this.pos.y = 0;
    // if (this.pos.y > buffer.height - canvas.height)
    //   this.pos.y = buffer.height - canvas.height;
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

    if (this.pos.x < 0 - this.pos.x) this.pos.x = 0;
    if (this.pos.x > buffer.width - this.w - canvas.width / 2)
      this.pos.x = buffer.width - this.w - canvas.width / 2;

    if (this.pos.y < 0 - this.pos.y + tileH) this.pos.y = 0 + tileH;
    if (this.pos.y > buffer.height + tileH * 4 - canvas.height / 2 + tileH / 2)
      this.pos.y = buffer.height + tileH * 4 - canvas.height / 2 + tileH / 2;
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

const level = parseJson("/map.json").then((m) => {
  const layers = m.layers;
  const cols = m.width;
  const tileMapCols = m.tilewidth;
  bufferCtx.fillStyle = "black";
  bufferCtx.fillRect(0, 0, buffer.width, buffer.height);

  layers.forEach((layer) => {
    loadImage("/images/tiles32x32.png").then((img) => {
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
  ctx.drawImage(
    buffer,
    camera.pos.x,
    camera.pos.y,
    canvas.width,
    canvas.height,
    0,
    0,
    canvas.width,
    canvas.height
  );
  ctx.fillStyle = "green";
  ctx.fillRect(0, canvas.height - tileH * 3, canvas.width, canvas.height);
  camera.update();
  player.update();
  console.log({ CAMX: camera.pos.x, CAMY: camera.pos.y });
  console.log({
    PLYX: player.pos.x,
    PLYY: player.pos.y,
    PLYCAMVELX: player.pos.x - camera.pos.x,
  });
  window.requestAnimationFrame(animate);
}

player = new Player({ x: 640, y: 384 }, { x: 0, y: 0 });
camera = new Camera({ x: 0, y: 0 });
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
  console.log(e.code);
});
// window.addEventListener("resize", (e) => {
//   canvas.width = window.innerWidth;
//   //canvas.height=window.height;
// });
