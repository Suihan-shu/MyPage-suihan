const { test } = require("node:test");
const assert = require("node:assert/strict");
const { blank, fromTMDB } = require("../assets/js/movie-model.js");
const { createTransport } = require("../assets/js/movie-cms.js");
function fixture() {
  let data = { schema_version: 1, movies: [] },
    revision = "initial",
    count = 0;
  const writes = [],
    uploads = [],
    values = new Map();
  const cms = {
    config: { owner: "fixture", repo: "site", branch: "main" },
    getFile: async () => ({ content: JSON.stringify(data), sha: revision }),
    putFile: async (path, content, message, sha) => {
      assert.equal(sha, revision);
      data = JSON.parse(content);
      revision = "revision-" + ++count;
      writes.push({ path, content, message });
      return { content: { sha: revision } };
    },
    uploadBinary: async (path, blob) => {
      uploads.push({ path, blob });
      return {};
    },
    request: async (endpoint) =>
      endpoint.includes("/commits?")
        ? [
            {
              sha: "a".repeat(40),
              commit: {
                author: { date: "2026-09-30T00:00:00Z" },
                message: "fixture history",
              },
            },
          ]
        : {
            content: Buffer.from(
              JSON.stringify({ schema_version: 1, movies: [] }),
            ).toString("base64"),
          },
  };
  const storage = {
    getItem: (key) => values.get(key),
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
  const api = createTransport({
    cms,
    storage,
    fetcher: async () => new Response("{}"),
    inspect: async () => "png",
    objectURL: () => "blob:fixture",
    revokeURL: () => {},
  });
  return {
    api,
    cms,
    writes,
    uploads,
    values,
    get data() {
      return data;
    },
    get revision() {
      return revision;
    },
    change: () => {
      revision = "remote-edit";
    },
  };
}
const manual = () => {
  const m = blank();
  m.source.title = "真实零分测试";
  m.personal.rating = 0;
  m.personal.watched_on = "2026-09-30";
  m.personal.review = "中文短评";
  return m;
};
test("后台保存使用 GitHub SHA，保留个人数据和创建时间，字段白名单排除凭证", async () => {
  const f = fixture(),
    m = manual();
  m.token = "must-not-be-committed";
  m.source.api_key = "secret";
  await f.api("save", { movie: m, revision: f.revision });
  const original = f.data.movies[0];
  assert.equal(original.personal.rating, 0);
  assert.equal(original.personal.watched_on, "2026-09-30");
  m.personal.review = "第二次修改";
  await f.api("save", { movie: m, revision: f.revision });
  assert.equal(f.data.movies.length, 1);
  assert.equal(f.data.movies[0].created_at, original.created_at);
  assert.ok(
    f.writes.every(
      (w) =>
        w.path === "_data/movies.json" &&
        !w.content.includes("secret") &&
        !w.content.includes("must-not-be-committed"),
    ),
  );
});
test("后台读取失败、SHA 冲突及重复电影不会发送写入", async () => {
  const f = fixture();
  f.cms.getFile = async () => {
    throw new Error("403");
  };
  await assert.rejects(
    f.api("save", { movie: manual(), revision: f.revision }),
    /403/,
  );
  assert.equal(f.writes.length, 0);
  const g = fixture();
  const old = g.revision;
  g.change();
  await assert.rejects(
    g.api("save", { movie: manual(), revision: old }),
    /其他地方修改/,
  );
  assert.equal(g.writes.length, 0);
  const movie = fromTMDB({ id: 202, title: "重复电影" });
  await g.api("save", { movie, revision: g.revision });
  movie.id = crypto.randomUUID();
  await assert.rejects(
    g.api("save", { movie, revision: g.revision }),
    /已有记录/,
  );
  assert.equal(g.writes.length, 1);
});
test("后台串行保存拒绝陈旧 SHA，删除和提交历史恢复使用同一份数据", async () => {
  const f = fixture(),
    a = manual(),
    b = manual();
  const revision = f.revision;
  const results = await Promise.allSettled([
    f.api("save", { movie: a, revision }),
    f.api("save", { movie: b, revision }),
  ]);
  assert.equal(results[0].status, "fulfilled");
  assert.equal(results[1].status, "rejected");
  assert.equal(f.data.movies.length, 1);
  const backups = await f.api("backups");
  assert.equal(backups.length, 1);
  assert.match(f.api.backupLabel(backups[0]), /fixture history/);
  await f.api("restore", { name: backups[0], revision: f.revision });
  assert.equal(f.data.movies.length, 0);
  await f.api("save", { movie: a, revision: f.revision });
  await f.api("delete", { id: a.id, revision: f.revision });
  assert.equal(f.data.movies.length, 0);
});
test("TMDB 配置先验证再存储，退出清除会话和浏览器令牌，凭据不会写入 GitHub", async () => {
  const f = fixture();
  await f.api("configure", { token: "fixture-token", remember: false });
  assert.equal(f.values.size, 0);
  assert.equal((await f.api("session")).configured, true);
  await f.api("configure", { token: "fixture-token", remember: true });
  assert.equal(f.values.get("site_movie_tmdb_token"), "fixture-token");
  await f.api("save", { movie: manual(), revision: f.revision });
  assert.ok(!f.writes[0].content.includes("fixture-token"));
  f.api.reset();
  assert.equal(f.values.size, 0);
  assert.equal((await f.api("session")).configured, false);
  const bad = createTransport({
    cms: f.cms,
    storage: null,
    fetcher: async () => new Response("{}", { status: 401 }),
  });
  await assert.rejects(
    bad("configure", { token: "invalid", remember: true }),
    /凭据无效/,
  );
  assert.equal((await bad("session")).configured, false);
});
test("缓存海报上传成功后记录写入失败，重试复用上传，冲突和退出阻止后续记录写入", async () => {
  const f = fixture();
  let downloads = 0;
  const api = createTransport({
    cms: f.cms,
    storage: null,
    fetcher: async () => {
      downloads++;
      return new Response("image fixture");
    },
    inspect: async () => "png",
    objectURL: () => "blob:fixture",
    revokeURL: () => {},
  });
  const movie = fromTMDB({
    id: 101,
    title: "缓存测试",
    poster_path: "/fixture.jpg",
  });
  const put = f.cms.putFile;
  f.cms.putFile = async () => {
    throw new Error("temporary write error");
  };
  await assert.rejects(
    api("save", { movie, revision: f.revision, cache: true }),
    /temporary/,
  );
  assert.equal(f.uploads.length, 1);
  f.cms.putFile = put;
  await api("save", { movie, revision: f.revision, cache: true });
  assert.equal(downloads, 1);
  assert.equal(f.uploads.length, 1);
  assert.match(f.data.movies[0].poster.local_path, /\.png$/);
  const g = fixture();
  g.cms.uploadBinary = async () => {
    g.change();
  };
  const changed = createTransport({
    cms: g.cms,
    storage: null,
    inspect: async () => "png",
    objectURL: () => "blob:fixture",
    fetcher: async () => new Response("fixture"),
  });
  await assert.rejects(
    changed("save", { movie, revision: g.revision, cache: true }),
    /其他地方修改/,
  );
  assert.equal(g.writes.length, 0);
  const task = g.api("save", { movie: manual(), revision: g.revision });
  g.api.reset();
  await assert.rejects(task, /登录状态/);
  assert.equal(g.writes.length, 0);
});
