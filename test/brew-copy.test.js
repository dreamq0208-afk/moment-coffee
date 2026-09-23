import test from 'node:test';
import assert from 'node:assert/strict';
import { buildBrewPrompt, extractBrewJson, validateBrewRequest,
  isValidBrewNote, isValidBaristaReply, sharesBrewWording, tidyBrewCopy } from '../shared/brew-copy.js';
import { fallbackBrewName, isValidBrewName, shareBrewName } from '../shared/brew-name.js';

test('纸上线稿文案请求按份数与加入顺序核对做法和豆子', () => {
  const request = { battery: 2, layers: [
    { emotion: 'tired', portions: 2 }, { emotion: 'regret', portions: 2 },
  ], method: 'dirty', bean: 'regret', strength: '浓一点', message: '加班到十点' };
  const input = validateBrewRequest(request);
  assert.equal(input?.method, 'dirty');
  assert.match(buildBrewPrompt(input), /疲惫 2 份、遗憾 2 份/);
  assert.equal(validateBrewRequest({ ...request, method: 'coldbrew' }), null);
  assert.equal(validateBrewRequest({ ...request, layers: [...request.layers, { emotion: 'happy', portions: 2 }] }), null);
});

test('留言截断并标记危机，模型输出只保留三段文案', () => {
  const input = validateBrewRequest({ battery: 3, layers: [{ emotion: 'sad', portions: 1 }],
    method: 'phin', bean: 'sad', strength: '标准', message: '不想活了' + '甲'.repeat(40) });
  assert.equal(input.crisis, true);
  assert.equal([...input.message].length, 30);
  assert.deepEqual(extractBrewJson('```json\n{"name":"夜里的滴滴壶","note":"先坐一会儿","barista":"我在这里听你说","extra":1}\n```', input),
    { name: '有人在听', note: '先坐一会儿', barista: '我在这里听你说' });
});

test('咖啡名最多五个汉字，超长、直白情绪词和旧记录分享都改用短名', () => {
  const input = validateBrewRequest({ battery: 3, layers: [{ emotion: 'tired', portions: 1 }],
    method: 'dirty', bean: 'tired', strength: '标准', message: '今天加班到十点' });
  assert.match(buildBrewPrompt(input), /2 到 5 个汉字/);
  assert.equal(isValidBrewName('把夜喝浅'), true);
  assert.equal(isValidBrewName('撑到下班的冰博克'), false);
  assert.equal(isValidBrewName('开心一整天'), false);
  assert.equal(isValidBrewName('微光7号'), false);
  assert.equal(fallbackBrewName('tired'), '把夜喝浅');
  assert.equal(shareBrewName('撑到下班的冰博克', 'tired'), '把夜喝浅');
  assert.deepEqual(extractBrewJson('{"name":"撑到下班的冰博克","note":"今天没白熬","barista":"坐下喝完再走"}', input),
    { name: '把夜喝浅', note: '今天没白熬', barista: '坐下喝完再走' });
});

test('咖啡名和咖啡师回复都明确结合电量、情绪和留言', () => {
  const input = validateBrewRequest({ battery: 2, layers: [{ emotion: 'tired', portions: 2 }],
    method: 'dirty', bean: 'tired', strength: '浓一点', message: '今天加班到十点' });
  const prompt = buildBrewPrompt(input);
  assert.match(prompt, /主情绪是 疲惫 2 份，其余为 没有/);
  assert.match(prompt, /留言提供真实事件，主情绪决定说话角度/);
  assert.match(prompt, /电量低就短而轻/);
  assert.match(prompt, /把主情绪和留言变成短诗题目/);
  assert.match(prompt, /今天加班到十点/);
  assert.match(prompt, /疲惫 2 份/);
  assert.match(prompt, /20 个汉字以内/);
  assert.match(prompt, /最多一个中文逗号/);
  assert.match(prompt, /不复述留言/);
  assert.match(prompt, /用“你”/);
  assert.match(prompt, /不讲产区或知识/);
});

test('两句话遵守长度、标点、禁用词及不撞词', () => {
  assert.equal(tidyBrewCopy('「热水绕过粉层，你把今天留成空白。」'), '热水绕过粉层，你把今天留成空白');
  assert.equal(isValidBaristaReply(tidyBrewCopy('「热水绕过粉层，你把今天留成空白。」')), true);
  assert.equal(isValidBrewNote(tidyBrewCopy('云替你翻页。')), true);
  assert.equal(isValidBaristaReply('热浓缩浮在冰奶上，你先醒这一口'), true);
  assert.equal(isValidBaristaReply('冷萃泡了一夜，今天的事你先搁着', '今天被老板骂了'), true);
  assert.equal(isValidBaristaReply('热浓缩浮在冰奶上，第一口醒神'), false);
  assert.equal(isValidBaristaReply('冰滴一滴滴落下，眼前的事也可以慢一点。'), false);
  assert.equal(isValidBaristaReply('冰滴一滴滴落下，眼前的事先放一放，肩膀也歇会儿'), false);
  assert.equal(isValidBaristaReply('冷萃泡了一夜，今天被老板骂了', '今天被老板骂了'), false);
  assert.equal(isValidBaristaReply('冷萃泡了一夜，别急着变好'), false);
  assert.equal(isValidBrewNote('撑到这会儿了'), true);
  assert.equal(isValidBrewNote('这杯不用喝完'), false);
  assert.equal(isValidBrewNote('先放着。'), false);
  assert.equal(isValidBrewNote('好想回家', '好想回家'), false);
  assert.equal(isValidBaristaReply('冷萃泡了一夜，被老板骂了先搁着', '今天被老板骂了'), false);
  assert.equal(sharesBrewWording('泡一夜就好了', '冷萃泡一夜'), true);
  assert.equal(sharesBrewWording('撑到这会儿了', '热浓缩浮在冰奶上，第一口醒神'), false);
});
