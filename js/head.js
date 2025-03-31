window.addEventListener('scroll', function() {
  var pageHeader = document.querySelector('#page-header.full_page');
  var scrollTop = window.scrollY; // 获取滚动的高度
  var maxHeight = 300; // 最大滚动距离
  var radius = Math.min(scrollTop / maxHeight * 50, 50); // 计算圆角值

  // 设置新的圆角
  pageHeader.style.borderRadius = `0 0 ${radius}px ${radius}px`;
});

window.addEventListener('scroll', function() {
  var footer = document.querySelector('#footer');

  // 获取页面滚动的高度
  var scrollTop = window.scrollY;

  // 获取 #footer 元素的位置
  var footerOffsetTop = footer.getBoundingClientRect().top + scrollTop;

  // 获取页面的总高度
  var docHeight = document.documentElement.scrollHeight;
  var winHeight = window.innerHeight;

  // 设置阈值：当页面滚动到 #footer 元素的顶部时才开始变化
  var threshold = footerOffsetTop - winHeight;

  if (scrollTop > threshold) {
    // 计算滚动距离，滚动距离越多圆角越大，最大为50px
    var maxRadius = 50;
    var radius = Math.min((scrollTop - threshold) / (docHeight - winHeight - threshold) * maxRadius, maxRadius);
    footer.style.borderRadius = `${radius}px ${radius}px 0 0`;
  } else {
    // 如果滚动位置没有超过 #footer 元素的位置，保持无圆角
    footer.style.borderRadius = `0 0 0 0`;
  }
});
