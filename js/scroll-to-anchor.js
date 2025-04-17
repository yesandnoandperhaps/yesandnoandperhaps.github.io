document.addEventListener("DOMContentLoaded", function () {
    const scrollToHash = (hash) => {
      const decodedHash = decodeURIComponent(hash);
      const target = document.querySelector(decodedHash);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100); // 等待页面渲染
      }
    };
  
    // 页面加载后自动滚动
    if (location.hash) {
      scrollToHash(location.hash);
    }
  
    // 监听点击锚点
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener("click", function (e) {
        const hash = this.getAttribute("href");
        const decodedHash = decodeURIComponent(hash);
        const target = document.querySelector(decodedHash);
        if (target) {
          e.preventDefault();
          history.pushState(null, '', decodedHash); // 改变 hash 不触发 reload
          scrollToHash(decodedHash);
        }
      });
    });
  });
  