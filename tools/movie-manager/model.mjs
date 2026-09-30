import { randomUUID } from 'node:crypto';

export class Problem extends Error { constructor(message, status = 400) { super(message); this.status = status; } }
const object = v => v && typeof v === 'object' && !Array.isArray(v);
function text(v, max = 1000) { if (typeof v !== 'string' || v.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v)) throw new Problem('文本字段格式或长度不正确'); return v; }
function list(v) { if (!Array.isArray(v) || v.length > 100) throw new Problem('列表格式不正确'); return [...new Set(v.map(x => text(x, 200)))]; }
function number(v, max, integer = false) { if (v == null || v === '') return null; if (typeof v !== 'number' || !Number.isFinite(v) || v < 0 || v > max || (integer && !Number.isInteger(v))) throw new Problem('数字字段超出范围'); return v; }
function date(v) { if (v == null || v === '') return null; const parsed = new Date(v + 'T00:00:00Z'); if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== v) throw new Problem('日期格式不正确'); return v; }
export function imagePath(v, local = false) { if (v == null || v === '') return null; if (typeof v !== 'string' || !(local ? /^\/assets\/img\/movies\/[\w-]+\.(jpg|png|webp)$/ : /^\/[\w-]+\.(jpg|png)$/).test(v)) throw new Problem('海报路径不正确'); return v; }
export function blank() {
  return { id: randomUUID(), source: { provider: 'manual', tmdb_id: null, title: '', original_title: '', release_date: null, year: null, countries: [], genres: [], runtime_minutes: null, directors: [], cast: [], overview: '', rating: null, vote_count: null, url: null, fetched_at: null }, poster: { source_path: null, local_path: null }, overrides: {}, personal: { watched_on: null, rating: null, review: '', tags: [] } };
}
export function validate(input, { timestamps = true, requireTitle = true } = {}) {
  if (!object(input) || !object(input.source) || !object(input.personal) || !object(input.overrides) || !object(input.poster)) throw new Problem('电影记录结构不正确');
  if (!/^[\w-]{1,100}$/.test(input.id || '')) throw new Problem('记录 ID 不正确');
  const s = input.source, o = input.overrides, p = input.personal;
  if (!['manual', 'tmdb'].includes(s.provider)) throw new Problem('数据来源不正确');
  const tmdbId = number(s.tmdb_id, 2147483647, true);
  if (s.provider === 'tmdb' && !tmdbId || s.provider === 'manual' && tmdbId !== null) throw new Problem('TMDB ID 与数据来源不一致');
  const source = { provider: s.provider, tmdb_id: tmdbId };
  for (const key of ['title', 'original_title', 'overview']) source[key] = text(s[key], key === 'overview' ? 20000 : 500);
  for (const key of ['countries', 'genres', 'directors', 'cast']) source[key] = list(s[key]);
  source.release_date = date(s.release_date); source.year = number(s.year, 9999, true); source.runtime_minutes = number(s.runtime_minutes, 10000, true);
  source.rating = number(s.rating, 10); source.vote_count = number(s.vote_count, 1e10, true);
  if (s.provider === 'manual' && (source.rating !== null || source.vote_count !== null)) throw new Problem('手动记录不能填写 TMDB 评分');
  source.url = tmdbId ? `https://www.themoviedb.org/movie/${tmdbId}` : null;
  source.fetched_at = s.fetched_at == null ? null : iso(s.fetched_at);
  const overrides = {};
  for (const key of Object.keys(o)) {
    if (['title', 'original_title', 'overview'].includes(key)) overrides[key] = text(o[key], key === 'overview' ? 20000 : 500);
    else if (['countries', 'genres', 'directors', 'cast'].includes(key)) overrides[key] = list(o[key]);
    else if (key === 'year' || key === 'runtime_minutes') overrides[key] = number(o[key], key === 'year' ? 9999 : 10000, true);
    else if (key === 'poster_path' || key === 'poster_source_path') overrides[key] = imagePath(o[key], key === 'poster_path');
    else throw new Problem('不支持的修订字段');
  }
  if (requireTitle && !(overrides.title ?? source.title ?? source.original_title).trim()) throw new Problem('请填写电影片名');
  const rating = number(p.rating, 10); if (rating != null && !Number.isInteger(rating * 2)) throw new Problem('个人评分需使用 0.5 分步长');
  const result = { id: input.id, source, poster: { source_path: imagePath(input.poster.source_path), local_path: imagePath(input.poster.local_path, true) }, overrides, personal: { watched_on: date(p.watched_on), rating, review: text(p.review, 20000), tags: list(p.tags) } };
  if (timestamps) { result.created_at = iso(input.created_at); result.updated_at = iso(input.updated_at); }
  return result;
}
function iso(v) { if (typeof v !== 'string' || !Number.isFinite(Date.parse(v)) || new Date(v).toISOString() !== v) throw new Problem('时间字段格式不正确'); return v; }
export function documentData(data) {
  if (!object(data) || data.schema_version !== 1 || !Array.isArray(data.movies)) throw new Problem('数据文件格式不正确，原文件未修改');
  const movies = data.movies.map(m => validate(m));
  const ids = new Set(), sources = new Set();
  for (const m of movies) { if (ids.has(m.id) || m.source.tmdb_id && sources.has(m.source.tmdb_id)) throw new Problem('数据文件存在重复电影'); ids.add(m.id); if (m.source.tmdb_id) sources.add(m.source.tmdb_id); }
  return { schema_version: 1, movies };
}
export function fromTMDB(raw, now = new Date().toISOString()) {
  const record = blank();
  record.source = { provider: 'tmdb', tmdb_id: raw.id, title: raw.title || raw.original_title || '', original_title: raw.original_title || '', release_date: raw.release_date || null, year: raw.release_date ? Number(raw.release_date.slice(0, 4)) : null, countries: (raw.production_countries || []).map(x => x.name), genres: (raw.genres || []).map(x => x.name), runtime_minutes: raw.runtime || null, directors: (raw.credits?.crew || []).filter(x => x.job === 'Director').map(x => x.name), cast: (raw.credits?.cast || []).slice(0, 20).map(x => x.name), overview: raw.overview || '', rating: raw.vote_count > 0 ? raw.vote_average : null, vote_count: raw.vote_count ?? null, url: `https://www.themoviedb.org/movie/${raw.id}`, fetched_at: now };
  record.poster.source_path = raw.poster_path || null;
  return validate(record, { timestamps: false, requireTitle: false });
}
