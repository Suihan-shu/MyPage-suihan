const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('assets/js/github-cms.js', 'utf8');
function client(saved = null, fetch = async () => { throw new Error('Unexpected request'); }) {
  const context = vm.createContext({ window: {}, console, fetch, TextEncoder, TextDecoder, btoa, atob,
    localStorage: { getItem: () => saved, setItem() {}, removeItem() {} } });
  vm.runInContext(source, context);
  const cms = new context.window.GitHubCMS();
  cms.saveConfig({ token: 'test-token' });
  return cms;
}
const response = (status, body) => ({ status, ok: status < 400, statusText: '', json: async () => body });
for (const saved of ['null', '[]', '"text"', '{"owner":42,"branch":null}']) {
  test(`CMS recovers invalid stored settings: ${saved}`, () => {
    const cms = client(saved);
    assert.equal(cms.config.owner, 'suihan-shu');
    assert.equal(cms.config.branch, 'main');
    assert.equal(cms.isConfigured(), true);
  });
}
test('Chinese text, emoji and large UTF-8 content survive a Base64 round trip', () => {
  const cms = client();
  const value = ('中文 🏔️ "quotes"\n').repeat(15000);
  const encoded = cms.utf8ToBase64(value);
  assert.equal(encoded, Buffer.from(value).toString('base64'));
  assert.equal(cms.base64ToUtf8(encoded.match(/.{1,60}/g).join('\n')), value);
});
test('file paths and branch names remain intact as URL data', async () => {
  let url;
  const cms = client(null, async value => { url = new URL(value); return response(200, { sha: 'abc' }); });
  cms.config.branch = 'feature/a&b#c';
  await cms.getFile('/assets/中文 #?%.md');
  assert.equal(decodeURIComponent(url.pathname), '/repos/suihan-shu/MyPage-suihan/contents/assets/中文 #?%.md');
  assert.equal(url.searchParams.get('ref'), cms.config.branch);
  assert.equal(url.hash, '');
});
for (const status of [401, 403, 409, 422, 500]) {
  test(`a failed SHA lookup (${status}) never sends a write`, async () => {
    let calls = 0;
    const cms = client(null, async () => { calls++; return response(status, { message: 'Failed' }); });
    await assert.rejects(cms.putFile('_data/test.yml', 'text'), error => error.status === status);
    assert.equal(calls, 1);
  });
}
test('404 creates a new file and existing SHA updates keep branch and content', async () => {
  const calls = [];
  const cms = client(null, async (url, options) => {
    calls.push({ url, options });
    return options.method === 'PUT' ? response(200, { content: { sha: 'new' } }) : response(404, {});
  });
  await cms.putFile('测试 #.md', '新内容', 'Create');
  const payload = JSON.parse(calls[1].options.body);
  assert.equal('sha' in payload, false);
  assert.equal(Buffer.from(payload.content, 'base64').toString(), '新内容');
  await cms.putFile('测试 #.md', '更新', 'Update', 'old-sha');
  assert.equal(calls.length, 3);
  assert.equal(JSON.parse(calls[2].options.body).sha, 'old-sha');
});
test('authentication starts both independent requests before either finishes', async () => {
  const pending = [];
  const cms = client(null, url => new Promise(resolve => pending.push({ url, resolve })));
  const auth = cms.verifyAuth();
  assert.equal(pending.length, 2);
  pending[0].resolve(response(200, { login: 'tester' }));
  pending[1].resolve(response(200, { full_name: 'tester/site', permissions: { push: true } }));
  const result = await auth;
  assert.equal(result.user.login, 'tester');
  assert.equal(result.repo.full_name, 'tester/site');
});
const yamlContext = vm.createContext({ window: {} });
vm.runInContext(fs.readFileSync('assets/js/lib/js-yaml.min.js', 'utf8'), yamlContext);
yamlContext.window.jsyaml = yamlContext.jsyaml;
vm.runInContext(fs.readFileSync('assets/js/cms-data.js', 'utf8'), yamlContext);
const data = yamlContext.window.CMSData;
test('travel YAML preserves date strings, multiline text, localized fields and photo objects', () => {
  const value = data.parseTravel(`password: 'it''s secret'
custom: keep
entries:
  - date: 2026-09-05
    location: {zh: 西安}
    text: |-
      第一行
      第二行
    photos:
      - file: /assets/旅行.jpg
        caption: 'A "quoted" caption'
  - id: trip-1
    destination: 成都
    date_range: 2026-09-01
    summary: "换行\n继续"
    tags: [山, 水]
    photos: [{url: /assets/photo.jpg}]
`);
  assert.equal(value.entries[0].date, '2026-09-05');
  assert.equal(value.entries[0].text, '第一行\n第二行');
  assert.equal(value.password, "it's secret");
  assert.deepEqual(data.parseTravel(data.dump(value)), value);
});
test('invalid travel YAML does not silently discard the document', () => {
  for (const value of ['[]', 'null', 'entries: invalid', 'entries: [']) {
    assert.throws(() => data.parseTravel(value));
  }
});
test('resume YAML parser accepts literal blocks, arrays and escaped quotes', () => {
  const source = `cv:
  summary: |-
    line 1
    line 2
  sections:
    技能: [{name: 'A "quote"'}]
`;
  const value = data.parse(source);
  assert.equal(value.cv.summary, 'line 1\nline 2');
  assert.equal(value.cv.sections['技能'][0].name, 'A "quote"');
});
test('HTML escaping preserves values without introducing markup', () => {
  assert.equal(data.escapeHtml('<img title="A&B">'), '&lt;img title=&quot;A&amp;B&quot;&gt;');
});
