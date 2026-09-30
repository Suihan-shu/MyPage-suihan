(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MovieData = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  function display(movie) { return { ...movie.source, ...movie.overrides }; }
  function refresh(movie, fresh) { return { ...movie, source: fresh.source, poster: { ...movie.poster, source_path: fresh.poster.source_path, local_path: movie.poster.source_path === fresh.poster.source_path ? movie.poster.local_path : null } }; }
  function poster(movie, base = '') {
    const local = movie.overrides?.poster_path || movie.poster?.local_path;
    if (/^\/assets\/img\/movies\/[a-zA-Z0-9_-]+\.(?:jpg|png|webp)$/.test(local || '')) return base + local;
    const remote = movie.overrides?.poster_source_path || movie.poster?.source_path;
    if (/^\/[a-zA-Z0-9_-]+\.(?:jpg|png)$/.test(remote || '')) return 'https://image.tmdb.org/t/p/w500' + remote;
    return base + '/assets/img/movies/placeholder.svg';
  }
  function select(movies, { query = '', genre = '', tag = '', sort = 'date' } = {}) {
    const q = query.trim().toLocaleLowerCase();
    return movies.filter(m => {
      const s = display(m);
      return (!q || [s.title, s.original_title, m.personal.review].join(' ').toLocaleLowerCase().includes(q)) &&
        (!genre || (s.genres || []).includes(genre)) && (!tag || m.personal.tags.includes(tag));
    }).sort((a, b) => {
      if (sort === 'rating') { const delta = (b.personal.rating ?? -1) - (a.personal.rating ?? -1); if (delta) return delta; }
      return (b.personal.watched_on || '').localeCompare(a.personal.watched_on || '') || b.created_at.localeCompare(a.created_at) || a.id.localeCompare(b.id);
    });
  }
  function card(movie, base = '', doc = document) {
    const s = display(movie), p = movie.personal;
    const el = (tag, text, cls) => { const n = doc.createElement(tag); if (text != null) n.textContent = text; if (cls) n.className = cls; return n; };
    const a = el('article', null, 'movie-card'), cover = el('div', null, 'movie-card__poster'), body = el('div', null, 'movie-card__body');
    const img = el('img'); img.src = poster(movie, base); img.alt = (s.title || s.original_title || '电影') + '海报'; img.width = 200; img.height = 300; img.loading = 'lazy';
    img.addEventListener('error', () => { img.src = base + '/assets/img/movies/placeholder.svg'; }, { once: true }); cover.append(img);
    body.append(el('h2', (s.title || s.original_title || '未命名电影') + (s.year ? `（${s.year}）` : '')));
    if (s.original_title) body.append(el('p', s.original_title, 'movie-muted'));
    const ratings = el('p', null, 'movie-ratings');
    if (movie.source.provider === 'tmdb') ratings.append(el('span', 'TMDB ' + (s.rating == null ? '暂无评分' : `${Number(s.rating).toFixed(1)} / 10`)));
    ratings.append(el('span', '我的评分 ' + (p.rating == null ? '未评分' : `${p.rating} / 10`)));
    if (p.rating != null) { const stars = el('span', '★★★★★', 'movie-stars'); stars.dataset.score = String(p.rating * 2); stars.append(el('span', '★★★★★', 'movie-stars__fill')); stars.setAttribute('aria-hidden', 'true'); ratings.append(stars); }
    body.append(ratings);
    const meta = [(s.countries || []).join(' / '), (s.genres || []).join(' / '), s.runtime_minutes ? `${s.runtime_minutes} 分钟` : ''].filter(Boolean).join(' · ');
    if (meta) body.append(el('p', meta));
    if (s.directors?.length) body.append(el('p', '导演：' + s.directors.join('、')));
    function details(summary, text) { const d = el('details'); d.append(el('summary', summary), el('p', text, 'movie-review')); body.append(d); }
    if (s.cast?.length) details('主演：' + s.cast.slice(0, 3).join('、'), s.cast.join('、'));
    const watched = el('p', p.watched_on ? '观影 ' + p.watched_on : '', 'movie-muted'); p.tags.forEach(t => watched.append(el('span', t, 'movie-tag'))); if (watched.childNodes.length) body.append(watched);
    if (p.review) body.append(el('p', p.review, 'movie-review'));
    if (s.overview) details('电影简介', s.overview);
    if (movie.source.tmdb_id) { const link = el('a', 'TMDB 资料 ↗', 'movie-source'); link.href = 'https://www.themoviedb.org/movie/' + movie.source.tmdb_id; link.target = '_blank'; link.rel = 'noopener noreferrer'; body.append(link); }
    a.append(cover, body); return a;
  }
  return { display, refresh, poster, select, card };
});
