(async function () {
  const journal = document.querySelector('[data-movie-journal]'); if (!journal) return;
  const base = journal.dataset.base || '';
  document.querySelectorAll('[data-movie-poster]').forEach(img => img.addEventListener('error', () => { img.src = base + '/assets/img/movies/placeholder.svg'; }, { once: true }));
  try {
    const response = await fetch(journal.dataset.url); if (!response.ok) throw new Error();
    const { movies } = await response.json();
    for (const [id, values] of [['movie-genre', movies.flatMap(m => MovieData.display(m).genres || [])], ['movie-tag', movies.flatMap(m => m.personal.tags)]]) {
      [...new Set(values)].sort().forEach(value => { const o = document.createElement('option'); o.value = value; o.textContent = value; document.getElementById(id).append(o); });
    }
    function render() {
      const selected = MovieData.select(movies, { query: document.getElementById('movie-search').value, genre: document.getElementById('movie-genre').value, tag: document.getElementById('movie-tag').value, sort: document.getElementById('movie-sort').value });
      document.getElementById('movie-list').replaceChildren(...selected.map(m => MovieData.card(m, base)));
      document.getElementById('movie-count').textContent = `已记录 ${movies.length} 部电影，当前显示 ${selected.length} 部`;
      const empty = document.getElementById('movie-empty'); empty.hidden = selected.length > 0; empty.textContent = movies.length ? '没有匹配的电影，试试其他关键词或筛选条件。' : '还没有电影记录，期待下一场与电影的相遇。';
    }
    journal.querySelector('.movie-toolbar').addEventListener('input', render); render();
  } catch { document.getElementById('movie-count').textContent += ' · 筛选暂不可用，请刷新重试。'; }
})();
