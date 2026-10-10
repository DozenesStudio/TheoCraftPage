# 项目长期约定（TheoCraft 宣传站）

## 项目结构（现已多页）
- `index.html` + `script.js` + `style.css` —— 主页（首屏对比大图、实例、下载、评价、名单）
- `about/`、`download/`、`plugins/`、`wiki/` —— 各自带一份 html / js / css 的子页
- `assets/` —— 图片资源；`assets/icon/logo.svg` 是用户提供的**单色白** SVG，不要覆盖

## 产品定位
- **产品名：TheoCraft**（旧名 Town2Blocks，已全面替换，不要再出现旧名）
- 一句话：把 TheoTown 的城市截图转换成 Minecraft 蓝图 / 投影文件（.litematic、.schem）
- **只有桌面客户端下载，没有网页版、没有在线转换服务**。不要写「在线试用 / 试试 / 看看效果」
- 非官方粉丝工具，与 TheoTown 开发者、Mojang Studios 无关联（保留免责声明）

## 技术约束（用户明确要求，不要擅自更改）
- 纯 HTML + CSS + 原生 JavaScript，**不用任何框架、不用构建工具**
- 部署：GitHub + Cloudflare Pages 静态托管，构建命令与输出目录留空
- **零外部请求**：字体走系统字体栈，favicon 是内联 SVG data URI
- 必须能 `file://` 双击直接打开运行（会限制一些 CSS 能力，见下）
- 响应式：桌面 + 移动端，移动端导航收进汉堡菜单
- 所有数据写在 `script.js` 顶部数组里，方便用户自己改

## 设计约束
- 风格：像素 → 方块的过渡感，TheoTown 蓝绿 + Minecraft 草绿 + 石头灰，干净不花哨
- `.hero` 高度固定 `100svh`（用户要求「对比图覆盖整页」，**不要缩小**）
- 首屏压暗遮罩默认半透明（`.hero__scrim { opacity: .62 }`），聚焦文案框时补满到 1。
  要调浓淡只改这一个 opacity，**不要改渐变本身**（CSS 渐变之间无法插值，没有过渡）
- **`.hero__panel` 宽度必须 ≤ 540px**：卡片从左栅格起算，620px 时右边缘会横跨画面中线、
  盖住 `.compare__handle` 滑块。`.hero__title` 字号上限 50px（52px 是单行上界）
- 支持白天 / 黑夜双主题（导航栏右侧开关，默认跟随系统，选择记在 localStorage）
- logo 是纯白图形：浅色底上用 `filter: brightness(0)` 反相。**不要用 CSS mask 改色（file:// 下失效）**
- 用户提需求若与既有约束冲突（如「hero 缩小一点」vs「对比图覆盖整页」），
  先按既有约束执行，并在回复里说明为什么以及可以怎么改

## 数据与文案落点
`script.js` 顶部四个数据区：`CONVERSIONS`（实例）、`REVIEWS`（评价）、`TEAM`（成员）、
`RATING_NOTES`（评价表单按星数 1–5 返回的提示文案）

## 本地验证约定
- 可在本地做的验证一律本地做：`python -m http.server 8899 --bind 127.0.0.1` + 系统自带 Edge
  `"/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" --headless=new ...`
- 验证 JS 渲染结果优先用 `--dump-dom` + grep，比截图可靠
- 详细踩坑记录见 `YYYY-MM-DD.md` 日志
