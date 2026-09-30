(function (root, factory) {
  if (typeof module === "object" && module.exports)
    module.exports = factory(require("./movie-model.js"));
  else root.MovieTMDB = factory(root.MovieModel);
})(globalThis, function ({ Problem, fromTMDB, imagePath }) {
  function tmdbClient({ token, key, fetcher = fetch } = {}) {
    async function get(endpoint, params = {}) {
      if (!token && !key)
        throw new Problem(
          "尚未连接 TMDB，请在电影资料连接区配置令牌，或配置本地工具 .env 后重启；仍可手动添加",
          503,
        );
      const url = new URL("https://api.themoviedb.org/3/" + endpoint);
      url.search = new URLSearchParams({
        language: "zh-CN",
        ...params,
        ...(token ? {} : { api_key: key }),
      });
      let response;
      try {
        response = await fetcher(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: AbortSignal.timeout(15000),
          redirect: "error",
        });
      } catch {
        throw new Problem("TMDB 网络连接失败，请重试；表单仍保留", 502);
      }
      if (!response.ok)
        throw new Problem(
          response.status === 401
            ? "TMDB 凭据无效，请检查读取令牌"
            : response.status === 429
              ? "TMDB 请求过于频繁，请稍后重试"
              : "TMDB 暂时无法获取资料，请重试",
          502,
        );
      try {
        return await response.json();
      } catch {
        throw new Problem("TMDB 返回的数据无法读取", 502);
      }
    }
    const id = (value) => {
      if (!/^[1-9]\d{0,9}$/.test(String(value)) || Number(value) > 2147483647)
        throw new Problem("请输入正确的 TMDB ID");
      return Number(value);
    };
    return {
      configured: Boolean(token || key),
      check: () => get("configuration"),
      async search(query, year) {
        if (!query?.trim() || query.length > 200)
          throw new Problem("请输入片名，最多 200 字");
        if (year && !/^\d{4}$/.test(year))
          throw new Problem("上映年份应为四位数字");
        const result = await get("search/movie", {
          query,
          include_adult: "false",
          ...(year ? { year } : {}),
        });
        return (result.results || [])
          .slice(0, 20)
          .map((m) => ({
            id: m.id,
            title: m.title || m.original_title,
            original_title: m.original_title,
            year: m.release_date?.slice(0, 4) || null,
            poster_path: m.poster_path || null,
          }));
      },
      async detail(value) {
        const raw = await get(`movie/${id(value)}`, {
          append_to_response: "credits",
        });
        return fromTMDB(raw);
      },
      async images(value) {
        const movieId = id(value);
        const raw = await get(`movie/${movieId}`);
        const languages = [
          ...new Set(
            ["zh", raw.original_language, "en", "null"].filter(Boolean),
          ),
        ].join(",");
        const images = await get(`movie/${movieId}/images`, {
          include_image_language: languages,
        });
        return (images.posters || [])
          .slice(0, 50)
          .map((p) => ({
            path: imagePath(p.file_path),
            language: p.iso_639_1 || "无语言",
          }));
      },
    };
  }

  return { tmdbClient };
});
