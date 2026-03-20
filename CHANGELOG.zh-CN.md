# 变更日志

[🇬🇧 English](CHANGELOG.md)

## [0.3.0] - 2026-03-20

### 新增

- **CodeMirror 6 编辑器** — JSON、YAML、Query String、JWT、Cron、Markdown 输入/输出框替换为 CodeMirror 6 语法高亮编辑器，支持行号、主题联动
- **esbuild 打包** — 新增 `scripts/esbuild.js`，使用 esbuild 将 `popup.js` 及其依赖打包为 `popup.bundle.js`，加速加载
- **输出区域自动隐藏** — 输出面板默认隐藏（`.io-area-output.is-empty`），有结果时自动显示，减少视觉干扰
- **内联 IO 操作按钮** — 清除（Clear）和复制（Copy）按钮改为悬浮在输入/输出框右上角，hover 时显示，节省布局空间
- **语法高亮输出** — 新增 `.io-highlight` 组件，支持 JSON/JWT 等工具的结构化语法高亮输出
- **Cron 时区支持** — Cron 表达式的"下次运行时间"计算支持时区参数，使用 `Intl.DateTimeFormat` 格式化输出
- **扩展 i18n 覆盖** — 更多工具标签、按钮、占位符、Toast 提示支持中英文切换

### 变更

- **模块化重构** — 将 `popup.js`（850 行）拆分为 `constants.js`、`cache.js`、`theme.js`、`render.js` 四个独立模块
- **常量集中管理** — 缓存 key、映射表、魔法数字、时序常量集中到 `constants.js`，消除硬编码
- **CSS 变量优化** — diff 行、正则高亮、颜色预览的硬编码色值提取为 CSS 变量（`--diff-add-bg`、`--regex-mark-bg`、`--checker-color` 等）
- **i18n / service-worker 常量统一** — 硬编码 key 改用 `LOCALE_KEY` / `CTX_TOAST_MAX_LENGTH` 常量
- **图标系统升级** — SVG 图标尺寸从 18px 改为 GitHub Octicons 16px 标准
- **时间戳默认时区** — `TimestampTool.toReadable()` 默认时区从 `UTC` 改为 `Asia/Shanghai`
- **构建脚本增强** — `scripts/build.js` 新增 `POPUP_EXCLUDE` 列表，复制到 dist 时跳过已打包的源文件
- **JSDoc 注释补全** — 所有公共函数和模块添加 JSDoc 文档注释

### 移除

- 移除 `icons.js` 中未使用的 `icon()` 导出函数

## [0.2.0] - 2026-02-26

### 新增

- 记住上次使用的工具，重新打开 Popup 时自动定位到上次使用的面板
- 暗色主题支持：默认跟随系统 `prefers-color-scheme`，也支持手动切换（系统 / 亮色 / 暗色 三态循环）
- 语言切换按钮 title 支持 i18n

### 变更

- 主要操作按钮（编码 / 解码 / 执行）改为描边风格，hover 时填充颜色，视觉更轻盈
- 暗色主题下文字颜色提亮，提升可读性

### 修复

- 修复暗色主题下输入框（时间戳、进制、色值、IP、正则等）背景仍为白色的问题
- 修复暗色主题下 Markdown HTML 源码框未隐藏导致白色背景显露的问题
- 修复暗色主题下 Toast 提示文字不可见的问题
- 修复只读输出框 focus 时仍显示蓝色高亮边框的问题
- 修复部分面板内组件间距不一致的问题（regex-presets、divider 额外 margin，空状态容器占据 gap 间距）

## [0.1.0] - 2026-02-25

### 新增

- 首次发布
- 20 个开发者常用工具，支持 Popup 弹窗和右键菜单两种使用方式
- **编解码**: Base64（含 URL-safe）、URL（含递归解码）、HTML 实体、Unicode、智能编码探测
- **格式化**: JSON（格式化 / 压缩 / 校验 / 排序 / 宽松模式）、YAML ↔ JSON 互转
- **解析**: Query String（key-value 表格展示）、JWT（Header / Payload / 过期检查）、Cron 表达式（自然语言描述 + 未来执行时间预览）
- **转换**: 时间戳（秒 / 毫秒自动识别、多时区）、进制转换（BIN / OCT / DEC / HEX、BigInt 大数支持）、色值转换（HEX / RGB / HSL 互转 + 预览）
- **文本**: 大小写转换（7 种格式）、去重 / 排序 / 统计、文本 Diff 对比（Myers 算法）、Markdown 实时预览
- **计算 / 生成**: Hash（MD5 / SHA-1 / SHA-256 / SHA-512）、UUID v4 / 随机字符串 / 强密码生成
- **网络**: IP / CIDR 计算（网络地址、广播地址、主机范围、私有地址识别）
- **正则**: 正则表达式测试（实时高亮、捕获组、替换预览、常用模板）
- 右键菜单支持 18 项快捷操作，结果自动写入剪贴板
- Manifest V3，支持 Chrome 92+
- 纯前端实现，不收集任何用户数据，不进行任何网络请求
