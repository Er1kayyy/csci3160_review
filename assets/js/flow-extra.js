/* =========================================================
   New Max-Flow sets: Special Exercise 10b + Regular Exercise 9b
   Extends COURSE_DATA.EXERCISES with 10 original exercises.
   ========================================================= */
(function () {
  "use strict";
  const D = window.COURSE_DATA;
  if (!D) return;

  const FLOW_EX = [
    {
      id: "sp10b-1", source: "SP10b", num: 1, module: "maxflow", topic: "最大流 / 残量图", difficulty: 2,
      figure: "assets/figures/sp10b.png",
      title: "由给定 clean flow 画残量图",
      prompt: "题图给出容量网络、源 s、汇 t 和 clean flow f，边标 x/y 表示流量/容量。画出残量图 G_f，并标出每条残量边的残量。",
      solution: "残量公式 r(u,v)=c(u,v)−f(u,v)+f(v,u)。原图边：s→a 3/5，s→b 2/4，a→c 2/4，b→a 0/2，a→b 1/3，b→d 3/4，c→d 1/2，c→t 1/4，d→t 4/5。逐边：s→a 残 2、反向 a→s 3；s→b 残 2、反向 b→s 2；a→c 残 2、反向 c→a 2；b→a 残 2+1=3（自身容量2 + 反向 a→b 的1），a→b 残 2（自身3−1 + 反向 b→a 的0）；b→d 残 1、反向 d→b 3；c→d 残 1、反向 d→c 1；c→t 残 3、反向 t→c 1；d→t 残 1、反向 t→d 4。"
    },
    {
      id: "sp10b-2", source: "SP10b", num: 2, module: "maxflow", topic: "Ford–Fulkerson", difficulty: 2,
      figure: "assets/figures/sp10b.png",
      title: "Ford–Fulkerson 增广与最小割",
      prompt: "对题图从零流运行 Ford–Fulkerson，可任选增广路。每次写出路径、瓶颈和每条边的新流量；最后给出最大流值与一个证明最优性的割。",
      solution: "一种执行：① s→a→c→t，Δ=2；② s→a→d→t，Δ=3；③ s→b→d→t，Δ=1；④ s→b→d→c→t，Δ=1。最终流量：s→a 5，s→b 2，a→c 2，a→d 3，b→d 2，d→c 1，c→t 3，d→t 4，最大流 7。取割 S={s,a,b,d}、T={c,t}，割边 a→c(2)+d→c(1)+d→t(4)=7，等于流值，故最优。"
    },
    {
      id: "sp10b-3", source: "SP10b", num: 3, module: "maxflow", topic: "残量 / 证明", difficulty: 2,
      title: "残量容量的对称恒等式",
      prompt: "设 f 是任意 clean flow，r_f(u,v)=c(u,v)−f(u,v)+f(v,u)。证明 r_f(u,v)+r_f(v,u)=c(u,v)+c(v,u)。",
      solution: "直接代入：r(u,v)+r(v,u)=[c(u,v)−f(u,v)+f(v,u)]+[c(v,u)−f(v,u)+f(u,v)]。f 项两两抵消，剩 c(u,v)+c(v,u)。"
    },
    {
      id: "sp10b-4", source: "SP10b", num: 4, module: "maxflow", topic: "最大流建模", difficulty: 3,
      title: "0/1 矩阵的行列和",
      prompt: "给定非负整数 r_1..r_m、c_1..c_n，判断是否存在 m×n 的 0/1 矩阵 A，使第 i 行和为 r_i、第 j 列和为 c_j；若存在请构造。用最大流建模并证明。",
      solution: "建网络：源 s→行点 R_i，容量 r_i；每个 R_i→列点 C_j，容量 1；C_j→汇 t，容量 c_j。若最大流等于 Σr_i（等价地同时等于 Σc_j），则令 A[i,j]=1 当且仅当边 R_i→C_j 的流量为 1。整数流保证 0/1；行守恒给出每行恰好 r_i 个 1，列守恒给出每列 c_j 个 1。反之，任一满足条件的矩阵给出值为 Σr_i 的流。故存在性等价于最大流达到 Σr_i；构造 O(mn) 条边、多项式时间。"
    },
    {
      id: "sp10b-5", source: "SP10b", num: 5, module: "maxflow", topic: "最大流建模", difficulty: 3,
      title: "多源多汇",
      prompt: "图有多个源 S、多个汇 T，其他点守恒；无入边进源、无出边离汇。把问题转成单源单汇最大流，给出有限容量并证明最优值不变。",
      solution: "加超级源 s*，对每个 s∈S 连 s*→s，容量取 s 的全部出边容量之和（或全局总容量上界）；加超级汇 t*，对每个 t∈T 连 t→t*，容量取 t 的全部入边容量之和。原网络边容量不变。原可行流按原值接到超级边即得新流；反之，新流限制在原边上，超级边只负责汇集/分配，删去它们后每个原源/汇的流量守恒，得到原问题同值流。故最大流值相同，恢复时只取原边流量。"
    },
    {
      id: "re9b-1", source: "RE9b", num: 1, module: "maxflow", topic: "最大流 / 最小割", difficulty: 2,
      title: "由最大流求最小割",
      prompt: "给定最大 clean flow f，设计 O(V+E) 算法求最小 s-t 割并证明正确性。",
      solution: "构造残量图 G_f，从 s 做 BFS/DFS，令 S 为可达点集，T=V\\S。最大流 ⇒ 无增广路，故 t∉S。对任意 u∈S、v∈T，r(u,v)=0，即 f(u,v)=c(u,v) 且 f(v,u)=0。于是 |f|=Σ_{S→T}f(u,v)=Σ_{S→T}c(u,v)=cap(S,T)。任何割容量≥|f|，故该割最小。建残量图与遍历 O(V+E)。"
    },
    {
      id: "re9b-2", source: "RE9b", num: 2, module: "maxflow", topic: "Ford–Fulkerson / 反例", difficulty: 3,
      title: "增广路选择导致 2M 次迭代",
      prompt: "对任意正整数 M，构造四点网络，使最大流为 2M；一种 Ford–Fulkerson 执行恰好 2 次增广，另一种恰好 2M 次。给出容量、路径与证明。",
      solution: "取 s,a,b,t，容量 c(s,a)=c(s,b)=c(a,t)=c(b,t)=M，c(a,b)=1。最大流 2M（割 {s} 容量 2M）。快执行：s→a→t 送 M，s→b→t 送 M，共 2 次。慢执行交替：s→a→b→t 与 s→b→a→t，每次因中间边(a,b)或反向边(b,a)只剩 1，故 Δ=1；每两次一对，四條外边各增加 1，中间边净流为 0。重复 M 对，共 2M 次，流值 2M。"
    },
    {
      id: "re9b-3", source: "RE9b", num: 3, module: "maxflow", topic: "最大流 / 灵敏度", difficulty: 3,
      title: "一条容量加 1 后更新最大流",
      prompt: "给定最大 clean flow f，把某条边的容量增加 1。设计 O(V+E) 算法得到新最大 clean flow，并证明。",
      solution: "旧流仍可行。用新容量建残量图，找一条 s→t 增广路：若不存在，f 仍最大；若存在，沿路增广并保持 clean。旧最小割容量为 M，容量加 1 使任一割容量最多增加 1，故新最优≤M+1。若存在增广路，其容量为正整数，至少增 1；又不能超过 M+1，所以恰增 1，新流最大。建图、搜索、更新一条简单路径 O(V+E)。"
    },
    {
      id: "re9b-4", source: "RE9b", num: 4, module: "maxflow", topic: "最大流建模", difficulty: 3,
      title: "点容量",
      prompt: "每个内部点 v 有容量 b(v)，要求流入 v 的总流量≤b(v)。把问题转成普通边容量最大流，证明并给出网络规模。",
      solution: "每个内部点 v 拆成 v_in、v_out，加边 v_in→v_out 容量 b(v)。原边 u→v 改为 u_out→v_in，容量 c(u,v)（u=s 时用 s，v=t 时用 t）。原可行流令 v_in→v_out 的流为流入 v 的总量，即满足点容量且守恒；反之，新网络在 v_in、v_out 的守恒保证进出相等且≤b(v)，把中间边流合并回原边即得可行流。规模：2|V|−2 个点、|E|+|V|−2 条边，构造 O(V+E)。"
    },
    {
      id: "re9b-5", source: "RE9b", num: 5, module: "maxflow", topic: "最大流 / 匹配", difficulty: 3,
      title: "二分图最大匹配",
      prompt: "对二分图 G=(L∪R,E)，用最大流求最大匹配；证明匹配与整数流的对应；用 Ford–Fulkerson 的 O(EM) 界表示复杂度。",
      solution: "建网络：s→每个 u∈L 容量1；每条边 {u,v} 连 u→v 容量1；每个 v∈R→t 容量1。匹配 k 条边对应每条匹配边送 1，得到值 k 的流；反之整数流在单位容量下每条 s→u、u→v、v→t 非 0 即 1，且每个 u/v 至多一条，选出流为 1 的 u→v 即匹配，大小=流值。最大流=最大匹配。网络有 L+R+2 点、E+L+R 边，最大流值≤min(L,R)，FF 时间 O((E+L+R)(min(L,R)+1))。"
    }
  ];

  D.EXERCISES.push(...FLOW_EX);
})();
