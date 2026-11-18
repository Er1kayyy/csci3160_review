# CSCI3160 互动复习站

从 **Dynamic Programming 5: Optimal BST** 到 **k-Center** 的全课程互动复习页，并整理了 **76 道原始习题**（Regular Exercise 8–13 + Special Exercise 8–14 + 新增 RE9b/SP10b 最大流），以及 **3 套共 21 道参照 `mid-sol.pdf` 题型与难度编写的期中风格加练**。

## 打开方式

直接双击 `index.html`，或用浏览器打开：

```text
index.html
```

也可以直接访问仓库的 GitHub Pages 地址（在仓库 Settings → Pages 中选择 `main` 分支根目录即可启用）。

无需安装依赖、无需联网。所有进度保存在浏览器 `localStorage` 中。

## 内容

- 12 个讲义模块：先修底座、Optimal BST、DFS、SCC、Dijkstra、Bellman–Ford、最大流、APSP/Johnson、NP-hard 与近似、TSP、Set Cover/Hitting Set、k-Center。
- 新增 **CLRS 精讲**：按课程进度表 1–20 重排，覆盖基础三招、分治、贪心 3 讲、DP 5 讲、图 6 讲、近似 4 讲；每单元含中文版章节对照、定理/证明直觉、教材式例题、考场陷阱和联动加练；页面底部另附 17 道《算法导论》原书习题的中文题意与完整讲解。
- 12 个互动实验：DP 调用次数、Optimal BST 表/树、DFS 单步、SCC 三步、Dijkstra、Bellman–Ford（含负环）、Ford–Fulkerson、Johnson 重赋权、VC/MAX-3SAT、TSP、Set Cover、k-Center。
- 76 道原始题 + 21 道加练 + 17 道教材原题全部有“一句话思路 + 完整步骤（讲人话版）”；图题保留原题页图，可点击放大。
- 加练 A 套覆盖：归约证明、Huffman 等频码长、随机 k-selection trial、贪心反例、Rod Cutting 手跑、分治最大下跌、不相邻位置最大和。
- 加练 B 套结合当前知识点：SCC 缩点归约、Optimal BST、DFS/SCC 证明、Dijkstra、Bellman–Ford、最大流、Johnson。
- 加练 C 套结合当前知识点：最大流恢复最小割、FF 手跑、负权反例、TSP、Set Cover、k-Center、VC 归约。
- 随堂测、错题本、收藏、公式速查、随机模拟考、深浅色主题。
- CLRS 精讲支持按部分/状态筛选、单元展开、掌握进度、模块内跳转，并与 B/C 套加练互相链接。

## 文件结构

```text
index.html
assets/css/style.css
assets/js/data.js                课程内容与题库
assets/js/extra-bc.js            加练 B/C 套
assets/js/textbook.js            CLRS 精讲 20 个单元
assets/js/textbook-exercises.js  17 道教材原题与讲解
assets/js/flow-extra.js          新增 RE9b / SP10b 最大流题集
assets/js/solutions-detail-*.js  114 道题的完整步骤详解
assets/js/demos.js               DP / 图 / 最短路 / 最大流实验
assets/js/demos-approx.js        近似算法实验
assets/js/app.js                 路由、渲染、进度、测验
assets/figures/                  原题图页
```

## 备注

- 题库覆盖了资料目录中与 dp-bst 之后内容相关的全部 Regular/Special 题集；最大流新增了 RE9b 与 SP10b 两个完整题集，并保留随堂测和增广实验。
- 三套加练都是“同题型、同难度”的新题，不是 `mid-sol.pdf` 原题复制，便于二刷；B/C 套专门把加练与 dp-bst 之后的当前知识点结合。
- 图题的精确边权/方向以原 PDF 为准；页面中的答案给出可复核的关键步骤，遇到并列或不同 MST 选择时结果可能不唯一。
- 原始讲义、习题与《算法导论》PDF 因体积/版权原因未上传；在线版点击这些链接会提示“请在本地资料目录查看”。
