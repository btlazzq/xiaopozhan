const API = '/api';
const TOKEN_KEY = 'xiaopozhan_admin_token';

const STATUS_MAP = {
  pending: '待审核',
  approved: '已通过',
  hidden: '已隐藏',
  deleted: '已删除'
};

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(API + url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || '请求失败');
  return data;
}

function showLogin() {
  document.getElementById('login-view').classList.remove('hidden');
  document.getElementById('app-view').classList.add('hidden');
}

function showApp(username) {
  document.getElementById('login-view').classList.add('hidden');
  document.getElementById('app-view').classList.remove('hidden');
  document.getElementById('admin-name').textContent = username || '';
}

function switchTab(tab) {
  document.querySelectorAll('.nav-btn[data-tab]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  document.querySelectorAll('.tab-panel').forEach((panel) => {
    panel.classList.add('hidden');
  });
  document.getElementById(`tab-${tab}`).classList.remove('hidden');

  const titles = {
    dashboard: '概览',
    messages: '留言管理',
    tarot: '塔罗占卜',
    moments: '瞬间 /liberty',
    'music-admin': '音乐 /music',
    postcards: '明信片作品',
    settings: '系统设置'
  };
  document.getElementById('page-title').textContent = titles[tab] || tab;

  if (tab === 'dashboard') loadDashboard();
  if (tab === 'messages') loadMessages();
  if (tab === 'tarot') loadTarotReadings();
  if (tab === 'moments') loadMoments();
  if (tab === 'music-admin') loadMusicAdmin();
  if (tab === 'postcards') loadActivities();
  if (tab === 'settings') loadSettings();
}

async function login() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  errEl.classList.add('hidden');

  try {
    const res = await request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    setToken(res.token);
    showApp(res.user.username);
    switchTab('dashboard');
  } catch (e) {
    errEl.textContent = e.message;
    errEl.classList.remove('hidden');
  }
}

async function loadDashboard() {
  const data = await request('/admin/dashboard');
  const stats = data.stats || {};
  document.getElementById('stats-grid').innerHTML = `
    <div class="stat-card"><div class="num">${stats.publicMessages || 0}</div><div class="label">公开留言</div></div>
    <div class="stat-card"><div class="num">${stats.hiddenMessages || 0}</div><div class="label">已隐藏留言</div></div>
    <div class="stat-card"><div class="num">${stats.todayMessages || 0}</div><div class="label">今日新留言</div></div>
    <div class="stat-card"><div class="num">${stats.momentCount || 0}</div><div class="label">瞬间帖子</div></div>
    <div class="stat-card"><div class="num">${stats.musicCount || 0}</div><div class="label">音乐</div></div>
    <div class="stat-card"><div class="num">${stats.videoCount || 0}</div><div class="label">视频</div></div>
  `;

  const tbody = document.getElementById('recent-messages');
  tbody.innerHTML = (data.recentMessages || []).map((m) => `
    <tr>
      <td>${escapeHtml(m.content)}</td>
      <td>${escapeHtml(m.ip || '-')}</td>
      <td><span class="status-tag status-${m.status}">${STATUS_MAP[m.status] || m.status}</span></td>
      <td>${m.created_at}</td>
    </tr>
  `).join('') || '<tr><td colspan="4">暂无数据</td></tr>';
}

const CONTENT_TYPE_MAP = { moment: '瞬间', music: '音乐', video: '视频' };

async function uploadFile(file, type) {
  const form = new FormData();
  form.append('file', file);
  form.append('type', type);
  const token = getToken();
  const res = await fetch(API + '/admin/upload', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || '上传失败');
  return data.url;
}

