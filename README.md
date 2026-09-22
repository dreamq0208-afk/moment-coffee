# 此刻咖啡馆

一个手机优先的咖啡推荐网页：选择此刻的电量和感受，得到一杯能直接点单的咖啡、咖啡师留言和可保存的小票。

## 本地运行

需要 Node.js 22 或更新版本。

```powershell
cd C:\Users\njh\Desktop\小红书vibecoding\moment-cafe
npm install
Copy-Item .env.example .env
npm run dev
```

然后打开 <http://127.0.0.1:4173/>。

不填写 AI 配置也能完整使用，留言会走产品规范里的本地模板。要启用真实 AI 留言，在 `.env` 填入兼容 OpenAI Chat Completions 的服务地址、模型名和 Key：

```dotenv
AI_BASE_URL=https://api.openai.com/v1
AI_API_KEY=你的服务端密钥
AI_MODEL=你的模型名
PORT=4173
```

Key 只由 Node 服务读取，不会进入浏览器构建产物。

## 验证与构建

```powershell
npm test
npm run build
npm start
```

生产健康检查为 `GET /api/health`。Docker 部署时容器监听 `4173`，AI 配置通过环境变量注入：

```powershell
docker build -t moment-cafe .
docker run --rm -p 4173:4173 --env-file .env moment-cafe
```

## 字体

站点不依赖 Google Fonts。`public/fonts` 是只包含当前页面所需字符的本地 WOFF2 子集。文案发生较大变化后可重新生成：

```powershell
python -m pip install --user fonttools brotli
.\scripts\build-fonts.ps1
```

字体原文件来自 Google Fonts 官方仓库，仅用于生成子集，不保留在项目内。

## 部署边界

腾讯云域名控制台只负责域名和 DNS；网页仍需部署到一台能运行 Node 22 或 Docker 的服务上。当前项目既可放到腾讯云轻量应用服务器/CVM，也可使用支持 Node 服务的托管产品。若只部署 `dist` 静态文件，页面仍可使用本地模板，但 `/api/copy` 的真实 AI 留言不会生效。

本项目已提供 `edgeone.json` 和 `edge-functions/api/copy.js`，推荐使用腾讯云 EdgeOne Makers。生成直接上传包：

```powershell
.\scripts\package-edgeone.ps1
```

上传 `deploy/moment-cafe-edgeone-source.zip` 后，构建命令为 `npm run build`，输出目录为 `dist`。Edge Function 的环境变量为 `AI_BASE_URL`、`AI_API_KEY`、`AI_MODEL`；没有配置时页面会自动使用本地模板。
