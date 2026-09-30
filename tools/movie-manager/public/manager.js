(async function () {
  const $ = id => document.getElementById(id);
  let token, revision, movies = [], draft = null, dirty = false, pendingRefresh, busy = false;
  const displayKeys = ['title', 'original_title', 'year', 'countries', 'genres', 'runtime_minutes', 'directors', 'cast', 'overview'];
  const lists = ['countries', 'genres', 'directors', 'cast'];
  const labels = { title: '片名', original_title: '原名', year: '年份', countries: '国家/地区', genres: '类型', runtime_minutes: '片长', directors: '导演', cast: '主演', overview: '简介', rating: 'TMDB 评分', vote_count: '投票数', release_date: '上映日期', fetched_at: '资料获取时间' };
  function status(message, error = false) { $('status').textContent = message; $('status').classList.toggle('error', error); }
  async function api(route, data) { const response = await fetch('/api/' + route, { method: data === undefined ? 'GET' : 'POST', headers: { 'X-Movie-Token': token || '', ...(data === undefined ? {} : { 'Content-Type': 'application/json' }) }, ...(data === undefined ? {} : { body: JSON.stringify(data) }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); return result; }
  async function run(task) { if (busy) return; busy = true; const buttons = [...document.querySelectorAll('button')]; const state = buttons.map(b => b.disabled); buttons.forEach(b => { b.disabled = true; }); $('fields').disabled = true; try { await task(); } catch (e) { status(e.message, true); } finally { busy = false; $('fields').disabled = false; buttons.forEach((b, i) => { if (b.isConnected) b.disabled = state[i]; }); updateControls(); } }
  function el(tag, text, cls) { const n = document.createElement(tag); if (text != null) n.textContent = text; if (cls) n.className = cls; return n; }
  function split(v) { return v.split(/[,，、\n]/).map(s => s.trim()).filter(Boolean); }
  function fieldId(key) { return key === 'year' ? 'movie-year' : key; }
  function collect() {
    if (!draft) return;
    displayKeys.forEach(key => {
      const raw = $(fieldId(key)).value;
      const value = lists.includes(key) ? split(raw) : ['year', 'runtime_minutes'].includes(key) ? raw === '' ? null : Number(raw) : raw;
      if (draft.source.provider === 'manual') draft.source[key] = value;
      else if (Object.hasOwn(draft.overrides, key) || JSON.stringify(value) !== JSON.stringify(draft.source[key])) draft.overrides[key] = value;
    });
    draft.personal = { watched_on: $('watched_on').value || null, rating: $('rating').value === '' ? null : Number($('rating').value), review: $('review').value, tags: split($('tags').value) };
  }
  function preview() { collect(); $('preview').replaceChildren(MovieData.card(draft)); }
  function populate() {
    const s = MovieData.display(draft); displayKeys.forEach(key => { $(fieldId(key)).value = Array.isArray(s[key]) ? s[key].join('，') : s[key] ?? ''; });
    for (const key of ['watched_on', 'rating', 'review']) $(key).value = draft.personal[key] ?? '';
    $('tags').value = draft.personal.tags.join('，'); $('preview').replaceChildren(MovieData.card(draft)); updateControls();
  }
  function updateControls() { for (const id of ['refresh-source', 'posters']) $(id).disabled = !draft?.source.tmdb_id; }
  function discard() { return !dirty || confirm('当前表单尚未保存，确定放弃这些修改？'); }
  function open(record) { if (!discard()) return; draft = structuredClone(record); dirty = false; $('editor').hidden = false; $('editor-title').textContent = movies.some(m => m.id === draft.id) ? '编辑电影记录' : '添加电影记录'; $('poster-candidates').replaceChildren(); populate(); $('editor').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  async function backups() { const names = await api('backups'); $('backups').replaceChildren(...(names.length ? names.map(name => { const option = el('option', name); option.value = name; return option; }) : [el('option', '尚无备份')])); if (!names.length) $('backups').firstChild.value = ''; }
  function renderList() {
    const result = MovieData.select(movies, { query: $('list-query').value }); const content = [];
    content.push(el('p', `已记录 ${movies.length} 部，当前显示 ${result.length} 部`, 'muted'));
    result.forEach(m => { const row = el('div', null, 'record'), bar = el('div', null, 'row'); const info = el('div', null, 'grow'); info.append(el('strong', MovieData.display(m).title), el('p', `${m.personal.watched_on || '未填写观影日期'} · ${m.personal.rating == null ? '未评分' : m.personal.rating + ' / 10'}`, 'muted'));
      const edit = el('button', '编辑', 'secondary'); edit.type = 'button'; edit.addEventListener('click', () => open(m));
      const remove = el('button', '删除', 'danger'); remove.type = 'button'; remove.addEventListener('click', () => run(async () => { if (dirty && !discard()) return; if (!confirm(`删除《${MovieData.display(m).title}》？删除前将备份全部记录。`)) return; const result = await api('delete', { id: m.id, revision }); accept(result); if (draft?.id === m.id) close(); status('记录已删除，可在备份区恢复。本地已保存，待发布。'); await backups(); }));
      bar.append(info, edit, remove); row.append(bar); content.push(row);
    }); $('records').replaceChildren(...content);
  }
  function accept(result) { movies = result.data.movies; revision = result.revision; renderList(); }
  function close() { draft = null; dirty = false; $('editor').hidden = true; }
  async function load() { const result = await api('movies'); movies = result.movies; revision = result.revision; renderList(); await backups(); }
  $('movie-form').addEventListener('input', e => { if (e.target.id === 'poster-upload') return; dirty = true; preview(); });
  $('movie-form').addEventListener('submit', e => { e.preventDefault(); run(async () => { collect(); const result = await api('save', { movie: draft, revision, cache: $('cache').checked }); accept(result); draft = structuredClone(movies.find(m => m.id === draft.id)); dirty = false; populate(); status('本地已保存，待发布。电影数据和海报已更新到项目文件。'); await backups(); }); });
  $('search-form').addEventListener('submit', e => { e.preventDefault(); run(async () => { const results = await api('search?query=' + encodeURIComponent($('query').value) + '&year=' + encodeURIComponent($('year').value)); $('candidates').replaceChildren(...results.map(m => { const b = el('button', null, 'candidate'); b.type = 'button'; const image = el('img'); image.src = MovieData.poster({ poster: { source_path: m.poster_path } }); image.alt = m.title + '海报'; image.loading = 'lazy'; image.addEventListener('error', () => { image.src = '/assets/img/movies/placeholder.svg'; }, { once: true }); b.append(image, el('span', `${m.title}（${m.year || '年份未知'}）`), el('span', m.original_title)); b.addEventListener('click', () => run(() => choose(m.id))); return b; })); status(results.length ? '请选择正确的电影版本。' : '没有找到电影，可换用原名、年份、TMDB ID 或手动添加。'); }); });
  async function choose(id) { const existing = movies.find(m => m.source.tmdb_id === Number(id)); if (existing) { open(existing); status('这部电影已有记录，已打开原记录。'); return; } const record = await api('detail?id=' + encodeURIComponent(id)); open(record); status('已获取电影资料，请填写个人记录。'); }
  $('lookup').addEventListener('click', () => run(() => choose($('tmdb-id').value)));
  $('manual').addEventListener('click', () => run(async () => { open(await api('blank')); status('手动记录：可填写已有资料，缺失项留空。'); }));
  $('cancel').addEventListener('click', () => { if (discard()) close(); });
  $('reload').addEventListener('click', () => run(async () => { if (!discard()) return; await load(); close(); status('已重新读取本地记录。'); }));
  $('list-query').addEventListener('input', renderList);
  $('clear-overrides').addEventListener('click', () => { if (!confirm('清除人工修订并恢复源资料？个人评分、日期和短评会保留。')) return; collect(); draft.overrides = {}; dirty = true; populate(); });
  $('reset-poster').addEventListener('click', () => { delete draft.overrides.poster_path; delete draft.overrides.poster_source_path; draft.poster.local_path = null; dirty = true; preview(); });
  $('refresh-source').addEventListener('click', () => run(async () => {
    collect(); pendingRefresh = await api('detail?id=' + draft.source.tmdb_id); const changes = [];
    for (const key of Object.keys(pendingRefresh.source)) { if (JSON.stringify(draft.source[key]) !== JSON.stringify(pendingRefresh.source[key])) { const value = x => Array.isArray(x) ? x.join('、') : x ?? '无'; changes.push(el('p', `${labels[key] || key}\n原：${value(draft.source[key])}\n新：${value(pendingRefresh.source[key])}`, 'change')); } }
    if (draft.poster.source_path !== pendingRefresh.poster.source_path) changes.push(el('p', `源海报：${draft.poster.source_path || '无'} → ${pendingRefresh.poster.source_path || '无'}`, 'change'));
    $('refresh-changes').replaceChildren(...(changes.length ? changes : [el('p', '资料没有变化')])); $('refresh-dialog').showModal();
  }));
  $('dismiss-refresh').addEventListener('click', () => $('refresh-dialog').close());
  $('apply-refresh').addEventListener('click', () => { draft = MovieData.refresh(draft, pendingRefresh); dirty = true; populate(); $('refresh-dialog').close(); status('已采用更新预览，个人记录和修订已保留；点击保存完成写入。'); });
  $('posters').addEventListener('click', () => run(async () => { const images = await api('images?id=' + draft.source.tmdb_id); $('poster-candidates').replaceChildren(...images.map(p => { const b = el('button', null, 'candidate'); b.type = 'button'; const image = el('img'); image.src = 'https://image.tmdb.org/t/p/w185' + p.path; image.alt = '候选海报'; image.loading = 'lazy'; image.addEventListener('error', () => { image.src = '/assets/img/movies/placeholder.svg'; }, { once: true }); b.append(image, el('span', p.language)); b.addEventListener('click', () => { delete draft.overrides.poster_path; draft.overrides.poster_source_path = p.path; draft.poster.local_path = null; dirty = true; preview(); }); return b; })); status(images.length ? '点击海报进行更换，然后保存。' : '暂时没有其他海报，可上传图片。'); }));
  $('poster-upload').addEventListener('change', () => run(async () => { const file = $('poster-upload').files[0]; if (!file) return; if (file.size > 8 * 1024 * 1024) throw new Error('海报最大 8 MB'); const data = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result.split(',')[1]); reader.onerror = () => reject(new Error('图片读取失败')); reader.readAsDataURL(file); }); const result = await api('upload', { image: data }); draft.overrides.poster_path = result.path; dirty = true; preview(); status('海报已上传至本机，点击保存记录。'); $('poster-upload').value = ''; }));
  $('restore').addEventListener('click', () => run(async () => { const name = $('backups').value; if (!name || !discard() || !confirm('将整份电影列表恢复为选中备份？当前列表会先备份。')) return; accept(await api('restore', { name, revision })); close(); await backups(); status('已恢复备份，本地已保存，待发布。'); }));
  window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
  await run(async () => { const session = await api('session'); token = session.token; await load(); status(session.configured ? '本地工具已就绪。可搜索电影或手动添加。' : '尚未配置 TMDB 凭据。可先手动添加；配置 .env 并重启后可搜索和自动获取资料。'); });
})();
