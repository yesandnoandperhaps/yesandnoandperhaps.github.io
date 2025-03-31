const cacheManager = {
  // Show the cache panel
  show_hide: function() {
  const panel = document.querySelector('.cache-panel');
  const currentOpacity = window.getComputedStyle(panel).opacity;

  if (currentOpacity === '0') {
    panel.classList.add('active');
    panel.classList.remove('return'); // 可选：移除相反状态
  } else {
    panel.classList.add('return');
    panel.classList.remove('active'); // 可选：移除相反状态
  }
  },
  
  // Toggle the cache panel visibility
  toggle: function() {
    const panel = document.querySelector('.cache-panel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  },
  
  // Delete selected cache (placeholder function)
  delete: function() {
    // Your cache deletion logic here
    document.getElementById('cache-status').textContent = '正在删除选中缓存...';
  }
};

// You can call these methods to control the panel:
// cacheManager.show() - to show the panel
// cacheManager.hide() - to hide the panel
// cacheManager.toggle() - to toggle visibility