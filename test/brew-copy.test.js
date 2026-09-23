import test from 'node:test';
import assert from 'node:assert/strict';
import { buildBrewPrompt, extractBrewJson, validateBrewRequest } from '../shared/brew-copy.js';
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
  const name = prompt.split('name（咖啡名）：')[1].split('barista（')[0];
  const barista = prompt.split('barista（')[1];
  for (const section of [name, barista]) {
    assert.match(section, /电量/);
    assert.match(section, /情绪/);
    assert.match(section, /留言/);
  }
  assert.match(prompt, /今天加班到十点/);
  assert.match(prompt, /疲惫 2 份/);
  assert.match(barista, /做法、豆子和风味/);
  assert.match(barista, /不要逐字引用、近义改写留言/);
  assert.match(barista, /只取实际这杯的细节/);
  assert.match(prompt.split('note（分享卡上的短句）：')[1].split('name（')[0], /不要复述留言/);
});
