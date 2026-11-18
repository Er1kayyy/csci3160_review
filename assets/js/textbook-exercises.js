/* =========================================================
   Selected CLRS (3rd ed.) exercises with full explanations.
   Paraphrased prompts + original solutions written for review.
   ========================================================= */
(function () {
  "use strict";
  window.TEXTBOOK_EXERCISES = [
    {
      id: "tx-9.2-1", unit: "u1", ref: "9.2-1", title: "随机选择不会递归到空数组",
      prompt: "证明 RANDOMIZED-SELECT 永远不会对长度为 0 的数组递归。",
      solution: "设当前数组长度为 n，目标秩为 i（1≤i≤n），划分后枢轴秩为 k。若 i=k 直接返回；若 i<k，递归左段，左段长度 k−1。因为 i≥1 且 i<k，所以 k≥2，左段长度≥1。若 i>k，递归右段，右段长度 n−k；因为 i≤n 且 i>k，所以 i−k≥1，右段长度≥1。故两个递归分支都非空。"
    },
    {
      id: "tx-4.1-5", unit: "u2", ref: "4.1-5", title: "线性时间最大子数组（Kadane）",
      prompt: "用“从前往后扫描、维护以当前位置结尾的最大子数组”的思路，设计 O(n) 的非递归最大子数组算法。",
      solution: "令 endHere 为以 A[j] 结尾的最大子数组和，best 为目前见过的最大和。初始化 endHere=best=A[1]。对 j=2..n：endHere=max(A[j], endHere+A[j])，best=max(best,endHere)。若允许空子数组，则 endHere=max(0,A[j],endHere+A[j])，best 初值 0。正确性：以 j 结尾的最优子数组要么只含 A[j]，要么是在以 j−1 结尾的最优子数组后接 A[j]；两者取最大。时间 O(n)，空间 O(1)。"
    },
    {
      id: "tx-16.1-2", unit: "u3", ref: "16.1-2", title: "最晚开始的活动选择",
      prompt: "若改为“选择与已选活动兼容的、开始时间最晚的活动”，证明这个贪心仍能得到最优解。",
      solution: "把所有活动按开始时间从晚到早排序，从右往左扫描，选第一个与已选集合兼容的活动。证明与最早结束对称：设最优解中“最靠右”的活动为 a，贪心选的是开始最晚的 b；b 的开始时间不早于 a，因此把 a 换成 b 不会与最优解中其余（都在 a 左边结束）的活动冲突，仍最优。归纳即得。"
    },
    {
      id: "tx-23.1-1", unit: "u4", ref: "23.1-1", title: "最小权边属于某棵 MST",
      prompt: "设 (u,v) 是连通图 G 中权最小的边。证明 (u,v) 属于 G 的某棵最小生成树。",
      solution: "取割 ({u}, V\\{u})。边 (u,v) 是这条割的跨边，且它的权全局最小，所以它也是该割的最轻跨边。由割性质，最轻跨边属于某棵 MST。故 (u,v) 属于某棵 MST。"
    },
    {
      id: "tx-16.3-2", unit: "u5", ref: "16.3-2", title: "非满二叉树不可能最优",
      prompt: "证明：若一棵二叉树不是满二叉树，则它不可能对应最优前缀码。",
      solution: "非满意味着存在一个内部结点只有一个孩子。把该结点删掉，让它的孩子直接接替它的位置：该子树中所有叶子的深度都减 1，码字仍然前缀无关（只是把一段公共前缀缩短），而平均码长严格下降（频率为正）。因此原树不可能是最优前缀码。最优前缀码一定对应满二叉树。"
    },
    {
      id: "tx-15.1-3", unit: "u7", ref: "15.1-3", title: "带切割成本的 Rod Cutting",
      prompt: "在钢条切割中，每切一刀要付固定成本 c。给出求最大收益的动态规划递推与复杂度。",
      solution: "令 r(n) 为长度 n 的最大收益，r(0)=0。第一段取长度 j：若 j=n，不切，收益 p_n；若 j<n，切一刀付 c，剩余 n−j 继续最优切割。故 r(n)=max{p_n, max_{1≤j<n}(p_j−c+r(n−j))}。按 n 递增计算，每个 n 枚举 O(n) 个 j，总 O(n²)，空间 O(n)。"
    },
    {
      id: "tx-15.4-2", unit: "u9", ref: "15.4-2", title: "不用 b 表重建 LCS",
      prompt: "给定已完成的 c 表与原字符串 X、Y，在不使用 b 表的情况下，用 O(m+n) 时间重建一个 LCS。",
      solution: "从 (m,n) 开始：若 x[i]=y[j]，该字符必在某个 LCS 中，输出它并令 i--,j--；否则比较 c[i−1][j] 与 c[i][j−1]，向较大者移动（相等时任选）。每步 i 或 j 减 1，最多 m+n 步，故 O(m+n)。正确性由 LCS 递推的三种情况直接给出。"
    },
    {
      id: "tx-15.4-5", unit: "u8", ref: "15.4-5", title: "O(n²) 最长单调递增子序列",
      prompt: "给定 n 个数，设计 O(n²) 算法求最长单调递增子序列（LIS）。",
      solution: "令 L[j] 为以 A[j] 结尾的最长递增子序列长度。L[j]=1+max{L[i] : i<j 且 A[i]<A[j]}；若无这样的 i，则 L[j]=1。答案为 max_j L[j]。记录 parent[j]=取到最大值的 i，即可回溯出子序列。两层循环 O(n²)，空间 O(n)。"
    },
    {
      id: "tx-22.3-5", unit: "u11", ref: "22.3-5", title: "用时间戳判定有向边类型",
      prompt: "设 DFS 的发现/完成时间为 d[·]、f[·]。证明有向边 (u,v) 满足：(a) 树边或前向边 ⇔ d[u]<d[v]<f[v]<f[u]；(b) 后向边 ⇔ d[v]≤d[u]<f[u]≤f[v]；(c) 交叉边 ⇔ d[v]<f[v]<d[u]<f[u]。",
      solution: "DFS 的区间 [d[x],f[x]] 满足括号定理：任意两个区间不交或一个包含另一个。若 v 在 u 的子树中，则 [d[v],f[v]] 包含于 [d[u],f[u]]，即 d[u]<d[v]<f[v]<f[u]；此时若 v 由 (u,v) 首次发现则是树边，否则是前向边。若 u 在 v 的子树中，则 [d[u],f[u]] 包含于 [d[v],f[v]]，且 (u,v) 指向祖先，是后向边。若两区间不交且 v 先完成，则 d[v]<f[v]<d[u]<f[u]，是交叉边。这三种情况互斥且穷尽。"
    },
    {
      id: "tx-22.5-5", unit: "u12", ref: "22.5-5", title: "O(V+E) 构造分量图",
      prompt: "给定有向图 G，设计 O(V+E) 算法构造分量图 G^scc，并保证每对 SCC 之间最多一条边。",
      solution: "先求 SCC，给每个点标分量编号 comp[u]。扫描原图每条边 (u,v)：若 comp[u]≠comp[v]，则候选边 comp[u]→comp[v]。用哈希表/集合对分量对去重，避免平行边。每个点、每条边扫描 O(1)，总 O(V+E)。输出点数=C，边数≤E。"
    },
    {
      id: "tx-24.3-2", unit: "u13", ref: "24.3-2", title: "负权让 Dijkstra 出错",
      prompt: "给出一个含负权边的有向图，使 Dijkstra 返回错误答案；并指出正确性证明中哪一步失效。",
      solution: "取 s→a 1，s→b 2，b→a −2。Dijkstra 先弹出 a，宣布 dist(a)=1；但真实 spdist(s,a)=0（s→b→a）。证明中“v 弹出时，最短路上的前驱 z 若未弹出，则 dist(z)=spdist(z)<spdist(v)”依赖非负权：负权可能让 u 之后的路径继续变小，v 不应被提前固定。"
    },
    {
      id: "tx-25.3-4", unit: "u15", ref: "25.3-4", title: "统一减最小权为什么不行",
      prompt: "Greenstreet 提议把所有边权减去全局最小边权 w_min，即 w′(u,v)=w(u,v)−w_min。这个重赋权为什么不能保持最短路？",
      solution: "取 s→t 权 0，s→a 权 −1，a→t 权 −1，w_min=−1。原图最短路 s→t 长 0。每条边加 1 后：s→t 长 1，s→a→t 长 0，最短路改变。原因是统一加常数会让长度为 ℓ 的路径增加 cℓ，不同边数的路径被区别对待；Johnson 的 h(u)−h(v) 只在端点留下常数，才能保持所有路径的相对顺序。"
    },
    {
      id: "tx-26.1-1", unit: "u16", ref: "26.1-1", title: "拆边保持最大流值",
      prompt: "把边 (u,v) 替换为 (u,x)、(x,v)，两条新边容量都等于原容量。证明新网络的最大流值与原网络相同。",
      solution: "原网络任一可行流 f 可映射为 f(u,x)=f(x,v)=f(u,v)，x 处流入=流出，容量满足，流值不变。反之，新网络任一可行流在 x 处守恒，故 f(u,x)=f(x,v)；把它合并成原边 (u,v) 的流，容量与守恒仍满足，流值不变。两个方向都保持流值，故最优值相同。"
    },
    {
      id: "tx-35.1-2", unit: "u17", ref: "35.1-2", title: "被选边构成极大匹配",
      prompt: "证明 APPROX-VERTEX-COVER 第 4 行选出的边集合 M 是图 G 的一个极大匹配。",
      solution: "匹配：每选一条边 {u,v}，算法立即删除 u、v 的所有关联边，所以之后不可能再选到与它共享端点的边。极大：算法直到 E 为空才停止；若存在一条未选边 e 与 M 中所有边都不共享端点，则 e 在算法结束时仍应留在 E 中，矛盾。因此 M 是极大匹配。"
    },
    {
      id: "tx-35.2-1", unit: "u18", ref: "35.2-1", title: "三角不等式推出非负权",
      prompt: "完全无向图至少有 3 个顶点，边权 c 满足三角不等式。证明对所有 u,v，c(u,v)≥0。",
      solution: "反设 c(u,v)<0。取第三个点 w。由三角不等式：c(u,w)≤c(u,v)+c(v,w)<c(v,w)，同时 c(v,w)≤c(v,u)+c(u,w)=c(u,v)+c(u,w)<c(u,w)。于是 c(u,w)<c(v,w)<c(u,w)，矛盾。故 c(u,v)≥0。"
    },
    {
      id: "tx-35.3-2", unit: "u19", ref: "35.3-2", title: "Vertex Cover 归约到 Set Cover",
      prompt: "由 Vertex Cover 的多项式归约，证明 Set Cover 的判定版本是 NP-complete。",
      solution: "给定 VC 实例 G=(V,E)，构造集合族：每个顶点 u 对应 S_u={与 u 关联的边}，全集 U=E。若 C 是大小 k 的集合覆盖，则其所有者 V(C) 是大小 k 的 VC；反之若 W 是 VC，则 {S_u:u∈W} 是集合覆盖。故 G 有大小≤k 的 VC ⇔ 构造实例有大小≤k 的集合覆盖。转换 O(V+E)，多项式；Set Cover 的证书可在多项式时间验证，故 NP-complete。"
    },
    {
      id: "tx-35.4-2", unit: "u17", ref: "35.4-2", title: "MAX-CNF 的随机 2-近似",
      prompt: "MAX-CNF 与 MAX-3SAT 类似，但子句长度不限。证明独立 1/2 随机赋值给出 2-近似。",
      solution: "设子句含 k 个不同变量的文字。该子句为假的概率为 (1/2)^k，故被满足的概率为 1−2^{−k}≥1/2。由期望线性性，满足子句数的期望 ≥m/2，其中 m 为子句总数。又 OPT≤m，所以 E[满足数]≥m/2≥OPT/2，即随机 2-近似。"
    }
  ];
})();
