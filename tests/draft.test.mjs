import { test } from 'node:test';
import assert from 'node:assert/strict';
import { koreaDate, extractArticle } from '../scripts/draft.mjs';

test('Korean midnight determines the draft day', () => {
  assert.equal(koreaDate(new Date('2026-09-15T14:59:59Z')), '2026-09-15');
  assert.equal(koreaDate(new Date('2026-09-15T15:00:00Z')), '2026-09-16');
});
test('accepts complete text and rejects truncated or unsafe article content', () => {
  const result = text => ({ status: 'completed', output: [{ type: 'reasoning' }, { content: [{ type: 'output_text', text }] }] });
  const body = '개발 기본기를 설명합니다. '.repeat(80);
  assert.equal(extractArticle(result(`# 제목\n\n${body}`)).title, '제목');
  assert.throws(() => extractArticle({ ...result(`# 제목\n${body}`), status: 'incomplete' }));
  assert.throws(() => extractArticle(result('# 제목\n짧음')));
  assert.throws(() => extractArticle(result(`# 제목\n${body}<script>alert(1)</script>`)));
  assert.throws(() => extractArticle(result(`# 제목\n${body}{{ site.title }}`)));
});
