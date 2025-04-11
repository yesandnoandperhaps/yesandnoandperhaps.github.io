// 通用配置项
const CARD_SELECTOR = '.recent-post-item, .card-widget';
const SENSITIVITY = 70;
const SHADOW_INTENSITY = 20;

// 核心动画逻辑 (保持独立以便复用)
function createCardAnimator(card) {
  let animationFrame;
  
  const updateTransform = (e) => {
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const posX = e.clientX - centerX;
    const posY = e.clientY - centerY;

    const rotateX = (Math.pow(posY / rect.height, 3) * -SENSITIVITY);
    const rotateY = (Math.pow(posX / rect.width, 3) * SENSITIVITY);
    
    const shadowX = (posX / rect.width) * SHADOW_INTENSITY;
    const shadowY = (posY / rect.height) * SHADOW_INTENSITY;

    card.style.transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale3d(1.03, 1.03, 1.03)
    `;
    card.style.boxShadow = `
      ${shadowX}px ${shadowY}px 40px 
      rgba(0,0,0,${0.1 + Math.abs(posX/rect.width)*0.1})
    `;
  };

  // 节流处理 (优化性能)
  const throttledMove = (e) => {
    cancelAnimationFrame(animationFrame);
    animationFrame = requestAnimationFrame(() => updateTransform(e));
  };

  // 绑定事件
  card.addEventListener('mousemove', throttledMove);
  card.addEventListener('mouseleave', () => {
    cancelAnimationFrame(animationFrame);
    card.style.transition = 'transform 0.6s cubic-bezier(0.18, 0.89, 0.32, 1.28), box-shadow 0.4s ease';
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    card.style.boxShadow = 'none';

    setTimeout(() => {
      card.style.transition = 'transform 0.2s cubic-bezier(0.18, 0.89, 0.32, 1.28), box-shadow 0.2s ease';
    }, 600);
  });
}

// 动态元素检测 (核心改进点)
function initCardEffects() {
  // 初始化现有卡片
  document.querySelectorAll(CARD_SELECTOR).forEach(createCardAnimator);

  // 监听未来新增的卡片
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1 && node.matches(CARD_SELECTOR)) {
          createCardAnimator(node);
        }
        if (node.querySelectorAll) {
          node.querySelectorAll(CARD_SELECTOR).forEach(createCardAnimator);
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// 安全启动 (带错误隔离)
document.addEventListener('DOMContentLoaded', () => {
  try {
    initCardEffects();
  } catch (err) {
    console.error('卡片动画初始化失败:', err);
  }
});