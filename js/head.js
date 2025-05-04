function scrollHandler() {
  var pageHeader = document.querySelector('#page-header.full_page');
  if (pageHeader) {
    var scrollTop = window.scrollY;
    var maxHeight = 300;
    var radius = Math.min((scrollTop / maxHeight) * 50, 50);
    pageHeader.style.borderRadius = `0 0 ${radius}px ${radius}px`;
  }

  var footer = document.querySelector('#footer');
  if (footer) {
    var scrollTop = window.scrollY;
    var footerOffsetTop = footer.getBoundingClientRect().top + scrollTop;
    var docHeight = document.documentElement.scrollHeight;
    var winHeight = window.innerHeight;
    var threshold = footerOffsetTop - winHeight;

    if (scrollTop > threshold) {
      var maxRadius = 50;
      var radius = Math.min(
        ((scrollTop - threshold) / (docHeight - winHeight - threshold)) * maxRadius,
        maxRadius
      );
      footer.style.borderRadius = `${radius}px ${radius}px 0 0`;
    } else {
      footer.style.borderRadius = `0 0 0 0`;
    }
  }
}

// 只绑定一次 scroll 事件
window.addEventListener('scroll', scrollHandler);

// PJAX 页面切换时重新执行一次（触发一次立即滚动判断）
document.addEventListener('pjax:end', scrollHandler);
