# 此刻咖啡馆 · 纸上线稿版

手机优先的咖啡调配网页。选择电量和心情，得到一杯带名字和纸条的咖啡，可导出分享图并保存在本机咖啡柜。

当前产品要求见 [docs/paper-spec.md](docs/paper-spec.md)。早期 `docs/product-spec.md`、`docs/design-spec.md`、`docs/copy-prompt.md` 与 `src/main.js` 等文件记录上一版，不是当前页面入口；Git 历史保留了完整旧版。当前页面入口为 `index.html`、`src/paper.js` 和 `src/paper.css`。

## 本地运行

需要 Node.js 22 或更新版本。

```powershell
cd C:\Users\njh\Desktop\小红书vibecoding\moment-coffee-git
npm ci
npm run dev
```

打开 http://127.0.0.1:4173/ 。不配置 AI 也可以走完流程，文案会使用本地兜底。要启用在线文案，复制 `.env.example` 为 `.env`，在服务端配置 `AI_BASE_URL`、`AI_API_KEY`、`AI_MODEL`。密钥不进入前端。

```powershell
npm test
npm run build
npm start
```

新文案接口是 `POST /api/brew-copy`。现有 `POST /api/copy` 保留给旧版调用方，不用于当前页面。EdgeOne 版本在 `edge-functions/api/brew-copy.js`。构建输出目录 `dist`；当前仓库的 `scripts/package-edgeone.ps1` 可制作 EdgeOne 源码包。

咖啡柜使用浏览器本地存储 `moment-cafe-paper:cups`，不同设备间不会同步。分享卡导出为 900×1200 PNG。国内网络无需加载 Google Fonts；本地字体及其 OFL 许可证位于 `public/fonts`。