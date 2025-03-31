document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.recent-post-item,.card-widget');
  const sensitivity = 70; // 灵敏度系数 (原8)
  const shadowIntensity = 20; // 阴影强度 (原20)

  cards.forEach(card => {
    let animationFrame;

    const updateTransform = (e) => {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const posX = e.clientX - centerX;
      const posY = e.clientY - centerY;

      // 非线性灵敏度增强
      const rotateX = (Math.pow(posY / rect.height, 3) * -sensitivity);
      const rotateY = (Math.pow(posX / rect.width, 3) * sensitivity);

      // 动态阴影增强
      const shadowX = (posX / rect.width) * shadowIntensity;
      const shadowY = (posY / rect.height) * shadowIntensity;

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

    card.addEventListener('mousemove', (e) => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => updateTransform(e));
    });

    card.addEventListener('mouseleave', () => {
      cancelAnimationFrame(animationFrame);
      card.style.transition = 'transform 0.6s cubic-bezier(0.18, 0.89, 0.32, 1.28), box-shadow 0.4s ease';
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      card.style.boxShadow = 'none';

      setTimeout(() => {
        card.style.transition = 'transform 0.2s cubic-bezier(0.18, 0.89, 0.32, 1.28), box-shadow 0.2s ease';
      }, 600);
    });
  });
});