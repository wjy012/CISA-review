# CISA 弱点回顾

基于个人薄弱知识地图构建的移动端优先复习工具，覆盖 79 道薄弱题。

## 功能

- 按跨题型薄弱模式和五个 CISA Domain 浏览知识点
- 重做错题，提交后查看正确答案、选项解析、错因和纠偏动作
- 对 WQ-052、WQ-068 等争议题区分题库答案与原则答案
- 使用浏览器本地存储保存复习进度、连续答对次数和未完成会话
- 适配手机安全区、键盘操作与屏幕阅读器

## 本地运行

需要 Node.js 22.13–24.x。

```bash
npm ci
npm run dev
```

构建静态版本：

```bash
npm run build
```

静态文件会生成到 `dist/client`。

## 部署到 Render

仓库已包含 `render.yaml`，推荐使用 Blueprint：

1. 登录 [Render Dashboard](https://dashboard.render.com/)。
2. 选择 **New > Blueprint**。
3. 连接 GitHub，并选择 `wjy012/CISA-review` 仓库。
4. Render 会读取 `render.yaml`，创建名为 `wjy012-cisa-review` 的 Static Site。
5. 确认后点击 **Apply**，等待构建完成。

也可以手动创建 **Static Site**，填写：

- Branch：`main`
- Build Command：`npm ci && npm run build`
- Publish Directory：`dist/client`
- 环境变量：`NEXT_PUBLIC_SITE_URL=https://wjy012-cisa-review.onrender.com`

之后每次推送到 `main`，Render 会自动重新部署。
