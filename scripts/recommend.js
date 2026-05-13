hexo.extend.filter.register('after_post_render', function(data) {
  const allPosts = hexo.locals.get('posts');
  const currentTags = data.tags ? data.tags.map(t => t.name) : [];
  if (currentTags.length === 0) return data;

  // 选择 tag 交集最多的 3 篇文章
  const related = allPosts
    .filter(p => p._id !== data._id)
    .map(p => ({
      post: p,
      common: p.tags.filter(t => currentTags.includes(t.name)).length
    }))
    .filter(r => r.common > 0)
    .sort((a, b) => b.common - a.common)
    .slice(0, 3)
    .map(r => r.post);

  if (related.length > 0) {
    let html = '<hr><h3>📎 相关论文推荐</h3><ul>';
    related.forEach(p => {
      html += `<li><a href="${p.path}">${p.title}</a></li>`;
    });
    html += '</ul>';
    data.content += html;
  }
  return data;
}, 10);