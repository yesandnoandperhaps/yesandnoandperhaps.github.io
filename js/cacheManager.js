const cacheManager = {
  // 切换面板显示/隐藏，由已有按钮调用
  show_hide: function() {
    const panel = document.querySelector('.cache-panel');
    if (panel.classList.contains('active')) {
      panel.classList.remove('active');
      panel.classList.add('return');
    } else {
      panel.classList.remove('return');
      panel.classList.add('active');
    }
  },
  // 根据选中项删除对应缓存
  delete: function() {
    const selectedCaches = [];
    document.querySelectorAll('.cache-options input:checked').forEach(input => {
      selectedCaches.push(input.getAttribute('data-cache'));
    });
    if (selectedCaches.length === 0) {
      btf.snackbarShow('请先选择要清除的缓存!');
      return;
    }
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_SELECTED_CACHE',
        cachesToClear: selectedCaches
      });
      btf.snackbarShow('正在清除选中的缓存...');
    } else {
      btf.snackbarShow('Service Worker 未激活或未控制此页面!');
    }
  }
};

// 注册 Service Worker（确保 service-worker.js 已在 public 目录中生成）
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(reg => console.log('Service Worker 注册成功：', reg.scope))
    .catch(err => console.error('Service Worker 注册失败：', err));
}

// 可选：监听 Service Worker 消息反馈，展示删除成功提示
if (navigator.serviceWorker) {
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data && event.data.type === 'CACHE_CLEARED') {
      btf.snackbarShow(`缓存 ${event.data.cacheName} 已清除`);
    }
  });
}

window.addEventListener('scroll', () => {
  if (window.scrollY === 0) {
    const panel = document.querySelector('.cache-panel');
    if (panel.classList.contains('active')) {
      cacheManager.show_hide();
    }
  }
});