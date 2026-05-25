hexo.extend.filter.register('after_render:html', function(str, data) {
  if (data.path !== 'index.html') return str;

  const imgCount = 63;
  const imgList = Array.from({ length: imgCount }, (_, i) => `/images/background/fig${i + 1}.jpg`);
  const imgListStr = JSON.stringify(imgList);

  const script = `
    <script>
      (function() {
        var imgList = ${imgListStr};

        function setRandomCover() {
          var randomImg = imgList[Math.floor(Math.random() * imgList.length)];
          var cover = document.querySelector('.cover-wrapper') || document.querySelector('.l_cover');
          if (cover) {
            cover.style.backgroundImage = 'url("' + randomImg + '")';
          }
        }

        // 首次加载
        setRandomCover();

        // 监听 Pjax 完成事件（Volantis 使用的 pjax 库通常会触发此事件）
        document.addEventListener('pjax:complete', setRandomCover);
        // 兼容其他可能的 ajax 加载事件
        document.addEventListener('DOMContentLoaded', setRandomCover);
      })();
    </script>
  `;

  return str.replace('</body>', script + '</body>');
});