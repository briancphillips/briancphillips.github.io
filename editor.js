const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const buffer = document.createElement("canvas");
const bufferCtx = buffer.getContext("2d");

//canvas.setAttribute("style", "transform:scale(2,2)");
//ctx.imageSmoothingEnabled = false;
const tileW = 32;
const tileH = 32;

//canvas.width = window.innerWidth;
canvas.width = 1280;
//canvas.height = 400;
canvas.height = tileH * 21;
buffer.width = tileW * 546;
buffer.height = tileH * 42;

canvas.setAttribute("style", "background-color:black");

let rect1x,
  rect1y,
  rect2x,
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
    x: Math.floor(Math.abs(evt.clientX - rect.left) / tileW),
    y: Math.floor(Math.abs(evt.clientY - rect.top) / tileH),
  };
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(
    buffer,
    0,
    0,
    canvas.width,
    canvas.height,
    rect1x,
    rect1y,
    canvas.width,
    canvas.height
  );
  //ctx.fillRect(rect1x, rect1y, rect2x - rect1x, rect2y - rect1y);
  drawGrid();
  window.requestAnimationFrame(update);
}
update();

canvas.addEventListener("mousemove", (e) => {
  let a = canvas.getBoundingClientRect().left;
  let b = canvas.getBoundingClientRect().top;
  if (MOUSE_DOWN) {
    let mousePosition = getMousePos(e);
    rect1x = mousePosition.x;
    rect1y = mousePosition.y;
    rect2x = mousePosition.x;
    rect2y = mousePosition.y;

    //console.log(getMousePos(e));
  }
});

canvas.addEventListener("mouseup", (e) => {
  MOUSE_DOWN = false;
  let a = canvas.getBoundingClientRect().left;
  let b = canvas.getBoundingClientRect().top;
  let mousePosition = getMousePos(e);
  rect1x = mousePosition.x;
  rect1y = mousePosition.y;
  rect2x = mousePosition.x;
  rect2y = mousePosition.y;
  //console.log(e.target);
});

canvas.addEventListener("mousedown", (e) => {
  if (MOUSE_DOWN) {
    MOUSE_DOWN = false;
  } else {
    MOUSE_DOWN = true;
  }
  let a = canvas.getBoundingClientRect().left;
  let b = canvas.getBoundingClientRect().top;
  let mousePosition = getMousePos(e);
  rect1x = mousePosition.x;
  rect1y = mousePosition.y;
  rect2x = mousePosition.x;
  rect2y = mousePosition.y;
  //console.log(getMousePos(e));
});
