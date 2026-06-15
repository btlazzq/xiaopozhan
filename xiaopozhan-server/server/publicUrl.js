/**
 * 将 /uploads 路径转为公网绝对 URL（供 Cloudflare 前端跨域加载）
 * Railway 环境变量: PUBLIC_URL=https://你的服务.up.railway.app
 */
function getPublicOrigin() {
  const raw = process.env.PUBLIC_URL || process.env.RAILWAY_PUBLIC_DOMAIN;
  if (!raw) return '';
  if (raw.startsWith('http')) return raw.replace(/\/$/, '');
  return `https://${raw.replace(/\/$/, '')}`;
}

function absolutizeUrl(url) {
  if (!url) return url;
  if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
  const origin = getPublicOrigin();
  if (!origin) return url;
  return url.startsWith('/') ? `${origin}${url}` : `${origin}/${url}`;
}

function absolutizeMediaJson(str) {
  if (!str) return str;
  try {
    const list = JSON.parse(str);
    if (!Array.isArray(list)) return str;
    return JSON.stringify(
      list.map((f) => ({
        ...f,
        fileUrl: absolutizeUrl(f.fileUrl),
        coverUrl: absolutizeUrl(f.coverUrl)
      }))
    );
  } catch {
    return str;
  }
}

function absolutizeFileList(list) {
  return (list || []).map((f) => ({
    ...f,
    fileUrl: absolutizeUrl(f.fileUrl),
    coverUrl: absolutizeUrl(f.coverUrl)
  }));
}

module.exports = { getPublicOrigin, absolutizeUrl, absolutizeMediaJson, absolutizeFileList };
