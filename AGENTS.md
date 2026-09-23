# 此刻咖啡馆 · 当前工程入口

当前产品版本是纸上线稿版。实现和验收以 `docs/paper-spec.md` 为准；旧版 `docs/product-spec.md`、`docs/design-spec.md`、`docs/copy-prompt.md` 是历史记录。原始 `prototype.html` 在工作区父目录，作为视觉参考，不作为线上入口。

- 页面入口：`index.html`、`src/paper.js`、`src/paper.css`。旧版 `src/main.js` 等模块和 `/api/copy` 保留供历史与旧调用方使用。
- 当前文案接口：`POST /api/brew-copy`。Node 服务和 EdgeOne 函数共用 `shared/brew-copy.js` 的入参校验和提示词。密钥只从服务端环境变量读取。
- 咖啡柜数据归当前浏览器本地存储所有，不写服务端。
- 修改界面后，检查 390×844 与 360px 宽度、深色模式及减少动态效果；主流程至少走到分享导出和刷新后的咖啡柜。
- 原有 Git 历史和未跟踪素材须保留，只提交本次明确修改的文件。