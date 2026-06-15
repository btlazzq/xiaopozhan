# 小破站

个人主题互动网站，前后端分离。前台用于浏览与互动，后台用于内容管理与数据维护。

## 功能概览

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | `/` | 站点入口 |
| 目录 | `/catalogue` | 栏目导航 |
| 瞬间 | `/liberty` | 图文 / 视频瞬间 |
| 留言 | `/leaveWords` | 访客留言 |
| 塔罗 | `/commentWall` | 塔罗占卜互动 |
| 明信片 | `/postcard` | 明信片活动投稿 |
| 音乐 | `/music` | 音乐列表与磁带 UI |
| 音乐详情 | `/musicTime` | 单曲播放页 |
| 视频 | `/videoTime` | 视频内容页 |

管理后台（后端提供）：`/admin` — 留言、内容、音乐、明信片、系统设置等。

## 项目结构

```
xiaopozhan/
├── xiaopozhan-dev/      # 前端（Vue 3 + Vue Router + Element Plus）
└── xiaopozhan-server/   # 后端（Node.js + Express + SQLite）
```

| 目录 | 技术栈 | 说明 |
|------|--------|------|
| `xiaopozhan-dev` | Vue 3、Vue CLI | 用户看到的网站界面 |
| `xiaopozhan-server` | Express、better-sqlite3 | API、数据库、管理端静态页 |

## 本地开发

需要 Node.js 18+。前后端需**同时运行**。

### 1. 后端

```bash
cd xiaopozhan-server
npm install
npm run seed          # 首次：初始化数据库与管理员
npm run sync          # 首次：将前端 assets 默认资源同步到数据库
npm start             # 端口 3002；若占用可执行 npm run restart
```

- API：`http://localhost:3002/api`
- 管理端：`http://localhost:3002/admin`
- 默认管理员：`admin` / `admin123`（部署后请立即修改）

### 2. 前端

```bash
cd xiaopozhan-dev
npm install
npm run serve         # 默认 http://localhost
```

开发环境下，`vue.config.js` 已将 `/api` 与 `/uploads` 代理到 `http://localhost:3002`。

### 构建前端

```bash
cd xiaopozhan-dev
npm run build         # 产物在 dist/
```

## 部署建议

推荐：**Cloudflare Pages（前端）** + **Railway（后端）**。

| 服务 | Root Directory | 说明 |
|------|----------------|------|
| Cloudflare Pages | `xiaopozhan-dev` | Build：`npm install && npm run build`，输出 `dist` |
| Railway | `xiaopozhan-server` | 挂 1 个 Volume 到 `/app/persist`，设 `PERSIST_DIR` 与 `PUBLIC_URL`；**不要用仓库根目录的 railway.toml** |

前端生产环境变量示例：

```env
VUE_APP_BASE_API=https://你的后端域名/api
```

后端首次部署会自动执行 `seed` 与 `sync`（见 `package.json` 中的 `start:deploy`）。

## 环境变量

### 前端（`xiaopozhan-dev`）

| 变量 | 说明 | 默认 |
|------|------|------|
| `VUE_APP_BASE_API` | 后端 API 根路径 | `/api` |

### 后端（`xiaopozhan-server`）

| 变量 | 说明 | 默认 |
|------|------|------|
| `PORT` | 服务端口 | `3002` |

## 数据与文件

| 路径 | 说明 |
|------|------|
| `xiaopozhan-server/data/site.db` | SQLite 数据库 |
| `xiaopozhan-server/uploads/` | 上传的媒体文件 |

部署时请挂 **一个** Volume（Railway 每服务通常只允许一个）：

| Mount Path | 环境变量 |
|------------|----------|
| `/app/persist` | `PERSIST_DIR=/app/persist` |

数据库与上传文件会保存在该 Volume 下的 `data/` 与 `uploads/` 子目录。

## 许可证

个人项目，未经授权请勿用于商业用途。
