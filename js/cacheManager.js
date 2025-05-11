window.cacheManager = {
    async clearAll() {
      // 增强确认
      const confirmClear = confirm("⚠️ 确认要清除本站所有缓存吗？此操作将会清除缓存数据、localStorage、sessionStorage，且不可恢复。");
      if (!confirmClear) return;

      try {
        // 清除所有缓存（Service Worker Cache）
        const keys = await caches.keys();
        for (const key of keys) {
          await caches.delete(key);
        }

        // 清除 localStorage 和 sessionStorage
        localStorage.clear();
        sessionStorage.clear();

        // 清除所有IndexedDB数据
        const databases = await indexedDB.databases();
        for (const { name } of databases) {
          await indexedDB.deleteDatabase(name);
        }

        // 清除所有 Cookies
        document.cookie.split(";").forEach(function(c) {
          document.cookie = c.trim().split("=")[0] + "=;expires=" + new Date(0).toUTCString() + ";path=/";
        });

        // 提示用户清除成功
        alert('🧹 所有缓存已成功清除，包括浏览器缓存、localStorage、sessionStorage、IndexedDB 和 Cookies。');

        // 自动刷新页面
        location.reload();
      } catch (e) {
        alert('❌ 清除缓存时发生错误');
        console.error('缓存清除失败:', e);
      }
    }
  };