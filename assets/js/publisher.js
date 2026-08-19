/**
 * Site Content CMS UI Controller
 * 个人专用主页内容、简历与图片管理后台控制逻辑
 */

(function () {
  'use strict';

  // 辅助 YAML 解析与序列化
  const YAMLHelper = {
    // 序列化简历对象为 YAML 字符串
    stringifyCV(cvData) {
      let yaml = `# ==============================================================================\n`;
      yaml += `# 个人简历数据文件 (Resume Data)\n`;
      yaml += `# ==============================================================================\n\n`;
      yaml += `cv:\n`;
      yaml += `  name: ${JSON.stringify(cvData.name || '')}\n`;
      yaml += `  label: ${JSON.stringify(cvData.label || '')}\n`;
      yaml += `  email: ${JSON.stringify(cvData.email || '')}\n`;
      yaml += `  phone: ${JSON.stringify(cvData.phone || '')}\n`;
      yaml += `  location: ${JSON.stringify(cvData.location || '')}\n\n`;
      yaml += `  summary: ${JSON.stringify(cvData.summary || '')}\n\n`;
      yaml += `  sections:\n`;

      // 教育经历
      yaml += `    教育经历:\n`;
      if (!cvData.education || cvData.education.length === 0) {
        yaml += `      []\n`;
      } else {
        cvData.education.forEach(edu => {
          yaml += `      - institution: ${JSON.stringify(edu.institution || '')}\n`;
          if (edu.degree) yaml += `        degree: ${JSON.stringify(edu.degree)}\n`;
          if (edu.area) yaml += `        area: ${JSON.stringify(edu.area)}\n`;
          if (edu.start_date) yaml += `        start_date: ${JSON.stringify(edu.start_date)}\n`;
          if (edu.end_date) yaml += `        end_date: ${JSON.stringify(edu.end_date)}\n`;
          if (edu.location) yaml += `        location: ${JSON.stringify(edu.location)}\n`;
          if (edu.highlights && edu.highlights.length) {
            yaml += `        highlights:\n`;
            edu.highlights.forEach(h => yaml += `          - ${JSON.stringify(h)}\n`);
          }
        });
      }

      // 项目经历
      yaml += `\n    项目经历:\n`;
      if (!cvData.experience || cvData.experience.length === 0) {
        yaml += `      []\n`;
      } else {
        cvData.experience.forEach(exp => {
          yaml += `      - company: ${JSON.stringify(exp.company || '')}\n`;
          if (exp.position) yaml += `        position: ${JSON.stringify(exp.position)}\n`;
          if (exp.start_date) yaml += `        start_date: ${JSON.stringify(exp.start_date)}\n`;
          if (exp.end_date) yaml += `        end_date: ${JSON.stringify(exp.end_date)}\n`;
          if (exp.location) yaml += `        location: ${JSON.stringify(exp.location)}\n`;
          if (exp.summary) yaml += `        summary: ${JSON.stringify(exp.summary)}\n`;
          if (exp.highlights && exp.highlights.length) {
            yaml += `        highlights:\n`;
            exp.highlights.forEach(h => yaml += `          - ${JSON.stringify(h)}\n`);
          }
        });
      }

      // 专业技能
      yaml += `\n    专业技能:\n`;
      if (!cvData.skills || cvData.skills.length === 0) {
        yaml += `      []\n`;
      } else {
        cvData.skills.forEach(sk => {
          yaml += `      - name: ${JSON.stringify(sk.name || '')}\n`;
          if (sk.keywords && sk.keywords.length) {
            yaml += `        keywords:\n`;
            sk.keywords.forEach(k => yaml += `          - ${JSON.stringify(k)}\n`);
          }
        });
      }

      yaml += `\n    获奖情况: []\n`;
      yaml += `    语言能力:\n`;
      yaml += `      - name: "中文"\n`;
      yaml += `        summary: "母语"\n`;
      yaml += `      - name: "英语"\n`;
      yaml += `        summary: "读写熟练"\n`;
      yaml += `    兴趣爱好: []\n`;

      return yaml;
    },

    // 格式化 Travel Log 列表为 YAML 字符串
    stringifyTravel(password, entries) {
      let yaml = `# Front-end-only travel journal settings.\n`;
      yaml += `password: ${JSON.stringify(password || '')}\n\n`;
      yaml += `entries:\n`;
      if (!entries || entries.length === 0) {
        yaml += `  []\n`;
        return yaml;
      }
      entries.forEach(entry => {
        yaml += `  - id: ${JSON.stringify(entry.id || '')}\n`;
        yaml += `    title: ${JSON.stringify(entry.title || '')}\n`;
        yaml += `    destination: ${JSON.stringify(entry.destination || '')}\n`;
        yaml += `    date_range: ${JSON.stringify(entry.date_range || '')}\n`;
        if (entry.category) yaml += `    category: ${JSON.stringify(entry.category)}\n`;
        if (entry.summary) yaml += `    summary: ${JSON.stringify(entry.summary)}\n`;
        if (entry.cover_image) yaml += `    cover_image: ${JSON.stringify(entry.cover_image)}\n`;
        if (entry.tags && entry.tags.length) {
          yaml += `    tags:\n`;
          entry.tags.forEach(t => yaml += `      - ${JSON.stringify(t)}\n`);
        }
        if (entry.photos && entry.photos.length) {
          yaml += `    photos:\n`;
          entry.photos.forEach(p => {
            if (typeof p === 'string') {
              yaml += `      - ${JSON.stringify(p)}\n`;
            } else {
              yaml += `      - url: ${JSON.stringify(p.url || '')}\n`;
              if (p.caption) yaml += `        caption: ${JSON.stringify(p.caption)}\n`;
            }
          });
        }
        yaml += '\n';
      });
      return yaml;
    }
  };

  // 统一 Toast 提示
  function showToast(msg, type = 'info') {
    let container = document.getElementById('publisher-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'publisher-toast-container';
      container.className = 'publisher-toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `publisher-toast publisher-toast--${type}`;
    const icon = type === 'success' ? 'fa-circle-check' : type === 'error' ? 'fa-circle-xmark' : 'fa-circle-info';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('publisher-toast--show');
    }, 10);
    setTimeout(() => {
      toast.classList.remove('publisher-toast--show');
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }

  // 简单 Travel YAML 解析
  function parseTravelYaml(yamlStr) {
    let password = '';
    const entries = [];
    let current = null;
    let inPhotos = false;
    let inTags = false;

    yamlStr.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('password:')) {
        password = trimmed.replace('password:', '').trim().replace(/^["']|["']$/g, '');
      } else if (trimmed.startsWith('- id:')) {
        if (current) entries.push(current);
        current = { id: trimmed.replace('- id:', '').trim().replace(/^["']|["']$/g, ''), tags: [], photos: [] };
        inPhotos = false;
        inTags = false;
      } else if (current) {
        if (trimmed.startsWith('title:')) current.title = trimmed.replace('title:', '').trim().replace(/^["']|["']$/g, '');
        else if (trimmed.startsWith('destination:')) current.destination = trimmed.replace('destination:', '').trim().replace(/^["']|["']$/g, '');
        else if (trimmed.startsWith('date_range:')) current.date_range = trimmed.replace('date_range:', '').trim().replace(/^["']|["']$/g, '');
        else if (trimmed.startsWith('summary:')) current.summary = trimmed.replace('summary:', '').trim().replace(/^["']|["']$/g, '');
        else if (trimmed.startsWith('cover_image:')) current.cover_image = trimmed.replace('cover_image:', '').trim().replace(/^["']|["']$/g, '');
        else if (trimmed.startsWith('photos:')) { inPhotos = true; inTags = false; }
        else if (trimmed.startsWith('tags:')) { inTags = true; inPhotos = false; }
        else if (trimmed.startsWith('- ') && inPhotos) current.photos.push(trimmed.replace('- ', '').trim().replace(/^["']|["']$/g, ''));
        else if (trimmed.startsWith('- ') && inTags) current.tags.push(trimmed.replace('- ', '').trim().replace(/^["']|["']$/g, ''));
      }
    });
    if (current) entries.push(current);
    return { password, entries };
  }

  // 辅助解析 Front Matter
  function parseFrontMatter(str) {
    if (!str.startsWith('---')) {
      return { data: {}, content: str, rawHeader: '' };
    }
    const end = str.indexOf('\n---', 3);
    if (end === -1) {
      return { data: {}, content: str, rawHeader: '' };
    }
    const rawYaml = str.substring(3, end);
    const content = str.substring(end + 4).replace(/^\r?\n/, '');

    const data = {};
    rawYaml.split('\n').forEach(line => {
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        const key = line.substring(0, colonIdx).trim();
        let val = line.substring(colonIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1);
        }
        data[key] = val;
      }
    });

    return { data, content, rawYaml };
  }

  // DOM 就绪后启动
  document.addEventListener('DOMContentLoaded', () => {
    const appEl = document.getElementById('publisher-app');
    if (!appEl) return;

    const cms = new GitHubCMS();

    // DOM 元素引用
    const authSection = document.getElementById('publisher-auth-section');
    const mainSection = document.getElementById('publisher-main-section');
    const authForm = document.getElementById('publisher-auth-form');
    const tokenInput = document.getElementById('input-github-token');
    const ownerInput = document.getElementById('input-github-owner');
    const repoInput = document.getElementById('input-github-repo');
    const branchInput = document.getElementById('input-github-branch');
    const authStatus = document.getElementById('publisher-auth-status');
    const logoutBtn = document.getElementById('publisher-logout-btn');
    const userBadge = document.getElementById('publisher-user-badge');

    // 选项卡
    const tabButtons = document.querySelectorAll('[data-publisher-tab]');
    const tabPanes = document.querySelectorAll('.publisher-pane');

    // 简历表单元素
    const cmsCvForm = document.getElementById('cms-cv-form');
    const cvName = document.getElementById('cv-name');
    const cvLabel = document.getElementById('cv-label');
    const cvEmail = document.getElementById('cv-email');
    const cvPhone = document.getElementById('cv-phone');
    const cvLocation = document.getElementById('cv-location');
    const cvWebsite = document.getElementById('cv-website');
    const cvSummary = document.getElementById('cv-summary');
    const cvEduContainer = document.getElementById('cv-edu-container');
    const cvExpContainer = document.getElementById('cv-exp-container');
    const cvSkillContainer = document.getElementById('cv-skill-container');
    const cvAddEduBtn = document.getElementById('cv-add-edu-btn');
    const cvAddExpBtn = document.getElementById('cv-add-exp-btn');
    const cvAddSkillBtn = document.getElementById('cv-add-skill-btn');
    const cvSubmitBtn = document.getElementById('cv-submit-btn');
    let cvFileSha = null;

    // 旅行日志相关元素
    const cmsTravelForm = document.getElementById('cms-travel-form');
    const travelTitle = document.getElementById('travel-entry-title');
    const travelDest = document.getElementById('travel-entry-dest');
    const travelDates = document.getElementById('travel-entry-dates');
    const travelSummary = document.getElementById('travel-entry-summary');
    const travelTags = document.getElementById('travel-entry-tags');
    const travelCoverInput = document.getElementById('travel-cover-input');
    const travelPhotosInput = document.getElementById('travel-photos-input');
    const travelSubmitBtn = document.getElementById('travel-submit-btn');

    // 关于我相关元素
    const cmsAboutForm = document.getElementById('cms-about-form');
    const aboutDisplayName = document.getElementById('about-display-name');
    const aboutSubtitle = document.getElementById('about-subtitle');
    const aboutBioContent = document.getElementById('about-bio-content');
    const aboutAvatarInput = document.getElementById('about-avatar-input');
    const aboutSubmitBtn = document.getElementById('about-submit-btn');
    let aboutFileSha = null;

    // 万能文件编辑器
    const rawFileSelect = document.getElementById('raw-file-select');
    const rawFileLoadBtn = document.getElementById('raw-file-load-btn');
    const rawFilePath = document.getElementById('raw-file-path');
    const rawFileContent = document.getElementById('raw-file-content');
    const rawFileCommitMsg = document.getElementById('raw-file-commit-msg');
    const rawFileSaveBtn = document.getElementById('raw-file-save-btn');
    let rawCurrentSha = null;

    // Actions 部署状态
    const actionsStatusBadge = document.getElementById('publisher-actions-status');

    // ----------------------------------------------------
    // 动态添加条目卡片
    // ----------------------------------------------------
    function createEduCard(data = {}) {
      const card = document.createElement('div');
      card.className = 'card p-3 mb-2 bg-light border';
      card.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-2">
          <strong class="text-secondary"><i class="fa-solid fa-school"></i> 教育条目</strong>
          <button type="button" class="btn btn-sm btn-outline-danger cv-item-remove-btn">&times; 删除</button>
        </div>
        <div class="row">
          <div class="col-md-4 form-group mb-2">
            <label class="small font-weight-bold">学校 / 院校名称</label>
            <input type="text" class="form-control form-control-sm edu-institution" value="${data.institution || ''}" placeholder="例如：某某大学">
          </div>
          <div class="col-md-4 form-group mb-2">
            <label class="small font-weight-bold">专业方向</label>
            <input type="text" class="form-control form-control-sm edu-area" value="${data.area || ''}" placeholder="例如：计算机科学与技术">
          </div>
          <div class="col-md-4 form-group mb-2">
            <label class="small font-weight-bold">学位 / 学历</label>
            <input type="text" class="form-control form-control-sm edu-degree" value="${data.degree || ''}" placeholder="例如：学士 / 硕士">
          </div>
        </div>
        <div class="row">
          <div class="col-md-4 form-group mb-2">
            <label class="small font-weight-bold">入学年份</label>
            <input type="text" class="form-control form-control-sm edu-start" value="${data.start_date || ''}" placeholder="例如：2020">
          </div>
          <div class="col-md-4 form-group mb-2">
            <label class="small font-weight-bold">毕业年份</label>
            <input type="text" class="form-control form-control-sm edu-end" value="${data.end_date || ''}" placeholder="例如：2024 或 至今">
          </div>
          <div class="col-md-4 form-group mb-2">
            <label class="small font-weight-bold">城市</label>
            <input type="text" class="form-control form-control-sm edu-loc" value="${data.location || ''}" placeholder="例如：北京">
          </div>
        </div>
        <div class="form-group mb-0">
          <label class="small font-weight-bold">亮点或主修课程 (以换行或逗号分隔)</label>
          <input type="text" class="form-control form-control-sm edu-highlights" value="${(data.highlights || []).join('，')}" placeholder="例如：数据结构，算法，优秀毕业生">
        </div>
      `;
      card.querySelector('.cv-item-remove-btn').addEventListener('click', () => card.remove());
      return card;
    }

    function createExpCard(data = {}) {
      const card = document.createElement('div');
      card.className = 'card p-3 mb-2 bg-light border';
      card.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-2">
          <strong class="text-secondary"><i class="fa-solid fa-briefcase"></i> 项目 / 工作条目</strong>
          <button type="button" class="btn btn-sm btn-outline-danger cv-item-remove-btn">&times; 删除</button>
        </div>
        <div class="row">
          <div class="col-md-6 form-group mb-2">
            <label class="small font-weight-bold">项目或公司名称</label>
            <input type="text" class="form-control form-control-sm exp-company" value="${data.company || ''}" placeholder="例如：HomestayManager-PWA">
          </div>
          <div class="col-md-6 form-group mb-2">
            <label class="small font-weight-bold">担任角色 / 职位</label>
            <input type="text" class="form-control form-control-sm exp-position" value="${data.position || ''}" placeholder="例如：核心开发者 / 架构师">
          </div>
        </div>
        <div class="row">
          <div class="col-md-4 form-group mb-2">
            <label class="small font-weight-bold">起始时间</label>
            <input type="text" class="form-control form-control-sm exp-start" value="${data.start_date || ''}" placeholder="例如：2026">
          </div>
          <div class="col-md-4 form-group mb-2">
            <label class="small font-weight-bold">结束时间</label>
            <input type="text" class="form-control form-control-sm exp-end" value="${data.end_date || ''}" placeholder="例如：至今">
          </div>
          <div class="col-md-4 form-group mb-2">
            <label class="small font-weight-bold">地点 / 类型</label>
            <input type="text" class="form-control form-control-sm exp-loc" value="${data.location || ''}" placeholder="例如：开源项目 / 远程">
          </div>
        </div>
        <div class="form-group mb-2">
          <label class="small font-weight-bold">项目简介</label>
          <input type="text" class="form-control form-control-sm exp-summary" value="${data.summary || ''}" placeholder="简明扼要地介绍该项目或工作内容">
        </div>
        <div class="form-group mb-0">
          <label class="small font-weight-bold">主要职责与成果亮点 (以中文逗号或英文分号分隔)</label>
          <input type="text" class="form-control form-control-sm exp-highlights" value="${(data.highlights || []).join('；')}" placeholder="职责一；职责二">
        </div>
      `;
      card.querySelector('.cv-item-remove-btn').addEventListener('click', () => card.remove());
      return card;
    }

    function createSkillCard(data = {}) {
      const card = document.createElement('div');
      card.className = 'card p-3 mb-2 bg-light border';
      card.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-2">
          <strong class="text-secondary"><i class="fa-solid fa-tags"></i> 技能分类</strong>
          <button type="button" class="btn btn-sm btn-outline-danger cv-item-remove-btn">&times; 删除</button>
        </div>
        <div class="row">
          <div class="col-md-4 form-group mb-0">
            <label class="small font-weight-bold">分类名称</label>
            <input type="text" class="form-control form-control-sm skill-name" value="${data.name || ''}" placeholder="例如：前端技术 / 工具">
          </div>
          <div class="col-md-8 form-group mb-0">
            <label class="small font-weight-bold">技能列表 (以逗号或空格分隔)</label>
            <input type="text" class="form-control form-control-sm skill-keywords" value="${(data.keywords || []).join(', ')}" placeholder="TypeScript, JavaScript, React, PWA">
          </div>
        </div>
      `;
      card.querySelector('.cv-item-remove-btn').addEventListener('click', () => card.remove());
      return card;
    }

    // ----------------------------------------------------
    // 界面与鉴权方法
    // ----------------------------------------------------
    function showAuthView() {
      authSection.hidden = false;
      mainSection.hidden = true;
    }

    async function verifyAndShowApp() {
      authStatus.textContent = '正在连接 GitHub API 验证权限...';
      authStatus.className = 'publisher-status-text publisher-status-text--loading';
      try {
        const info = await cms.verifyAuth();
        authSection.hidden = true;
        mainSection.hidden = false;
        authStatus.textContent = '';

        if (userBadge) {
          userBadge.innerHTML = `
            <img src="${info.user.avatar_url}" class="publisher-avatar" alt="${info.user.login}">
            <div class="publisher-user-info">
              <strong>${info.user.name || info.user.login}</strong>
              <small>${info.repo.full_name} (${cms.config.branch})</small>
            </div>
          `;
        }

        showToast(`欢迎回来，${info.user.name || info.user.login}！已成功连接仓库。`, 'success');
        refreshWorkflowStatus();
        loadCvContent();
        loadAboutContent();
      } catch (err) {
        authSection.hidden = false;
        mainSection.hidden = true;
        authStatus.textContent = `验证失败：${err.message}`;
        authStatus.className = 'publisher-status-text publisher-status-text--error';
        showToast(err.message, 'error');
      }
    }

    async function refreshWorkflowStatus() {
      if (!actionsStatusBadge) return;
      try {
        const runs = await cms.getWorkflowRuns(1);
        if (runs && runs.length > 0) {
          const run = runs[0];
          let statusText = '部署完成';
          let badgeClass = 'badge-success';
          if (run.status === 'in_progress' || run.status === 'queued') {
            statusText = 'GitHub Actions 正在构建部署中...';
            badgeClass = 'badge-warning';
          } else if (run.conclusion === 'failure') {
            statusText = '上次部署遇到错误';
            badgeClass = 'badge-danger';
          }
          actionsStatusBadge.innerHTML = `<a href="${run.html_url}" target="_blank" class="badge ${badgeClass}"><i class="fa-solid fa-arrows-rotate"></i> ${statusText}</a>`;
        }
      } catch (e) {
        // ignore
      }
    }

    // 加载简历内容
    async function loadCvContent() {
      if (!cmsCvForm) return;
      try {
        const file = await cms.getFile('_data/cv.yml');
        cvFileSha = file.sha;

        // 简易抽取基础字段
        const lines = file.content.split('\n');
        let currentSection = '';
        let currentItem = null;
        const education = [];
        const experience = [];
        const skills = [];

        lines.forEach(line => {
          const trimmed = line.trim();
          if (trimmed.startsWith('name:')) {
            const v = trimmed.replace('name:', '').trim().replace(/^["']|["']$/g, '');
            if (!currentSection && cvName) cvName.value = v;
          } else if (trimmed.startsWith('label:') && !currentSection && cvLabel) {
            cvLabel.value = trimmed.replace('label:', '').trim().replace(/^["']|["']$/g, '');
          } else if (trimmed.startsWith('email:') && !currentSection && cvEmail) {
            cvEmail.value = trimmed.replace('email:', '').trim().replace(/^["']|["']$/g, '');
          } else if (trimmed.startsWith('phone:') && !currentSection && cvPhone) {
            cvPhone.value = trimmed.replace('phone:', '').trim().replace(/^["']|["']$/g, '');
          } else if (trimmed.startsWith('location:') && !currentSection && cvLocation) {
            cvLocation.value = trimmed.replace('location:', '').trim().replace(/^["']|["']$/g, '');
          } else if (trimmed.startsWith('website:') && !currentSection && cvWebsite) {
            cvWebsite.value = trimmed.replace('website:', '').trim().replace(/^["']|["']$/g, '');
          } else if (trimmed.startsWith('summary:') && !currentSection && cvSummary) {
            cvSummary.value = trimmed.replace('summary:', '').trim().replace(/^["']|["']$/g, '');
          } else if (trimmed.startsWith('教育经历:')) {
            currentSection = 'edu';
          } else if (trimmed.startsWith('项目经历:')) {
            currentSection = 'exp';
          } else if (trimmed.startsWith('专业技能:')) {
            currentSection = 'skill';
          } else if (trimmed.startsWith('获奖情况:') || trimmed.startsWith('语言能力:')) {
            currentSection = 'other';
          } else if (currentSection === 'edu') {
            if (trimmed.startsWith('- institution:')) {
              currentItem = { institution: trimmed.replace('- institution:', '').trim().replace(/^["']|["']$/g, ''), highlights: [] };
              education.push(currentItem);
            } else if (currentItem) {
              if (trimmed.startsWith('degree:')) currentItem.degree = trimmed.replace('degree:', '').trim().replace(/^["']|["']$/g, '');
              else if (trimmed.startsWith('area:')) currentItem.area = trimmed.replace('area:', '').trim().replace(/^["']|["']$/g, '');
              else if (trimmed.startsWith('start_date:')) currentItem.start_date = trimmed.replace('start_date:', '').trim().replace(/^["']|["']$/g, '');
              else if (trimmed.startsWith('end_date:')) currentItem.end_date = trimmed.replace('end_date:', '').trim().replace(/^["']|["']$/g, '');
              else if (trimmed.startsWith('location:')) currentItem.location = trimmed.replace('location:', '').trim().replace(/^["']|["']$/g, '');
              else if (trimmed.startsWith('- ')) currentItem.highlights.push(trimmed.replace('- ', '').trim().replace(/^["']|["']$/g, ''));
            }
          } else if (currentSection === 'exp') {
            if (trimmed.startsWith('- company:')) {
              currentItem = { company: trimmed.replace('- company:', '').trim().replace(/^["']|["']$/g, ''), highlights: [] };
              experience.push(currentItem);
            } else if (currentItem) {
              if (trimmed.startsWith('position:')) currentItem.position = trimmed.replace('position:', '').trim().replace(/^["']|["']$/g, '');
              else if (trimmed.startsWith('start_date:')) currentItem.start_date = trimmed.replace('start_date:', '').trim().replace(/^["']|["']$/g, '');
              else if (trimmed.startsWith('end_date:')) currentItem.end_date = trimmed.replace('end_date:', '').trim().replace(/^["']|["']$/g, '');
              else if (trimmed.startsWith('location:')) currentItem.location = trimmed.replace('location:', '').trim().replace(/^["']|["']$/g, '');
              else if (trimmed.startsWith('summary:')) currentItem.summary = trimmed.replace('summary:', '').trim().replace(/^["']|["']$/g, '');
              else if (trimmed.startsWith('- ')) currentItem.highlights.push(trimmed.replace('- ', '').trim().replace(/^["']|["']$/g, ''));
            }
          } else if (currentSection === 'skill') {
            if (trimmed.startsWith('- name:')) {
              currentItem = { name: trimmed.replace('- name:', '').trim().replace(/^["']|["']$/g, ''), keywords: [] };
              skills.push(currentItem);
            } else if (currentItem && trimmed.startsWith('- ')) {
              currentItem.keywords.push(trimmed.replace('- ', '').trim().replace(/^["']|["']$/g, ''));
            }
          }
        });

        // 渲染教育经历
        if (cvEduContainer) {
          cvEduContainer.innerHTML = '';
          education.forEach(e => cvEduContainer.appendChild(createEduCard(e)));
          if (education.length === 0) cvEduContainer.appendChild(createEduCard());
        }

        // 渲染项目经历
        if (cvExpContainer) {
          cvExpContainer.innerHTML = '';
          experience.forEach(e => cvExpContainer.appendChild(createExpCard(e)));
          if (experience.length === 0) cvExpContainer.appendChild(createExpCard());
        }

        // 渲染专业技能
        if (cvSkillContainer) {
          cvSkillContainer.innerHTML = '';
          skills.forEach(s => cvSkillContainer.appendChild(createSkillCard(s)));
          if (skills.length === 0) cvSkillContainer.appendChild(createSkillCard());
        }
      } catch (e) {
        console.warn('Could not load _data/cv.yml:', e);
      }
    }

    // 加载关于我内容
    async function loadAboutContent() {
      if (!aboutBioContent) return;
      try {
        const file = await cms.getFile('_pages/about.md');
        aboutFileSha = file.sha;
        const parsed = parseFrontMatter(file.content);
        if (aboutDisplayName && parsed.data.display_name) aboutDisplayName.value = parsed.data.display_name;
        if (aboutSubtitle && parsed.data.subtitle) aboutSubtitle.value = parsed.data.subtitle;
        if (aboutBioContent) aboutBioContent.value = parsed.content;
      } catch (e) {
        console.warn('Could not load _pages/about.md:', e);
      }
    }

    // ----------------------------------------------------
    // 事件绑定
    // ----------------------------------------------------
    function bindEvents() {
      // 登录表单
      authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = tokenInput.value.trim();
        const owner = ownerInput.value.trim() || 'suihan-shu';
        const repo = repoInput.value.trim() || 'MyPage-suihan';
        const branch = branchInput.value.trim() || 'main';

        if (!token) {
          showToast('请输入 GitHub Personal Access Token', 'error');
          return;
        }

        cms.saveConfig({ token, owner, repo, branch });
        await verifyAndShowApp();
      });

      // 退出登录
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          if (confirm('确定要退出当前登录并清除本地 Token 吗？')) {
            cms.clearConfig();
            tokenInput.value = '';
            showAuthView();
            showToast('已退出登录并清除本地凭证。', 'info');
          }
        });
      }

      // 选项卡切换
      tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const targetTab = btn.getAttribute('data-publisher-tab');
          tabButtons.forEach(b => b.classList.remove('active'));
          tabPanes.forEach(p => p.classList.remove('active'));
          btn.classList.add('active');
          const pane = document.getElementById(`pane-${targetTab}`);
          if (pane) pane.classList.add('active');
        });
      });

      // 简历动态添加条目
      if (cvAddEduBtn && cvEduContainer) {
        cvAddEduBtn.addEventListener('click', () => {
          cvEduContainer.appendChild(createEduCard());
        });
      }
      if (cvAddExpBtn && cvExpContainer) {
        cvAddExpBtn.addEventListener('click', () => {
          cvExpContainer.appendChild(createExpCard());
        });
      }
      if (cvAddSkillBtn && cvSkillContainer) {
        cvAddSkillBtn.addEventListener('click', () => {
          cvSkillContainer.appendChild(createSkillCard());
        });
      }

      // 简历保存
      if (cmsCvForm) {
        cmsCvForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          cvSubmitBtn.disabled = true;
          cvSubmitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 正在保存简历...';

          try {
            // 收集教育经历
            const education = [];
            document.querySelectorAll('#cv-edu-container .card').forEach(card => {
              const inst = card.querySelector('.edu-institution')?.value.trim();
              if (inst) {
                const hl = (card.querySelector('.edu-highlights')?.value || '').split(/[,，\n]+/).map(s => s.trim()).filter(Boolean);
                education.push({
                  institution: inst,
                  area: card.querySelector('.edu-area')?.value.trim() || '',
                  degree: card.querySelector('.edu-degree')?.value.trim() || '',
                  start_date: card.querySelector('.edu-start')?.value.trim() || '',
                  end_date: card.querySelector('.edu-end')?.value.trim() || '',
                  location: card.querySelector('.edu-loc')?.value.trim() || '',
                  highlights: hl
                });
              }
            });

            // 收集项目经历
            const experience = [];
            document.querySelectorAll('#cv-exp-container .card').forEach(card => {
              const comp = card.querySelector('.exp-company')?.value.trim();
              if (comp) {
                const hl = (card.querySelector('.exp-highlights')?.value || '').split(/[;；\n]+/).map(s => s.trim()).filter(Boolean);
                experience.push({
                  company: comp,
                  position: card.querySelector('.exp-position')?.value.trim() || '',
                  start_date: card.querySelector('.exp-start')?.value.trim() || '',
                  end_date: card.querySelector('.exp-end')?.value.trim() || '',
                  location: card.querySelector('.exp-loc')?.value.trim() || '',
                  summary: card.querySelector('.exp-summary')?.value.trim() || '',
                  highlights: hl
                });
              }
            });

            // 收集技能
            const skills = [];
            document.querySelectorAll('#cv-skill-container .card').forEach(card => {
              const skName = card.querySelector('.skill-name')?.value.trim();
              if (skName) {
                const kws = (card.querySelector('.skill-keywords')?.value || '').split(/[,，\s]+/).map(s => s.trim()).filter(Boolean);
                skills.push({
                  name: skName,
                  keywords: kws
                });
              }
            });

            const cvData = {
              name: cvName ? cvName.value.trim() : '',
              label: cvLabel ? cvLabel.value.trim() : '',
              email: cvEmail ? cvEmail.value.trim() : '',
              phone: cvPhone ? cvPhone.value.trim() : '',
              location: cvLocation ? cvLocation.value.trim() : '',
              summary: cvSummary ? cvSummary.value.trim() : '',
              education,
              experience,
              skills
            };

            const yamlContent = YAMLHelper.stringifyCV(cvData);
            await cms.putFile('_data/cv.yml', yamlContent, 'Update resume cv.yml', cvFileSha);

            showToast('简历已成功保存并提交到 GitHub！', 'success');
            refreshWorkflowStatus();
          } catch (err) {
            showToast(`简历保存失败: ${err.message}`, 'error');
          } finally {
            cvSubmitBtn.disabled = false;
            cvSubmitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> 保存并更新简历到 GitHub';
          }
        });
      }

      // 旅行日志：提交
      if (cmsTravelForm) {
        cmsTravelForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const title = travelTitle.value.trim();
          const dest = travelDest.value.trim();
          const dates = travelDates.value.trim();
          const summary = travelSummary.value.trim();
          const tags = travelTags.value.split(/[,，\s]+/).filter(Boolean);

          if (!title || !dest) {
            showToast('请填写旅行标题与目的地', 'error');
            return;
          }

          travelSubmitBtn.disabled = true;
          travelSubmitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 正在处理旅行记录...';

          try {
            let coverImgUrl = '';
            if (travelCoverInput && travelCoverInput.files && travelCoverInput.files[0]) {
              const file = travelCoverInput.files[0];
              const ext = file.name.split('.').pop() || 'jpg';
              const filename = `travel-cover-${Date.now()}.${ext}`;
              const path = `assets/img/travel/${filename}`;
              await cms.uploadBinary(path, file, `Upload travel cover: ${filename}`);
              coverImgUrl = `/${path}`;
            }

            const photoUrls = [];
            if (travelPhotosInput && travelPhotosInput.files && travelPhotosInput.files.length) {
              const files = Array.from(travelPhotosInput.files);
              for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const ext = file.name.split('.').pop() || 'jpg';
                const filename = `travel-photo-${Date.now()}-${i + 1}.${ext}`;
                const path = `assets/img/travel/${filename}`;
                await cms.uploadBinary(path, file, `Upload travel photo: ${filename}`);
                photoUrls.push(`/${path}`);
              }
            }

            let travelData = { password: '', entries: [] };
            let sha = null;
            try {
              const file = await cms.getFile('_data/travel.yml');
              sha = file.sha;
              travelData = parseTravelYaml(file.content);
            } catch (err) {
              console.log('Creating new _data/travel.yml');
            }

            const newEntry = {
              id: `trip-${Date.now()}`,
              title: title,
              destination: dest,
              date_range: dates,
              summary: summary,
              cover_image: coverImgUrl,
              tags: tags,
              photos: photoUrls
            };

            travelData.entries.unshift(newEntry);

            const newYaml = YAMLHelper.stringifyTravel(travelData.password, travelData.entries);
            await cms.putFile('_data/travel.yml', newYaml, `Add travel log: ${title}`, sha);

            showToast('旅行日志已添加并更新到 _data/travel.yml！', 'success');
            cmsTravelForm.reset();
            refreshWorkflowStatus();
          } catch (err) {
            showToast(`旅行日志保存失败: ${err.message}`, 'error');
          } finally {
            travelSubmitBtn.disabled = false;
            travelSubmitBtn.innerHTML = '<i class="fa-solid fa-route"></i> 保存并添加到旅行日志';
          }
        });
      }

      // 关于我：提交修改
      if (cmsAboutForm) {
        cmsAboutForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          aboutSubmitBtn.disabled = true;
          aboutSubmitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 正在更新个人简介...';

          try {
            // 上传新头像（如有选择）
            if (aboutAvatarInput && aboutAvatarInput.files && aboutAvatarInput.files[0]) {
              const file = aboutAvatarInput.files[0];
              await cms.uploadBinary('assets/img/profile.jpg', file, 'Update profile avatar');
              showToast('头像照片已更新！', 'info');
            }

            // 读取最新 _pages/about.md
            const file = await cms.getFile('_pages/about.md');
            const parsed = parseFrontMatter(file.content);

            const name = aboutDisplayName.value.trim() || '何岁寒';
            const subtitle = aboutSubtitle.value.trim() || '';
            const bio = aboutBioContent.value;

            // 重新组装 Front Matter
            let newYaml = parsed.rawYaml || '';
            if (newYaml.includes('display_name:')) {
              newYaml = newYaml.replace(/display_name:.*(\r?\n|$)/, `display_name: ${JSON.stringify(name)}\n`);
            } else {
              newYaml += `display_name: ${JSON.stringify(name)}\n`;
            }
            if (newYaml.includes('subtitle:')) {
              newYaml = newYaml.replace(/subtitle:.*(\r?\n|$)/, `subtitle: ${JSON.stringify(subtitle)}\n`);
            } else {
              newYaml += `subtitle: ${JSON.stringify(subtitle)}\n`;
            }

            const updatedContent = `---\n${newYaml.trim()}\n---\n\n${bio.trim()}\n`;
            await cms.putFile('_pages/about.md', updatedContent, 'Update about profile and bio', file.sha);

            showToast('个人简介与主页内容已成功更新！', 'success');
            refreshWorkflowStatus();
          } catch (err) {
            showToast(`更新失败: ${err.message}`, 'error');
          } finally {
            aboutSubmitBtn.disabled = false;
            aboutSubmitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> 保存并更新个人简介';
          }
        });
      }

      // 万能文件编辑器
      if (rawFileSelect) {
        rawFileSelect.addEventListener('change', () => {
          if (rawFilePath) {
            rawFilePath.value = rawFileSelect.value;
          }
        });
      }

      if (rawFileLoadBtn) {
        rawFileLoadBtn.addEventListener('click', async () => {
          const path = rawFilePath ? rawFilePath.value.trim() : (rawFileSelect ? rawFileSelect.value : '');
          if (!path) {
            showToast('请选择或输入要编辑的文件路径', 'error');
            return;
          }
          rawFileLoadBtn.disabled = true;
          rawFileLoadBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 加载中...';
          try {
            const file = await cms.getFile(path);
            rawCurrentSha = file.sha;
            if (rawFilePath) rawFilePath.value = file.path;
            if (rawFileContent) rawFileContent.value = file.content;
            if (rawFileCommitMsg) rawFileCommitMsg.value = `Update ${file.path}`;
            showToast(`已载入文件 ${file.path}，编辑后点击下方提交保存即可。`, 'success');
          } catch (err) {
            showToast(`加载文件失败: ${err.message}`, 'error');
          } finally {
            rawFileLoadBtn.disabled = false;
            rawFileLoadBtn.innerHTML = '<i class="fa-solid fa-download"></i> 读取文件';
          }
        });
      }

      if (rawFileSaveBtn) {
        rawFileSaveBtn.addEventListener('click', async () => {
          const path = rawFilePath.value.trim();
          const content = rawFileContent.value;
          const msg = rawFileCommitMsg.value.trim() || `Update ${path}`;

          if (!path) {
            showToast('请填写文件路径', 'error');
            return;
          }

          rawFileSaveBtn.disabled = true;
          rawFileSaveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 正在提交...';

          try {
            await cms.putFile(path, content, msg, rawCurrentSha);
            showToast(`文件 ${path} 已成功提交到 GitHub！`, 'success');
            refreshWorkflowStatus();
          } catch (err) {
            showToast(`提交失败: ${err.message}`, 'error');
          } finally {
            rawFileSaveBtn.disabled = false;
            rawFileSaveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> 提交修改并保存';
          }
        });
      }
    }

    // ----------------------------------------------------
    // 初始化执行
    // ----------------------------------------------------
    function init() {
      const config = cms.config;
      if (tokenInput) tokenInput.value = config.token || '';
      if (ownerInput) ownerInput.value = config.owner || 'suihan-shu';
      if (repoInput) repoInput.value = config.repo || 'MyPage-suihan';
      if (branchInput) branchInput.value = config.branch || 'main';

      bindEvents();

      if (cms.isConfigured()) {
        verifyAndShowApp();
      } else {
        showAuthView();
      }
    }

    init();
  });
})();
