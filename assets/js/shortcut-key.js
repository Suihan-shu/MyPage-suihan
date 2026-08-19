// Check if the user is on a Mac and update the shortcut key for search accordingly
document.addEventListener("readystatechange", () => {
  if (document.readyState === "interactive") {
    let isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    let shortcutKeyElement = document.querySelector("#search-toggle .nav-link");
    if (shortcutKeyElement && isMac) {
      // use the unicode for command key
      shortcutKeyElement.innerHTML = '&#x2318; k <i class="fa-solid fa-magnifying-glass"></i>';
    }
  }

  // 快捷键唤醒个人发布中心 (Alt+P 或 Ctrl+Shift+P)
  document.addEventListener("keydown", (e) => {
    if ((e.altKey && (e.key === 'p' || e.key === 'P')) || (e.ctrlKey && e.shiftKey && (e.key === 'p' || e.key === 'P'))) {
      const adminLink = document.querySelector('.footer-admin-link');
      if (adminLink && adminLink.href) {
        window.location.href = adminLink.href;
      }
    }
  });
});
