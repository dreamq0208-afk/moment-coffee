import { DRINKS, ENERGY, MILK_TEXT, SCORE, SWEETS, TOP_TEXT } from "./data.js";

export function period(hour) {
  return hour < 5 ? "深夜" : hour < 11 ? "早上" : hour < 14 ? "中午" : hour < 18 ? "下午" : hour < 22 ? "晚上" : "深夜";
}

export function makeOrder({ date = new Date(), energy, feelings, say = "" }) {
  const hour = date.getHours();
  const night = hour >= 18 || hour < 5;
  const scores = Object.fromEntries(Object.keys(DRINKS).map((key) => [key, 0]));
  feelings.forEach((feeling, index) => Object.entries(SCORE[feeling]).forEach(([key, value]) => { scores[key] += value * (index ? 1 : 1.2); }));
  if (energy <= 2) { scores.flatwhite += 1; if (!night) scores.cold += 1; }
  if (energy >= 4) { scores.orange += 1; scores.macchiato += 1; }
  if (night) { scores.decaf += 2; scores.cold -= 3; scores.americano -= 1; }
  return { time: date, night, period: period(hour), feelings, energy, energyText: ENERGY[energy - 1], say: say.trim(), rank: Object.keys(scores).sort((a, b) => scores[b] - scores[a]) };
}

export function modelFrom(key, order) {
  const drink = DRINKS[key];
  const recipe = drink.m;
  const warm = order.feelings.some((value) => ["想被抱抱", "孤单", "委屈", "想哭"].includes(value));
  const cool = order.feelings.some((value) => ["有点烦", "焦虑"].includes(value)) && !warm;
  let temp = drink.temps[0];
  if (warm && drink.temps.includes("热")) temp = "热";
  else if (cool && drink.temps.includes("冰")) temp = "冰";
  const comfort = order.feelings.filter((value) => ["委屈", "想哭", "想被抱抱", "孤单", "开心", "被夸了"].includes(value)).length;
  const bitter = order.feelings.some((value) => ["有点烦", "空空的"].includes(value));
  const sweet = comfort >= 2 ? 2 : comfort === 1 ? 1 : bitter ? 0 : 1;
  const decaf = order.night || order.feelings.includes("焦虑") || recipe.strength === "decaf";
  return { key, real: drink.real, base: recipe.base || "esp", milk: recipe.milk, tops: new Set(recipe.tops || []), temp, sweet, strength: decaf ? "decaf" : order.energy <= 2 ? "double" : "single" };
}

export const cloneModel = (model) => ({ ...model, tops: new Set(model.tops) });

export function realName(model) {
  if (model.real) return model.real;
  const top = model.tops;
  const prefix = top.has("salt") ? "海盐" : top.has("caramel") ? "焦糖" : top.has("cinnamon") ? "肉桂" : top.has("orange") && model.base !== "orange" ? "橙香" : "";
  if (model.milk === "none") {
    if (model.base === "orange") return "橙C美式";
    if (model.base === "cold") return `${prefix}冷萃`;
    return top.has("cocoa") ? "可可美式" : `${prefix}美式`;
  }
  const cold = model.base === "cold" ? "冷萃" : "";
  if (top.has("cocoa")) return `${prefix}${cold}${{ milk: "摩卡", oat: "燕麦摩卡", coco: "生椰摩卡" }[model.milk]}`;
  return `${prefix}${cold}${{ milk: "拿铁", oat: "燕麦拿铁", coco: "生椰拿铁" }[model.milk]}`;
}

export function strengthText(model) {
  if (model.base === "cold") return model.strength === "decaf" ? "低因冷萃" : model.strength === "double" ? "冷萃加浓" : "冷萃原液";
  return { single: "单份浓缩", double: "双份浓缩", decaf: "低因浓缩" }[model.strength];
}

export const specLine = (model) => `${model.temp}，${SWEETS[model.sweet]}，${strengthText(model)}，${MILK_TEXT[model.milk]}`;
export const topsLine = (model) => [...model.tops].map((top) => TOP_TEXT[top]).join("、");
