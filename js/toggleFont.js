(function () {
    const fontUrl1 = "https://fontsapi.zeoseven.com/285/main/result.css";
    const fontUrl2 = "https://fontsapi.zeoseven.com/467/main/result.css";
  
    const fontName1 = "Noto Serif SC";
    const fontName2 = "NanoOldSong-A";
  
    let currentFont = localStorage.getItem("selectedFont") || "1";
    currentFont = parseInt(currentFont, 10);
  
    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.type = "text/css";
    fontLink.id = "dynamicFont";
    fontLink.href = (currentFont === 1) ? fontUrl1 : fontUrl2;
    document.head.appendChild(fontLink);
  
    document.documentElement.style.setProperty(
      "--font-family",
      currentFont === 1 ? fontName1 : fontName2
    );
  
    window.toggleFont = function () {
      if (currentFont === 1) {
        fontLink.href = fontUrl2;
        document.documentElement.style.setProperty("--font-family", fontName2);
        currentFont = 2;
      } else {
        fontLink.href = fontUrl1;
        document.documentElement.style.setProperty("--font-family", fontName1);
        currentFont = 1;
      }
      localStorage.setItem("selectedFont", currentFont.toString());
    };
  })();
  