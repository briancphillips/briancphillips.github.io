const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const buffer = document.createElement("canvas");
const bufferCtx = buffer.getContext("2d");

//canvas.setAttribute("style", "transform:scale(2,2)");
//ctx.imageSmoothingEnabled = false;
const tileW = 32;
const tileH = 32;

canvas.width = window.innerWidth;
canvas.height = 32 * 24;
buffer.width = 32 * 546;
buffer.height = 32 * 46;
class Camera {
  constructor(pos) {
    this.pos = pos;
    this.scrollBounds = {
      x1: canvas.width / 4,
      y1: canvas.height / 4,
      x2: canvas.width / 2,
      y2: canvas.height / 2,
    };
    this.scroll = 0;
  }

  // update() {
  //   if (
  //     player.pos.x > this.scrollBounds.x1 ||
  //     player.pos.x < this.scrollBounds.x2
  //   )
  //     this.pos.x = player.pos.x - canvas.width / 2;
  //   //this.pos.x = player.pos.x - canvas.width / 2;
  //   if (
  //     player.pos.y > this.scrollBounds.y1 &&
  //     player.pos.y < this.scrollBounds.y2
  //   )
  //     //this.pos.y = player.pos.y - buffer.height / 2 + tileH * 4;
  //     this.pos.y = player.pos.y - buffer.height / 2 + tileH * 4;
  //   ctx.drawImage(
  //     buffer,
  //     camera.pos.x,
  //     camera.pos.y,
  //     canvas.width,
  //     canvas.height,
  //     0,
  //     0,
  //     canvas.width,
  //     canvas.height
  //   );
  //   ctx.lineWidth = 5;
  //   ctx.strokeStyle = "purple";
  //   ctx.strokeRect(
  //     this.scrollBounds.x1,
  //     this.scrollBounds.y1,
  //     this.scrollBounds.x2,
  //     this.scrollBounds.y2
  //   );
  //   ctx.strokeStyle = "WHITE";
  //   ctx.moveTo(0, canvas.height - canvas.height / 4);
  //   ctx.lineTo(canvas.width, canvas.height - canvas.height / 4);
  //   ctx.stroke();
  //   // if (this.pos.x >= 0) this.pos.x = player.pos.x;
  //   // if (this.pos.x < 0) this.pos.x = 0;
  //   // if (this.pos.x > buffer.width - canvas.width)
  //   //   this.pos.x = buffer.width - canvas.width;

  //   // if (this.pos.y > 0) this.pos.y = player.pos.y;
  //   // if (this.pos.y < 0) this.pos.y = 0;
  //   // if (this.pos.y > buffer.height - canvas.height)
  //   //   this.pos.y = buffer.height - canvas.height;
  // }

  update() {
    // if (player.pos.y < this.scrollBounds.y1) this.pos.y = this.scrollBounds.y1;
    // if (player.pos.y > this.scrollBounds.y2 + this.scrollBounds.y1)
    //   //this.pos.y = player.pos.y - buffer.height / 2 + tileH * 4;
    //   this.pos.y = this.scrollBounds.y2;

    this.pos.x = -canvas.width / 2 + player.pos.x;
    //this.pos.y = canvas.height / 2 - player.pos.y;

    if (player.pos.y + tileH + player.h > buffer.height / 2) {
      this.pos.y = -buffer.height / 2 + player.pos.y + player.h + tileH;
    }
    // if (Math.sign(player.vel.y) === -1) {
    //   if (player.pos.y + tileH > buffer.height / 2) {
    //     this.pos.y = -buffer.height / 2 + player.pos.y;
    //     console.log("scolling");
    //   } else {
    //     this.pos.y = 0;
    //   }
    // }

    // if (Math.sign(player.vel.y) === 1) {
    //   if (player.pos.y + player.h + tileH > buffer.height / 2) {
    //     this.pos.y = -384 + player.pos.y + player.h;
    //     console.log("scolling");
    //   } else {
    //     this.pos.y = buffer.height;
    //   }
    // }

    ctx.lineWidth = 5;
    ctx.strokeStyle = "purple";
    ctx.strokeRect(
      this.scrollBounds.x1,
      this.scrollBounds.y1,
      this.scrollBounds.x2,
      this.scrollBounds.y2
    );
    ctx.strokeStyle = "WHITE";
    ctx.moveTo(0, buffer.height / 2 - tileH);
    ctx.lineTo(canvas.width, buffer.height / 2 - tileH);
    ctx.stroke();
    // if (
    //   player.pos.y > buffer.height / 2 + tileH &&
    //   Math.sign(player.vel.y) === 1
    // ) {
    //   this.pos.y = buffer.height - player.pos.y;
    //   console.log("innnnnnn");
    // }
    // if (
    //   player.pos.y + player.h >= buffer.height / 2 - tileH * 2 &&
    //   Math.sign(player.vel.y) === -1
    // )
    //   this.pos.y = player.pos.y + tileH * 2 + player.h - buffer.height / 2;

    // if (
    //   player.pos.y <= buffer.height / 2 + tileH &&
    //   Math.sign(player.vel.y) === 1
    // )
    //   this.pos.y = player.pos.y;

    // if (
    //   player.pos.y >= buffer.height / 2 - player.h - tileH &&
    //   Math.sign(player.vel.y) === -1
    // )
    //   this.pos.y = player.pos.y + player.h + tileH - buffer.height / 2;
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
    ctx.lineWidth = 5;
    ctx.strokeStyle = "purple";
    ctx.strokeRect(
      this.scrollBounds.x1,
      this.scrollBounds.y1,
      this.scrollBounds.x2,
      this.scrollBounds.y2
    );
    ctx.strokeStyle = "WHITE";
    ctx.moveTo(0, buffer.height - camera.pos.y);
    ctx.lineTo(canvas.width, buffer.height - camera.pos.y);
    ctx.stroke();
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
    if (this.pos.x + this.w > buffer.width) this.pos.x = buffer.width - this.w;

    if (this.pos.y < tileH) this.pos.y = tileH;
    if (this.pos.y + this.h > buffer.height - tileH)
      this.pos.y = buffer.height - tileH - this.h;
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

  ctx.fillStyle = "green";
  ctx.fillRect(0, canvas.height - tileH * 3, canvas.width, canvas.height);

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

player = new Player({ x: 640, y: 384 }, { x: 0, y: 0 });
camera = new Camera({ x: 0, y: 0 });
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
      player.vel.x = 8;
    }
  }

  if (e.code === "ArrowLeft") {
    if (player.vel.x >= 0) {
      player.vel.x = -8;
    }
  }

  if (e.code === "ArrowDown") {
    if (player.vel.y <= 0) {
      player.vel.y = 8;
    }
  }

  if (e.code === "ArrowUp") {
    if (player.vel.y >= 0) {
      player.vel.y = -8;
    }
  }
  //console.log(e.code);
});
// window.addEventListener("resize", (e) => {
//   canvas.width = window.innerWidth;
//   //canvas.height=window.height;
// });
