(function (root, factory) {
  if (typeof module === "object" && module.exports)
    module.exports = factory(
      require("./movie-model.js"),
      require("./movie-tmdb.js"),
    );
  else root.MovieCMS = factory(root.MovieModel, root.MovieTMDB);
})(globalThis, function (model, sharedTMDB) {
  const DATA_PATH = "_data/movies.json",
    STORAGE_KEY = "site_movie_tmdb_token";
  const { Problem, blank, validate, documentData, imagePath } = model;
  function decode(content) {
    return new TextDecoder().decode(
      Uint8Array.from(atob(content.replace(/\s/g, "")), (c) => c.charCodeAt(0)),
    );
  }
  async function inspectImage(blob) {
    if (!blob.size || blob.size > 8 * 1024 * 1024)
      throw new Problem("海报最大 8 MB");
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const ext =
      bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
        ? "jpg"
        : bytes.slice(0, 8).join(",") === "137,80,78,71,13,10,26,10"
          ? "png"
          : String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
              String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
            ? "webp"
            : null;
    if (!ext) throw new Problem("仅支持 JPG、PNG、WebP 海报");
    let bitmap;
    try {
      bitmap = await createImageBitmap(blob);
      if (
        !bitmap.width ||
        !bitmap.height ||
        bitmap.width * bitmap.height > 40000000
      )
        throw new Error();
    } catch {
      throw new Problem("图片损坏或尺寸过大，请换一张海报");
    } finally {
      bitmap?.close();
    }
    return ext;
  }
  function createTransport({
    cms,
    onSaved = () => {},
    storage = globalThis.localStorage,
    fetcher = globalThis.fetch,
    inspect = inspectImage,
    objectURL = (blob) => URL.createObjectURL(blob),
    revokeURL = (url) => URL.revokeObjectURL(url),
  }) {
    let token = "",
      generation = 0,
      queue = Promise.resolve();
    const previews = new Map(),
      cache = new Map(),
      history = new Map();
    try {
      token = storage?.getItem(STORAGE_KEY) || "";
    } catch {
      /* 浏览器禁止存储时仍可使用会话令牌。 */
    }
    const client = () => sharedTMDB.tmdbClient({ token, fetcher });
    const repo = () => {
      const { owner, repo } = cms.config;
      return `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
    };
    function check(session) {
      if (session !== generation)
        throw new Problem("登录状态已变更，请重新读取电影记录", 409);
    }
    async function read(session) {
      const file = await cms.getFile(DATA_PATH);
      check(session);
      let data;
      try {
        data = documentData(JSON.parse(file.content));
      } catch (error) {
        if (error instanceof Problem) throw error;
        throw new Problem("电影数据无法读取，原文件未修改");
      }
      return { data, revision: file.sha };
    }
    async function current(revision, session) {
      const result = await read(session);
      if (!revision || result.revision !== revision)
        throw new Problem(
          "电影记录已在其他地方修改。表单已保留，请先重新读取记录再编辑。",
          409,
        );
      return result;
    }
    async function publish(data, revision, message, session) {
      check(session);
      const normalized = documentData(data);
      const result = await cms.putFile(
        DATA_PATH,
        JSON.stringify(normalized, null, 2) + "\n",
        message,
        revision,
      );
      check(session);
      // 保存已经成功，部署状态查询失败不应让用户误以为数据没有写入。
      try {
        Promise.resolve(onSaved()).catch(() => {});
      } catch {
        /* 由后台状态区显示部署情况。 */
      }
      return { data: normalized, revision: result.content.sha };
    }
    async function upload(blob, session) {
      const ext = await inspect(blob);
      check(session);
      const path = `assets/img/movies/${globalThis.crypto.randomUUID()}.${ext}`;
      await cms.uploadBinary(path, blob, "上传电影海报");
      check(session);
      const local = "/" + path;
      previews.set(local, objectURL(blob));
      return local;
    }
    async function mutate(route, payload, session) {
      if (route === "upload") {
        if (
          typeof payload.image !== "string" ||
          payload.image.length > 11200000 ||
          !/^[a-zA-Z0-9+/]+={0,2}$/.test(payload.image)
        )
          throw new Problem("图片内容不正确");
        let bytes;
        try {
          bytes = Uint8Array.from(atob(payload.image), (c) => c.charCodeAt(0));
        } catch {
          throw new Problem("图片内容不正确");
        }
        return { path: await upload(new Blob([bytes]), session) };
      }
      const result = await current(payload.revision, session);
      if (route === "restore") {
        if (!/^[a-f0-9]{40}$/.test(payload.name))
          throw new Problem("历史版本不正确");
        const file = await cms.request(
          `${repo()}/contents/${DATA_PATH}?ref=${encodeURIComponent(payload.name)}`,
        );
        check(session);
        let data;
        try {
          data = documentData(JSON.parse(decode(file.content)));
        } catch {
          throw new Problem("历史版本的电影数据无法读取，当前记录未修改");
        }
        await current(payload.revision, session);
        return publish(data, result.revision, "恢复电影记录历史版本", session);
      }
      if (route === "delete") {
        if (!result.data.movies.some((m) => m.id === payload.id))
          throw new Problem("电影记录不存在，请重新读取", 404);
        result.data.movies = result.data.movies.filter(
          (m) => m.id !== payload.id,
        );
        return publish(result.data, result.revision, "删除电影记录", session);
      }
      if (route !== "save") throw new Problem("接口不存在", 404);
      const movie = validate(payload.movie, { timestamps: false });
      const previous = result.data.movies.find((m) => m.id === movie.id);
      if (
        movie.source.tmdb_id &&
        result.data.movies.some(
          (m) => m.id !== movie.id && m.source.tmdb_id === movie.source.tmdb_id,
        )
      )
        throw new Problem("这部电影已有记录，请编辑原记录", 409);
      const selected =
        movie.overrides.poster_source_path || movie.poster.source_path;
      if (
        selected !==
        (previous?.overrides.poster_source_path || previous?.poster.source_path)
      )
        movie.poster.local_path = null;
      if (
        payload.cache &&
        selected &&
        !movie.overrides.poster_path &&
        !movie.poster.local_path
      ) {
        imagePath(selected);
        if (!cache.has(selected)) {
          let response;
          try {
            response = await fetcher(
              "https://image.tmdb.org/t/p/w500" + selected,
              { signal: AbortSignal.timeout(20000), redirect: "error" },
            );
          } catch {
            throw new Problem("海报下载失败，表单已保留；可关闭缓存后重试");
          }
          if (!response.ok) throw new Problem("海报下载失败，表单已保留");
          if (Number(response.headers.get("content-length")) > 8 * 1024 * 1024)
            throw new Problem("海报最大 8 MB");
          const reader = response.body.getReader(),
            chunks = [];
          let size = 0;
          try {
            for (;;) {
              const { done, value } = await reader.read();
              if (done) break;
              size += value.length;
              if (size > 8 * 1024 * 1024) throw new Problem("海报最大 8 MB");
              chunks.push(value);
            }
          } finally {
            await reader.cancel().catch(() => {});
          }
          cache.set(selected, await upload(new Blob(chunks), session));
        }
        movie.poster.local_path = cache.get(selected);
      }
      check(session);
      await current(payload.revision, session);
      const now = new Date().toISOString();
      movie.created_at = previous?.created_at || now;
      movie.updated_at = now;
      result.data.movies = previous
        ? result.data.movies.map((m) => (m.id === movie.id ? movie : m))
        : [...result.data.movies, movie];
      return publish(
        result.data,
        result.revision,
        `保存电影记录：${movie.overrides.title || movie.source.title}`,
        session,
      );
    }
    async function api(route, payload) {
      const session = generation;
      if (payload && ["save", "delete", "restore", "upload"].includes(route)) {
        const task = queue.then(() => {
          check(session);
          return mutate(route, payload, session);
        });
        queue = task.catch(() => {});
        return task;
      }
      if (route === "configure") {
        const next = String(payload.token || "").trim();
        if (next) {
          if (next.length > 4096 || /\s/.test(next))
            throw new Problem("请输入正确的 TMDB API 读访问令牌");
          await sharedTMDB.tmdbClient({ token: next, fetcher }).check();
          check(session);
        }
        // 新令牌校验通过以后才替换已有连接。
        if (payload.remember && next) {
          try {
            storage?.setItem(STORAGE_KEY, next);
          } catch {
            throw new Problem("浏览器无法记住令牌，请取消勾选后重试");
          }
        } else {
          try {
            storage?.removeItem(STORAGE_KEY);
          } catch {
            /* 内存令牌仍可清除。 */
          }
        }
        token = next;
        return { configured: Boolean(token) };
      }
      if (route === "session") return { configured: Boolean(token) };
      if (route === "movies") {
        const result = await read(session);
        return { ...result.data, revision: result.revision };
      }
      if (route === "blank") return blank();
      if (route === "backups") {
        const entries = await cms.request(
          `${repo()}/commits?path=${encodeURIComponent(DATA_PATH)}&sha=${encodeURIComponent(cms.config.branch)}&per_page=30`,
        );
        check(session);
        history.clear();
        entries.forEach((entry) => {
          if (/^[a-f0-9]{40}$/.test(entry.sha))
            history.set(
              entry.sha,
              `${entry.commit.author.date.slice(0, 10)} · ${entry.commit.message.split("\n")[0]} · ${entry.sha.slice(0, 7)}`,
            );
        });
        return [...history.keys()];
      }
      const url = new URL(route, "https://movie.invalid/");
      let value;
      if (url.pathname === "/search")
        value = await client().search(
          url.searchParams.get("query"),
          url.searchParams.get("year"),
        );
      else if (url.pathname === "/detail")
        value = await client().detail(url.searchParams.get("id"));
      else if (url.pathname === "/images")
        value = await client().images(url.searchParams.get("id"));
      else throw new Problem("接口不存在", 404);
      check(session);
      return value;
    }
    api.backupLabel = (sha) => history.get(sha) || sha;
    api.posterPreview = (movie) =>
      previews.get(movie.overrides.poster_path || movie.poster.local_path);
    api.reset = () => {
      generation++;
      token = "";
      try {
        storage?.removeItem(STORAGE_KEY);
      } catch {}
      previews.forEach(revokeURL);
      previews.clear();
      cache.clear();
      history.clear();
    };
    return api;
  }
  function create({ cms, app, onSaved }) {
    return globalThis.MovieManager.create({
      root: app.querySelector("#movie-manager-root"),
      base: app.dataset.baseurl || "",
      mode: "github",
      api: createTransport({ cms, onSaved }),
    });
  }
  return { create, createTransport };
});
