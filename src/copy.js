import { SWEETS, WHY } from "./data.js";

const NAME_FALLBACK = { americano: "清醒一下美式", oat: "慢慢来燕麦拿铁", salted: "咸咸的海盐拿铁", mocha: "抱一下摩卡", macchiato: "好事多一圈玛奇朵", flatwhite: "歇口气馥芮白", orange: "有盼头橙C美式", decaf: "心跳放慢低因拿铁", cold: "放空冷萃", coconut: "有人陪生椰拿铁", dirty: "小小得意Dirty" };
const ENERGY_LINES = ["电量只剩一格，还是来了。", "撑着呢，我看得出来。", "电量还行，那就慢慢喝。", "今天挺有劲嘛。", "满格的日子不多，记一下。"];
const FEELING_LINES = { "累了": "这杯不是续命，是让你歇口气。", "有点烦": "冰块会化掉的，烦也是。", "焦虑": "先喝一口，事情不会跑掉。", "委屈": "委屈就委屈吧，这杯甜一点。", "想哭": "海盐本来就是咸的，哭也没关系。", "想被抱抱": "捧在手里，就当抱一下。", "孤单": "一个人喝咖啡，也算有个伴。", "平静": "难得安静，别急着喝完。", "开心": "有好事就多加一圈焦糖。", "有点期待": "期待的事，就像等咖啡滴完。", "空空的": "空的时候，先装一杯咖啡进去。", "被夸了": "被夸了就收下，不用谦虚。" };
const EDIT_LINES = { "想冷静一下": "今天想清醒着过。", "想被暖一暖": "捧着它，手先暖起来。", "不想被哄": "苦就苦得干脆一点。", "一点点就好": "甜一点点，刚好。", "想被照顾一下": "多一点甜，是该的。", "今天需要甜的": "今天就该甜一点。", "刚刚好就好": "不多不少，刚刚好。", "今天还得硬撑": "多一份浓缩，也多撑一会儿。", "想让自己慢下来": "慢一点，没人催你。", "想要熟悉的味道": "熟悉的味道最安心。", "想温柔一点": "燕麦奶软软的，对自己也软一点。", "想轻松一点": "椰乳淡淡的，心也松一点。", "想要干脆一点": "不加奶，干干脆脆。", "有点想哭": "撒了海盐，想哭也没关系。", "有件小事挺开心": "有好事，焦糖多一圈。", "想被抱抱": "可可粉撒满，就当抱一下。", "想打起精神": "一片橙子，给你提提神。", "有点烦，想叛逆一下": "肉桂有点冲，冲一下也好。", "想换个口味": "换个口味，换个心情。" };

export function fallbackCopy(order, model, moods, helpers) {
  if (moods.length) return { name: helpers.realName(model), why: "这杯是照着你现在的心情调的。", note: [`${model.temp}${helpers.realName(model)}，${SWEETS[model.sweet]}。`, EDIT_LINES[moods.at(-1)] || "好，就这杯。", "慢慢喝。"] };
  return { name: NAME_FALLBACK[model.key] || helpers.realName(model), why: WHY[model.key] || "", note: [ENERGY_LINES[order.energy - 1], FEELING_LINES[order.feelings[0]], order.say ? "你说的那句，我记在杯套背面了。" : "明天见。"] };
}

function validCopy(value, edited) {
  if (!value || typeof value.name !== "string" || typeof value.why !== "string" || !Array.isArray(value.note)) return false;
  const note = value.note.map((line) => String(line).trim()).filter(Boolean).slice(0, 3);
  if (!note.length) return false;
  if (edited && note.some((line) => ["换成", "改成", "原本"].some((word) => line.includes(word)))) return false;
  return { name: value.name.trim().slice(0, 16), why: value.why.trim().slice(0, 56), note };
}

export async function writeCopy(order, model, moods, helpers) {
  const fallback = fallbackCopy(order, model, moods, helpers);
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const response = await fetch("/api/copy", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        order: { period: order.period, energy: order.energy, energyText: order.energyText, feelings: order.feelings, say: order.say },
        drink: { key: model.key, name: helpers.realName(model), temp: model.temp, sweet: SWEETS[model.sweet], strength: helpers.strengthText(model), milk: helpers.milkText[model.milk], toppings: [...model.tops].map((top) => helpers.topText[top]) },
        moods,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) return fallback;
    return validCopy(await response.json(), moods.length > 0) || fallback;
  } catch {
    return fallback;
  }
}
