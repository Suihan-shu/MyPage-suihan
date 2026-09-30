import * as fs from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { documentData, validate, Problem } from './model.mjs';

const hash = text => createHash('sha256').update(text).digest('hex');
export class Store {
  constructor(root, io = fs) { this.root = root; this.io = io; this.file = path.join(root, '_data/movies.json'); this.backups = path.join(root, 'tools/movie-manager/backups'); this.queue = Promise.resolve(); }
  async read() { const raw = await this.io.readFile(this.file, 'utf8'); return { data: documentData(JSON.parse(raw)), revision: hash(raw), raw }; }
  write(revision, change) {
    const operation = this.queue.then(async () => {
      const current = await this.read(); if (revision !== current.revision) throw new Problem('记录已被另一处修改，请重新读取后保存；当前表单仍保留', 409);
      const changed = documentData(await change(structuredClone(current.data)));
      const serialized = JSON.stringify(changed, null, 2) + '\n';
      await this.io.mkdir(this.backups, { recursive: true });
      const filename = new Date().toISOString().replace(/[:.]/g, '-') + '-' + randomUUID() + '.json';
      await this.io.writeFile(path.join(this.backups, filename), current.raw, { flag: 'wx' });
      const temp = path.join(path.dirname(this.file), '.movies-' + randomUUID() + '.tmp');
      try {
        const handle = await this.io.open(temp, 'wx');
        try { await handle.writeFile(serialized); await handle.sync(); } finally { await handle.close(); }
        if ((await this.read()).revision !== revision) throw new Problem('文件在保存期间被修改，请重新读取', 409);
        await this.io.rename(temp, this.file);
      } finally { await this.io.rm(temp, { force: true }).catch(() => {}); }
      return { data: changed, revision: hash(serialized), backup: filename };
    }); this.queue = operation.catch(() => {}); return operation;
  }
  save(revision, input) {
    return this.write(revision, data => {
      const now = new Date().toISOString(); const old = data.movies.find(m => m.id === input.id);
      const movie = validate({ ...input, created_at: old?.created_at || now, updated_at: now });
      const duplicate = data.movies.find(m => m.id !== movie.id && movie.source.tmdb_id && m.source.tmdb_id === movie.source.tmdb_id);
      if (duplicate) throw new Problem('该电影已经存在，请打开原记录编辑', 409);
      const index = data.movies.findIndex(m => m.id === movie.id); if (index < 0) data.movies.push(movie); else data.movies[index] = movie;
      return data;
    });
  }
  delete(revision, id) { return this.write(revision, data => { if (!data.movies.some(m => m.id === id)) throw new Problem('记录不存在', 404); data.movies = data.movies.filter(m => m.id !== id); return data; }); }
  async listBackups() { const names = await this.io.readdir(this.backups).catch(e => { if (e.code === 'ENOENT') return []; throw e; }); return names.filter(n => /^[\w.-]+\.json$/.test(n)).sort().reverse(); }
  async restore(revision, name) { if (!/^[\w.-]+\.json$/.test(name)) throw new Problem('备份文件名不正确'); const backup = documentData(JSON.parse(await this.io.readFile(path.join(this.backups, name), 'utf8'))); return this.write(revision, () => backup); }
}
