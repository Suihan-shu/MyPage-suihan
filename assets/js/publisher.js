/**
 * Site Content CMS UI Controller
 * 个人专用主页内容、简历与图片管理后台控制逻辑
 */

(function () {
  'use strict';

  const { parse: parseYaml, dump: dumpYaml, escapeHtml } = window.CMSData;

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
      yaml += `  location: ${JSON.stringify(cvData.location || '')}\n`;
      yaml += `  description: ${JSON.stringify(cvData.description || '')}\n\n`;
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

      // 获奖经历
      yaml += `\n    获奖经历:\n`;
      if (!cvData.awards || cvData.awards.length === 0) {
        yaml += `      []\n`;
      } else {
        cvData.awards.forEach(aw => {
          yaml += `      - title: ${JSON.stringify(aw.title || '')}\n`;
          if (aw.awarder) yaml += `        awarder: ${JSON.stringify(aw.awarder)}\n`;
          if (aw.date) yaml += `        date: ${JSON.stringify(aw.date)}\n`;
          if (aw.summary) yaml += `        summary: ${JSON.stringify(aw.summary)}\n`;
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

      // 兴趣爱好
      yaml += `\n    兴趣爱好:\n`;
      if (!cvData.interests || cvData.interests.length === 0) {
        yaml += `      []\n`;
      } else {
        cvData.interests.forEach(it => {
          yaml += `      - name: ${JSON.stringify(it.name || '')}\n`;
          if (it.keywords && it.keywords.length) {
            yaml += `        keywords:\n`;
            it.keywords.forEach(k => yaml += `          - ${JSON.stringify(k)}\n`);
          }
        });
      }

      // 语言能力
      yaml += `\n    语言能力:\n`;
      if (!cvData.languages || cvData.languages.length === 0) {
        yaml += `      []\n`;
      } else {
        cvData.languages.forEach(lang => {
          yaml += `      - name: ${JSON.stringify(lang.name || '')}\n`;
          if (lang.summary) yaml += `        summary: ${JSON.stringify(lang.summary)}\n`;
        });
      }

      return yaml;
    },

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
    toast.innerHTML = `<i class="fa-solid ${icon}"></i><span></span>`;
    toast.querySelector("span").textContent = msg;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('publisher-toast--show');
    }, 10);
    setTimeout(() => {
      toast.classList.remove('publisher-toast--show');
      setTimeout(() => toast.remove(), 300);
    }, 3800);
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

    const data = parseYaml(rawYaml) || {};

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
    const cvDesc = document.getElementById('cv-desc');
    const cvSummary = document.getElementById('cv-summary');
    const cvEduContainer = document.getElementById('cv-edu-container');
    const cvExpContainer = document.getElementById('cv-exp-container');
    const cvAwardContainer = document.getElementById('cv-award-container');
    const cvSkillContainer = document.getElementById('cv-skill-container');
    const cvInterestContainer = document.getElementById('cv-interest-container');
    const cvLangContainer = document.getElementById('cv-lang-container');
    const cvAddEduBtn = document.getElementById('cv-add-edu-btn');
    const cvAddExpBtn = document.getElementById('cv-add-exp-btn');
    const cvAddAwardBtn = document.getElementById('cv-add-award-btn');
    const cvAddSkillBtn = document.getElementById('cv-add-skill-btn');
    const cvAddInterestBtn = document.getElementById('cv-add-interest-btn');
    const cvAddLangBtn = document.getElementById('cv-add-lang-btn');
    const cvSubmitBtn = document.getElementById('cv-submit-btn');
    let cvFileSha = null;
    let cvDocument = null;

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
    const travelManager = window.TravelCMS.create({ cms, app: appEl, notify: showToast, onSaved: refreshWorkflowStatus });

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
            <input type="text" class="form-control form-control-sm edu-institution" value="${escapeHtml(data.institution || '')}" placeholder="例如：某某大学">
          </div>
          <div class="col-md-4 form-group mb-2">
            <label class="small font-weight-bold">专业方向</label>
            <input type="text" class="form-control form-control-sm edu-area" value="${escapeHtml(data.area || '')}" placeholder="例如：计算机科学与技术">
          </div>
          <div class="col-md-4 form-group mb-2">
            <label class="small font-weight-bold">学位 / 学历</label>
            <input type="text" class="form-control form-control-sm edu-degree" value="${escapeHtml(data.degree || '')}" placeholder="例如：学士 / 硕士">
          </div>
        </div>
        <div class="row">
          <div class="col-md-4 form-group mb-2">
            <label class="small font-weight-bold">入学年份</label>
            <input type="text" class="form-control form-control-sm edu-start" value="${escapeHtml(data.start_date || '')}" placeholder="例如：2020">
          </div>
          <div class="col-md-4 form-group mb-2">
            <label class="small font-weight-bold">毕业年份</label>
            <input type="text" class="form-control form-control-sm edu-end" value="${escapeHtml(data.end_date || '')}" placeholder="例如：2024 或 至今">
          </div>
          <div class="col-md-4 form-group mb-2">
            <label class="small font-weight-bold">城市</label>
            <input type="text" class="form-control form-control-sm edu-loc" value="${escapeHtml(data.location || '')}" placeholder="例如：北京">
          </div>
        </div>
        <div class="form-group mb-0">
          <label class="small font-weight-bold">亮点或主修课程 (以换行或逗号分隔)</label>
          <input type="text" class="form-control form-control-sm edu-highlights" value="${escapeHtml((data.highlights || []).join('，'))}" placeholder="例如：数据结构，算法，优秀毕业生">
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
            <input type="text" class="form-control form-control-sm exp-company" value="${escapeHtml(data.company || '')}" placeholder="例如：HomestayManager-PWA">
          </div>
          <div class="col-md-6 form-group mb-2">
            <label class="small font-weight-bold">担任角色 / 职位</label>
            <input type="text" class="form-control form-control-sm exp-position" value="${escapeHtml(data.position || '')}" placeholder="例如：核心开发者 / 架构师">
          </div>
        </div>
        <div class="row">
          <div class="col-md-4 form-group mb-2">
            <label class="small font-weight-bold">起始时间</label>
            <input type="text" class="form-control form-control-sm exp-start" value="${escapeHtml(data.start_date || '')}" placeholder="例如：2026">
          </div>
          <div class="col-md-4 form-group mb-2">
            <label class="small font-weight-bold">结束时间</label>
            <input type="text" class="form-control form-control-sm exp-end" value="${escapeHtml(data.end_date || '')}" placeholder="例如：至今">
          </div>
          <div class="col-md-4 form-group mb-2">
            <label class="small font-weight-bold">地点 / 类型</label>
            <input type="text" class="form-control form-control-sm exp-loc" value="${escapeHtml(data.location || '')}" placeholder="例如：开源项目 / 远程">
          </div>
        </div>
        <div class="form-group mb-2">
          <label class="small font-weight-bold">项目简介</label>
          <input type="text" class="form-control form-control-sm exp-summary" value="${escapeHtml(data.summary || '')}" placeholder="简明扼要地介绍该项目或工作内容">
        </div>
        <div class="form-group mb-0">
          <label class="small font-weight-bold">主要职责与成果亮点 (以中文逗号或英文分号分隔)</label>
          <input type="text" class="form-control form-control-sm exp-highlights" value="${escapeHtml((data.highlights || []).join('；'))}" placeholder="职责一；职责二">
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
            <input type="text" class="form-control form-control-sm skill-name" value="${escapeHtml(data.name || '')}" placeholder="例如：前端技术 / 工具">
          </div>
          <div class="col-md-8 form-group mb-0">
            <label class="small font-weight-bold">技能列表 (以逗号或空格分隔)</label>
            <input type="text" class="form-control form-control-sm skill-keywords" value="${escapeHtml(Array.isArray(data.keywords) ? data.keywords.join(', ') : (data.keywords || ''))}" placeholder="TypeScript, JavaScript, React, PWA">
          </div>
        </div>
      `;
      card.querySelector('.cv-item-remove-btn').addEventListener('click', () => card.remove());
      return card;
    }

    function createAwardCard(data = {}) {
      const card = document.createElement('div');
      card.className = 'card p-3 mb-2 bg-light border';
      card.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-2">
          <strong class="text-secondary"><i class="fa-solid fa-trophy text-warning"></i> 获奖条目</strong>
          <button type="button" class="btn btn-sm btn-outline-danger cv-item-remove-btn">&times; 删除</button>
        </div>
        <div class="row">
          <div class="col-md-5 form-group mb-2">
            <label class="small font-weight-bold">奖项 / 荣誉名称</label>
            <input type="text" class="form-control form-control-sm award-title" value="${escapeHtml(data.title || data.name || '')}" placeholder="例如：研究生一等奖学金 / 竞赛一等奖">
          </div>
          <div class="col-md-4 form-group mb-2">
            <label class="small font-weight-bold">颁发单位 / 机构 / 赛事</label>
            <input type="text" class="form-control form-control-sm award-awarder" value="${escapeHtml(data.awarder || data.institution || '')}" placeholder="例如：西北工业大学">
          </div>
          <div class="col-md-3 form-group mb-2">
            <label class="small font-weight-bold">获奖时间 / 年份</label>
            <input type="text" class="form-control form-control-sm award-date" value="${escapeHtml(data.date || data.year || '')}" placeholder="例如：2025">
          </div>
        </div>
        <div class="form-group mb-0">
          <label class="small font-weight-bold">说明 / 获奖详情 (可选)</label>
          <input type="text" class="form-control form-control-sm award-summary" value="${escapeHtml(data.summary || '')}" placeholder="例如：专业成绩前 5% / 团队负责人">
        </div>
      `;
      card.querySelector('.cv-item-remove-btn').addEventListener('click', () => card.remove());
      return card;
    }

    function createInterestCard(data = {}) {
      const card = document.createElement('div');
      card.className = 'card p-3 mb-2 bg-light border';
      card.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-2">
          <strong class="text-secondary"><i class="fa-solid fa-heart text-danger"></i> 兴趣分类</strong>
          <button type="button" class="btn btn-sm btn-outline-danger cv-item-remove-btn">&times; 删除</button>
        </div>
        <div class="row">
          <div class="col-md-4 form-group mb-0">
            <label class="small font-weight-bold">分类名称</label>
            <input type="text" class="form-control form-control-sm interest-name" value="${escapeHtml(data.name || '')}" placeholder="例如：运动与户外">
          </div>
          <div class="col-md-8 form-group mb-0">
            <label class="small font-weight-bold">爱好列表 (以逗号或空格分隔)</label>
            <input type="text" class="form-control form-control-sm interest-keywords" value="${escapeHtml(Array.isArray(data.keywords) ? data.keywords.join(', ') : (data.keywords || ''))}" placeholder="例如：徒步, 跑步, 羽毛球">
          </div>
        </div>
      `;
      card.querySelector('.cv-item-remove-btn').addEventListener('click', () => card.remove());
      return card;
    }

    function createLangCard(data = {}) {
      const card = document.createElement('div');
      card.className = 'card p-3 mb-2 bg-light border';
      card.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-2">
          <strong class="text-secondary"><i class="fa-solid fa-language text-info"></i> 语言能力</strong>
          <button type="button" class="btn btn-sm btn-outline-danger cv-item-remove-btn">&times; 删除</button>
        </div>
        <div class="row">
          <div class="col-md-4 form-group mb-0">
            <label class="small font-weight-bold">语言名称</label>
            <input type="text" class="form-control form-control-sm lang-name" value="${escapeHtml(data.name || '')}" placeholder="例如：英语">
          </div>
          <div class="col-md-8 form-group mb-0">
            <label class="small font-weight-bold">水平说明 / 考试分数</label>
            <input type="text" class="form-control form-control-sm lang-summary" value="${escapeHtml(data.summary || '')}" placeholder="例如：CET-4: 512, CET-6: 435">
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
            <img src="${escapeHtml(info.user.avatar_url)}" class="publisher-avatar" alt="${escapeHtml(info.user.login)}">
            <div class="publisher-user-info">
              <strong>${escapeHtml(info.user.name || info.user.login)}</strong>
              <small>${escapeHtml(info.repo.full_name)} (${escapeHtml(cms.config.branch)})</small>
            </div>
          `;
        }

        showToast(`欢迎回来，${info.user.name || info.user.login}！已成功连接仓库。`, 'success');
        refreshWorkflowStatus();
        loadCvContent();
        loadAboutContent();
        travelManager.load();
        return true;
      } catch (err) {
        authSection.hidden = false;
        mainSection.hidden = true;
        authStatus.textContent = `验证失败：${err.message}`;
        authStatus.className = 'publisher-status-text publisher-status-text--error';
        showToast(err.message, 'error');
        return false;
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

        cvDocument = parseYaml(file.content);
        const data = cvDocument?.cv;
        if (!data || typeof data !== 'object') throw new Error('简历 YAML 缺少 cv 对象。');
        const fields = { name: cvName, label: cvLabel, email: cvEmail, phone: cvPhone,
          location: cvLocation, description: cvDesc, summary: cvSummary };
        Object.entries(fields).forEach(([key, input]) => {
          if (input) input.value = data[key] ?? '';
        });
        const sections = data.sections || {};
        const list = key => Array.isArray(sections[key]) ? sections[key] : [];
        const education = list('教育经历');
        const experience = list('项目经历');
        const awards = sections['获奖经历'] ? list('获奖经历') : list('获奖情况');
        const skills = list('专业技能');
        const interests = list('兴趣爱好');
        const languages = list('语言能力');

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

        // 渲染获奖经历
        if (cvAwardContainer) {
          cvAwardContainer.innerHTML = '';
          awards.forEach(a => cvAwardContainer.appendChild(createAwardCard(a)));
          if (awards.length === 0) cvAwardContainer.appendChild(createAwardCard());
        }

        // 渲染专业技能
        if (cvSkillContainer) {
          cvSkillContainer.innerHTML = '';
          skills.forEach(s => cvSkillContainer.appendChild(createSkillCard(s)));
          if (skills.length === 0) cvSkillContainer.appendChild(createSkillCard());
        }

        // 渲染兴趣爱好
        if (cvInterestContainer) {
          cvInterestContainer.innerHTML = '';
          interests.forEach(it => cvInterestContainer.appendChild(createInterestCard(it)));
          if (interests.length === 0) cvInterestContainer.appendChild(createInterestCard());
        }

        // 渲染语言能力
        if (cvLangContainer) {
          cvLangContainer.innerHTML = '';
          languages.forEach(l => cvLangContainer.appendChild(createLangCard(l)));
          if (languages.length === 0) cvLangContainer.appendChild(createLangCard());
        }
      } catch (e) {
        cvFileSha = null;
        cvDocument = null;
        showToast('简历读取失败，请重新登录后再保存：' + e.message, 'error');
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
      const tokenToggle = document.getElementById('github-token-toggle');
      tokenToggle.addEventListener('click', () => {
        const visible = tokenInput.classList.toggle('is-visible');
        tokenToggle.setAttribute('aria-pressed', String(visible));
        tokenToggle.textContent = visible ? '隐藏 Token' : '显示 Token';
      });
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

        // Only persist a new credential after GitHub accepts it. Autofill mistakes
        // must not replace a previously working token in localStorage.
        const previousConfig = { ...cms.config };
        cms.config = { ...cms.config, token, owner, repo, branch };
        if (await verifyAndShowApp()) { cms.saveConfig(cms.config); tokenInput.value = ''; }
        else cms.config = previousConfig;
      });

      // 退出登录
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          if (travelManager.isBusy()) { showToast('正在保存动态，请稍候再退出。', 'info'); return; }
          if (confirm('退出会清除本地 Token 和未保存的旅行编辑，继续吗？')) {
            travelManager.reset();
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
      if (cvAddAwardBtn && cvAwardContainer) {
        cvAddAwardBtn.addEventListener('click', () => {
          cvAwardContainer.appendChild(createAwardCard());
        });
      }
      if (cvAddSkillBtn && cvSkillContainer) {
        cvAddSkillBtn.addEventListener('click', () => {
          cvSkillContainer.appendChild(createSkillCard());
        });
      }
      if (cvAddInterestBtn && cvInterestContainer) {
        cvAddInterestBtn.addEventListener('click', () => {
          cvInterestContainer.appendChild(createInterestCard());
        });
      }
      if (cvAddLangBtn && cvLangContainer) {
        cvAddLangBtn.addEventListener('click', () => {
          cvLangContainer.appendChild(createLangCard());
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

            // 收集获奖经历
            const awards = [];
            document.querySelectorAll('#cv-award-container .card').forEach(card => {
              const tit = card.querySelector('.award-title')?.value.trim();
              if (tit) {
                awards.push({
                  title: tit,
                  awarder: card.querySelector('.award-awarder')?.value.trim() || '',
                  date: card.querySelector('.award-date')?.value.trim() || '',
                  summary: card.querySelector('.award-summary')?.value.trim() || ''
                });
              }
            });

            // 收集专业技能
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

            // 收集兴趣爱好
            const interests = [];
            document.querySelectorAll('#cv-interest-container .card').forEach(card => {
              const itName = card.querySelector('.interest-name')?.value.trim();
              if (itName) {
                const kws = (card.querySelector('.interest-keywords')?.value || '').split(/[,，\s]+/).map(s => s.trim()).filter(Boolean);
                interests.push({
                  name: itName,
                  keywords: kws
                });
              }
            });

            // 收集语言能力
            const languages = [];
            document.querySelectorAll('#cv-lang-container .card').forEach(card => {
              const lName = card.querySelector('.lang-name')?.value.trim();
              if (lName) {
                languages.push({
                  name: lName,
                  summary: card.querySelector('.lang-summary')?.value.trim() || ''
                });
              }
            });

            const cvData = {
              name: cvName ? cvName.value.trim() : '',
              label: cvLabel ? cvLabel.value.trim() : '',
              email: cvEmail ? cvEmail.value.trim() : '',
              phone: cvPhone ? cvPhone.value.trim() : '',
              location: cvLocation ? cvLocation.value.trim() : '',
              description: cvDesc ? cvDesc.value.trim() : '',
              summary: cvSummary ? cvSummary.value.trim() : '',
              education,
              experience,
              awards,
              skills,
              interests,
              languages
            };

            if (!cvDocument || !cvFileSha) throw new Error('请等待简历成功读取后再保存。');
            const edited = parseYaml(YAMLHelper.stringifyCV(cvData));
            const updated = { ...cvDocument, cv: { ...cvDocument.cv, ...edited.cv,
              sections: { ...cvDocument.cv.sections, ...edited.cv.sections } } };
            // Replace a legacy awards section instead of displaying two copies.
            if (!cvDocument.cv.sections?.['获奖经历'] && cvDocument.cv.sections?.['获奖情况']) {
              updated.cv.sections['获奖情况'] = edited.cv.sections['获奖经历'];
              delete updated.cv.sections['获奖经历'];
            }
            const yamlContent = dumpYaml(updated);
            const saved = await cms.putFile('_data/cv.yml', yamlContent, 'Update resume cv.yml', cvFileSha);
            cvFileSha = saved.content.sha;
            cvDocument = updated;

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
      if (tokenInput) tokenInput.value = '';
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
