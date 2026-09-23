import test from 'node:test';
import assert from 'node:assert/strict';
import { buildBrewPrompt, extractBrewJson, validateBrewRequest } from '../shared/brew-copy.js';

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
  assert.deepEqual(extractBrewJson('```json\n{"name":"夜里的滴滴壶","note":"先坐一会儿","barista":"我在这里听你说","extra":1}\n```'),
    { name: '夜里的滴滴壶', note: '先坐一会儿', barista: '我在这里听你说' });
});
