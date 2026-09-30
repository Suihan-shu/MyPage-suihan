import http from 'node:http';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { Store } from './store.mjs';
import { Problem, blank, imagePath, validate } from './model.mjs';
import { tmdbClient } from './tmdb.mjs';
import { cacheImage, saveImage } from './images.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../..');
export async function createManager({ root = repo, port = 4317, token, key, client, cache = cacheImage, upload = saveImage } = {}) {
  const store = new Store(root); await store.read(); const tmdb = client || tmdbClient({ token, key });
  const session = randomBytes(32).toString('hex'); let origin;
  function authorized(req) { const value = req.headers['x-movie-token'] || ''; return typeof value === 'string' && value.length === session.length && timingSafeEqual(Buffer.from(value), Buffer.from(session)); }
  function json(res, status, value) { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(value)); }
  async function body(req) { let size = 0; const chunks = []; for await (const chunk of req) { size += chunk.length; if (size > 12 * 1024 * 1024) throw new Problem('请求体积过大', 413); chunks.push(chunk); } try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new Problem('JSON 格式不正确'); } }
  const assets = { '/movie-manager.js': [path.join(repo, 'assets/js/movie-manager.js'), 'text/javascript'], '/movie-manager.css': [path.join(repo, 'assets/css/movie-manager.css'), 'text/css'], '/': [path.join(here, 'public/index.html'), 'text/html'], '/manager.js': [path.join(here, 'public/manager.js'), 'text/javascript'], '/manager.css': [path.join(here, 'public/manager.css'), 'text/css'], '/movie-data.js': [path.join(repo, 'assets/js/movie-data.js'), 'text/javascript'], '/movies.css': [path.join(repo, 'assets/css/movies.css'), 'text/css'], '/assets/img/movies/placeholder.svg': [path.join(repo, 'assets/img/movies/placeholder.svg'), 'image/svg+xml'], '/assets/img/movies/tmdb.svg': [path.join(repo, 'assets/img/movies/tmdb.svg'), 'image/svg+xml'] };
  const server = http.createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store'); res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob: https://image.tmdb.org; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    try {
      if (req.headers.host !== new URL(origin).host || req.headers.origin && req.headers.origin !== origin || req.headers['sec-fetch-site'] && !['same-origin', 'none'].includes(req.headers['sec-fetch-site'])) throw new Problem('请求来源不正确', 403);
      const url = new URL(req.url, origin), route = url.pathname;
      if (route === '/api/session' && req.method === 'GET') return json(res, 200, { token: session, configured: tmdb.configured, port: server.address().port });
      if (route.startsWith('/api/')) {
        if (!authorized(req)) throw new Problem('访问令牌失效，请刷新管理页面', 403);
        if (req.method !== 'GET' && req.headers.origin !== origin) throw new Problem('写入请求来源不正确', 403);
        if (req.method === 'GET') {
          if (route === '/api/movies') { const { data, revision } = await store.read(); return json(res, 200, { ...data, revision }); }
          if (route === '/api/blank') return json(res, 200, blank());
          if (route === '/api/search') return json(res, 200, await tmdb.search(url.searchParams.get('query'), url.searchParams.get('year')));
          if (route === '/api/detail') return json(res, 200, await tmdb.detail(url.searchParams.get('id')));
          if (route === '/api/images') return json(res, 200, await tmdb.images(url.searchParams.get('id')));
          if (route === '/api/backups') return json(res, 200, await store.listBackups());
        }
        if (req.method === 'POST') {
          if (!req.headers['content-type']?.startsWith('application/json')) throw new Problem('需要 JSON 请求', 415);
          const data = await body(req);
          if (route === '/api/save') {
            const movie = validate(data.movie, { timestamps: false }); const previous = (await store.read()).data.movies.find(m => m.id === movie.id);
            const selected = movie.overrides.poster_source_path || movie.poster.source_path;
            const previousSelected = previous?.overrides.poster_source_path || previous?.poster.source_path;
            if (selected !== previousSelected) movie.poster.local_path = null;
            if (movie.overrides.poster_path) { await fs.access(path.join(root, movie.overrides.poster_path.slice(1))); }
            if (movie.poster.local_path) { await fs.access(path.join(root, movie.poster.local_path.slice(1))); }
            if (data.cache && selected && !movie.overrides.poster_path && !movie.poster.local_path) movie.poster.local_path = await cache(root, selected);
            return json(res, 200, await store.save(data.revision, movie));
          }
          if (route === '/api/delete') return json(res, 200, await store.delete(data.revision, data.id));
          if (route === '/api/restore') return json(res, 200, await store.restore(data.revision, data.name));
          if (route === '/api/upload') { if (typeof data.image !== 'string' || !/^[a-zA-Z0-9+/]+={0,2}$/.test(data.image)) throw new Problem('图片内容不正确'); return json(res, 200, { path: await upload(root, Buffer.from(data.image, 'base64')) }); }
        }
        throw new Problem('接口不存在', 404);
      }
      if (req.method !== 'GET') throw new Problem('请求方式不正确', 405);
      let asset = assets[route];
      if (!asset && /^\/assets\/img\/movies\/[\w-]+\.(jpg|png|webp)$/.test(route)) { imagePath(route, true); asset = [path.join(root, route.slice(1)), { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }[route.split('.').pop()]]; }
      if (!asset) throw new Problem('页面不存在', 404);
      let content = await fs.readFile(asset[0]); if (route === '/') content = content.toString('utf8').replace('<!-- movie-manager -->', await fs.readFile(path.join(repo, '_includes/movie-manager.html'), 'utf8')); res.writeHead(200, { 'Content-Type': asset[1] + (asset[1].startsWith('text/') ? '; charset=utf-8' : '') }); res.end(content);
    } catch (error) { if (!res.headersSent) json(res, error.status || 500, { error: error instanceof Problem ? error.message : '操作失败，原数据保留；请检查文件权限、配置或浏览器环境后重试' }); else res.end(); }
  });
  server.requestTimeout = 30000;
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  origin = `http://127.0.0.1:${server.address().port}`;
  return { server, origin, store };
}

