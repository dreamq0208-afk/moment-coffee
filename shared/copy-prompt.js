export const COPY_PROMPT_TEMPLATE = `你是一家小咖啡馆里的咖啡师，熟客来点单。请给这杯咖啡起名字、说一句为什么是这杯、再在杯套上写几句话。

客人此刻的状态：
- 时间：{period}
- 电量（精力）：{energy}/5，{energyText}
- 感受：{feelings}
- 他想说的话：{say}

这杯咖啡：{name}，{temp}，{sweet}，{strength}，{milk}{toppings}
{editPart}

要求：
1. name：4 到 10 个字。把此刻的心情和这杯咖啡揉在一起，带一点幽默，不用标点。例子：撑住了燕麦拿铁、被夸后的焦糖玛奇朵。
2. why：一句话，不超过 28 个字。从咖啡本身说为什么此刻适合它（口感、温度、甜度、咖啡因）。说人话。
3. note：2 到 3 行，每行不超过 18 个字。像熟客的咖啡师在杯套上随手写的。
   - 必须提到客人的具体选择（电量、感受、他说的话，或他调的配方），让他觉得被看到了。
   - 用咖啡的语言说情绪。不说教，不灌鸡汤，不写"加油""一切都会好的"。不用感叹号和 emoji。
4. 如果客人的话流露出想伤害自己或不想活了，note 不玩咖啡梗，认真温和地说你看到了，请他现在就联系信任的人或当地心理援助热线。

只回复 JSON：{"name":"...","why":"...","note":["...","..."]}`;

export function buildCopyPrompt({ order, drink, moods }) {
  const editPart = moods.length
    ? `这杯是客人自己动手调出来的。他调的时候流露出的心情：${moods.join("、")}。
这是这次最重要的信息，请从这些选择里读出他此刻的心情来写。
不要提到任何之前的推荐，不要用"换成""改成""原本"这类字眼。就当这杯本来就是他点的。`
    : "";
  return COPY_PROMPT_TEMPLATE
    .replace("{period}", order.period)
    .replace("{energy}", String(order.energy))
    .replace("{energyText}", order.energyText)
    .replace("{feelings}", order.feelings.join("、"))
    .replace("{say}", order.say || "（没写）")
    .replace("{name}", drink.name)
    .replace("{temp}", drink.temp)
    .replace("{sweet}", drink.sweet)
    .replace("{strength}", drink.strength)
    .replace("{milk}", drink.milk)
    .replace("{toppings}", drink.toppings.length ? `，加了${drink.toppings.join("、")}` : "")
    .replace("{editPart}", editPart);
}

export function validateCopyRequest(body) {
  return Boolean(
    body && body.order && body.drink
      && Array.isArray(body.order.feelings)
      && body.order.feelings.length >= 1
      && body.order.feelings.length <= 3
      && Number.isInteger(body.order.energy)
      && body.order.energy >= 1
      && body.order.energy <= 5
      && String(body.order.say || "").length <= 60
      && Array.isArray(body.drink.toppings)
      && Array.isArray(body.moods)
      && body.moods.length <= 12,
  );
}

export function extractCopyJson(text) {
  const match = String(text).match(/\{[\s\S]*\}/);
  if (!match) throw new Error("invalid-ai-json");
  return JSON.parse(match[0]);
}