function toggleContentFields(type) {
  const isMoment = type === 'moment';
  const isMusic = type === 'music';
  const isVideo = type === 'video';
  const showSpine = isMusic || isVideo;
  document.getElementById('field-no').classList.toggle('hidden', isMoment);
  document.getElementById('field-shelf-slot').classList.toggle('hidden', isMoment);
  document.getElementById('field-spine').classList.toggle('hidden', !showSpine);
  document.getElementById('field-spine-label').classList.toggle('hidden', !showSpine);
  document.getElementById('field-spine-colors').classList.toggle('hidden', !showSpine);
  document.getElementById('field-title').classList.toggle('hidden', isMoment);
  document.getElementById('field-content').classList.toggle('hidden', !isMoment);
  document.getElementById('field-cover').classList.toggle('hidden', isMoment);
  document.getElementById('field-media').classList.toggle('hidden', isMoment);
  document.getElementById('field-media-json').classList.toggle('hidden', !isMoment);
  if (showSpine) populateSpineMaterialOptions(type);
  updateSpineMaterialDesc();
}

async function populateSpineMaterialOptions(type) {
  await loadSpineMaterials(type === 'video' ? 'vhs' : 'tape');
  const current = document.getElementById('content-spine-material').value;
  document.getElementById('content-spine-material').value = current;
}

let spineMaterialList = [];

async function loadSpineMaterials(kind) {
  const cacheKey = kind || 'all';
  try {
    const q = kind ? `?kind=${kind}` : '';
    const data = await request(`/admin/spine-materials${q}`);
    spineMaterialList = data.items || [];
  } catch {
    spineMaterialList = [];
  }
  const sel = document.getElementById('content-spine-material');
  sel.innerHTML = '<option value="">自动（按标题推断）</option>' +
    spineMaterialList.map((m) => `<option value="${m.id}">${escapeHtml(m.name)}</option>`).join('');
  return spineMaterialList;
}

function updateSpineMaterialDesc() {
  const id = document.getElementById('content-spine-material').value;
  const m = spineMaterialList.find((x) => x.id === id);
  document.getElementById('content-spine-desc').textContent = m?.desc || '留空则根据标题自动选择材质（intro→红底，intro2→拼色，日记→轮换蓝/米黄等）';
  const showColors = id === 'split_custom' || id === 'intro_split';
  const type = document.getElementById('content-type').value;
  document.getElementById('field-spine-colors').classList.toggle('hidden', !['music', 'video'].includes(type) || !showColors);
}

function contentActionCell(id, type) {
  return `
    <button class="btn sm" onclick="editContent(${id},'${type}')">编辑</button>
    <button class="btn sm danger" onclick="deleteContent(${id},'${type}')">删除</button>
  `;
}

async function loadMoments() {
  const status = document.getElementById('moment-status-filter').value;
  let url = '/admin/contents?type=moment';
  if (status) url += `&status=${encodeURIComponent(status)}`;
  const data = await request(url);
  const tbody = document.getElementById('moments-body');
  tbody.innerHTML = (data.items || []).map((c) => `
    <tr>
      <td>${c.id}</td>
      <td>${escapeHtml(c.content || '-')}</td>
      <td>${c.publish_time || c.created_at || '-'}</td>
      <td><span class="status-tag status-${c.status}">${c.status}</span></td>
      <td>${c.sort}</td>
      <td class="action-group">${contentActionCell(c.id, 'moment')}</td>
    </tr>
  `).join('') || '<tr><td colspan="6">暂无瞬间，点击「新增瞬间」添加</td></tr>';
}

async function loadMusicContents() {
  await loadSpineMaterials();
  const data = await request('/admin/contents?type=music');
  const matName = (id) => spineMaterialList.find((m) => m.id === id)?.name || id || '自动';
  const tbody = document.getElementById('music-body');
  tbody.innerHTML = (data.items || []).map((c) => `
    <tr>
      <td>${c.id}</td>
      <td>${escapeHtml(c.title || '-')}</td>
      <td>${escapeHtml(c.spine_label || '-')}</td>
      <td>${escapeHtml(matName(c.spine_material))}</td>
      <td>${c.no ?? '-'}</td>
      <td>${c.shelf_slot ?? '-'}</td>
      <td><span class="status-tag status-${c.status}">${c.status}</span></td>
      <td class="action-group">${contentActionCell(c.id, 'music')}</td>
    </tr>
  `).join('') || '<tr><td colspan="8">暂无音乐</td></tr>';
}

