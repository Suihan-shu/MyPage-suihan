/* CMS data formats. js-yaml uses JSON_SCHEMA so dates remain strings. */
(() => {
  const parse = (source) => window.jsyaml.load(source, { schema: window.jsyaml.JSON_SCHEMA });
  const dump = (data) => window.jsyaml.dump(data, { schema: window.jsyaml.JSON_SCHEMA, lineWidth: -1, noRefs: true });
  const parseTravel = (source) => {
    const data = parse(source);
    if (!data || typeof data !== "object" || Array.isArray(data) ||
        (data.entries != null && !Array.isArray(data.entries))) {
      throw new Error("旅行日志 YAML 格式不正确，请检查 entries 列表。");
    }
    return { ...data, password: data.password == null ? "" : String(data.password), entries: data.entries || [] };
  };
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
  window.CMSData = { parse, dump, parseTravel, escapeHtml };
})();
