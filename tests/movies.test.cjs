const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { pathToFileURL } = require('node:url');
const data = require('../assets/js/movie-data.js');
const modules = Promise.all(['model', 'store', 'server', 'tmdb'].map(m => import(pathToFileURL(path.resolve(`tools/movie-manager/${m}.mjs`)))));
async function isolated(fn) { const root = await fs.mkdtemp(path.join(os.tmpdir(), 'movie-tests-')); try { await fs.mkdir(path.join(root, '_data')); await fs.writeFile(path.join(root, '_data/movies.json'), '{"schema_version":1,"movies":[]}\n'); await fn(root); } finally { await fs.rm(root, { recursive: true, force: true }); } }
test('电影校验：空评分、真实零分、日期、字段白名单与路径限制', async () => {
  const [{ blank, validate, imagePath }] = await modules; const m = blank(); m.source.title = '测试';
  assert.equal(validate(m, { timestamps: false }).personal.rating, null);
  m.personal.rating = 0; assert.equal(validate(m, { timestamps: false }).personal.rating, 0);
  m.personal.rating = 7.2; assert.throws(() => validate(m, { timestamps: false }), /步长/); m.personal.rating = 8;
  m.personal.watched_on = '2026-02-30'; assert.throws(() => validate(m, { timestamps: false }), /日期/); m.personal.watched_on = '2026-09-30';
  m.source.API_KEY = 'should-not-serialize'; assert.equal(validate(m, { timestamps: false }).source.API_KEY, undefined);
  assert.throws(() => imagePath('/../../key.jpg')); assert.throws(() => imagePath('https://example.com/poster.jpg'));
  m.overrides.secret = 'x'; assert.throws(() => validate(m, { timestamps: false }), /修订字段/);
});
test('刷新源资料保留 ID、个人记录与人工修订', async () => {
  const [{ blank, fromTMDB }] = await modules;
  const m = blank(); m.overrides = { title: '人工片名', overview: '' }; m.personal = { watched_on: '2026-09-30', rating: 0, review: '短评', tags: ['重看'] };
  const fresh = fromTMDB({ id: 42, title: '新片名', original_title: 'Original', release_date: '2000-01-01', vote_count: 2, vote_average: 8.3, credits: { crew: [{ job: 'Director', name: '导演' }], cast: [] } });
  const next = data.refresh(m, fresh); assert.equal(next.id, m.id); assert.deepEqual(next.personal, m.personal); assert.deepEqual(next.overrides, m.overrides); assert.equal(next.source.title, '新片名'); assert.equal(data.display(next).title, '人工片名'); assert.equal(data.display(next).overview, '');
});
test('保存、重复 ID、冲突、删除与备份恢复', async () => isolated(async root => {
  const [{ blank, fromTMDB }, { Store }] = await modules; const store = new Store(root); let state = await store.read();
  const m = fromTMDB({ id: 42, title: '测试电影' }); m.personal.watched_on = '2026-09-30'; m.personal.review = '保留短评';
  state = await store.save(state.revision, m); const first = state.backup; assert.equal(state.data.movies[0].personal.watched_on, '2026-09-30');
  const other = structuredClone(m); other.id = blank().id; await assert.rejects(store.save(state.revision, other), /已经存在/);
  await assert.rejects(store.save('stale', m), /另一处/);
  state = await store.delete(state.revision, m.id); const deletionBackup = state.backup; assert.equal(state.data.movies.length, 0);
  state = await store.restore(state.revision, deletionBackup); assert.equal(state.data.movies[0].personal.review, '保留短评');
  await assert.rejects(store.restore(state.revision, '../secret.json'), /文件名/); assert.ok((await store.listBackups()).includes(first));
}));
test('写入替换失败保留原 JSON，并允许后续保存', async () => isolated(async root => {
  const [{ blank }, { Store }] = await modules; const io = { ...fs, rename: async () => { throw new Error('injected rename failure'); } }; const store = new Store(root, io), previous = await store.read(); const m = blank(); m.source.title = '测试';
  await assert.rejects(store.save(previous.revision, m), /injected/); assert.equal((await store.read()).raw, previous.raw); assert.ok((await store.listBackups()).length > 0);
  assert.equal((await fs.readdir(path.join(root, '_data'))).filter(n => n.endsWith('.tmp')).length, 0);
  io.rename = fs.rename; await store.save(previous.revision, m); assert.equal((await store.read()).data.movies.length, 1);
}));
test('并发写入冲突不会丢失记录', async () => isolated(async root => {
  const [{ blank }, { Store }] = await modules; const store = new Store(root), state = await store.read(); const a = blank(), b = blank(); a.source.title = 'A'; b.source.title = 'B';
  const results = await Promise.allSettled([store.save(state.revision, a), store.save(state.revision, b)]); assert.equal(results.filter(r => r.status === 'fulfilled').length, 1); assert.equal((await store.read()).data.movies.length, 1);
}));
test('搜索筛选：修订片名、短评、空日期、同日创建时间与零分排序', () => {
  const m = (id, date, created, rating, title) => ({ id, source: { title, genres: ['剧情'] }, overrides: {}, personal: { watched_on: date, rating, review: '值得重看', tags: ['收藏'] }, created_at: created });
  const movies = [m('a', null, '2026-09-30', null, 'A'), m('b', '2026-09-29', '2026-09-28', 0, 'B'), m('c', '2026-09-29', '2026-09-30', 8, 'C')];
  assert.deepEqual(data.select(movies).map(m => m.id), ['c', 'b', 'a']); assert.deepEqual(data.select(movies, { sort: 'rating' }).map(m => m.id), ['c', 'b', 'a']);
  movies[0].overrides.title = '修订'; assert.equal(data.select(movies, { query: '修订', tag: '收藏', genre: '剧情' }).length, 1); assert.equal(data.select(movies, { query: '重看' }).length, 3);
});
test('本机 API：来源和令牌、手动 CRUD、只读搜索、缓存失败与固定路径', async () => isolated(async root => {
  const [{ blank }, , { createManager }] = await modules;
  const manager = await createManager({ root, port: 0, cache: async () => { throw new Error('fixture image failure'); } });
  try {
    const session = await fetch(manager.origin + '/api/session').then(r => r.json()); const headers = { Origin: manager.origin, 'Content-Type': 'application/json', 'X-Movie-Token': session.token };
    assert.equal((await fetch(manager.origin + '/api/movies')).status, 403);
    assert.equal((await fetch(manager.origin + '/api/session', { headers: { Origin: 'https://example.com' } })).status, 403);
    const badHost = await new Promise((resolve, reject) => { http.get(manager.origin + '/api/session', { headers: { Host: 'evil.example' } }, res => { res.resume(); resolve(res.statusCode); }).on('error', reject); }); assert.equal(badHost, 403);
    assert.equal((await fetch(manager.origin + '/api/search?query=test', { headers })).status, 503);
    const state = await fetch(manager.origin + '/api/movies', { headers }).then(r => r.json()); const movie = blank(); movie.source.title = '<img src=x onerror=alert(1)>';
    assert.equal((await fetch(manager.origin + '/api/save', { method: 'POST', headers: { ...headers, Origin: 'https://example.com' }, body: JSON.stringify({ movie, revision: state.revision }) })).status, 403);
    const result = await fetch(manager.origin + '/api/save', { method: 'POST', headers, body: JSON.stringify({ movie, revision: state.revision }) }).then(r => r.json()); assert.equal(result.data.movies.length, 1);
    movie.poster.source_path = '/test.jpg'; const failed = await fetch(manager.origin + '/api/save', { method: 'POST', headers, body: JSON.stringify({ movie, revision: result.revision, cache: true }) }); assert.equal(failed.status, 500); assert.equal((await manager.store.read()).revision, result.revision);
    assert.equal((await fetch(manager.origin + '/api/restore', { method: 'POST', headers, body: JSON.stringify({ revision: result.revision, name: '../x.json' }) })).status, 400);
    assert.equal((await fetch(manager.origin + '/tools/movie-manager/.env')).status, 404);
  } finally { await new Promise(resolve => manager.server.close(resolve)); }
}));
test('TMDB 请求优先中文、显示多个候选及图片语言回退，不暴露凭据', async () => {
  const [, , , { tmdbClient }] = await modules; const calls = [];
  const client = tmdbClient({ token: 'fixture-token', fetcher: async (url, options) => { calls.push({ url, options }); return { ok: true, json: async () => url.pathname.endsWith('search/movie') ? { results: [{ id: 1, title: '版本一', release_date: '2000-01-01' }, { id: 2, title: '版本二', release_date: '2020-01-01' }] } : url.pathname.endsWith('/images') ? { posters: [{ file_path: '/poster.jpg', iso_639_1: null }] } : { id: 1, original_language: 'fr', title: '测试' } }; } });
  assert.equal((await client.search('测试', '2000')).length, 2); assert.equal(calls[0].url.searchParams.get('language'), 'zh-CN'); assert.equal(calls[0].url.searchParams.get('year'), '2000');
  await client.images(1); assert.equal(calls.at(-1).url.searchParams.get('include_image_language'), 'zh,fr,en,null'); assert.equal(calls[0].options.headers.Authorization, 'Bearer fixture-token');
});
