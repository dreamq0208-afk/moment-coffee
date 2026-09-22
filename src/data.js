export const ENERGY = ["快关机了", "撑着呢", "还行", "挺有劲", "满格"];
export const FEELINGS = ["累了", "有点烦", "焦虑", "委屈", "想哭", "想被抱抱", "孤单", "平静", "开心", "有点期待", "空空的", "被夸了"];
export const SWEETS = ["不加糖", "少糖", "半糖", "标准糖"];

export const DRINKS = {
  americano: { real: "美式", m: { base: "esp", milk: "none" }, temps: ["冰", "热"], taste: "苦得干脆，没有奶和糖", caffeine: "中", moment: "脑子乱、想清醒" },
  oat: { real: "燕麦拿铁", m: { milk: "oat" }, temps: ["冰", "热"], taste: "柔和，咖啡味不冲", caffeine: "中", moment: "想慢慢来" },
  salted: { real: "海盐焦糖拿铁", m: { milk: "milk", tops: ["salt", "caramel"] }, temps: ["热", "冰"], taste: "一点咸一点甜", caffeine: "中", moment: "情绪有点满" },
  mocha: { real: "摩卡", m: { milk: "milk", tops: ["cocoa"] }, temps: ["热", "冰"], taste: "巧克力托底，偏甜", caffeine: "中", moment: "需要被哄一下" },
  macchiato: { real: "焦糖玛奇朵", m: { milk: "milk", tops: ["caramel"] }, temps: ["冰", "热"], taste: "第一口就是甜的", caffeine: "中", moment: "有好事的时候" },
  flatwhite: { real: "馥芮白", m: { milk: "milk" }, temps: ["热"], taste: "奶少咖啡多，很顺", caffeine: "中偏高", moment: "累了但还得撑" },
  orange: { real: "橙C美式", m: { base: "orange", milk: "none", tops: ["orange"] }, temps: ["冰"], taste: "酸甜把苦味提亮", caffeine: "中", moment: "想要点精神" },
  decaf: { real: "低因拿铁", m: { milk: "milk", strength: "decaf" }, temps: ["热", "冰"], taste: "和拿铁差不多，更温和", caffeine: "很低", moment: "晚上、心慌的时候" },
  cold: { real: "冷萃", m: { base: "cold", milk: "none" }, temps: ["冰"], taste: "不酸不苦，很安静", caffeine: "高", moment: "白天需要放空" },
  coconut: { real: "生椰拿铁", m: { milk: "coco" }, temps: ["冰"], taste: "椰乳淡甜", caffeine: "中", moment: "一个人的时候" },
  dirty: { real: "Dirty", m: { milk: "milk" }, temps: ["冰"], taste: "冰牛奶上浮一层浓缩", caffeine: "中偏高", moment: "想来点小刺激" },
};

export const WHY = {
  americano: "没有奶也没有糖，苦得很干脆，适合脑子乱的时候。", oat: "燕麦奶很柔，咖啡味不冲，喝起来不费力气。",
  salted: "一点咸，一点甜，和现在的心情刚好对得上。", mocha: "巧克力垫在底下，苦的时候有个托底。",
  macchiato: "焦糖在最上面，第一口就是甜的。", flatwhite: "奶少咖啡多，口感顺，提神又不刺激。",
  orange: "橙汁的酸甜把苦味提亮了，喝着有精神。", decaf: "咖啡因很少，心跳不用跟着赶。",
  cold: "冷萃不酸不苦，很安静的一杯。", coconut: "椰乳甜得很淡，像旁边坐了个人。", dirty: "冰牛奶上浮着一层浓缩，第一口就很过瘾。",
};

export const SCORE = {
  "累了": { flatwhite: 2, dirty: 2, oat: 1, cold: 1 }, "有点烦": { americano: 3, orange: 2, cold: 1 },
  "焦虑": { decaf: 3, oat: 2, cold: -3, americano: -1 }, "委屈": { mocha: 3, salted: 2 }, "想哭": { salted: 3, mocha: 2 },
  "想被抱抱": { mocha: 3, oat: 2, decaf: 1 }, "孤单": { coconut: 2, oat: 2, mocha: 1 }, "平静": { flatwhite: 2, oat: 2, dirty: 1 },
  "开心": { macchiato: 3, orange: 2, coconut: 1 }, "有点期待": { orange: 3, dirty: 2, macchiato: 1 },
  "空空的": { cold: 2, americano: 2, flatwhite: 1 }, "被夸了": { macchiato: 2, dirty: 2, coconut: 1 },
};

export const OPTS = {
  temp: { label: "温度", items: [{ v: "冰", t: "冰", mood: "想冷静一下", sw: "#DCE7EC" }, { v: "热", t: "热", mood: "想被暖一暖", sw: "#EBCBA9" }] },
  sweet: { label: "甜度", items: [{ v: 0, t: "不加糖", mood: "不想被哄", sw: "#F3F1EC" }, { v: 1, t: "少糖", mood: "一点点就好", sw: "#F1E4CC" }, { v: 2, t: "半糖", mood: "想被照顾一下", sw: "#EACD9E" }, { v: 3, t: "标准糖", mood: "今天需要甜的", sw: "#DDB073" }] },
  strength: { label: "浓度", items: [{ v: "single", t: "单份浓缩", mood: "刚刚好就好", sw: "#8A5A3C" }, { v: "double", t: "双份浓缩", mood: "今天还得硬撑", sw: "#4A2E20" }, { v: "decaf", t: "低因", mood: "想让自己慢下来", sw: "#B89680" }] },
  milk: { label: "奶", items: [{ v: "milk", t: "牛奶", mood: "想要熟悉的味道", sw: "#F2EADC" }, { v: "oat", t: "燕麦奶", mood: "想温柔一点", sw: "#E4D3B7" }, { v: "coco", t: "椰乳", mood: "想轻松一点", sw: "#F7F4EC" }, { v: "none", t: "不加奶", mood: "想要干脆一点", sw: "#6B4530" }] },
  tops: { label: "小料", multi: true, items: [{ v: "salt", t: "海盐", mood: "有点想哭", sw: "#FFFFFF" }, { v: "caramel", t: "焦糖", mood: "有件小事挺开心", sw: "#C98A42" }, { v: "cocoa", t: "可可粉", mood: "想被抱抱", sw: "#6A3B25" }, { v: "orange", t: "橙片", mood: "想打起精神", sw: "#F2A33B" }, { v: "cinnamon", t: "肉桂", mood: "有点烦，想叛逆一下", sw: "#9A5B35" }] },
};

export const TAB_ORDER = ["temp", "sweet", "strength", "milk", "tops"];
export const MILK_TEXT = { milk: "牛奶", oat: "燕麦奶", coco: "椰乳", none: "不加奶" };
export const TOP_TEXT = { salt: "海盐", caramel: "焦糖", cocoa: "可可粉", orange: "橙片", cinnamon: "肉桂" };