async function loadVideoContents() {
  await loadSpineMaterials('vhs');
  const data = await request('/admin/contents?type=video');
  const matName = (id) => spineMaterialList.find((m) => m.id === id)?.name || id || '自动';
  const tbody = document.getElementById('video-body');
  tbody.innerHTML = (data.items || []).map((c) => `
    <tr>
      <td>${c.id}</td>
      <td>${escapeHtml(c.title || '-')}</td>
      <td>${escapeHtml(c.spine_label || '-')}</td>
      <td>${escapeHtml(matName(c.spine_material))}</td>
      <td>${c.no ?? '-'}</td>
      <td>${c.shelf_slot ?? '-'}</td>
      <td><span class="status-tag status-${c.status}">${c.status}</span></td>
      <td class="action-group">${contentActionCell(c.id, 'video')}</td>
    </tr>
  `).join('') || '<tr><td colspan="8">暂无视频</td></tr>';
}

async function loadMusicAdmin() {
  await loadMusicContents();
  await loadVideoContents();
}

function openContentModal(item, forcedType) {
  document.getElementById('content-modal').classList.remove('hidden');
  document.getElementById('content-modal-msg').textContent = '';
  const type = forcedType || item?.type || 'moment';
  document.getElementById('content-id').value = item?.id || '';
  document.getElementById('content-type').value = type;
  document.getElementById('content-type-label').textContent = `类型：${CONTENT_TYPE_MAP[type] || type}`;
  document.getElementById('content-no').value = item?.no || '';
  document.getElementById('content-shelf-slot').value = item?.shelf_slot ?? '';
  document.getElementById('content-spine-material').value = item?.spine_material || '';
  document.getElementById('content-spine-label').value = item?.spine_label || '';
  document.getElementById('content-spine-color-left').value = item?.spine_color_left || '';
  document.getElementById('content-spine-color-right').value = item?.spine_color_right || '';
  document.getElementById('content-title').value = item?.title || '';
  document.getElementById('content-text').value = item?.content || '';
  document.getElementById('content-cover').value = item?.cover_url || '';
  document.getElementById('content-media').value = item?.media_url || '';
  document.getElementById('content-media-json').value = item?.media_json || '[]';
  document.getElementById('content-publish-time').value = item?.publish_time || '';
  document.getElementById('content-sort').value = item?.sort || 0;
  document.getElementById('content-status').value = item?.status || 'draft';
  document.getElementById('content-modal-title').textContent = item?.id ? '编辑内容' : '新增内容';
  loadSpineMaterials(item?.type === 'video' ? 'vhs' : 'tape').then(() => {
    document.getElementById('content-spine-material').value = item?.spine_material || '';
    toggleContentFields(type);
  });
}

function closeContentModal() {
  document.getElementById('content-modal').classList.add('hidden');
}

async function editContent(id, type) {
  const data = await request(`/admin/contents?type=${type}`);
  const item = (data.items || []).find((c) => c.id === id);
  if (item) openContentModal(item, type);
}

