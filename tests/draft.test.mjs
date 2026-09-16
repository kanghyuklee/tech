import { test } from 'node:test';
import assert from 'node:assert/strict';
import { koreaDate, extractArticle } from '../scripts/draft.mjs';
import { main } from '../scripts/draft.mjs';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('Korean midnight determines the draft day', () => {
  assert.equal(koreaDate(new Date('2026-09-15T14:59:59Z')), '2026-09-15');
  assert.equal(koreaDate(new Date('2026-09-15T15:00:00Z')), '2026-09-16');
});

test('turns web citation annotations into usable Markdown links', () => {
  const prefix = '# 조사한 제목\n\n' + '공식 자료로 확인합니다. '.repeat(70);
  const article = extractArticle({ status: 'completed', output: [{ content: [{
    type: 'output_text', text: prefix + 'SOURCE',
    annotations: [{ type: 'url_citation', start_index: prefix.length, end_index: prefix.length + 6, title: '공식 문서', url: 'https://example.com/docs' }]
  }] }] });
  assert.ok(article.body.endsWith('[공식 문서](https://example.com/docs)'));
});

test('writes researched custom drafts at 09:00 KST without overwriting or another API call', async () => {
  const cwd = process.cwd();
  const root = await mkdtemp(join(tmpdir(), 'blog-draft-'));
  const originalFetch = globalThis.fetch;
  const keys = ['OPENAI_API_KEY', 'DRAFT_TOPIC', 'DRAFT_ID'];
  const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  let calls = 0;
  try {
    process.chdir(root);
    await writeFile('blog.config.json', JSON.stringify({ model: 'test', topics: ['QA'], language: '한국어', audience: '개발자' }));
    process.env.OPENAI_API_KEY = 'test-placeholder';
    process.env.DRAFT_TOPIC = 'Playwright flaky tests';
    process.env.DRAFT_ID = 'custom-test';
    globalThis.fetch = async (_url, options) => {
      calls++;
      const request = JSON.parse(options.body);
      assert.equal(request.tools[0].type, 'web_search');
      assert.equal(request.tool_choice, 'required');
      assert.ok(request.input.includes('Playwright flaky tests'));
      return { ok: true, json: async () => ({ status: 'completed', output: [
        { type: 'web_search_call', status: 'completed' },
        { content: [{ type: 'output_text', text: '# 검토할 글\n\n' + '테스트 사례를 설명합니다. '.repeat(80) }] }
      ] }) };
    };
    await main();
    const draft = await readFile(`_posts/${koreaDate()}-custom-test.md`, 'utf8');
    assert.match(draft, /09:00:00 \+0900/);
    await main();
    assert.equal(calls, 1);
  } finally {
    process.chdir(cwd);
    globalThis.fetch = originalFetch;
    for (const key of keys) { if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key]; }
    await rm(root, { recursive: true });
  }
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
