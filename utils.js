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
