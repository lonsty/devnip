<p align="center">
  <img src="icons/icon128.png" width="80" height="80" alt="Devnip">
</p>

<p align="center">
  <strong>随手一剪，即刻转换。</strong><br>
  一款 Chrome 扩展，内置 20+ 轻量开发小工具，编解码、格式化、转换触手可及。
</p>

<p align="center">
  中文 | <a href="README.md">English</a>
</p>

<p align="center">
  <a href="https://github.com/lonsty/devnip/releases"><img src="https://img.shields.io/github/v/release/lonsty/devnip?style=flat-square" alt="Release"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="License"></a>
  <img src="https://img.shields.io/badge/chrome-92%2B-brightgreen?style=flat-square&logo=googlechrome&logoColor=white" alt="Chrome 92+">
  <img src="https://img.shields.io/badge/manifest-v3-orange?style=flat-square" alt="Manifest V3">
</p>

<p align="center">
  <img src="demo/screenshot-light-theme.png" width="720" alt="亮色主题">
</p>

<p align="center">
  <img src="demo/screenshot-dark-theme.png" width="720" alt="暗色主题">
</p>

## 功能

| 分类 | 工具 |
|------|------|
| 编解码 | Base64、URL、HTML 实体、Unicode、智能解码 |
| 格式化 | JSON、YAML ↔ JSON |
| 解析 | Query String、JWT、Cron 表达式 |
| 转换 | 时间戳、进制、色值 |
| 文本 | 大小写/去重/排序/统计、Diff 对比、Markdown 预览 |
| 计算/生成 | Hash (MD5/SHA)、UUID/随机字符串 |
| 网络 | IP/CIDR 计算 |
| 正则 | 正则表达式测试 |

## 安装

### 从 GitHub Release 安装

1. 前往 [Releases](https://github.com/lonsty/devnip/releases) 下载最新的 `devnip-*.zip`
2. 解压到任意目录
3. 打开 Chrome，访问 `chrome://extensions/`
4. 开启右上角 **开发者模式**
5. 点击 **加载已解压的扩展程序**，选择解压后的目录

### 从源码安装

```bash
git clone https://github.com/lonsty/devnip.git
cd devnip
npm install
npm run build
```

然后按上述步骤 3–5 加载 `dist/` 目录即可。

## 使用方式

- **Popup 弹窗** — 点击浏览器右上角的 Devnip 图标，在侧边栏选择工具
- **右键菜单** — 在任意网页中选中文本，右键 → **Devnip** → 选择操作（结果自动复制到剪贴板）
- **独立标签页** — 点击侧边栏底部的「在新标签页打开」，获得全页面布局

## 本地开发

```bash
# 生成图标
node scripts/generate-icons.js

# 打包 popup.js（开发模式，含 watch）
npm run dev

# 构建到 dist/
npm run build

# 构建并打包 zip
npm run zip
```

### 调试

- **Popup 页面**: 右键插件图标 → 审查弹出内容（或在 Popup 页面按 F12）
- **Service Worker**: `chrome://extensions/` → Devnip 卡片 → 点击「Service Worker」链接查看控制台
- **Console 调试**: Popup 页面的 DevTools Console 中可直接调用 `import()` 导入工具模块测试

## 项目结构

```
├── manifest.json          # 扩展清单 (Manifest V3)
├── popup/
│   ├── popup.html         # Popup 页面
│   ├── popup.css          # 样式（GitHub Primer 风格，含亮色/暗色主题）
│   ├── popup.js           # 交互逻辑（入口，工具初始化与事件绑定）
│   ├── popup.bundle.js    # esbuild 打包产物
│   ├── constants.js       # 共享常量与配置（缓存 key、映射表、魔法数字）
│   ├── cache.js           # localStorage 缓存系统
│   ├── theme.js           # 主题管理（系统/亮色/暗色三态循环）
│   ├── render.js          # DOM 工具、Toast、剪贴板、结果框渲染
│   ├── cm-editor.js       # CodeMirror 6 编辑器工厂
│   ├── i18n.js            # 中英文国际化
│   └── icons.js           # SVG 图标定义 (GitHub Octicons)
├── background/
│   └── service-worker.js  # 右键菜单注册与处理
├── utils/                 # 20 个工具模块
├── icons/                 # 图标 (16/48/128px)
├── scripts/
│   ├── build.js           # 构建 + 打包 dist + zip 脚本
│   ├── esbuild.js         # esbuild 打包配置
│   └── generate-icons.js  # 图标生成脚本
├── CHANGELOG.md           # 变更日志（英文）
├── CHANGELOG.zh-CN.md     # 变更日志（中文）
├── README.md              # 项目说明（英文）
└── README.zh-CN.md        # 项目说明（中文）
```

## 技术栈

- Manifest V3
- 纯原生 JavaScript (ES Modules)
- [CodeMirror 6](https://codemirror.net/6/) — 语法高亮编辑器（JSON / YAML / Markdown / Cron / JWT / QueryString）
- [esbuild](https://esbuild.github.io/) — 零配置打包工具
- 零运行时依赖（CodeMirror 在构建时打包；MD5 和 YAML 解析器内置实现）
- Hash: Web Crypto API (`crypto.subtle.digest`)
- UUID: `crypto.randomUUID()` / `crypto.getRandomValues()`

## 隐私

- 不收集任何用户数据
- 不进行任何网络请求
- 所有计算均在本地完成

## 更新日志

查看 [CHANGELOG.zh-CN.md](CHANGELOG.zh-CN.md) 了解完整变更记录。

## 许可

MIT
