/* =========================================================
   CSCI3160 interactive review — application shell
   ========================================================= */
(function () {
  "use strict";

  const D = window.COURSE_DATA;
  const MODULES = D.MODULES;
  const EXERCISES = D.EXERCISES;
  const EXTRA = D.EXTRA_EXERCISES || [];
  const EXTRA_SETS = D.EXTRA_SETS || [{ id: "A", label: "A · 加练", title: "加练", desc: "", short: "" }];
  const TEXTBOOK = window.TEXTBOOK || [];
  const TB_EX = window.TEXTBOOK_EXERCISES || [];
  const DETAILS = window.SOLUTION_DETAILS || {};
  const TB_FOR_MODULE = {
    pre: ["u1", "u2", "u3", "u4", "u5", "u6", "u7", "u8", "u9"],
    bst: ["u10"], dfs: ["u11"], scc: ["u12"], dijkstra: ["u13"], bellman: ["u14"],
    maxflow: ["u16"], apsp: ["u15"], np: ["u17"], tsp: ["u18"], setcover: ["u19"], kcenter: ["u20"]
  };
  const setOf = (e) => e.set || "A";
  const FORMULAS = D.FORMULAS;
  const MODULE_MAP = Object.fromEntries(MODULES.map(m => [m.id, m]));
  const STORE_KEY = "csci3160-review-v1";
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const stripHTML = (s) => String(s || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const range = (a, b) => Array.from({ length: Math.max(0, b - a + 1) }, (_, i) => a + i);

  let state = loadState();
  let activeCleanup = [];
  let quizSession = null;
  let examState = null;
  let examTimer = null;
  let toastTimer = null;
  const ui = { ex: { q: "", module: "all", source: "all", diff: "all", status: "all" } };

  // ---------------------------------------------------------------- storage
  function defaultState() {
    return { theme: null, completed: {}, exercisesDone: {}, extraDone: {}, textbookDone: {}, bookmarks: {}, quiz: {}, wrong: {}, lastRoute: "#/dashboard", examBest: null };
  }
  function loadState() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      return Object.assign(defaultState(), parsed, {
        completed: parsed.completed || {}, exercisesDone: parsed.exercisesDone || {}, extraDone: parsed.extraDone || {},
        textbookDone: parsed.textbookDone || {},
        bookmarks: parsed.bookmarks || {}, quiz: parsed.quiz || {}, wrong: parsed.wrong || {}
      });
    } catch (e) { return defaultState(); }
  }
  function saveState() { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } }
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 1900);
  }

  // ---------------------------------------------------------------- theme / chrome
  function applyTheme() {
    const preferred = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const theme = state.theme || preferred;
    document.documentElement.setAttribute("data-theme", theme);
    $("#theme-toggle").textContent = theme === "dark" ? "☀" : "◐";
  }
  function cycleTheme() {
    const cur = document.documentElement.getAttribute("data-theme");
    state.theme = cur === "dark" ? "light" : "dark";
    saveState(); applyTheme();
  }

  function modulePct() {
    const done = MODULES.filter(m => state.completed[m.id]).length;
    return Math.round(done / MODULES.length * 100);
  }
  function doneCount() { return EXERCISES.filter(e => state.exercisesDone[e.id]).length; }
  function extraDoneCount(setId) {
    return EXTRA.filter(e => (!setId || setOf(e) === setId) && state.extraDone[e.id]).length;
  }
  function wrongCount() { return Object.keys(state.wrong).length; }
  function bookmarkCount() { return Object.keys(state.bookmarks).length; }

  function syncChrome() {
    const pct = modulePct();
    $("#side-progress-label").textContent = pct + "%";
    $("#side-progress-fill").style.width = pct + "%";
    const next = MODULES.find(m => !state.completed[m.id]);
    $("#side-progress-hint").textContent = next ? (next.index + " " + next.title) : "全部模块已掌握";
    $("#nav-ex-count").textContent = EXERCISES.length;
    const navExtra = $("#nav-extra-count"); if (navExtra) navExtra.textContent = EXTRA.length;
    const navTb = $("#nav-tb-count"); if (navTb) navTb.textContent = TEXTBOOK.length;
    $("#nav-wrong-count").textContent = wrongCount();
    const route = location.hash.slice(2).split("?")[0];
    $$(".nav-link").forEach(a => {
      const ar = a.dataset.route || "";
      a.classList.toggle("active", ar === route || route.startsWith(ar + "/"));
    });
  }

  function nextModule() { return MODULES.find(m => !state.completed[m.id]) || MODULES[0]; }

  // ---------------------------------------------------------------- routing
  function parseRoute() {
    let raw = location.hash.replace(/^#\/?/, "");
    if (!raw) raw = "dashboard";
    const [path, query] = raw.split("?");
    const parts = path.split("/").filter(Boolean);
    return { path, parts, query: new URLSearchParams(query || "") };
  }

  function go(hash) {
    if (location.hash === hash) renderRoute();
    else location.hash = hash;
  }

  function renderRoute() {
    activeCleanup.forEach(fn => { try { fn(); } catch (e) {} });
    activeCleanup = [];
    const r = parseRoute();
    const view = $("#view");
    view.innerHTML = "";
    document.body.classList.remove("nav-open");
    $("#drawer-backdrop").hidden = true;
    let crumb = "复习总览";

    if (r.parts[0] === "module") {
      const id = r.parts[1];
      const tab = r.parts[2] || "lecture";
      const m = MODULE_MAP[id];
      if (!m) { go("#/dashboard"); return; }
      crumb = `${m.index} · ${m.title}`;
      view.innerHTML = renderModule(m, tab);
      afterModule(m, tab);
    } else if (r.parts[0] === "exercises") {
      crumb = "习题库";
      const qmod = r.query.get("module");
      if (qmod && MODULE_MAP[qmod]) ui.ex.module = qmod;
      view.innerHTML = renderExerciseBank(r.parts[1] || null);
      afterExerciseBank(r.parts[1] || null);
    } else if (r.parts[0] === "textbook") {
      crumb = "CLRS 精讲";
      view.innerHTML = renderTextbook(r.parts[1] || "");
      afterTextbook(r.parts[1] || "");
    } else if (r.parts[0] === "extra") {
      crumb = "期中风格加练";
      view.innerHTML = renderExtra(r.parts[1] || "A");
      afterExtra(r.parts[2] || "");
    } else if (r.parts[0] === "formulas") {
      crumb = "公式速查";
      view.innerHTML = renderFormulas();
    } else if (r.parts[0] === "exam") {
      crumb = "模拟考";
      view.innerHTML = renderExam();
      afterExam();
    } else if (r.parts[0] === "wrong") {
      crumb = "错题本";
      view.innerHTML = renderWrong();
    } else if (r.parts[0] === "map") {
      crumb = "知识地图";
      view.innerHTML = renderMap();
    } else {
      crumb = "复习总览";
      view.innerHTML = renderDashboard();
      afterDashboard();
    }
    $("#crumb").innerHTML = `<span>${esc(crumb).replace(" · ", " · <strong>")}${crumb.includes(" · ") ? "</strong>" : ""}</span>`;
    state.lastRoute = location.hash || "#/dashboard";
    saveState();
    syncChrome();
    const deepLink = ((r.parts[0] === "textbook" || r.parts[0] === "exercises") && !!r.parts[1]) || (r.parts[0] === "extra" && !!r.parts[2]);
    if (!deepLink) window.scrollTo({ top: 0, behavior: "instant" });
  }

  // ---------------------------------------------------------------- dashboard
  function renderDashboard() {
    const pct = modulePct();
    const done = doneCount();
    const next = nextModule();
    const ringR = 47, circ = 2 * Math.PI * ringR;
    const offset = circ * (1 - pct / 100);
    const quizCount = Object.keys(state.quiz).length;
    const avgQuiz = quizCount ? Math.round(Object.values(state.quiz).reduce((a, q) => a + q.score / q.total, 0) / quizCount * 100) : 0;

    const recent = MODULES.filter(m => m.id !== "pre").slice(0, 6).map(m => {
      const st = state.completed[m.id] ? "done" : (state.quiz[m.id] ? "progress" : "");
      return `<a class="mini-row" href="#/module/${m.id}">
        <span class="dot ${st}"></span><span class="idx">${m.index}</span>
        <span class="txt">${esc(m.title)}<small>${esc(m.short)}</small></span>
        <span class="tiny muted">${m.quiz.length} 题</span>
      </a>`;
    }).join("");

    return `
      <section class="hero">
        <div class="hero-copy">
          <span class="eyebrow">CSCI3160 · Final Review Studio</span>
          <h1>从 <em>Optimal BST</em><br>一路复习到 <span class="nowrap">k-Center</span></h1>
          <p class="lede">把 dp-bst 之后的全部讲义、证明套路与 76 道原始习题，外加 3 套 21 道期中风格加练，压缩成一条可交互的复习路线。先修知识已补齐，不用跳回旧 PDF 找概念。</p>
          <div class="hero-actions">
            <a class="btn primary" href="#/module/${next.id}">继续：${next.index} ${esc(next.title)} →</a>
            <a class="btn" href="#/map">打开知识地图</a>
            <a class="btn" href="#/exercises">刷 76 道题</a>
            <a class="btn" href="#/extra">期中加练 21 题</a>
          </div>
        </div>
        <div class="hero-stats">
          <div class="hero-ring">
            <div class="ring-wrap">
              <svg viewBox="0 0 112 112" width="112" height="112" aria-hidden="true">
                <circle class="ring-bg" cx="56" cy="56" r="${ringR}" fill="none" stroke-width="7"></circle>
                <circle class="ring-fg" cx="56" cy="56" r="${ringR}" fill="none" stroke-width="7"
                  stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}"></circle>
              </svg>
              <div class="ring-label"><strong>${pct}%</strong><small>MODULES</small></div>
            </div>
            <div class="hero-ring-copy">
              <strong>${MODULES.filter(m => state.completed[m.id]).length} / ${MODULES.length} 个模块</strong>
              已完成 · ${done} / ${EXERCISES.length} 道习题<br>
              随堂测平均 ${avgQuiz}%
            </div>
          </div>
          <div class="hero-stat"><span>原始题 / 期中加练</span><strong>${EXERCISES.length} + ${EXTRA.length}</strong></div>
          <div class="hero-stat"><span>互动实验</span><strong>${MODULES.filter(m => m.demo).length}</strong></div>
          <div class="hero-stat"><span>收藏 / 错题</span><strong>${bookmarkCount()} / ${wrongCount()}</strong></div>
        </div>
      </section>

      <section class="section">
        <div class="section-head">
          <div><span class="eyebrow">Next move</span><h2>下一步：${next.index} ${esc(next.title)}</h2><p>${esc(next.blurb)}</p></div>
          <a class="btn small" href="#/map">看依赖关系</a>
        </div>
        <div class="dash-grid">
          <div class="stack">
            <div class="card next-card">
              <div>
                <span class="pill amber">${esc(next.examWeight)}</span>
                <h3>${esc(next.short)}</h3>
                <p>预计 ${esc(next.duration)} · 先修：${next.prerequisites.length ? next.prerequisites.map(esc).join("、") : "无"}</p>
                <div class="row" style="margin-top:12px">
                  <a class="btn primary small" href="#/module/${next.id}">进入讲义</a>
                  <a class="btn small" href="#/module/${next.id}/lab">直接玩实验</a>
                  <a class="btn ghost small" href="#/module/${next.id}/quiz">先测一测</a>
                </div>
              </div>
              <div class="next-index">${next.index}</div>
            </div>
            <div class="card pad">
              <div class="between"><h3>复习进度</h3><span class="pill forest">${pct}%</span></div>
              <div class="mini-list" style="margin-top:8px">${recent}</div>
            </div>
          </div>
          <div class="stack">
            <div class="card pad">
              <span class="eyebrow">Quick hits</span>
              <h3 style="margin:7px 0 9px">今天先记这 4 个结论</h3>
              <div class="stack" style="gap:10px">
                <div class="formula-card"><div class="fc-label">Optimal BST</div><div class="fc-body math">opt(a,b)=ΣW+min<sub>r</sub>{opt(a,r−1)+opt(r+1,b)}</div><div class="fc-note">Θ(n²) 状态 × O(n) 根 = O(n³)</div></div>
                <div class="formula-card"><div class="fc-label">SCC</div><div class="fc-body math">G<sup>scc</sup> 是 DAG；边 S<sub>i</sub>→S<sub>j</sub> ⇒ label(S<sub>i</sub>)&gt;label(S<sub>j</sub>)</div><div class="fc-note">第二次 DFS：G<sup>rev</sup> + 最大 label 优先</div></div>
                <div class="formula-card"><div class="fc-label">Johnson</div><div class="fc-body math">w′=w+h(u)−h(v)，h(u)=spdist(v<sub>dummy</sub>,u)</div><div class="fc-note">路径只差端点项；重赋权后全非负</div></div>
                <div class="formula-card"><div class="fc-label">Approximation</div><div class="fc-body math">VC: 2 · Set Cover: 1+ln|U| · TSP: 2 · k-Center: 2</div><div class="fc-note">每个都有一条“下界 + 上界”的证明链</div></div>
              </div>
            </div>
            <a class="card pad" href="#/wrong" style="text-decoration:none;color:inherit">
              <div class="between"><div><span class="eyebrow">Review queue</span><h3 style="margin-top:6px">错题本</h3></div><span class="next-index" style="width:46px;height:46px;font-size:1rem">${wrongCount()}</span></div>
              <p class="muted small" style="margin:8px 0 0">随堂测答错的题会自动进来。考前只看这里，效率最高。</p>
            </a>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="section-head">
          <div><span class="eyebrow">Three phases</span><h2>一条不会漏点的复习路线</h2><p>先修 → 图与最短路 → 流与近似。每一阶段都标出了“必须能自己写出来”的证明。</p></div>
        </div>
        <div class="phase-grid">
          <div class="phase-card">
            <div class="ph">PHASE 01 · DP + GRAPH</div>
            <h3>结构感</h3>
            <p>BST 区间 DP、DFS 白路径、SCC 缩点。重点是“子问题/依赖/极大性”，不是背代码。</p>
            <div class="phase-links"><a href="#/module/pre">先修</a><a href="#/module/bst">Optimal BST</a><a href="#/module/dfs">DFS</a><a href="#/module/scc">SCC</a></div>
          </div>
          <div class="phase-card">
            <div class="ph">PHASE 02 · SHORTEST PATHS + FLOW</div>
            <h3>不变量</h3>
            <p>Dijkstra 的“弹出即最终”、BF 的“轮数=边数”、最大流的“残量图无增广路”。</p>
            <div class="phase-links"><a href="#/module/dijkstra">Dijkstra</a><a href="#/module/bellman">Bellman–Ford</a><a href="#/module/maxflow">Max Flow</a><a href="#/module/apsp">Johnson</a></div>
          </div>
          <div class="phase-card">
            <div class="ph">PHASE 03 · NP-HARD + APPROX</div>
            <h3>下界与上界</h3>
            <p>每个近似比都是一条不等式链：OPT 的下界 + 算法输出的上界。VC、TSP、Set Cover、k-Center 各背一条。</p>
            <div class="phase-links"><a href="#/module/np">NP-hard</a><a href="#/module/tsp">TSP</a><a href="#/module/setcover">Set Cover</a><a href="#/module/kcenter">k-Center</a></div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="card pad" style="background:linear-gradient(120deg,color-mix(in srgb,var(--forest-soft) 48%,var(--card)),var(--card));border-color:color-mix(in srgb,var(--forest) 22%,var(--line))">
          <div class="between">
            <div>
              <span class="eyebrow">CLRS deep-read</span>
              <h2 style="margin-top:6px">《算法导论》中文版 · 20 个单元精讲</h2>
              <p class="muted small" style="margin:5px 0 0">按课程进度表 1–20 重组：基础三招、分治、贪心、DP 5 讲、图 6 讲、近似 4 讲。每单元有章节对照、证明直觉、教材式例题、考场陷阱与联动加练。</p>
            </div>
            <div class="row">
              <span class="pill forest">${tbDoneCount()} / ${TEXTBOOK.length}</span>
              <a class="btn primary small" href="#/textbook">进入精讲</a>
            </div>
          </div>
          <div class="map-mini" style="margin-top:12px">
            ${["基础 1–5", "DP 6–10", "图 11–16", "近似 17–20"].map(x => `<span class="pill ghost">${x}</span>`).join("")}
            <a class="map-chip core" href="#/textbook/u1">从第 1 单元开始</a>
          </div>
        </div>
        <div class="card pad" style="margin-top:14px">
          <div class="between"><div><span class="eyebrow">Source library</span><h2 style="margin-top:6px">原始资料索引</h2><p class="muted small" style="margin:4px 0 0">网页里的题面、答案和图示都来自这些文件。需要看原始排版时可直接打开 PDF（相对路径，保持文件夹结构不变即可）。</p></div></div>
          <div class="stack" style="margin-top:14px">
            <details>
              <summary style="cursor:pointer;font-size:.8rem;font-weight:650">讲义 PDF · 基础 / 贪心 / DP / 图 / 近似</summary>
              <div class="map-mini">
                <a class="map-chip pdf-link" target="_blank" rel="noopener" href="../0a_ram-model.pdf">0a · RAM</a>
                <a class="map-chip pdf-link" target="_blank" rel="noopener" href="../0b_worst-case.pdf">0b · 最坏情况</a>
                <a class="map-chip pdf-link" target="_blank" rel="noopener" href="../0c_three-basic.pdf">0c · 三基本</a>
                <a class="map-chip pdf-link" target="_blank" rel="noopener" href="../0d_d-and-c.pdf">0d · 分治</a>
                <a class="map-chip pdf-link" target="_blank" rel="noopener" href="../0e_disj-intv.pdf">0e · 不相交区间</a>
                <a class="map-chip pdf-link" target="_blank" rel="noopener" href="../0f_mst.pdf">0f · MST</a>
                <a class="map-chip pdf-link" target="_blank" rel="noopener" href="../0g_huffman.pdf">0g · Huffman</a>
                <a class="map-chip pdf-link" target="_blank" rel="noopener" href="../0h_pitfall.pdf">0h · DP1</a>
                <a class="map-chip pdf-link" target="_blank" rel="noopener" href="../0i_rodcut.pdf">0i · Rod</a>
                <a class="map-chip pdf-link" target="_blank" rel="noopener" href="../0j_dependency.pdf">0j · 依赖</a>
                <a class="map-chip pdf-link" target="_blank" rel="noopener" href="../0k_lcs.pdf">0k · LCS</a>
                <a class="map-chip pdf-link" target="_blank" rel="noopener" href="../0k2_dp-bst.pdf">0k2 · Optimal BST</a>
                <a class="map-chip pdf-link" target="_blank" rel="noopener" href="../0l_dfs.pdf">0l · DFS</a>
                <a class="map-chip pdf-link" target="_blank" rel="noopener" href="../0m_scc.pdf">0m · SCC</a>
                <a class="map-chip pdf-link" target="_blank" rel="noopener" href="../0n_dijkstra.pdf">0n · Dijkstra</a>
                <a class="map-chip pdf-link" target="_blank" rel="noopener" href="../0o_bellman_ford.pdf">0o · Bellman–Ford</a>
                <a class="map-chip pdf-link" target="_blank" rel="noopener" href="../0o2_maxflow.pdf">0o2 · Max Flow</a>
                <a class="map-chip pdf-link" target="_blank" rel="noopener" href="../0p2_apsp-johnson.pdf">0p2 · APSP/Johnson</a>
                <a class="map-chip pdf-link" target="_blank" rel="noopener" href="../0q_vc-cnf.pdf">0q · VC/CNF</a>
                <a class="map-chip pdf-link" target="_blank" rel="noopener" href="../0r_travel.pdf">0r · TSP</a>
                <a class="map-chip pdf-link" target="_blank" rel="noopener" href="../0s_sc.pdf">0s · Set Cover</a>
                <a class="map-chip pdf-link" target="_blank" rel="noopener" href="../0t_kcenter.pdf">0t · k-Center</a>
              </div>
            </details>
            <details>
              <summary style="cursor:pointer;font-size:.8rem;font-weight:650">习题 PDF · Regular 8–13 + Special 8–14</summary>
              <div class="map-mini">
                <a class="map-chip pdf-link" target="_blank" rel="noopener" href="../ex-08.pdf">RE8</a>
                <a class="map-chip pdf-link" target="_blank" rel="noopener" href="../ex-09.pdf">RE9</a>
                <a class="map-chip pdf-link" target="_blank" rel="noopener" href="../ex-10.pdf">RE10</a>
                <a class="map-chip pdf-link" target="_blank" rel="noopener" href="../ex-11.pdf">RE11</a>
                <a class="map-chip pdf-link" target="_blank" rel="noopener" href="../ex-12.pdf">RE12</a>
                <a class="map-chip pdf-link" target="_blank" rel="noopener" href="../ex-13.pdf">RE13</a>
                <a class="map-chip pdf-link" target="_blank" rel="noopener" href="../sp-ex8.pdf">SP8</a>
                <a class="map-chip pdf-link" target="_blank" rel="noopener" href="../sp-ex9.pdf">SP9</a>
                <a class="map-chip pdf-link" target="_blank" rel="noopener" href="../sp-ex-10.pdf">SP10</a>
                <a class="map-chip pdf-link" target="_blank" rel="noopener" href="../sp-ex-11.pdf">SP11</a>
                <a class="map-chip pdf-link" target="_blank" rel="noopener" href="../sp-ex-12.pdf">SP12</a>
                <a class="map-chip pdf-link" target="_blank" rel="noopener" href="../sp-ex-13.pdf">SP13</a>
                <a class="map-chip pdf-link" target="_blank" rel="noopener" href="../sp-ex-14.pdf">SP14</a>
                <a class="map-chip pdf-link" target="_blank" rel="noopener" href="../sp-ex10b.pdf">SP10b · Max Flow</a>
                <a class="map-chip pdf-link" target="_blank" rel="noopener" href="../ex9b-sol.pdf">RE9b · Max Flow</a>
              </div>
            </details>
          </div>
        </div>
      </section>
    `;
  }

  function afterDashboard() {
    // All dashboard actions are anchors; no JS needed.
  }

  // ---------------------------------------------------------------- map
  function renderMap() {
    const nodes = [
      { id: "pre", x: 26, y: 160, w: 150, h: 48, t: "先修底座", s: "BST · DP · 图" },
      { id: "bst", x: 220, y: 34, w: 156, h: 48, t: "Optimal BST", s: "区间 DP" },
      { id: "dfs", x: 220, y: 160, w: 156, h: 48, t: "DFS", s: "白路径定理" },
      { id: "scc", x: 416, y: 160, w: 156, h: 48, t: "SCC", s: "缩点 / DAG" },
      { id: "dijkstra", x: 220, y: 286, w: 156, h: 48, t: "Dijkstra", s: "非负权 SSSP" },
      { id: "bellman", x: 416, y: 286, w: 156, h: 48, t: "Bellman–Ford", s: "负权 / 负环" },
      { id: "apsp", x: 612, y: 286, w: 156, h: 48, t: "APSP · Johnson", s: "重赋权" },
      { id: "maxflow", x: 612, y: 160, w: 156, h: 48, t: "最大流", s: "残量 / 最小割" },
      { id: "np", x: 612, y: 34, w: 156, h: 48, t: "NP-hard", s: "归约 / 近似比" },
      { id: "tsp", x: 816, y: 22, w: 160, h: 48, t: "TSP", s: "MST + 抄近路" },
      { id: "setcover", x: 816, y: 160, w: 160, h: 48, t: "Set Cover", s: "贪心 / 对数比" },
      { id: "kcenter", x: 816, y: 298, w: 160, h: 48, t: "k-Center", s: "最远点优先" }
    ];
    const n = Object.fromEntries(nodes.map(x => [x.id, x]));
    const nodeHTML = nodes.map(x => {
      const done = state.completed[x.id];
      return `<a href="#/module/${x.id}" class="map-node ${done ? "done" : ""}" data-id="${x.id}">
        <rect x="${x.x}" y="${x.y}" width="${x.w}" height="${x.h}" rx="12" class="${done ? "done" : ""}"></rect>
        <text x="${x.x + 13}" y="${x.y + 20}">${esc(x.t)}</text>
        <text class="sub" x="${x.x + 13}" y="${x.y + 35}">${esc(x.s)}</text>
        ${done ? `<circle cx="${x.x + x.w - 13}" cy="${x.y + 13}" r="4" fill="var(--forest)"></circle>` : ""}
      </a>`;
    }).join("");
    const line = (a, b, opts = {}) => {
      const A = n[a], B = n[b];
      const x1 = A.x + A.w, y1 = A.y + A.h / 2;
      const x2 = B.x, y2 = B.y + B.h / 2;
      const cls = opts.dash ? "map-line dash" : "map-line";
      return `<path class="${cls}" d="M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}"></path>`;
    };
    const down = (a, b) => {
      const A = n[a], B = n[b];
      const x1 = A.x + A.w / 2, y1 = A.y + A.h;
      const x2 = B.x + B.w / 2, y2 = B.y;
      return `<path class="map-line dash" d="M ${x1} ${y1} C ${x1} ${(y1 + y2) / 2}, ${x2} ${(y1 + y2) / 2}, ${x2} ${y2}"></path>`;
    };
    return `
      <div class="between">
        <div><span class="eyebrow">Dependency map</span><h1 style="font-size:clamp(2rem,3vw,2.8rem);margin-top:8px">知识地图</h1>
        <p class="lede">箭头表示“后面的证明会直接用到”。点击任意节点进入模块；绿色勾表示已标记掌握。</p></div>
        <a class="btn primary" href="#/module/pre">从先修开始</a>
      </div>
      <div class="section">
        <div class="map-board">
          <svg viewBox="0 0 1010 370" role="img" aria-label="CSCI3160 知识依赖图">
            <defs>
              <marker id="map-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--line-strong)"></path></marker>
              <marker id="map-arrow-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--amber)"></path></marker>
            </defs>
            ${line("pre", "bst")}
            ${line("pre", "dfs")}
            ${line("dfs", "scc")}
            ${line("dfs", "dijkstra")}
            ${line("dijkstra", "bellman")}
            ${line("bellman", "apsp")}
            ${line("scc", "maxflow", { dash: true })}
            ${line("np", "tsp")}
            ${line("np", "setcover")}
            ${line("np", "kcenter")}
            ${down("bst", "dijkstra")}
            ${down("bellman", "maxflow")}
            ${nodeHTML}
          </svg>
        </div>
        <div class="map-legend">
          <span><i class="legend-dot" style="background:var(--forest)"></i>已掌握</span>
          <span><i class="legend-dot" style="background:var(--line-strong)"></i>尚未完成</span>
          <span>虚线：弱依赖 / 同一证明工具箱</span>
        </div>
      </div>
      <section class="section">
        <div class="section-head"><div><span class="eyebrow">What connects to what</span><h2>三条主线</h2></div></div>
        <div class="phase-grid">
          <div class="phase-card"><div class="ph">LINE A</div><h3>DP 主线</h3><p>先修的 Rod Cutting / LCS → Optimal BST。所有区间 DP 都有同样的“长度递增 + 记录选择”结构。</p><div class="phase-links"><a href="#/module/pre">DP 五步</a><a href="#/module/bst">Optimal BST</a></div></div>
          <div class="phase-card"><div class="ph">LINE B</div><h3>图主线</h3><p>DFS → SCC → 缩点 DAG；DFS → Dijkstra → Bellman–Ford → Johnson；最大流独立但同样用残量图。</p><div class="phase-links"><a href="#/module/dfs">DFS</a><a href="#/module/scc">SCC</a><a href="#/module/dijkstra">Dijkstra</a><a href="#/module/bellman">BF</a><a href="#/module/apsp">Johnson</a></div></div>
          <div class="phase-card"><div class="ph">LINE C</div><h3>近似主线</h3><p>NP-hard + 归约 → VC / MAX-3SAT → TSP → Set Cover / Hitting Set → k-Center。每个算法都对应一个下界。</p><div class="phase-links"><a href="#/module/np">NP-hard</a><a href="#/module/tsp">TSP</a><a href="#/module/setcover">Set Cover</a><a href="#/module/kcenter">k-Center</a></div></div>
        </div>
      </section>
    `;
  }

  // ---------------------------------------------------------------- module page
  function moduleTabs(m, active) {
    const exCount = EXERCISES.filter(e => e.module === m.id).length;
    const tabs = [
      ["lecture", "核心讲义", ""],
      ["lab", "互动实验室", ""],
      ["quiz", "随堂测验", m.quiz.length],
      ["exercises", "相关习题", exCount]
    ];
    return `<div class="tabs" role="tablist">${tabs.map(([id, label, count]) => `
      <a class="tab ${active === id ? "active" : ""}" href="#/module/${m.id}/${id}" role="tab">${label}${count ? `<span class="count">${count}</span>` : ""}</a>`).join("")}</div>`;
  }

  function renderModule(m, tab) {
    if (!["lecture", "lab", "quiz", "exercises"].includes(tab)) tab = "lecture";
    const done = !!state.completed[m.id];
    const quiz = state.quiz[m.id];
    const formulas = FORMULAS.filter(f => f.module === m.id);
    const moduleEx = EXERCISES.filter(e => e.module === m.id);

    let body = "";
    if (tab === "lecture") body = renderLecture(m, formulas);
    else if (tab === "lab") body = renderLab(m);
    else if (tab === "quiz") body = `<div id="quiz-root" class="quiz-shell"></div>`;
    else body = `<div class="ex-grid">${moduleEx.map(e => exerciseCardHTML(e, { compact: true })).join("") || `<div class="empty-state"><div class="big">∅</div><p>${m.id === "dfs" ? "DFS 没有单独的 Regular/Special 题集；它的证明练习在 SCC 套题（RE8、SP9）中。" : m.id === "maxflow" ? "原始 Regular/Special 题集没有最大流题。用本讲的随堂测和增广实验巩固，考试重点是把残量图、最小割和 O(EM) 讲清。" : "这一讲没有配套原始习题。用随堂测验和互动实验巩固。"}</p></div>`}</div>`;

    return `
      <div class="module-head">
        <div>
          <div class="module-kicker">
            <span class="module-index">${m.index}</span>
            ${m.tags.map(t => `<span class="pill ghost">${esc(t)}</span>`).join("")}
          </div>
          <h1>${esc(m.title)}</h1>
          <div class="en">${esc(m.en)}</div>
          <p class="lede" style="margin-top:8px">${esc(m.blurb)}</p>
          <div class="module-meta"><span>⏱ ${esc(m.duration)}</span><span>🎯 ${esc(m.examWeight)}</span><span>${moduleEx.length} 道配套题</span></div>
        </div>
        <div class="module-side">
          <div class="mastery-box">
            <div class="row"><span>我的掌握度</span><strong>${done ? "100%" : quiz ? Math.round(quiz.score / quiz.total * 100) + "%" : "—"}</strong></div>
            <div class="progress-track"><div class="progress-fill" style="width:${done ? 100 : quiz ? Math.round(quiz.score / quiz.total * 100) : 0}%"></div></div>
            <button class="btn small ${done ? "" : "primary"}" id="mark-module" data-id="${m.id}" style="width:100%;margin-top:10px">${done ? "取消“已掌握”" : "标记为已掌握"}</button>
          </div>
          <a class="btn small" href="#/exercises?module=${m.id}" data-ex-module="${m.id}">只看这一讲的题</a>
        </div>
      </div>
      ${moduleTabs(m, tab)}
      <div id="module-body">${body}</div>
      <div class="between" style="margin-top:26px;padding-top:16px;border-top:1px solid var(--line)">
        <a class="btn small" href="#/module/${m.id}/quiz">去随堂测</a>
        <a class="btn small primary" href="#/exercises">打开完整习题库 →</a>
      </div>
    `;
  }

  function renderLecture(m, formulas) {
    return `<div class="lecture-grid">
      <div class="lecture-body">
        ${m.concepts.map(c => `<article class="card concept-card"><h2>${esc(c.title)}</h2>${c.html}</article>`).join("")}
      </div>
      <aside class="lecture-aside">
        ${(TB_FOR_MODULE[m.id] || []).length ? `<div class="card prereq-card">
          <h4>CLRS 教材精讲</h4>
          <div class="map-mini">${(TB_FOR_MODULE[m.id] || []).map(id => { const t = TEXTBOOK.find(x => x.id === id); return t ? `<a class="map-chip" href="#/textbook/${id}">${t.num}. ${esc(t.title)}</a>` : ""; }).join("")}</div>
        </div>` : ""}
        <div class="card prereq-card">
          <h4>先修检查</h4>
          <div class="prereq-list">${m.prerequisites.length ? m.prerequisites.map(p => `<div class="prereq-item">${esc(p)}</div>`).join("") : `<div class="prereq-item">这是整条路线的最底层，直接开始。</div>`}</div>
        </div>
        <div class="card prereq-card">
          <h4>本讲公式</h4>
          <div class="stack" style="gap:9px">${formulas.map(f => `<div class="formula-card"><div class="fc-label">${esc(f.label)}</div><div class="fc-body math">${f.body}</div><div class="fc-note">${f.note}</div></div>`).join("")}</div>
        </div>
        <div class="card prereq-card">
          <h4>易错清单</h4>
          <div class="pitfall-list">${m.pitfalls.map((p, i) => `<div class="pitfall-item"><span class="n">${String(i + 1).padStart(2, "0")}</span><span>${esc(p)}</span></div>`).join("")}</div>
        </div>
        <div class="takeaway"><h4>One-sentence takeaway</h4><p>${esc(m.takeaway)}</p></div>
      </aside>
    </div>`;
  }

  function renderLab(m) {
    return `<div class="stack">
      <div class="card pad" style="background:linear-gradient(120deg,color-mix(in srgb,var(--forest-soft) 55%,var(--card)),var(--card));border-color:color-mix(in srgb,var(--forest) 22%,var(--line))">
        <div class="between">
          <div><span class="eyebrow">Interactive lab</span><h2 style="margin-top:6px">把算法跑一遍，而不是盯着伪代码</h2>
          <p class="muted small" style="margin:5px 0 0">拖动 / 点击 / 单步，观察颜色、表格和距离如何变化。所有计算都在浏览器本地完成。</p></div>
          <span class="pill forest">${esc(m.title)}</span>
        </div>
      </div>
      <div id="demo-root" data-demo="${esc(m.demo)}"></div>
    </div>`;
  }

  function afterModule(m, tab) {
    const mark = $("#mark-module");
    if (mark) mark.addEventListener("click", () => {
      state.completed[m.id] = !state.completed[m.id];
      saveState(); renderRoute();
      toast(state.completed[m.id] ? "已标记为掌握" : "已取消掌握标记");
    });
    if (tab === "lab") {
      const root = $("#demo-root");
      if (root && window.DEMOS && window.DEMOS[m.demo]) {
        const cleanup = window.DEMOS[m.demo](root, { toast, state });
        if (typeof cleanup === "function") activeCleanup.push(cleanup);
      }
    }
    if (tab === "quiz") initQuiz(m);
  }

  // ---------------------------------------------------------------- exercise cards / bank
  function difficultyDots(d) {
    return `<span class="tiny muted" title="难度">${"●".repeat(d)}${"○".repeat(3 - d)}</span>`;
  }
  function exerciseCardHTML(e, opts = {}) {
    const isExtra = !!e.extra;
    const isDone = !!(isExtra ? state.extraDone[e.id] : state.exercisesDone[e.id]);
    const isMarked = !!state.bookmarks[e.id];
    return `<article class="ex-card ${isDone ? "done" : ""}" data-ex-id="${e.id}" data-extra="${isExtra ? "1" : "0"}" id="ex-${e.id}">
      <div class="ex-top">
        <span class="ex-source">${esc(e.source)} · ${e.num}</span>
        ${e.points ? `<span class="pill amber tiny">${esc(e.points)}</span>` : ""}
        ${difficultyDots(e.difficulty)}
        ${e.figure ? `<span class="pill ghost tiny">含图</span>` : ""}
        <span class="pill ghost tiny" style="margin-left:auto">${esc(e.topic)}</span>
      </div>
      <div class="ex-title">${esc(e.title)}</div>
      <div class="ex-prompt">${esc(e.prompt)}</div>
      ${e.figure ? `<div class="ex-figure"><img src="${esc(e.figure)}" alt="${esc(e.title)} 原题图" loading="lazy" class="js-figure" data-src="${esc(e.figure)}" data-title="${esc(e.title)}"></div>` : ""}
      <div class="solution" hidden>
        <div class="sol-label">一句话思路</div>
        <div>${esc(e.solution)}</div>
        ${DETAILS[e.id] ? `<div class="detail-block"><div class="sol-label">完整步骤 · 讲人话版</div>${DETAILS[e.id]}</div>` : ""}
      </div>
      <div class="ex-foot">
        <button class="btn small js-sol" type="button">展开详解</button>
        <span class="spacer"></span>
        <button class="icon-action js-bookmark ${isMarked ? "on" : ""}" type="button" title="收藏" aria-label="收藏" data-id="${e.id}">${isMarked ? "★" : "☆"}</button>
        <button class="icon-action js-done ${isDone ? "on" : ""}" type="button" title="标记完成" aria-label="标记完成" data-id="${e.id}" data-extra="${isExtra ? "1" : "0"}">${isDone ? "✓" : "○"}</button>
      </div>
    </article>`;
  }

  function renderExerciseBank(focusId) {
    const sources = [...new Set(EXERCISES.map(e => e.source))];
    const modules = MODULES.filter(m => EXERCISES.some(e => e.module === m.id));
    const f = ui.ex;
    const filtered = filterExercises();
    return `
      <div class="between">
        <div><span class="eyebrow">76 original problems</span><h1 style="font-size:clamp(2rem,3vw,2.8rem);margin-top:8px">习题库</h1>
        <p class="lede">Regular Exercise 8–13 + Special Exercise 8–14 + 新增 RE9b/SP10b 最大流，共 ${EXERCISES.length} 道；另有 3 套共 21 道按 <em>mid-sol.pdf</em> 题型与难度编写的期中风格加练。全部附有中文题意、解题思路与关键计算；图题保留原题页。</p></div>
        <div class="row">
          <span class="pill forest">已完成 ${doneCount()} / ${EXERCISES.length}</span>
          <a class="btn small" href="#/extra">3 套加练 21 题</a>
          <a class="btn small" href="#/wrong">看错题本</a>
        </div>
      </div>
      <div class="section" style="margin-top:20px">
        <div class="ex-toolbar">
          <input class="input" id="ex-search" type="search" placeholder="搜题号、关键词、算法…" value="${esc(f.q)}" />
          <select class="select" id="ex-module">
            <option value="all">全部模块</option>
            ${modules.map(m => `<option value="${m.id}" ${f.module === m.id ? "selected" : ""}>${m.index} ${esc(m.title)}</option>`).join("")}
          </select>
          <select class="select" id="ex-source">
            <option value="all">全部题集</option>
            ${sources.map(s => `<option value="${s}" ${f.source === s ? "selected" : ""}>${s}</option>`).join("")}
          </select>
          <select class="select" id="ex-diff">
            <option value="all">全部难度</option>
            <option value="1" ${f.diff === "1" ? "selected" : ""}>★ 基础</option>
            <option value="2" ${f.diff === "2" ? "selected" : ""}>★★ 核心</option>
            <option value="3" ${f.diff === "3" ? "selected" : ""}>★★★ 挑战</option>
          </select>
          <select class="select" id="ex-status">
            <option value="all">全部状态</option>
            <option value="todo" ${f.status === "todo" ? "selected" : ""}>未完成</option>
            <option value="done" ${f.status === "done" ? "selected" : ""}>已完成</option>
            <option value="marked" ${f.status === "marked" ? "selected" : ""}>已收藏</option>
          </select>
          <span class="tiny muted" id="ex-result-count">${filtered.length} 道</span>
        </div>
        <div class="ex-grid" id="ex-grid">
          ${filtered.length ? filtered.map(e => exerciseCardHTML(e)).join("") : `<div class="empty-state"><div class="big">∅</div><p>没有符合条件的题。试试清空搜索或切换筛选。</p><button class="btn small" id="clear-filters" type="button">清空筛选</button></div>`}
        </div>
      </div>`;
  }

  function filterExercises() {
    const f = ui.ex;
    const q = f.q.trim().toLowerCase();
    return EXERCISES.filter(e => {
      if (f.module !== "all" && e.module !== f.module) return false;
      if (f.source !== "all" && e.source !== f.source) return false;
      if (f.diff !== "all" && String(e.difficulty) !== f.diff) return false;
      if (f.status === "todo" && state.exercisesDone[e.id]) return false;
      if (f.status === "done" && !state.exercisesDone[e.id]) return false;
      if (f.status === "marked" && !state.bookmarks[e.id]) return false;
      if (q) {
        const hay = [e.id, e.source, e.title, e.prompt, e.solution, e.topic].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function afterExerciseBank(focusId) {
    const search = $("#ex-search");
    let t = null;
    if (search) search.addEventListener("input", () => {
      clearTimeout(t);
      t = setTimeout(() => { ui.ex.q = search.value; refreshExerciseGrid(); }, 120);
    });
    ["ex-module", "ex-source", "ex-diff", "ex-status"].forEach(id => {
      const el = $("#" + id); if (!el) return;
      el.addEventListener("change", () => {
        ui.ex[id.replace("ex-", "")] = el.value;
        refreshExerciseGrid();
      });
    });
    const clear = $("#clear-filters");
    if (clear) clear.addEventListener("click", () => {
      ui.ex = { q: "", module: "all", source: "all", diff: "all", status: "all" };
      renderRoute();
    });
    if (focusId) {
      const card = document.getElementById("ex-" + focusId);
      if (card) {
        const sol = $(".solution", card); if (sol) sol.hidden = false;
        const btn = $(".js-sol", card); if (btn) btn.textContent = "收起详解";
        card.scrollIntoView({ block: "center", behavior: "smooth" });
        card.style.borderColor = "var(--coral)";
        setTimeout(() => { card.style.borderColor = ""; }, 2200);
      }
    }
  }

  function refreshExerciseGrid() {
    const grid = $("#ex-grid");
    if (!grid) return;
    const filtered = filterExercises();
    grid.innerHTML = filtered.length ? filtered.map(e => exerciseCardHTML(e)).join("") : `<div class="empty-state"><div class="big">∅</div><p>没有符合条件的题。</p></div>`;
    const count = $("#ex-result-count");
    if (count) count.textContent = filtered.length + " 道";
  }

  // ---------------------------------------------------------------- quiz
  function initQuiz(m) {
    quizSession = { moduleId: m.id, i: 0, answers: Array(m.quiz.length).fill(null), submitted: Array(m.quiz.length).fill(false), score: 0, complete: false };
    renderQuizCurrent();
  }

  function quizPips(m, s) {
    return s.answers.map((_, i) => {
      let cls = "qpip";
      if (i === s.i) cls += " current";
      else if (s.submitted[i]) cls += s.answers[i] === m.quiz[i].answer ? " done" : " wrong";
      return `<span class="${cls}"></span>`;
    }).join("");
  }

  function renderQuizCurrent() {
    const root = $("#quiz-root");
    if (!root || !quizSession) return;
    const m = MODULE_MAP[quizSession.moduleId];
    const s = quizSession;
    if (s.complete) {
      const pct = Math.round(s.score / m.quiz.length * 100);
      root.innerHTML = `<div class="card quiz-result">
        <div class="eyebrow" style="justify-content:center">Quiz complete</div>
        <div class="score-big">${s.score} / ${m.quiz.length}</div>
        <p>${pct >= 80 ? "这一讲已经很稳，可以去刷相关习题。" : pct >= 60 ? "基本概念有了，建议回看错题解析，再做一遍。" : "先别急着刷题，回到讲义把公式和证明链再过一遍。"}</p>
        <div class="row" style="justify-content:center;margin-top:16px">
          <button class="btn primary" id="quiz-retry" type="button">再测一次</button>
          <a class="btn" href="#/module/${m.id}/exercises">去做相关习题</a>
          <a class="btn" href="#/module/${m.id}">回看讲义</a>
        </div>
        <p class="tiny muted" style="margin-top:18px">成绩已保存在本浏览器。答错的题已加入错题本。</p>
      </div>`;
      $("#quiz-retry").addEventListener("click", () => initQuiz(m));
      return;
    }
    const q = m.quiz[s.i];
    const submitted = s.submitted[s.i];
    root.innerHTML = `<div class="quiz-head">
        <div><span class="eyebrow">Checkpoint</span><h2 style="margin-top:5px">${esc(m.title)} · 随堂测</h2></div>
        <div class="row"><span class="pill forest">${s.i + 1} / ${m.quiz.length}</span><div class="quiz-progress">${quizPips(m, s)}</div></div>
      </div>
      <div class="card question-card">
        <div class="q-num">QUESTION ${String(s.i + 1).padStart(2, "0")}</div>
        <div class="q-text">${q.q}</div>
        <div class="q-options" id="q-options">
          ${q.options.map((opt, oi) => {
            let cls = "q-option";
            if (submitted) {
              if (oi === q.answer) cls += " correct";
              else if (oi === s.answers[s.i]) cls += " wrong";
            } else if (oi === s.answers[s.i]) cls += " selected";
            return `<button class="${cls}" type="button" data-opt="${oi}" ${submitted ? "disabled" : ""}><span class="key">${String.fromCharCode(65 + oi)}</span><span>${opt}</span></button>`;
          }).join("")}
        </div>
        ${submitted ? `<div class="q-feedback ${s.answers[s.i] === q.answer ? "good" : "bad"}"><strong>${s.answers[s.i] === q.answer ? "✓ 正确" : "✗ 再想一步"}</strong> · ${q.why}</div>` : ""}
        <div class="q-actions">
          <button class="btn small ghost" id="quiz-back" type="button" ${s.i === 0 ? "disabled" : ""}>← 上一题</button>
          <div class="row">
            ${!submitted ? `<button class="btn primary" id="quiz-submit" type="button" ${s.answers[s.i] == null ? "disabled" : ""}>提交</button>` :
              `<button class="btn primary" id="quiz-next" type="button">${s.i === m.quiz.length - 1 ? "查看结果" : "下一题 →"}</button>`}
          </div>
        </div>
      </div>`;
    $$("#q-options .q-option").forEach(b => b.addEventListener("click", () => {
      if (s.submitted[s.i]) return;
      s.answers[s.i] = Number(b.dataset.opt);
      $$("#q-options .q-option").forEach(x => x.classList.toggle("selected", Number(x.dataset.opt) === s.answers[s.i]));
      $("#quiz-submit").disabled = false;
    }));
    const submit = $("#quiz-submit");
    if (submit) submit.addEventListener("click", () => {
      if (s.answers[s.i] == null) return;
      s.submitted[s.i] = true;
      const correct = s.answers[s.i] === q.answer;
      if (correct) {
        s.score++;
        delete state.wrong[`${m.id}:${s.i}`];
      } else {
        state.wrong[`${m.id}:${s.i}`] = { module: m.id, index: s.i, date: Date.now() };
      }
      saveState(); syncChrome(); renderQuizCurrent();
    });
    const next = $("#quiz-next");
    if (next) next.addEventListener("click", () => {
      if (s.i === m.quiz.length - 1) {
        s.complete = true;
        state.quiz[m.id] = { score: s.score, total: m.quiz.length, date: Date.now() };
        if (s.score / m.quiz.length >= 0.75) state.completed[m.id] = true;
        saveState(); syncChrome(); renderQuizCurrent();
      } else { s.i++; renderQuizCurrent(); }
    });
    const back = $("#quiz-back");
    if (back) back.addEventListener("click", () => { if (s.i > 0) { s.i--; renderQuizCurrent(); } });
  }

  // ---------------------------------------------------------------- formulas
  function renderFormulas() {
    const groups = MODULES.filter(m => FORMULAS.some(f => f.module === m.id));
    return `
      <div class="between">
        <div><span class="eyebrow">Formula sheet</span><h1 style="font-size:clamp(2rem,3vw,2.8rem);margin-top:8px">公式速查</h1>
        <p class="lede">考前最后 20 分钟看这里。每条公式都配一句“什么时候用 / 最容易错在哪”。</p></div>
        <button class="btn small" id="print-formulas" type="button">打印 / 存 PDF</button>
      </div>
      <div class="row" style="margin:18px 0 4px">
        ${groups.map(m => `<button class="pill ghost" type="button" data-jump="formula-${m.id}">${m.index} ${esc(m.title)}</button>`).join("")}
      </div>
      <div class="section" style="margin-top:14px">
        ${groups.map(m => `<div id="formula-${m.id}" style="margin-bottom:26px">
          <div class="section-head"><div><span class="eyebrow">${m.index}</span><h2>${esc(m.title)}</h2></div></div>
          <div class="formula-grid">
            ${FORMULAS.filter(f => f.module === m.id).map(f => `<div class="card formula-block">
              <h3>${esc(f.title)}</h3>
              <div class="math-block" style="margin:9px 0 8px">${f.body}</div>
              <div class="note">${f.note}</div>
            </div>`).join("")}
          </div>
        </div>`).join("")}
      </div>`;
  }

  // ---------------------------------------------------------------- wrong book

  // ---------------------------------------------------------------- midterm-style extra set
  function renderExtra(setId) {
    const activeSet = EXTRA_SETS.find(x => x.id === setId) || EXTRA_SETS[0];
    const sid = activeSet.id;
    const list = EXTRA.filter(e => setOf(e) === sid);
    const done = extraDoneCount(sid);
    const total = list.length;
    const structure = list.map(e => `<span class="pill ghost">${esc(e.points)} · ${esc(e.topic)}</span>`).join("");
    return `
      <div class="between">
        <div>
          <span class="eyebrow">Midterm style · extra practice</span>
          <h1 style="font-size:clamp(2rem,3vw,2.8rem);margin-top:8px">期中风格加练</h1>
          <p class="lede">三套同题型、同难度的加练：A 套对标 mid-sol 原始结构；B 套把 SCC、Optimal BST、最短路、最大流、Johnson 组合起来；C 套把流、TSP、Set Cover、k-Center 与归约组合起来。题目不是原题复制。</p>
        </div>
        <div class="row">
          <span class="pill forest" id="extra-progress" data-set="${sid}" data-total="${total}">已完成 ${done} / ${total}</span>
          <a class="btn small" href="#/exercises">回到原始 76 题</a>
          <a class="btn small pdf-link" target="_blank" rel="noopener" href="../../mid-sol.pdf">原始 mid-sol.pdf</a>
        </div>
      </div>

      <div class="tabs" role="tablist">
        ${EXTRA_SETS.map(x => `<a class="tab ${x.id === sid ? "active" : ""}" href="#/extra/${x.id}" role="tab">${esc(x.label)}<span class="count">${EXTRA.filter(e => setOf(e) === x.id).length}</span></a>`).join("")}
      </div>

      <div class="card pad" style="background:linear-gradient(120deg,color-mix(in srgb,var(--amber-soft) 55%,var(--card)),var(--card));border-color:color-mix(in srgb,var(--amber) 32%,var(--line))">
        <div class="between">
          <div>
            <span class="eyebrow">Set ${esc(sid)} · ${esc(activeSet.short || "")}</span>
            <h3 style="margin:7px 0 5px">${esc(activeSet.title)} · 建议闭卷 45 分钟</h3>
            <p class="muted small" style="margin:0">${esc(activeSet.desc || "")}</p>
          </div>
          <div class="row"><span class="pill amber">7 题 · 100%</span><a class="btn small" href="#/formulas">公式速查</a></div>
        </div>
        <div class="map-mini" style="margin-top:12px">${structure}</div>
      </div>

      <div class="ex-grid section" style="margin-top:18px">
        ${list.map(e => exerciseCardHTML(e)).join("")}
      </div>

      <div class="card pad" style="margin-top:18px">
        <div class="between">
          <div><h3 style="font-size:1rem">本套怎么用</h3><p class="muted small" style="margin:4px 0 0">先按分值分配时间：20% 题约 9 分钟，15% 题约 7 分钟，10% 题约 4–5 分钟。证明题写清“构造 → 双向/归纳 → 复杂度”；手跑题写出表格与关键中间量。</p>
          <div class="map-mini" style="margin-top:8px">${({A:["u1","u2","u3","u4","u5","u6","u7"],B:["u12","u10","u11","u13","u14","u16","u15"],C:["u16","u18","u19","u20","u17"]}[sid] || []).map(id => { const t = TEXTBOOK.find(x => x.id === id); return t ? `<a class="map-chip" href="#/textbook/${id}">${t.num}. ${esc(t.title)}</a>` : ""; }).join("")}</div></div>
          <a class="btn small" href="#/extra/${sid === "A" ? "B" : sid === "B" ? "C" : "A"}">换一套 →</a>
        </div>
      </div>
    `;
  }


  // ---------------------------------------------------------------- textbook deep-read
  const tbUi = { q: "", part: "all", status: "all", open: new Set() };
  const TB_PARTS = ["基础", "DP", "图", "近似"];
  function tbDoneCount() { return TEXTBOOK.filter(x => state.textbookDone[x.id]).length; }
  function tbFiltered() {
    const q = tbUi.q.trim().toLowerCase();
    return TEXTBOOK.filter(x => {
      if (tbUi.part !== "all" && x.part !== tbUi.part) return false;
      if (tbUi.status === "todo" && state.textbookDone[x.id]) return false;
      if (tbUi.status === "done" && !state.textbookDone[x.id]) return false;
      if (q) {
        const hay = [x.title, x.en, x.summary, x.ref, x.tags.join(" "), stripHTML(x.body), x.example, x.pitfalls.join(" ")].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }
  function renderTextbook(unitId) {
    const done = tbDoneCount();
    const list = tbFiltered();
    const pct = Math.round(done / TEXTBOOK.length * 100);
    return `
      <div class="between">
        <div>
          <span class="eyebrow">CLRS · Chinese 3rd edition</span>
          <h1 style="font-size:clamp(2rem,3vw,2.8rem);margin-top:8px">CLRS 精讲</h1>
          <p class="lede">按课程进度表的 20 个单元重排，把《算法导论（第 3 版）》中文版的关键定义、定理、证明直觉和教材例题，压缩成可直接用于考试的深度笔记。每个单元都标了对应章节和联动加练。</p>
        </div>
        <div class="row">
          <span class="pill forest">${done} / ${TEXTBOOK.length} 已掌握</span>
          <button class="btn small" type="button" data-jump="clrs-exercises">原书习题 ${TB_EX.length}</button>
          <a class="btn small pdf-link" target="_blank" rel="noopener" href="../算法导论 第三版 中文-1.pdf">中文版 PDF</a>
          <a class="btn small" href="#/map">看知识地图</a>
        </div>
      </div>

      <div class="card pad" style="margin-top:18px">
        <div class="between">
          <div><h3 style="font-size:1rem">20 个课程单元 · 四大部分</h3><p class="muted small" style="margin:4px 0 0">基础 1–5 / DP 6–10 / 图 11–16 / 近似 17–20。展开卡片读精讲，点右上角标记掌握。</p></div>
          <div class="row"><span class="pill ghost">${pct}%</span><span class="pill ghost">CLRS 第 3 版中文</span></div>
        </div>
        <div class="progress-track" style="margin-top:12px"><div class="progress-fill" id="tb-progress-fill" style="width:${pct}%"></div></div>
        <div class="row" style="margin-top:12px">
          <input class="input" id="tb-search" type="search" placeholder="搜：白路径、Johnson、集合覆盖、交换论证…" value="${esc(tbUi.q)}" style="flex:1;min-width:200px">
          <select class="select" id="tb-part">
            <option value="all">全部部分</option>
            ${TB_PARTS.map(p => `<option value="${p}" ${tbUi.part === p ? "selected" : ""}>${p}</option>`).join("")}
          </select>
          <select class="select" id="tb-status">
            <option value="all">全部状态</option>
            <option value="todo" ${tbUi.status === "todo" ? "selected" : ""}>未掌握</option>
            <option value="done" ${tbUi.status === "done" ? "selected" : ""}>已掌握</option>
          </select>
          <button class="btn small" id="tb-clear" type="button">清空</button>
          <span class="tiny muted" id="tb-count">${list.length} 个单元</span>
        </div>
      </div>

      <div class="tb-grid section" style="margin-top:18px" id="tb-grid">
        ${list.length ? list.map(tbCardHTML).join("") : `<div class="empty-state"><div class="big">∅</div><p>没有符合条件的单元。</p></div>`}
      </div>

      <section class="section" id="clrs-exercises">
        <div class="section-head">
          <div><span class="eyebrow">Textbook exercises · worked solutions</span><h2>教材原题精讲</h2><p>从《算法导论》第 3 版章节习题中选出的 17 道，配中文题意、完整解答和对应单元。点击展开。</p></div>
          <span class="pill amber">${TB_EX.length} 道原书题</span>
        </div>
        <div class="clrs-ex-grid">
          ${TB_EX.map(x => `<details class="clrs-ex">
            <summary>
              <span class="clrs-ref">${esc(x.ref)}</span>
              <span class="clrs-title">${esc(x.title)}</span>
              <span class="clrs-unit">${(() => { const t = TEXTBOOK.find(u => u.id === x.unit); return t ? `单元 ${t.num}` : ""; })()}</span>
            </summary>
            <div class="clrs-ex-body">
              <div class="clrs-q"><span class="tb-label">题目</span>${esc(x.prompt)}</div>
              <div class="clrs-a"><span class="tb-label">讲解</span>${esc(x.solution)}</div>
              ${DETAILS[x.id] ? `<div class="clrs-a detail-block"><span class="tb-label">完整步骤</span>${DETAILS[x.id]}</div>` : ""}
              <a class="map-chip" href="#/textbook/${x.unit}">回到对应精讲 →</a>
            </div>
          </details>`).join("")}
        </div>
      </section>
    `;
  }

  function tbCardHTML(x) {
    const done = !!state.textbookDone[x.id];
    const open = tbUi.open.has(x.id);
    return `<article class="tb-card ${done ? "done" : ""}" id="tb-${x.id}" data-tb-id="${x.id}">
      <div class="tb-head">
        <div class="tb-num">${String(x.num).padStart(2, "0")}</div>
        <div class="tb-titlewrap">
          <div class="tb-meta"><span class="pill ghost">${esc(x.part)}</span><span class="tb-ref">${esc(x.ref)}</span></div>
          <h3>${esc(x.title)}</h3>
          <div class="tb-en">${esc(x.en)}</div>
          <p class="tb-summary">${esc(x.summary)}</p>
          <div class="map-mini" style="margin-top:7px">${x.tags.map(t => `<span class="pill ghost">${esc(t)}</span>`).join("")}</div>
        </div>
        <div class="tb-actions">
          <button class="icon-action js-tb-done ${done ? "on" : ""}" type="button" data-id="${x.id}" title="标记已掌握">${done ? "✓" : "○"}</button>
          <button class="btn small js-tb-toggle" type="button" data-id="${x.id}">${open ? "收起" : "展开精讲"}</button>
        </div>
      </div>
      <div class="tb-body" ${open ? "" : "hidden"}>
        <div class="tb-content">${x.body}</div>
        <div class="tb-example"><div class="tb-label">教材式例题 / 验算</div>${esc(x.example)}</div>
        <div class="tb-pitfalls"><div class="tb-label">考场陷阱</div><ul>${x.pitfalls.map(p => `<li>${esc(p)}</li>`).join("")}</ul></div>
        <div class="tb-related"><div class="tb-label">联动练习</div><div class="map-mini">${x.related.map(r => `<a class="map-chip" href="${r.href}">${esc(r.label)}</a>`).join("")}</div></div>
      </div>
    </article>`;
  }

  function afterTextbook(unitId) {
    const refresh = () => {
      $("#view").innerHTML = renderTextbook(unitId || "");
      afterTextbook(unitId || "");
    };
    const search = $("#tb-search");
    if (search) {
      let t = null;
      search.addEventListener("input", () => {
        clearTimeout(t);
        t = setTimeout(() => { tbUi.q = search.value; refresh(); }, 140);
      });
    }
    const part = $("#tb-part");
    if (part) part.addEventListener("change", () => { tbUi.part = part.value; refresh(); });
    const status = $("#tb-status");
    if (status) status.addEventListener("change", () => { tbUi.status = status.value; refresh(); });
    const clear = $("#tb-clear");
    if (clear) clear.addEventListener("click", () => { tbUi.q = ""; tbUi.part = "all"; tbUi.status = "all"; refresh(); });
    $$(".js-tb-toggle").forEach(b => b.addEventListener("click", () => {
      const id = b.dataset.id;
      if (tbUi.open.has(id)) tbUi.open.delete(id); else tbUi.open.add(id);
      const card = document.getElementById("tb-" + id);
      const body = $(".tb-body", card);
      body.hidden = !tbUi.open.has(id);
      b.textContent = tbUi.open.has(id) ? "收起" : "展开精讲";
    }));
    $$(".js-tb-done").forEach(b => b.addEventListener("click", () => {
      const id = b.dataset.id;
      state.textbookDone[id] = !state.textbookDone[id];
      b.classList.toggle("on", !!state.textbookDone[id]);
      b.textContent = state.textbookDone[id] ? "✓" : "○";
      const card = document.getElementById("tb-" + id);
      card.classList.toggle("done", !!state.textbookDone[id]);
      const done = tbDoneCount();
      const pct = Math.round(done / TEXTBOOK.length * 100);
      const pill = $(".pill.forest", $("#view"));
      if (pill) pill.textContent = `${done} / ${TEXTBOOK.length} 已掌握`;
      const bar = $("#tb-progress-fill");
      if (bar) bar.style.width = pct + "%";
      saveState(); syncChrome();
    }));
    if (unitId) {
      const card = document.getElementById("tb-" + unitId);
      if (card) {
        tbUi.open.add(unitId);
        const body = $(".tb-body", card); if (body) body.hidden = false;
        const btn = $(".js-tb-toggle", card); if (btn) btn.textContent = "收起";
        card.scrollIntoView({ block: "center", behavior: "instant" });
        card.style.borderColor = "var(--amber)";
        setTimeout(() => { card.style.borderColor = ""; }, 1800);
      }
    }
  }

  function afterExtra(focusId) {
    if (!focusId) return;
    const card = document.getElementById("ex-" + focusId);
    if (!card) return;
    const sol = $(".solution", card); if (sol) sol.hidden = false;
    const btn = $(".js-sol", card); if (btn) btn.textContent = "收起详解";
    card.scrollIntoView({ block: "center", behavior: "instant" });
    card.style.borderColor = "var(--amber)";
    setTimeout(() => { card.style.borderColor = ""; }, 2200);
  }

  function renderWrong() {
    const items = Object.entries(state.wrong).map(([key, v]) => {
      const m = MODULE_MAP[v.module]; const q = m && m.quiz[v.index];
      return q ? { key, m, q, v } : null;
    }).filter(Boolean);
    return `
      <div class="between">
        <div><span class="eyebrow">Review queue</span><h1 style="font-size:clamp(2rem,3vw,2.8rem);margin-top:8px">错题本</h1>
        <p class="lede">只包含随堂测答错的题。答对一次会自动移出；也可以手动移除。</p></div>
        <span class="pill coral">${items.length} 道待复习</span>
      </div>
      <div class="section">
        ${items.length ? `<div class="wrong-list">${items.map(({ key, m, q }) => `<div class="card wrong-card">
          <div class="row"><span class="pill ghost">${m.index} ${esc(m.title)}</span><span class="tiny muted">${esc(q.q)}</span></div>
          <div class="q-text">${q.q}</div>
          <div class="ans">正确答案：<b>${q.options[q.answer]}</b> · ${q.why}</div>
          <div class="row" style="margin-top:9px"><a class="btn small" href="#/module/${m.id}/quiz">重做这一讲</a><button class="btn small danger js-remove-wrong" data-key="${key}" type="button">移出错题本</button></div>
        </div>`).join("")}</div>` : `<div class="empty-state"><div class="big">✓</div><p>错题本是空的。去随堂测或模拟考里制造一点“有价值的错误”。</p><a class="btn primary" href="#/exercises">去刷题</a></div>`}
      </div>`;
  }

  // ---------------------------------------------------------------- exam
  function renderExam() {
    if (examState && !examState.submitted) return renderExamActive();
    if (examState && examState.submitted) return renderExamResult();
    return `<div class="card exam-setup">
      <span class="eyebrow">Mock final</span>
      <h1>12 题 · 20 分钟<br>随机模拟考</h1>
      <p class="lede">从 12 个模块的随堂题库中随机抽取 12 题，覆盖整条复习线。计时结束自动交卷；交卷后可逐题看解析。</p>
      <div class="exam-rules">
        <div class="rule"><span class="k">题量</span><span class="v">12 题</span></div>
        <div class="rule"><span class="k">时间</span><span class="v">20:00</span></div>
        <div class="rule"><span class="k">范围</span><span class="v">全部模块</span></div>
      </div>
      <div class="row"><button class="btn primary" id="exam-start" type="button">开始模拟考 →</button><a class="btn" href="#/wrong">先清错题</a></div>
    </div>`;
  }

  function startExam() {
    const pool = [];
    MODULES.forEach(m => m.quiz.forEach((q, i) => pool.push({ module: m.id, index: i, q })));
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[pool[i], pool[j]] = [pool[j], pool[i]]; }
    examState = { questions: pool.slice(0, 12), answers: Array(12).fill(null), submitted: false, started: Date.now(), remaining: 20 * 60, score: 0 };
    renderRoute();
  }

  function renderExamActive() {
    const s = examState;
    return `<div class="between">
        <div><span class="eyebrow">Mock final · in progress</span><h1 style="font-size:clamp(1.8rem,2.7vw,2.4rem);margin-top:6px">模拟考</h1></div>
        <div class="row"><span class="exam-timer" id="exam-timer">20:00</span><button class="btn danger small" id="exam-submit-early" type="button">提前交卷</button></div>
      </div>
      <div class="exam-list section" style="margin-top:18px">
        ${s.questions.map((item, qi) => {
          const m = MODULE_MAP[item.module]; const q = item.q;
          return `<div class="card exam-q" data-qi="${qi}">
            <div class="q-num">Q${String(qi + 1).padStart(2, "0")} · ${m.index} ${esc(m.title)}</div>
            <div class="q-text">${q.q}</div>
            <div class="q-options">
              ${q.options.map((opt, oi) => `<button class="q-option ${s.answers[qi] === oi ? "selected" : ""}" type="button" data-qi="${qi}" data-opt="${oi}"><span class="key">${String.fromCharCode(65 + oi)}</span><span>${opt}</span></button>`).join("")}
            </div>
          </div>`;
        }).join("")}
      </div>
      <div class="row" style="margin-top:16px"><button class="btn primary" id="exam-submit" type="button">交卷并查看结果</button><span class="tiny muted" id="exam-progress-label">已答 0 / 12</span></div>`;
  }

  function afterExam() {
    const start = $("#exam-start");
    if (start) start.addEventListener("click", startExam);
    if (examState && !examState.submitted) {
      const timerEl = $("#exam-timer");
      const tick = () => {
        if (!examState || examState.submitted) return;
        examState.remaining--;
        const mm = String(Math.max(0, Math.floor(examState.remaining / 60))).padStart(2, "0");
        const ss = String(Math.max(0, examState.remaining % 60)).padStart(2, "0");
        if (timerEl) timerEl.textContent = `${mm}:${ss}`;
        if (examState.remaining <= 0) submitExam();
      };
      examTimer = setInterval(tick, 1000);
      activeCleanup.push(() => { clearInterval(examTimer); examTimer = null; });
      const submit = $("#exam-submit"), early = $("#exam-submit-early");
      if (submit) submit.addEventListener("click", submitExam);
      if (early) early.addEventListener("click", () => { if (confirm("确定提前交卷？未答题按错处理。")) submitExam(); });
      // Restore timer display after re-render.
      if (timerEl) {
        const mm = String(Math.floor(examState.remaining / 60)).padStart(2, "0");
        const ss = String(examState.remaining % 60).padStart(2, "0");
        timerEl.textContent = `${mm}:${ss}`;
      }
    }
  }

  function submitExam() {
    if (!examState || examState.submitted) return;
    if (examTimer) { clearInterval(examTimer); examTimer = null; }
    examState.submitted = true;
    let score = 0;
    examState.questions.forEach((item, i) => {
      if (examState.answers[i] === item.q.answer) {
        score++;
      } else {
        state.wrong[`${item.module}:${item.index}`] = { module: item.module, index: item.index, date: Date.now() };
      }
    });
    examState.score = score;
    const best = state.examBest;
    if (!best || score > best.score) state.examBest = { score, total: examState.questions.length, date: Date.now() };
    saveState(); syncChrome();
    renderRoute();
  }

  function renderExamResult() {
    const s = examState;
    const pct = Math.round(s.score / s.questions.length * 100);
    return `<div class="between">
        <div><span class="eyebrow">Mock final · result</span><h1 style="font-size:clamp(1.9rem,2.8vw,2.5rem);margin-top:6px">${s.score} / ${s.questions.length}</h1>
        <p class="lede">${pct >= 80 ? "状态很好。把错题过一遍就可以上考场。" : pct >= 60 ? "基础可以，但有几条证明链还不稳。看下面的逐题解析。" : "先回到讲义，把每个模块的 takeaway 和公式重新串一遍。"}</p></div>
        <div class="row"><button class="btn primary" id="exam-again" type="button">再来一套</button><a class="btn" href="#/wrong">看错题本</a></div>
      </div>
      <div class="exam-list section">
        ${s.questions.map((item, i) => {
          const m = MODULE_MAP[item.module]; const q = item.q; const ok = s.answers[i] === q.answer;
          return `<div class="card exam-q">
            <div class="q-num">Q${String(i + 1).padStart(2, "0")} · ${m.index} ${esc(m.title)} · <span style="color:${ok ? "var(--forest)" : "var(--coral)"}">${ok ? "正确" : "错误"}</span></div>
            <div class="q-text">${q.q}</div>
            <div class="q-options">
              ${q.options.map((opt, oi) => `<button class="q-option ${oi === q.answer ? "correct" : (oi === s.answers[i] ? "wrong" : "")}" type="button" disabled><span class="key">${String.fromCharCode(65 + oi)}</span><span>${opt}</span></button>`).join("")}
            </div>
            <div class="q-feedback ${ok ? "good" : "bad"}">${q.why}</div>
          </div>`;
        }).join("")}
      </div>`;
  }

  // ---------------------------------------------------------------- search
  let searchIndex = null;
  function buildSearchIndex() {
    const idx = [];
    MODULES.forEach(m => {
      idx.push({ type: "module", title: `${m.index} ${m.title}`, sub: m.short, text: `${m.title} ${m.en} ${m.blurb} ${m.tags.join(" ")} ${stripHTML(m.concepts.map(c => c.title + " " + c.html).join(" "))} ${stripHTML(m.takeaway)}`, href: `#/module/${m.id}` });
    });
    EXERCISES.forEach(e => idx.push({ type: "exercise", title: `${e.source} #${e.num} · ${e.title}`, sub: e.prompt, text: `${e.id} ${e.title} ${e.prompt} ${e.solution} ${e.topic}`, href: `#/exercises/${e.id}` }));
    EXTRA.forEach(e => idx.push({ type: "extra", title: `期中加练 #${e.num} · ${e.title}`, sub: e.prompt, text: `${e.id} ${e.title} ${e.prompt} ${e.solution} ${e.topic}`, href: `#/extra/${setOf(e)}` }));
    TEXTBOOK.forEach(x => idx.push({ type: "textbook", title: `${x.num}. ${x.title}`, sub: `${x.ref} · ${x.summary}`, text: `${x.title} ${x.en} ${x.ref} ${x.summary} ${x.tags.join(" ")} ${stripHTML(x.body)} ${x.example}`, href: `#/textbook/${x.id}` }));
    TB_EX.forEach(x => idx.push({ type: "textbook-ex", title: `教材原题 ${x.ref} · ${x.title}`, sub: x.prompt, text: `${x.ref} ${x.title} ${x.prompt} ${x.solution}`, href: `#/textbook` }));
    FORMULAS.forEach((f, i) => idx.push({ type: "formula", title: f.title, sub: stripHTML(f.body), text: `${f.title} ${stripHTML(f.body)} ${f.note}`, href: `#/formulas` }));
    searchIndex = idx;
  }
  function openSearch() {
    if (!searchIndex) buildSearchIndex();
    $("#search-panel").hidden = false;
    const inp = $("#global-search"); inp.value = ""; renderSearchResults(""); setTimeout(() => inp.focus(), 20);
  }
  function closeSearch() { $("#search-panel").hidden = true; }
  function renderSearchResults(q) {
    const box = $("#search-results");
    const query = q.trim().toLowerCase();
    if (!query) {
      box.innerHTML = `<div class="search-empty">输入 “SCC”“Johnson”“白路径”“TSP”“k-center” 等关键词。</div>`;
      return;
    }
    const hits = searchIndex.filter(x => x.text.toLowerCase().includes(query)).slice(0, 14);
    box.innerHTML = hits.length ? hits.map(h => `<a class="search-result" href="${h.href}">
      <div class="sr-kicker">${h.type === "module" ? "讲义模块" : h.type === "exercise" ? "习题" : h.type === "extra" ? "期中加练" : h.type === "textbook" ? "CLRS 精讲" : h.type === "textbook-ex" ? "教材原题" : "公式"}</div>
      <div class="sr-title">${esc(h.title)}</div>
      <div class="sr-sub">${esc(h.sub)}</div>
    </a>`).join("") : `<div class="search-empty">没有找到。试试更短的关键词。</div>`;
    $$(".search-result", box).forEach(a => a.addEventListener("click", closeSearch));
  }

  // ---------------------------------------------------------------- modal / events
  function openModal(title, html) {
    $("#modal-title").textContent = title;
    $("#modal-body").innerHTML = html;
    $("#modal").hidden = false;
  }
  function closeModal() { $("#modal").hidden = true; }

  function bindGlobal() {
    $("#theme-toggle").addEventListener("click", cycleTheme);
    $("#search-trigger").addEventListener("click", openSearch);
    $("#search-close").addEventListener("click", closeSearch);
    $("#global-search").addEventListener("input", e => renderSearchResults(e.target.value));
    $("#modal-close").addEventListener("click", closeModal);
    $("#modal").addEventListener("click", e => { if (e.target.id === "modal") closeModal(); });
    $("#search-panel").addEventListener("click", e => { if (e.target.id === "search-panel") closeSearch(); });
    document.addEventListener("keydown", e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openSearch(); }
      if (e.key === "Escape") { closeSearch(); closeModal(); document.body.classList.remove("nav-open"); $("#drawer-backdrop").hidden = true; }
    });
    $("#menu-toggle").addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-open");
      $("#drawer-backdrop").hidden = !open;
      $("#menu-toggle").setAttribute("aria-expanded", open ? "true" : "false");
    });
    $("#drawer-backdrop").addEventListener("click", () => { document.body.classList.remove("nav-open"); $("#drawer-backdrop").hidden = true; });
    $("#reset-progress").addEventListener("click", () => {
      if (!confirm("确定清空所有本地进度、收藏和错题？此操作不可撤销。")) return;
      state = defaultState(); saveState(); applyTheme(); renderRoute(); toast("已重置本地进度");
    });

    document.addEventListener("click", (e) => {
      const pdfLink = e.target.closest(".pdf-link");
      if (pdfLink && location.protocol !== "file:") {
        e.preventDefault();
        toast("原始 PDF 未随站点上传；请在本地资料目录中查看。");
        return;
      }
      const sol = e.target.closest(".js-sol");
      if (sol) {
        const card = sol.closest(".ex-card"); const box = $(".solution", card);
        box.hidden = !box.hidden; sol.textContent = box.hidden ? "展开详解" : "收起详解";
        return;
      }
      const bm = e.target.closest(".js-bookmark");
      if (bm) {
        const id = bm.dataset.id;
        if (state.bookmarks[id]) delete state.bookmarks[id]; else state.bookmarks[id] = true;
        bm.classList.toggle("on", !!state.bookmarks[id]); bm.textContent = state.bookmarks[id] ? "★" : "☆";
        saveState(); syncChrome(); toast(state.bookmarks[id] ? "已收藏" : "已取消收藏");
        return;
      }
      const dn = e.target.closest(".js-done");
      if (dn) {
        const id = dn.dataset.id;
        const extra = dn.dataset.extra === "1";
        const bucket = extra ? state.extraDone : state.exercisesDone;
        bucket[id] = !bucket[id];
        dn.classList.toggle("on", !!bucket[id]); dn.textContent = bucket[id] ? "✓" : "○";
        const card = dn.closest(".ex-card"); if (card) card.classList.toggle("done", !!bucket[id]);
        if (extra) { const ep = $("#extra-progress"); if (ep) ep.textContent = `已完成 ${extraDoneCount(ep.dataset.set)} / ${ep.dataset.total}`; }
        saveState(); syncChrome(); toast(bucket[id] ? "已完成" : "已取消完成");
        return;
      }
      const fig = e.target.closest(".js-figure");
      if (fig) { openModal(fig.dataset.title || "原题图", `<img src="${esc(fig.dataset.src)}" alt="${esc(fig.dataset.title || "")}">`); return; }
      const rm = e.target.closest(".js-remove-wrong");
      if (rm) { delete state.wrong[rm.dataset.key]; saveState(); syncChrome(); renderRoute(); return; }
      const exModule = e.target.closest("[data-ex-module]");
      if (exModule) {
        ui.ex = { q: "", module: exModule.dataset.exModule, source: "all", diff: "all", status: "all" };
        // navigation happens via href
        return;
      }
      const opt = e.target.closest(".q-option");
      if (opt && examState && !examState.submitted && opt.dataset.qi != null) {
        const qi = Number(opt.dataset.qi);
        examState.answers[qi] = Number(opt.dataset.opt);
        $$(`.exam-q[data-qi="${qi}"] .q-option`).forEach(x => x.classList.toggle("selected", Number(x.dataset.opt) === examState.answers[qi]));
        const label = $("#exam-progress-label");
        if (label) label.textContent = `已答 ${examState.answers.filter(x => x != null).length} / 12`;
        return;
      }
      const jump = e.target.closest("[data-jump]");
      if (jump) { const target = document.getElementById(jump.dataset.jump); if (target) target.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
      const printBtn = e.target.closest("#print-formulas");
      if (printBtn) { window.print(); return; }
      const again = e.target.closest("#exam-again");
      if (again) { examState = null; renderRoute(); return; }
    });

    window.addEventListener("hashchange", renderRoute);
  }

  // ---------------------------------------------------------------- boot
  applyTheme();
  bindGlobal();
  if (!location.hash) location.hash = "#/dashboard";
  renderRoute();
})();
