// 页面加载时恢复上次保存的字体大小
document.addEventListener("DOMContentLoaded", function(){
    const savedFontSize = localStorage.getItem("fontSize");
    if (savedFontSize) {
      document.body.style.fontSize = savedFontSize;
    }
  });
  
  // 增大字体的函数（最高 24px）
  function increaseFontSize() {
    const body = document.body;
    const currentSize = parseFloat(window.getComputedStyle(body).fontSize) || 14;
    let newSize = currentSize + 1;
    if (newSize > 24) {
      newSize = 24;
    }
    const newSizeStr = newSize + 'px';
    body.style.fontSize = newSizeStr;
    localStorage.setItem("fontSize", newSizeStr);
    if (newSize === 24){
      btf.snackbarShow("当前字体已经最大~");
    }
    else {
      btf.snackbarShow("当前字体大小：" + newSizeStr + "~");
    }
  }
  
  // 减小字体的函数（最低 14px）
  function decreaseFontSize() {
    const body = document.body;
    const currentSize = parseFloat(window.getComputedStyle(body).fontSize) || 14;
    let newSize = currentSize - 1;
    if (newSize < 10) {
      newSize = 10;
    }
    const newSizeStr = newSize + 'px';
    body.style.fontSize = newSizeStr;
    localStorage.setItem("fontSize", newSizeStr);
    if (newSize === 10){
      btf.snackbarShow("当前字体已经最小~");
    }
    else {
      btf.snackbarShow("当前字体大小：" + newSizeStr + "~");
    }
    
  }
  