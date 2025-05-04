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
};

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

