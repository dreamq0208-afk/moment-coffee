import test from "node:test";
import assert from "node:assert/strict";
import { makeOrder, modelFrom } from "../src/recommend.js";

test("焦虑在晚上优先推荐低因并生成低因配方", () => {
  const order = makeOrder({ date: new Date("2026-09-22T21:00:00+08:00"), energy: 2, feelings: ["焦虑"] });
  assert.equal(order.rank[0], "decaf");
  assert.equal(modelFrom(order.rank[0], order).strength, "decaf");
});

test("抱抱情绪让可做热饮的推荐变热", () => {
  const order = makeOrder({ date: new Date("2026-09-22T10:00:00+08:00"), energy: 3, feelings: ["想被抱抱"] });
  assert.equal(modelFrom(order.rank[0], order).temp, "热");
});
