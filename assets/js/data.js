/* =========================================================
   CSCI3160 — course data
   Content is organised around the lecture sequence from
   "Dynamic Programming 5: Optimal BST" to "k-Center".
   ========================================================= */
(function () {
  "use strict";

  const MODULES = [
    {
      id: "pre",
      index: "00",
      title: "先修底座",
      en: "BST · Dynamic Programming · Graphs · Complexity",
      short: "BST、DP、图论、MST、概率与 NP-hard 的最小必备包",
      duration: "35–45 min",
      level: "基础",
      examWeight: "贯穿全部后续题目",
      blurb: "这些不是“旧知识”，而是后面每一个算法证明的地基。先修不稳，后面的 O(n³) 递推、白路径定理和近似比都会变成背结论。",
      prerequisites: [],
      tags: ["BST", "DP", "图", "MST", "概率", "NP-hard"],
      concepts: [
        {
          title: "0.1 复杂度语言：先把“快”说清楚",
          html: `
            <p>课程使用 <strong>RAM 模型</strong>：基本算术、比较、数组访问、指针操作为 O(1)。算法分析默认看 <strong>最坏情况</strong>，并用渐近记号描述增长量级。</p>
            <div class="definition"><span class="label">三种记号</span>
              <p><span class="math">f(n)=O(g(n))</span>：存在常数 c、n₀，使 n≥n₀ 时 0≤f(n)≤c·g(n)。<br>
              <span class="math">f(n)=Ω(g(n))</span>：存在 c、n₀，使 f(n)≥c·g(n)。<br>
              <span class="math">f(n)=Θ(g(n))</span>：同时是 O 和 Ω。</p>
            </div>
            <p>本课程大量出现 <span class="math">O(|V|+|E|)</span>、<span class="math">O(|V||E|)</span>、<span class="math">O(n³)</span>。写复杂度时要说清楚变量：图算法用 |V|、|E|，DP 用子问题个数 × 每个子问题的代价。</p>
            <div class="insight"><span class="label">考场习惯</span>先数子问题，再乘“算一个子问题要枚举多少种选择”。例如 Optimal BST 有 Θ(n²) 个区间，每个区间枚举 Θ(n) 个根，所以 Θ(n³)。</div>
          `
        },
        {
          title: "0.2 树与二叉搜索树（BST）",
          html: `
            <p><strong>树</strong>是连通无环无向图；n 个结点的树恰有 n−1 条边，且任意两点间只有一条简单路径。<strong>二叉树</strong>的每个结点最多两个孩子。</p>
            <p><strong>BST 性质</strong>：对任意结点 u，左子树所有 key 都小于 u 的 key，右子树所有 key 都大于 u 的 key（本课程不讨论重复 key）。</p>
            <div class="definition"><span class="label">层与代价</span>
              <p><span class="math">level<sub>T</sub>(u)</span> = 从根到 u 经过的边数，根为 0。<strong>深度</strong>是最大层数。查找 u 的代价为 <span class="math">cost<sub>T</sub>(u)=1+level<sub>T</sub>(u)</span>，即访问结点数。</p>
            </div>
            <p>平衡 BST 的深度是 O(log n)，但“平衡”只对<em>等概率</em>查找友好。若 key 的搜索频率不同，最优树可能故意不平衡——这正是 Optimal BST 的起点。</p>
            <div class="warn"><span class="label">易错</span>代价不是 level，而是 1+level；根结点的查找代价是 1，不是 0。</div>
          `
        },
        {
          title: "0.3 动态规划：五步法",
          html: `
            <p>DP 的本质：<strong>按依赖顺序求解子问题，并记住每个子问题的答案，避免重复计算</strong>。递归慢，往往是因为同一个子问题被反复展开。</p>
            <ol>
              <li><strong>定义子问题</strong>：用哪些参数刻画？例如 <span class="math">opt(k)</span>、<span class="math">opt(i,j)</span>、<span class="math">optavg(a,b)</span>。</li>
              <li><strong>写递推</strong>：原问题的最优解如何由子问题最优解组合？</li>
              <li><strong>定 base case</strong>：空区间、长度为 0、i=0 等。</li>
              <li><strong>找拓扑序</strong>：被依赖的子问题必须先算。可以画依赖图，任何拓扑序都行。</li>
              <li><strong>算答案 + piggyback</strong>：额外记录“选择了哪个分支”，最后回溯构造方案。</li>
            </ol>
            <h3>例 1：Rod Cutting</h3>
            <p><span class="math">opt(n)=max<sub>1≤i≤n</sub>{P[i]+opt(n−i)}</span>，<span class="math">opt(0)=0</span>。子问题按 n 从小到大算，O(n²)。记录 <span class="math">bestSub(n)</span> 即可还原切割方案。</p>
            <h3>例 2：LCS</h3>
            <p>令 <span class="math">f(i,j)</span> 为 <span class="math">x[1..i]</span> 与 <span class="math">y[1..j]</span> 的 LCS 长度：</p>
            <div class="math-block">f(i,j)=0 &nbsp;若 i=0 或 j=0<br>f(i,j)=f(i−1,j−1)+1 &nbsp;若 x[i]=y[j]<br>f(i,j)=max{f(i−1,j), f(i,j−1)} &nbsp;否则</div>
            <p>按行或按列扫描都行，因为每个格子只依赖左、上、左上。O(nm)。</p>
            <div class="insight"><span class="label">DP 与 DAG</span>子问题 = 顶点，依赖 = 有向边。依赖图必须是 DAG；拓扑序就是合法的计算顺序。这是“Dependency”一讲的核心。</div>
          `
        },
        {
          title: "0.4 图论工具箱",
          html: `
            <p><strong>有向图</strong> G=(V,E)；边 (u,v) 有方向。<strong>无向图</strong>用 {u,v} 表示。简单图没有自环、没有重边。</p>
            <ul>
              <li><strong>路径</strong>：顶点序列，相邻点有边；<strong>简单路径</strong>不重复顶点。</li>
              <li><strong>环</strong>：起点=终点的路径；<strong>负环</strong>是总权为负的环。</li>
              <li><strong>DAG</strong>：有向无环图。DAG 存在拓扑序；拓扑序中每条边都从左指向右。</li>
              <li><strong>可达</strong>：u 能沿有向路径到达 v。传递闭包记录所有可达对。</li>
              <li><strong>邻接表</strong>：O(|V|+|E|) 空间；遍历一个点的出边与其度数成正比。</li>
              <li><strong>DFS/BFS</strong>：O(|V|+|E|)。DFS 用栈/递归，BFS 用队列。</li>
              <li><strong>强连通</strong>：u、v 互相可达。强连通分量（SCC）是极大的互相可达点集。</li>
            </ul>
            <div class="definition"><span class="label">缩点图</span>把每个 SCC 缩成一个点，若原图有跨 SCC 的边 S<sub>i</sub>→S<sub>j</sub> 就连边。缩点图一定是 DAG。</div>
          `
        },
        {
          title: "0.5 MST、度量与概率",
          html: `
            <p><strong>生成树</strong>：包含全部顶点、n−1 条边的无环连通子图。<strong>MST</strong> 是总权最小的生成树。Prim：每次取连接“已选集合 S”和“未选集合 V\\S”的最轻跨边，O((|V|+|E|)log|V|)。</p>
            <p><strong>割性质</strong>：任意割的最轻跨边一定属于某棵 MST。TSP 的 2-近似就建立在“Hamiltonian 环删一条边得到生成树，所以 OPT ≥ w(MST)”上。</p>
            <p><strong>三角不等式</strong>：<span class="math">dist(x,z) ≤ dist(x,y)+dist(y,z)</span>。欧氏距离、最短路距离都满足；一般图的边权不一定满足。</p>
            <p><strong>期望的线性性</strong>：<span class="math">E[ΣX<sub>i</sub>]=ΣE[X<sub>i</sub>]</span>，不要求 X<sub>i</sub> 独立。这是 MAX-3SAT 与随机 Max-Cut 的全部概率工具。独立变量各自以 1/2 取 0/1 时，k 个不同文字的 OR 为假的概率是 (1/2)<sup>k</sup>。</p>
            <div class="insight"><span class="label">NP-hard 的正确说法</span>“除非 P=NP，否则不存在多项式时间精确算法。”近似算法仍然可以在多项式时间内给出有保证的近似解。</div>
          `
        }
      ],
      formulas: [
        { label: "BST 查找代价", body: "cost<sub>T</sub>(u)=1+level<sub>T</sub>(u)", note: "根结点代价为 1" },
        { label: "Rod Cutting", body: "opt(n)=max<sub>1≤i≤n</sub>{P[i]+opt(n−i)}", note: "O(n²)" },
        { label: "LCS", body: "f(i,j)=f(i−1,j−1)+1 或 max{f(i−1,j),f(i,j−1)}", note: "O(nm)" },
        { label: "树的边数", body: "|E<sub>tree</sub>|=|V|−1", note: "连通无环" }
      ],
      pitfalls: [
        "把 BST 的 level 与 cost 混为一谈（cost=level+1）。",
        "DP 只写递推，不检查依赖方向，导致用未计算的子问题。",
        "把“拓扑序”当成唯一；任何合法拓扑序都可以。",
        "把最短路距离误认为一定满足三角不等式——它确实满足，但任意边权不一定。",
        "把 NP-hard 说成“没有算法”；正确说法是“没有多项式时间精确算法，除非 P=NP”。"
      ],
      takeaway: "先修部分只要抓住四件事：BST 的代价定义、DP 的子问题/依赖/回溯、图的路径与 DAG、MST 与三角不等式。后面每个证明都会回到它们。",
      demo: "pre",
      quiz: [
        { q: "在 BST 中，根结点的查找代价 cost<sub>T</sub>(root) 是多少？", options: ["0", "1", "树高", "log n"], answer: 1, why: "cost=1+level，根结点的 level=0，所以代价为 1。" },
        { q: "动态规划能够加速递归，最根本的原因是：", options: ["递归一定比循环慢", "子问题有重叠，缓存后避免重复计算", "DP 一定能把指数时间变成多项式时间", "DP 不需要证明正确性"], answer: 1, why: "DP 的核心是记忆重叠子问题；不是所有递归/问题都能 DP。" },
        { q: "下面哪个图一定存在拓扑序？", options: ["任意有向图", "任意无向图", "DAG", "含负权边的图"], answer: 2, why: "有向无环图（DAG）才保证有拓扑序。" },
        { q: "n 个结点的树有多少条边？", options: ["n", "n−1", "n+1", "2n"], answer: 1, why: "树连通且无环，恰有 n−1 条边。" }
      ]
    },

    {
      id: "bst",
      index: "01",
      title: "Optimal BST",
      en: "Dynamic Programming 5: Optimal BST",
      short: "带权平均查找代价最小的二叉搜索树：区间 DP、O(n³) 与重建",
      duration: "45–55 min",
      level: "核心",
      examWeight: "DP 压轴 / 构造题",
      blurb: "BST 的结构由“根是谁”决定；固定根后，左右子树独立。这个最优子结构给出一个区间 DP，也解释了为什么“选最大权作根”的贪心会错。",
      prerequisites: ["BST 的 level/cost 定义", "DP 五步法", "区间子问题", "piggyback 重建"],
      tags: ["区间 DP", "O(n³)", "最优子结构", "重建"],
      concepts: [
        {
          title: "1.1 问题：频率不均时，平衡树未必最好",
          html: `
            <p>给定有序 key 集合 <span class="math">S={1,2,…,n}</span> 和正权 <span class="math">W[i]</span>。构造一棵 BST T，使平均查找代价最小：</p>
            <div class="math-block">avgcost(T)=<span class="sum"><span class="top">n</span><span class="bot">i=1</span></span> W[i]·cost<sub>T</sub>(i)，&nbsp; cost<sub>T</sub>(i)=1+level<sub>T</sub>(i)</div>
            <p>讲义例子：W=(40,15,35,10) 时，BST 20/10/40/30 的平均代价为 40%·2+15%·1+35%·3+10%·2=2.2。若权是绝对整数，则不乘百分比，直接求和。</p>
            <div class="insight"><span class="label">直觉</span>高频 key 应靠近根；但把某个高频 key 提为根，会把另一侧的所有 key 压深一层。“谁当根”是全局权衡。</div>
          `
        },
        {
          title: "1.2 子问题与递推",
          html: `
            <p>定义 <span class="math">optavg(a,b)</span> 为 key 集合 <span class="math">{a,…,b}</span> 的最小平均代价；空区间为 0。固定根 <span class="math">r∈[a,b]</span> 后，左子树是 <span class="math">{a,…,r−1}</span>，右子树是 <span class="math">{r+1,…,b}</span>。</p>
            <div class="definition"><span class="label">关键 Lemma</span>
              <p><span class="math">avgcost(T)=<span class="sum"><span class="top">b</span><span class="bot">i=a</span></span>W[i]+avgcost(T<sub>1</sub>)+avgcost(T<sub>2</sub>)</span>。</p>
            </div>
            <p>证明：把每个 key 的 cost 拆成 1+level。整个区间每个 key 都先贡献一次 W[i]；左/右子树中的 key 在子树里再贡献自己的层数，而子树的层数正好对应原树中相对根下移一层后的额外代价。</p>
            <div class="math-block">optavg(a,b)=<span class="sum"><span class="top">b</span><span class="bot">i=a</span></span>W[i] + min<sub>a≤r≤b</sub>{ optavg(a,r−1)+optavg(r+1,b) }</div>
            <p>边界：<span class="math">optavg(a,b)=0</span> 当 <span class="math">a>b</span>。</p>
          `
        },
        {
          title: "1.3 计算顺序与复杂度",
          html: `
            <p>区间 (a,b) 依赖更短的区间：左区间长度 r−a，右区间长度 b−r，都严格小于 b−a+1。因此按<strong>区间长度 len=1..n</strong> 递增计算。</p>
            <ul>
              <li>状态数：Θ(n²) 个区间（含空区间可视为边界）。</li>
              <li>每个状态枚举 r：O(n)。</li>
              <li>总时间：<strong>O(n³)</strong>；空间：O(n²)。</li>
            </ul>
            <p>用前缀和 <span class="math">P[i]=Σ<sub>k=1</sub><sup>i</sup>W[k]</span>，区间和 O(1)：<span class="math">sum(a,b)=P[b]−P[a−1]</span>。</p>
            <pre>for len = 1..n:
  for a = 1..n-len+1:
    b = a+len-1
    opt[a][b] = sum(a,b) + min over r in [a,b] of
                opt[a][r-1] + opt[r+1][b]
    bestroot[a][b] = argmin r</pre>
          `
        },
        {
          title: "1.4 重建最优树（piggyback）",
          html: `
            <p>在求 min 的同时记录 <span class="math">bestroot[a][b]=r</span>。算出 <span class="math">optavg(1,n)</span> 后，从 <span class="math">build(1,n)</span> 开始递归：</p>
            <pre>build(a,b):
  if a > b: return null
  r = bestroot[a][b]
  node = new Node(r)
  node.left  = build(a, r-1)
  node.right = build(r+1, b)
  return node</pre>
            <p>每个区间只建一个结点，共 n 个结点，O(n) 时间。总复杂度仍是 O(n³)。</p>
            <div class="warn"><span class="label">常见失分</span>只输出 optavg(1,n) 而没有记录 bestroot；题目要求“show an optimal BST”时，必须给出树结构或能唯一还原的根表。</div>
          `
        },
        {
          title: "1.5 为什么不能贪心选最大权作根？",
          html: `
            <p>“选 W[i] 最大的 key 作根”看似合理，但它忽略了把其他 key 压深一层的代价。用反例即可推翻。</p>
            <p>反例：n=4，W=(1,2,3,4)。贪心先选 key 4（权最大）作根；左区间 (1,2,3) 又选 key 3 作根，再选 key 2，最终形成链 4-3-2-1，代价 4·1+3·2+2·3+1·4=20。最优树以 key 3 为根（左子树根 2、右孩子 4），代价 3·1+2·2+1·3+4·2=18。贪心输在“最大权 key 在一端，把其他 key 整体压深”。</p>
            <div class="insight"><span class="label">正确做法</span>不要试图证明贪心；直接枚举根 r，用 DP 比较所有可能。Optimal BST 的结构是“区间 + 根”，不是“最大权”。</div>
          `
        }
      ],
      formulas: [
        { label: "平均代价", body: "avgcost(T)=Σ W[i]·(1+level<sub>T</sub>(i))", note: "根代价 1" },
        { label: "区间递推", body: "opt(a,b)=Σ<sub>i=a</sub><sup>b</sup>W[i]+min<sub>r</sub>{opt(a,r−1)+opt(r+1,b)}", note: "空区间 0" },
        { label: "复杂度", body: "O(n³) 时间，O(n²) 空间", note: "Θ(n²) 状态 × O(n) 枚举" },
        { label: "重建", body: "bestroot[a][b]=argmin r", note: "O(n) 建树" }
      ],
      pitfalls: [
        "把 cost 写成 level，导致整棵树少算 ΣW[i]。",
        "忘记区间和 ΣW[i] 是“每一层都要加”的量。",
        "按 a 或 b 递增计算，而不是按区间长度递增，导致依赖未算。",
        "把 optavg(a,b|r) 与 optavg(a,b) 混淆：前者固定根，后者取所有根的最小。",
        "重建时忘记空区间返回 null。",
        "以为最优 BST 一定平衡；权重极端时可能是链。"
      ],
      takeaway: "Optimal BST = 区间 DP 的模板题：固定根 → 左右独立 → 加区间总权 → 枚举根。O(n³) 的关键不是代码，而是能说清“为什么每个 key 都先付 1 次 W[i]”。",
      demo: "bst",
      quiz: [
        { q: "optavg(a,b) 当 a>b 时等于多少？", options: ["∞", "0", "1", "未定义"], answer: 1, why: "空区间没有 key，平均代价为 0。" },
        { q: "固定根 r 后，递推中为什么要加 Σ<sub>i=a</sub><sup>b</sup>W[i]？", options: ["因为每个 key 都多访问一层根", "因为要平衡树高", "因为权重必须归一化", "因为要计算子树大小"], answer: 0, why: "把 cost 拆成 1+level 后，区间内每个 key 都贡献一次 1；子树内部再贡献相对层数。" },
        { q: "计算 optavg(1,n) 的正确顺序是：", options: ["按 a 从 1 到 n", "按 b 从 1 到 n", "按区间长度从小到大", "任意顺序都可以"], answer: 2, why: "长区间依赖短区间，必须按长度递增。" },
        { q: "Optimal BST 的 DP 时间复杂度是：", options: ["O(n)", "O(n²)", "O(n³)", "O(2ⁿ)"], answer: 2, why: "Θ(n²) 个区间，每个枚举 O(n) 个根。" },
        { q: "“选最大权 key 作根”的贪心：", options: ["总是最优", "只在 n≤3 时最优", "不一定最优，需要枚举根", "等价于 DP"], answer: 2, why: "最优 BST 需要全局权衡，贪心没有最优子结构保证。" }
      ]
    },

    {
      id: "dfs",
      index: "02",
      title: "DFS 与白路径定理",
      en: "Review: Depth First Search",
      short: "颜色、栈、DFS 森林，以及 SCC 正确性所依赖的白路径定理",
      duration: "30–40 min",
      level: "基础",
      examWeight: "SCC 证明的前置",
      blurb: "DFS 本身很简单，难的是它的结构性质。白路径定理把“DFS 树的祖先关系”与“只在白点上行走的可达性”精确地联系起来。",
      prerequisites: ["有向图/路径/可达", "栈与递归", "O(|V|+|E|) 遍历"],
      tags: ["DFS", "白路径定理", "DFS 森林", "时间戳"],
      concepts: [
        {
          title: "2.1 三色与栈式 DFS",
          html: `
            <p>维护颜色：<strong>白</strong>=未发现，<strong>灰</strong>=在栈中（已发现但未完成），<strong>黑</strong>=已完成（已弹出）。</p>
            <ol>
              <li>任选白点 v，压栈、染灰，作为一棵 DFS 树的根。</li>
              <li>看栈顶 v：若还有白色出邻居 u，压 u、染灰，令 u 为 v 的孩子。</li>
              <li>若没有白色出邻居，弹出 v、染黑。</li>
              <li>栈空后若还有白点，重新开始一棵新树，最终得到 DFS 森林。</li>
            </ol>
            <p>每条边最多检查一次，每个点入栈/出栈一次，总时间 <span class="math">O(|V|+|E|)</span>。</p>
            <div class="insight"><span class="label">黑化顺序</span>“turn black”的顺序就是完成时间（finish time）的顺序。SCC 算法第一步正是给第 i 个变黑的点标号 i。</div>
          `
        },
        {
          title: "2.2 白路径定理",
          html: `
            <div class="definition"><span class="label">White Path Theorem</span>
              <p>设 u 刚进入栈。此时 v 将成为 u 在 DFS 森林中的<strong>真后代</strong>，当且仅当存在一条从 u 到 v、且只经过<strong>白点</strong>的路径。</p>
            </div>
            <p>直观：DFS 一旦从 u 出发，就会沿着所有仍可达的白点深入；在 u 变黑之前，任何“只经过白点”的可达点都逃不出 u 的子树。反之，若路径上有灰点/黑点，DFS 可能已经把它归到别的子树。</p>
            <div class="warn"><span class="label">注意时刻</span>定理强调的是“u 刚入栈的那一瞬间”。之后颜色会变化，不能再用同一组白点复述。</div>
          `
        },
        {
          title: "2.3 为什么 SCC 需要它",
          html: `
            <p>SCC 算法的正确性证明反复使用：在第二次 DFS（在 G<sup>rev</sup> 上）中，从某个 SCC 的最大标号点 u 出发，</p>
            <ul>
              <li>u 能沿白点到达本 SCC 的所有点（强连通）；</li>
              <li>u 不能沿白点到达任何标号更小的 SCC（那些 SCC 已被染黑/由标号关系保证）。</li>
            </ul>
            <p>于是白路径定理告诉我们：这棵 DFS 树恰好等于该 SCC。没有白路径定理，SCC 算法就只能“看起来对”。</p>
          `
        }
      ],
      formulas: [
        { label: "DFS 时间", body: "O(|V|+|E|)", note: "邻接表" },
        { label: "颜色含义", body: "白：未发现；灰：在栈；黑：已完成", note: "灰点构成当前递归栈" },
        { label: "白路径定理", body: "v 是 u 的真后代 ⇔ u 在白点上可达 v", note: "在 u 入栈时刻" }
      ],
      pitfalls: [
        "把灰色当成“已访问完”；灰色其实还在栈中，可能还有未探索的出边。",
        "忘记 DFS 可能产生森林，不只是一棵树。",
        "把白路径定理的“白点”理解成“任意未访问点”，忽略路径上所有中间点都必须白。",
        "认为 DFS 的树边就是所有可达边；只有递归进入的边才是树边。"
      ],
      takeaway: "DFS 的考点不是怎么写，而是三个不变量：灰点=当前栈、黑点=完成、白路径=后代。SCC 的证明就是把第三个不变量用在 G^rev 上。",
      demo: "dfs",
      quiz: [
        { q: "DFS 中灰色结点表示：", options: ["尚未发现", "已发现且仍在栈中", "已经完成", "是根结点"], answer: 1, why: "灰色表示已入栈但尚未弹出。" },
        { q: "白路径定理中，路径上的点必须：", options: ["全部是黑点", "全部是灰点", "全部是白点", "颜色任意"], answer: 2, why: "定理要求从 u 到 v 的一条全白路径。" },
        { q: "DFS 的时间复杂度是：", options: ["O(|V|²)", "O(|V|+|E|)", "O(|E|log|V|)", "O(|V||E|)"], answer: 1, why: "每个点入栈一次，每条边检查一次。" },
        { q: "若 DFS 结束后仍有白点，说明：", options: ["算法出错", "图不连通/需要从新根重启", "存在负环", "图一定是 DAG"], answer: 1, why: "需要重启形成 DFS 森林。" }
      ]
    },

    {
      id: "scc",
      index: "03",
      title: "强连通分量",
      en: "Finding Strongly Connected Components",
      short: "Kosaraju 型三遍扫描、标号、缩点图与正确性证明",
      duration: "45–60 min",
      level: "核心",
      examWeight: "证明 + 实现 + 缩点 DP",
      blurb: "SCC 把任意有向图压成 DAG。算法只有三步，但每一步的方向、标号大小和反图选择都容易记反；理解 G^scc 的标号单调性是关键。",
      prerequisites: ["DFS 与白路径定理", "有向图可达", "DAG/拓扑序"],
      tags: ["SCC", "Kosaraju", "缩点", "DAG"],
      concepts: [
        {
          title: "3.1 定义与基本事实",
          html: `
            <p>有向图 G 的<strong>强连通分量</strong>（SCC）是极大点集 S：S 内任意两点互相可达，且不能再加入任何点而保持该性质。</p>
            <ul>
              <li>SCC 两两不交（若相交，并集仍强连通，违反极大性）。</li>
              <li>把所有 SCC 缩成点，跨 SCC 的边构成 <span class="math">G<sup>scc</sup></span>；它一定是 <strong>DAG</strong>。</li>
              <li>若 G<sup>scc</sup> 有环，环上的 SCC 会合并成一个更大的强连通分量，矛盾。</li>
            </ul>
          `
        },
        {
          title: "3.2 三步算法",
          html: `
            <ol>
              <li><strong>在 G 上 DFS</strong>，按变黑（弹出）顺序给点标号 1..n。第 i 个变黑的点 label=i。</li>
              <li><strong>构造反图 G<sup>rev</sup></strong>：每条边 (u,v) 变成 (v,u)。</li>
              <li><strong>在 G<sup>rev</sup> 上 DFS</strong>：第一次从 label 最大的点开始；每次重启从“尚未访问的点中 label 最大”的开始。每棵 DFS 树的点集就是一个 SCC。</li>
            </ol>
            <div class="insight"><span class="label">记忆</span>原图跑一遍记完成顺序；反图按“完成得最晚”优先。完成晚 ≈ 更靠近源 SCC；反图从源 SCC 出发，只会困在本 SCC。</div>
          `
        },
        {
          title: "3.3 标号单调性与正确性",
          html: `
            <p>对 SCC S 定义 <span class="math">label(S)=max<sub>v∈S</sub>label(v)</span>。若 G<sup>scc</sup> 有边 S<sub>i</sub>→S<sub>j</sub>，则</p>
            <div class="math-block">label(S<sub>i</sub>) &gt; label(S<sub>j</sub>)</div>
            <p>证明用白路径定理：设 S<sub>i</sub>∪S<sub>j</sub> 中最先变灰的点为 u。无论 u 在 S<sub>i</sub> 还是 S<sub>j</sub>，DFS 都会在白点上到达另一个 SCC 的所有点；先完成的总是“下游”的 S<sub>j</sub>，所以 S<sub>i</sub> 的标号更大。</p>
            <p>推论：若 G<sup>rev</sup> 中 (v,u) 是 u 的入边且 v 不在 u 的 SCC，则 v 所在 SCC 的标号更小（因为原图有 u→v）。</p>
            <p>对 SCC 按 label 从大到小排序 S<sub>1</sub>,…,S<sub>t</sub>。归纳证明第 k 次 DFS 树恰好是 S<sub>k</sub>：</p>
            <ul>
              <li>S<sub>k</sub> 强连通 ⇒ 从最大标号点 u 可白路径到达 S<sub>k</sub> 全部；</li>
              <li>由推论，u 在 G<sup>rev</sup> 中不能白路径到达任何更晚（标号更小）的 SCC；</li>
              <li>白路径定理 ⇒ 树 = S<sub>k</sub>。</li>
            </ul>
          `
        },
        {
          title: "3.4 缩点图上的 DP",
          html: `
            <p>很多“任意有向图”上的问题，先求 SCC，再在 DAG 上做 DP。例如：每个点有权 w<sub>u</sub>，求从 u 出发能到达的最小权。</p>
            <ol>
              <li>求 SCC，把每个 SCC 的权定义为内部最小权。</li>
              <li>建 G<sup>scc</sup>，按拓扑序逆序 DP：<span class="math">W(S)=min(w<sub>S</sub>, min<sub>S→T</sub>W(T))</span>。</li>
              <li>原图中 u 的答案 = 其 SCC 的 W 值。</li>
            </ol>
            <p>总时间 O(|V|+|E|)。</p>
          `
        }
      ],
      formulas: [
        { label: "算法复杂度", body: "O(|V|+|E|)", note: "两次 DFS + 建反图" },
        { label: "标号单调", body: "S<sub>i</sub>→S<sub>j</sub> ⇒ label(S<sub>i</sub>)>label(S<sub>j</sub>)", note: "缩点图是 DAG" },
        { label: "第二次 DFS", body: "在 G<sup>rev</sup> 上按 label 从大到小", note: "每棵树 = 一个 SCC" },
        { label: "缩点 DP", body: "W(S)=min(w<sub>S</sub>, min<sub>S→T</sub>W(T))", note: "按逆拓扑序" }
      ],
      pitfalls: [
        "第二次 DFS 跑在原图而不是反图。",
        "按 label 从小到大而不是从大到小。",
        "把 label 定义为发现时间（变灰）而不是完成时间（变黑）。",
        "以为 SCC 图可能有环；它一定是 DAG。",
        "忘记 SCC 是“极大”的，把可合并的两个分量分开。"
      ],
      takeaway: "SCC 算法 = 完成顺序 + 反图 + 最大标号优先。正确性 = 缩点图 DAG + 标号沿边严格下降 + 白路径定理。缩点后，所有“任意有向图”问题都可以尝试转成 DAG DP。",
      demo: "scc",
      quiz: [
        { q: "SCC 算法第二步应在哪个图上 DFS？", options: ["原图 G", "反图 G<sup>rev</sup>", "缩点图", "任意生成树"], answer: 1, why: "在反图上按最大标号优先，才能把每个 SCC 单独分出来。" },
        { q: "若 G<sup>scc</sup> 有边 S<sub>i</sub>→S<sub>j</sub>，则：", options: ["label(S<sub>i</sub>) < label(S<sub>j</sub>)", "label(S<sub>i</sub>) > label(S<sub>j</sub>)", "两者相等", "无法比较"], answer: 1, why: "沿缩点图的边，标号严格下降。" },
        { q: "G<sup>scc</sup> 一定是什么图？", options: ["完全图", "DAG", "树", "二分图"], answer: 1, why: "若缩点图有环，环上的 SCC 会合并，矛盾。" },
        { q: "SCC 算法的总时间复杂度是：", options: ["O(|V|²)", "O(|V|+|E|)", "O(|E|log|V|)", "O(|V||E|)"], answer: 1, why: "两次线性 DFS，加一次线性建反图。" }
      ]
    },

    {
      id: "dijkstra",
      index: "04",
      title: "Dijkstra",
      en: "SSSP with Non-Negative Weights",
      short: "非负权单源最短路：贪心选最近点、松弛、最短路树",
      duration: "35–45 min",
      level: "核心",
      examWeight: "手跑表格 + 正确性证明",
      blurb: "Dijkstra 的贪心之所以正确，是因为非负边权保证了“已弹出的点不会再有更短路径”。一旦有负边，这个不变量立刻崩塌。",
      prerequisites: ["加权有向图", "路径长度/最短路", "优先队列", "松弛操作"],
      tags: ["SSSP", "贪心", "优先队列", "最短路树"],
      concepts: [
        {
          title: "4.1 SSSP 与松弛",
          html: `
            <p>给定源点 s，求 s 到每个点的最短距离 <span class="math">spdist(s,v)</span>，并输出最短路树（每个点记录 parent）。不可达距离为 ∞。</p>
            <div class="definition"><span class="label">Relax(u,v)</span>
              <p>若 <span class="math">dist(v) &gt; dist(u)+w(u,v)</span>，则更新 <span class="math">dist(v)=dist(u)+w(u,v)</span>，并令 <span class="math">parent(v)=u</span>。</p>
            </div>
            <p>dist 始终是“目前找到的最短路径长度”的上界；松弛只会让 dist 下降，不会上升。</p>
          `
        },
        {
          title: "4.2 算法",
          html: `
            <pre>dist[s]=0; dist[v]=∞ for v≠s
S = V
while S not empty:
  u = argmin_{v in S} dist[v]
  remove u from S
  for each edge (u,v):
    if dist[v] > dist[u] + w(u,v):
      dist[v] = dist[u] + w(u,v)
      parent[v] = u</pre>
            <p>用二叉堆/优先队列实现：每条边一次松弛，O(log |V|)；总时间 <span class="math">O((|V|+|E|)log|V|)</span>。用 Fibonacci 堆可到 O(|V|log|V|+|E|)，课程只要求前者。</p>
            <div class="insight"><span class="label">手跑技巧</span>每轮先写“已确定集合 S”与候选 dist 表，再选最小。若并列，题目通常会说明；否则任选一个都可，但顺序可能不同。</div>
          `
        },
        {
          title: "4.3 正确性：弹出即最终",
          html: `
            <p>要证：每次从 S 中取出 dist 最小的 v 时，<span class="math">dist(v)=spdist(v)</span>。对弹出顺序归纳。</p>
            <p>设 v 是当前要弹出的点，取一条真正的最短路 s→…→v。令 u 是这条路上第一个“满足 spdist(u)=spdist(v)”的点（从 s 往 v 方向）。u 到 v 的剩余路径长度可能为 0（都是 0 权边）。</p>
            <p>关键观察：在 v 被弹出时，u 之前的所有点（除可能的 u）都已经弹出。若某个点 z 还没弹出，则它沿着最短路的前驱已经把它松弛过，故 <span class="math">dist(z)=spdist(z)&lt;spdist(v)</span>，这与 v 是 S 中 dist 最小矛盾。</p>
            <p>于是 <span class="math">dist(v) ≤ dist(u) = spdist(u) = spdist(v)</span>；又 dist 不可能小于真实最短路，故相等。</p>
            <div class="warn"><span class="label">非负性用在哪</span>“spdist(z) &lt; spdist(v)”这一步。如果边权为负，沿最短路后面可能出现更短的距离，v 就不该被提前弹出。</div>
          `
        },
        {
          title: "4.4 负权反例与 DAG 特例",
          html: `
            <p>反例：s→a 权 1，s→b 权 2，b→a 权 −2。Dijkstra 先弹出 a（dist=1）并宣布最终，但真实 spdist(s,a)=0（s→b→a）。</p>
            <p>若图是 <strong>DAG</strong>，即使有负权也可以按拓扑序做 DP：<span class="math">dist(v)=min<sub>(u,v)∈E</sub>{dist(u)+w(u,v)}</span>，O(|V|+|E|)。这不属于 Dijkstra，但常与它对比。</p>
          `
        }
      ],
      formulas: [
        { label: "松弛", body: "dist(v)=min(dist(v), dist(u)+w(u,v))", note: "成功时更新 parent" },
        { label: "复杂度", body: "O((|V|+|E|)log|V|)", note: "二叉堆" },
        { label: "正确性前提", body: "所有边权 ≥ 0", note: "否则弹出未必最终" },
        { label: "DAG SSSP", body: "按拓扑序 dist(v)=min<sub>u→v</sub>{dist(u)+w(u,v)}", note: "允许负权，O(V+E)" }
      ],
      pitfalls: [
        "把“已发现”当成“已确定”；只有弹出 S 的点才最终确定。",
        "在负权图上仍用 Dijkstra。",
        "更新 dist 却忘记更新 parent，最后无法输出最短路树。",
        "认为不可达点的 dist 是 0；应为 ∞。",
        "手跑时把候选 dist 与最终 spdist 混写。"
      ],
      takeaway: "Dijkstra = 每次取当前最近点并松弛出边。正确性只依赖非负权：已弹出点的 dist 不会再被后来路径改进。负权请换 Bellman–Ford；DAG 可直接拓扑 DP。",
      demo: "dijkstra",
      quiz: [
        { q: "Dijkstra 在什么条件下正确？", options: ["所有边权非负", "所有边权为 1", "图必须是 DAG", "图必须连通"], answer: 0, why: "非负权保证弹出点的 dist 已是最终最短路。" },
        { q: "使用二叉堆的 Dijkstra 时间复杂度是：", options: ["O(|V|+|E|)", "O((|V|+|E|)log|V|)", "O(|V||E|)", "O(|V|³)"], answer: 1, why: "每条边一次松弛，堆操作 O(log V)。" },
        { q: "松弛边 (u,v) 时，若 dist(v) ≤ dist(u)+w(u,v)，应：", options: ["更新 dist(v)", "什么都不做", "删除边", "把 v 弹出"], answer: 1, why: "当前路径不更短，不更新。" },
        { q: "负权边会让 Dijkstra 失效的根本原因是：", options: ["堆不能处理负数", "已弹出点仍可能被更短路径改进", "负权边会形成环", "dist 会变成负数"], answer: 1, why: "非负性保证后续路径不会更短；负权破坏这个不变量。" }
      ]
    },

    {
      id: "bellman",
      index: "05",
      title: "Bellman–Ford",
      en: "SSSP with Arbitrary Weights",
      short: "负权、负环、|V|−1 轮松弛、最短路树与负环检测",
      duration: "35–50 min",
      level: "核心",
      examWeight: "手跑多轮表 + 负环证明",
      blurb: "当边权可以为负，Dijkstra 的贪心不再成立。Bellman–Ford 用“最多经过 k 条边”的动态规划思想，做 |V|−1 轮全边松弛。",
      prerequisites: ["路径/环/负环", "松弛", "归纳法", "简单路径"],
      tags: ["负权", "负环", "动态规划", "O(VE)"],
      concepts: [
        {
          title: "5.1 负权与负环",
          html: `
            <p>路径长度是边权之和，可以为负。若存在从 s 可达的<strong>负环</strong>，则最短路径无定义（可以绕环无限次，长度趋于 −∞）。</p>
            <p>课程假设：G 没有负环（或至少没有从 s 可达的负环）。即使有负边，最短路径仍可取为<strong>简单路径</strong>：若路径重复顶点，中间的环长度非负，删掉它不会变长。</p>
            <div class="definition"><span class="label">关键 Corollary</span>无负环时，任意两点间存在一条最多 |V|−1 条边的最短路径。</div>
          `
        },
        {
          title: "5.2 算法与正确性",
          html: `
            <pre>dist[s]=0; dist[v]=∞ for v≠s
repeat |V|-1 times:
  for each edge (u,v) in E (任意顺序):
    if dist[v] > dist[u] + w(u,v):
      dist[v] = dist[u] + w(u,v)
      parent[v] = u</pre>
            <p>时间 O(|V||E|)。正确性对“最短路径边数 ℓ”归纳：</p>
            <ul>
              <li>ℓ=0：v=s，初始 dist=0。</li>
              <li>设 ℓ=i，最短路最后一条边是 (p,v)。第 i−1 轮后 dist(p)=spdist(p)；第 i 轮松弛 (p,v) 时，dist(v) 被压到 spdist(v)。</li>
              <li>dist 不会低于真实最短路，故相等。</li>
            </ul>
            <p>由于最短简单路径 ≤|V|−1 条边，|V|−1 轮足够。</p>
            <div class="insight"><span class="label">提前停止</span>若某一轮没有任何更新，后面也不会再更新，可提前结束（最坏仍 O(VE)）。</div>
          `
        },
        {
          title: "5.3 负环检测",
          html: `
            <p>做完 |V|−1 轮后，再扫一遍所有边。若仍存在 (u,v) 使</p>
            <div class="math-block">dist(v) &gt; dist(u)+w(u,v)</div>
            <p>则存在从 s 可达的负环。</p>
            <ul>
              <li><strong>若无负环</strong>：所有 dist 已是最终最短路，不可能再松弛。</li>
              <li><strong>若有负环</strong>：沿负环走一圈总权为负；把环上不等式相加会得到 0&gt;负环总权，矛盾。因此至少有一条边仍可松弛。</li>
            </ul>
            <p>注意：该检测只对“从 s 可达”的负环有效。若负环不可达，dist 全是 ∞，不会触发。</p>
          `
        },
        {
          title: "5.4 输出最短路树",
          html: `
            <p>每次成功松弛 (u,v) 时令 <span class="math">parent(v)=u</span>。最终每个可达 v 沿 parent 回溯到 s，得到一条最短路；所有 parent 边构成以 s 为根的最短路树。</p>
            <p>若存在负环，parent 可能形成环，不能输出树；应先检测并报告负环。时间仍是 O(|V||E|)。</p>
          `
        }
      ],
      formulas: [
        { label: "轮数", body: "|V|−1 轮全边松弛", note: "简单最短路最多 |V|−1 条边" },
        { label: "复杂度", body: "O(|V||E|)", note: "每轮 O(|E|)" },
        { label: "负环检测", body: "再扫一遍，若仍可松弛 ⇒ 负环", note: "从 s 可达" },
        { label: "最短路树", body: "成功松弛时 parent(v)=u", note: "负环时可能成环" }
      ],
      pitfalls: [
        "只做 |V|−2 轮；最坏需要 |V|−1 轮。",
        "认为每轮必须按固定顺序；任意顺序都正确，只是中间表不同。",
        "把负环检测放在第 |V|−1 轮之前。",
        "忘记负环必须是“从源点可达”的。",
        "把 Bellman–Ford 说成 O(VE) 的 Dijkstra；它不是贪心。"
      ],
      takeaway: "Bellman–Ford = 对“路径边数”做 DP，滚动 |V|−1 轮。无负环时，第 i 轮后所有 ≤i 条边的最短路都正确；第 |V| 轮还能松弛就是负环。",
      demo: "bellman",
      quiz: [
        { q: "Bellman–Ford 需要多少轮全边松弛？", options: ["|E|−1", "|V|−1", "|V|", "log|V|"], answer: 1, why: "无负环时最短简单路径最多 |V|−1 条边。" },
        { q: "第 |V| 轮仍能松弛一条边，说明：", options: ["算法写错了", "存在从源点可达的负环", "图不连通", "存在负权边但无负环"], answer: 1, why: "所有最短路应在 |V|−1 轮后稳定；还能改进只能是负环。" },
        { q: "Bellman–Ford 的时间复杂度是：", options: ["O(|V|+|E|)", "O(|V||E|)", "O(|E|log|V|)", "O(|V|³)"], answer: 1, why: "|V|−1 轮，每轮 O(|E|)。" },
        { q: "负权但无负环时，最短路径可以取为：", options: ["一定含环", "简单路径", "一定只有一条边", "不存在"], answer: 1, why: "重复顶点产生的环非负，可删去而不变长。" }
      ]
    },

    {
      id: "maxflow",
      index: "06",
      title: "最大流",
      en: "Max Flow",
      short: "容量、守恒、残量图、增广路、Ford–Fulkerson 与最小割",
      duration: "45–60 min",
      level: "核心",
      examWeight: "概念 + 残量图 + 证明",
      blurb: "最大流的核心不是“找路径”，而是残量图允许反悔。每一次增广都保持可行，直到残量图再无 s→t 路径；此时最小割给出匹配的上界。",
      prerequisites: ["有向图", "路径/割", "BFS/DFS", "基本证明"],
      tags: ["最大流", "最小割", "残量网络", "Ford–Fulkerson"],
      concepts: [
        {
          title: "6.1 流网络与可行流",
          html: `
            <p>有向图 G=(V,E)，容量 <span class="math">c(u,v)≥0</span>；源 s 无入边，汇 t 无出边。流 <span class="math">f(u,v)</span> 满足：</p>
            <ul>
              <li><strong>容量约束</strong>：0 ≤ f(u,v) ≤ c(u,v)。</li>
              <li><strong>守恒</strong>：除 s、t 外，每个点 <span class="math">Σ<sub>u∈IN(v)</sub>f(u,v)=Σ<sub>w∈OUT(v)</sub>f(v,w)</span>。</li>
            </ul>
            <p>流的值 <span class="math">|f|=Σ<sub>u∈OUT(s)</sub>f(s,u)</span>。由守恒可证它也等于流入 t 的总量。</p>
            <div class="definition"><span class="label">Clean flow</span>不存在一对相反方向同时正流的边：若 f(u,v)&gt;0 则 f(v,u)=0。最大流总可以取 clean flow。</div>
            <p><strong>General flow（一般流）</strong>把流写成反对称函数 F(u,v)=−F(v,u)：满足容量约束，且每个内部点 <span class="math">Σ<sub>v∈V</sub>F(u,v)=0</span>。clean flow 与 general flow 一一对应，值相同。general flow 允许 F(u,v) 为负，正好对应对反向边“退还流量”；残量定义为 <span class="math">R(u,v)=c(u,v)−F(u,v)</span>。这是 Ford–Fulkerson 证明中把“反悔”写成数学的形式。</p>
          `
        },
        {
          title: "6.2 残量图与增广",
          html: `
            <p>给定流 f，残量容量 <span class="math">R(u,v)=c(u,v)−f(u,v)</span>。残量图 G<sub>f</sub> 包含所有 R(u,v)&gt;0 的边。</p>
            <p><strong>增广路</strong>：G<sub>f</sub> 中一条 s→t 的简单路径。其容量为路径上最小 R 值 Δ。</p>
            <p>沿路径增广：正向边 f+=Δ，反向边 f−=Δ。这样既可能“多用一条正向边”，也可能“撤销之前的一部分流”。</p>
            <div class="insight"><span class="label">为什么需要反向边</span>贪心地占满一条边可能不是全局最优；残量图中的反向边让我们把之前的流量“退回去”，重新分配给更优的路径。</div>
          `
        },
        {
          title: "6.3 Ford–Fulkerson 与最小割",
          html: `
            <pre>F = 0
while residual graph has an s-t path P:
  Δ = min residual capacity on P
  augment F along P by Δ
return F</pre>
            <p><strong>最大流最小割定理</strong>：以下三条等价：</p>
            <ol>
              <li>F 是最大流；</li>
              <li>残量图 G<sub>F</sub> 中没有 s→t 路径；</li>
              <li>存在一个 s-t 割 (S,T)，使 |F|=c(S,T)。</li>
            </ol>
            <p>若没有增广路，令 S = 从 s 在 G<sub>F</sub> 中可达的点，T=V\\S。则所有跨割边的残量为 0，即 f(u,v)=c(u,v)；于是 |F|=c(S,T)。而任何流的值 ≤ 任何割的容量，故 F 最大。</p>
            <p>若容量是整数，每次 Δ≥1，最多 M 次增广（M=最大流值），时间 O(|E|M)。用 BFS 找增广路（Edmonds–Karp）可做到 O(|V||E|²)，课程不要求证明。</p>
          `
        },
        {
          title: "6.4 建模提醒",
          html: `
            <p>最大流常被用来建模匹配、分工、网络吞吐等。建图时注意：</p>
            <ul>
              <li>容量是“上界”，不是“必须流满”。</li>
              <li>无向边通常拆成两条有向边，各给容量；或按题意处理。</li>
              <li>点有容量时，拆点：v<sub>in</sub>→v<sub>out</sub> 容量为点容量。</li>
              <li>要求“必须流满”时，先求最大流再看是否达到目标和。</li>
            </ul>
          `
        }
      ],
      formulas: [
        { label: "残量容量", body: "R(u,v)=c(u,v)−f(u,v)", note: "R>0 才有残量边" },
        { label: "增广", body: "f(u,v)+=Δ（正向），f(v,u)−=Δ（反向）", note: "Δ=路径最小残量" },
        { label: "最大流=最小割", body: "max<sub>f</sub>|f| = min<sub>(S,T)</sub>c(S,T)", note: "整数容量 ⇒ 整数最大流" },
        { label: "FF 复杂度", body: "O(|E|·M)", note: "M 为最大流值" }
      ],
      pitfalls: [
        "只加正向边，忘记残量图中的反向边。",
        "把增广路容量算成路径上容量之和；应为最小值。",
        "认为“没有正向容量”就等于没有增广路；反向边也可能构成增广路。",
        "混淆割容量 c(S,T) 与流值；割只算 S→T 的容量，不算 T→S。",
        "忘记容量为整数时最大流值也为整数。"
      ],
      takeaway: "最大流 = 不断在残量图中找 s→t 路并增广。反向边是“反悔”机制。算法终止时，残量图的可达集给出一个割，其容量恰等于流值，从而证明最优。",
      demo: "maxflow",
      quiz: [
        { q: "残量容量 R(u,v) 的定义是：", options: ["f(u,v)−c(u,v)", "c(u,v)−f(u,v)", "c(u,v)+f(u,v)", "c(u,v)"], answer: 1, why: "剩余可增加的容量是容量减去当前流。" },
        { q: "增广路的容量是：", options: ["路径边权之和", "路径上最小残量", "路径上最大残量", "s 的出度"], answer: 1, why: "只能按最瓶颈的边增广。" },
        { q: "最大流最小割定理说明：", options: ["最大流等于最小割容量", "最大流等于最大割", "最小割等于边数", "流值可以超过割"], answer: 0, why: "这是最大流问题的对偶结论。" },
        { q: "Ford–Fulkerson 的 O(|E|M) 中 M 是：", options: ["边数", "点数", "最大流值", "最大容量"], answer: 2, why: "整数容量下每次至少增 1，最多 M 次。" }
      ]
    },

    {
      id: "apsp",
      index: "07",
      title: "APSP · Johnson",
      en: "All-Pairs Shortest Paths",
      short: "重赋权、dummy 顶点、Bellman–Ford 求势函数，再跑 |V| 次 Dijkstra",
      duration: "40–55 min",
      level: "核心",
      examWeight: "重赋权证明 + 复杂度",
      blurb: "Johnson 的巧妙之处：给每个点一个势 h，把边权改成 w+h(u)−h(v)。任意路径长度只差一个端点项，所以最短路不变；选 h 为 dummy 最短路距离，又保证所有新权非负。",
      prerequisites: ["Dijkstra", "Bellman–Ford", "负权/负环", "路径长度求和"],
      tags: ["APSP", "Johnson", "重赋权", "势函数"],
      concepts: [
        {
          title: "7.1 朴素做法",
          html: `
            <p>APSP 要求所有点对的最短路。若全非负：跑 |V| 次 Dijkstra，<span class="math">O(|V|(|V|+|E|)log|V|)</span>。若有负权：跑 |V| 次 Bellman–Ford，<span class="math">O(|V|²|E|)</span>，太慢。</p>
            <p>目标：把负权变成非负，同时保持最短路结构，再跑 Dijkstra。</p>
          `
        },
        {
          title: "7.2 重赋权引理",
          html: `
            <p>任取函数 <span class="math">h:V→ℤ</span>，定义</p>
            <div class="math-block">w′(u,v)=w(u,v)+h(u)−h(v)</div>
            <p>对任意路径 <span class="math">v<sub>1</sub>→…→v<sub>x</sub></span>，其新长度 = 原长度 + h(v<sub>1</sub>)−h(v<sub>x</sub>)。中间项全部望远镜式抵消。</p>
            <div class="definition"><span class="label">推论</span>对固定起点 u 和终点 v，所有路径的新长度都只差同一个常数 h(u)−h(v)，因此<strong>最短路径不变</strong>，最短距离变为 spdist(u,v)+h(u)−h(v)。</div>
            <p>负环也保持：环的 h 项首尾抵消，总权不变。所以重赋权不会制造或消除负环。</p>
          `
        },
        {
          title: "7.3 dummy 顶点与势函数",
          html: `
            <p>加一个虚拟点 <span class="math">v<sub>dummy</sub></span>，向每个原点加一条权 0 的边。用 Bellman–Ford 求</p>
            <div class="math-block">h(u)=spdist(v<sub>dummy</sub>,u)</div>
            <p>由最短路的三角不等式：<span class="math">h(v) ≤ h(u)+w(u,v)</span>，移项得</p>
            <div class="math-block">w′(u,v)=w(u,v)+h(u)−h(v) ≥ 0</div>
            <p>于是所有新权非负，可以安全跑 Dijkstra。</p>
            <div class="insight"><span class="label">为什么 dummy 可行</span>dummy 到所有点距离 ≤0（直接 0 边），所以 h 不会让新权变大；而 Bellman–Ford 保证 h 满足所有边的最短路不等式。</div>
          `
        },
        {
          title: "7.4 算法与复杂度",
          html: `
            <ol>
              <li>加 dummy，建图 G′。</li>
              <li>Bellman–Ford 从 dummy 求所有 h(u)，同时检测负环（若负环则 APSP 无定义）。</li>
              <li>对每条边重赋权 w′。</li>
              <li>对每个源点跑一次 Dijkstra，得到 <span class="math">d′(s,v)</span>。</li>
              <li>还原：<span class="math">spdist(s,v)=d′(s,v)−h(s)+h(v)</span>。</li>
            </ol>
            <p>时间：BF 一次 O(|V||E|) + |V| 次 Dijkstra O(|V|(|V|+|E|)log|V|)。</p>
          `
        }
      ],
      formulas: [
        { label: "重赋权", body: "w′(u,v)=w(u,v)+h(u)−h(v)", note: "路径长度只差端点项" },
        { label: "势函数", body: "h(u)=spdist(v<sub>dummy</sub>,u)", note: "保证 w′≥0" },
        { label: "还原距离", body: "spdist(s,v)=d′(s,v)−h(s)+h(v)", note: "别忘还原" },
        { label: "复杂度", body: "O(|V|(|V|+|E|)log|V|)", note: "BF + |V| 次 Dijkstra" }
      ],
      pitfalls: [
        "重赋权后直接用 d′ 当原距离，忘记减去 h(s) 加上 h(v)。",
        "h 取任意函数就以为非负；必须取 dummy 最短路距离。",
        "用 Dijkstra 求 h；有负权时必须用 Bellman–Ford。",
        "忘记检测负环；有负环时 APSP 无定义。",
        "把路径长度变化写成 h(v)−h(u)（方向反了）。"
      ],
      takeaway: "Johnson = 一次 Bellman–Ford 求势 + |V| 次 Dijkstra。重赋权保持最短路，dummy 保证非负。所有公式都围绕 w′=w+h(u)−h(v) 展开。",
      demo: "johnson",
      quiz: [
        { q: "重赋权 w′(u,v)=w(u,v)+h(u)−h(v) 后，路径长度：", options: ["完全不变", "只差 h(起点)−h(终点)", "只差 h(终点)−h(起点)", "变为原来的一半"], answer: 1, why: "中间项望远镜式抵消，只剩端点项。" },
        { q: "Johnson 中 h(u) 应取：", options: ["任意常数", "dummy 到 u 的最短距离", "u 的度数", "u 的权"], answer: 1, why: "这样由三角不等式保证所有 w′≥0。" },
        { q: "Johnson 的时间复杂度是：", options: ["O(|V|²|E|)", "O(|V|(|V|+|E|)log|V|)", "O(|V|³)", "O(|E|²)"], answer: 1, why: "一次 BF + |V| 次堆 Dijkstra。" },
        { q: "若有从 dummy 可达的负环，则：", options: ["Johnson 仍可运行", "APSP 无定义，应报告负环", "把所有边加常数", "只能跑 BFS"], answer: 1, why: "负环使最短路无定义。" }
      ]
    },

    {
      id: "np",
      index: "08",
      title: "NP-hard 与近似",
      en: "Vertex Cover · MAX-3SAT",
      short: "P/NP、归约、近似比，以及两个入门级近似算法",
      duration: "40–55 min",
      level: "核心",
      examWeight: "证明 + 反例",
      blurb: "NP-hard 不意味着放弃；近似算法给出“离最优最多差多少”的保证。Vertex Cover 用极大匹配给出 2-近似，MAX-3SAT 用随机赋值给出 7/8 期望近似。",
      prerequisites: ["判定/优化问题", "多项式时间", "期望线性性", "图覆盖"],
      tags: ["NP-hard", "归约", "近似比", "Vertex Cover", "MAX-3SAT"],
      concepts: [
        {
          title: "8.1 P、NP 与 NP-hard",
          html: `
            <p><strong>P</strong>：可在多项式时间（确定性图灵机）求解的判定问题。<strong>NP</strong>：给定证书可在多项式时间验证的判定问题。P=NP 是否成立未知。</p>
            <p>若一个问题 P<sub>1</sub> 是 NP-hard，则除非 P=NP，不存在多项式时间精确算法。证明 NP-hard 的常用方法：把已知 NP-hard 的 P<sub>2</sub> 多项式归约到 P<sub>1</sub>。</p>
            <div class="definition"><span class="label">归约方向</span>要证 P<sub>1</sub> NP-hard：取已知 NP-hard 的 P<sub>2</sub>，把 P<sub>2</sub> 的任意实例多项式时间转换成 P<sub>1</sub> 的实例，并证明答案等价。这样“若 P<sub>1</sub> 可解，则 P<sub>2</sub> 可解”。</div>
            <p>优化问题（求最小/最大）与判定问题（是否存在 ≤k）常可互相转化；NP-hard 通常先对判定版本证明。</p>
          `
        },
        {
          title: "8.2 近似比",
          html: `
            <p>对最小化问题，算法 A 是 <strong>α-近似</strong>，若对任意合法输入，A 的输出 ≤ α·OPT。最大化问题则输出 ≥ α·OPT。α≥1（最小化）或 α≤1（最大化）。</p>
            <p>随机算法用期望：<span class="math">E[输出] ≤ α·OPT</span>（最小化）或 <span class="math">E[输出] ≥ α·OPT</span>（最大化）。</p>
          `
        },
        {
          title: "8.3 Vertex Cover 的 2-近似",
          html: `
            <p>无向图 G，顶点覆盖 S：每条边至少有一个端点在 S。目标是 |S| 最小。</p>
            <pre>S = ∅
while E not empty:
  pick an arbitrary edge {u,v}
  add u and v to S
  remove all edges incident to u or v
return S</pre>
            <p>设被选中的边集合为 M。</p>
            <ul>
              <li><strong>M 是匹配</strong>：选了一条边后，其两个端点的所有边都被删，所以 M 中任意两条边不共享端点。</li>
              <li><strong>|M| ≤ OPT</strong>：任何顶点覆盖必须覆盖 M 中每条边；由于 M 两两不共享端点，至少需要 |M| 个不同顶点。</li>
              <li>算法返回 2|M| 个顶点，故 ≤2·OPT。</li>
            </ul>
            <div class="warn"><span class="label">紧例</span>完全二分图 K<sub>n,n</sub>：算法可能选全部 2n 个点，而最优只选一侧 n 个，比值恰为 2。所以“2”不能再改进（至少这个分析不能）。</div>
          `
        },
        {
          title: "8.4 MAX-3SAT 的 7/8 期望近似",
          html: `
            <p>每个变量独立以 1/2 取 0/1。一个含 3 个不同变量文字的子句为假的概率是 (1/2)³=1/8，所以被满足的概率是 7/8。</p>
            <p>由期望线性性，满足子句数的期望 = Σ<sub>clauses</sub> P(该子句被满足) = 7n/8。因此 <span class="math">E[Z]=7n/8 ≥ (7/8)OPT</span>（因为 OPT≤n）。</p>
            <p>对更长的子句（文字在不同变量上），为假概率 (1/2)<sup>k</sup>，满足概率 ≥1/2。</p>
            <div class="insight"><span class="label">随机 ≠ 不确定</span>这是一个随机近似算法；运行时间 O(n)，输出是一个确定的赋值，保证的是期望近似比。</div>
          `
        }
      ],
      formulas: [
        { label: "近似比（最小化）", body: "ALG ≤ α·OPT", note: "α≥1" },
        { label: "VC 算法", body: "|S|=2|M| ≤ 2·OPT", note: "M 为极大匹配" },
        { label: "MAX-3SAT", body: "E[Z]=7n/8", note: "每子句满足概率 7/8" },
        { label: "Max-Cut 随机", body: "E[cut]=|E|/2 ≥ OPT/2", note: "每条边被割概率 1/2" }
      ],
      pitfalls: [
        "把归约方向写反：要证 P1 NP-hard，应从已知 NP-hard 的 P2 归约到 P1。",
        "认为 NP-hard 问题“绝对不能近似”；很多有常数或对数近似。",
        "VC 算法中 M 不是匹配；必须说明选边后删除所有关联边。",
        "把 MAX-3SAT 的 7/8 说成“必定满足 7/8 的子句”；是期望。",
        "忘记 OPT≤n，所以 7n/8 ≥ 7/8·OPT。"
      ],
      takeaway: "近似题的三件套：构造可行解、找下界（OPT 至少/至多多少）、比较。VC 的下界是匹配大小；MAX-3SAT 的下界来自每个子句的满足概率。",
      demo: "np",
      quiz: [
        { q: "要证明问题 P1 是 NP-hard，通常：", options: ["把 P1 归约到已知 NP-hard 问题", "把已知 NP-hard 问题归约到 P1", "证明 P1 不能在 O(n²) 解决", "证明 P1 是 NP"], answer: 1, why: "若已知难题可归约到 P1，则 P1 至少一样难。" },
        { q: "Vertex Cover 的 2-近似算法返回的顶点数是：", options: ["|M|", "2|M|", "|E|", "2|V|"], answer: 1, why: "每条匹配边选两个端点。" },
        { q: "MAX-3SAT 随机赋值下，一个 3-文字子句被满足的概率是：", options: ["1/2", "3/4", "7/8", "1"], answer: 2, why: "全假的概率 1/8，所以满足 7/8。" },
        { q: "K<sub>n,n</sub> 说明 VC 算法的近似比：", options: ["可以小于 1", "恰好可能达到 2", "一定小于 2", "没有上界"], answer: 1, why: "算法选 2n，最优 n，比值 2。" }
      ]
    },

    {
      id: "tsp",
      index: "09",
      title: "TSP",
      en: "Traveling Salesman Problem",
      short: "度量 TSP 的 MST 双走 + 抄近路 2-近似，以及三角不等式为何不可少",
      duration: "35–50 min",
      level: "核心",
      examWeight: "证明 + 构造反例",
      blurb: "TSP 的 2-近似只有三步：求 MST、每条边双走得到闭游走、按首次访问抄近路。所有证明都围绕 OPT ≥ w(MST) 和三角不等式。",
      prerequisites: ["MST/Prim", "Hamiltonian 环", "三角不等式", "闭游走"],
      tags: ["TSP", "MST", "2-近似", "三角不等式"],
      concepts: [
        {
          title: "9.1 问题与度量假设",
          html: `
            <p>完全无向图，边权非负。Hamiltonian 环是经过每个点恰好一次的环。TSP 求最短 Hamiltonian 环，长度记为 OPT。</p>
            <p>课程默认<strong>三角不等式</strong>：<span class="math">w(x,z)≤w(x,y)+w(y,z)</span>。欧氏 TSP 自然满足；一般图不一定。</p>
          `
        },
        {
          title: "9.2 三步算法",
          html: `
            <ol>
              <li>求 MST T（Prim/Kruskal）。</li>
              <li>把 T 的每条边双向走一次，得到闭游走 W（每条树边恰走两次）。可由 DFS 在 O(|V|) 时间生成。</li>
              <li><strong>抄近路</strong>：按 W 的顺序，只保留第一次访问的顶点；最后回到起点。得到 Hamiltonian 环 C。</li>
            </ol>
            <div class="insight"><span class="label">例子</span>W = c a c d c e b e c，首次访问序列 c,a,d,e,b，加回 c 得 C = c-a-d-e-b-c。</div>
          `
        },
        {
          title: "9.3 2-近似证明",
          html: `
            <p><strong>Lemma 1：OPT ≥ w(T)。</strong>任取最优 Hamiltonian 环，删掉任意一条边得到一棵生成树，其权 ≤ OPT；MST 最小，故 w(T)≤OPT。</p>
            <p><strong>Lemma 2：w(W)=2w(T)。</strong>每条树边恰好走两次。</p>
            <p><strong>Lemma 3：w(C)≤w(W)。</strong>抄近路时，把 W 中从 u 到 v 的一段路径替换成直接边 (u,v)。由三角不等式，直接边不长于整段路径。对每段求和即得。</p>
            <p>合并：<span class="math">w(C)≤w(W)=2w(T)≤2OPT</span>。</p>
          `
        },
        {
          title: "9.4 没有三角不等式会怎样",
          html: `
            <p>2-近似证明的 Lemma 3 完全依赖三角不等式；没有它，抄近路可能变长。更强地：若允许任意权，TSP 没有常数近似比（除非 P=NP）。</p>
            <p>归约思路：从 Hamiltonian Cycle 实例构造完全图，原边权 1，非边权 αn+1。若存在 Hamiltonian 环，OPT=n；任何 α-近似若用了非边，长度至少 (n−1)+(αn+1)=(α+1)n&gt;αn，矛盾。因此多项式 α-近似可判定 Hamiltonian Cycle。</p>
            <div class="warn"><span class="label">注意</span>“无三角不等式 ⇒ 不能保证 2”与“无常数近似”是两个层次；后者用归约证明。</div>
          `
        }
      ],
      formulas: [
        { label: "MST 下界", body: "w(MST) ≤ OPT", note: "环删一条边 = 生成树" },
        { label: "双走长度", body: "w(W)=2w(MST)", note: "每条树边两次" },
        { label: "抄近路", body: "w(C)≤w(W)", note: "三角不等式" },
        { label: "近似比", body: "w(C)≤2OPT", note: "2-近似" }
      ],
      pitfalls: [
        "把 W 的长度说成 w(MST)；是 2w(MST)。",
        "抄近路时把“首次访问”与“最后一次访问”混淆。",
        "证明 w(C)≤w(W) 时忘记逐段使用三角不等式。",
        "认为 2-近似对所有 TSP 实例都成立；必须有权重非负 + 三角不等式。",
        "把 Hamiltonian 环与生成树混淆：环删一条边才是树。"
      ],
      takeaway: "TSP 2-近似 = MST 下界 + 双走上界 + 三角不等式抄近路。三个不等式串起来：OPT ≥ w(T)，w(W)=2w(T)，w(C)≤w(W)。",
      demo: "tsp",
      quiz: [
        { q: "TSP 2-近似算法第一步是：", options: ["求最短路", "求 MST", "求最大匹配", "随机排列"], answer: 1, why: "MST 给出 OPT 的下界。" },
        { q: "双走 MST 得到的闭游走长度是：", options: ["w(MST)", "2w(MST)", "OPT", "2OPT"], answer: 1, why: "每条树边恰好走两次。" },
        { q: "抄近路不会变长，依赖：", options: ["容量约束", "三角不等式", "流量守恒", "非负边权"], answer: 1, why: "直接边不长于绕行路径。" },
        { q: "若去掉三角不等式，2-近似：", options: ["仍然成立", "可能失效，且一般无常数近似", "变成 3-近似", "只影响时间复杂度"], answer: 1, why: "证明依赖三角不等式；无常数近似可由 Hamiltonian Cycle 归约证明。" }
      ]
    },

    {
      id: "setcover",
      index: "10",
      title: "Set Cover 与 Hitting Set",
      en: "Approximation Algorithms 3",
      short: "贪心最大 benefit、1+ln|U| 的调和分析、两个问题的互相归约",
      duration: "45–60 min",
      level: "核心",
      examWeight: "证明 + 归约 + 手跑",
      blurb: "Set Cover 的贪心每步选“新覆盖元素最多”的集合。它的近似比是对数级，而不是常数；分析的关键是每步剩余元素至少按 (1−1/OPT) 缩小。",
      prerequisites: ["集合/覆盖", "NP-hard", "归约", "1+x≤eˣ", "对数"],
      tags: ["Set Cover", "Hitting Set", "贪心", "对数近似", "归约"],
      concepts: [
        {
          title: "10.1 两个对偶问题",
          html: `
            <p><strong>Set Cover</strong>：集合族 𝒮，全集 U=∪S。选最少的集合覆盖 U。</p>
            <p><strong>Hitting Set</strong>：集合族 𝒮（每个 S⊆U）。选最小的 H⊆U，使每个 S∈𝒮 都含至少一个 H 中的元素（H∩S≠∅）。</p>
            <p>它们本质上是同一个二分图的“选左”与“选右”：左边是集合，右边是元素，边表示“元素属于集合”。</p>
            <div class="definition"><span class="label">互相转化</span>
              <p>Hitting → Set Cover：对每个元素 e 定义 N<sub>e</sub>={S∈𝒮:e∈S}；以 𝒮 为全集，选最少的 N<sub>e</sub> 覆盖所有集合。选中的 e 组成 hitting set。</p>
              <p>Set Cover → Hitting：对每个元素 e 定义 N<sub>e</sub>={S:e∈S}；以这些 N<sub>e</sub> 为集合族，选 hitting set H；H 中元素对应的集合组成 set cover。</p>
            </div>
          `
        },
        {
          title: "10.2 贪心算法",
          html: `
            <pre>C = ∅
while some element of U is uncovered:
  F = uncovered elements
  choose S ∈ 𝒮 maximizing |S ∩ F|   // benefit
  C = C ∪ {S}
return C</pre>
            <p>每步至少覆盖一个元素，故最多 |U| 步；每步扫描所有集合，时间多项式（O(|U|·Σ|S|)）。</p>
            <div class="insight"><span class="label">手跑</span>每一步都要重新计算 benefit，而不是用初始大小。已覆盖元素不再计入。</div>
          `
        },
        {
          title: "10.3 1+ln|U| 近似证明",
          html: `
            <p>设贪心选出 S<sub>1</sub>,…,S<sub>t</sub>。令 z<sub>i</sub> 为选完 S<sub>i</sub> 后仍未覆盖的元素数，z<sub>0</sub>=|U|，z<sub>t</sub>=0，且 z<sub>t−1</sub>≥1。</p>
            <p>设最优解 C*，|C*|=OPT。在第 i 步前，剩余 z<sub>i−1</sub> 个元素必须被 C* 中某些集合覆盖；由平均，C* 中存在一个集合的 benefit 至少 <span class="math">z<sub>i−1</sub>/OPT</span>。贪心选最大 benefit，所以 S<sub>i</sub> 的 benefit ≥ z<sub>i−1</sub>/OPT。</p>
            <div class="math-block">z<sub>i</sub> ≤ z<sub>i−1</sub>(1−1/OPT)</div>
            <p>迭代：<span class="math">z<sub>t−1</sub> ≤ |U|(1−1/OPT)<sup>t−1</sup> ≤ |U|e<sup>−(t−1)/OPT</sup></span>。又 z<sub>t−1</sub>≥1，取对数：</p>
            <div class="math-block">t ≤ 1 + OPT·ln|U| ≤ (1+ln|U|)·OPT</div>
            <p>这里用了 <span class="math">1+x≤e<sup>x</sup></span>。</p>
          `
        },
        {
          title: "10.4 Hitting Set 的近似",
          html: `
            <p>把 Hitting Set 转成 Set Cover 后，新全集大小 = 原集合族大小 |𝒮|。因此贪心给出 <span class="math">1+ln|𝒮|</span> 近似。</p>
            <p>区间刺穿（stabbing）是典型应用：每个区间是一个集合，每个点 p 对应“包含 p 的区间集合” I<sub>p</sub>；选最少的 I<sub>p</sub> 覆盖所有区间，等价于选最少的点刺穿所有区间。</p>
            <div class="warn"><span class="label">对数不是常数</span>Set Cover 的贪心比可以随 |U| 增长；不能用“2-近似”来描述它。</div>
          `
        }
      ],
      formulas: [
        { label: "贪心近似", body: "|C| ≤ (1+ln|U|)·OPT", note: "Set Cover" },
        { label: "Hitting Set", body: "|H| ≤ (1+ln|𝒮|)·OPT", note: "转成 Set Cover" },
        { label: "收缩", body: "z<sub>i</sub> ≤ z<sub>i−1</sub>(1−1/OPT)", note: "benefit ≥ z<sub>i−1</sub>/OPT" },
        { label: "关键不等式", body: "1+x ≤ e<sup>x</sup>", note: "用于取对数" }
      ],
      pitfalls: [
        "用集合的初始大小而不是当前 benefit。",
        "把 OPT 当成“已选集合数”；它是未知的最优解大小。",
        "把 1+ln|U| 写成常数 2。",
        "归约方向搞反：Set Cover 与 Hitting Set 是双向等价的。",
        "区间刺穿中只用给定点集 P；若允许任意点，需先证明端点足够。"
      ],
      takeaway: "Set Cover 贪心 = 每步最大新覆盖。分析 = 每步剩余至少乘 (1−1/OPT)，再用 1+x≤eˣ 得到 1+ln|U|。Hitting Set 通过二分图转成 Set Cover，近似比变为 1+ln|𝒮|。",
      demo: "setcover",
      quiz: [
        { q: "Set Cover 贪心每步选择：", options: ["最大的集合", "benefit 最大的集合", "第一个集合", "包含元素最少的集合"], answer: 1, why: "benefit 是当前未覆盖元素中被该集合覆盖的数量。" },
        { q: "Set Cover 贪心的近似比是：", options: ["2", "1+ln|U|", "log OPT", "常数 4"], answer: 1, why: "经典调和分析给出 1+ln|U|。" },
        { q: "Hitting Set 转成 Set Cover 后，全集大小是：", options: ["|U|", "|𝒮|", "|E|", "|U|+|𝒮|"], answer: 1, why: "每个原集合对应新全集中的一个元素。" },
        { q: "分析中使用的关键不等式是：", options: ["1+x≤e<sup>x</sup>", "ln x≥x", "e<sup>x</sup>≤1+x", "1/x≤1"], answer: 0, why: "用于把 (1−1/OPT) 放大为指数。" }
      ]
    },

    {
      id: "kcenter",
      index: "11",
      title: "k-Center",
      en: "Approximation Algorithms 4",
      short: "最远点优先、2-近似证明、O(nk) 实现与 r-feasible 的 NP-hard 性",
      duration: "35–50 min",
      level: "核心",
      examWeight: "证明 + 手跑 + 复杂度",
      blurb: "k-Center 的目标是让“最坏的点”离最近中心尽量近。最远点优先贪心给出 2-近似；证明分成“每个最优簇都有中心”和“某个簇有两个中心”两种情况。",
      prerequisites: ["欧氏距离", "三角不等式", "最大/最小", "NP-hard"],
      tags: ["k-Center", "最远点优先", "2-近似", "O(nk)"],
      concepts: [
        {
          title: "11.1 问题定义",
          html: `
            <p>给定点集 P（|P|=n）和整数 k。选 C⊆P，|C|=k，使</p>
            <div class="math-block">pen(C)=max<sub>p∈P</sub> min<sub>c∈C</sub> dist(p,c)</div>
            <p>最小。pen(C) 是最远点到最近中心的距离，也称覆盖半径。OPT 是最优半径。</p>
            <p>问题 NP-hard；课程给出 2-近似。</p>
          `
        },
        {
          title: "11.2 最远点优先算法",
          html: `
            <pre>C = {任意一个点}
repeat k-1 times:
  p = argmax_{p∈P} dist_C(p)   // 离当前中心集最远的点
  C = C ∪ {p}
return C</pre>
            <p>每次扫描 n 个点、更新到新中心的距离，O(n)；共 k 轮，总 O(nk)。</p>
            <div class="insight"><span class="label">直觉</span>每次都把当前“最被忽略”的点变成中心；如果最远点都很近，半径就一定小。</div>
          `
        },
        {
          title: "11.3 2-近似证明",
          html: `
            <p>设最优中心集 C*={c<sub>1</sub>,…,c<sub>k</sub>}，OPT=pen(C*)。把 P 划分成 k 个簇 P<sub>i</sub>：p∈P<sub>i</sub> 当 c<sub>i</sub> 是 p 的最近最优中心。于是对 p∈P<sub>i</sub>，dist(p,c<sub>i</sub>)≤OPT。</p>
            <p>设贪心输出 C<sub>ours</sub>。</p>
            <p><strong>Case 1：</strong>C<sub>ours</sub> 在每个 P<sub>i</sub> 中都有点。对任意 p∈P<sub>i</sub>，取 c∈C<sub>ours</sub>∩P<sub>i</sub>，由三角不等式：</p>
            <div class="math-block">dist(p,c) ≤ dist(p,c<sub>i</sub>)+dist(c<sub>i</sub>,c) ≤ 2OPT</div>
            <p>所以 pen(C<sub>ours</sub>)≤2OPT。</p>
            <p><strong>Case 2：</strong>某个 P<sub>i</sub> 没有 C<sub>ours</sub> 的点。由于 |C<sub>ours</sub>|=k=|C*|，必有另一个 P<sub>j</sub> 含至少两个 C<sub>ours</sub> 的点 c<sub>a</sub>,c<sub>b</sub>。设 c<sub>b</sub> 后选。在选 c<sub>b</sub> 前，c<sub>a</sub> 已在 C 中，且 c<sub>b</sub> 是当时离 C 最远的点，所以</p>
            <div class="math-block">dist(c<sub>a</sub>,c<sub>b</sub>) ≤ dist(c<sub>a</sub>,c<sub>i</sub>)+dist(c<sub>i</sub>,c<sub>b</sub>) ≤ 2OPT</div>
            <p>并且对任意 p，选 c<sub>b</sub> 时 dist<sub>C</sub>(p)≤dist<sub>C</sub>(c<sub>b</sub>)≤dist(c<sub>a</sub>,c<sub>b</sub>)≤2OPT。最终中心更多，距离只会更小，故 pen(C<sub>ours</sub>)≤2OPT。</p>
          `
        },
        {
          title: "11.4 变体与实现",
          html: `
            <ul>
              <li><strong>3D</strong>：算法与证明完全不变，只需换欧氏距离。</li>
              <li><strong>避免开方</strong>：比较距离时比较平方距离即可，仍多项式时间。</li>
              <li><strong>O(nk)</strong>：维护数组 d[p]=到当前中心集的最小距离；每加一个中心 O(n) 更新，找最大 O(n)，共 k 轮。</li>
              <li><strong>r-feasible</strong>：给定半径 r，求最少中心使所有点覆盖。该问题 NP-hard；若有多项式精确算法，可对所有权重试 r 解 k-Center。</li>
            </ul>
          `
        }
      ],
      formulas: [
        { label: "惩罚", body: "pen(C)=max<sub>p</sub> min<sub>c∈C</sub>dist(p,c)", note: "覆盖半径" },
        { label: "近似比", body: "pen(C<sub>ours</sub>) ≤ 2·OPT", note: "度量空间" },
        { label: "复杂度", body: "O(nk)", note: "每轮 O(n) 更新 + 找最大" },
        { label: "平方距离", body: "比较 dist² 即可", note: "避免开方" }
      ],
      pitfalls: [
        "把 k-Center 当成 k-Median（目标是最小距离和，不是最大距离）。",
        "认为算法对任意距离都 2-近似；证明用三角不等式。",
        "Case 2 中忘记“另一个簇有两个中心”来自鸽巢原理。",
        "把 O(nk) 写成 O(n²) 或 O(nk log n)。",
        "r-feasible 是判定/最小中心数问题，不是直接求 k-Center。"
      ],
      takeaway: "k-Center = 最小化最大半径。最远点优先每轮加一个最远点，2-近似证明分两情况：每簇都有中心 ⇒ 三角不等式；某簇缺中心 ⇒ 另一簇两个中心，用贪心最远性。",
      demo: "kcenter",
      quiz: [
        { q: "k-Center 的目标是：", options: ["最小化距离和", "最小化最大距离", "最大化最小距离", "最小化中心数"], answer: 1, why: "pen(C)=max 最近中心距离，最小化它。" },
        { q: "最远点优先算法的时间复杂度是：", options: ["O(n log n)", "O(nk)", "O(n²k)", "O(k²)"], answer: 1, why: "k 轮，每轮 O(n) 更新和找最大。" },
        { q: "2-近似证明中 Case 2 的关键是：", options: ["所有簇都有中心", "某簇有两个中心，距离 ≤2OPT", "中心数小于 k", "OPT=0"], answer: 1, why: "鸽巢原理给出某簇两个中心，再用三角不等式。" },
        { q: "若只允许比较距离大小，可以：", options: ["比较平方距离", "必须开方", "用近似值", "不能实现"], answer: 0, why: "平方保持大小关系，且避免浮点开方。" }
      ]
    }
  ];

  // ------------------------------------------------------------------
  // Exercise bank — all original exercises from the relevant sets.
  // ------------------------------------------------------------------
  const EXERCISES = [
    // ---------------- Special Exercise 8: Optimal BST ----------------
    {
      id: "sp8-1", source: "SP8", num: 1, module: "bst", topic: "Optimal BST", difficulty: 2,
      title: "W=(10,20,30,40) 的全部区间 DP 值",
      prompt: "对 S={1,2,3,4}、W=(10,20,30,40)：求所有 optavg(a,b)；求 optavg(1,4|3)；给出一棵最优 BST。",
      solution: "长度 1：10,20,30,40。长度 2：opt(1,2)=40，opt(2,3)=70，opt(3,4)=100。长度 3：opt(1,3)=100，opt(2,4)=150。长度 4：opt(1,4)=100+min{opt(2,4)=150, opt(1,1)+opt(3,4)=110, opt(1,2)+opt(4,4)=80, opt(1,3)=100}=180。opt(1,4|3)=100+opt(1,2)+opt(4,4)=180。最优树根为 3，左子根 2（左孩子 1），右孩子 4。"
    },
    {
      id: "sp8-2", source: "SP8", num: 2, module: "bst", topic: "Optimal BST", difficulty: 1,
      title: "O(n³) 计算 optavg(1,n)",
      prompt: "给出计算 optavg(1,n) 的 O(n³) 算法。",
      solution: "前缀和预处理 O(n)。按 len=1..n 枚举 a，b=a+len−1；对每个区间枚举 r∈[a,b]，用 opt[a][r−1]+opt[r+1][b] 取最小，再加区间和。空区间视为 0。状态 Θ(n²)，每个 O(n)，总 O(n³)，空间 O(n²)。"
    },
    {
      id: "sp8-3", source: "SP8", num: 3, module: "bst", topic: "Optimal BST", difficulty: 2,
      title: "O(n³) 构造最优 BST",
      prompt: "在只算出 optavg(1,n) 的基础上，描述如何构造最优 BST，时间仍为 O(n³)。",
      solution: "在 DP 取 min 时记录 bestroot[a][b]=达到最小的 r（若并列任取一个）。从 build(1,n) 递归：r=bestroot[a][b]，递归 build(a,r−1) 与 build(r+1,b)，分别作为左右子树；a>b 返回空。每个区间建一个结点，共 n 个，O(n)。总 O(n³)。"
    },
    {
      id: "sp8-4", source: "SP8", num: 4, module: "bst", topic: "Optimal BST", difficulty: 2,
      title: "最大权作根贪心的反例",
      prompt: "Prof. Goofy 每次选 W[i] 最大的 key 作根，左右递归。证明该算法不总是返回最优 BST。",
      solution: "取 W=(1,2,3,4)。贪心选 key 4 作根；左区间 (1,2,3) 又选 key 3 作根，再选 key 2，形成链 4-3-2-1。代价：4·1+3·2+2·3+1·4=20。最优选 key 3 作根：左子树根 2（左孩子 1），右孩子 4，代价 3·1+2·2+4·2+1·3=18。故贪心不是最优。根的选择必须枚举，不能只看单点权重。"
    },
    {
      id: "sp8-5", source: "SP8", num: 5, module: "bst", topic: "Optimal BST", difficulty: 2,
      title: "最差 BST（最大平均代价）",
      prompt: "求平均查找代价最大的 BST，给出 O(n³) 算法。",
      solution: "与最优 BST 同构，只把 min 改成 max：worst(a,b)=ΣW[i]+max_{r∈[a,b]}{worst(a,r−1)+worst(r+1,b)}，空区间 0。按区间长度递增计算，仍 Θ(n²) 状态 × O(n) 枚举 = O(n³)。可用 bestroot 重建最差树（通常是一条链）。"
    },

    // ---------------- Special Exercise 9: SCC ----------------
    {
      id: "sp9-1", source: "SP9", num: 1, module: "scc", topic: "SCC", difficulty: 1,
      title: "SCC 两两不交",
      prompt: "证明有向图的所有强连通分量互不相交。",
      solution: "若两个 SCC S1、S2 有公共点 v，则对任意 x∈S1、y∈S2，x 可达 v 且 v 可达 y，故 x 可达 y；同理 y 可达 x。于是 S1∪S2 仍强连通，且严格大于 S1，违反 S1 的极大性。矛盾。"
    },
    {
      id: "sp9-2", source: "SP9", num: 2, module: "scc", topic: "SCC", difficulty: 2,
      title: "缩点图不可达 ⇒ 原图不可达",
      prompt: "设 S1、S2 是 SCC。若 Gscc 中 S1 不能到达 S2，证明 G 中 S1 的任何点都不能到达 S2 的任何点。",
      solution: "反证：若 u∈S1 在 G 中可达 v∈S2，把这条路径上的 SCC 依次写出，就得到 Gscc 中从 S1 到 S2 的一条有向路径（相邻跨边对应缩点边），矛盾。"
    },
    {
      id: "sp9-3", source: "SP9", num: 3, module: "scc", topic: "SCC", difficulty: 1,
      title: "G 与 G^rev 有相同 SCC",
      prompt: "证明原图 G 与反图 G^rev 的强连通分量完全相同。",
      solution: "把 G 中每条边反向，任意两点间的有向路径也整体反向，成为 G^rev 中的路径。因此“u 可达 v 且 v 可达 u”在 G 与 G^rev 中等价。强连通点集相同，极大性也相同，故 SCC 相同。"
    },
    {
      id: "sp9-4", source: "SP9", num: 4, module: "scc", topic: "SCC", difficulty: 2,
      title: "缩点图路径 ⇒ 标号严格下降",
      prompt: "把“S1→S2 则 label(S1)>label(S2)”加强为：若 Gscc 中 S1 可到达 S2，则 label(S1)>label(S2)。",
      solution: "对路径长度归纳。长度 1 即讲义 Lemma。设 S1→S3→…→Sk，由归纳 label(S3)>…>label(Sk)，再由 Lemma label(S1)>label(S3)，传递得 label(S1)>label(Sk)。"
    },
    {
      id: "sp9-5", source: "SP9", num: 5, module: "scc", topic: "SCC", difficulty: 3,
      title: "Goofy 的 SCC 算法反例",
      prompt: "Goofy 在 G 上 DFS 标号后，在 G（不是 G^rev）上按 label 从小到大开始 DFS。给出反例说明错误。",
      solution: "取三个点 a,b,c，边为 a→b、b→a、a→c。两个 SCC 是 {a,b} 与 {c}。第一次 DFS 从 a 开始，邻接顺序先 b 后 c：a→b→a，b 先完成，label(b)=1；回到 a 后访问 c，label(c)=2；最后 label(a)=3。第二次在 G 上从最小标号 b 开始：b→a，a→b（已访问）且 a→c（未访问），于是一棵 DFS 树把 {a,b,c} 全部吞并，错误地把两个 SCC 合并。根因：label 是顶点完成时间，不是 SCC 的最大标号；同一 SCC 内较早完成的点仍可能经由本 SCC 走到另一个未访问 SCC。"
    },

    // ---------------- Regular Exercise 8 ----------------
    {
      id: "r8-1", source: "RE8", num: 1, module: "scc", topic: "SCC", difficulty: 1,
      title: "Gscc 是 DAG",
      prompt: "证明缩点图 Gscc 是有向无环图。",
      solution: "若 Gscc 有环，环上任意两个 SCC 可互相到达（沿环走）。于是它们的并集仍强连通，违反各 SCC 的极大性。故无环。"
    },
    {
      id: "r8-2", source: "RE8", num: 2, module: "scc", topic: "SCC", difficulty: 1,
      title: "O(V+E) 构造反图邻接表",
      prompt: "G 用邻接表存储，V={1,…,n}。设计 O(|V|+|E|) 算法构造 G^rev 的邻接表。",
      solution: "为每个 v 建空链表 L(v)，数组 head[v] 指向它。扫描 G 的每个邻接表：对每条边 (u,v)，把 u 插入 L(v) 的表头。扫描完所有边后，L(v) 就是 G^rev 中 v 的出边表。每条边 O(1)，总 O(V+E)。"
    },
    {
      id: "r8-3", source: "RE8", num: 3, module: "scc", topic: "SCC", difficulty: 2,
      title: "O(V+E) 实现 SCC 算法",
      prompt: "实现讲义中的 SCC 算法，时间 O(|V|+|E|)。",
      solution: "第一次 DFS 在 G 上记录 turn-black 顺序到数组 A（A[i]=第 i 个变黑的点）。用上题构造 G^rev。第二次从 A[n] 开始 DFS；需要重启时从 A[n−1],A[n−2],… 找第一个白色点。每棵 DFS 树输出为一个 SCC。两次 DFS 线性，建反图线性。"
    },
    {
      id: "r8-4", source: "RE8", num: 4, module: "scc", topic: "DAG DP", difficulty: 2,
      title: "DAG 上可达点的最小权",
      prompt: "DAG 中每点有权 w_u，R(u) 为 u 可达的点（含自身），W(u)=min_{v∈R(u)}w_v。设计 O(V+E) 算法。",
      solution: "递推 W(u)=min(w_u, min_{u→v}W(v))；出度为 0 时 W(u)=w_u。按拓扑序的逆序计算，每条边看一次，O(V+E)。可用 parent 记录取到最小值的后继以输出路径。"
    },
    {
      id: "r8-5", source: "RE8", num: 5, module: "scc", topic: "SCC", difficulty: 3,
      title: "任意有向图的可达最小权",
      prompt: "一般有向图（可有环），每点有权 w_u，R(u) 为可达点（含自身），W(u)=min_{v∈R(u)}w_v。设计 O(V+E) 算法。",
      solution: "同一 SCC 内所有点可达集合相同。先求 SCC，令 SCC 的权为内部最小 w。建缩点 DAG，按逆拓扑序做上题 DP，得到每个 SCC 的 W。原图每个 u 的答案等于其 SCC 的 W。总 O(V+E)。"
    },

    // ---------------- Regular Exercise 9 ----------------
    {
      id: "r9-1", source: "RE9", num: 1, module: "dijkstra", topic: "Dijkstra", difficulty: 3,
      title: "Dijkstra 正确性证明",
      prompt: "证明非负权下 Dijkstra 算法正确。",
      solution: "对弹出顺序归纳证明：弹出 v 时 dist(v)=spdist(v)。取最短路 s→…→v，令 u 为路上第一个 spdist(u)=spdist(v) 的点。若 v 弹出时路上 u 之前的某点 z 仍未弹出，则由归纳前驱已松弛，dist(z)=spdist(z)<spdist(v)，与 v 是当前最小矛盾。于是 dist(v)≤dist(u)=spdist(u)=spdist(v)；又 dist(v)≥spdist(v)，故相等。"
    },
    {
      id: "r9-2", source: "RE9", num: 2, module: "dijkstra", topic: "Dijkstra", difficulty: 1,
      title: "非负性用在哪一步",
      prompt: "指出上题证明中哪里必须使用边权非负。",
      solution: "在 Claim 1 中由 u 的定义推出 spdist(v_bad)<spdist(u)=spdist(v)。若边权可为负，u 之后到 v 的路径可能继续降低距离，v_bad 的 spdist 不一定小于 v，矛盾不成立。"
    },
    {
      id: "r9-3", source: "RE9", num: 3, module: "bellman", topic: "Shortest Path", difficulty: 2,
      title: "无负环 ⇒ 存在简单最短路",
      prompt: "有向图无负环。证明任意 s,t 之间至少有一条最短路径是简单路径。",
      solution: "取所有最短路径中边数最少的一条 π。若 π 重复顶点，则两次出现之间的子路径是一个环；无负环 ⇒ 环长≥0。删去该环得到更少边的路径，长度不增，仍最短，矛盾。故 π 简单。"
    },
    {
      id: "r9-4", source: "RE9", num: 4, module: "bellman", topic: "DAG SSSP", difficulty: 2,
      title: "DAG 上的 SSSP（可负权）",
      prompt: "DAG 每条边可为负，求从 s 出发的 SSSP，O(V+E)。",
      solution: "先拓扑排序。dist(s)=0，其余 ∞。按拓扑序处理 v：对每条入边 (u,v)，dist(v)=min(dist(v),dist(u)+w(u,v))；源点特殊。每个点/边一次，O(V+E)。若 v 在 s 之前拓扑序，dist 保持 ∞。"
    },
    {
      id: "r9-5", source: "RE9", num: 5, module: "bellman", topic: "Shortest Path", difficulty: 2,
      title: "最短路可取简单路径（同 3）",
      prompt: "无负环，证明 s 到 t 存在简单最短路。",
      solution: "同上：取边数最少的最短路，重复顶点给出非负环，删去后仍最短且边数更少，矛盾。"
    },
    {
      id: "r9-6", source: "RE9", num: 6, module: "bellman", topic: "Negative Cycle", difficulty: 3,
      title: "Bellman–Ford 负环检测正确性",
      prompt: "证明：|V|−1 轮后若仍有边可松弛，则存在负环；反之若存在负环，则必有边可松弛。",
      solution: "方向 1：无负环时，|V|−1 轮后所有 dist 已是最终最短路，不可能再松弛；若仍可松弛，只能是负环。方向 2：设负环 v1→…→vk→v1。若所有边都满足 dist(v)≤dist(u)+w(u,v)，沿环相加得 0≤环总权，与负环矛盾。故至少一条边可松弛。"
    },
    {
      id: "r9-7", source: "RE9", num: 7, module: "apsp", topic: "Johnson", difficulty: 2,
      title: "Johnson 重赋权非负",
      prompt: "证明 w′(u,v)=w(u,v)+spdist(v_dummy,u)−spdist(v_dummy,v)≥0。",
      solution: "由最短路三角不等式：spdist(v_dummy,v)≤spdist(v_dummy,u)+w(u,v)。移项即 w(u,v)+h(u)−h(v)≥0。"
    },
    {
      id: "r9-8", source: "RE9", num: 8, module: "apsp", topic: "Johnson", difficulty: 1,
      title: "非负权时 Johnson 重赋权不变",
      prompt: "若所有边权非负，证明 Johnson 得到的 w′(u,v)=w(u,v)。",
      solution: "dummy 到每个点都有权 0 的直达边，且无负权，所以 spdist(v_dummy,v)=0。于是 h(v)=0，w′=w+0−0=w。"
    },

    // ---------------- Regular Exercise 10 ----------------
    {
      id: "r10-1", source: "RE10", num: 1, module: "np", topic: "Vertex Cover", difficulty: 1,
      title: "K_{n,n} 证明 2 是紧的",
      prompt: "完全二分图 K_{n,n} 有 2n 个点、n² 条边。用它说明 VC 算法的近似比 2 是最好的可证上界。",
      solution: "算法每次选一条边并删去两端所有关联边。在 K_{n,n} 中，无论选哪条边，都会删掉该黑点与该白点的所有边；但剩余图仍是完全二分图，算法会一直选，最终可能选全部 2n 个点。最优只需选一侧 n 个点。比值 2n/n=2。"
    },
    {
      id: "r10-2", source: "RE10", num: 2, module: "np", topic: "Vertex Cover", difficulty: 3,
      title: "树上的最优顶点覆盖",
      prompt: "G 是树。设计 O(V) 时间求最优顶点覆盖。",
      solution: "任选根。对每个 u 定义 OPT(u,yes/no)：u 在/不在覆盖中时子树 T(u) 的最优大小。叶：yes=1,no=0。内部：OPT(u,yes)=1+Σ_v min{OPT(v,yes),OPT(v,no)}；OPT(u,no)=Σ_v OPT(v,yes)（u 不选则每个孩子必须选）。按后序计算，根答案 min{yes,no}；用选择记录 piggyback 还原覆盖。O(V)。"
    },
    {
      id: "r10-3", source: "RE10", num: 3, module: "np", topic: "Vertex Cover", difficulty: 3,
      title: "最大度贪心比值 >2",
      prompt: "算法每步选当前最大度点、删其所有边。证明近似比可大于 2。",
      solution: "按讲义构造：左部 u1..u16；对 i=2..16 建右部组 R_i，大小 s_i=⌊16/i⌋（总 34）。每个 R_i[j] 连接左部连续 i 个点 u_{i(j−1)+1}..u_{ij}。初始右点度最大为 16（R_16），左点最大度 15；算法会依次选所有 34 个右点。最优选全部 16 个左点即可覆盖所有边。比值 34/16=2.125>2。"
    },
    {
      id: "r10-4", source: "RE10", num: 4, module: "np", topic: "Max-Cut", difficulty: 2,
      title: "随机 Max-Cut 的 1/2 期望近似",
      prompt: "设计多项式时间算法，期望返回大小至少 OPT/2 的割。",
      solution: "每个点独立以 1/2 放入 S。任一条边两个端点被分到不同侧的概率为 1/2，由期望线性性 E[|cut|]=|E|/2。又 OPT≤|E|，故 E[cut]≥OPT/2。运行 O(V+E)，随机赋值即可。"
    },

    // ---------------- Regular Exercise 11 ----------------
    {
      id: "r11-1", source: "RE11", num: 1, module: "tsp", topic: "TSP", difficulty: 2, figure: "assets/figures/ex11.png",
      title: "无三角不等式时 2-近似失效",
      prompt: "用讲义图说明：去掉三角不等式后，MST 双走 + 抄近路不再保证 2 倍。",
      solution: "图中 MST 取 AB=1, BC=1, CD=2，双走后再抄近路得到 A-B-C-D-A，长 1+1+2+10=14；而最优 Hamiltonian 环 A-B-D-C-A 长 1+2+2+1=6。14/6>2，故 2-近似失效。根因是抄近路把 D→A 的直接边 10 替代了原路径，三角不等式不成立。"
    },
    {
      id: "r11-2", source: "RE11", num: 2, module: "tsp", topic: "TSP", difficulty: 3, figure: "assets/figures/ex11.png",
      title: "构造比值 >1.6 的 TSP 实例",
      prompt: "给出一个满足三角不等式的 6 点实例，使讲义算法比值 >1.6。",
      solution: "按讲义解：6 点图中粗边权 1、细边权 2，满足三角不等式。最优 Hamiltonian 环长 6（A-B-C-D-E-F-A）。算法选到的某棵 MST 双走后抄近路得到 F-A-C-E-B-D-F，长 10。比值 10/6>1.6。说明 2-近似分析虽上界为 2，但实际可接近 1.67 以上。"
    },
    {
      id: "r11-3", source: "RE11", num: 3, module: "tsp", topic: "TSP", difficulty: 2,
      title: "非完全图的 2 倍 spanning walk",
      prompt: "连通无向图（不一定完全），求长度 ≤2OPT 的 spanning walk，OPT 为最短 spanning walk。",
      solution: "取 MST T，权为 w(T)。任何 spanning walk 必须连通所有点，含某棵生成树，故 OPT≥w(T)。把 T 每条边双走得到闭游走 W，长 2w(T)≤2OPT，且访问所有点。无需抄近路（图不一定有直接边）。"
    },
    {
      id: "r11-4", source: "RE11", num: 4, module: "tsp", topic: "TSP", difficulty: 3,
      title: "无三角不等式 ⇒ 无常数近似",
      prompt: "利用 Hamiltonian Cycle NP-hard，证明一般 TSP 不存在常数近似（除非 P=NP）。",
      solution: "给定 Hamiltonian Cycle 实例 G，构造完全图：原边权 1，非边权 αn+1。若 G 有 Hamiltonian 环，OPT=n；任何 α-近似若用了一条非边，长度至少 (n−1)+(αn+1)=(α+1)n>αn，矛盾。因此近似算法只能输出原图 Hamiltonian 环，从而多项式判定 Hamiltonian Cycle。故无常数近似。"
    },

    // ---------------- Regular Exercise 12 ----------------
    {
      id: "r12-1", source: "RE12", num: 1, module: "setcover", topic: "Set Cover", difficulty: 2,
      title: "Set Cover 可解 ⇒ Vertex Cover 可解",
      prompt: "证明：若 Set Cover 有多项式精确算法，则 Vertex Cover 也有。",
      solution: "对 VC 实例 G=(V,E)，为每个顶点 u 建集合 S_u={与 u 关联的边}，全集 U=E。任给集合覆盖 C，其所有者 V(C) 是 VC；反之任给 VC W，对应集合 {S_u:u∈W} 覆盖 E。故最优集合覆盖 ↔ 最优顶点覆盖。多项式转换 + 调用 Set Cover 即得。"
    },
    {
      id: "r12-2", source: "RE12", num: 2, module: "setcover", topic: "Set Cover", difficulty: 3,
      title: "贪心集合覆盖的两个不变量",
      prompt: "C* 为最优覆盖。第 i 步前已选 S1..S_{i−1}，剩余 z_{i−1} 个元素。令 C′=C*∩{S1..S_{i−1}}。证明 C′≠C*，且 S_i 的 benefit ≥ z_{i−1}/|C*\\C′|。",
      solution: "若 C′=C*，则已选集合已覆盖全集，算法不会继续选 S_i，矛盾。剩余 z_{i−1} 个元素必须由 C*\\C′ 覆盖；这些集合的总覆盖（对剩余元素）至少 z_{i−1}，由平均存在一个集合覆盖 ≥z_{i−1}/|C*\\C′|。贪心选最大 benefit，故 S_i 至少这么多。"
    },
    {
      id: "r12-3", source: "RE12", num: 3, module: "setcover", topic: "Set Cover", difficulty: 2,
      title: "给定点集的区间刺穿 O(log n)",
      prompt: "给定 n 个区间 I 和 n 个点 P，选 S⊆P 刺穿所有区间，求 |S|≤OPT·O(log n)。",
      solution: "对每个 p∈P 建集合 I_p={区间 I∈I: p∈I}。全集为所有区间。选点刺穿所有区间 ⇔ 选对应的 I_p 覆盖全集。调用 Set Cover 贪心；全集大小 ≤n，近似比 1+ln n=O(log n)，时间多项式。"
    },
    {
      id: "r12-4", source: "RE12", num: 4, module: "setcover", topic: "Set Cover", difficulty: 3,
      title: "任意点的区间刺穿 O(log n)",
      prompt: "不限制刺穿点来自给定 P，允许任意 1D 点。仍求 O(OPT log n) 的刺穿集。",
      solution: "只需考虑所有区间端点（共 2n 个）。若最优刺穿点 p 不在端点，取包含 p 的区间中右端点最小者 r；则 r 仍属于所有含 p 的区间（这些区间左端≤p≤r，右端≥r），可把 p 换成 r。故存在只用端点的最优解。再用上题，P 取端点集，大小 2n。"
    },

    // ---------------- Regular Exercise 13 ----------------
    {
      id: "r13-1", source: "RE13", num: 1, module: "setcover", topic: "Hitting Set", difficulty: 2,
      title: "Hitting Set → Set Cover",
      prompt: "给定 Hitting Set 实例，说明如何转成 Set Cover。",
      solution: "建二分图：左点=集合 S∈𝒮，右点=元素 e∈U，e∈S 时连边。对每个 e 定义 N_e={S:e∈S}，以左点集为全集。选最少 N_e 覆盖所有左点；这些 e 组成最优 hitting set。"
    },
    {
      id: "r13-2", source: "RE13", num: 2, module: "setcover", topic: "Set Cover", difficulty: 2,
      title: "Set Cover → Hitting Set",
      prompt: "给定 Set Cover 实例，说明如何转成 Hitting Set。",
      solution: "同一二分图：左=集合，右=元素。对每个 e∈U 定义 N_e={S:e∈S}，作为 Hitting Set 的集合族；其全集是左点集。选 hitting set H（一组左点），对应原集合组成 Set Cover。两个方向互为对偶。"
    },
    {
      id: "r13-3", source: "RE13", num: 3, module: "setcover", topic: "Hitting Set", difficulty: 2,
      title: "Hitting Set 的 1+ln|𝒮| 近似",
      prompt: "设计多项式算法，返回大小 ≤OPT(1+ln|𝒮|) 的 hitting set。",
      solution: "用上题转成 Set Cover：新全集是原集合族 𝒮，大小 |𝒮|。调用 Set Cover 贪心，得覆盖大小 ≤(1+ln|𝒮|)OPT。把选中的 N_e 对应回元素 e，即 hitting set。"
    },
    {
      id: "r13-4", source: "RE13", num: 4, module: "kcenter", topic: "k-Center", difficulty: 2,
      title: "图上 k-Center 的 2-近似",
      prompt: "无向带非负权图，cost(C)=max_u min_{c∈C} spdist(c,u)。求 |C|=k 的 2-近似。",
      solution: "先算所有点对最短路（|V| 次 Dijkstra，或 Floyd）。最短路距离满足三角不等式。把距离矩阵当作度量空间，运行最远点优先 k-Center 算法，得到 C。原证明只用到三角不等式与度量性，故 cost(C)≤2OPT。时间多项式。"
    },
    {
      id: "r13-5", source: "RE13", num: 5, module: "kcenter", topic: "k-Center", difficulty: 2,
      title: "避免开方的欧氏 k-Center",
      prompt: "欧氏距离含平方根，如何修改算法使其严格多项式时间？",
      solution: "算法只需要比较两个距离的大小。比较大小时比较平方距离：dist²(a,b)=(a_x−b_x)²+(a_y−b_y)²。平方保序且只用四则运算，O(1)。所有“最远点”选择与更新都用平方距离，最后再按需开方输出半径。"
    },
    {
      id: "r13-6", source: "RE13", num: 6, module: "kcenter", topic: "k-Center", difficulty: 3,
      title: "r-feasible 最小集合是 NP-hard",
      prompt: "给定 r>0，求最少中心使所有点半径≤r。证明除非 P=NP，无多项式精确算法。",
      solution: "若有多项式算法 A 解 r-feasible，则对 k-Center 实例枚举所有点对距离 r_i（共 O(n²) 个，升序），依次调用 A，找到最小的 r_i 使输出中心数≤k，即为最优 k-Center 半径。若 A 多项式，总多项式，违背 k-Center NP-hard。故 r-feasible 无多项式精确算法。"
    },

    // ---------------- Special Exercise 10 ----------------
    {
      id: "sp10-1", source: "SP10", num: 1, module: "dijkstra", topic: "Dijkstra", difficulty: 2, figure: "assets/figures/sp10.png",
      title: "Dijkstra 的松弛顺序",
      prompt: "对题图从 a 运行 Dijkstra，给出算法依次松弛出边的顶点顺序。",
      solution: "取图中边：a→c 6、a→e 3；c→b 2、c→d 5、c→e 2、c→g 1；b→d 1；d→e 1、d→f 2；f→e 6；g→e 1。初始化 a=0。弹出 a(0)→c=6,e=3；弹出 e(3)；弹出 c(6)→b=8,d=11,g=7；弹出 g(7)；弹出 b(8)→d=9；弹出 d(9)→f=11；弹出 f(11)。顺序：a, e, c, g, b, d, f（b 若与 g 并列按图意取 g 先）。"
    },
    {
      id: "sp10-2", source: "SP10", num: 2, module: "dijkstra", topic: "SSSP", difficulty: 2,
      title: "最短路的前驱分解",
      prompt: "证明 spdist(s,t)=min_{v∈IN(t)}{spdist(s,v)+w(v,t)}。",
      solution: "≥：对任意 v∈IN(t)，spdist(s,v)+w(v,t) 是一条 s→v→t 路径的长度，必 ≥ 最短路。≤：取一条最短 s→t 路径，最后一条边为 (v,t)，前缀是 s→v 的路径，长度 ≥spdist(s,v)；故 spdist(s,t)=前缀长+w(v,t)≥spdist(s,v)+w(v,t)≥min。两边夹。"
    },
    {
      id: "sp10-3", source: "SP10", num: 3, module: "dijkstra", topic: "Dijkstra", difficulty: 1,
      title: "负权使 Dijkstra 失效的反例",
      prompt: "给出一个负权反例，说明 Dijkstra 不正确。",
      solution: "s→a 权 1，s→b 权 2，b→a 权 −2。Dijkstra 先弹出 a，dist(a)=1 并宣布最终；但真实 spdist(s,a)=0（s→b→a），故错误。"
    },
    {
      id: "sp10-4", source: "SP10", num: 4, module: "bellman", topic: "Bellman–Ford", difficulty: 2, figure: "assets/figures/sp10.png",
      title: "Bellman–Ford 四轮表",
      prompt: "对题图从 a 运行 Bellman–Ford（4 轮），给出每轮后所有 dist 值。",
      solution: "按题图边（方向以箭头为准）：a→c −7、a→e 3、c→b 2、b→d 4、c→d 5、c→e −2、d→e −3。初始 (a,b,c,d,e)=(0,∞,∞,∞,∞)。第 1 轮松弛所有边：a→c 得 c=−7，a→e 得 e=3，c→b 得 b=−5，b→d 得 d=−1，c→d 改进为 −2，c→e 改进为 −9，d→e 不改进。第 1 轮后 (0,−5,−7,−2,−9)。第 2～4 轮不再变化。轮内松弛顺序不影响最终 dist；写表时每轮把所有边扫一遍即可。"
    },
    {
      id: "sp10-5", source: "SP10", num: 5, module: "bellman", topic: "Bellman–Ford", difficulty: 2,
      title: "Bellman–Ford 输出最短路树",
      prompt: "扩展 Bellman–Ford，使其在 O(VE) 内输出最短路树。",
      solution: "初始化 parent(v)=nil。每次成功松弛 (u,v) 时令 parent(v)=u。|V|−1 轮后，若检测到负环则报告无树；否则对每个可达 v，沿 parent 回溯到 s，得到最短路。parent 边共 n−1 条，构成以 s 为根的树。额外 O(1)/次松弛，总 O(VE)。"
    },
    {
      id: "sp10-6", source: "SP10", num: 6, module: "dijkstra", topic: "SSSP", difficulty: 1,
      title: "单位权 SSSP 的 O(V+E) 算法",
      prompt: "所有边权为 1，设计 O(V+E) 的 SSSP。",
      solution: "从 s 做 BFS。dist(s)=0；首次发现 v 时 dist(v)=dist(u)+1，parent(v)=u。BFS 队列保证按层访问，故首次到达即最短。O(V+E)。"
    },

    // ---------------- Special Exercise 11 ----------------
    {
      id: "sp11-1", source: "SP11", num: 1, module: "apsp", topic: "Johnson", difficulty: 3, figure: "assets/figures/sp11.png",
      title: "Johnson 重赋权后的所有边权",
      prompt: "对题图运行 Johnson，给出重赋权后每条边的权。",
      solution: "步骤：加 dummy 及 0 边；Bellman–Ford 求 h(v)=spdist(dummy,v)；按 w′(u,v)=w(u,v)+h(u)−h(v) 重赋权。图中的负边会使 h 取负值，重赋权后所有边≥0。由于题图边集较密，考试时按此表逐边计算即可；核验标准是每条 w′≥0，且任意原最短路在新图中只差 h(s)−h(t)。"
    },
    {
      id: "sp11-2", source: "SP11", num: 2, module: "apsp", topic: "Johnson", difficulty: 2,
      title: "统一加常数不能保持最短路",
      prompt: "Goofy 把所有边权减去最小边权 z（即每条 +(−z)）。举例说明最短路可能改变。",
      solution: "取 s→t 权 0，s→a 权 −1，a→t 权 −1，z=−1。原图最短路 s→t 长 0。每条加 1 后：s→t 长 1，s→a→t 长 0，最短路变成后者。原因：统一加常数会让长度为 ℓ 的路径增加 cℓ，不同边数路径被区别对待；Johnson 的 h(u)−h(v) 只在端点留下常数，才能保持所有路径的相对顺序。"
    },
    {
      id: "sp11-3", source: "SP11", num: 3, module: "apsp", topic: "Johnson", difficulty: 2,
      title: "重赋权保持负环",
      prompt: "w′=w+h(u)−h(v)。证明 G 有负环 ⇔ G′ 有负环。",
      solution: "任一环 v1→…→vk→v1 的新总权 = 原总权 + Σ(h(v_i)−h(v_{i+1})) = 原总权（望远镜抵消）。故环总权不变，负环存在性等价。"
    },
    {
      id: "sp11-4", source: "SP11", num: 4, module: "apsp", topic: "Transitive Closure", difficulty: 2,
      title: "O(V(V+E)) 传递闭包",
      prompt: "计算 n×n 可达矩阵 M，时间 O(|V|(|V|+|E|))。",
      solution: "对每个源点 s 做一次 BFS/DFS，标记所有可达点，填 M[s][·]。每次 O(V+E)，共 |V| 次，O(V(V+E))。空间 O(V²) 存矩阵。"
    },

    // ---------------- Special Exercise 12 ----------------
    {
      id: "sp12-1", source: "SP12", num: 1, module: "np", topic: "Vertex Cover", difficulty: 2, figure: "assets/figures/sp12.png",
      title: "小图的顶点覆盖与贪心输出",
      prompt: "对题图：(a) 最小顶点覆盖大小；(b) 算法能否输出 4；(c) 能否输出 6？",
      solution: "图边：ab, ac, bd, cd, de, df, ef。(a) {a,d,e} 覆盖全部，大小 3；三角形 d,e,f 至少选 2 个，且 ab/ac 需要 a 或 b,c，故最少 3。(b) 可以：先选 de，再选 ab，得到 {a,b,d,e}，大小 4。(c) 可以：如选 ab、cd、ef 三条互不共享端点的边，得到 6 个点。"
    },
    {
      id: "sp12-2", source: "SP12", num: 2, module: "np", topic: "MAX-3SAT", difficulty: 1,
      title: "任意长子句的满足概率 ≥1/2",
      prompt: "子句是任意多个不同变量文字的 OR。证明独立 1/2 赋值下，子句为 1 的概率至少 1/2。",
      solution: "含 k 个文字的 clause 为假 ⇔ 每个文字都为假。不同变量独立，概率 (1/2)^k。故满足概率 1−(1/2)^k ≥1/2（k≥1）。"
    },
    {
      id: "sp12-3", source: "SP12", num: 3, module: "tsp", topic: "TSP", difficulty: 3, figure: "assets/figures/sp12.png",
      title: "对五边形图运行 2-近似",
      prompt: "对题图用 MST 双走 + 抄近路，找一条 ≤2OPT 的 Hamiltonian 环。",
      solution: "按图取边权，先求 MST（Kruskal/Prim），把 MST 每条边双走得到闭游走，再按首次访问抄近路。由于图满足三角不等式，所得环长 ≤2w(MST)≤2OPT。考试时写出 MST 边集、闭游走序列、去重后的环、以及每步长度即可；具体环取决于并列边的选择。"
    },
    {
      id: "sp12-4", source: "SP12", num: 4, module: "tsp", topic: "TSP", difficulty: 2,
      title: "O(V) 生成双走闭游走",
      prompt: "如何在 O(|V|) 时间由 MST 生成每条树边恰走两次的闭游走？",
      solution: "从任意根对 MST 做 DFS。进入一条边时输出该边，递归子树，返回时再输出同一条边（反向）。每条树边恰好两次，共 2(n−1) 次输出，O(n)。这就是欧拉环游。"
    },
    {
      id: "sp12-5", source: "SP12", num: 5, module: "tsp", topic: "TSP", difficulty: 2,
      title: "欧氏 TSP 的 2-近似",
      prompt: "2D 点集，求长度 ≤2OPT 的 Hamiltonian 环，允许多项式时间算距离。",
      solution: "欧氏距离满足三角不等式。把点集视为完全图，边权为欧氏距离，运行度量 TSP 的 2-近似：求 MST，双走，按首次访问抄近路。证明同上：OPT≥w(MST)，双走=2w(MST)，抄近路不增。"
    },

    // ---------------- Special Exercise 13 ----------------
    {
      id: "sp13-1", source: "SP13", num: 1, module: "setcover", topic: "Set Cover", difficulty: 2,
      title: "对 10 个单词运行 Set Cover",
      prompt: "S={arid,dash,drain,heard,lost,nose,shun,slate,snare,thread}，每个单词看作字母集合。运行贪心 Set Cover 并描述输出。",
      solution: "全集字母 {a,d,h,i,r,s,t,e,l,o,n,u}。初始 benefit：thread 6 最大，选它，覆盖 {t,h,r,e,a,d}。剩余 {i,l,o,s,n,u}；lost/nose/shun 各 3，任选 lost，覆盖 {l,o,s}。剩余 {i,n,u}；drain/shun 各 2，选 drain 覆盖 {i,n}。剩余 {u}，选 shun。结果 {thread,lost,drain,shun}，大小 4（并列时可能不同，但大小 4）。"
    },
    {
      id: "sp13-2", source: "SP13", num: 2, module: "setcover", topic: "Set Cover", difficulty: 2,
      title: "characterizing benefit 非升",
      prompt: "按贪心选择顺序排列集合，证明每个集合被选时的 benefit 非升。",
      solution: "设第 i 步选 S_i，benefit b_i=|S_i∩F_{i−1}|。选完后 F_i=F_{i−1}\\S_i⊆F_{i−1}。对任意集合 S，|S∩F_i|≤|S∩F_{i−1}|，所以下一步的最大 benefit b_{i+1}≤b_i（S_i 在第 i 步就是最大）。归纳得非升。"
    },
    {
      id: "sp13-3", source: "SP13", num: 3, module: "setcover", topic: "Set Cover", difficulty: 3,
      title: "比值不能限定为 2 的反例",
      prompt: "给出输入，使贪心 Set Cover 的近似比 >2。",
      solution: "取 k 组，大小 2^{k−1},2^{k−2},…,1（如 k=6 时 32,16,8,4,2,1）。令 A 含每组前半，B 含每组后半，则 {A,B} 是大小 2 的覆盖；再加入每组整体 G_i。贪心先选 G_1，之后每步 G_i 与 A/B 的剩余 benefit 并列或更大；按“并列优先选 G_i”的 tie-break，贪心选完 k 组。OPT=2，比值 k/2，随 k 增大而超过任意常数 2。k=6 时贪心 6、OPT 2，比值 3。"
    },
    {
      id: "sp13-4", source: "SP13", num: 4, module: "setcover", topic: "Set Cover", difficulty: 2,
      title: "Set Cover 判定版无多项式算法",
      prompt: "给定 k，判定是否存在大小 ≤k 的 set cover。证明除非 P=NP，无多项式算法。",
      solution: "若有多项式判定算法 A，则对 k=1..|𝒮| 依次调用 A，第一个返回 yes 的 k 即最优覆盖大小；再用 A 的输出/构造得到覆盖。这样多项式时间精确求解 NP-hard 的 Set Cover，矛盾。"
    },
    {
      id: "sp13-5", source: "SP13", num: 5, module: "setcover", topic: "Set Cover", difficulty: 2,
      title: "矩阵列覆盖 O(OPT log n)",
      prompt: "n×m 0/1 矩阵，每行至少一个 1。选最少列使每行至少一个选中列的 1。求 O(OPT log n) 近似。",
      solution: "把行看作全集（大小 n），第 j 列对应集合 S_j={行 i:M[i,j]=1}。这就是 Set Cover。调用贪心：每步选覆盖未覆盖行最多的列。近似比 1+ln n=O(log n)，时间多项式（O(nm·min(n,m)) 级别）。"
    },

    // ---------------- Special Exercise 14 ----------------
    {
      id: "sp14-1", source: "SP14", num: 1, module: "setcover", topic: "Hitting Set", difficulty: 2,
      title: "字母 Hitting Set → Set Cover",
      prompt: "S 为 10 个单词。L 是 hitting set 若每个单词含 L 中至少一个字母。将其重述为 Set Cover。",
      solution: "全集取 S（10 个单词）。对每个字母 ℓ，定义集合 N_ℓ={w∈S:ℓ 出现在 w 中}。选最少的 N_ℓ 覆盖 S；这些 ℓ 组成最优 hitting set。"
    },
    {
      id: "sp14-2", source: "SP14", num: 2, module: "setcover", topic: "Hitting Set", difficulty: 3, figure: "assets/figures/sp14.png",
      title: "5-cycle destroyer 的 O(D log V) 近似",
      prompt: "D 为最小 5-cycle destroyer。设计多项式算法求大小 O(|D| log|V|) 的 destroyer。",
      solution: "枚举 G 中所有 5-cycle（O(n⁵) 个，多项式）。每个 5-cycle 是一个“待命中集合”，每条边 e 对应“命中包含 e 的所有 5-cycle”的集合。选最少边命中所有 5-cycle 即 hitting set。用贪心 hitting set（转 set cover），集合族大小 = 5-cycle 数 ≤O(n⁵)，近似比 1+ln O(n⁵)=O(log n)。输出边集即 destroyer。"
    },
    {
      id: "sp14-3", source: "SP14", num: 3, module: "kcenter", topic: "k-Center", difficulty: 2, figure: "assets/figures/sp14.png",
      title: "k=3、首中心 f 的后续中心",
      prompt: "对题图点集，k=3，首中心 f。求第二、第三个中心。",
      solution: "坐标：a(2,2), b(3,3), c(4,2), d(4,8), e(5,6), f(6,7), g(7,4), h(8,3), i(9,4), j(9,2)。到 f 最远是 a（√41≈6.40），第二中心 a。再算每个点到 {f,a} 的最近距离：j 最远（到 a 为 7，到 f 为 √34≈5.83），第三中心 j。"
    },
    {
      id: "sp14-4", source: "SP14", num: 4, module: "kcenter", topic: "k-Center", difficulty: 2,
      title: "3D k-Center 的 2-近似",
      prompt: "把 k-Center 推广到 3D，设计 2-近似算法。",
      solution: "定义与 2D 相同，距离换成 3D 欧氏距离（仍满足三角不等式）。算法完全不变：任选首中心，重复 k−1 次选离当前中心集最远的点。证明只用度量性（三角不等式），故 pen(C)≤2OPT。时间 O(nk)（距离 O(1) 计算）。"
    },
    {
      id: "sp14-5", source: "SP14", num: 5, module: "kcenter", topic: "k-Center", difficulty: 2,
      title: "O(nk) 实现 k-Center",
      prompt: "证明 k-Center 算法可在 O(nk) 时间实现（欧氏距离 O(1)）。",
      solution: "维护数组 d[p]=到当前中心集的最小距离，初始化为到首中心的距离 O(n)。每轮：扫描 d 找最大 O(n)；加入新中心 c 后，对每个 p 更新 d[p]=min(d[p],dist(p,c)) O(n)。共 k−1 轮，总 O(nk)。空间 O(n)。"
    }
  ];

  // ------------------------------------------------------------------
  // Formula sheet
  // ------------------------------------------------------------------
  const FORMULAS = [
    { module: "bst", title: "Optimal BST 区间递推", body: "opt(a,b)=Σ<sub>i=a</sub><sup>b</sup>W[i]+min<sub>a≤r≤b</sub>{opt(a,r−1)+opt(r+1,b)}", note: "空区间 opt=0；按区间长度递增；O(n³)。" },
    { module: "bst", title: "平均查找代价", body: "avgcost(T)=Σ<sub>i=1</sub><sup>n</sup>W[i]·(1+level<sub>T</sub>(i))", note: "根 level=0，cost=1。" },
    { module: "dfs", title: "白路径定理", body: "v 是 u 的真后代 ⇔ 在 u 入栈时存在 u→v 的全白路径", note: "SCC 正确性的核心。" },
    { module: "scc", title: "SCC 标号单调", body: "G<sup>scc</sup> 中 S<sub>i</sub>→S<sub>j</sub> ⇒ label(S<sub>i</sub>)>label(S<sub>j</sub>)", note: "第二次 DFS 在 G<sup>rev</sup> 上按 label 降序。" },
    { module: "scc", title: "缩点 DP", body: "W(S)=min(w<sub>S</sub>, min<sub>S→T</sub>W(T))", note: "按逆拓扑序，O(V+E)。" },
    { module: "dijkstra", title: "松弛", body: "dist(v)=min(dist(v), dist(u)+w(u,v))", note: "成功时 parent(v)=u。" },
    { module: "dijkstra", title: "Dijkstra 复杂度", body: "O((|V|+|E|)log|V|)", note: "二叉堆；仅非负权。" },
    { module: "bellman", title: "Bellman–Ford", body: "重复 |V|−1 轮：对所有边松弛", note: "O(|V||E|)；无负环时正确。" },
    { module: "bellman", title: "负环检测", body: "第 |V| 轮仍有 dist(v)>dist(u)+w(u,v) ⇒ 负环", note: "负环需从 s 可达。" },
    { module: "maxflow", title: "残量与增广", body: "R(u,v)=c(u,v)−f(u,v)；Δ=min<sub>P</sub>R", note: "正向 +Δ，反向 −Δ。" },
    { module: "maxflow", title: "最大流最小割", body: "max<sub>f</sub>|f| = min<sub>(S,T)</sub>c(S,T)", note: "终止时残量可达集给出最小割。" },
    { module: "apsp", title: "Johnson 重赋权", body: "w′(u,v)=w(u,v)+h(u)−h(v)", note: "路径长只差 h(s)−h(t)。" },
    { module: "apsp", title: "势函数", body: "h(u)=spdist(v<sub>dummy</sub>,u) ⇒ w′≥0", note: "BF 求 h；|V| 次 Dijkstra。" },
    { module: "np", title: "VC 2-近似", body: "|S|=2|M|≤2OPT", note: "M 为极大匹配。" },
    { module: "np", title: "MAX-3SAT", body: "E[Z]=7n/8", note: "每子句满足概率 7/8。" },
    { module: "np", title: "Max-Cut", body: "E[cut]=|E|/2≥OPT/2", note: "随机分侧。" },
    { module: "tsp", title: "TSP 2-近似", body: "w(C)≤w(W)=2w(T)≤2OPT", note: "T 为 MST；抄近路用三角不等式。" },
    { module: "tsp", title: "MST 下界", body: "OPT≥w(MST)", note: "Hamiltonian 环删一条边 = 生成树。" },
    { module: "setcover", title: "Set Cover 贪心", body: "|C|≤(1+ln|U|)OPT", note: "每步最大 benefit。" },
    { module: "setcover", title: "Hitting Set 贪心", body: "|H|≤(1+ln|𝒮|)OPT", note: "转成 Set Cover。" },
    { module: "kcenter", title: "k-Center 2-近似", body: "pen(C)≤2OPT", note: "最远点优先；O(nk)。" },
    { module: "kcenter", title: "平方距离", body: "dist²(a,b)=(a<sub>x</sub>−b<sub>x</sub>)²+(a<sub>y</sub>−b<sub>y</sub>)²", note: "比较时无需开方。" }
  ];


  // ------------------------------------------------------------------
  // Midterm-style extra practice (modeled on mid-sol.pdf: types,
  // point weights, and difficulty; not copied problem statements)
  // ------------------------------------------------------------------
  const EXTRA_EXERCISES = [
    {
      id: "mid-1", source: "MID+", num: 1, extra: true, module: "mid", topic: "证明 / 归约", points: "20%", difficulty: 3,
      title: "Dominance counting → 顺序对计数",
      prompt: "假设有一个黑盒算法：给定 n 个二维点，对每个点 p 返回被 p 支配的（除自身外的）点数，耗时 f(n)。这里“p 支配 q”指 p.x≥q.x 且 p.y≥q.y。给定 n 个两两不同的整数 A[1..n]，证明：可以在 f(n)+O(n) 时间内计算满足 i<j 且 A[i]<A[j] 的下标对数。",
      solution: "构造点 p_i=(i, A[i])，跑 dominance 黑盒。对每个 j，黑盒返回的 c_j 是满足 i<j 且 A[i]≤A[j] 的 i 的个数。由于 A 中元素两两不同，这等价于 i<j 且 A[i]<A[j]。把所有 c_j 相加即为所求顺序对数。建点与求和 O(n)，黑盒 f(n)，总 f(n)+O(n)。注意这里映射到 (i,A[i]) 而不是 (i,−A[i])；后者会数出逆序对。"
    },
    {
      id: "mid-2", source: "MID+", num: 2, extra: true, module: "mid", topic: "Huffman", points: "15%", difficulty: 2,
      title: "等频 Huffman 的码长",
      prompt: "字母表有 n=2^k 个字母，所有字母频率完全相同。用 Huffman 算法构造前缀码。最短码字和最长码字各有多少位？证明你的答案。",
      solution: "都是 k=log₂n 位，实际上每个码字都恰为 k 位。证明：初始有 n 个权 w 的叶。Huffman 每轮取两个最小权结点合并；由于当前所有结点权相同，第一轮会把 n 个叶两两合并成 n/2 个权 2w 的结点，且每个叶深度为 1。第二轮这 n/2 个结点权仍全相等，继续两两合并，深度再加 1。每轮结点数减半且权保持一致，共 k 轮后只剩根；每个叶恰被合并 k 次，故深度 k。码长等于叶深度，故所有码字长 k。"
    },
    {
      id: "mid-3", source: "MID+", num: 3, extra: true, module: "mid", topic: "随机选择", points: "10%", difficulty: 2,
      title: "随机 k-selection 的一次 trial",
      prompt: "随机 k-selection：S 有 15 个不同整数，目标 k=7。随机选 pivot v，把 S 分成 S₁={x≤v} 与 S₂={x>v}，保留含目标的那一侧；若保留子集 ≤10 个元素则这次 trial 成功。(a) 对 pivot 秩 r∈{3,5,9,12}，写出保留子集大小、新目标秩、是否成功。(b) 求一次 trial 成功的精确概率。",
      solution: "(a) 若 r<7，保留 S₂，大小 15−r，新 k=7−r；若 r≥7，保留 S₁，大小 r，k 仍为 7。r=3：大小 12，k=4，失败；r=5：大小 10，k=2，成功；r=9：大小 9，k=7，成功；r=12：大小 12，k=7，失败。(b) r<7 时成功需 15−r≤10 ⇒ r≥5，故 r=5,6 两种；r≥7 时成功需 r≤10，故 r=7,8,9,10 四种。共 6 个秩，概率 6/15=2/5。"
    },
    {
      id: "mid-4", source: "MID+", num: 4, extra: true, module: "mid", topic: "贪心 / 反例", points: "10%", difficulty: 1,
      title: "最早开始的区间一定在最优解中吗？",
      prompt: "活动选择问题中，有人声称“开始时间最早的区间一定属于每一个最优解”。构造一个含两个区间的输入推翻它，并简要解释。",
      solution: "取 S={[1,3],[2,4]}。两个区间重叠，任何可行解至多选一个；{[2,4]} 是一个最优解，它不包含开始最早的 [1,3]。故“最早开始必须属于每个最优解”为假。注意这与正确的贪心（按最早结束时间选）不冲突：本题只是否定“最早开始”这一错误准则。"
    },
    {
      id: "mid-5", source: "MID+", num: 5, extra: true, module: "mid", topic: "Rod Cutting", points: "15%", difficulty: 2,
      title: "Rod Cutting 手跑表与重建",
      prompt: "价格数组 P=(1,5,8,10,13,16,18)（下标 1..7）。(a) 求 opt(i) 与 bestSub(i)，i=1..7；并列时取最小的第一段长度。(b) 从长度 7 出发，用 bestSub 还原最优切割方案，写出剩余长度序列。",
      solution: "(a) opt=(1,5,8,10,13,16,18)，bestSub=(1,2,3,2,2,3,2)。例如 opt(4)=max{P1+opt3=9, P2+opt2=10, P3+opt1=9, P4=10}=10，最小 j 为 2；opt(7)=max{P1+16=17, P2+13=18, P3+10=18, …, P7=18}=18，最小 j=2。(b) bestSub(7)=2，剩 5；bestSub(5)=2，剩 3；bestSub(3)=3，剩 0。剩余长度 7→5→3→0，段长 [2,2,3]，收益 5+5+8=18。"
    },
    {
      id: "mid-6", source: "MID+", num: 6, extra: true, module: "mid", topic: "分治", points: "15%", difficulty: 3,
      title: "O(n) 求最大下跌 A[i]−A[j]",
      prompt: "给定数组 A[1..n]（n 为 2 的幂），设计分治算法在 O(n) 时间求 max_{1≤i<j≤n}(A[i]−A[j])。要求说明正确性与复杂度。",
      solution: "对区间返回三元组 (min, max, D)，其中 D 是区间内 i<j 的最大 A[i]−A[j]。长度 1 时 D=−∞（无合法 pair）；长度 2 时 D=A[l]−A[r]。合并左右：m=min(mL,mR)，M=max(ML,MR)，跨区间的最优 pair 必为“左半最大值 − 右半最小值”=ML−mR，故 D=max(DL,DR,ML−mR)。正确性：任意 pair 要么全左、要么全右、要么左索引在左半且右索引在右半；第三种情况下固定右端取左半最大、固定左端取右半最小即可。时间 T(n)=2T(n/2)+O(1)=O(n)。"
    },
    {
      id: "mid-7", source: "MID+", num: 7, extra: true, module: "mid", topic: "DP / 重建", points: "15%", difficulty: 2,
      title: "不相邻位置的最大和",
      prompt: "给定 n 个正整数 A[1..n]。选一个位置集合，使任意两个被选位置不相邻，且和最大。设计 O(n) 时间算法，输出最大和以及一个最优位置集合。",
      solution: "令 F(i) 为前缀 1..i 的最优和。F(0)=0，F(1)=A[1]；对 i≥2，F(i)=max{F(i−1), F(i−2)+A[i]}。记录 take(i) 表示是否取 i；并列时取“不选 i”的分支。答案为 F(n)。回溯：i=n；若 take(i) 则输出 i 并令 i←i−2，否则 i←i−1。正确性：任何最优解要么不含 i（≤F(i−1)），要么含 i（则不能含 i−1，其余部分≤F(i−2)，总和≤F(i−2)+A[i]），两种界都可达。时间 O(n)，空间 O(n)。例：A=(5,1,2,10,6,2) 得 F=(0,5,5,7,15,15,17)，一个最优集合 {1,4,6}，和 17。"
    }
  ];

  window.COURSE_DATA = { MODULES, EXERCISES, EXTRA_EXERCISES, FORMULAS };
})();
