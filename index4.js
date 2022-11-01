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

const level = loadImage("./images/my_thexder2.png").then((img) => {
  ctx.drawImage(img, 0, 0);
});
