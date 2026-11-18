/* =========================================================
   Interactive labs — core algorithms
   ========================================================= */
(function () {
  "use strict";
  window.DEMOS = window.DEMOS || {};

  let uid = 0;
  const SVGNS = "http://www.w3.org/2000/svg";

  function svgEl(tag, attrs) {
    const el = document.createElementNS(SVGNS, tag);
    if (attrs) Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  }
  function makeSvg(w, h) {
    const svg = svgEl("svg", { viewBox: `0 0 ${w} ${h}`, role: "img" });
    return svg;
  }
  function pathD(a, b, curve) {
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const nx = -dy / len, ny = dx / len;
    const c = curve ? curve * len : 0;
    const cx = mx + nx * c, cy = my + ny * c;
    const d = `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;
    return { d, lx: (a.x + 2 * cx + b.x) / 4, ly: (a.y + 2 * cy + b.y) / 4 };
  }
  function drawGraph(svg, nodes, edges, opts = {}) {
    const prefix = "m" + (++uid);
    const defs = svgEl("defs");
    [["arrow", "var(--line-strong)"], ["arrow-forest", "var(--forest)"], ["arrow-coral", "var(--coral)"]].forEach(([id, color]) => {
      const marker = svgEl("marker", { id: `${prefix}-${id}`, viewBox: "0 0 10 10", refX: "8", refY: "5", markerWidth: "6", markerHeight: "6", orient: "auto-start-reverse" });
      const p = svgEl("path", { d: "M 0 0 L 10 5 L 0 10 z", fill: color });
      marker.appendChild(p); defs.appendChild(marker);
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
      const t = svgEl("text", { x: 0, y: 4, "text-anchor": "middle" });
      t.textContent = n.label || n.id;
      g.appendChild(t);
      if (n.sub) {
        const st = svgEl("text", { x: 0, y: 32, "text-anchor": "middle", class: "edge-label" });
        st.textContent = n.sub; g.appendChild(st);
      }
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
  function statusEl(root, cls = "") {
    let el = root.querySelector(".demo-status");
    return el;
  }
  function setStatus(el, html, cls = "") {
    if (!el) return;
    el.className = "demo-status " + cls;
    el.innerHTML = html;
  }
  function card(title, sub, body, extra = "") {
    return `<div class="demo-card">
      <div class="demo-head"><h3>${title}</h3><p>${sub}</p></div>
      <div class="demo-body">${body}${extra}</div>
    </div>`;
  }
  function fmt(x) { return x === Infinity ? "∞" : (Math.abs(x) < 1e-9 ? 0 : x); }

  // ------------------------------------------------------------ 00 recursion vs DP
  window.DEMOS.pre = function (root) {
    root.innerHTML = card("递归 vs 动态规划", "同一个递推，调用次数可能差几个数量级。", `
      <div class="demo-controls">
        <label class="field">杆长 n
          <input class="input" id="pre-n" type="number" min="1" max="30" value="12" style="width:100px">
        </label>
        <button class="btn primary small" id="pre-run" type="button">比较调用次数</button>
      </div>
      <div id="pre-out"></div>`);
    const out = root.querySelector("#pre-out");
    const run = () => {
      const n = Math.max(1, Math.min(30, Number(root.querySelector("#pre-n").value) || 12));
      let calls = 1;
      const c = [1];
      for (let k = 1; k <= n; k++) { calls = 1; for (let i = 1; i <= k; i++) calls += c[k - i]; c[k] = calls; }
      const dp = n * (n + 1) / 2 + 1;
      const max = Math.max(c[n], dp);
      out.innerHTML = `<div class="stat-strip">
          <div class="stat"><span class="k">朴素递归调用</span><span class="v">${c[n].toLocaleString()}</span></div>
          <div class="stat"><span class="k">DP 状态计算</span><span class="v">${dp}</span></div>
          <div class="stat"><span class="k">倍数</span><span class="v">${Math.round(c[n] / dp).toLocaleString()}×</span></div>
        </div>
        <div class="bars">
          <div class="bar-row"><span>递归</span><div class="bar-track"><div class="bar-fill coral" style="width:${Math.max(2, c[n] / max * 100)}%"></div></div><span>${c[n].toLocaleString()}</span></div>
          <div class="bar-row"><span>DP</span><div class="bar-track"><div class="bar-fill" style="width:${Math.max(2, dp / max * 100)}%"></div></div><span>${dp}</span></div>
        </div>
        <p class="tiny muted" style="margin-top:12px">Rod Cutting 递推 f(k)=max<sub>i</sub>{P[i]+f(k−i)} 的朴素递归会重复展开同一子问题；DP 自底向上只算每个 f(k) 一次。</p>`;
    };
    root.querySelector("#pre-run").addEventListener("click", run);
    root.querySelector("#pre-n").addEventListener("keydown", e => { if (e.key === "Enter") run(); });
    run();
  };

  // ------------------------------------------------------------ 01 Optimal BST
  window.DEMOS.bst = function (root) {
    root.innerHTML = card("Optimal BST 实验台", "改权重，观察 DP 表、最优根与树形如何变化。", `
      <div class="demo-controls">
        <label class="field">权重 W（逗号分隔，n≤8）
          <input class="input" id="bst-w" value="40,15,35,10" style="min-width:240px">
        </label>
        <button class="btn primary small" id="bst-run" type="button">重新计算</button>
        <div class="slider-row" style="margin-left:auto">揭示长度 ≤ <input id="bst-reveal" type="range" min="1" max="4" value="4"><span id="bst-reveal-label">4</span></div>
      </div>
      <div id="bst-stats" class="stat-strip"></div>
      <div style="display:grid;grid-template-columns:1.2fr .8fr;gap:14px" class="bst-grid">
        <div><div class="dp-table-wrap"><table class="dp-table" id="bst-table"></table></div>
          <div class="tiny muted" style="margin-top:6px">点击任意单元格查看该区间的递推。行 a、列 b；空区间 a&gt;b 不填。</div>
        </div>
        <div><div class="graph-wrap" id="bst-tree"></div><div id="bst-detail" class="demo-status" style="margin-top:8px"></div></div>
      </div>`, `<style>@media(max-width:760px){.bst-grid{grid-template-columns:1fr!important}}</style>`);

    let data = null, selected = null;
    const parse = () => {
      const arr = root.querySelector("#bst-w").value.split(/[,，\s]+/).map(Number).filter(x => Number.isFinite(x) && x > 0);
      return arr.slice(0, 8);
    };
    function compute(W) {
      const n = W.length;
      const P = [0];
      for (let i = 0; i < n; i++) P[i + 1] = P[i] + W[i];
      const opt = Array.from({ length: n + 2 }, () => Array(n + 2).fill(0));
      const rt = Array.from({ length: n + 2 }, () => Array(n + 2).fill(0));
      for (let len = 1; len <= n; len++) {
        for (let a = 1; a <= n - len + 1; a++) {
          const b = a + len - 1;
          let best = Infinity, br = a;
          for (let r = a; r <= b; r++) {
            const v = opt[a][r - 1] + opt[r + 1][b];
            if (v < best) { best = v; br = r; }
          }
          opt[a][b] = P[b] - P[a - 1] + best;
          rt[a][b] = br;
        }
      }
      return { W, n, P, opt, rt };
    }
    function drawTable() {
      const { n, opt, rt } = data;
      const reveal = Number(root.querySelector("#bst-reveal").value);
      let html = "<thead><tr><th>a \\ b</th>";
      for (let b = 1; b <= n; b++) html += `<th>${b}</th>`;
      html += "</tr></thead><tbody>";
      for (let a = 1; a <= n; a++) {
        html += `<tr><th>${a}</th>`;
        for (let b = 1; b <= n; b++) {
          if (a > b) html += `<td class="blank"></td>`;
          else {
            const revealed = (b - a + 1) <= reveal;
            const sel = selected && selected.a === a && selected.b === b;
            html += `<td class="${revealed ? "revealed" : ""} ${sel ? "selected" : ""} ${a === 1 && b === n ? "opt" : ""}" data-a="${a}" data-b="${b}">${revealed ? opt[a][b] : "·"}</td>`;
          }
        }
        html += "</tr>";
      }
      root.querySelector("#bst-table").innerHTML = html + "</tbody>";
      root.querySelectorAll("#bst-table td[data-a]").forEach(td => td.addEventListener("click", () => {
        selected = { a: Number(td.dataset.a), b: Number(td.dataset.b) };
        drawTable(); drawDetail();
      }));
    }
    function buildTree() {
      const { n, rt, W } = data;
      const wrap = root.querySelector("#bst-tree");
      wrap.innerHTML = "";
      const svgW = 430, svgH = 300;
      const svg = makeSvg(svgW, svgH);
      const nodes = [];
      const edges = [];
      function layout(a, b, depth, parent) {
        if (a > b) return;
        const r = rt[a][b];
        const x = n === 1 ? svgW / 2 : 55 + (r - 1) * ((svgW - 110) / (n - 1));
        const y = 42 + depth * 62;
        const node = { key: r, x, y };
        nodes.push(node);
        if (parent) edges.push({ u: parent.key, v: r, parent, child: node });
        layout(a, r - 1, depth + 1, node);
        layout(r + 1, b, depth + 1, node);
      }
      layout(1, n, 0, null);
      const map = Object.fromEntries(nodes.map(x => [x.key, x]));
      edges.forEach(e => {
        const p = map[e.u], c = map[e.v];
        svg.appendChild(svgEl("path", { d: `M ${p.x} ${p.y + 19} L ${c.x} ${c.y - 19}`, class: "graph-edge tree", "marker-end": "" }));
      });
      nodes.forEach(nd => {
        const g = svgEl("g", { class: "graph-node center", transform: `translate(${nd.x},${nd.y})` });
        g.appendChild(svgEl("circle", { class: "halo", r: 19, cx: 0, cy: 0 }));
        const t = svgEl("text", { x: 0, y: 4, "text-anchor": "middle" }); t.textContent = nd.key; g.appendChild(t);
        const w = svgEl("text", { x: 0, y: 32, "text-anchor": "middle", class: "edge-label" }); w.textContent = "w=" + W[nd.key - 1]; g.appendChild(w);
        svg.appendChild(g);
      });
      wrap.appendChild(svg);
    }
    function drawDetail() {
      if (!selected) return;
      const { P, opt, rt } = data;
      const { a, b } = selected;
      const sum = P[b] - P[a - 1];
      let best = Infinity, br = a, parts = [];
      for (let r = a; r <= b; r++) {
        const v = opt[a][r - 1] + opt[r + 1][b];
        if (v < best) { best = v; br = r; }
        parts.push(`r=${r}: ${opt[a][r - 1]}+${opt[r + 1][b]}`);
      }
      root.querySelector("#bst-detail").innerHTML = `区间 [${a},${b}]：ΣW=${sum}，最优根 r=${rt[a][b]}，opt=${opt[a][b]}。<br><span class="tiny">${parts.join(" · ")}</span>`;
    }
    function refresh() {
      const W = parse();
      if (!W.length) { root.querySelector("#bst-stats").innerHTML = `<span class="pill coral">请输入至少一个正权重</span>`; return; }
      data = compute(W);
      selected = { a: 1, b: data.n };
      const rangeEl = root.querySelector("#bst-reveal");
      rangeEl.max = data.n; rangeEl.value = data.n;
      root.querySelector("#bst-reveal-label").textContent = data.n;
      root.querySelector("#bst-stats").innerHTML = `<div class="stat"><span class="k">n</span><span class="v">${data.n}</span></div>
        <div class="stat"><span class="k">最优平均代价</span><span class="v">${data.opt[1][data.n]}</span></div>
        <div class="stat"><span class="k">根 key</span><span class="v">${data.rt[1][data.n]}</span></div>
        <div class="stat"><span class="k">状态数</span><span class="v">${data.n * (data.n + 1) / 2}</span></div>`;
      drawTable(); buildTree(); drawDetail();
    }
    root.querySelector("#bst-run").addEventListener("click", refresh);
    root.querySelector("#bst-w").addEventListener("keydown", e => { if (e.key === "Enter") refresh(); });
    root.querySelector("#bst-reveal").addEventListener("input", e => {
      root.querySelector("#bst-reveal-label").textContent = e.target.value; drawTable();
    });
    refresh();
  };

  // ------------------------------------------------------------ 02 DFS
  window.DEMOS.dfs = function (root) {
    const nodes = [
      { id: "a", label: "a", x: 315, y: 34 }, { id: "b", label: "b", x: 175, y: 100 },
      { id: "c", label: "c", x: 175, y: 176 }, { id: "d", label: "d", x: 430, y: 100 },
      { id: "g", label: "g", x: 430, y: 176 }, { id: "f", label: "f", x: 320, y: 244 },
      { id: "e", label: "e", x: 465, y: 250 }, { id: "i", label: "i", x: 565, y: 176 },
      { id: "h", label: "h", x: 620, y: 40 }
    ];
    const edges = [
      { u: "a", v: "b" }, { u: "a", v: "d" }, { u: "b", v: "c" }, { u: "c", v: "d" },
      { u: "c", v: "e" }, { u: "d", v: "g" }, { u: "g", v: "f" }, { u: "g", v: "i" }, { u: "f", v: "e" }
    ];
    const adj = { a: ["b", "d"], b: ["c"], c: ["d", "e"], d: ["g"], g: ["f", "i"], f: ["e"], e: [], i: [], h: [] };
    const frames = [];
    const colors = Object.fromEntries(nodes.map(n => [n.id, "white"]));
    const stack = [], tree = new Set(), black = [];
    function snap(msg, active) {
      frames.push({ colors: { ...colors }, stack: [...stack], tree: new Set(tree), black: [...black], msg, active });
    }
    function dfs(u, parent) {
      colors[u] = "gray"; stack.push(u);
      snap(`进入 ${u}（染灰、压栈${parent ? `，成为 ${parent} 的孩子` : "，作为新 DFS 树的根"}）`, u);
      for (const v of adj[u]) {
        if (colors[v] === "white") { tree.add(`${u}|${v}`); dfs(v, u); }
      }
      colors[u] = "black"; stack.pop(); black.push(u);
      snap(`${u} 没有白色出邻居：弹出、染黑（turn-black #${black.length}）`, stack[stack.length - 1] || u);
    }
    for (const u of ["a", "h"]) if (colors[u] === "white") dfs(u, null);
    let idx = 0, timer = null;
    root.innerHTML = card("DFS 单步机", "白=未发现，灰=在栈，黑=完成。观察 DFS 森林与 turn-black 顺序。", `
      <div class="demo-controls">
        <button class="btn primary small" id="dfs-next" type="button">下一步 →</button>
        <button class="btn small" id="dfs-prev" type="button">← 上一步</button>
        <button class="btn small" id="dfs-reset" type="button">重置</button>
        <button class="btn small" id="dfs-auto" type="button">自动播放</button>
        <span class="pill ghost" id="dfs-count">0 / ${frames.length}</span>
      </div>
      <div class="graph-wrap" id="dfs-graph"></div>
      <div class="stack-viz" id="dfs-stack"></div>
      <div class="demo-status" id="dfs-status" style="margin-top:10px"></div>
      <div class="graph-legend"><span><i class="legend-dot" style="background:var(--card);border:1px solid var(--line-strong)"></i>白</span><span><i class="legend-dot" style="background:var(--amber)"></i>灰（在栈）</span><span><i class="legend-dot" style="background:var(--forest)"></i>黑（完成）</span><span><i class="legend-dot" style="background:var(--coral)"></i>当前</span></div>`);
    const svg = makeSvg(700, 290);
    root.querySelector("#dfs-graph").appendChild(svg);
    const graph = drawGraph(svg, nodes, edges, {});
    function render() {
      const f = frames[idx];
      Object.entries(graph.nodeEls).forEach(([id, g]) => {
        let cls = f.colors[id];
        if (id === f.active) cls += " active";
        setNode(g, cls);
      });
      Object.entries(graph.edgeEls).forEach(([key, p]) => {
        const base = key.split("|");
        const isTree = f.tree.has(`${base[0]}|${base[1]}`);
        setEdge(p, isTree ? "tree" : "");
      });
      const stackEl = root.querySelector("#dfs-stack");
      stackEl.innerHTML = `<span class="stack-label">stack</span>` + (f.stack.length ? f.stack.map((x, i) => `<span class="stack-item ${i === f.stack.length - 1 ? "top" : ""}">${x}</span>`).join("") : `<span class="stack-empty">空</span>`) +
        `<span class="stack-label" style="margin-left:14px">black</span><span class="tiny muted">${f.black.join(" → ") || "—"}</span>`;
      setStatus(root.querySelector("#dfs-status"), f.msg, f.msg.includes("白路径") ? "amber" : "");
      root.querySelector("#dfs-count").textContent = `${idx + 1} / ${frames.length}`;
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; root.querySelector("#dfs-auto").textContent = "自动播放"; } }
    root.querySelector("#dfs-next").addEventListener("click", () => { stop(); if (idx < frames.length - 1) { idx++; render(); } });
    root.querySelector("#dfs-prev").addEventListener("click", () => { stop(); if (idx > 0) { idx--; render(); } });
    root.querySelector("#dfs-reset").addEventListener("click", () => { stop(); idx = 0; render(); });
    root.querySelector("#dfs-auto").addEventListener("click", () => {
      if (timer) stop();
      else {
        root.querySelector("#dfs-auto").textContent = "暂停";
        timer = setInterval(() => { if (idx >= frames.length - 1) stop(); else { idx++; render(); } }, 850);
      }
    });
    render();
    return stop;
  };

  // ------------------------------------------------------------ 03 SCC
  window.DEMOS.scc = function (root) {
    const nodes = [
      { id: "a", x: 110, y: 70 }, { id: "b", x: 110, y: 190 }, { id: "c", x: 275, y: 130 },
      { id: "d", x: 435, y: 70 }, { id: "e", x: 435, y: 190 }, { id: "f", x: 575, y: 130 }
    ];
    const edges = [{ u: "a", v: "b" }, { u: "b", v: "a", curve: .12 }, { u: "b", v: "c" }, { u: "c", v: "d" }, { u: "d", v: "e" }, { u: "e", v: "d", curve: .12 }, { u: "e", v: "f" }];
    const rev = edges.map(e => ({ u: e.v, v: e.u, curve: e.curve || 0 }));
    const labels = { a: 6, b: 5, c: 4, d: 3, e: 2, f: 1 };
    const sccs = [["a", "b"], ["c"], ["d", "e"], ["f"]];
    let stage = 0, sccIndex = 0;
    root.innerHTML = card("SCC 三步机", "第一步标号 → 第二步反图 → 第三步按最大 label 取 SCC。", `
      <div class="demo-controls">
        <button class="btn primary small" id="scc-next" type="button">下一步 →</button>
        <button class="btn small" id="scc-prev" type="button">← 上一步</button>
        <button class="btn small" id="scc-reset" type="button">重置</button>
        <span class="pill ghost" id="scc-stage">初始</span>
      </div>
      <div class="graph-wrap" id="scc-graph"></div>
      <div class="stack-viz" id="scc-order"></div>
      <div class="demo-status" id="scc-status" style="margin-top:10px"></div>
      <div id="scc-result" class="row" style="margin-top:10px"></div>`);
    const svg = makeSvg(680, 260);
    root.querySelector("#scc-graph").appendChild(svg);
    function render() {
      svg.innerHTML = "";
      const isReverse = stage >= 2;
      const g = drawGraph(svg, nodes, isReverse ? rev : edges, {});
      const highlighted = new Set();
      for (let i = 0; i < Math.min(sccIndex, sccs.length); i++) sccs[i].forEach(x => highlighted.add(x));
      Object.entries(g.nodeEls).forEach(([id, nd]) => {
        let cls = highlighted.has(id) ? "center" : "white";
        if (isReverse && !highlighted.has(id) && stage >= 2) cls = "white";
        setNode(nd, cls);
        if (stage >= 1) {
          const badge = svgEl("g", { transform: "translate(18,-18)" });
          badge.appendChild(svgEl("circle", { r: 8, fill: "var(--coral)" }));
          const t = svgEl("text", { x: 0, y: 3, "text-anchor": "middle", style: "fill:white;font-size:8px" }); t.textContent = labels[id]; badge.appendChild(t);
          nd.appendChild(badge);
        }
      });
      Object.entries(g.edgeEls).forEach(([key, p]) => {
        const [u, v] = key.split("|");
        const within = highlighted.has(u) && highlighted.has(v);
        setEdge(p, within ? "tree" : "");
      });
      const stageNames = ["初始", "第一步：DFS 标号", "第二步：反图", `第三步：SCC ${sccIndex}/4`];
      root.querySelector("#scc-stage").textContent = stageNames[Math.min(stage, 3)] || "";
      root.querySelector("#scc-order").innerHTML = stage === 0
        ? `<span class="stack-label">提示</span><span class="tiny muted">完成顺序取决于邻接表顺序；这里固定为 a→b→c→d→e→f。</span>`
        : `<span class="stack-label">label 1→6</span>${["f", "e", "d", "c", "b", "a"].map(x => `<span class="stack-item">${x}:${labels[x]}</span>`).join("")}`;
      const st = root.querySelector("#scc-status");
      if (stage === 0) setStatus(st, "先在 G 上做 DFS，按 turn-black（弹出）顺序给点标号 1..n。", "");
      if (stage === 1) setStatus(st, "完成标号：f=1, e=2, d=3, c=4, b=5, a=6。接下来构造反图 G<sup>rev</sup>。", "amber");
      if (stage === 2) setStatus(st, "反图中按 label 从大到小启动：a(6) → c(4) → d(3) → f(1)。每次 DFS 树就是一个 SCC。", "amber");
      if (stage >= 3) {
        if (sccIndex === 1) setStatus(st, "按 label 最大点 a 在 G<sup>rev</sup> 上 DFS：只到达 a,b ⇒ SCC {a,b}。", "");
        else if (sccIndex === 2) setStatus(st, "下一个未访问的最大 label 是 c(4)：c 在反图中无法到达 b（b 已访问），得 SCC {c}。", "");
        else if (sccIndex === 3) setStatus(st, "下一个是 d(3)：d↔e，得 SCC {d,e}。", "");
        else if (sccIndex === 4) setStatus(st, "最后 f(1)：SCC {f}。完成：SCC = {a,b}, {c}, {d,e}, {f}；缩点图是 DAG。", "amber");
      }
      root.querySelector("#scc-result").innerHTML = sccs.slice(0, sccIndex).map((s, i) => `<span class="pill ${i % 2 ? "amber" : "forest"}">{${s.join(",")}}</span>`).join("");
      root.querySelector("#scc-prev").disabled = stage === 0 && sccIndex === 0;
      root.querySelector("#scc-next").disabled = stage >= 3 && sccIndex >= sccs.length;
    }
    function next() {
      if (stage === 0) stage = 1;
      else if (stage === 1) stage = 2;
      else if (stage === 2) { stage = 3; sccIndex = 1; }
      else if (sccIndex < sccs.length) sccIndex++;
      render();
    }
    function prev() {
      if (stage === 3) { if (sccIndex > 1) sccIndex--; else stage = 2; }
      else if (stage > 0) stage--;
      render();
    }
    root.querySelector("#scc-next").addEventListener("click", next);
    root.querySelector("#scc-prev").addEventListener("click", prev);
    root.querySelector("#scc-reset").addEventListener("click", () => { stage = 0; sccIndex = 0; render(); });
    render();
  };

  // ------------------------------------------------------------ 04 Dijkstra
  window.DEMOS.dijkstra = function (root) {
    const nodes = [
      { id: "s", x: 80, y: 190 }, { id: "a", x: 280, y: 80 }, { id: "b", x: 280, y: 300 },
      { id: "c", x: 465, y: 190 }, { id: "t", x: 640, y: 190 }
    ];
    const edges = [
      { u: "s", v: "a", w: 4 }, { u: "s", v: "b", w: 1 }, { u: "b", v: "a", w: 2 },
      { u: "b", v: "c", w: 5 }, { u: "a", v: "c", w: 1 }, { u: "a", v: "t", w: 7 }, { u: "c", v: "t", w: 3 }
    ];
    const adj = { s: [["a", 4], ["b", 1]], a: [["c", 1], ["t", 7]], b: [["a", 2], ["c", 5]], c: [["t", 3]], t: [] };
    const ids = nodes.map(n => n.id);
    const frames = [];
    const dist = Object.fromEntries(ids.map(x => [x, Infinity])); dist.s = 0;
    const parent = Object.fromEntries(ids.map(x => [x, null]));
    const settled = new Set();
    let activeEdges = [];
    function snap(msg, active, changed = []) { frames.push({ dist: { ...dist }, parent: { ...parent }, settled: new Set(settled), msg, active, activeEdges: [...activeEdges], changed: [...changed] }); }
    snap("初始化：dist(s)=0，其余 ∞。", "s");
    while (settled.size < ids.length) {
      let u = null;
      ids.forEach(v => { if (!settled.has(v) && (u == null || dist[v] < dist[u])) u = v; });
      if (!u || dist[u] === Infinity) break;
      settled.add(u); activeEdges = [];
      const changed = [];
      for (const [v, w] of adj[u] || []) {
        if (dist[v] > dist[u] + w) {
          dist[v] = dist[u] + w; parent[v] = u; changed.push(`${u}→${v}`); activeEdges.push(`${u}|${v}`);
        }
      }
      snap(`取出 dist 最小的 ${u}（dist=${fmt(dist[u])}），松弛它的出边${changed.length ? "：" + changed.join("、") : "：没有改进"}。`, u, changed);
    }
    snap("S 为空，所有可达点的 dist 已最终确定。沿 parent 得到最短路树。", "", []);
    let idx = 0, timer = null;
    root.innerHTML = card("Dijkstra 单步机", "每次取出当前 dist 最小的未定点，松弛出边。观察“已确定集合”如何扩大。", `
      <div class="demo-controls">
        <button class="btn primary small" id="dj-next" type="button">下一步 →</button>
        <button class="btn small" id="dj-prev" type="button">← 上一步</button>
        <button class="btn small" id="dj-reset" type="button">重置</button>
        <button class="btn small" id="dj-auto" type="button">自动播放</button>
        <span class="pill ghost" id="dj-count">1 / ${frames.length}</span>
      </div>
      <div style="display:grid;grid-template-columns:1.15fr .85fr;gap:14px" class="dj-grid">
        <div><div class="graph-wrap" id="dj-graph"></div></div>
        <div><table class="flow-table" id="dj-table"></table></div>
      </div>
      <div class="demo-status" id="dj-status" style="margin-top:10px"></div>`, `<style>@media(max-width:760px){.dj-grid{grid-template-columns:1fr!important}}</style>`);
    const svg = makeSvg(680, 340);
    root.querySelector("#dj-graph").appendChild(svg);
    const graph = drawGraph(svg, nodes, edges, {});
    function render() {
      const f = frames[idx];
      Object.entries(graph.nodeEls).forEach(([id, g]) => {
        let cls = f.settled.has(id) ? "black" : "white";
        if (id === f.active) cls += " active";
        setNode(g, cls);
      });
      Object.entries(graph.edgeEls).forEach(([key, p]) => {
        const [u, v] = key.split("|");
        const inSPT = f.parent[v] === u;
        const active = f.activeEdges.includes(`${u}|${v}`);
        setEdge(p, active ? "active" : inSPT ? "tree" : "");
      });
      const rows = ids.map(v => `<tr class="${f.settled.has(v) ? "settled" : ""} ${f.changed.some(c => c.endsWith("→" + v)) ? "changed" : ""}">
        <td>${v}</td><td class="num">${fmt(f.dist[v])}</td><td>${f.parent[v] || "—"}</td><td>${f.settled.has(v) ? "✓" : ""}</td></tr>`).join("");
      root.querySelector("#dj-table").innerHTML = `<thead><tr><th>v</th><th>dist</th><th>parent</th><th>确定</th></tr></thead><tbody>${rows}</tbody>`;
      setStatus(root.querySelector("#dj-status"), f.msg, f.settled.size === ids.length ? "amber" : "");
      root.querySelector("#dj-count").textContent = `${idx + 1} / ${frames.length}`;
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; root.querySelector("#dj-auto").textContent = "自动播放"; } }
    root.querySelector("#dj-next").addEventListener("click", () => { stop(); if (idx < frames.length - 1) { idx++; render(); } });
    root.querySelector("#dj-prev").addEventListener("click", () => { stop(); if (idx > 0) { idx--; render(); } });
    root.querySelector("#dj-reset").addEventListener("click", () => { stop(); idx = 0; render(); });
    root.querySelector("#dj-auto").addEventListener("click", () => {
      if (timer) stop();
      else { root.querySelector("#dj-auto").textContent = "暂停"; timer = setInterval(() => { if (idx >= frames.length - 1) stop(); else { idx++; render(); } }, 900); }
    });
    render(); return stop;
  };

  // ------------------------------------------------------------ 05 Bellman-Ford
  window.DEMOS.bellman = function (root) {
    const nodes = [
      { id: "s", x: 75, y: 190 }, { id: "a", x: 280, y: 80 }, { id: "b", x: 280, y: 300 },
      { id: "c", x: 470, y: 190 }, { id: "t", x: 640, y: 190 }
    ];
    const baseEdges = [
      { u: "s", v: "a", w: 4 }, { u: "s", v: "b", w: 5 }, { u: "b", v: "a", w: -3 },
      { u: "a", v: "c", w: 2 }, { u: "c", v: "t", w: 3 }, { u: "b", v: "t", w: 8 }
    ];
    const cycleEdge = { u: "t", v: "b", w: -10, curve: .18 };
    let withCycle = false, frames = [], idx = 0, detected = null;
    function build() {
      frames = []; detected = null;
      const edges = withCycle ? [...baseEdges, cycleEdge] : baseEdges;
      const ids = ["s", "a", "b", "c", "t"];
      const dist = Object.fromEntries(ids.map(x => [x, Infinity])); dist.s = 0;
      const parent = Object.fromEntries(ids.map(x => [x, null]));
      const snap = (msg, round, changed = [], edge = null) => frames.push({ dist: { ...dist }, parent: { ...parent }, msg, round, changed: [...changed], edge });
      snap("初始化：dist(s)=0，其余 ∞。", 0);
      for (let r = 1; r <= 4; r++) {
        let changed = [];
        edges.forEach(e => {
          if (dist[e.u] !== Infinity && dist[e.v] > dist[e.u] + e.w) {
            dist[e.v] = dist[e.u] + e.w; parent[e.v] = e.u; changed.push(e.v);
            snap(`第 ${r} 轮：松弛 (${e.u},${e.v})，dist(${e.v}) ↓ 到 ${fmt(dist[e.v])}。`, r, [e.v], e);
          }
        });
        snap(`第 ${r} 轮结束${changed.length ? "" : "，没有任何更新（可提前停止）"}。`, r);
      }
      snap("|V|−1=4 轮结束。若再扫一遍仍能松弛，就存在负环。", 4);
      return { edges, ids, dist, parent };
    }
    let model = build();
    root.innerHTML = card("Bellman–Ford 边级单步", "蓝色：当前松弛边；黄色：本轮被更新的 dist。可切换负环观察检测。", `
      <div class="demo-controls">
        <button class="btn primary small" id="bf-next" type="button">下一步 →</button>
        <button class="btn small" id="bf-prev" type="button">← 上一步</button>
        <button class="btn small" id="bf-reset" type="button">重置</button>
        <label class="tiny" style="display:flex;gap:6px;align-items:center;margin-left:8px"><input type="checkbox" id="bf-cycle"> 加入负环 t→b(−10)</label>
        <button class="btn small" id="bf-detect" type="button">再扫一遍检测负环</button>
        <span class="pill ghost" id="bf-count">1 / ${frames.length}</span>
      </div>
      <div style="display:grid;grid-template-columns:1.1fr .9fr;gap:14px" class="bf-grid">
        <div><div class="graph-wrap" id="bf-graph"></div></div>
        <div><table class="flow-table" id="bf-table"></table></div>
      </div>
      <div class="demo-status" id="bf-status" style="margin-top:10px"></div>`, `<style>@media(max-width:760px){.bf-grid{grid-template-columns:1fr!important}}</style>`);
    const svg = makeSvg(680, 340);
    root.querySelector("#bf-graph").appendChild(svg);
    function renderGraph() {
      svg.innerHTML = "";
      const g = drawGraph(svg, nodes, model.edges, {});
      const f = frames[idx];
      Object.entries(g.edgeEls).forEach(([key, p]) => {
        const [u, v] = key.split("|");
        const active = f.edge && f.edge.u === u && f.edge.v === v;
        setEdge(p, active ? "active" : "");
      });
      Object.entries(g.nodeEls).forEach(([id, n]) => {
        const changed = f.changed.includes(id);
        setNode(n, changed ? "center" : "white");
      });
      if (detected) {
        Object.entries(g.edgeEls).forEach(([key, p]) => {
          const [u, v] = key.split("|");
          if ((u === "b" || u === "a" || u === "c" || u === "t") && (v === "a" || v === "c" || v === "t" || v === "b")) {
            if (detected.cycle.has(`${u}|${v}`)) setEdge(p, "active");
          }
        });
      }
    }
    function render() {
      renderGraph();
      const f = frames[idx];
      root.querySelector("#bf-table").innerHTML = `<thead><tr><th>v</th><th>dist</th><th>parent</th></tr></thead><tbody>` +
        model.ids.map(v => `<tr class="${f.changed.includes(v) ? "changed" : ""}"><td>${v}</td><td class="num">${fmt(f.dist[v])}</td><td>${f.parent[v] || "—"}</td></tr>`).join("") + `</tbody>`;
      setStatus(root.querySelector("#bf-status"), f.msg + (detected ? `<br><strong>${detected.msg}</strong>` : ""), detected ? (detected.positive ? "coral" : "amber") : "");
      root.querySelector("#bf-count").textContent = `${idx + 1} / ${frames.length}`;
    }
    function reset() {
      model = build(); idx = 0; detected = null; root.querySelector("#bf-count").textContent = `1 / ${frames.length}`; render();
    }
    root.querySelector("#bf-next").addEventListener("click", () => { if (idx < frames.length - 1) { idx++; render(); } });
    root.querySelector("#bf-prev").addEventListener("click", () => { if (idx > 0) { idx--; render(); } });
    root.querySelector("#bf-reset").addEventListener("click", reset);
    root.querySelector("#bf-cycle").addEventListener("change", e => { withCycle = e.target.checked; reset(); });
    root.querySelector("#bf-detect").addEventListener("click", () => {
      idx = frames.length - 1;
      const last = frames[frames.length - 1].dist;
      let bad = null;
      model.edges.forEach(e => {
        if (last[e.u] !== Infinity && last[e.v] > last[e.u] + e.w) bad = e;
      });
      if (bad) {
        detected = { positive: true, msg: `仍可松弛 (${bad.u},${bad.v})：存在从 s 可达的负环。`, cycle: withCycle ? new Set(["b|a", "a|c", "c|t", "t|b"]) : new Set() };
      } else {
        detected = { positive: false, msg: "所有边均满足 dist(v) ≤ dist(u)+w(u,v)：没有从 s 可达的负环。", cycle: new Set() };
      }
      render();
    });
    render();
  };

  // ------------------------------------------------------------ 06 Max flow
  window.DEMOS.maxflow = function (root) {
    const nodes = [
      { id: "s", x: 50, y: 190 }, { id: "v1", x: 200, y: 75 }, { id: "v2", x: 200, y: 300 },
      { id: "v3", x: 400, y: 75 }, { id: "v4", x: 400, y: 300 }, { id: "t", x: 600, y: 190 }
    ];
    const orig = [
      { u: "s", v: "v1", c: 16 }, { u: "s", v: "v2", c: 13 }, { u: "v1", v: "v3", c: 12 },
      { u: "v1", v: "v4", c: 9 }, { u: "v2", v: "v4", c: 14 }, { u: "v3", v: "v4", c: 7, curve: .12 },
      { u: "v4", v: "v3", c: 7, curve: .12 }, { u: "v3", v: "t", c: 20 }, { u: "v4", v: "t", c: 4 }
    ];
    const ids = ["s", "v1", "v2", "v3", "v4", "t"];
    const cap = {}, flow = {};
    orig.forEach(e => { cap[`${e.u}|${e.v}`] = (cap[`${e.u}|${e.v}`] || 0) + e.c; });
    const pairs = [];
    Object.keys(cap).forEach(k => { const [u, v] = k.split("|"); if (!pairs.some(([a, b]) => a === v && b === u)) pairs.push([u, v]); });
    pairs.forEach(([u, v]) => { if (cap[`${u}|${v}`] == null) cap[`${u}|${v}`] = 0; if (cap[`${v}|${u}`] == null) cap[`${v}|${u}`] = 0; flow[`${u}|${v}`] = 0; flow[`${v}|${u}`] = 0; });
    function residual(u, v) { return (cap[`${u}|${v}`] || 0) - (flow[`${u}|${v}`] || 0); }
    const frames = [{ msg: "初始流为 0。残量 = 容量。", path: [], delta: 0, total: 0, flow: { ...flow } }];
    let total = 0;
    function bfs() {
      const par = { s: null }, q = ["s"], seen = new Set(["s"]);
      while (q.length) {
        const u = q.shift();
        if (u === "t") { const path = []; let x = "t"; while (par[x] != null) { path.push([par[x], x]); x = par[x]; } return path.reverse(); }
        for (const v of ids) {
          if (!seen.has(v) && residual(u, v) > 0) { seen.add(v); par[v] = u; q.push(v); }
        }
      }
      return null;
    }
    for (let guard = 0; guard < 20; guard++) {
      const path = bfs();
      if (!path) break;
      let delta = Infinity;
      path.forEach(([u, v]) => { delta = Math.min(delta, residual(u, v)); });
      path.forEach(([u, v]) => { flow[`${u}|${v}`] += delta; flow[`${v}|${u}`] -= delta; });
      total += delta;
      frames.push({ msg: `在残量图中找到增广路 ${path.map(p => p[0]).join(" → ")} → t，瓶颈 Δ=${delta}。`, path, delta, total, flow: { ...flow } });
    }
    const reach = new Set(["s"]); const q = ["s"];
    while (q.length) { const u = q.shift(); ids.forEach(v => { if (!reach.has(v) && residual(u, v) > 0) { reach.add(v); q.push(v); } }); }
    const cutEdges = orig.filter(e => reach.has(e.u) && !reach.has(e.v));
    const cutCap = cutEdges.reduce((a, e) => a + e.c, 0);
    frames.push({ msg: `无增广路。源侧 S={${[...reach].join(",")}}，割容量=${cutCap}=最大流值。`, path: [], delta: 0, total, flow: { ...flow } });
    let idx = 0;
    root.innerHTML = card("Ford–Fulkerson 增广机", "每条边显示 当前流/容量。路径高亮后在残量图中增广，反向边允许“反悔”。", `
      <div class="demo-controls">
        <button class="btn primary small" id="mf-next" type="button">下一次增广 →</button>
        <button class="btn small" id="mf-prev" type="button">← 上一步</button>
        <button class="btn small" id="mf-reset" type="button">重置</button>
        <span class="pill ghost" id="mf-count">1 / ${frames.length}</span>
        <span class="pill forest" id="mf-total">|f| = 0</span>
      </div>
      <div class="graph-wrap" id="mf-graph"></div>
      <div class="stack-viz" id="mf-cut"></div>
      <div class="demo-status" id="mf-status" style="margin-top:10px"></div>
      <table class="flow-table" id="mf-table" style="margin-top:12px"></table>`);
    const svg = makeSvg(660, 370);
    root.querySelector("#mf-graph").appendChild(svg);
    const graph = drawGraph(svg, nodes, orig.map(e => ({ ...e, label: "" })), {});
    function render() {
      const f = frames[idx];
      const pathSet = new Set(f.path.map(([u, v]) => `${u}|${v}`));
      Object.entries(graph.edgeEls).forEach(([key, p]) => {
        const [u, v] = key.split("|");
        const path = pathSet.has(`${u}|${v}`) || pathSet.has(`${v}|${u}`);
        setEdge(p, path ? "active" : "");
        const lbl = graph.labelEls[key];
        const origEdge = orig.find(e => e.u === u && e.v === v);
        const capHere = origEdge ? origEdge.c : (cap[`${u}|${v}`] || 0);
        if (lbl) lbl.textContent = `${Math.max(0, (f.flow[`${u}|${v}`] || 0))}/${capHere}`;
      });
      Object.entries(graph.nodeEls).forEach(([id, n]) => {
        let cls = "white";
        if (f.path.length === 0 && idx === frames.length - 1 && reach.has(id)) cls = "center";
        setNode(n, cls);
      });
      const rows = orig.map(e => {
        const k = `${e.u}|${e.v}`;
        const fv = Math.max(0, (f.flow[k] || 0));
        return `<tr class="${pathSet.has(k) || pathSet.has(`${e.v}|${e.u}`) ? "changed" : ""}"><td>${e.u}→${e.v}</td><td class="num">${fv} / ${e.c}</td><td class="num">${e.c - fv}</td></tr>`;
      }).join("");
      root.querySelector("#mf-table").innerHTML = `<thead><tr><th>边</th><th>flow / cap</th><th>残量 R</th></tr></thead><tbody>${rows}</tbody>`;
      root.querySelector("#mf-total").textContent = `|f| = ${f.total}`;
      root.querySelector("#mf-cut").innerHTML = idx === frames.length - 1
        ? `<span class="stack-label">最小割 S</span>${[...reach].map(x => `<span class="stack-item">${x}</span>`).join("")}<span class="stack-label" style="margin-left:12px">割边</span><span class="tiny muted">${cutEdges.map(e => `${e.u}→${e.v}`).join("、")}（容量 ${cutCap}）</span>`
        : "";
      setStatus(root.querySelector("#mf-status"), f.msg, idx === frames.length - 1 ? "amber" : "");
      root.querySelector("#mf-count").textContent = `${idx + 1} / ${frames.length}`;
    }
    root.querySelector("#mf-next").addEventListener("click", () => { if (idx < frames.length - 1) { idx++; render(); } });
    root.querySelector("#mf-prev").addEventListener("click", () => { if (idx > 0) { idx--; render(); } });
    root.querySelector("#mf-reset").addEventListener("click", () => { idx = 0; render(); });
    render();
  };

  // ------------------------------------------------------------ 07 Johnson
  window.DEMOS.johnson = function (root) {
    const nodes = [
      { id: "a", x: 90, y: 55 }, { id: "b", x: 235, y: 105 }, { id: "c", x: 370, y: 155 },
      { id: "d", x: 335, y: 40 }, { id: "g", x: 500, y: 85 }, { id: "f", x: 600, y: 175 },
      { id: "e", x: 480, y: 245 }
    ];
    const edges = [
      { u: "a", v: "b", w: 1 }, { u: "a", v: "d", w: -6 }, { u: "b", v: "c", w: 1 },
      { u: "c", v: "d", w: -2, curve: .1 }, { u: "c", v: "e", w: 1 }, { u: "d", v: "g", w: -3 },
      { u: "e", v: "d", w: 5, curve: .12 }, { u: "f", v: "e", w: 1 }, { u: "g", v: "f", w: 2 }
    ];
    const h = { a: 0, b: 0, c: 0, d: -6, e: -6, f: -7, g: -9 };
    let stage = 0;
    root.innerHTML = card("Johnson 三步", "原始负权 → dummy/BF 势函数 → 重赋权为非负。注意新权仍保持最短路。", `
      <div class="demo-controls">
        <button class="btn primary small" id="jn-next" type="button">下一步 →</button>
        <button class="btn small" id="jn-prev" type="button">← 上一步</button>
        <button class="btn small" id="jn-reset" type="button">重置</button>
        <span class="pill ghost" id="jn-stage">原始图</span>
      </div>
      <div class="graph-wrap" id="jn-graph"></div>
      <div class="row" style="margin-top:10px"><div id="jn-h" class="stack-viz" style="flex:1"></div></div>
      <div class="demo-status" id="jn-status" style="margin-top:10px"></div>`);
    const svg = makeSvg(660, 300);
    root.querySelector("#jn-graph").appendChild(svg);
    function render() {
      svg.innerHTML = "";
      const shown = edges.map(e => ({ ...e, label: stage < 2 ? String(e.w) : String(e.w + h[e.u] - h[e.v]) }));
      const g = drawGraph(svg, nodes, shown, {});
      Object.entries(g.nodeEls).forEach(([id, nd]) => {
        let cls = "white";
        if (stage >= 1) { nd.appendChild(svgEl("circle", { r: 19, cx: 0, cy: 0, fill: "none", stroke: "var(--amber)", "stroke-width": "2", "stroke-dasharray": "3 3" })); }
        if (stage >= 2) cls = "center";
        setNode(nd, cls);
      });
      const st = root.querySelector("#jn-status");
      if (stage === 0) setStatus(st, "原图有负权。先加 dummy 及 0 权边，用 Bellman–Ford 求 h(v)=spdist(dummy,v)。", "");
      if (stage === 1) setStatus(st, "h = (0,0,0,−6,−6,−7,−9)。每条边满足 h(v)≤h(u)+w(u,v)，从而 w′=w+h(u)−h(v)≥0。", "amber");
      if (stage === 2) setStatus(st, "重赋权完成：所有边非负。路径长度只改变 h(s)−h(t)，所以最短路结构不变；现在可对每个源跑 Dijkstra。", "amber");
      root.querySelector("#jn-h").innerHTML = stage >= 1 ? `<span class="stack-label">h(v)</span>${["a", "b", "c", "d", "e", "f", "g"].map(x => `<span class="stack-item" title="h(${x})">${x}:${h[x]}</span>`).join("")}` : `<span class="tiny muted">h 尚未计算。</span>`;
      root.querySelector("#jn-stage").textContent = ["原始图", "dummy + Bellman–Ford", "重赋权后"][stage];
    }
    root.querySelector("#jn-next").addEventListener("click", () => { if (stage < 2) { stage++; render(); } });
    root.querySelector("#jn-prev").addEventListener("click", () => { if (stage > 0) { stage--; render(); } });
    root.querySelector("#jn-reset").addEventListener("click", () => { stage = 0; render(); });
    render();
  };
})();
