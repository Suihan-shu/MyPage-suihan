(() => {
  let token;
  async function api(route, data) {
    const response = await fetch("/api/" + route, {
      method: data === undefined ? "GET" : "POST",
      headers: {
        "X-Movie-Token": token || "",
        ...(data === undefined ? {} : { "Content-Type": "application/json" }),
      },
      ...(data === undefined ? {} : { body: JSON.stringify(data) }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    if (route === "session") token = result.token;
    return result;
  }
  window.MovieManager.create({
    root: document.getElementById("movie-manager-root"),
    api,
  }).load();
})();
