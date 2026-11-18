/* =========================================================
   Extra practice sets B and C.
   Loaded after data.js; extends window.COURSE_DATA.
   ========================================================= */
(function () {
  "use strict";
  const D = window.COURSE_DATA;
  if (!D) return;

  const EXTRA_B = [
    {
      id: "mid-b1", source: "MID+B", num: 1, extra: true, set: "B", module: "mid", topic: "SCC / 归约", points: "20%", difficulty: 3,
      title: "任意有向图 → 缩点 DAG 的归约",
      prompt: "假设有黑盒算法 A：给定 DAG 和每个点的权 w，返回每个点能到达的点的最小权，耗时 f(V,E)。证明：对任意有向图（允许有环）也能在 f(V,E)+O(V+E) 时间内求出同样的值。",
      solution: "先求 SCC，耗时 O(V+E)。同一 SCC 内任意两点可达集合相同，所以把每个 SCC 缩成一个点，权取该 SCC 内最小 w；跨 SCC 的边构成缩点图 G^scc，它一定是 DAG。对 G^scc 调用 A，得到每个 SCC 的最小可达权；原图中任一点 u 的答案就是 u 所在 SCC 的答案。建缩点图 O(V+E)，黑盒 f(V,E)，总 f(V,E)+O(V+E)。关键：为什么可以缩点——SCC 内互相可达，离开 SCC 后能到的点也完全相同。"
    },
    {
      id: "mid-b2", source: "MID+B", num: 2, extra: true, set: "B", module: "bst", topic: "Optimal BST", points: "15%", difficulty: 2,
      title: "W=(5,2,8,3,6) 的区间 DP",
      prompt: "对 key 1..5 和权重 W=(5,2,8,3,6) 求所有 optavg(a,b)（1≤a≤b≤5），并给出一棵最优 BST。并列时取最小的根。",
      solution: "长度 1：5,2,8,3,6。长度 2：(1,2)=9（根1），(2,3)=12（根3），(3,4)=14（根3），(4,5)=12（根5）。长度 3：(1,3)=24（根3），(2,4)=18（根3），(3,5)=29（根3）。长度 4：(1,4)=30（根3），(2,5)=33（根3）。长度 5：opt(1,5)=45，根3。最优树：根3；左子树根1（右孩子2）；右子树根5（左孩子4）。验算：5·2+2·3+8·1+3·3+6·2=45。"
    },
    {
      id: "mid-b3", source: "MID+B", num: 3, extra: true, set: "B", module: "scc", topic: "SCC / 证明", points: "10%", difficulty: 2,
      title: "缩点图路径 ⇒ 标号严格下降",
      prompt: "SCC 算法第一步给点标 turn-black 序号 label。设 S_i、S_j 是 SCC。证明：若 G^scc 中存在从 S_i 到 S_j 的路径，则 label(S_i)>label(S_j)，其中 label(S)=max_{v∈S}label(v)。",
      solution: "对路径长度归纳。长度 1 是课堂 Lemma：若 S_i 有边到 S_j，设 S_i∪S_j 中最先变灰的点为 u，由白路径定理，DFS 会先完成“下游”S_j 再完成 S_i，所以 label(S_i)>label(S_j)。设路径 S_i→S_k→…→S_j，由归纳 label(S_k)>…>label(S_j)，再用一次 Lemma 得 label(S_i)>label(S_k)，传递即得。"
    },
    {
      id: "mid-b4", source: "MID+B", num: 4, extra: true, set: "B", module: "dijkstra", topic: "Dijkstra", points: "10%", difficulty: 1,
      title: "Dijkstra 手跑：dist、parent、顺序",
      prompt: "有向图边权：s→a 5，s→b 1，b→a 1，a→c 1，c→t 1。从 s 运行 Dijkstra，写出弹出顺序、每个点的最终 dist 和 parent。",
      solution: "初始 s=0。弹出 s(0)，松弛得 a=5,b=1。弹出 b(1)，b→a 改进为 2。弹出 a(2)，a→c=3。弹出 c(3)，c→t=4。弹出 t(4)。顺序 s,b,a,c,t；dist: s0,b1,a2,c3,t4；parent: b=s,a=b,c=a,t=c。"
    },
    {
      id: "mid-b5", source: "MID+B", num: 5, extra: true, set: "B", module: "bellman", topic: "Bellman–Ford", points: "15%", difficulty: 2,
      title: "Bellman–Ford 四轮表",
      prompt: "有向图边：s→a 4，s→b 5，b→a −3，a→c 2，c→t 3，b→t 8。从 s 运行 Bellman–Ford 4 轮，写出每轮结束后的 dist(s,a,b,c,t)。",
      solution: "初始 (0,∞,∞,∞,∞)。第1轮：a=4，b=5，c=6，t=min(8+5=13,6+3=9)=9，故 (0,4,5,6,9)。第2轮：b→a 得 5−3=2，a→c 得 4，c→t 得 7，t=7，故 (0,2,5,4,7)。第3轮：检查所有边，b→a=2 不变，a→c=6 不变，c→t=7 不变，故不变。第4轮同样不变。最终 (0,2,5,4,7)。"
    },
    {
      id: "mid-b6", source: "MID+B", num: 6, extra: true, set: "B", module: "maxflow", topic: "最大流", points: "15%", difficulty: 2,
      title: "Ford–Fulkerson 小网络",
      prompt: "容量：s→a 3，s→b 2，a→b 1，a→t 2，b→t 3。运行 Ford–Fulkerson，写出增广路、最终流量和最小割。",
      solution: "残量图找增广路：① s→a→b→t，Δ=1；② s→a→t，Δ=2；③ s→b→t，Δ=2。总流 5。最终流：s→a 3，s→b 2，a→b 1，a→t 2，b→t 3。残量图中 s 只能到 s 本身（s→a、s→b 都满），最小割 S={s}，容量 3+2=5，等于最大流。"
    },
    {
      id: "mid-b7", source: "MID+B", num: 7, extra: true, set: "B", module: "apsp", topic: "Johnson / 证明", points: "15%", difficulty: 2,
      title: "Johnson 的两条性质",
      prompt: "设 G 无负环，加 dummy 后 h(u)=spdist(v_dummy,u)。证明：(a) 对每条边 (u,v)，w′(u,v)=w(u,v)+h(u)−h(v)≥0；(b) 对任意路径，G′ 中的长度等于原长度加一个只依赖端点的项，因此最短路不变。",
      solution: "(a) 由最短路三角不等式 h(v)≤h(u)+w(u,v)，移项即 w+h(u)−h(v)≥0。(b) 对路径 v1→…→vk，新长度 = Σ(w(v_i,v_{i+1})+h(v_i)−h(v_{i+1})) = 原长度 + h(v1)−h(vk)，中间项望远镜抵消。固定端点的所有路径都加同一个常数，故最短路径不变。"
    }
  ];

  const EXTRA_C = [
    {
      id: "mid-c1", source: "MID+C", num: 1, extra: true, set: "C", module: "maxflow", topic: "最大流 / 证明", points: "20%", difficulty: 3,
      title: "从最大流恢复最小割",
      prompt: "假设一个算法能在 f(V,E) 时间返回一个最大流 f（每条边的流量）。证明：可以在 f(V,E)+O(V+E) 时间内输出一个最小 s-t 割，并说明其容量等于 |f|。",
      solution: "构造残量图 G_f，从 s 做 BFS/DFS 得到可达点集 S，令 T=V\\S。由于 f 最大，G_f 无 s→t 路径，故 t∉S，且 S 是合法割，所有 S→T 的边残量为 0，即 f(u,v)=c(u,v)。沿割求和 |f|=Σ_{S→T}f(u,v)=Σ_{S→T}c(u,v)=c(S,T)。又任何流值 ≤ 任何割容量，所以 c(S,T) 是最小割容量，S 是最小割。建残量图与遍历 O(V+E)。"
    },
    {
      id: "mid-c2", source: "MID+C", num: 2, extra: true, set: "C", module: "maxflow", topic: "Ford–Fulkerson", points: "15%", difficulty: 2,
      title: "增广路与最小割手跑",
      prompt: "容量：s→a 4，s→b 3，a→b 2，a→t 3，b→t 5。运行 Ford–Fulkerson，写出增广路及 Δ、最终流值和最小割。",
      solution: "① s→a→b→t，Δ=2（a→b 瓶颈）；② s→a→t，Δ=2；③ s→b→t，Δ=3。最大流 7。最终流：s→a 4，s→b 3，a→b 2，a→t 2，b→t 5。残量图中 s 无法离开（s→a、s→b 满），最小割 S={s}，容量 4+3=7。"
    },
    {
      id: "mid-c3", source: "MID+C", num: 3, extra: true, set: "C", module: "dijkstra", topic: "Dijkstra / 反例", points: "10%", difficulty: 1,
      title: "负权让 Dijkstra 失效",
      prompt: "给出一个含负权边的有向图，说明 Dijkstra 会输出错误的最短距离。写出算法会宣布的 dist 与真实 spdist。",
      solution: "取 s→a 1，s→b 2，b→a −2。Dijkstra 先弹出 a，宣布 dist(a)=1 并固定；但真实 spdist(s,a)=0（s→b→a）。根因：负权破坏了“已弹出点的 dist 不会再被改进”的不变量。"
    },
    {
      id: "mid-c4", source: "MID+C", num: 4, extra: true, set: "C", module: "tsp", topic: "TSP / 2-近似", points: "10%", difficulty: 2,
      title: "正方形上的 MST 双走",
      prompt: "四点 A(0,0), B(2,0), C(2,2), D(0,2)，边权为欧氏距离。用 MST 双走 + 首次访问抄近路构造 Hamiltonian 环，写出 MST、闭游走、最终环和长度，并验证 ≤2OPT。",
      solution: "MST 取 AB=2、BC=2、CD=2（总 6；对角线 2√2>2 不会进 MST）。双走闭游走 A-B-C-D-C-B-A，长度 12。按首次访问去重得 A-B-C-D-A，长度 2+2+2+2=8。最优 Hamiltonian 环就是正方形周长 8（任取对角线都会更长），所以 8≤2·8，2-近似成立。"
    },
    {
      id: "mid-c5", source: "MID+C", num: 5, extra: true, set: "C", module: "setcover", topic: "Set Cover", points: "15%", difficulty: 2,
      title: "贪心 Set Cover 手跑与 OPT",
      prompt: "U={1,…,7}，集合 S1={3,5,6}, S2={1,2,6}, S3={4,6}, S4={1,2,5}, S5={3,5}, S6={1,3,7}。按“最大 benefit、并列取编号最小”运行贪心，写出每步选择与最终覆盖；再给出一个最优覆盖。",
      solution: "初始 benefit：S1,S2,S4,S6 都是 3，S3,S5 是 2；选 S1。剩余 {1,2,4,7}，benefit：S2=2,S3=1,S4=2,S5=0,S6=2，选 S2。剩余 {4,7}，S3=1,S6=1，选 S3。剩余 {7}，选 S6。贪心 {S1,S2,S3,S6}，大小 4。最优 {S3,S4,S6}：S3∪S4∪S6={1,2,3,4,5,6,7}，大小 3。"
    },
    {
      id: "mid-c6", source: "MID+C", num: 6, extra: true, set: "C", module: "kcenter", topic: "k-Center", points: "15%", difficulty: 2,
      title: "一维 k-Center 的最远点优先",
      prompt: "点集 P={0,1,2,10,11,12}，k=2，首中心选 0。运行最远点优先：第二个中心是谁？最终中心集与 pen(C) 是多少？OPT 是多少？验证 2-近似。",
      solution: "到 0 最远的是 12，故第二中心 12，最终 C={0,12}。各点到最近中心距离：0,1,2 为 0,1,2；10,11,12 为 2,1,0，pen(C)=2。最优取中心 1 和 11，最大距离为 1（0/2 到 1，10/12 到 11），OPT=1。pen(C)=2=2·OPT，满足 2-近似。"
    },
    {
      id: "mid-c7", source: "MID+C", num: 7, extra: true, set: "C", module: "np", topic: "归约 / NP-hard", points: "15%", difficulty: 2,
      title: "Vertex Cover 归约到 Set Cover",
      prompt: "证明：若 Set Cover 有多项式时间精确算法，则 Vertex Cover 也有。写出构造并证明双向对应。",
      solution: "对 VC 实例 G=(V,E)，为每个顶点 u 建集合 S_u={与 u 关联的边}，全集 U=E。若 C 是 Set Cover，则其所有者 V(C) 覆盖每条边，是 VC；若 W 是 VC，则 {S_u:u∈W} 覆盖所有边，是 Set Cover。故最优值相同。构造 O(V+E)，调用 Set Cover 精确算法即得多项式 VC 算法。"
    }
  ];

  D.EXTRA_EXERCISES.push(...EXTRA_B, ...EXTRA_C);
  D.EXTRA_SETS = [
    { id: "A", label: "A · 期中原风格", title: "期中原风格", desc: "D&C / Huffman / 随机选择 / 贪心 / Rod Cutting / DP，严格对标 mid-sol 的分值结构。", short: "归约、Huffman、随机 trial、反例、手跑" },
    { id: "B", label: "B · 图与 DP 综合", title: "图与 DP 综合", desc: "SCC 缩点归约、Optimal BST、DFS/SCC 证明、Dijkstra、Bellman–Ford、最大流、Johnson。", short: "SCC、BST、最短路、最大流" },
    { id: "C", label: "C · 流与近似", title: "流与近似", desc: "最大流→最小割、FF 手跑、负权反例、TSP、Set Cover、k-Center、VC 归约。", short: "流、TSP、Set Cover、k-Center" }
  ];
})();
