/* =========================================================
   CLRS 精讲 · 20 个课程单元
   References are to 《算法导论（第 3 版）》中文版章节。
   Content is written for CSCI3160 exam preparation, not copied.
   ========================================================= */
(function () {
  "use strict";

  const TEXTBOOK = [
    {
      id: "u1", num: 1, part: "基础", title: "递归、重复与几何级数", en: "Recursion, Repeating, Geometric Series", ref: "中文版 §9.2（随机选择）", tags: ["期望", "几何级数", "随机选择"],
      summary: "三个最基础的“时间账本”：递归展开、独立重复试验、几何级数求和。它们是随机选择、哈希、快速排序期望分析的语言。",
      body: `
        <h3>教材在讲什么</h3>
        <p>《算法导论》在随机选择（§9.2）里反复使用一个动作：随机选枢轴，若划分不够好就“重来一次”。要分析它，必须会算“独立重复直到成功”的期望次数，以及递归调用的总代价。</p>
        <div class="insight"><span class="label">一句话</span>“递归”给出式子，“重复”给出 1/p，“几何级数”把无穷多轮加成一个常数。</div>
        <p><strong>几何级数</strong>：当 |x|&lt;1 时，<span class="math">Σ<sub>i=0</sub><sup>∞</sup>x<sup>i</sup>=1/(1−x)</span>。于是 <span class="math">Σ<sub>i=0</sub><sup>∞</sup>i·x<sup>i</sup>=x/(1−x)²</span>，用于计算“期望轮数 × 每轮代价”。</p>
        <p><strong>重复试验</strong>：若每次独立试验成功概率为 p，则成功前失败次数的期望为 <span class="math">(1−p)/p</span>，总试验次数的期望为 <span class="math">1/p</span>。这是“重复直到成功”的全部数学。</p>
        <h3>随机选择为什么是 O(n)</h3>
        <p>每次随机选枢轴。若枢轴秩落在中间一半（好枢轴），保留子问题 ≤3n/4；坏枢轴概率 ≤1/2。把“连续两次好枢轴”看成一个阶段，阶段数期望 O(1)，每阶段规模按 3/4 缩小，总期望代价是几何级数：<span class="math">O(n)(1+3/4+(3/4)²+…)=O(n)</span>。</p>
        <h3>考场怎么写</h3>
        <p>先写“一次 trial 的成功概率”，再写“成功前 trial 数期望 = 1/p”，最后乘每轮 O(n)。不要只写“平均 O(n)”而不交代概率模型。</p>`,
      example: "用 RANDOM(1,128) 生成 1..100：每次落在范围内的概率 100/128，期望调用 128/100=1.28 次。若生成 0/1 再拼二进制，期望次数是 O(log n)，但要注意拒绝采样。",
      pitfalls: ["把“期望 O(n)”写成“最坏 O(n)”；随机选择的最坏情况仍是 O(n²)。", "几何级数公式忘记 |x|<1 的条件。", "独立试验中把“失败次数期望”与“总次数期望”混为一谈。"],
      related: [{ label: "加练 A · 随机 k-selection trial", href: "#/extra/A" }, { label: "对应讲义：先修底座", href: "#/module/pre" }]
    },
    {
      id: "u2", num: 2, part: "基础", title: "分治", en: "Divide and Conquer", ref: "中文版 §4.1、§4.2、§28.2", tags: ["递归式", "归并排序", "Strassen"],
      summary: "分治不是“把数组切两半”这么简单：要证明子问题独立、合并正确，并解对递归式。",
      body: `
        <h3>教材框架</h3>
        <p>分治三步：<strong>Divide</strong> 把原问题拆成若干规模更小的子问题；<strong>Conquer</strong> 递归求解；<strong>Combine</strong> 合并子解。正确性通常用归纳，复杂度用递归式。</p>
        <p>常见递归式：归并排序 <span class="math">T(n)=2T(n/2)+Θ(n)=Θ(n log n)</span>；二分查找 <span class="math">T(n)=T(n/2)+O(1)=O(log n)</span>；Strassen 矩阵乘法 <span class="math">T(n)=7T(n/2)+Θ(n²)=Θ(n<sup>log₂7</sup>)≈O(n<sup>2.81</sup>)</span>。</p>
        <h3>主定理的考场版</h3>
        <p>对 <span class="math">T(n)=aT(n/b)+f(n)</span>，比较 <span class="math">f(n)</span> 与 <span class="math">n<sup>log<sub>b</sub>a</sup></span>：若 f 更小（多项式意义上），则 <span class="math">T=Θ(n<sup>log<sub>b</sub>a</sup>)</span>；若同阶，则乘 log n；若 f 更大且满足正则条件，则 <span class="math">T=Θ(f(n))</span>。</p>
        <h3>经典设计题</h3>
        <p>最大子数组：左半、右半、跨中点三种情况，跨中点用“向左最大后缀 + 向右最大前缀”，合并 O(n)，总 O(n log n)。教材 §4.1 用股票买卖解释“最大子数组”。</p>
        <p>“最大下跌 A[i]−A[j]”是同一套路：返回 (min,max,D)，跨区间用 ML−mR，合并 O(1)，得到 O(n)。</p>`,
      example: "T(n)=2T(n/2)+O(1) 的解是 O(n)，不是 O(n log n)：每层合并 O(1)，共 log n 层，但每层有 2^level 个结点，总工作量仍是 n。画递归树最稳。",
      pitfalls: ["漏掉 Combine 的代价，或把合并写成 O(1)。", "递归式与算法实际切分不一致（例如不是均分却套主定理）。", "只证明“合并后可行”，没证明“最优解一定落在三种情况之一”。"],
      related: [{ label: "加练 A · 最大下跌", href: "#/extra/A" }, { label: "加练 B · 分治式 BST 建树", href: "#/extra/B" }]
    },
    {
      id: "u3", num: 3, part: "贪心", title: "活动选择", en: "Activity Selection", ref: "中文版 §16.1", tags: ["贪心", "交换论证", "区间"],
      summary: "按最早结束时间选，是活动选择的标准贪心；正确性靠“交换论证”，不是靠直觉。",
      body: `
        <h3>问题</h3>
        <p>给定 n 个区间 [s<sub>i</sub>,f<sub>i</sub>)，选最多两两不重叠的区间。教材按结束时间升序，每次选第一个与已选集合兼容的区间。</p>
        <h3>为什么最早结束是对的</h3>
        <p>设最优解 O 中第一个区间为 [s,f]，贪心选的是结束最早的 [s₁,f₁]，则 f₁≤f。把 O 中的 [s,f] 换成 [s₁,f₁]，不会与 O 中其余区间冲突（因为它们都在 f 之后开始），所以仍是最优解。归纳即可。</p>
        <p>复杂度：排序 O(n log n)，扫描 O(n)。若输入已按结束时间有序，则 O(n)。</p>
        <h3>常见错误准则</h3>
        <p>“最早开始”“最短区间”“最少冲突”都不是正确贪心。反例只需两个重叠区间：S={[1,3],[2,4]}，最早开始的 [1,3] 不属于最优解 {[2,4]}。</p>`,
      example: "区间 [1,3],[2,4],[3,5]（半开）按结束时间选 [1,3]，再选 [3,5]，得到 2 个；若选 [2,4] 只能选 1 个。",
      pitfalls: ["把“最早结束”与“最早开始”混淆。", "交换论证只换第一个区间，却没说为什么后面的区间不受影响。", "区间开闭处理错误，导致端点相接被误判为冲突。"],
      related: [{ label: "加练 A · 最早开始反例", href: "#/extra/A" }, { label: "对应讲义：先修底座", href: "#/module/pre" }]
    },
    {
      id: "u4", num: 4, part: "贪心", title: "最小生成树", en: "Minimum Spanning Trees", ref: "中文版第 23 章（可跳过 Kruskal）", tags: ["MST", "Prim", "割性质"],
      summary: "MST 的贪心由割性质保证；Prim 每次取最轻跨边。MST 不是最短路树，二者目标不同。",
      body: `
        <h3>定义与性质</h3>
        <p>连通无向图 G=(V,E)，生成树含全部点、|V|−1 条边、无环。MST 是总权最小的生成树。教材第 23 章给出<strong>割性质</strong>：对任意割 (S,V\\S)，最轻跨边一定属于某棵 MST。</p>
        <h3>Prim</h3>
        <p>从任意点开始，维护已选集合 S；每次选连接 S 与 V\\S 的最轻边，把新点加入 S。正确性用割性质 + 归纳：每一步选的边都可扩展成一棵 MST。</p>
        <p>用优先队列实现：<span class="math">O((|V|+|E|)log|V|)</span>；邻接矩阵朴素实现 O(V²)。</p>
        <h3>与最短路树的区别</h3>
        <p>MST 最小化“所有树边权之和”；最短路树最小化“根到每个点的路径长度”。两者一般不同。TSP 的 2-近似只用 MST 的下界，不需要最短路树。</p>`,
      example: "三角形三边权 1,1,10：MST 取两条 1；若以某点为根，最短路树也可能取 1+1，但换成 1+10 的图就能看出差异。",
      pitfalls: ["认为 MST 唯一；只有所有边权互异时才唯一。", "把 MST 当成最短路树。", "Prim 中把“已选点内部边”当成跨边。"],
      related: [{ label: "加练 C · TSP 里的 MST", href: "#/extra/C" }, { label: "对应讲义：TSP", href: "#/module/tsp" }]
    },
    {
      id: "u5", num: 5, part: "贪心", title: "赫夫曼编码", en: "Huffman Codes", ref: "中文版 §16.3", tags: ["前缀码", "贪心", "堆"],
      summary: "每次合并两个最小频率的结点，得到最优前缀码。码长等于叶深度，正确性用交换论证。",
      body: `
        <h3>前缀码</h3>
        <p>没有任何码字是另一个码字的前缀，因此解码无歧义。最优前缀码对应一棵满二叉树：叶是字母，边标 0/1，码长=叶深度。</p>
        <h3>Huffman 算法</h3>
        <p>把每个字母看成一个权为频率的叶；重复“取两个最小权结点，合并成新结点，权为两者之和”，直到只剩一个根。用最小堆实现 O(n log n)。</p>
        <div class="math-block">平均码长 = Σ<sub>i</sub> freq<sub>i</sub> · depth<sub>i</sub></div>
        <h3>正确性直觉</h3>
        <p>频率最小的两个字母一定可以放在最深层且互为兄弟（交换论证：把更深的叶与它们交换不会增大平均码长）。合并后的问题与原问题最优值相差“两个频率之和”，归纳即可。</p>
        <h3>等频特例</h3>
        <p>若 n=2<sup>k</sup> 且所有频率相同，Huffman 每轮把等权结点两两合并，最终是完美平衡树，所有码字长 k=log₂n。教材的“等频”分析正是这个结构。</p>`,
      example: "频率 3,5,10,12,14,16,18,22（%）：不断取最小两个合并，最终平均码长约 2.7 bit；手工画树时每一步写合并权，避免抄错。",
      pitfalls: ["把“频率最大”放在最深；应把频率最小放最深。", "忘记前缀码约束，直接按频率排序编定长码。", "合并后新结点权算错，导致后续选择错。"],
      related: [{ label: "加练 A · 等频 Huffman", href: "#/extra/A" }]
    },
    {
      id: "u6", num: 6, part: "DP", title: "递归的陷阱", en: "Pitfall of Recursion", ref: "中文版 §15.1", tags: ["重叠子问题", "记忆化", "DP"],
      summary: "朴素递归慢，不是因为递归本身，而是因为同一个子问题被反复展开。DP 的第一原则是“每个子问题只算一次”。",
      body: `
        <h3>从斐波那契/杆切割看重叠</h3>
        <p>递推 <span class="math">f(k)=max<sub>1≤i≤k</sub>{P[i]+f(k−i)}</span> 的朴素递归会反复计算 f(k−1), f(k−2), …。调用次数呈指数增长，而不同子问题只有 k 个。</p>
        <h3>两种实现</h3>
        <p><strong>记忆化（top-down）</strong>：递归 + 缓存，遇到算过的直接返回。<strong>制表（bottom-up）</strong>：按依赖顺序填表。两者复杂度相同，通常 bottom-up 常数更小，top-down 只算必要子问题。</p>
        <h3>分析模板</h3>
        <p>时间 = 子问题个数 × 每个子问题的计算代价；空间 = 表格大小 + 递归栈。不要只说“O(n²)”，要能指出状态数和转移代价。</p>`,
      example: "Rod Cutting n=7 的朴素递归调用次数远大于 7 个状态；DP 只填 opt[0..7]，每个 O(n)，总 O(n²)。",
      pitfalls: ["把 DP 当成“递归改循环”，却没有定义清楚状态。", "记忆化时缓存 key 不完整（少一个参数）。", "忽略递归深度导致栈溢出。"],
      related: [{ label: "加练 A · 不相邻最大和", href: "#/extra/A" }, { label: "对应讲义：先修底座", href: "#/module/pre" }]
    },
    {
      id: "u7", num: 7, part: "DP", title: "钢条切割", en: "Rod Cutting", ref: "中文版 §15.1", tags: ["一维 DP", "重建", "O(n²)"],
      summary: "Rod Cutting 是“完全背包型”一维 DP 的原型：枚举第一段长度，剩余部分继续最优。",
      body: `
        <h3>递推</h3>
        <p><span class="math">opt(0)=0</span>，<span class="math">opt(i)=max<sub>1≤j≤i</sub>{P[j]+opt(i−j)}</span>。这里 j 是“第一段”的长度，剩余 i−j 继续切。</p>
        <h3>为什么不会重复计数</h3>
        <p>每一种切割方案都有唯一的第一段长度 j，所以按 j 分类不重不漏。剩余部分的最优性由最优子结构保证。</p>
        <h3>重建</h3>
        <p>记录 <span class="math">bestSub(i)=argmax j</span>（并列取最小 j）。从 n 开始，反复取 bestSub(i)，直到 i=0。时间 O(n)，空间 O(n)。</p>
        <p>若每切一刀有成本 c，则递推改为 <span class="math">P[j]+opt(i−j)−c</span>（最后一段不再切），或按题意把成本放进转移。</p>`,
      example: "P=(1,5,8,10,13,16,18) 时 opt=(1,5,8,10,13,16,18)，bestSub=(1,2,3,2,2,3,2)，7→5→3→0，方案 [2,2,3]。",
      pitfalls: ["bestSub 记录的是“最后一段”而不是第一段，重建顺序会反。", "并列时没有按题目要求取最小/最大 j。", "把 opt(i−j) 写成 opt(j) 或漏掉 P[j]。"],
      related: [{ label: "加练 A · Rod Cutting", href: "#/extra/A" }, { label: "对应讲义：先修底座", href: "#/module/pre" }]
    },
    {
      id: "u8", num: 8, part: "DP", title: "依赖关系与拓扑序", en: "Dependency", ref: "中文版 §15.4", tags: ["DAG", "拓扑序", "LCS"],
      summary: "DP 的计算顺序不是随意的：子问题依赖构成 DAG，任何拓扑序都能用来填表。",
      body: `
        <h3>依赖图</h3>
        <p>把每个子问题看成一个点；若 A 需要 B 的答案，就连 B→A。只要图是 DAG，就存在拓扑序，按拓扑序计算即可。若依赖图有环，说明状态定义有循环依赖，DP 不成立。</p>
        <h3>LCS 的二维依赖</h3>
        <p><span class="math">f(i,j)</span> 依赖 <span class="math">f(i−1,j−1)</span> 或 <span class="math">f(i−1,j), f(i,j−1)</span>。因此按行（i 递增）、按列（j 递增），或按对角线都可以。</p>
        <h3>DAG 上的最短路/最长路</h3>
        <p>DAG 上即使有负权，也可按拓扑序 DP；这就是“依赖”一讲与图论的交汇点，也是 SCC 缩点后常用的技巧。</p>`,
      example: "LCS 表从 f(0,0) 填到 f(n,m)，每个格子 O(1)，总 O(nm)。如果按 j 从大到小填，就会用到尚未计算的 f(i,j−1)，错误。",
      pitfalls: ["只看“参数更大”就认为依赖满足，忽略转移方向。", "忘记 base row/column 的初始化。", "在一般有向图上直接 DP，不先缩点/拓扑排序。"],
      related: [{ label: "加练 B · SCC 缩点归约", href: "#/extra/B" }, { label: "对应讲义：SCC", href: "#/module/scc" }]
    },
    {
      id: "u9", num: 9, part: "DP", title: "最长公共子序列", en: "Longest Common Subsequence", ref: "中文版 §15.4", tags: ["LCS", "二维 DP", "重建"],
      summary: "LCS 的递推只有三种情况；难的是把“为什么只考虑这三种”讲清楚，以及重建时走哪一格。",
      body: `
        <h3>递推</h3>
        <p><span class="math">f(0,j)=f(i,0)=0</span>。若 x[i]=y[j]，则 <span class="math">f(i,j)=f(i−1,j−1)+1</span>；否则 <span class="math">f(i,j)=max{f(i−1,j),f(i,j−1)}</span>。</p>
        <h3>正确性要点</h3>
        <p>若末字符相同，存在一个 LCS 让它们配对；若不同，任何 LCS 都不可能同时用这两个末字符，于是它要么是 x[1..i−1] 与 y 的 LCS，要么是 x 与 y[1..j−1] 的 LCS。两种情况取最大即可。</p>
        <h3>重建</h3>
        <p>从 (n,m) 回溯：字符相同则输出并左上走；否则向 f 值更大的方向走（并列任选）。时间 O(n+m)。</p>
        <p><strong>LCS vs 最长公共子串</strong>：子串要求连续，状态在字符不等时直接置 0；子序列不要求连续，保留 max。</p>`,
      example: "x=ABCBDAB, y=BDCABA，f(7,6)=4，可重建 BCBA 或 BCAB。",
      pitfalls: ["字符不等时忘记取 max，直接置 0（那是子串）。", "重建时在字符相等处仍走 max 分支。", "把字符串下标从 0 开始却用 1-based 递推。"],
      related: [{ label: "对应讲义：先修底座", href: "#/module/pre" }, { label: "加练 B · 依赖与 DP", href: "#/extra/B" }]
    },
    {
      id: "u10", num: 10, part: "DP", title: "最优二叉搜索树", en: "Optimal BST", ref: "中文版 §15.5", tags: ["区间 DP", "O(n³)", "重建"],
      summary: "固定根后左右独立，区间总权是“每个 key 都先付一次”的量；按区间长度递增，O(n³)。",
      body: `
        <h3>递推</h3>
        <p><span class="math">opt(a,b)=0</span>（a&gt;b），否则</p>
        <div class="math-block">opt(a,b)=Σ<sub>i=a</sub><sup>b</sup>W[i]+min<sub>a≤r≤b</sub>{opt(a,r−1)+opt(r+1,b)}</div>
        <p>为什么加 ΣW：把 cost 拆成 1+level。区间内每个 key 都先为“根这一层”付一次 W，左右子树内部的相对层数再由子问题贡献。</p>
        <h3>复杂度</h3>
        <p>Θ(n²) 个区间，每个枚举 O(n) 个根，O(n³)。记录 bestroot 后 O(n) 建树。教材 §15.5 还讨论了 Knuth 优化到 O(n²)，但本课程不要求。</p>
        <h3>为什么不能贪心</h3>
        <p>权重最大的 key 不一定是根；把它放根会把另一侧大量 key 压深。W=(1,2,3,4) 时贪心链 4-3-2-1 代价 20，最优根 3 代价 18。</p>`,
      example: "W=(40,15,35,10) 时 opt(1,4)=180，根 3，左子树根 2，右孩子 4。",
      pitfalls: ["忘记区间和，或只加一次 W[root]。", "按 a/b 递增而不是按区间长度递增。", "bestroot 并列时没有按题目要求取最小根。"],
      related: [{ label: "加练 B · Optimal BST 手跑", href: "#/extra/B" }, { label: "对应讲义：Optimal BST", href: "#/module/bst" }, { label: "原始题：SP8", href: "#/exercises/sp8-1" }]
    },
    {
      id: "u11", num: 11, part: "图", title: "DFS 与白路径定理", en: "DFS and White Path Theorem", ref: "中文版 §22.3", tags: ["DFS", "时间戳", "白路径"],
      summary: "DFS 的灰/黑颜色与时间戳给出括号结构；白路径定理把“后代关系”与“纯白可达”精确对应。",
      body: `
        <h3>颜色与时间戳</h3>
        <p>白=未发现，灰=在递归栈，黑=完成。记录 discovery time d[u] 与 finish time f[u]；DFS 森林满足括号定理：对任意 u,v，区间 [d[u],f[u]] 与 [d[v],f[v]] 要么不交，要么一个包含另一个。</p>
        <h3>白路径定理</h3>
        <p>u 刚变灰时，v 将成为 u 的后代 ⇔ 此刻存在 u→v 的全白路径。证明用“DFS 不会在还有白色可达点时提前结束”这一不变量。</p>
        <h3>有向边分类</h3>
        <p>树边、后向边（指向祖先，说明有环）、前向边、交叉边。无向图 DFS 没有前向/交叉边，只有树边和后向边。</p>`,
      example: "讲义图中 g 刚入栈时，g 可经白点到达 f,e,i，所以 f,e,i 都是 g 的后代；h 不在 g 的白路径上，另起一棵树。",
      pitfalls: ["把灰色当成“已完成”。", "认为 DFS 只有一棵树；可能是森林。", "把白路径定理的“白点”理解成“任意点”。"],
      related: [{ label: "加练 B · SCC 证明", href: "#/extra/B" }, { label: "对应讲义：DFS", href: "#/module/dfs" }]
    },
    {
      id: "u12", num: 12, part: "图", title: "强连通分量", en: "Strongly Connected Components", ref: "中文版 §22.5", tags: ["SCC", "Kosaraju", "缩点"],
      summary: "两遍 DFS：原图按完成时间标号，反图按标号从大到小；每棵 DFS 树就是一个 SCC。",
      body: `
        <h3>定义与缩点</h3>
        <p>SCC 是极大的互相可达点集，两两不交。把 SCC 缩成点得到 G<sup>scc</sup>，它一定是 DAG。</p>
        <h3>算法</h3>
        <ol><li>在 G 上 DFS，按变黑顺序标 1..n。</li><li>构造 G<sup>rev</sup>。</li><li>在 G<sup>rev</sup> 上按 label 从大到小 DFS；每棵树是一个 SCC。</li></ol>
        <p>若 G<sup>scc</sup> 有边 S<sub>i</sub>→S<sub>j</sub>，则 label(S<sub>i</sub>)&gt;label(S<sub>j</sub>)。第二次 DFS 从最大 label 出发，白路径定理保证不会跑到别的 SCC。</p>
        <h3>复杂度</h3>
        <p>两次 DFS + 建反图，O(V+E)。缩点后可在 DAG 上做拓扑 DP。</p>`,
      example: "讲义图输出 {a,b,c}, {d,e,f,g,k,l}, {h,i}, {j}；缩点图是一条 DAG。",
      pitfalls: ["第二次 DFS 跑原图。", "按 label 从小到大。", "label 用发现时间而不是完成时间。"],
      related: [{ label: "加练 B · 缩点归约", href: "#/extra/B/mid-b1" }, { label: "加练 B · 标号证明", href: "#/extra/B/mid-b3" }, { label: "对应讲义：SCC", href: "#/module/scc" }]
    },
    {
      id: "u13", num: 13, part: "图", title: "Dijkstra", en: "SSSP with Non-Negative Weights", ref: "中文版 §24.2、§24.3", tags: ["SSSP", "贪心", "优先队列"],
      summary: "每次取出当前 dist 最小的未定点并松弛；非负权保证“弹出即最终”。",
      body: `
        <h3>松弛</h3>
        <p><span class="math">dist(v)=min(dist(v),dist(u)+w(u,v))</span>，成功时更新 parent。</p>
        <h3>正确性</h3>
        <p>对弹出顺序归纳。若 v 弹出时还有最短路上的点 z 未弹出，则沿最短路前驱已把 z 松弛，dist(z)=spdist(z)&lt;spdist(v)，与 v 最小矛盾。因此 dist(v)=spdist(v)。</p>
        <h3>实现与复杂度</h3>
        <p>二叉堆 O((V+E)log V)；Fibonacci 堆 O(V log V+E)。负权反例：s→a 1，s→b 2，b→a −2，a 会被提前宣布为 1，真实为 0。</p>
        <p>DAG 即使有负权也可按拓扑序 DP，不需要 Dijkstra。</p>`,
      example: "从 s 出发，先弹出 dist=0 的 s，再 b=1、a=2、c=3、t=4；每次只松弛当前点的出边。",
      pitfalls: ["把“已发现”当“已确定”。", "负权仍用 Dijkstra。", "只更新 dist 不更新 parent。"],
      related: [{ label: "加练 B · Dijkstra 手跑", href: "#/extra/B/mid-b4" }, { label: "加练 C · 负权反例", href: "#/extra/C/mid-c3" }, { label: "对应讲义：Dijkstra", href: "#/module/dijkstra" }]
    },
    {
      id: "u14", num: 14, part: "图", title: "Bellman–Ford", en: "SSSP with Arbitrary Weights", ref: "中文版 §24.1、§24.5", tags: ["负权", "负环", "O(VE)"],
      summary: "对“路径边数”做 DP：|V|−1 轮全边松弛；第 |V| 轮还能松弛就是负环。",
      body: `
        <h3>为什么是 |V|−1 轮</h3>
        <p>无负环时，最短路径可取简单路径，最多 |V|−1 条边。第 i 轮结束后，所有“最多 i 条边”的最短路都已被发现。归纳：最短路最后一条边 (p,v)，第 i−1 轮后 dist(p) 已正确，第 i 轮松弛它即可。</p>
        <h3>负环检测</h3>
        <p>再做一轮，若仍有 <span class="math">dist(v)&gt;dist(u)+w(u,v)</span>，说明存在从 s 可达的负环。若负环不可达，dist 全为 ∞，不会触发。</p>
        <h3>复杂度与重建</h3>
        <p>O(VE)。成功松弛时记 parent；负环时 parent 可能成环，不能输出树。可提前停止：某轮无更新即可结束。</p>`,
      example: "s→a4,s→b5,b→a−3,a→c2,c→t3,b→t8：四轮表最终 (0,2,5,4,7)。",
      pitfalls: ["只做 |V|−2 轮。", "负环检测放在最后一轮之前。", "认为轮内松弛顺序影响最终结果（不影响）。"],
      related: [{ label: "加练 B · BF 四轮表", href: "#/extra/B/mid-b5" }, { label: "对应讲义：Bellman–Ford", href: "#/module/bellman" }]
    },
    {
      id: "u15", num: 15, part: "图", title: "所有结点对最短路与 Johnson", en: "All-Pairs Shortest Paths / Johnson", ref: "中文版 §25.2、§25.3", tags: ["APSP", "重赋权", "势函数"],
      summary: "一次 Bellman–Ford 求势 h，再跑 |V| 次 Dijkstra。重赋权只改变端点项，不改变最短路。",
      body: `
        <h3>重赋权引理</h3>
        <p><span class="math">w′(u,v)=w(u,v)+h(u)−h(v)</span>。任意路径的新长度 = 原长度 + h(起点)−h(终点)，中间项望远镜抵消；固定端点时所有路径加同一个常数，所以最短路不变。</p>
        <h3>dummy 与势函数</h3>
        <p>加 dummy 点，向所有点连 0 权边，Bellman–Ford 求 <span class="math">h(u)=spdist(dummy,u)</span>。三角不等式给出 <span class="math">h(v)≤h(u)+w(u,v)</span>，即 w′≥0。</p>
        <h3>复杂度</h3>
        <p>BF 一次 O(VE) + |V| 次 Dijkstra O(V(V+E)log V)。还原距离：<span class="math">spdist(s,v)=d′(s,v)−h(s)+h(v)</span>。</p>
        <p>教材 §25.2 的 Floyd–Warshall 是 O(V³) 的另一条路线；本课程重点是 Johnson。</p>`,
      example: "讲义图 h=(0,0,0,−6,−6,−7,−9)，重赋权后所有边非负，最短路结构不变。",
      pitfalls: ["重赋权后忘记还原。", "用 Dijkstra 求 h（有负权必须 BF）。", "忘记检测负环。"],
      related: [{ label: "加练 B · Johnson 证明", href: "#/extra/B/mid-b7" }, { label: "对应讲义：APSP/Johnson", href: "#/module/apsp" }]
    },
    {
      id: "u16", num: 16, part: "图", title: "最大流", en: "Max Flow", ref: "中文版 §26.1、§26.2", tags: ["最大流", "最小割", "残量网络"],
      summary: "在残量图中不断找增广路；终止时残量图的可达集给出最小割。反向边是“反悔”机制。新增的 RE9b/SP10b 题集会直接考残量图、最小割、点容量、多源多汇与二分图匹配。",
      body: `
        <h3>流与残量</h3>
        <p>容量约束 0≤f(u,v)≤c(u,v)，除 s,t 外流量守恒。残量 <span class="math">R(u,v)=c(u,v)−f(u,v)</span>；R&gt;0 的边构成残量图。沿 s→t 路径增广 Δ=路径最小残量，正向加、反向减。</p>
        <h3>最大流最小割</h3>
        <p>三条等价：F 最大；残量图无 s→t 路径；存在割 (S,T) 使 |F|=c(S,T)。若没有增广路，令 S=残量图中 s 可达点，则跨割边全部满流，容量=|F|。</p>
        <h3>复杂度</h3>
        <p>整数容量下每次 Δ≥1，最多 M 次增广，O(EM)。BFS 找增广路（Edmonds–Karp）可到 O(VE²)，课程不要求证明。最大流值必为整数。</p>`,
      example: "讲义网络最大流 23；最终残量图从 s 可达 {s,v1,v2,v4}，割边 v1→v3(12)+v4→v3(7)+v4→t(4)=23。",
      pitfalls: ["忘记反向边，无法撤销坏选择。", "增广容量取和而不是最小残量。", "割容量把 T→S 的边也算进去。"],
      related: [{ label: "RE9b · 最大流求最小割", href: "#/exercises/re9b-1" }, { label: "SP10b · 残量图", href: "#/exercises/sp10b-1" }, { label: "RE9b · 点容量", href: "#/exercises/re9b-4" }, { label: "加练 B · FF 小网络", href: "#/extra/B/mid-b6" }, { label: "对应讲义：最大流", href: "#/module/maxflow" }]
    },
    {
      id: "u17", num: 17, part: "近似", title: "顶点覆盖与 MAX-3SAT", en: "Vertex Cover and MAX-3SAT", ref: "中文版 §35.1、§35.4", tags: ["近似比", "VC", "随机化"],
      summary: "VC 用极大匹配给出 2-近似；MAX-3SAT 用随机赋值给出 7/8 期望近似。两者都是“下界 + 上界”的模板。",
      body: `
        <h3>近似比</h3>
        <p>最小化问题：ALG≤α·OPT；最大化：ALG≥α·OPT。随机算法用期望。NP-hard 只排除多项式精确算法，不排除近似。</p>
        <h3>Vertex Cover</h3>
        <p>反复选一条未删边 {u,v}，把两端加入 S，删除所有关联边。被选边构成匹配 M：任意两条不共享端点。任何 VC 至少要覆盖每条匹配边的一个端点，故 |M|≤OPT；算法输出 2|M|≤2OPT。K<sub>n,n</sub> 说明比可达 2。</p>
        <h3>MAX-3SAT</h3>
        <p>每个变量独立 1/2 取 0/1；一个 3-文字子句为假概率 1/8，满足概率 7/8。由期望线性性，E[满足数]=7n/8≥(7/8)OPT。</p>
        <p>随机 Max-Cut 同理：每条边被割概率 1/2，E[cut]=|E|/2≥OPT/2。</p>`,
      example: "K<sub>n,n</sub> 上 VC 算法选 2n，最优 n，比值 2；8 个 3-子句的公式随机赋值期望满足 7 个。",
      pitfalls: ["把归约方向写反。", "把 7/8 说成“必定满足”。", "VC 中 M 不是匹配（选边后必须删关联边）。"],
      related: [{ label: "加练 C · VC→Set Cover", href: "#/extra/C/mid-c7" }, { label: "对应讲义：NP-hard", href: "#/module/np" }]
    },
    {
      id: "u18", num: 18, part: "近似", title: "旅行商问题", en: "Traveling Salesman", ref: "中文版 §35.2", tags: ["TSP", "MST", "三角不等式"],
      summary: "度量 TSP 的 2-近似：MST 下界 + 双走上界 + 抄近路。没有三角不等式就没有这个保证。",
      body: `
        <h3>三步</h3>
        <ol><li>求 MST T。</li><li>每条树边双走，得到闭游走 W，长度 2w(T)。</li><li>按首次访问抄近路，得到 Hamiltonian 环 C。</li></ol>
        <p>证明链：OPT≥w(T)（环删一条边是生成树）；w(W)=2w(T)；抄近路每段用三角不等式 w(u,v)≤绕行长度，故 w(C)≤w(W)=2w(T)≤2OPT。</p>
        <h3>为什么需要三角不等式</h3>
        <p>抄近路把一段路径替换成直接边，只有三角不等式才能保证不增。去掉它，MST 双走可能给出远大于 2OPT 的环；更强地，一般 TSP 无常数近似（Hamiltonian Cycle 归约）。</p>`,
      example: "正方形四点：MST 6，双走 12，抄近路 8，OPT 8，比值 1。",
      pitfalls: ["把 W 的长度写成 w(T)。", "抄近路时用最后访问而不是首次访问。", "认为 2-近似对所有 TSP 实例都成立。"],
      related: [{ label: "加练 C · 正方形 TSP", href: "#/extra/C/mid-c4" }, { label: "对应讲义：TSP", href: "#/module/tsp" }]
    },
    {
      id: "u19", num: 19, part: "近似", title: "集合覆盖与命中集合", en: "Set Cover and Hitting Set", ref: "中文版 §35.3", tags: ["Set Cover", "贪心", "对数近似"],
      summary: "每步选覆盖最多未覆盖元素的集合；对数近似来自“剩余元素每步至少乘 (1−1/OPT)”。",
      body: `
        <h3>贪心</h3>
        <p>维护未覆盖集合 F；每步选 benefit=|S∩F| 最大的集合。每步至少覆盖一个元素，最多 |U| 步，时间多项式。</p>
        <h3>1+ln|U| 分析</h3>
        <p>最优解大小 OPT。第 i 步前剩 z<sub>i−1</sub> 个元素，最优解中必有集合覆盖至少 z<sub>i−1</sub>/OPT 个；贪心选最大，故 z<sub>i</sub>≤z<sub>i−1</sub>(1−1/OPT)。迭代并用 1+x≤e<sup>x</sup>：</p>
        <div class="math-block">z<sub>t−1</sub>≤|U|e<sup>−(t−1)/OPT</sup>，又 z<sub>t−1</sub>≥1 ⇒ t≤1+OPT ln|U|</div>
        <h3>Hitting Set</h3>
        <p>选最少元素命中每个集合。转成 Set Cover：每个元素 e 对应“包含 e 的集合”N<sub>e</sub>，以原集合族为全集；近似比 1+ln|𝒮|。区间刺穿是典型应用。</p>`,
      example: "讲义 12 元素/6 集合：贪心选 5 个，最优 4 个；比值 1.25，说明对数上界不紧。",
      pitfalls: ["用初始大小而不是当前 benefit。", "把 OPT 当成已选数。", "把对数近似说成常数 2。"],
      related: [{ label: "加练 C · Set Cover 手跑", href: "#/extra/C/mid-c5" }, { label: "加练 C · VC 归约", href: "#/extra/C/mid-c7" }, { label: "对应讲义：Set Cover", href: "#/module/setcover" }]
    },
    {
      id: "u20", num: 20, part: "近似", title: "k-中心", en: "k-Center", ref: "课程讲义（CLRS 第 3 版未单列）", tags: ["k-Center", "最远点优先", "2-近似"],
      summary: "最远点优先：每次把离当前中心集最远的点加入。2-近似证明分“每簇都有中心”和“某簇两个中心”两情况。",
      body: `
        <h3>问题</h3>
        <p>选 k 个中心 C⊆P，最小化 <span class="math">pen(C)=max<sub>p</sub>min<sub>c∈C</sub>dist(p,c)</span>。目标是最坏情况半径，不是距离和。</p>
        <h3>算法</h3>
        <p>任选首中心；重复 k−1 次，选离当前 C 最远的点加入。维护 d[p]=到 C 的最小距离，每轮 O(n) 更新，总 O(nk)。</p>
        <h3>证明</h3>
        <p>设最优簇 P<sub>i</sub>。若每个簇都有贪心中心，任取 p∈P<sub>i</sub>，用三角不等式到本簇贪心中心 ≤2OPT。若某簇无贪心中心，由鸽巢，另一簇有两个贪心中心 c<sub>a</sub>,c<sub>b</sub>；后选者加入时是最远点，故 dist(c<sub>a</sub>,c<sub>b</sub>)≤2OPT，且所有点到 C 的距离不超过它，仍 ≤2OPT。</p>
        <p>r-feasible（给定 r 求最少中心）是 NP-hard；若有多项式精确算法，可枚举所有点对距离解 k-Center。</p>`,
      example: "P={0,1,2,10,11,12}，k=2，首中心 0 → 第二中心 12，pen=2；最优中心 1,11，OPT=1，比值 2。",
      pitfalls: ["把 k-Center 当成 k-Median。", "认为对任意距离都 2-近似；证明用三角不等式。", "忘记“某簇两个中心”来自鸽巢。"],
      related: [{ label: "加练 C · k-Center 手跑", href: "#/extra/C/mid-c6" }, { label: "对应讲义：k-Center", href: "#/module/kcenter" }]
    }
  ];

  window.TEXTBOOK = TEXTBOOK;
})();
