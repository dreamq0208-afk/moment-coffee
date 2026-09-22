export function createCup(getElement, reducedMotion) {
  const $ = getElement;
  const RM = reducedMotion;
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attributes, parent) => {
    const element = document.createElementNS(NS, tag);
    for (const key in attributes) element.setAttribute(key, attributes[key]);
    if (parent) parent.appendChild(element);
    return element;
  };
  const hex = (value) => { const number = parseInt(value.slice(1), 16); return [number >> 16, number >> 8 & 255, number & 255]; };
  const rgb = (color) => `rgb(${color.map(Math.round).join(",")})`;
  const mix = (a, b, amount) => a.map((value, index) => value + (b[index] - value) * amount);
  const TOP = 64;
  const BOTTOM = 242;
  const HEIGHT = BOTTOM - TOP;
  const ORDER = ["syrup", "choco", "orangej", "coffee", "milk", "esp", "foam", "cap"];
  let shown = null;
  let tweenId = 0;

  function layersOf(model) {
    const layers = {};
    const toppings = model.tops;
    if (toppings.has("caramel")) layers.syrup = { c: "#C98A42", f: .07 };
    if (toppings.has("cocoa")) layers.choco = { c: "#5E3424", f: .12 };
    const espresso = model.strength === "decaf" ? "#7A4E36" : model.base === "cold" ? "#3E2619" : "#55321F";
    if (model.milk === "none") {
      if (model.base === "orange") { layers.orangej = { c: "#F0A444", f: .46 }; layers.coffee = { c: "#4E2F1D", f: .54 }; }
      else layers.coffee = { c: model.strength === "decaf" ? "#6A4430" : model.base === "cold" ? "#3A2418" : "#4E2F1D", f: 1 };
    } else {
      const milk = { milk: "#F0E6D6", oat: "#E4D3B6", coco: "#F5F1E8" }[model.milk];
      layers.milk = { c: toppings.has("cocoa") ? "#CFAE8E" : milk, f: .6 };
      layers.esp = { c: espresso, f: model.strength === "double" ? .32 : .2 };
      if (model.temp === "热") layers.foam = { c: "#F8F3EA", f: .11 };
    }
    if (toppings.has("salt") && model.milk !== "none") layers.cap = { c: "#FBF8F2", f: .12 };
    return Object.fromEntries(ORDER.map((id) => [id, layers[id] ? { c: hex(layers[id].c), f: layers[id].f } : { c: null, f: 0 }]));
  }

  function drawLayers(state) {
    const group = $("liquid");
    group.innerHTML = "";
    const total = ORDER.reduce((sum, id) => sum + state[id].f, 0) || 1;
    let y = BOTTOM;
    const bands = [];
    for (const id of ORDER) {
      const layer = state[id];
      if (layer.f <= .001 || !layer.c) continue;
      const height = layer.f / total * HEIGHT;
      y -= height;
      bands.push({ y, h: height, c: layer.c });
    }
    bands.forEach((band, index) => {
      const last = index === bands.length - 1;
      el("rect", { x: 0, y: last ? band.y - 6 : band.y, width: 200, height: band.h + (last ? 6 : 0) + 1, fill: rgb(band.c) }, group);
    });
    bands.slice(1).forEach((band) => el("rect", { x: 0, y: band.y + band.h - 3, width: 200, height: 6, fill: rgb(band.c), opacity: .4 }, group));
    if (bands.length) {
      const color = bands.at(-1).c;
      el("ellipse", { cx: 100, cy: TOP, rx: 70, ry: 4.5, fill: rgb(mix(color, [255, 255, 255], .2)) }, group);
    }
    return bands;
  }

  function tweenTo(model, duration = 460) {
    const target = layersOf(model);
    if (!shown || RM) { shown = target; drawLayers(shown); return; }
    const from = structuredClone(shown);
    const startedAt = performance.now();
    const currentTween = ++tweenId;
    (function frame(time) {
      if (currentTween !== tweenId) return;
      const progress = Math.min(1, (time - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const state = {};
      for (const id of ORDER) {
        const a = from[id]; const b = target[id];
        state[id] = { c: a.c && b.c ? mix(a.c, b.c, eased) : (b.c || a.c), f: a.f + (b.f - a.f) * eased };
      }
      shown = state;
      drawLayers(state);
      if (progress < 1) requestAnimationFrame(frame);
      else { shown = target; drawLayers(target); }
    })(startedAt);
  }

  function drawFinish(model, soft) {
    const toppings = $("toppings"); const garnish = $("garnish");
    toppings.innerHTML = ""; garnish.innerHTML = "";
    const fade = (node) => { if (soft && !RM) node.classList.add("fade-in"); return node; };
    if (model.temp === "冰" && model.key !== "dirty") {
      [[58, 72, 16], [92, 66, -12], [121, 80, 14], [75, 100, 8], [134, 106, -9]].forEach(([x, y, rotation]) => fade(el("rect", { x, y, width: 27, height: 25, rx: 7, fill: "#fff", "fill-opacity": .28, stroke: "#fff", "stroke-opacity": .75, "stroke-width": 1.2, transform: `rotate(${rotation} ${x + 13} ${y + 12})` }, toppings)));
    }
    if (model.tops.has("caramel")) fade(el("path", { d: "M42,66 C52,58 60,72 72,62 S92,58 100,66 S122,72 132,60 S150,64 158,66", fill: "none", stroke: "#A9652A", "stroke-width": 2.6, "stroke-linecap": "round" }, toppings));
    if (model.tops.has("cocoa") || model.tops.has("salt") || model.tops.has("cinnamon")) {
      const group = fade(el("g", {}, toppings));
      const dots = (color, count, radius) => { for (let index = 0; index < count; index += 1) el("circle", { cx: 48 + Math.random() * 104, cy: TOP - 3 + Math.random() * 7, r: radius, fill: color }, group); };
      if (model.tops.has("cocoa")) dots("#6A3B25", 22, 1.3);
      if (model.tops.has("salt")) dots("#FFFFFF", 20, 1.5);
      if (model.tops.has("cinnamon")) dots("#9A5B35", 16, 1.1);
    }
    if (model.tops.has("orange")) {
      const group = fade(el("g", { transform: "translate(160,36) rotate(-18)" }, garnish));
      el("circle", { r: 20, fill: "#F2A13B", stroke: "#DE8016", "stroke-width": 2 }, group); el("circle", { r: 15.5, fill: "#FBC872" }, group);
      for (let angle = 0; angle < 8; angle += 1) el("line", { x1: 0, y1: 0, x2: Math.cos(angle * Math.PI / 4) * 15.5, y2: Math.sin(angle * Math.PI / 4) * 15.5, stroke: "#F2A13B", "stroke-width": 1.4 }, group);
    }
    if (model.tops.has("cinnamon")) {
      const group = fade(el("g", { transform: "translate(52,10) rotate(-14)" }, garnish));
      el("rect", { x: 0, y: 0, width: 9, height: 70, rx: 4, fill: "#9A5B35" }, group); el("line", { x1: 4.5, y1: 3, x2: 4.5, y2: 66, stroke: "#6E3D20", "stroke-width": 1 }, group);
    }
    $("steam").style.display = model.temp === "热" ? "" : "none";
  }

  function pour(model) {
    return new Promise((resolve) => {
      tweenId += 1; shown = layersOf(model); const bands = drawLayers(shown);
      $("toppings").innerHTML = ""; $("garnish").innerHTML = ""; $("steam").style.display = "none";
      const rectangle = $("fillrect"); const stream = $("stream");
      if (RM) { showFull(); drawFinish(model); resolve(); return; }
      rectangle.setAttribute("y", BOTTOM); rectangle.setAttribute("height", 0);
      const duration = 2600; const startedAt = performance.now(); stream.setAttribute("opacity", 1);
      (function frame(time) {
        const progress = Math.min(1, (time - startedAt) / duration); const eased = 1 - Math.pow(1 - progress, 1.6); const y = BOTTOM - (HEIGHT + 12) * eased;
        rectangle.setAttribute("y", y); rectangle.setAttribute("height", BOTTOM - y);
        const current = bands.find((band) => y >= band.y - 1) || bands.at(-1);
        stream.setAttribute("fill", rgb(current.c)); stream.setAttribute("height", Math.max(0, y + 30));
        if (progress > .9) stream.setAttribute("opacity", (1 - progress) * 10);
        if (progress < 1) requestAnimationFrame(frame); else { stream.setAttribute("opacity", 0); drawFinish(model, true); resolve(); }
      })(startedAt);
    });
  }

  function showFull() { $("fillrect").setAttribute("y", TOP - 12); $("fillrect").setAttribute("height", HEIGHT + 12); }
  function resetCup() { tweenId += 1; $("liquid").innerHTML = ""; $("toppings").innerHTML = ""; $("garnish").innerHTML = ""; $("fillrect").setAttribute("y", BOTTOM); $("fillrect").setAttribute("height", 0); $("steam").style.display = "none"; $("stream").setAttribute("opacity", 0); shown = null; }

  return { drawFinish, pour, resetCup, showFull, tweenTo };
}
