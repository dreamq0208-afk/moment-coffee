import test from "node:test";
import assert from "node:assert/strict";
import { buildCopyPrompt, extractCopyJson, validateCopyRequest } from "../shared/copy-prompt.js";

const request = {
  order: { period: "晚上", energy: 2, energyText: "撑着呢", feelings: ["焦虑"], say: "" },
  drink: { name: "低因拿铁", temp: "热", sweet: "少糖", strength: "低因浓缩", milk: "牛奶", toppings: [] },
  moods: ["想被暖一暖"],
};

test("留言请求通过边界校验并生成不泄露旧配方的提示词", () => {
  assert.equal(validateCopyRequest(request), true);
  const prompt = buildCopyPrompt(request);
  assert.match(prompt, /焦虑/);
  assert.match(prompt, /想被暖一暖/);
  assert.match(prompt, /不要用"换成""改成""原本"/);
});

test("从兼容返回中提取 JSON", () => {
  assert.deepEqual(extractCopyJson('```json\n{"name":"慢慢喝","why":"温和","note":["看到了"]}\n```').note, ["看到了"]);
});
