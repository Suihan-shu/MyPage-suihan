---
permalink: /assets/js/search-data.js
---
const ninja = document.querySelector('ninja-keys');
const sectionLabels = {
  navigation: "{{ site.data.i18n.zh.search.section_navigation | default: '导航' }}",
  dropdown: "{{ site.data.i18n.zh.search.section_dropdown | default: '下拉菜单' }}",
  socials: "{{ site.data.i18n.zh.search.section_socials | default: '社交' }}",
  theme: "{{ site.data.i18n.zh.search.section_theme | default: '主题' }}",
};

const allNinjaItems = [
  {%- for page in site.pages -%}
    {%- if page.permalink == '/' -%}{%- assign about_title = page.title | strip -%}{%- endif -%}
  {%- endfor -%}
  {
    id: "nav-home",
    title: "{{ about_title | truncatewords: 13 }}",
    section: sectionLabels.navigation,
    handler: () => { window.location.href = "{{ '/' | relative_url }}"; },
  },
  {%- assign sorted_pages = site.pages | sort: "nav_order" -%}
  {%- for p in sorted_pages -%}
    {%- if p.nav and p.autogen == null -%}
      {%- if p.dropdown -%}
        {%- for child in p.children -%}
          {%- unless child.title == 'divider' -%}
            {
              id: "dropdown-{{ child.title | slugify }}",
              title: "{{ child.title | escape | truncatewords: 13 }}",
              description: "{{ child.description | strip_html | strip_newlines | escape | strip }}",
              section: sectionLabels.dropdown,
              handler: () => { window.location.href = "{{ child.permalink | relative_url }}"; },
            },
          {%- endunless -%}
        {%- endfor -%}
      {%- else -%}
        {
          id: "nav-{{ p.title | slugify }}",
          title: "{{ p.title | escape | truncatewords: 13 }}",
          description: "{{ p.description | strip_html | strip_newlines | escape | strip }}",
          section: sectionLabels.navigation,
          handler: () => { window.location.href = "{{ p.url | relative_url }}"; },
        },
      {%- endif -%}
    {%- endif -%}
  {%- endfor -%}
  {%- for collection in site.collections -%}
    {%- for item in collection.docs -%}
      {
        id: "{{ collection.label }}-{{ item.title | slugify }}",
        title: "{{ item.title | escape | truncatewords: 13 }}",
        description: "{{ item.description | strip_html | strip_newlines | escape | strip }}",
        section: "{{ collection.label | capitalize }}",
        handler: () => { window.location.href = "{{ item.url | relative_url }}"; },
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
      handler: () => { window.open("https://github.com/{{ github_username }}", "_blank"); },
    },
  {% endif %}
  {% assign qr_social_keys = 'wechat_qr,qq_qr' | split: ',' %}
  {% for social_key in qr_social_keys %}
    {% assign social = site.data.socials[social_key] %}
    {% if social %}
      {
        id: "social-{{ social_key }}",
        title: "{{ social.title }}",
        section: sectionLabels.socials,
        handler: () => { document.querySelector('a[href="{{ social.url }}"]')?.click(); },
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
