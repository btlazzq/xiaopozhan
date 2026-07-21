import axios from 'axios';

const BASE = process.env.VUE_APP_BASE_API || '/api';

function getFileOrigin() {
  const fileBase = process.env.VUE_APP_FILE_BASE;
  if (fileBase) return fileBase.replace(/\/$/, '');
  if (BASE.startsWith('http')) return BASE.replace(/\/api$/, '');
  return '';
}

const http = axios.create({
  baseURL: BASE,
  timeout: 30000
});

http.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg = err.response?.data?.error || err.message || '请求失败';
    return Promise.reject(new Error(msg));
  }
);

export const drawTarotSpread = (question) =>
  http.post('/tarot/draw', { question });

export const submitMessage = (content) =>
  http.post('/messages', { content });

export const getPublicMessages = () =>
  http.get('/messages/public');

export const getCurrentActivity = () =>
  http.get('/activity/current');

export const submitActivityWork = (id, data) =>
  http.post(`/activity/${id}/works`, data);

export const getPublicSettings = () =>
  http.get('/settings/public');

export const getMoments = () =>
  http.get('/moments');

export const getMusicList = () =>
  http.get('/music');

export const getMusicDetail = (no) =>
  http.get(`/music/${no}`);

export const getVideoList = () =>
  http.get('/video');

export const getVideoDetail = (no) =>
  http.get(`/video/${no}`);

export function getDeviceId() {
  let id = localStorage.getItem('device_id');
  if (!id) {
    id = 'dev_' + Math.random().toString(36).slice(2) + Date.now();
    localStorage.setItem('device_id', id);
  }
  return id;
}

// 访客会话 ID：一次浏览会话内保持不变（关闭标签后重置）
export function getSessionId() {
  let id = sessionStorage.getItem('visit_session');
  if (!id) {
    id = 's_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('visit_session', id);
  }
  return id;
}

const PAGE_NAME_MAP = {
  '/': '首页',
  '/catalogue': '目录',
  '/liberty': '瞬间',
  '/leaveWords': '匿名留言',
  '/commentWall': '塔罗占卜',
  '/postcard': '明信片',
  '/music': '音乐/视频',
  '/musicTime': '音乐播放',
  '/videoTime': '视频播放'
};

export function resolvePageName(path, query) {
  const base = PAGE_NAME_MAP[path] || path || '未知';
  if (query && query.no != null && query.no !== '') {
    return `${base}(no=${query.no})`;
  }
  return base;
}

// 上报一次页面访问（静默失败，不打扰用户）
export function trackVisit(to) {
  try {
    const path = to?.path || (typeof to === 'string' ? to : '/');
    const query = to?.query || {};
    const payload = {
      sessionId: getSessionId(),
      path: to?.fullPath || path,
      pageName: resolvePageName(path, query),
      referrer: document.referrer || ''
    };
    http.post('/track', payload).catch(() => {});
  } catch { /* ignore */ }
}

export function formatMessageTime(str) {
  if (!str) return '';
  return str.replace('T', ' ').slice(0, 19);
}

export function resolveMediaUrl(url) {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
  if (url.startsWith('/uploads')) {
    const origin = getFileOrigin();
    return origin ? `${origin}${url}` : url;
  }
  return url;
}

export function mapMomentFileList(fileList) {
  return (fileList || []).map((f) => ({
    fileUrl: resolveMediaUrl(f.fileUrl),
    fileType: f.fileType,
    coverUrl: resolveMediaUrl(f.coverUrl)
  }));
}
