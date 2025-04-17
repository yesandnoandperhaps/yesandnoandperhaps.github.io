const cacheManager = {
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
  delete() {
    const selected = [];
    document.querySelectorAll('.cache-options input:checked').forEach(input => {
      selected.push(input.dataset.cache);
    });

    if (!selected.length) {
      btf.snackbarShow('请先选择要清除的缓存!');
      return;
    }

    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      // 清理日志存储
      window.__deleteLog = {};
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_SELECTED_CACHE',
        cachesToClear: selected
      });
      btf.snackbarShow('开始按类型清理缓存，请稍候…');
    } else {
      btf.snackbarShow('Service Worker 未激活或未控制此页面!');
    }
  }
};

// 监听 Service Worker 返回的删除结果
const deleteLog = {};
navigator.serviceWorker.addEventListener('message', event => {
  const msg = event.data;
  if (!msg?.type) return;

  if (msg.type === 'CACHE_DELETE_RESULT') {
    if (!deleteLog[msg.category]) deleteLog[msg.category] = [];
    deleteLog[msg.category].push({ url: msg.url, success: msg.success });
    btf.snackbarShow(
      `${msg.category}：${msg.url.split('/').pop()} 删除 ${msg.success ? '成功' : '失败'}`
    );
  }

  if (msg.type === 'CACHE_DELETE_DONE') {
    msg.categories.forEach(cat => {
      const results = deleteLog[cat] || [];
      const succ = results.filter(r => r.success).length;
      const fail = results.length - succ;
      btf.snackbarShow(`类型【${cat}】删除完毕：${succ} 成功，${fail} 失败`);
    });
    // 清空
    Object.keys(deleteLog).forEach(k => deleteLog[k] = []);
  }
});

// 注册 Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(reg => console.log('Service Worker 注册成功：', reg.scope))
    .catch(err => console.error('Service Worker 注册失败：', err));
}


window.addEventListener('scroll', () => {
  if (window.scrollY === 0) {
    const panel = document.querySelector('.cache-panel');
    if (panel.classList.contains('active')) {
      cacheManager.show_hide();
    }
  }
});
