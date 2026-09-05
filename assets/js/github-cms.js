/**
 * GitHub CMS Core Client
 * 纯前端 GitHub REST API 封装
 * 用于管理个人博客、发布动态、上传图片及修改站点文件
 */

class GitHubCMS {
  constructor() {
    this.storageKey = 'site_github_cms_config';
    this.config = this.loadConfig();
  }

  /**
   * 从 localStorage 加载配置
   */
  loadConfig() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const saved = JSON.parse(data);
        if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
          const defaults = { token: '', owner: 'suihan-shu', repo: 'MyPage-suihan', branch: 'main' };
          for (const key of Object.keys(defaults)) {
            if (typeof saved[key] === 'string') defaults[key] = saved[key];
          }
          return defaults;
        }
      }
    } catch (e) {
      console.warn('Failed to load GitHub CMS config from localStorage:', e);
    }
    return {
      token: '',
      owner: 'suihan-shu',
      repo: 'MyPage-suihan',
      branch: 'main'
    };
  }

  /**
   * 保存配置到 localStorage
   */
  saveConfig(config) {
    this.config = { ...this.config, ...config };
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.config));
    } catch (e) {
      console.error('Failed to save GitHub CMS config to localStorage:', e);
    }
  }

  /**
   * 清除配置（退出登录）
   */
  clearConfig() {
    this.config = {
      token: '',
      owner: 'suihan-shu',
      repo: 'MyPage-suihan',
      branch: 'main'
    };
    try {
      localStorage.removeItem(this.storageKey);
    } catch (e) {
      console.error('Failed to clear config:', e);
    }
  }

  /**
   * 检查是否已配置 Token
   */
  isConfigured() {
    return Boolean(this.config.token && this.config.owner && this.config.repo);
  }

  /**
   * 发送 GitHub API 请求
   */
  async request(endpoint, options = {}) {
    if (!this.config.token) {
      throw new Error('未检测到 GitHub Token，请先在上方输入并保存。');
    }

    const url = endpoint.startsWith('http') ? endpoint : `https://api.github.com${endpoint}`;
    const headers = {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${this.config.token.trim()}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.headers || {})
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      let errorMsg = `GitHub API 错误 (${response.status} ${response.statusText})`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMsg = `${errorData.message} (${response.status})`;
        }
      } catch (e) {
        // ignore json parse error
      }

      if (response.status === 401) {
        errorMsg = 'GitHub Token 无效或已过期，请检查 Token 是否正确。';
      } else if (response.status === 404) {
        errorMsg = `请求的资源不存在 (${response.status})，请检查仓库名、分支或文件路径。`;
      } else if (response.status === 409) {
        errorMsg = '文件产生冲突 (409 Conflict)，可能远端已被修改，请刷新后重试。';
      } else if (response.status === 422) {
        errorMsg = `提交验证失败 (422): ${errorMsg}`;
      }
      const error = new Error(errorMsg);
      error.status = response.status;
      throw error;
    }

    // 某些 204 No Content 请求没有响应体
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  }

  /**
   * 验证 Token 并获取用户信息及仓库权限
   */
  async verifyAuth() {
    const [user, repo] = await Promise.all([
      this.request('/user'),
      this.request(`/repos/${this.config.owner}/${this.config.repo}`)
    ]);
    return {
      user: {
        login: user.login,
        name: user.name || user.login,
        avatar_url: user.avatar_url,
        html_url: user.html_url
      },
      repo: {
        name: repo.name,
        full_name: repo.full_name,
        private: repo.private,
        permissions: repo.permissions,
        default_branch: repo.default_branch
      }
    };
  }

  /**
   * UTF-8 字符串转 Base64（安全支持中文字符）
   */
  utf8ToBase64(str) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Base64 转 UTF-8 字符串（安全支持中文字符）
   */
  base64ToUtf8(str) {
    // 移除换行符
    const cleanStr = str.replace(/\s/g, '');
    const binary = atob(cleanStr);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(bytes);
  }

  encodePath(path) {
    return path.split('/').map(encodeURIComponent).join('/');
  }

  /**
   * 获取指定文件信息与内容
   * @param {string} path 文件相对路径，如 _data/moments.yml
   */
  async getFile(path) {
    const cleanPath = path.replace(/^\/+/, '');
    const endpoint = `/repos/${this.config.owner}/${this.config.repo}/contents/${this.encodePath(cleanPath)}?ref=${encodeURIComponent(this.config.branch || 'main')}`;
    const data = await this.request(endpoint);
    
    let content = '';
    if (data.encoding === 'base64' && data.content) {
      content = this.base64ToUtf8(data.content);
    }

    return {
      name: data.name,
      path: data.path,
      sha: data.sha,
      size: data.size,
      content: content,
      download_url: data.download_url,
      html_url: data.html_url
    };
  }

  /**
   * 检查文件是否存在并获取其 sha（如果存在）
   */
  async getFileSha(path) {
    try {
      const file = await this.getFile(path);
      return file.sha;
    } catch (e) {
      if (e.status === 404) return null;
      throw e;
    }
  }

  /**
   * 创建或更新文本文件
   * @param {string} path 相对路径，如 _posts/2026-08-19-test.md
   * @param {string} content 文本内容
   * @param {string} message Commit 消息
   * @param {string|null} sha 文件已有 sha（新增文件传 null 或不传）
   */
  async putFile(path, content, message, sha = null) {
    const cleanPath = path.replace(/^\/+/, '');
    const base64Content = this.utf8ToBase64(content);

    // 如果未传入 sha，尝试查询远端是否有同名文件获取最新 sha
    if (!sha) {
      sha = await this.getFileSha(cleanPath);
    }

    const payload = {
      message: message || `Update ${cleanPath}`,
      content: base64Content,
      branch: this.config.branch || 'main'
    };

    if (sha) {
      payload.sha = sha;
    }

    const endpoint = `/repos/${this.config.owner}/${this.config.repo}/contents/${this.encodePath(cleanPath)}`;
    return await this.request(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  }

  /**
   * 直传二进制文件（图片等）
   * @param {string} path 文件路径，如 assets/img/moments/2026/08/photo.jpg
   * @param {File|Blob} fileOrBlob 图片文件或 Blob 对象
   * @param {string} message Commit 消息
   */
  async uploadBinary(path, fileOrBlob, message) {
    const cleanPath = path.replace(/^\/+/, '');

    // 将 Blob 转为 Base64
    const base64Content = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // reader.result 形式为 "data:image/png;base64,iVBORw0KGgo..."
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(fileOrBlob);
    });

    const sha = await this.getFileSha(cleanPath);

    const payload = {
      message: message || `Upload ${cleanPath}`,
      content: base64Content,
      branch: this.config.branch || 'main'
    };

    if (sha) {
      payload.sha = sha;
    }

    const endpoint = `/repos/${this.config.owner}/${this.config.repo}/contents/${this.encodePath(cleanPath)}`;
    return await this.request(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  }

  /**
   * 删除文件
   */
  async deleteFile(path, message, sha = null) {
    const cleanPath = path.replace(/^\/+/, '');
    if (!sha) {
      sha = await this.getFileSha(cleanPath);
    }
    if (!sha) {
      throw new Error(`无法删除：未找到文件 ${cleanPath}`);
    }

    const payload = {
      message: message || `Delete ${cleanPath}`,
      sha: sha,
      branch: this.config.branch || 'main'
    };

    const endpoint = `/repos/${this.config.owner}/${this.config.repo}/contents/${this.encodePath(cleanPath)}`;
    return await this.request(endpoint, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  }

  /**
   * 列出目录内容
   */
  async listDirectory(path = '') {
    const cleanPath = path.replace(/^\/+/, '');
    const endpoint = `/repos/${this.config.owner}/${this.config.repo}/contents/${this.encodePath(cleanPath)}?ref=${encodeURIComponent(this.config.branch || 'main')}`;
    const data = await this.request(endpoint);
    if (!Array.isArray(data)) {
      throw new Error(`路径 ${cleanPath} 不是一个目录。`);
    }
    return data.map(item => ({
      name: item.name,
      path: item.path,
      type: item.type, // 'file' or 'dir'
      size: item.size,
      sha: item.sha,
      download_url: item.download_url
    }));
  }

  /**
   * 获取最近的 Commit 记录
   */
  async getRecentCommits(limit = 5) {
    const endpoint = `/repos/${this.config.owner}/${this.config.repo}/commits?sha=${encodeURIComponent(this.config.branch || 'main')}&per_page=${limit}`;
    const commits = await this.request(endpoint);
    return commits.map(c => ({
      sha: c.sha.substring(0, 7),
      full_sha: c.sha,
      message: c.commit.message,
      author: c.commit.author.name,
      date: c.commit.author.date,
      html_url: c.html_url
    }));
  }

  /**
   * 获取 GitHub Actions 运行状态（部署进度）
   */
  async getWorkflowRuns(limit = 3) {
    try {
      const endpoint = `/repos/${this.config.owner}/${this.config.repo}/actions/runs?per_page=${limit}`;
      const data = await this.request(endpoint);
      return data.workflow_runs.map(run => ({
        id: run.id,
        name: run.name,
        status: run.status, // queued, in_progress, completed
        conclusion: run.conclusion, // success, failure, neutral, cancelled, timed_out, action_required
        created_at: run.created_at,
        updated_at: run.updated_at,
        html_url: run.html_url
      }));
    } catch (e) {
      console.warn('Could not fetch workflow runs:', e);
      return [];
    }
  }
}

// 挂载到全局
window.GitHubCMS = GitHubCMS;
