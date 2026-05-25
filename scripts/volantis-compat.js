function normalizeAssetPath(postPath, asset) {
  if (!asset) return asset;
  if (/^(https?:)?\/\//.test(asset) || asset.startsWith('data:') || asset.startsWith('/')) {
    return asset;
  }
  const cleanAsset = asset.replace(/^\.?\//, '');
  return `/${postPath}${cleanAsset}`;
}

hexo.extend.filter.register('before_post_render', data => {
  if (data.cover && !data.headimg) {
    data.headimg = normalizeAssetPath(data.path, data.cover);
  } else if (data.headimg) {
    data.headimg = normalizeAssetPath(data.path, data.headimg);
  }

  if (data.cover && !data.thumbnail) {
    data.thumbnail = normalizeAssetPath(data.path, data.cover);
  } else if (data.thumbnail) {
    data.thumbnail = normalizeAssetPath(data.path, data.thumbnail);
  }

  return data;
});
