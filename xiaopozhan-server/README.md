# 小破站后端 API

前后端分离的后端服务，为小破站前端提供留言与明信片功能。

## 快速开始

```bash
cd xiaopozhan-server
npm install
npm run seed
npm run sync          # 将前台 assets 默认内容同步到数据库
npm start
```

API 默认运行在 http://localhost:3002/api

管理界面：http://localhost:3002/admin

## 默认管理员

- 用户名: `admin`
- 密码: `admin123`

## 主要接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/messages` | 提交留言 |
| GET | `/api/messages/public` | 获取已审核留言 |
| GET | `/api/activity/current` | 获取当前明信片活动 |
| POST | `/api/activity/:id/works` | 提交明信片作品 |
| POST | `/api/admin/login` | 管理员登录 |
| GET | `/api/admin/messages` | 留言列表（需登录） |
| PUT | `/api/admin/messages/:id` | 审核留言 |
| GET | `/api/admin/dashboard` | 数据概览 |
| GET | `/api/admin/settings` | 系统设置 |
| PUT | `/api/admin/settings` | 更新设置 |
| GET | `/api/admin/activities/:id/works` | 明信片作品列表 |
| GET | `/api/moments` | 瞬间帖子列表 |
| GET | `/api/music` | 音乐列表 |
| GET | `/api/video` | 视频列表 |
| POST | `/api/admin/upload` | 上传文件（需登录） |
| GET/POST/PUT/DELETE | `/api/admin/contents` | 内容管理 |

## 与前端联调

前端 `xiaopozhan` 开发时，`vue.config.js` 已将 `/api` 代理到 `http://localhost:3002`。
