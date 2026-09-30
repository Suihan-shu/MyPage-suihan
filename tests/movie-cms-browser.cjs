const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const assert = require("node:assert/strict");
const puppeteer = require("puppeteer");
const root = path.resolve(process.env.SITE_DIR || "_site"),
  base = "/MyPage-suihan";
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};
(async () => {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    if (!url.pathname.startsWith(base + "/")) return res.writeHead(404).end();
    const target = path.resolve(
      root,
      "." + decodeURIComponent(url.pathname.slice(base.length)),
      url.pathname.endsWith("/") ? "index.html" : "",
    );
    if (!target.startsWith(root + path.sep) || !fs.existsSync(target))
      return res.writeHead(404).end();
    res.writeHead(200, {
      "Content-Type": mime[path.extname(target)] || "application/octet-stream",
    });
    fs.createReadStream(target).pipe(res);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  let browser;
  const files = {
    "_data/cv.yml": {
      sha: "cv",
      content: "cv:\n  name: Browser Fixture\n  sections: {}\n",
    },
    "_data/travel.yml": { sha: "travel", content: "entries: []\n" },
    "_pages/about.md": {
      sha: "about",
      content: "---\nlayout: about\n---\n测试简介",
    },
    "_data/movies.json": {
      sha: "movies-initial",
      content: '{"schema_version":1,"movies":[]}',
    },
  };
  const writes = [],
    movieRequests = [],
    errors = [];
  let sourceVersion = 0,
    failRead = false,
    failDetail = false,
    failWrite = false;
  const originalData = fs.readFileSync("_data/movies.json", "utf8");
  try {
    const executablePath = [
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
      "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    ].find(fs.existsSync);
    browser = await puppeteer.launch({ executablePath, headless: true });
    const page = await browser.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("dialog", (dialog) => dialog.accept());
    await page.setViewport({ width: 1440, height: 1000 });
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem(
        "site_github_cms_config",
        JSON.stringify({
          owner: "fixture",
          repo: "site",
          branch: "main",
          token: "fake-github-token",
        }),
      );
    });
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const url = new URL(req.url());
      if (
        !["api.github.com", "api.themoviedb.org", "image.tmdb.org"].includes(
          url.hostname,
        )
      )
        return req.continue();
      const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
      };
      const reply = (status, data) =>
        req.respond({
          status,
          headers,
          contentType: "application/json",
          body: JSON.stringify(data),
        });
      if (req.method() === "OPTIONS") return reply(204, null);
      if (url.hostname === "image.tmdb.org")
        return req.respond({
          status: 200,
          headers,
          contentType: "image/jpeg",
          body: fs.readFileSync("assets/img/profile.jpg"),
        });
      if (url.hostname === "api.themoviedb.org") {
        assert.equal(req.headers().authorization, "Bearer fake-tmdb-token");
        if (url.pathname.endsWith("/configuration")) return reply(200, {});
        if (url.pathname.endsWith("/search/movie"))
          return reply(200, {
            results: [
              {
                id: 101,
                title: "同名电影旧版",
                original_title: "Old",
                release_date: "2000-01-01",
              },
              {
                id: 202,
                title: "同名电影新版",
                original_title: "New",
                release_date: "2020-01-01",
              },
            ],
          });
        if (url.pathname.endsWith("/images"))
          return reply(200, {
            posters: [{ file_path: "/alternative.jpg", iso_639_1: "zh" }],
          });
        if (failDetail) return reply(500, {});
        return reply(200, {
          id: 202,
          title: sourceVersion ? "新的源片名" : "测试影片",
          original_title: "Fixture",
          original_language: "en",
          release_date: "2020-01-01",
          vote_average: sourceVersion ? 8.5 : 7.3,
          vote_count: 100,
          overview: "测试资料",
          poster_path: "/fixture.jpg",
          credits: { cast: [], crew: [] },
        });
      }
      if (url.pathname === "/user")
        return reply(200, { login: "fixture", name: "Fixture" });
      if (url.pathname.endsWith("/actions/runs"))
        return reply(200, { workflow_runs: [] });
      if (url.pathname.endsWith("/commits"))
        return reply(200, [
          {
            sha: "a".repeat(40),
            commit: {
              author: { date: "2026-09-30T00:00:00Z" },
              message: "隔离测试历史版本",
            },
          },
        ]);
      if (!url.pathname.includes("/contents/"))
        return reply(200, {
          full_name: "fixture/site",
          permissions: { push: true },
        });
      const filePath = decodeURIComponent(url.pathname.split("/contents/")[1]);
      if (filePath === "_data/movies.json") movieRequests.push(req.method());
      if (req.method() === "GET") {
        if (filePath === "_data/movies.json" && failRead)
          return reply(403, { message: "Forbidden fixture" });
        const file =
          url.searchParams.get("ref") === "a".repeat(40)
            ? { sha: "history", content: '{"schema_version":1,"movies":[]}' }
            : files[filePath];
        return file
          ? reply(200, {
              ...file,
              encoding: "base64",
              content: Buffer.from(file.content).toString("base64"),
            })
          : reply(404, {});
      }
      if (failWrite && filePath === "_data/movies.json")
        return reply(500, { message: "Temporary fixture failure" });
      const payload = JSON.parse(req.postData());
      if (payload.sha !== files[filePath]?.sha)
        return reply(409, { message: "Conflict" });
      assert.ok(!payload.content.includes("fake-tmdb-token"));
      const content = Buffer.from(payload.content, "base64");
      if (filePath === "_data/movies.json")
        assert.ok(
          !content.toString().includes("fake-tmdb-token") &&
            !content.toString().includes("fake-github-token"),
        );
      writes.push({ filePath, payload });
      files[filePath] = {
        sha: "new-" + writes.length,
        content: content.toString(),
      };
      return reply(200, { content: { sha: files[filePath].sha } });
    });
    await page.goto(`http://127.0.0.1:${server.address().port}${base}/admin/`, {
      waitUntil: "load",
    });
    await page.waitForFunction(
      () =>
        !document.getElementById("publisher-main-section").hidden &&
        !document.getElementById("travel-editor-fields").disabled,
    );
    assert.equal(
      movieRequests.length,
      0,
      "Movie requests start only when its pane is opened",
    );
    await page.click('[data-publisher-tab="movies"]');
    const waitStatus = async (text) =>
      page.waitForFunction(
        (text) =>
          document
            .querySelector("#movie-manager-root #status")
            .textContent.includes(text) &&
          !document.querySelector("#movie-manager-root #reload").disabled,
        {},
        text,
      );
    const click = async (selector) => page.$eval(selector, (el) => el.click());
    const set = async (selector, value) =>
      page.$eval(
        selector,
        (el, value) => {
          el.value = value;
          el.dispatchEvent(new Event("input", { bubbles: true }));
        },
        value,
      );
    const save = async () =>
      page.$eval("#movie-form", (form) => form.requestSubmit());
    const saved = () => JSON.parse(files["_data/movies.json"].content).movies;
    await waitStatus("已读取电影记录");
    await set("#tmdb-token", "fake-tmdb-token");
    await click("#tmdb-remember");
    await page.$eval("#tmdb-config-form", (form) => form.requestSubmit());
    await waitStatus("TMDB 已连接");
    assert.equal(await page.$eval("#tmdb-token", (el) => el.value), "");
    await set("#query", "同名电影");
    await page.$eval("#search-form", (form) => form.requestSubmit());
    await waitStatus("请选择正确");
    assert.equal(
      await page.$$("#candidates .candidate").then((x) => x.length),
      2,
    );
    await click("#candidates .candidate:nth-child(2)");
    await waitStatus("已获取电影资料");
    await set("#title", '<img id="injected" src=x> 人工片名');
    await set("#rating", "0");
    await set("#watched_on", "2026-09-30");
    await set("#review", "我的观影短评");
    assert.equal(await page.$("#injected"), null);
    await save();
    await waitStatus("电影已保存");
    assert.equal(saved()[0].source.tmdb_id, 202);
    assert.equal(saved()[0].personal.rating, 0);
    assert.equal(saved()[0].personal.watched_on, "2026-09-30");
    const id = saved()[0].id,
      created = saved()[0].created_at;
    await set("#review", "连续修改");
    await save();
    await waitStatus("电影已保存");
    assert.equal(saved()[0].id, id);
    assert.equal(saved()[0].created_at, created);
    sourceVersion = 1;
    await click("#refresh-source");
    await page.waitForFunction(
      () => document.getElementById("refresh-dialog").open,
    );
    await click("#apply-refresh");
    await save();
    await waitStatus("电影已保存");
    assert.equal(saved()[0].source.title, "新的源片名");
    assert.equal(saved()[0].personal.review, "连续修改");
    assert.equal(
      saved()[0].overrides.title,
      '<img id="injected" src=x> 人工片名',
    );
    failDetail = true;
    await click("#refresh-source");
    await waitStatus("无法获取资料");
    assert.equal(await page.$eval("#review", (el) => el.value), "连续修改");
    failDetail = false;
    await click("#posters");
    await waitStatus("点击海报");
    await click("#poster-candidates .candidate");
    await save();
    await waitStatus("电影已保存");
    assert.equal(saved()[0].overrides.poster_source_path, "/alternative.jpg");
    await (
      await page.$("#poster-upload")
    ).uploadFile(path.resolve("assets/img/profile.jpg"));
    await waitStatus("海报已上传到 GitHub");
    assert.ok(
      (await page.$eval("#preview img", (el) => el.src)).startsWith("blob:"),
    );
    await save();
    await waitStatus("电影已保存");
    assert.match(
      saved()[0].overrides.poster_path,
      /^\/assets\/img\/movies\/.+\.jpg$/,
    );
    const before = writes.length;
    files["_data/movies.json"].sha = "external-change";
    await set("#review", "保留冲突草稿");
    await save();
    await waitStatus("其他地方修改");
    assert.equal(writes.length, before);
    assert.equal(await page.$eval("#review", (el) => el.value), "保留冲突草稿");
    await click("#reload");
    await waitStatus("已重新读取 GitHub");
    await click("#records .secondary");
    failRead = true;
    await set("#review", "读取失败草稿");
    await save();
    await waitStatus("Forbidden");
    assert.equal(writes.length, before);
    failRead = false;
    await click("#reload");
    await waitStatus("已重新读取 GitHub");
    await click("#manual");
    await waitStatus("手动记录");
    await set("#title", "手动电影");
    await set("#rating", "9.5");
    failWrite = true;
    await save();
    await waitStatus("Temporary fixture failure");
    assert.equal(await page.$eval("#title", (el) => el.value), "手动电影");
    failWrite = false;
    await save();
    await waitStatus("电影已保存");
    assert.equal(saved().length, 2);
    await click("#cancel");
    await click("#records .danger");
    await waitStatus("记录已删除");
    assert.equal(saved().length, 1);
    await click("#restore");
    await waitStatus("已恢复历史版本");
    assert.equal(saved().length, 0);
    await click("#manual");
    await waitStatus("手动记录");
    await set("#title", "手机编辑预览");
    for (const width of [390, 320]) {
      // 切换 isMobile 会重新加载页面，重新打开电影板块后检查其真实布局。
      await page.setViewport({
        width,
        height: 844,
        isMobile: true,
        hasTouch: true,
      });
      await page.waitForFunction(
        () => !document.getElementById("publisher-main-section").hidden,
      );
      await click('[data-publisher-tab="movies"]');
      if (width === 390) {
        await waitStatus("电影管理已就绪");
        await click("#manual");
        await waitStatus("手动记录");
        await set("#title", "手机编辑预览");
      }
      assert.equal(
        await page.$eval("#pane-movies", (el) => getComputedStyle(el).display),
        "block",
      );
      assert.equal(await page.$eval("#editor", (el) => el.hidden), false);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        true,
        `Movie pane has no overflow at ${width}px`,
      );
    }
    await page.waitForFunction(
      () =>
        getComputedStyle(document.getElementById("pane-movies")).opacity ===
        "1",
    );
    await page.screenshot({
      path: "_site/review-artifacts/movie-admin-mobile.png",
      fullPage: true,
    });
    await page.setViewport({
      width: 1440,
      height: 1000,
      isMobile: false,
      hasTouch: false,
    });
    await page.waitForFunction(
      () => !document.getElementById("publisher-main-section").hidden,
    );
    await click('[data-publisher-tab="movies"]');
    await waitStatus("电影管理已就绪");
    await click("#manual");
    await waitStatus("手动记录");
    await set("#title", "后台电影卡片预览");
    await page.waitForFunction(
      () =>
        getComputedStyle(document.getElementById("pane-movies")).opacity ===
        "1",
    );
    await page.screenshot({
      path: "_site/review-artifacts/movie-admin-desktop.png",
      fullPage: true,
    });
    await click('[data-publisher-tab="travel"]');
    assert.equal(
      await page.$eval("#pane-travel", (el) => el.classList.contains("active")),
      true,
    );
    assert.equal(
      await page.$eval("#travel-submit-btn", (el) => el.disabled),
      false,
    );
    await click('[data-publisher-tab="movies"]');
    await click("#publisher-logout-btn");
    await page.waitForFunction(
      () => !document.getElementById("publisher-auth-section").hidden,
    );
    assert.equal(
      await page.evaluate(() => localStorage.getItem("site_movie_tmdb_token")),
      null,
    );
    assert.equal(
      await page.evaluate(() => localStorage.getItem("site_github_cms_config")),
      null,
    );
    await set("#input-github-token", "fake-github-token");
    await page.$eval("#publisher-auth-form", (form) => form.requestSubmit());
    await waitStatus("已读取电影记录");
    assert.equal(await page.$eval("#pane-movies", el => getComputedStyle(el).display), "block");
    assert.equal(await page.$eval("#manual", el => el.disabled), false);
    assert.equal(await page.$eval("#editor", el => el.hidden), true, "Logout discards the previous draft");
    assert.equal(
      fs.readFileSync("_data/movies.json", "utf8"),
      originalData,
      "Real movie records were untouched",
    );
    assert.deepEqual(errors, []);
    console.log(
      "PASS integrated movie CMS: lazy load, TMDB, CRUD, refresh, poster upload/preview, history, failures, conflicts, mobile, other panes and logout",
    );
  } finally {
    await browser?.close();
    server.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
