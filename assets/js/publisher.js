/**
 * Publisher UI Controller
 * 个人专用在线发布与管理后台控制逻辑
 */

(function () {
  'use strict';

  // 辅助 YAML 解析与序列化（轻量无依赖实现）
  const YAMLHelper = {
    // 格式化 Moments 列表为 YAML 字符串
    stringifyMoments(entries) {
      if (!entries || entries.length === 0) {
        return '# Dynamic moments data file\n[]\n';
      }
      let yaml = '# Dynamic moments data file\n';
      entries.forEach(item => {
        yaml += `- id: "${item.id || ''}"\n`;
        yaml += `  date: "${item.date || ''}"\n`;
        // 多行 content 转义
        const content = (item.content || '').replace(/\r\n/g, '\n');
        if (content.includes('\n')) {
          yaml += `  content: >-\n`;
          content.split('\n').forEach(line => {
            yaml += `    ${line}\n`;
          });
        } else {
          yaml += `  content: ${JSON.stringify(content)}\n`;
        }
        if (item.location) {
          yaml += `  location: ${JSON.stringify(item.location)}\n`;
        }
        if (item.tags && item.tags.length > 0) {
          yaml += `  tags:\n`;
          item.tags.forEach(t => {
            yaml += `    - ${JSON.stringify(t)}\n`;
          });
        } else {
          yaml += `  tags: []\n`;
        }
        if (item.images && item.images.length > 0) {
          yaml += `  images:\n`;
          item.images.forEach(img => {
            yaml += `    - ${JSON.stringify(img)}\n`;
          });
        } else {
          yaml += `  images: []\n`;
        }
        yaml += '\n';
      });
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

  // 轻量 Markdown 渲染器（用于实时预览）
  function renderMarkdown(md) {
    if (!md) return '';
    let html = md
      // 转义原生 HTML 特殊字符
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // 标题
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // 粗体、斜体、删除线
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/~~(.*?)~~/gim, '<del>$1</del>')
      // 引用
      .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      // 代码块与行内代码
      .replace(/```([a-z]*)\n([\s\S]*?)```/gim, '<pre><code>$2</code></pre>')
      .replace(/`([^`]+)`/gim, '<code>$1</code>')
      // 图片与链接
      .replace(/!\[([^\]]*)\]\((.*?)\)/gim, '<img alt="$1" src="$2" class="img-fluid rounded my-2" />')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // 无序列表
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      // 换行段落
      .replace(/\n\n+/gim, '</p><p>')
      .replace(/\n/gim, '<br>');
    return `<p>${html}</p>`;
  }

  // 格式化当前时间为 YYYY-MM-DD HH:mm:ss
  function formatDateTime(d = new Date()) {
    const pad = n => String(n).padStart(2, '0');
    const YYYY = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const DD = pad(d.getDate());
    const HH = pad(d.getHours());
    const mm = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    return `${YYYY}-${MM}-${DD} ${HH}:${mm}:${ss}`;
  }

  function formatDateOnly(d = new Date()) {
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

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

    // 动态相关元素
    const momentForm = document.getElementById('moment-publish-form');
    const momentContent = document.getElementById('moment-content');
    const momentTags = document.getElementById('moment-tags');
    const momentLocation = document.getElementById('moment-location');
    const momentDateTime = document.getElementById('moment-datetime');
    const momentPhotoInput = document.getElementById('moment-photo-input');
    const momentPhotoDropzone = document.getElementById('moment-photo-dropzone');
    const momentPhotoPreview = document.getElementById('moment-photo-preview');
    const momentSubmitBtn = document.getElementById('moment-submit-btn');
    let selectedMomentFiles = [];

    // 博客相关元素
    const blogForm = document.getElementById('blog-post-form');
    const blogTitle = document.getElementById('blog-title');
    const blogSlug = document.getElementById('blog-slug');
    const blogDate = document.getElementById('blog-date');
    const blogDesc = document.getElementById('blog-desc');
    const blogCategories = document.getElementById('blog-categories');
    const blogTags = document.getElementById('blog-tags');
    const blogContent = document.getElementById('blog-content');
    const blogPreview = document.getElementById('blog-preview-body');
    const blogSubmitBtn = document.getElementById('blog-submit-btn');
    const blogPostList = document.getElementById('blog-post-list');
    const blogReloadListBtn = document.getElementById('blog-reload-list-btn');
    const blogCurrentSha = document.getElementById('blog-current-sha');
    const blogOriginalPath = document.getElementById('blog-original-path');
    const blogResetBtn = document.getElementById('blog-reset-btn');

    // 内容修改相关元素
    const cmsTravelForm = document.getElementById('cms-travel-form');
    const travelTitle = document.getElementById('travel-entry-title');
    const travelDest = document.getElementById('travel-entry-dest');
    const travelDates = document.getElementById('travel-entry-dates');
    const travelSummary = document.getElementById('travel-entry-summary');
    const travelTags = document.getElementById('travel-entry-tags');
    const travelCoverInput = document.getElementById('travel-cover-input');
    const travelPhotosInput = document.getElementById('travel-photos-input');
    const travelSubmitBtn = document.getElementById('travel-submit-btn');

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

    // 初始化界面
    function init() {
      // 填充已存配置
      const config = cms.config;
      tokenInput.value = config.token || '';
      ownerInput.value = config.owner || 'suihan-shu';
      repoInput.value = config.repo || 'MyPage-suihan';
      branchInput.value = config.branch || 'main';

      if (momentDateTime) {
        momentDateTime.value = formatDateTime();
      }
      if (blogDate) {
        blogDate.value = formatDateTime();
      }

      if (cms.isConfigured()) {
        verifyAndShowApp();
      } else {
        showAuthView();
      }

      bindEvents();
    }

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
        loadExistingPosts();
      } catch (err) {
        authSection.hidden = false;
        mainSection.hidden = true;
        authStatus.textContent = `验证失败：${err.message}`;
        authStatus.className = 'publisher-status-text publisher-status-text--error';
        showToast(err.message, 'error');
      }
    }

    // 绑定事件
    function bindEvents() {
      // 登录保存
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

      // ----------------- 动态发布逻辑 -----------------
      // 快捷 Tag 标签点击
      document.querySelectorAll('.moment-quick-tag').forEach(tagEl => {
        tagEl.addEventListener('click', () => {
          const tag = tagEl.getAttribute('data-tag');
          const current = momentTags.value.trim();
          if (!current) {
            momentTags.value = tag;
          } else {
            const tags = current.split(/[,，\s]+/).filter(Boolean);
            if (!tags.includes(tag)) {
              tags.push(tag);
              momentTags.value = tags.join(', ');
            }
          }
        });
      });

      // 图片上传选择
      if (momentPhotoInput) {
        momentPhotoInput.addEventListener('change', (e) => {
          handleMomentFiles(Array.from(e.target.files));
        });
      }

      // 拖拽上传图片
      if (momentPhotoDropzone) {
        momentPhotoDropzone.addEventListener('dragover', (e) => {
          e.preventDefault();
          momentPhotoDropzone.classList.add('dragover');
        });
        momentPhotoDropzone.addEventListener('dragleave', () => {
          momentPhotoDropzone.classList.remove('dragover');
        });
        momentPhotoDropzone.addEventListener('drop', (e) => {
          e.preventDefault();
          momentPhotoDropzone.classList.remove('dragover');
          if (e.dataTransfer.files && e.dataTransfer.files.length) {
            handleMomentFiles(Array.from(e.dataTransfer.files));
          }
        });
      }

      // 粘贴图片
      momentContent.addEventListener('paste', (e) => {
        if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length) {
          const files = Array.from(e.clipboardData.files).filter(f => f.type.startsWith('image/'));
          if (files.length) {
            handleMomentFiles(files);
            showToast('已从剪贴板添加图片', 'info');
          }
        }
      });

      function handleMomentFiles(files) {
        files.forEach(file => {
          if (!file.type.startsWith('image/')) return;
          selectedMomentFiles.push(file);
        });
        renderMomentPreviews();
      }

      function renderMomentPreviews() {
        if (!momentPhotoPreview) return;
        momentPhotoPreview.innerHTML = '';
        selectedMomentFiles.forEach((file, idx) => {
          const card = document.createElement('div');
          card.className = 'moment-photo-card';
          const img = document.createElement('img');
          img.src = URL.createObjectURL(file);
          const removeBtn = document.createElement('button');
          removeBtn.type = 'button';
          removeBtn.className = 'moment-photo-remove';
          removeBtn.innerHTML = '&times;';
          removeBtn.title = '移除此图片';
          removeBtn.addEventListener('click', () => {
            selectedMomentFiles.splice(idx, 1);
            renderMomentPreviews();
          });
          card.appendChild(img);
          card.appendChild(removeBtn);
          momentPhotoPreview.appendChild(card);
        });
      }

      // 发布动态提交
      if (momentForm) {
        momentForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const content = momentContent.value.trim();
          if (!content && selectedMomentFiles.length === 0) {
            showToast('请输入动态内容或上传照片', 'error');
            return;
          }

          momentSubmitBtn.disabled = true;
          momentSubmitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 正在发布动态...';

          try {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const timestamp = Date.now();

            // 1. 上传图片到 assets/img/moments/YYYY/MM/
            const uploadedImgUrls = [];
            for (let i = 0; i < selectedMomentFiles.length; i++) {
              const file = selectedMomentFiles[i];
              const ext = file.name.split('.').pop() || 'jpg';
              const cleanFileName = `moment-${year}${month}${day}-${timestamp}-${i + 1}.${ext}`;
              const imgPath = `assets/img/moments/${year}/${month}/${cleanFileName}`;
              
              momentSubmitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> 正在上传图片 (${i + 1}/${selectedMomentFiles.length})...`;
              await cms.uploadBinary(imgPath, file, `Upload moment image: ${cleanFileName}`);
              uploadedImgUrls.push(`/${imgPath}`);
            }

            // 2. 读取现有的 _data/moments.yml
            momentSubmitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 正在写入动态数据...';
            let existingEntries = [];
            let momentsSha = null;
            try {
              const fileData = await cms.getFile('_data/moments.yml');
              momentsSha = fileData.sha;
              // 尝试解析 JSON/YAML 结构
              try {
                // 如果是 JSON 数组直接解析
                if (fileData.content.trim().startsWith('[')) {
                  existingEntries = JSON.parse(fileData.content);
                } else {
                  // 简单行式解析 moments
                  existingEntries = parseSimpleMomentsYaml(fileData.content);
                }
              } catch (parseErr) {
                console.warn('YAML parse warning:', parseErr);
                existingEntries = [];
              }
            } catch (err) {
              // 文件可能尚不存在
              console.log('_data/moments.yml not found, creating new.');
            }

            // 3. 构造新动态数据
            const tags = momentTags.value.split(/[,，\s]+/).map(t => t.replace(/^#/, '').trim()).filter(Boolean);
            const newEntry = {
              id: `${year}${month}${day}-${timestamp.toString().slice(-4)}`,
              date: momentDateTime.value || formatDateTime(),
              content: content,
              location: momentLocation.value.trim() || '',
              tags: tags,
              images: uploadedImgUrls
            };

            // 前置插入
            existingEntries.unshift(newEntry);

            // 4. 序列化并 Commit
            const newYaml = YAMLHelper.stringifyMoments(existingEntries);
            await cms.putFile('_data/moments.yml', newYaml, `Publish moment: ${newEntry.date}`, momentsSha);

            showToast('动态发布成功！GitHub Actions 正在自动构建部署。', 'success');

            // 清空表单
            momentContent.value = '';
            momentTags.value = '';
            momentLocation.value = '';
            selectedMomentFiles = [];
            renderMomentPreviews();
            momentDateTime.value = formatDateTime();

            refreshWorkflowStatus();
          } catch (err) {
            console.error(err);
            showToast(`发布失败: ${err.message}`, 'error');
          } finally {
            momentSubmitBtn.disabled = false;
            momentSubmitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> 立即发布动态';
          }
        });
      }

      // ----------------- 博客文章逻辑 -----------------
      // 自动从标题生成 Slug
      if (blogTitle && blogSlug) {
        blogTitle.addEventListener('input', () => {
          if (!blogOriginalPath.value) { // 仅新增文章时自动联动
            const val = blogTitle.value.trim();
            const slug = val
              .toLowerCase()
              .replace(/[\s\-_]+/g, '-')
              .replace(/[^\w\u4e00-\u9fa5\-]/g, '');
            blogSlug.value = slug || 'new-post';
          }
        });
      }

      // Markdown 实时预览联动
      if (blogContent && blogPreview) {
        blogContent.addEventListener('input', () => {
          blogPreview.innerHTML = renderMarkdown(blogContent.value);
        });
      }

      // Markdown 工具栏按钮
      document.querySelectorAll('.md-toolbar-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const action = btn.getAttribute('data-md-action');
          insertMarkdownAction(action);
        });
      });

      function insertMarkdownAction(action) {
        const textarea = blogContent;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = textarea.value.substring(start, end);
        let replacement = '';
        let cursorOffset = 0;

        switch (action) {
          case 'bold':
            replacement = `**${selected || '粗体文字'}**`;
            cursorOffset = selected ? replacement.length : 2;
            break;
          case 'italic':
            replacement = `*${selected || '斜体文字'}*`;
            cursorOffset = selected ? replacement.length : 1;
            break;
          case 'strike':
            replacement = `~~${selected || '删除线文字'}~~`;
            cursorOffset = selected ? replacement.length : 2;
            break;
          case 'h1':
            replacement = `\n# ${selected || '一级标题'}\n`;
            cursorOffset = replacement.length;
            break;
          case 'h2':
            replacement = `\n## ${selected || '二级标题'}\n`;
            cursorOffset = replacement.length;
            break;
          case 'h3':
            replacement = `\n### ${selected || '三级标题'}\n`;
            cursorOffset = replacement.length;
            break;
          case 'quote':
            replacement = `\n> ${selected || '引用内容'}\n`;
            cursorOffset = replacement.length;
            break;
          case 'code':
            replacement = `\`${selected || '代码'}\``;
            cursorOffset = selected ? replacement.length : 1;
            break;
          case 'codeblock':
            replacement = `\n\`\`\`javascript\n${selected || '// 在此输入代码'}\n\`\`\`\n`;
            cursorOffset = replacement.length - 5;
            break;
          case 'ul':
            replacement = `\n- ${selected || '列表项目'}\n- 列表项目 2\n`;
            cursorOffset = replacement.length;
            break;
          case 'ol':
            replacement = `\n1. ${selected || '第一项'}\n2. 第二项\n`;
            cursorOffset = replacement.length;
            break;
          case 'link':
            replacement = `[${selected || '链接文本'}](https://example.com)`;
            cursorOffset = replacement.length - 1;
            break;
          case 'image':
            triggerBlogImageUpload();
            return;
          case 'table':
            replacement = `\n| 列 1 | 列 2 | 列 3 |\n| :--- | :---: | ---: |\n| 文本 | 居中 | 居右 |\n`;
            cursorOffset = replacement.length;
            break;
          case 'hr':
            replacement = `\n---\n`;
            cursorOffset = replacement.length;
            break;
          default:
            return;
        }

        textarea.setRangeText(replacement, start, end, 'end');
        textarea.focus();
        blogPreview.innerHTML = renderMarkdown(textarea.value);
      }

      // 博客编辑器插入图片（支持从系统文件选择并直接直传）
      function triggerBlogImageUpload() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
          if (e.target.files && e.target.files[0]) {
            await uploadAndInsertBlogImage(e.target.files[0]);
          }
        };
        input.click();
      }

      // 编辑器内粘贴图片
      blogContent.addEventListener('paste', async (e) => {
        if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length) {
          const file = Array.from(e.clipboardData.files).find(f => f.type.startsWith('image/'));
          if (file) {
            e.preventDefault();
            await uploadAndInsertBlogImage(file);
          }
        }
      });

      // 编辑器拖拽图片
      blogContent.addEventListener('dragover', (e) => e.preventDefault());
      blogContent.addEventListener('drop', async (e) => {
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
          const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/'));
          if (file) {
            e.preventDefault();
            await uploadAndInsertBlogImage(file);
          }
        }
      });

      async function uploadAndInsertBlogImage(file) {
        showToast('正在上传图片到仓库...', 'info');
        try {
          const now = new Date();
          const year = now.getFullYear();
          const timestamp = Date.now();
          const ext = file.name.split('.').pop() || 'png';
          const filename = `post-img-${timestamp}.${ext}`;
          const path = `assets/img/posts/${year}/${filename}`;

          await cms.uploadBinary(path, file, `Upload post image: ${filename}`);

          const imgMarkdown = `\n![${file.name.replace(/\.[^/.]+$/, '')}](/${path})\n`;
          const start = blogContent.selectionStart;
          blogContent.setRangeText(imgMarkdown, start, start, 'end');
          blogPreview.innerHTML = renderMarkdown(blogContent.value);
          showToast('图片上传并插入成功！', 'success');
        } catch (err) {
          showToast(`图片上传失败: ${err.message}`, 'error');
        }
      }

      // 博客提交
      if (blogForm) {
        blogForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const title = blogTitle.value.trim();
          const slug = (blogSlug.value.trim() || 'post').replace(/[\s\/]/g, '-');
          const dateStr = blogDate.value.trim() || formatDateTime();
          const desc = blogDesc.value.trim();
          const rawCategories = blogCategories.value.split(/[,，\s]+/).filter(Boolean);
          const rawTags = blogTags.value.split(/[,，\s]+/).filter(Boolean);
          const content = blogContent.value;

          if (!title) {
            showToast('请输入文章标题', 'error');
            return;
          }
          if (!content) {
            showToast('请输入文章正文内容', 'error');
            return;
          }

          blogSubmitBtn.disabled = true;
          blogSubmitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 正在提交文章...';

          try {
            // 生成 Front Matter
            let frontMatter = `---\n`;
            frontMatter += `layout: post\n`;
            frontMatter += `title: ${JSON.stringify(title)}\n`;
            frontMatter += `date: ${dateStr}\n`;
            if (desc) frontMatter += `description: ${JSON.stringify(desc)}\n`;
            if (rawCategories.length) {
              frontMatter += `categories: [${rawCategories.map(c => JSON.stringify(c)).join(', ')}]\n`;
            }
            if (rawTags.length) {
              frontMatter += `tags: [${rawTags.map(t => JSON.stringify(t)).join(', ')}]\n`;
            }
            frontMatter += `giscus_comments: true\n`;
            frontMatter += `---\n\n`;

            const fullFileContent = frontMatter + content;

            // 决定文件路径
            let targetPath = blogOriginalPath.value;
            if (!targetPath) {
              const datePrefix = dateStr.split(' ')[0] || formatDateOnly();
              targetPath = `_posts/${datePrefix}-${slug}.md`;
            }

            const sha = blogCurrentSha.value || null;
            await cms.putFile(targetPath, fullFileContent, `Publish post: ${title}`, sha);

            showToast('文章保存成功！GitHub Pages 构建已触发。', 'success');
            resetBlogForm();
            loadExistingPosts();
            refreshWorkflowStatus();
          } catch (err) {
            showToast(`保存失败: ${err.message}`, 'error');
          } finally {
            blogSubmitBtn.disabled = false;
            blogSubmitBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> 发布 / 保存文章';
          }
        });
      }

      function resetBlogForm() {
        blogTitle.value = '';
        blogSlug.value = '';
        blogDate.value = formatDateTime();
        blogDesc.value = '';
        blogCategories.value = '';
        blogTags.value = '';
        blogContent.value = '';
        blogPreview.innerHTML = '';
        blogCurrentSha.value = '';
        blogOriginalPath.value = '';
        if (blogResetBtn) blogResetBtn.hidden = true;
      }

      if (blogResetBtn) {
        blogResetBtn.addEventListener('click', () => {
          resetBlogForm();
          showToast('已重置为新建文章模式', 'info');
        });
      }

      // 博客列表刷新
      if (blogReloadListBtn) {
        blogReloadListBtn.addEventListener('click', loadExistingPosts);
      }

      async function loadExistingPosts() {
        if (!blogPostList) return;
        blogPostList.innerHTML = '<div class="text-center py-3 text-muted"><i class="fa-solid fa-spinner fa-spin"></i> 正在加载文章列表...</div>';
        try {
          const files = await cms.listDirectory('_posts');
          const mdFiles = files.filter(f => f.name.endsWith('.md') || f.name.endsWith('.markdown'));
          if (mdFiles.length === 0) {
            blogPostList.innerHTML = '<div class="text-muted p-2">_posts/ 目录下暂无文章。</div>';
            return;
          }

          blogPostList.innerHTML = '';
          mdFiles.reverse().forEach(file => {
            const item = document.createElement('div');
            item.className = 'blog-list-item';
            item.innerHTML = `
              <div class="blog-list-item-title">
                <i class="fa-regular fa-file-lines mr-1"></i> <strong>${file.name}</strong>
              </div>
              <div class="blog-list-item-actions">
                <button type="button" class="btn btn-sm btn-outline-primary load-post-btn" title="加载编辑"><i class="fa-solid fa-pen-to-square"></i> 编辑</button>
                <button type="button" class="btn btn-sm btn-outline-danger delete-post-btn" title="删除文章"><i class="fa-solid fa-trash-can"></i></button>
              </div>
            `;

            // 编辑按钮
            item.querySelector('.load-post-btn').addEventListener('click', async () => {
              await loadPostForEdit(file.path);
            });

            // 删除按钮
            item.querySelector('.delete-post-btn').addEventListener('click', async () => {
              if (confirm(`确定要彻底删除文章 ${file.name} 吗？`)) {
                try {
                  await cms.deleteFile(file.path, `Delete post ${file.name}`, file.sha);
                  showToast(`文章 ${file.name} 已删除`, 'success');
                  loadExistingPosts();
                } catch (err) {
                  showToast(`删除失败: ${err.message}`, 'error');
                }
              }
            });

            blogPostList.appendChild(item);
          });
        } catch (err) {
          blogPostList.innerHTML = `<div class="text-danger p-2">加载文章列表失败: ${err.message}</div>`;
        }
      }

      async function loadPostForEdit(filePath) {
        showToast(`正在加载 ${filePath}...`, 'info');
        try {
          const file = await cms.getFile(filePath);
          blogCurrentSha.value = file.sha;
          blogOriginalPath.value = file.path;

          // 解析 Front Matter 和 Body
          const parsed = parseFrontMatter(file.content);
          blogTitle.value = parsed.data.title || '';
          blogDesc.value = parsed.data.description || '';
          blogDate.value = parsed.data.date || formatDateTime();
          blogCategories.value = Array.isArray(parsed.data.categories) ? parsed.data.categories.join(', ') : (parsed.data.categories || '');
          blogTags.value = Array.isArray(parsed.data.tags) ? parsed.data.tags.join(', ') : (parsed.data.tags || '');
          blogContent.value = parsed.content;
          blogPreview.innerHTML = renderMarkdown(parsed.content);

          if (blogResetBtn) blogResetBtn.hidden = false;
          showToast(`已载入文章：${parsed.data.title || file.name}，可直接修改并提交更新！`, 'success');

          // 切换到博客选项卡并滚动到顶部
          document.querySelector('[data-publisher-tab="blog"]').click();
          window.scrollTo({ top: blogForm.offsetTop - 80, behavior: 'smooth' });
        } catch (err) {
          showToast(`加载文章失败: ${err.message}`, 'error');
        }
      }

      // ----------------- 旅行日志 CMS -----------------
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
            // 上传封面
            if (travelCoverInput && travelCoverInput.files && travelCoverInput.files[0]) {
              const file = travelCoverInput.files[0];
              const ext = file.name.split('.').pop() || 'jpg';
              const filename = `travel-cover-${Date.now()}.${ext}`;
              const path = `assets/img/travel/${filename}`;
              await cms.uploadBinary(path, file, `Upload travel cover: ${filename}`);
              coverImgUrl = `/${path}`;
            }

            // 上传相册照片
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

            // 读取 _data/travel.yml
            let travelData = { password: '', entries: [] };
            let sha = null;
            try {
              const file = await cms.getFile('_data/travel.yml');
              sha = file.sha;
              // 简单解析 travel yaml
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

      // ----------------- 万能文件编辑器 -----------------
      if (rawFileLoadBtn) {
        rawFileLoadBtn.addEventListener('click', async () => {
          const path = rawFileSelect ? rawFileSelect.value : rawFilePath.value.trim();
          if (!path) {
            showToast('请选择或输入要编辑的文件路径', 'error');
            return;
          }
          rawFileLoadBtn.disabled = true;
          rawFileLoadBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 加载中...';
          try {
            const file = await cms.getFile(path);
            rawCurrentSha = file.sha;
            rawFilePath.value = file.path;
            rawFileContent.value = file.content;
            rawFileCommitMsg.value = `Update ${file.path}`;
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

    // 辅助解析 Front Matter
    function parseFrontMatter(str) {
      if (!str.startsWith('---')) {
        return { data: {}, content: str };
      }
      const end = str.indexOf('\n---', 3);
      if (end === -1) {
        return { data: {}, content: str };
      }
      const rawYaml = str.substring(3, end);
      const content = str.substring(end + 4).replace(/^\r?\n/, '');

      const data = {};
      rawYaml.split('\n').forEach(line => {
        const colonIdx = line.indexOf(':');
        if (colonIdx > 0) {
          const key = line.substring(0, colonIdx).trim();
          let val = line.substring(colonIdx + 1).trim();
          // 去除首尾引号
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.substring(1, val.length - 1);
          }
          // 数组解析 [a, b]
          if (val.startsWith('[') && val.endsWith(']')) {
            val = val.substring(1, val.length - 1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
          }
          data[key] = val;
        }
      });

      return { data, content };
    }

    // 简单行式 Moments YAML 解析
    function parseSimpleMomentsYaml(yamlStr) {
      const items = [];
      let current = null;
      let inTags = false;
      let inImages = false;

      yamlStr.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('- id:')) {
          if (current) items.push(current);
          current = { id: trimmed.replace('- id:', '').trim().replace(/^["']|["']$/g, ''), tags: [], images: [] };
          inTags = false;
          inImages = false;
        } else if (current) {
          if (trimmed.startsWith('date:')) {
            current.date = trimmed.replace('date:', '').trim().replace(/^["']|["']$/g, '');
          } else if (trimmed.startsWith('content:')) {
            current.content = trimmed.replace('content:', '').trim().replace(/^["']|["']$/g, '');
          } else if (trimmed.startsWith('location:')) {
            current.location = trimmed.replace('location:', '').trim().replace(/^["']|["']$/g, '');
          } else if (trimmed.startsWith('tags:')) {
            inTags = true;
            inImages = false;
          } else if (trimmed.startsWith('images:')) {
            inImages = true;
            inTags = false;
          } else if (trimmed.startsWith('- ') && inTags) {
            current.tags.push(trimmed.replace('- ', '').trim().replace(/^["']|["']$/g, ''));
          } else if (trimmed.startsWith('- ') && inImages) {
            current.images.push(trimmed.replace('- ', '').trim().replace(/^["']|["']$/g, ''));
          }
        }
      });
      if (current) items.push(current);
      return items;
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

    // 刷新 Actions 部署状态
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

    // 启动
    init();
  });
})();