async function saveContent() {
  const id = document.getElementById('content-id').value;
  const type = document.getElementById('content-type').value;
  const payload = {
    type,
    no: parseInt(document.getElementById('content-no').value, 10) || null,
    shelf_slot: parseInt(document.getElementById('content-shelf-slot').value, 10) || null,
    spine_material: document.getElementById('content-spine-material').value.trim() || null,
    spine_label: document.getElementById('content-spine-label').value.trim() || null,
    spine_color_left: document.getElementById('content-spine-color-left').value.trim() || null,
    spine_color_right: document.getElementById('content-spine-color-right').value.trim() || null,
    title: document.getElementById('content-title').value.trim(),
    content: document.getElementById('content-text').value.trim(),
    cover_url: document.getElementById('content-cover').value.trim(),
    media_url: document.getElementById('content-media').value.trim(),
    media_json: document.getElementById('content-media-json').value.trim() || '[]',
    publish_time: document.getElementById('content-publish-time').value.trim(),
    sort: parseInt(document.getElementById('content-sort').value, 10) || 0,
    status: document.getElementById('content-status').value
  };
  try {
    if (id) {
      await request(`/admin/contents/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    } else {
      await request('/admin/contents', { method: 'POST', body: JSON.stringify(payload) });
    }
    closeContentModal();
    if (type === 'moment') await loadMoments();
    else await loadMusicAdmin();
    document.getElementById('content-modal-msg').textContent = '';
  } catch (e) {
    document.getElementById('content-modal-msg').textContent = e.message;
  }
}

async function deleteContent(id, type) {
  if (!confirm('确定删除这条内容？')) return;
  await request(`/admin/contents/${id}`, { method: 'DELETE' });
  if (type === 'moment') await loadMoments();
  else await loadMusicAdmin();
}

async function uploadFor(field) {
  const input = field === 'cover' ? document.getElementById('upload-cover') : document.getElementById('upload-media');
  const file = input.files?.[0];
  if (!file) return alert('请先选择文件');
  try {
    const url = await uploadFile(file, field === 'cover' ? 'image' : 'media');
    if (field === 'cover') document.getElementById('content-cover').value = url;
    else document.getElementById('content-media').value = url;
    document.getElementById('content-modal-msg').textContent = '上传成功: ' + url;
  } catch (e) {
    document.getElementById('content-modal-msg').textContent = e.message;
  }
}

async function uploadMomentFile() {
  const input = document.getElementById('upload-moment-file');
  const file = input.files?.[0];
  if (!file) return alert('请先选择文件');
  const isVideo = file.type.startsWith('video/');
  try {
    const url = await uploadFile(file, isVideo ? 'video' : 'image');
    let list = [];
    try { list = JSON.parse(document.getElementById('content-media-json').value || '[]'); } catch { list = []; }
    list.push({ fileUrl: url, fileType: isVideo ? 'video' : 'image' });
    document.getElementById('content-media-json').value = JSON.stringify(list, null, 2);
    document.getElementById('content-modal-msg').textContent = '已追加到 JSON';
  } catch (e) {
    document.getElementById('content-modal-msg').textContent = e.message;
  }
}

async function loadMessages() {
  const status = document.getElementById('msg-filter').value;
  const keyword = document.getElementById('msg-keyword').value.trim();
  let url = '/admin/messages?';
  if (status) url += `status=${encodeURIComponent(status)}&`;
  if (keyword) url += `keyword=${encodeURIComponent(keyword)}`;

  const data = await request(url);

  const tbody = document.getElementById('messages-body');
  tbody.innerHTML = (data.items || []).map((m) => `
    <tr>
      <td>${escapeHtml(m.content)}</td>
      <td>${m.ip || '-'}</td>
      <td>${m.created_at}</td>
      <td>
        <button class="btn sm danger" onclick="deleteMessage(${m.id})">删除</button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="4">暂无留言</td></tr>';
}

async function deleteMessage(id) {
  if (!confirm('确定删除这条留言？')) return;
  await request(`/admin/messages/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'deleted' })
  });
  await loadMessages();
  if (!document.getElementById('tab-dashboard').classList.contains('hidden')) {
    await loadDashboard();
  }
}

function formatTarotCards(cards) {
  return (cards || [])
    .map((c) => `${c.name}${c.orientationLabel === '逆位' ? '(逆)' : ''}`)
    .join(' · ');
}

async function loadTarotReadings() {
  const keyword = document.getElementById('tarot-keyword').value.trim();
  let url = '/admin/tarot?';
  if (keyword) url += `keyword=${encodeURIComponent(keyword)}`;

  const data = await request(url);
  const tbody = document.getElementById('tarot-body');
  tbody.innerHTML = (data.items || []).map((r) => `
    <tr>
      <td>${r.id}</td>
      <td style="max-width:180px;word-break:break-all">${escapeHtml(r.question)}</td>
      <td style="font-size:0.78rem">${escapeHtml(formatTarotCards(r.cards))}</td>
      <td>${r.ip || '-'}</td>
      <td>${r.created_at}</td>
      <td><button class="btn sm danger" onclick="deleteTarotReading(${r.id})">删除</button></td>
    </tr>
  `).join('') || '<tr><td colspan="6">暂无占卜记录</td></tr>';
}

async function deleteTarotReading(id) {
  if (!confirm('确定删除这条占卜记录？')) return;
  await request(`/admin/tarot/${id}`, { method: 'DELETE' });
  await loadTarotReadings();
}

async function loadActivities() {
  const data = await request('/admin/activities');
  const select = document.getElementById('activity-select');
  const items = data.items || [];
  select.innerHTML = items.map((a) =>
    `<option value="${a.id}">${escapeHtml(a.name)} (${a.status})</option>`
  ).join('') || '<option value="">无活动</option>';

  if (items.length) await loadWorks(items[0].id);
}

async function loadWorks(activityId) {
  const id = activityId || document.getElementById('activity-select').value;
  if (!id) return;

  const data = await request(`/admin/activities/${id}/works`);
  const grid = document.getElementById('works-grid');
  const works = data.items || [];

  grid.innerHTML = works.map((w) => {
    const imgSrc = w.image_url
      ? (w.image_url.startsWith('http') || w.image_url.startsWith('data:')
        ? w.image_url
        : w.image_url)
      : '';
    return `
      <div class="work-card">
        ${imgSrc ? `<img src="${imgSrc}" alt="明信片" />` : '<div class="work-meta">无预览图</div>'}
        <div class="work-meta">
          <div>${escapeHtml(w.text || '（无文字）')}</div>
          <div>${w.created_at}</div>
          <div>IP: ${w.ip || '-'}</div>
        </div>
      </div>
    `;
  }).join('') || '<p class="hint">暂无作品</p>';
}

async function loadSettings() {
  const data = await request('/admin/settings');
  document.getElementById('set-title').value = data.site_title || '';
  document.getElementById('set-message').checked = !!data.enable_message;
  document.getElementById('set-activity').checked = !!data.enable_activity;
  document.getElementById('settings-msg').textContent = '';
}

async function saveSettings() {
  try {
    await request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify({
        site_title: document.getElementById('set-title').value.trim(),
        enable_message: document.getElementById('set-message').checked,
        enable_activity: document.getElementById('set-activity').checked
      })
    });
    document.getElementById('settings-msg').textContent = '保存成功';
  } catch (e) {
    document.getElementById('settings-msg').textContent = e.message;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

document.getElementById('login-btn').addEventListener('click', login);
document.getElementById('login-password').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') login();
});
document.getElementById('logout-btn').addEventListener('click', () => {
  setToken(null);
  showLogin();
});

document.querySelectorAll('.nav-btn[data-tab]').forEach((btn) => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

document.getElementById('msg-search').addEventListener('click', loadMessages);
document.getElementById('tarot-search').addEventListener('click', loadTarotReadings);

document.getElementById('load-works').addEventListener('click', () => loadWorks());
document.getElementById('activity-select').addEventListener('change', () => loadWorks());
document.getElementById('save-settings').addEventListener('click', saveSettings);
document.getElementById('moment-refresh').addEventListener('click', loadMoments);
document.getElementById('moment-status-filter').addEventListener('change', loadMoments);
document.getElementById('moment-add-btn').addEventListener('click', () => openContentModal(null, 'moment'));
document.getElementById('music-refresh').addEventListener('click', loadMusicContents);
document.getElementById('music-add-btn').addEventListener('click', () => openContentModal(null, 'music'));
document.getElementById('video-refresh').addEventListener('click', loadVideoContents);
document.getElementById('video-add-btn').addEventListener('click', () => openContentModal(null, 'video'));
document.getElementById('content-modal-cancel').addEventListener('click', closeContentModal);
document.getElementById('content-modal-save').addEventListener('click', saveContent);
document.getElementById('content-spine-material').addEventListener('change', updateSpineMaterialDesc);

window.deleteMessage = deleteMessage;
window.deleteTarotReading = deleteTarotReading;
window.editContent = editContent;
window.deleteContent = deleteContent;
window.uploadFor = uploadFor;
window.uploadMomentFile = uploadMomentFile;

(async function init() {
  const token = getToken();
  if (!token) {
    showLogin();
    return;
  }
  try {
    await loadDashboard();
    showApp('管理员');
    switchTab('dashboard');
  } catch {
    setToken(null);
    showLogin();
  }
})();
