function toArray(collection) {
  if (!collection) return [];
  if (Array.isArray(collection)) return collection;
  if (typeof collection.toArray === 'function') return collection.toArray();
  return Array.from(collection);
}

function stripHtml(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(text, limit) {
  if (!text || text.length <= limit) return text;
  return `${text.slice(0, limit).trim()}...`;
}

function placeholderDataUrl(title, subtitle) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1d4ed8"/>
          <stop offset="100%" stop-color="#7c3aed"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="720" rx="36" fill="url(#bg)"/>
      <circle cx="170" cy="110" r="160" fill="rgba(255,255,255,0.10)"/>
      <circle cx="1020" cy="560" r="200" fill="rgba(255,255,255,0.08)"/>
      <text x="84" y="320" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="62" font-weight="700">${title}</text>
      <text x="84" y="388" fill="#dbeafe" font-family="Arial, Helvetica, sans-serif" font-size="28">${subtitle}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function assetUrl(post, asset) {
  if (!asset) return placeholderDataUrl('Paper Cover', 'Add `cover` in front matter');
  if (/^(https?:)?\/\//.test(asset) || asset.startsWith('data:')) return asset;
  if (asset.startsWith('/')) return asset;
  const cleanAsset = asset.replace(/^\.?\//, '');
  return `/${post.path}${cleanAsset}`;
}

function getPaperPosts(hexo) {
  const posts = toArray(hexo.locals.get('posts'));
  return posts
    .filter(post => !post.hidden)
    .filter(post => post.title && post.title !== '你的论文标题')
    .filter(post => !(post.source || '').endsWith('papers_titles.md'))
    .sort((left, right) => right.date.valueOf() - left.date.valueOf());
}

hexo.extend.helper.register('home_papers', function(limit = 6) {
  return getPaperPosts(hexo).slice(0, limit);
});

hexo.extend.helper.register('home_cover', function(post) {
  return assetUrl(post, post.cover);
});

hexo.extend.helper.register('home_excerpt', function(post, limit = 110) {
  const raw = post.excerpt || post.more || post.content || '';
  const text = stripHtml(raw);
  if (text) return truncate(text, limit);
  return '这里显示论文摘要、核心观点或精读笔记导语，可按需要继续完善。';
});

hexo.extend.helper.register('home_topic_list', function(limit = 6) {
  return toArray(hexo.locals.get('categories'))
    .filter(category => !['论文精读', 'uncategorized'].includes(category.name))
    .sort((left, right) => right.length - left.length)
    .slice(0, limit);
});

hexo.extend.helper.register('home_tag_list', function(limit = 10) {
  return toArray(hexo.locals.get('tags'))
    .sort((left, right) => right.length - left.length)
    .slice(0, limit);
});

hexo.extend.helper.register('home_post_categories', function(post) {
  return toArray(post.categories).filter(category => category.name !== '论文精读');
});

hexo.extend.helper.register('home_post_tags', function(post) {
  return toArray(post.tags);
});

hexo.extend.helper.register('home_stats', function() {
  return {
    papers: getPaperPosts(hexo).length,
    topics: toArray(hexo.locals.get('categories'))
      .filter(category => !['论文精读', 'uncategorized'].includes(category.name)).length,
    tags: toArray(hexo.locals.get('tags')).length
  };
});
