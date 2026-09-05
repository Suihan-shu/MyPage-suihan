---
permalink: /assets/js/search-data.js
---
const ninja = document.querySelector('ninja-keys');
const sectionLabels = {
  navigation: {{ site.data.i18n.zh.search.section_navigation | default: '导航' | jsonify }},
  dropdown: {{ site.data.i18n.zh.search.section_dropdown | default: '下拉菜单' | jsonify }},
  socials: {{ site.data.i18n.zh.search.section_socials | default: '社交' | jsonify }},
  theme: {{ site.data.i18n.zh.search.section_theme | default: '主题' | jsonify }},
};

const allNinjaItems = [
  {%- for page in site.pages -%}
    {%- if page.permalink == '/' -%}{%- assign about_title = page.title | strip -%}{%- endif -%}
  {%- endfor -%}
  {
    id: "nav-home",
    title: {{ about_title | truncatewords: 13 | jsonify }},
    section: sectionLabels.navigation,
    handler: () => { window.location.href = {{ '/' | relative_url | jsonify }}; },
  },
  {%- assign sorted_pages = site.pages | sort: "nav_order" -%}
  {%- for p in sorted_pages -%}
    {%- if p.nav and p.autogen == null -%}
      {%- if p.dropdown -%}
        {%- for child in p.children -%}
          {%- unless child.title == 'divider' -%}
            {
              id: {{ child.title | slugify | prepend: 'dropdown-' | jsonify }},
              title: {{ child.title | truncatewords: 13 | jsonify }},
              description: {{ child.description | strip_html | strip_newlines | strip | jsonify }},
              section: sectionLabels.dropdown,
              handler: () => { window.location.href = {{ child.permalink | relative_url | jsonify }}; },
            },
          {%- endunless -%}
        {%- endfor -%}
      {%- else -%}
        {
          id: {{ p.title | slugify | prepend: 'nav-' | jsonify }},
          title: {{ p.title | truncatewords: 13 | jsonify }},
          description: {{ p.description | strip_html | strip_newlines | strip | jsonify }},
          section: sectionLabels.navigation,
          handler: () => { window.location.href = {{ p.url | relative_url | jsonify }}; },
        },
      {%- endif -%}
    {%- endif -%}
  {%- endfor -%}
  {%- for collection in site.collections -%}
    {%- for item in collection.docs -%}
      {
        {% capture item_id %}{{ collection.label }}-{{ item.title | slugify }}{% endcapture %}
        id: {{ item_id | jsonify }},
        title: {{ item.title | truncatewords: 13 | jsonify }},
        description: {{ item.description | strip_html | strip_newlines | strip | jsonify }},
        section: {{ collection.label | capitalize | jsonify }},
        handler: () => { window.location.href = {{ item.url | relative_url | jsonify }}; },
      },
    {%- endfor -%}
  {%- endfor -%}
  {% assign email_contact = site.data.socials.email_contact %}
  {% if email_contact %}
    {
      id: "social-email",
      title: "邮箱",
      section: sectionLabels.socials,
      handler: () => { document.querySelector('a[href="#contact-email"]')?.click(); },
    },
  {% endif %}
  {% assign github_username = site.data.socials.github_username %}
  {% if github_username %}
    {
      id: "social-github",
      title: "GitHub",
      section: sectionLabels.socials,
      handler: () => { window.open({{ github_username | prepend: 'https://github.com/' | jsonify }}, "_blank"); },
    },
  {% endif %}
  {% assign qr_social_keys = 'wechat_qr,qq_qr' | split: ',' %}
  {% for social_key in qr_social_keys %}
    {% assign social = site.data.socials[social_key] %}
    {% if social %}
      {
        id: {{ social_key | prepend: 'social-' | jsonify }},
        title: {{ social.title | jsonify }},
        section: sectionLabels.socials,
        handler: () => { Array.from(document.querySelectorAll('a[href]')).find(link => link.getAttribute('href') === {{ social.url | jsonify }})?.click(); },
      },
    {% endif %}
  {% endfor %}
  {% if site.enable_darkmode %}
    {
      id: 'light-theme',
      title: '切换为浅色主题',
      section: sectionLabels.theme,
      handler: () => { setThemeSetting("light"); },
    },
    {
      id: 'dark-theme',
      title: '切换为深色主题',
      section: sectionLabels.theme,
      handler: () => { setThemeSetting("dark"); },
    },
    {
      id: 'system-theme',
      title: '使用系统主题',
      section: sectionLabels.theme,
      handler: () => { setThemeSetting("system"); },
    },
  {% endif %}
];

if (ninja) ninja.data = allNinjaItems;
