/* =========================================================
   Interactive labs — approximation algorithms
   ========================================================= */
(function () {
  "use strict";
  window.DEMOS = window.DEMOS || {};

  const SVGNS = "http://www.w3.org/2000/svg";
  let uid = 5000;
  function svgEl(tag, attrs) {
    const el = document.createElementNS(SVGNS, tag);
    if (attrs) Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  }
  function makeSvg(w, h) { return svgEl("svg", { viewBox: `0 0 ${w} ${h}`, role: "img" }); }
  function pathD(a, b, curve) {
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, nx = -dy / len, ny = dx / len;
    const c = curve ? curve * len : 0, cx = mx + nx * c, cy = my + ny * c;
    return { d: `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`, lx: (a.x + 2 * cx + b.x) / 4, ly: (a.y + 2 * cy + b.y) / 4 };
  }
  function drawGraph(svg, nodes, edges, opts = {}) {
    const prefix = "a" + (++uid);
    const defs = svgEl("defs");
    [["arrow", "var(--line-strong)"], ["arrow-forest", "var(--forest)"], ["arrow-coral", "var(--coral)"]].forEach(([id, color]) => {
      const marker = svgEl("marker", { id: `${prefix}-${id}`, viewBox: "0 0 10 10", refX: "8", refY: "5", markerWidth: "6", markerHeight: "6", orient: "auto-start-reverse" });
      marker.appendChild(svgEl("path", { d: "M 0 0 L 10 5 L 0 10 z", fill: color }));
      defs.appendChild(marker);
    });
    svg.appendChild(defs);
    const map = Object.fromEntries(nodes.map(n => [n.id, n]));
    const edgeEls = {}, labelEls = {};
    edges.forEach((e, i) => {
      const a = map[e.u], b = map[e.v];
      if (!a || !b) return;
      const { d, lx, ly } = pathD(a, b, e.curve || 0);
      const path = svgEl("path", { d, class: "graph-edge" + (e.undirected ? " undirected" : ""), "data-edge": `${e.u}|${e.v}|${i}` });
      if (!e.undirected) path.setAttribute("marker-end", `url(#${prefix}-arrow)`);
      svg.appendChild(path);
      edgeEls[`${e.u}|${e.v}`] = path;
      if (e.w != null || e.label != null) {
        const label = svgEl("text", { x: lx + (e.lx || 0), y: ly + (e.ly || 0), class: "edge-label", "text-anchor": "middle" });
        label.textContent = e.label != null ? e.label : e.w;
        svg.appendChild(label);
        labelEls[`${e.u}|${e.v}`] = label;
      }
    });
    const nodeEls = {};
    nodes.forEach(n => {
      const g = svgEl("g", { class: "graph-node white", "data-node": n.id, transform: `translate(${n.x},${n.y})` });
      g.appendChild(svgEl("circle", { class: "halo", r: n.r || 19, cx: 0, cy: 0 }));
      const t = svgEl("text", { x: 0, y: 4, "text-anchor": "middle" }); t.textContent = n.label || n.id;
      g.appendChild(t);
      if (n.sub) { const st = svgEl("text", { x: 0, y: 32, "text-anchor": "middle", class: "edge-label" }); st.textContent = n.sub; g.appendChild(st); }
      svg.appendChild(g);
      nodeEls[n.id] = g;
    });
    return { nodeEls, edgeEls, labelEls, prefix };
  }
  function setNode(g, cls) { if (g) g.setAttribute("class", "graph-node " + cls); }
  function setEdge(path, cls, marker) {
    if (!path) return;
    path.setAttribute("class", "graph-edge " + (cls || ""));
    if (marker) path.setAttribute("marker-end", `url(#${marker})`);
  }
  function setStatus(el, html, cls = "") { if (el) { el.className = "demo-status " + cls; el.innerHTML = html; } }
  function card(title, sub, body, extra = "") {
    return `<div class="demo-card"><div class="demo-head"><h3>${title}</h3><p>${sub}</p></div><div class="demo-body">${body}${extra}</div></div>`;
  }
  const fmt = x => Math.abs(x) < 1e-9 ? "0" : (Math.round(x * 100) / 100).toString();

  // ------------------------------------------------------------ 08 NP / VC / MAX-3SAT
  window.DEMOS.np = function (root) {
    const nodes = [
      { id: "a", x: 75, y: 75 }, { id: "f", x: 330, y: 70 }, { id: "b", x: 50, y: 175 },
      { id: "c", x: 80, y: 275 }, { id: "d", x: 270, y: 275 }, { id: "e", x: 330, y: 175 }
    ];
    const edges = [
      { u: "a", v: "b", undirected: true }, { u: "a", v: "c", undirected: true }, { u: "b", v: "d", undirected: true },
      { u: "c", v: "d", undirected: true }, { u: "d", v: "e", undirected: true }, { u: "d", v: "f", undirected: true },
      { u: "e", v: "f", undirected: true }
    ];
    const frames = [];
    let remaining = new Set(edges.map(e => `${e.u}|${e.v}`));
    let S = new Set(), M = [];
    frames.push({ S: new Set(), M: [], removed: new Set(), msg: "初始：S=∅，所有边未覆盖。算法每次任选一条未删边 {u,v}，把 u,v 加入 S。" });
    while (remaining.size) {
      const key = [...remaining][0];
      const [u, v] = key.split("|");
      S.add(u); S.add(v); M.push(key);
      const removed = new Set();
      [...remaining].forEach(k => { const [x, y] = k.split("|"); if (x === u || y === u || x === v || y === v) { removed.add(k); remaining.delete(k); } });
      frames.push({ S: new Set(S), M: [...M], removed: new Set(removed), msg: `选边 {${u},${v}} → S={${[...S].join(",")}}，删除所有与 ${u} 或 ${v} 关联的边（共 ${removed.size} 条）。` });
    }
    frames.push({ S: new Set(S), M: [...M], removed: new Set(), msg: `结束：|S|=${S.size}=2|M|，且 M 是匹配，所以 |S|≤2·OPT。此图 OPT=3，本此输出 ${S.size}。`, done: true });
    let idx = 0;
    const clauses = [
      ["x1", "x2", "x3"], ["x1", "x2", "¬x3"], ["x1", "¬x2", "x3"],
      ["¬x1", "x3", "x4"], ["¬x1", "¬x3", "x4"], ["x2", "¬x3", "¬x4"]
    ];
    let assignment = { x1: 1, x2: 1, x3: 1, x4: 1 };
    root.innerHTML = `<div class="demo-card">
      <div class="demo-head"><h3>Vertex Cover + MAX-3SAT 双实验</h3><p>左边观察匹配下界；右边观察随机赋值的 7/8 期望。</p></div>
      <div class="demo-body">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px" class="np-grid">
          <div>
            <div class="between"><h4>Vertex Cover · 2-近似</h4><span class="pill forest" id="vc-size">|S|=0</span></div>
            <div class="demo-controls" style="margin-top:8px">
              <button class="btn primary small" id="vc-next" type="button">下一步 →</button>
              <button class="btn small" id="vc-prev" type="button">← 上一步</button>
              <button class="btn small" id="vc-reset" type="button">重置</button>
            </div>
            <div class="graph-wrap" id="vc-graph"></div>
            <div class="demo-status" id="vc-status" style="margin-top:8px"></div>
            <div class="tiny muted" style="margin-top:6px">M 中任意两条边不共享端点 ⇒ 任何 VC 至少选 |M| 个点；算法选 2|M| 个。</div>
          </div>
          <div>
            <div class="between"><h4>MAX-3SAT · 随机赋值</h4><span class="pill amber" id="sat-count">—</span></div>
            <div class="demo-controls" style="margin-top:8px">
              <button class="btn primary small" id="sat-roll" type="button">掷一次</button>
              <button class="btn small" id="sat-sim" type="button">模拟 5000 次</button>
            </div>
            <div id="sat-assign" class="stack-viz"></div>
            <div id="sat-clauses" class="stack" style="gap:6px;margin-top:9px"></div>
            <div class="demo-status" id="sat-status" style="margin-top:8px"></div>
            <div class="tiny muted" style="margin-top:6px">每个 3-文字子句为假概率 1/8，所以满足概率 7/8。</div>
          </div>
        </div>
      </div>
      <style>@media(max-width:820px){.np-grid{grid-template-columns:1fr!important}}</style>
    </div>`;
    const svg = makeSvg(420, 330);
    root.querySelector("#vc-graph").appendChild(svg);
    const graph = drawGraph(svg, nodes, edges, {});
    function renderVC() {
      const f = frames[idx];
      Object.entries(graph.nodeEls).forEach(([id, g]) => setNode(g, f.S.has(id) ? "center" : "white"));
      edges.forEach(e => {
        const key = `${e.u}|${e.v}`;
        const p = graph.edgeEls[key];
        if (!p) return;
        if (f.M.includes(key)) setEdge(p, "active");
        else if (f.removed.has(key)) setEdge(p, "dim");
        else setEdge(p, "");
      });
      root.querySelector("#vc-size").textContent = `|S|=${f.S.size} · |M|=${f.M.length}`;
      setStatus(root.querySelector("#vc-status"), f.msg, f.done ? "amber" : "");
    }
    root.querySelector("#vc-next").addEventListener("click", () => { if (idx < frames.length - 1) { idx++; renderVC(); } });
    root.querySelector("#vc-prev").addEventListener("click", () => { if (idx > 0) { idx--; renderVC(); } });
    root.querySelector("#vc-reset").addEventListener("click", () => { idx = 0; renderVC(); });

    function clauseText(c) { return c.map(x => x.startsWith("¬") ? `<span style="text-decoration:overline">${x.slice(1)}</span>` : x).join(" ∨ "); }
    function evalLit(lit, A) { const neg = lit.startsWith("¬"), v = lit.replace("¬", ""); return neg ? !A[v] : !!A[v]; }
    function renderSAT() {
      root.querySelector("#sat-assign").innerHTML = `<span class="stack-label">assignment</span>` + Object.entries(assignment).map(([k, v]) => `<span class="stack-item">${k}=${v}</span>`).join("");
      const sat = clauses.map(c => c.some(l => evalLit(l, assignment)));
      root.querySelector("#sat-clauses").innerHTML = clauses.map((c, i) => `<div class="row" style="gap:8px;font-size:.74rem"><span class="pill ${sat[i] ? "forest" : "coral"}">${sat[i] ? "1" : "0"}</span><span>${clauseText(c)}</span></div>`).join("");
      const count = sat.filter(Boolean).length;
      root.querySelector("#sat-count").textContent = `${count} / ${clauses.length} 满足`;
      setStatus(root.querySelector("#sat-status"), `这次满足 ${count} 个。理论上每个子句平均 7/8，6 个的期望是 ${(6 * 7 / 8).toFixed(2)}。`, "");
    }
    root.querySelector("#sat-roll").addEventListener("click", () => {
      assignment = { x1: Math.random() < .5 ? 1 : 0, x2: Math.random() < .5 ? 1 : 0, x3: Math.random() < .5 ? 1 : 0, x4: Math.random() < .5 ? 1 : 0 };
      renderSAT();
    });
    root.querySelector("#sat-sim").addEventListener("click", () => {
      let total = 0;
      for (let t = 0; t < 5000; t++) {
        const A = { x1: Math.random() < .5 ? 1 : 0, x2: Math.random() < .5 ? 1 : 0, x3: Math.random() < .5 ? 1 : 0, x4: Math.random() < .5 ? 1 : 0 };
        total += clauses.reduce((a, c) => a + (c.some(l => evalLit(l, A)) ? 1 : 0), 0);
      }
      const avg = total / 5000;
      setStatus(root.querySelector("#sat-status"), `5000 次模拟：平均满足 <strong>${avg.toFixed(3)}</strong> / ${clauses.length}，目标 7/8 = 0.875。`, "amber");
    });
    renderVC(); renderSAT();
  };

  // ------------------------------------------------------------ 09 TSP
  window.DEMOS.tsp = function (root) {
    const pts = [
      { id: "A", x: 90, y: 250 }, { id: "B", x: 195, y: 65 }, { id: "C", x: 370, y: 65 },
      { id: "D", x: 540, y: 165 }, { id: "E", x: 330, y: 315 }
    ];
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const edges = [];
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      edges.push({ u: pts[i].id, v: pts[j].id, undirected: true, w: Math.round(dist(pts[i], pts[j])) });
    }
    // Prim MST
    const inTree = new Set(["A"]), mst = [];
    while (inTree.size < pts.length) {
      let best = null;
      edges.forEach(e => {
        if (inTree.has(e.u) === inTree.has(e.v)) return;
        if (!best || e.w < best.w) best = e;
      });
      inTree.add(best.u); inTree.add(best.v); mst.push(best);
    }
    // doubled DFS walk
    const adj = {}; pts.forEach(p => adj[p.id] = []);
    mst.forEach(e => { adj[e.u].push(e.v); adj[e.v].push(e.u); });
    const walk = [];
    (function dfs(u, parent) { walk.push(u); adj[u].forEach(v => { if (v !== parent) { dfs(v, u); walk.push(u); } }); })("A", null);
    const seen = new Set(), cycle = [];
    walk.forEach(v => { if (!seen.has(v)) { seen.add(v); cycle.push(v); } });
    cycle.push("A");
    const walkLen = walk.slice(1).reduce((sum, v, i) => sum + dist(pts.find(p => p.id === walk[i]), pts.find(p => p.id === v)), 0);
    const cycleLen = cycle.slice(1).reduce((sum, v, i) => sum + dist(pts.find(p => p.id === cycle[i]), pts.find(p => p.id === v)), 0);
    // optimal brute force, A fixed
    const others = ["B", "C", "D", "E"];
    let opt = Infinity, optCycle = null;
    function perm(arr, cur) {
      if (!arr.length) {
        const c = ["A", ...cur, "A"];
        let len = 0; for (let i = 0; i < c.length - 1; i++) len += dist(pts.find(p => p.id === c[i]), pts.find(p => p.id === c[i + 1]));
        if (len < opt) { opt = len; optCycle = c; }
        return;
      }
      arr.forEach((x, i) => perm([...arr.slice(0, i), ...arr.slice(i + 1)], [...cur, x]));
    }
    perm(others, []);
    const mstW = mst.reduce((a, e) => a + e.w, 0);
    let stage = 0;
    root.innerHTML = card("TSP：MST 双走 + 抄近路", "切换四步，观察 2-近似不等式链的每一项。", `
      <div class="demo-controls">
        <button class="btn primary small" id="tsp-next" type="button">下一步 →</button>
        <button class="btn small" id="tsp-prev" type="button">← 上一步</button>
        <button class="btn small" id="tsp-reset" type="button">重置</button>
        <span class="pill ghost" id="tsp-stage">0 · 完全图</span>
      </div>
      <div style="display:grid;grid-template-columns:1.2fr .8fr;gap:14px" class="tsp-grid">
        <div><div class="graph-wrap" id="tsp-graph"></div></div>
        <div>
          <div class="stat-strip" style="flex-direction:column">
            <div class="stat"><span class="k">w(MST)</span><span class="v">${mstW.toFixed(1)}</span></div>
            <div class="stat"><span class="k">2·w(MST)</span><span class="v">${(2 * mstW).toFixed(1)}</span></div>
            <div class="stat"><span class="k">输出环 C</span><span class="v">${cycleLen.toFixed(1)}</span></div>
            <div class="stat"><span class="k">OPT（穷举）</span><span class="v">${opt.toFixed(1)}</span></div>
          </div>
          <div class="demo-status" id="tsp-status" style="margin-top:10px"></div>
        </div>
      </div>`, `<style>@media(max-width:760px){.tsp-grid{grid-template-columns:1fr!important}}</style>`);
    const svg = makeSvg(620, 370);
    root.querySelector("#tsp-graph").appendChild(svg);
    const graph = drawGraph(svg, pts, edges.map(e => ({ ...e, label: "" })), {});
    function render() {
      const stageNames = ["0 · 完全图", "1 · MST", "2 · 双走闭游走", "3 · 抄近路"];
      root.querySelector("#tsp-stage").textContent = stageNames[stage];
      Object.entries(graph.nodeEls).forEach(([id, g]) => setNode(g, stage >= 1 ? "center" : "white"));
      Object.entries(graph.edgeEls).forEach(([key, p]) => {
        const [u, v] = key.split("|");
        const isMST = mst.some(e => (e.u === u && e.v === v) || (e.u === v && e.v === u));
        const isCycle = cycle.some((x, i) => i < cycle.length - 1 && ((x === u && cycle[i + 1] === v) || (x === v && cycle[i + 1] === u)));
        if (stage === 0) setEdge(p, "dim");
        else if (stage === 3) setEdge(p, isCycle ? "active" : "dim");
        else setEdge(p, isMST ? (stage === 2 ? "tree" : "active") : "dim");
      });
      const st = root.querySelector("#tsp-status");
      if (stage === 0) setStatus(st, "完全图，边权为欧氏距离（满足三角不等式）。目标是 Hamiltonian 环。", "");
      if (stage === 1) setStatus(st, `MST 权 ${mstW.toFixed(1)}。任何 Hamiltonian 环删一条边得到生成树，所以 OPT ≥ w(MST)=${mstW.toFixed(1)}。`, "amber");
      if (stage === 2) setStatus(st, `DFS 双走每条树边两次：${walk.join("→")}，长度 2·w(MST)=${(2 * mstW).toFixed(1)}。`, "amber");
      if (stage === 3) setStatus(st, `按首次访问抄近路：${cycle.join("→")}，长 ${cycleLen.toFixed(1)}。三角不等式保证不增，因此 ≤2OPT（此处 OPT=${opt.toFixed(1)}，比值 ${(cycleLen / opt).toFixed(2)}）。`, "amber");
    }
    root.querySelector("#tsp-next").addEventListener("click", () => { if (stage < 3) { stage++; render(); } });
    root.querySelector("#tsp-prev").addEventListener("click", () => { if (stage > 0) { stage--; render(); } });
    root.querySelector("#tsp-reset").addEventListener("click", () => { stage = 0; render(); });
    render();
  };

  // ------------------------------------------------------------ 10 Set Cover
  window.DEMOS.setcover = function (root) {
    const U = Array.from({ length: 12 }, (_, i) => i + 1);
    const sets = [
      { name: "S1", el: [1, 2, 3] }, { name: "S2", el: [4, 5, 6] }, { name: "S3", el: [2, 3, 4, 5] },
      { name: "S4", el: [7, 8, 9, 10] }, { name: "S5", el: [10, 11, 12] }, { name: "S6", el: [8, 9, 10] }
    ];
    const frames = [];
    let chosen = new Set(), uncovered = new Set(U);
    frames.push({ chosen: new Set(), uncovered: new Set(U), benefits: sets.map(s => s.el.length), msg: "初始：未覆盖 12 个元素。每步计算每个集合的 benefit=|S∩未覆盖|。" });
    while (uncovered.size) {
      let best = 0, bi = 0;
      sets.forEach((s, i) => { const b = s.el.filter(x => uncovered.has(x)).length; if (b > best) { best = b; bi = i; } });
      chosen.add(bi);
      sets[bi].el.forEach(x => uncovered.delete(x));
      frames.push({ chosen: new Set(chosen), uncovered: new Set(uncovered), benefits: sets.map(s => s.el.filter(x => uncovered.has(x)).length), picked: bi, msg: `选 ${sets[bi].name}：benefit=${best}，剩余未覆盖 ${uncovered.size} 个。` });
    }
    let opt = Infinity, optSet = null;
    for (let mask = 0; mask < (1 << sets.length); mask++) {
      let cnt = 0; const cov = new Set();
      for (let i = 0; i < sets.length; i++) if (mask & (1 << i)) { cnt++; sets[i].el.forEach(x => cov.add(x)); }
      if (cov.size === U.length && cnt < opt) { opt = cnt; optSet = mask; }
    }
    const optNames = sets.filter((_, i) => optSet & (1 << i)).map(s => s.name);
    let idx = 0;
    root.innerHTML = card("Set Cover 贪心实验", "每一步重新计算 benefit。观察 1+ln|U| 的对数近似是如何“慢慢收尾”的。", `
      <div class="demo-controls">
        <button class="btn primary small" id="sc-next" type="button">下一步 →</button>
        <button class="btn small" id="sc-prev" type="button">← 上一步</button>
        <button class="btn small" id="sc-reset" type="button">重置</button>
        <span class="pill ghost" id="sc-count">1 / ${frames.length}</span>
        <span class="pill forest" id="sc-summary">已选 0</span>
      </div>
      <div id="sc-table"></div>
      <div id="sc-uncovered" class="stack-viz" style="margin-top:12px"></div>
      <div class="demo-status" id="sc-status" style="margin-top:10px"></div>
      <div class="tiny muted" style="margin-top:8px">已知最优：{${optNames.join(",")}}，|OPT|=${opt}；贪心 ${frames[frames.length - 1].chosen.size} 个。此例比值 ${(frames[frames.length - 1].chosen.size / opt).toFixed(2)}。</div>`);
    function render() {
      const f = frames[idx];
      const rows = sets.map((s, i) => {
        const isPicked = f.chosen.has(i);
        const cells = U.map(x => `<span style="width:18px;height:18px;border-radius:4px;display:inline-grid;place-items:center;font-size:.55rem;background:${s.el.includes(x) ? (isPicked ? "var(--forest)" : "var(--forest-soft)") : "var(--paper-2)"};color:${s.el.includes(x) ? (isPicked ? "#fff" : "var(--forest)") : "transparent"}">${s.el.includes(x) ? "1" : "0"}</span>`).join("");
        return `<div class="row" style="gap:6px;margin:4px 0;padding:5px 7px;border-radius:8px;background:${isPicked ? "var(--amber-soft)" : "transparent"}">
          <span style="width:30px;font-family:var(--mono);font-size:.7rem">${s.name}</span>
          <span class="pill ${isPicked ? "amber" : "ghost"}" style="min-width:62px;justify-content:center">benefit ${f.benefits[i]}</span>
          <span style="display:flex;gap:2px;flex-wrap:wrap">${cells}</span>
          ${isPicked ? `<span class="pill forest" style="margin-left:auto">已选</span>` : ""}
        </div>`;
      }).join("");
      root.querySelector("#sc-table").innerHTML = `<div class="row tiny muted" style="gap:6px;margin-left:38px"><span style="width:62px">benefit</span>${U.map(x => `<span style="width:18px;text-align:center">${x}</span>`).join("")}</div>` + rows;
      root.querySelector("#sc-uncovered").innerHTML = `<span class="stack-label">未覆盖</span>` + (f.uncovered.size ? [...f.uncovered].map(x => `<span class="stack-item">${x}</span>`).join("") : `<span class="stack-item" style="background:var(--forest);color:#fff">∅</span>`);
      root.querySelector("#sc-summary").textContent = `已选 ${f.chosen.size} 个集合`;
      root.querySelector("#sc-count").textContent = `${idx + 1} / ${frames.length}`;
      setStatus(root.querySelector("#sc-status"), f.msg, f.uncovered.size === 0 ? "amber" : "");
    }
    root.querySelector("#sc-next").addEventListener("click", () => { if (idx < frames.length - 1) { idx++; render(); } });
    root.querySelector("#sc-prev").addEventListener("click", () => { if (idx > 0) { idx--; render(); } });
    root.querySelector("#sc-reset").addEventListener("click", () => { idx = 0; render(); });
    render();
  };

  // ------------------------------------------------------------ 11 k-Center
  window.DEMOS.kcenter = function (root) {
    const pts = [
      { id: "a", x: 2, y: 2 }, { id: "b", x: 3, y: 3 }, { id: "c", x: 4, y: 2 },
      { id: "d", x: 4, y: 8 }, { id: "e", x: 5, y: 6 }, { id: "f", x: 6, y: 7 },
      { id: "g", x: 7, y: 4 }, { id: "h", x: 8, y: 3 }, { id: "i", x: 9, y: 4 }, { id: "j", x: 9, y: 2 }
    ];
    const k = 3;
    const dist = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);
    const sx = x => 62 + (x - 1) * 44, sy = y => 330 - (y - 1) * 31;
    function dmin(p, centers) { return Math.min(...centers.map(c => dist(p, c))); }
    function penalty(centers) { return Math.max(...pts.map(p => dmin(p, centers))); }
    let first = "f";
    let centers = [], frames = [];
    function build() {
      centers = [pts.find(p => p.id === first)];
      frames = [];
      for (let step = 0; step < k; step++) {
        let far = null, fd = -1;
        pts.forEach(p => { const d = dmin(p, centers); if (d > fd) { fd = d; far = p; } });
        const pen = penalty(centers);
        frames.push({ centers: [...centers], add: step === 0 ? centers[0] : null, pen, far, fd });
        if (step < k - 1) { centers.push(far); }
      }
    }
    // optimal
    let opt = Infinity, optCenters = null;
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) for (let l = j + 1; l < pts.length; l++) {
      const C = [pts[i], pts[j], pts[l]], pen = penalty(C);
      if (pen < opt) { opt = pen; optCenters = C; }
    }
    build();
    let idx = 0;
    root.innerHTML = card("k-Center 最远点优先", "点选任意首中心，观察半径圆如何收缩。右侧对比穷举最优。", `
      <div class="demo-controls">
        <label class="field">首中心
          <select class="select" id="kc-first">${pts.map(p => `<option value="${p.id}" ${p.id === first ? "selected" : ""}>${p.id}</option>`).join("")}</select>
        </label>
        <button class="btn primary small" id="kc-next" type="button">加入最远点 →</button>
        <button class="btn small" id="kc-reset" type="button">重置</button>
        <span class="pill ghost" id="kc-count">1 / 3</span>
      </div>
      <div style="display:grid;grid-template-columns:1.25fr .75fr;gap:14px" class="kc-grid">
        <div><div class="graph-wrap" id="kc-graph"></div><div class="tiny muted" style="margin-top:5px">也可以直接点击图上的点作为首中心。</div></div>
        <div>
          <div class="stat-strip" style="flex-direction:column">
            <div class="stat"><span class="k">当前中心</span><span class="v" id="kc-centers">f</span></div>
            <div class="stat"><span class="k">pen(C)</span><span class="v" id="kc-pen">—</span></div>
            <div class="stat"><span class="k">OPT（穷举）</span><span class="v">${opt.toFixed(2)}</span></div>
            <div class="stat"><span class="k">当前 / OPT</span><span class="v" id="kc-ratio">—</span></div>
          </div>
          <div class="demo-status" id="kc-status" style="margin-top:10px"></div>
        </div>
      </div>`, `<style>@media(max-width:760px){.kc-grid{grid-template-columns:1fr!important}}</style>`);
    const svg = makeSvg(560, 365);
    root.querySelector("#kc-graph").appendChild(svg);
    function render() {
      svg.innerHTML = "";
      // grid
      for (let i = 1; i <= 10; i++) {
        svg.appendChild(svgEl("line", { x1: sx(i), y1: sy(1), x2: sx(i), y2: sy(10), stroke: "var(--line)", "stroke-width": .6 }));
        svg.appendChild(svgEl("line", { x1: sx(1), y1: sy(i), x2: sx(10), y2: sy(i), stroke: "var(--line)", "stroke-width": .6 }));
      }
      const f = frames[idx];
      f.centers.forEach(c => {
        svg.appendChild(svgEl("circle", { cx: sx(c.x), cy: sy(c.y), r: Math.max(2, f.pen * 40), fill: "var(--amber)", opacity: .07, stroke: "var(--amber)", "stroke-dasharray": "4 4" }));
      });
      const nodes = pts.map(p => ({ id: p.id, x: sx(p.x), y: sy(p.y), r: 10 }));
      const g = drawGraph(svg, nodes, [], {});
      Object.entries(g.nodeEls).forEach(([id, el]) => {
        const isCenter = f.centers.some(c => c.id === id);
        setNode(el, isCenter ? "center" : "white");
        el.addEventListener("click", () => { first = id; root.querySelector("#kc-first").value = id; build(); idx = 0; render(); });
      });
      const p = frames[idx].pen;
      root.querySelector("#kc-centers").textContent = f.centers.map(c => c.id).join(", ");
      root.querySelector("#kc-pen").textContent = p.toFixed(2);
      root.querySelector("#kc-ratio").textContent = (p / opt).toFixed(2) + "×";
      root.querySelector("#kc-count").textContent = `${idx + 1} / 3`;
      if (idx === 0) setStatus(root.querySelector("#kc-status"), `首中心 ${first}。下一步选离当前中心最远的点。`, "");
      else if (idx === 1) setStatus(root.querySelector("#kc-status"), `加入 ${f.add ? f.add.id : "?"} 后，当前半径 ${p.toFixed(2)}。`, "amber");
      else setStatus(root.querySelector("#kc-status"), `三个中心：{${f.centers.map(c => c.id).join(",")}}，pen=${p.toFixed(2)}；OPT=${opt.toFixed(2)}，比值 ${(p / opt).toFixed(2)} ≤2。`, "amber");
      root.querySelector("#kc-next").disabled = idx >= frames.length - 1;
    }
    root.querySelector("#kc-next").addEventListener("click", () => { if (idx < frames.length - 1) { idx++; render(); } });
    root.querySelector("#kc-reset").addEventListener("click", () => { build(); idx = 0; render(); });
    root.querySelector("#kc-first").addEventListener("change", e => { first = e.target.value; build(); idx = 0; render(); });
    render();
  };
})();
