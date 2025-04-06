(async () => {
    const googleFontsURL = "https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@200;300;400;500;600;700;800;900&display=swap";
    const chinaMirrorURL = "https://gfonts.aby.pub/css2?family=Noto+Serif+SC:wght@200;300;400;500;600;700;800;900&display=swap";
  
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const response = await fetch(googleFontsURL, { method: 'HEAD', signal: controller.signal });
      clearTimeout(timeoutId);
  
      const fontURL = response.ok ? googleFontsURL : chinaMirrorURL;
      insertFont(fontURL);
    } catch (e) {
      insertFont(chinaMirrorURL);
    }
  
    function insertFont(href) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    }
  })();
  