async function main() {
  const config = {};
  try { for (const line of (await fs.readFile(path.join(here, '.env'), 'utf8')).split(/\r?\n/)) { const match = line.match(/^\s*(TMDB_READ_ACCESS_TOKEN|TMDB_API_KEY|MOVIE_MANAGER_PORT)\s*=\s*(.*?)\s*$/); if (match) config[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2'); } } catch (e) { if (e.code !== 'ENOENT') throw e; }
  const lock = path.join(here, '.lock');
  try { const pid = Number(await fs.readFile(lock, 'utf8')); if (!Number.isInteger(pid) || pid < 1) throw new Error('管理工具锁文件异常，请检查 .lock'); try { process.kill(pid, 0); throw new Error('电影管理工具已在运行'); } catch (e) { if (e.code !== 'ESRCH') throw e; } await fs.unlink(lock); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  await fs.writeFile(lock, String(process.pid), { flag: 'wx' });
  let manager;
  try {
    const port = Number(process.env.MOVIE_MANAGER_PORT || config.MOVIE_MANAGER_PORT || 4317); if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('管理工具端口必须在 1024–65535 之间');
    manager = await createManager({ port, token: process.env.TMDB_READ_ACCESS_TOKEN || config.TMDB_READ_ACCESS_TOKEN, key: process.env.TMDB_API_KEY || config.TMDB_API_KEY });
    console.log(`电影管理工具：${manager.origin}\n本地保存后，请沿用原有流程发布网站。按 Ctrl+C 关闭。`);
    const close = async () => { manager.server.close(); await fs.rm(lock, { force: true }); process.exit(0); }; process.on('SIGINT', close); process.on('SIGTERM', close);
  } catch (e) { await fs.rm(lock, { force: true }); throw e; }
}
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) main().catch(e => { console.error(e instanceof Problem ? e.message : '启动失败：请检查端口是否占用、数据文件是否有效，以及是否已有工具进程运行。'); process.exitCode = 1; });
