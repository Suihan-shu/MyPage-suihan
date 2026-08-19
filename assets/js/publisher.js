/**
 * Site Content CMS UI Controller
 * 个人专用主页内容与图片管理后台控制逻辑
 */

(function () {
  'use strict';

  // 辅助 YAML 解析与序列化（轻量无依赖实现）
  const YAMLHelper = {
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
