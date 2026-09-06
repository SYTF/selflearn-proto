/* 自學無窮 · clickable prototype */
(function () {
  const NAV = {
    student: [
      { route: '/home', label: '科目主頁' },
      { route: '/subject/eng', label: 'English' },
      { route: '/article/1', label: '文章+小測' },
      { route: '/video/1', label: '影片+小測' },
      { route: '/resource/vocab', label: '生字+小測' },
      { route: '/quiz/1', label: '獨立小測' },
      { route: '/progress', label: '我的進度' }
    ],
    teacher: [
      { route: '/teacher', label: 'Dashboard' },
      { route: '/assign', label: '指派' },
      { route: '/report', label: '報表' },
      { route: '/editor', label: '上架／編輯' }
    ],
    admin: [
      { route: '/admin', label: '系統總覽' },
      { route: '/admin/users', label: '用戶管理' },
      { route: '/admin/classes', label: '班級' },
      { route: '/admin/subjects', label: '科目' },
      { route: '/admin/usage', label: '使用量' }
    ]
  };

  const TEACHER_POSTS = {
    class: {
      id: 'class',
      label: '班主任',
      scope: '5A 本班',
      navHint: '本班名冊 · 班進度 · 班指派',
      kpis: [
        { t: '待跟進學生', n: '7', color: 'var(--aurora-r)', spark: '3,4,5,6,5,7,7', sc: '#BF616A', sub: '5A · 未打開 ≥ 3 天' },
        { t: '本班完成率', n: '64%', color: 'var(--frost0)', spark: '48,52,55,58,60,62,64', sc: '#5E81AC', sub: '5A · English · +5pt' },
        { t: '已指派（本班）', n: '12', color: '', spark: '6,7,8,9,10,11,12', sc: '#81A1C1', sub: '進行中 5 · 本週新增 3' },
        { t: '本班平均分', n: '81', color: 'var(--aurora-g)', spark: '74,76,75,78,79,80,81', sc: '#A3BE8C', sub: 'MC／小測' }
      ],
      reportTitle: '班報表 · 5A',
      assignDefault: 'class'
    },
    grade: {
      id: 'grade',
      label: '級主任',
      scope: '五年級 P5',
      navHint: '全級各班 · 級進度 · 級指派',
      kpis: [
        { t: '級內待跟進班', n: '3', color: 'var(--aurora-r)', spark: '1,1,2,2,3,2,3', sc: '#BF616A', sub: '5B／5C 完成率偏低' },
        { t: '全級完成率', n: '58%', color: 'var(--frost0)', spark: '45,48,50,52,55,56,58', sc: '#5E81AC', sub: '5A–5D · 4 班' },
        { t: '級內已指派', n: '28', color: '', spark: '18,20,22,24,25,27,28', sc: '#81A1C1', sub: '跨班教材 9 份' },
        { t: '全級平均分', n: '76', color: 'var(--aurora-g)', spark: '70,71,72,73,74,75,76', sc: '#A3BE8C', sub: '各班比較' }
      ],
      reportTitle: '級報表 · 五年級',
      assignDefault: 'grade'
    },
    subject: {
      id: 'subject',
      label: '科主任',
      scope: 'English 科',
      navHint: '科教材 · 跨班科報 · 科指派',
      kpis: [
        { t: '科教材庫', n: '46', color: 'var(--frost0)', spark: '30,34,38,40,42,44,46', sc: '#5E81AC', sub: 'English · 已發佈' },
        { t: '科完成率（全校）', n: '67%', color: 'var(--frost0)', spark: '55,58,60,62,64,65,67', sc: '#88C0D0', sub: 'P1–P6 有指派班' },
        { t: '待審／草稿', n: '5', color: 'var(--aurora-o)', spark: '8,7,6,6,5,5,5', sc: '#D08770', sub: '科組共享' },
        { t: '科平均分', n: '79', color: 'var(--aurora-g)', spark: '72,74,75,76,77,78,79', sc: '#A3BE8C', sub: '跨班小測' }
      ],
      reportTitle: '科報表 · English',
      assignDefault: 'subject'
    }
  };

  const ASSIGN_OPTIONS = {
    class: [
      { group: '成班', items: [{ id: 'c-5a', label: '5A（本班 · 28 人）', checked: true }] },
      { group: '個別學生（本班）', items: [
        { id: 's-chen', label: '陳曉晴' },
        { id: 's-li', label: '李梓朗' },
        { id: 's-wong', label: '黃子軒' },
        { id: 's-lam', label: '林凱婷' }
      ]}
    ],
    grade: [
      { group: '成年級', items: [{ id: 'g-p5', label: '五年級全級', checked: true }] },
      { group: '成班（本級）', items: [
        { id: 'c-5a', label: '5A（28 人）', checked: true },
        { id: 'c-5b', label: '5B（27 人）' },
        { id: 'c-5c', label: '5C（29 人）' },
        { id: 'c-5d', label: '5D（28 人）' }
      ]},
      { group: '個別學生', items: [
        { id: 's-chen', label: '陳曉晴 · 5A' },
        { id: 's-wong', label: '黃子軒 · 5A' },
        { id: 's-ng', label: '吳嘉欣 · 5B' }
      ]}
    ],
    subject: [
      { group: '成年級', items: [
        { id: 'g-p4', label: '四年級' },
        { id: 'g-p5', label: '五年級', checked: true },
        { id: 'g-p6', label: '六年級' }
      ]},
      { group: '成班（任意）', items: [
        { id: 'c-4a', label: '4A' },
        { id: 'c-5a', label: '5A', checked: true },
        { id: 'c-5b', label: '5B' },
        { id: 'c-6c', label: '6C' }
      ]},
      { group: '個別學生', items: [
        { id: 's-chen', label: '陳曉晴 · 5A' },
        { id: 's-li', label: '李梓朗 · 5A' },
        { id: 's-ho', label: '何俊傑 · 6C' }
      ]}
    ]
  };

  const ROLE_HOME = { student: '/home', teacher: '/teacher', admin: '/admin' };
  const PROG = {
    week:  { done: 72, ontime: 88, line: '完成 18／25 · 學習 3.2 小時', pts: [40, 55, 48, 70, 62, 80, 72] },
    month: { done: 64, ontime: 81, line: '完成 52／81 · 學習 11.4 小時', pts: [50, 45, 60, 58, 70, 65, 72, 68, 74, 80, 76, 70, 78, 82] },
    term:  { done: 58, ontime: 76, line: '完成 140／242 · 學習 48 小時', pts: [30, 40, 45, 50, 48, 55, 60, 58, 62, 65, 70, 68, 72, 75] }
  };
  const STUDENTS = [
    { name: '黃子軒', opened: 0, done: 0, score: '—', spark: [2, 2, 1, 0, 0, 0, 0], risk: true },
    { name: '林凱婷', opened: 1, done: 0, score: '—', spark: [3, 2, 2, 1, 0, 0, 1], risk: true },
    { name: '周浩然', opened: 2, done: 1, score: 62, spark: [4, 3, 5, 2, 3, 1, 2], risk: true },
    { name: '陳曉晴', opened: 8, done: 7, score: 91, spark: [5, 6, 7, 6, 8, 7, 8], risk: false },
    { name: '李梓朗', opened: 7, done: 6, score: 84, spark: [4, 5, 6, 5, 7, 6, 7], risk: false },
    { name: '張詠心', opened: 6, done: 5, score: 78, spark: [3, 4, 5, 6, 5, 6, 5], risk: false },
    { name: '何俊傑', opened: 5, done: 4, score: 73, spark: [2, 4, 3, 5, 4, 5, 4], risk: false },
    { name: '吳嘉欣', opened: 9, done: 8, score: 95, spark: [6, 7, 8, 7, 9, 8, 9], risk: false }
  ];

  let currentRole = 'student';
  let currentRoute = '/login';
  let forceEmpty = false;
  let currentPost = 'class';
  let assignSelected = new Map(); // id -> label
  let editorBlocks = null;
  let slashState = { open: false, query: '', index: 0, replaceId: null, fromHint: false };
  let dragBlockId = null;
  let insertModalState = { kind: null, replaceId: null, fromHint: false };
  const EDITOR_STORAGE_KEY = 'selflearn-proto-editor-blocks-v2';
  const SLASH_TYPES = ['h1', 'p', 'list', 'quiz', 'video', 'img', 'vocab', 'divider'];
  const MODAL_INSERT_TYPES = new Set(['quiz', 'video', 'img', 'vocab']);
  const IMMEDIATE_INSERT_TYPES = new Set(['h1', 'h2', 'p', 'list', 'divider']);

  function parseHash() {
    const raw = (location.hash || '#/login').replace(/^#/, '') || '/login';
    // Ignore in-page fragment ids (e.g. articleQuiz) — keep current route
    if (raw && !raw.startsWith('/') && !raw.includes('/')) {
      return currentRoute || '/login';
    }
    return raw.startsWith('/') ? raw : '/' + raw;
  }

  function navigate(route) {
    if (!route.startsWith('/')) route = '/' + route;
    if (location.hash !== '#' + route) {
      location.hash = '#' + route;
    } else {
      render(route);
    }
  }

  function pageIdFromRoute(route) {
    if (route === '/login') return 'login';
    if (route === '/home') return 'home';
    if (route.startsWith('/subject')) return 'subject';
    if (route.startsWith('/article')) return 'article';
    if (route.startsWith('/video')) return 'video';
    if (route.startsWith('/resource')) return 'resource';
    if (route.startsWith('/quiz')) return 'quiz';
    if (route === '/progress') return 'progress';
    if (route === '/teacher') return 'teacher';
    if (route === '/assign') return 'assign';
    if (route === '/report') return 'report';
    if (route === '/editor') return 'editor';
    if (route === '/admin' || route === '/admin/') return 'admin';
    if (route === '/admin/users') return 'admin-users';
    if (route === '/admin/classes') return 'admin-classes';
    if (route === '/admin/subjects') return 'admin-subjects';
    if (route === '/admin/usage' || route === '/heatmap') return 'admin-usage';
    return 'login';
  }

  function roleForRoute(route) {
    if (['/teacher', '/assign', '/report', '/editor'].some(p => route === p || route.startsWith(p))) return 'teacher';
    if (route === '/admin' || route.startsWith('/admin/') || route === '/heatmap') return 'admin';
    if (route === '/login') return currentRole;
    return 'student';
  }

  function render(route) {
    currentRoute = route;
    const pageId = pageIdFromRoute(route);
    if (pageId !== 'login') {
      const inferred = roleForRoute(route);
      if (inferred !== currentRole && route !== '/login') {
        // keep explicit role switch; only auto-switch when navigating via chips of another role
      }
    }

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const el = document.getElementById('pg-' + pageId);
    if (!el) {
      console.warn('missing page', pageId);
      return;
    }
    el.classList.add('active');

    const chrome = document.getElementById('chrome');
    chrome.style.display = pageId === 'login' ? 'none' : '';

    document.querySelectorAll('.role-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.role === currentRole)
    );
    document.getElementById('avatarLbl').textContent =
      currentRole === 'student' ? '學' : currentRole === 'teacher' ? '師' : '管';

    if (pageId !== 'login') renderNav();

    if (pageId === 'progress') {
      updateProgress(document.querySelector('#progRange .chip.on')?.dataset.range || 'week');
      buildContribGraph('calHeat', { weeks: 16, seed: 11 });
    }
    if (pageId === 'teacher') {
      applyTeacherPost(currentPost);
    }
    if (pageId === 'assign') {
      renderAssignScope(currentPost);
    }
    if (pageId === 'report') {
      applyTeacherPost(currentPost, { reportOnly: true });
      renderReport(document.querySelector('#repRange .chip.on')?.dataset.range || 'week');
      buildContribGraph('classHeat', { weeks: 12, seed: 22, title: '近 12 週完成量' });
    }
    if (pageId === 'editor') {
      closeInsertModal();
      ensureEditorState();
      renderEditor();
    }
    if (pageId === 'admin-usage') {
      buildContribGraph('usageContrib', { weeks: 26, seed: 7, title: '全校活躍（GitHub 式）' });
      buildRoomHeat(document.querySelector('#heatRange .chip.on')?.dataset.range || 'week');
    }
    if (pageId === 'subject') {
      applySubjectFilters();
    }
    // admin subnav highlight
    document.querySelectorAll('[data-admin-nav]').forEach(a => {
      a.classList.toggle('active', a.getAttribute('data-go') === route || (route === '/heatmap' && a.getAttribute('data-go') === '/admin/usage'));
    });
    window.scrollTo(0, 0);
  }

  function renderNav() {
    const nav = document.getElementById('navChips');
    nav.innerHTML = NAV[currentRole]
      .map(i => {
        const active =
          currentRoute === i.route ||
          (i.route === '/admin' && currentRoute === '/admin') ||
          (i.route.startsWith('/admin/') && currentRoute === i.route) ||
          (i.route === '/admin/usage' && currentRoute === '/heatmap') ||
          (i.route.startsWith('/subject') && currentRoute.startsWith('/subject')) ||
          (i.route.startsWith('/article') && currentRoute.startsWith('/article')) ||
          (i.route.startsWith('/video') && currentRoute.startsWith('/video')) ||
          (i.route.startsWith('/resource') && currentRoute.startsWith('/resource')) ||
          (i.route.startsWith('/quiz') && currentRoute.startsWith('/quiz'));
        return `<button class="pchip${active ? ' active' : ''}" data-route="${i.route}">${i.label}</button>`;
      })
      .join('');
  }

  function enterRole(role) {
    currentRole = role;
    navigate(ROLE_HOME[role]);
  }

  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('show'), 1800);
  }

  /* —— filters / empty —— */
  function applySubjectFilters() {
    const assignedOn = document.querySelector('#subjFilter .chip[data-f="assigned"]')?.classList.contains('on');
    const progressOn = document.querySelector('#subjFilter .chip[data-f="progress"]')?.classList.contains('on');
    const allOn = document.querySelector('#subjFilter .chip[data-f="all"]')?.classList.contains('on');
    const cat = document.querySelector('#catChips .chip.soft-on')?.dataset.cat || 'all';
    const grid = document.getElementById('matGrid');
    const empty = document.getElementById('matEmpty');
    let visible = 0;

    grid.querySelectorAll('.mat-card').forEach(card => {
      const catOk = cat === 'all' || card.dataset.cat === cat;
      const assigned = card.dataset.assigned === '1';
      const inProg = card.dataset.progress === '1';
      let statusOk = true;
      if (forceEmpty) {
        statusOk = false;
      } else if (allOn) {
        statusOk = true;
      } else if (assignedOn && progressOn) {
        statusOk = assigned || inProg;
      } else if (assignedOn) {
        statusOk = assigned;
      } else if (progressOn) {
        statusOk = inProg;
      }
      const show = catOk && statusOk;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    empty.classList.toggle('hidden', visible > 0);
    grid.style.display = visible > 0 ? '' : 'none';
  }

  function wireChips(sel, handler) {
    const root = document.querySelector(sel);
    if (!root) return;
    root.addEventListener('click', e => {
      const c = e.target.closest('.chip');
      if (!c) return;
      if (c.dataset.cat !== undefined || c.dataset.s !== undefined) {
        root.querySelectorAll('.chip').forEach(x => x.classList.remove('soft-on', 'on'));
        c.classList.add('soft-on');
        if (handler) handler(c);
        return;
      }
      // multi-toggle for status filters on subject: exclusive among assigned/progress/all
      if (c.dataset.f !== undefined) {
        root.querySelectorAll('.chip').forEach(x => x.classList.remove('on'));
        c.classList.add('on');
        if (handler) handler(c);
        return;
      }
      root.querySelectorAll('.chip').forEach(x => x.classList.remove('on'));
      c.classList.add('on');
      if (handler) handler(c);
    });
  }

  function updateProgress(range) {
    const d = PROG[range] || PROG.week;
    const lbl = { week: '本週', month: '本月', term: '學期' }[range];
    document.getElementById('progRangeLbl').textContent = lbl;
    document.getElementById('ringDoneArc').setAttribute('stroke-dasharray', d.done + ' 100');
    document.getElementById('ringDoneTxt').textContent = d.done + '%';
    document.getElementById('ringOnTime').setAttribute('stroke-dasharray', d.ontime + ' 100');
    document.getElementById('ringOnTimeTxt').textContent = d.ontime + '%';
    document.getElementById('progStatLine').textContent = d.line;
    drawTrend(d.pts, range);
  }

  function drawTrend(pts, range) {
    const w = 400, h = 140, pad = 10;
    const max = Math.max(...pts, 1);
    const step = (w - pad * 2) / Math.max(pts.length - 1, 1);
    const coords = pts.map((v, i) => {
      const x = pad + i * step;
      const y = h - pad - (v / max) * (h - pad * 2);
      return [x, y, v];
    });
    const line = coords.map((c, i) => (i ? 'L' : 'M') + c[0].toFixed(1) + ',' + c[1].toFixed(1)).join(' ');
    const fill = line + ` L${coords[coords.length - 1][0]},${h} L${coords[0][0]},${h} Z`;
    document.getElementById('trendLine').setAttribute('d', line);
    document.getElementById('trendFill').setAttribute('d', fill);
    const labels = range === 'week' ? ['一', '二', '三', '四', '五', '六', '日'] : pts.map((_, i) => String(i + 1));
    document.getElementById('trendDots').innerHTML = coords
      .map(
        (c, i) =>
          `<circle cx="${c[0]}" cy="${c[1]}" r="4" fill="#5E81AC" stroke="#fff" stroke-width="1.5"><title>${labels[i] || i}: ${c[2]} 分鐘</title></circle>`
      )
      .join('');
    document.getElementById('trendHint').textContent =
      'Hover 節點查看當日學習量 · ' + { week: '本週', month: '本月', term: '學期' }[range];
  }

  function seededLevel(seed, i) {
    const x = Math.sin((seed + i) * 12.9898) * 43758.5453;
    const r = x - Math.floor(x);
    if (r < 0.28) return 0;
    if (r < 0.48) return 1;
    if (r < 0.68) return 2;
    if (r < 0.86) return 3;
    return 4;
  }

  function buildContribGraph(elId, opts) {
    const el = document.getElementById(elId);
    if (!el) return;
    opts = opts || {};
    const weeks = opts.weeks || 16;
    const seed = opts.seed || 1;
    const yLabels = ['日', '一', '二', '三', '四', '五', '六'];
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    // end on a Saturday-ish demo date relative to Sep 2026
    const end = new Date(2026, 8, 5); // Sep 5 2026 (Sat)
    const start = new Date(end);
    start.setDate(end.getDate() - (weeks * 7 - 1));
    // align start to Sunday
    start.setDate(start.getDate() - start.getDay());

    const monthCells = [];
    let lastMonth = -1;
    for (let w = 0; w < weeks; w++) {
      const d = new Date(start);
      d.setDate(start.getDate() + w * 7);
      const m = d.getMonth();
      if (m !== lastMonth) {
        monthCells.push(`<span style="grid-column:${w + 1}">${monthNames[m]}</span>`);
        lastMonth = m;
      } else {
        monthCells.push(`<span></span>`);
      }
    }

    let weeksHtml = '';
    let cellIdx = 0;
    for (let w = 0; w < weeks; w++) {
      weeksHtml += '<div class="contrib-week">';
      for (let dow = 0; dow < 7; dow++) {
        const d = new Date(start);
        d.setDate(start.getDate() + w * 7 + dow);
        const future = d > end;
        const lv = future ? 0 : seededLevel(seed, cellIdx);
        const count = future ? 0 : lv * 2 + (lv ? 1 : 0);
        const tip = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}：${count} 次活動`;
        weeksHtml += `<div class="contrib-cell contrib-${lv}" data-tip="${tip}" title="${tip}"></div>`;
        cellIdx++;
      }
      weeksHtml += '</div>';
    }

    const title = opts.title ? `<div class="contrib-title">${opts.title}</div>` : '';
    el.className = 'contrib-wrap';
    el.innerHTML = `${title}<div class="contrib-graph">
      <div class="contrib-months"><div></div><div class="contrib-months-row">${monthCells.join('')}</div></div>
      <div class="contrib-body">
        <div class="contrib-ydays">${yLabels.map(l => `<span>${l}</span>`).join('')}</div>
        <div class="contrib-weeks">${weeksHtml}</div>
      </div>
      <div class="contrib-legend">
        <span>少</span>
        <span class="contrib-cell contrib-0"></span>
        <span class="contrib-cell contrib-1"></span>
        <span class="contrib-cell contrib-2"></span>
        <span class="contrib-cell contrib-3"></span>
        <span class="contrib-cell contrib-4"></span>
        <span>多</span>
      </div>
    </div>`;
  }

  function applyTeacherPost(postId, opts) {
    opts = opts || {};
    currentPost = postId in TEACHER_POSTS ? postId : 'class';
    const post = TEACHER_POSTS[currentPost];
    document.querySelectorAll('.post-btn').forEach(b => b.classList.toggle('active', b.dataset.post === currentPost));
    document.querySelectorAll('.post-panel').forEach(p => p.classList.toggle('active', p.dataset.post === currentPost));
    const banner = document.getElementById('postBanner');
    if (banner) {
      banner.innerHTML = `<span class="post-tag">${post.label}</span><span class="small muted">${post.scope} · ${post.navHint}</span><span class="badge badge-frost">職務切換示範</span>`;
    }
    const kpiHost = document.getElementById('teacherKpis');
    if (kpiHost && !opts.reportOnly) {
      kpiHost.innerHTML = post.kpis.map(k => `
        <div class="card s3 kpi">
          <div class="t">${k.t}</div>
          <div class="kpi-row">
            <div class="n"${k.color ? ` style="color:${k.color}"` : ''}>${k.n}</div>
            <span class="spark-host" data-spark="${k.spark}" data-color="${k.sc}" data-fill="1"></span>
          </div>
          <div class="small muted">${k.sub}</div>
        </div>`).join('');
      hydrateSparks(kpiHost);
    }
    const repH = document.getElementById('reportHeading');
    if (repH) repH.textContent = post.reportTitle;
    const repSub = document.getElementById('reportSub');
    if (repSub) {
      repSub.textContent = currentPost === 'class'
        ? '本班名冊 · 未打開優先 · sparkline'
        : currentPost === 'grade'
          ? '全級各班彙整 · 可下鑽班別'
          : 'English 科跨班／跨級 · 教材維度';
    }
    // show/hide report table modes
    document.getElementById('reportGradeBlock')?.classList.toggle('hidden', currentPost !== 'grade');
    document.getElementById('reportSubjectBlock')?.classList.toggle('hidden', currentPost !== 'subject');
    // hydrate sparks inside visible post panels
    document.querySelectorAll('.post-panel.active').forEach(p => hydrateSparks(p));
  }

  function renderAssignScope(postId) {
    const post = TEACHER_POSTS[postId] || TEACHER_POSTS.class;
    const groups = ASSIGN_OPTIONS[postId] || ASSIGN_OPTIONS.class;
    const hint = document.getElementById('assignPostHint');
    if (hint) hint.textContent = `${post.label}可視範圍：${post.scope}（成班／成年級／個別學生可多選）`;
    const pop = document.getElementById('msPopover');
    if (!pop) return;
    // seed selection once per post switch if empty or post changed
    if (!renderAssignScope._post || renderAssignScope._post !== postId) {
      assignSelected.clear();
      groups.forEach(g => g.items.forEach(it => { if (it.checked) assignSelected.set(it.id, it.label); }));
      renderAssignScope._post = postId;
    }
    let html = '';
    groups.forEach(g => {
      html += `<div class="ms-sec">${g.group}</div>`;
      g.items.forEach(it => {
        const on = assignSelected.has(it.id);
        html += `<label class="ms-opt"><input type="checkbox" data-ms-id="${it.id}" data-ms-label="${it.label}" ${on ? 'checked' : ''}/> ${it.label}</label>`;
      });
    });
    html += `<div class="ms-foot"><button type="button" class="btn btn-ghost btn-sm" id="msClear">清除</button><button type="button" class="btn btn-primary btn-sm" id="msDone">完成</button></div>`;
    pop.innerHTML = html;
    syncAssignChips();
  }

  function syncAssignChips() {
    const host = document.getElementById('msChips');
    if (!host) return;
    if (!assignSelected.size) {
      host.innerHTML = '<div class="ms-empty">尚未選擇指派對象 — 點上方開啟多選</div>';
    } else {
      host.innerHTML = [...assignSelected.entries()].map(([id, label]) =>
        `<span class="ms-chip">${label}<button type="button" data-ms-remove="${id}" aria-label="移除">×</button></span>`
      ).join('');
    }
    const trig = document.getElementById('msTriggerLabel');
    if (trig) trig.textContent = assignSelected.size ? `已選 ${assignSelected.size} 個對象` : '選擇班／級／學生…';
  }

  function modalTitle(kind) {
    return { quiz: '插入小測', video: '插入影片', img: '插入圖片', vocab: '插入生字' }[kind] || '插入';
  }

  function buildModalBody(kind) {
    if (kind === 'quiz') {
      return `
        <div class="modal-help"><strong>設定後確認</strong> — 插入緊湊小測 block 到畫布（唔再展開成頁內大面板）。</div>
        <div class="chips mb12" id="modalQuizModes">
          <button type="button" class="chip soft-on" data-qmode="create">即場出題</button>
          <button type="button" class="chip" data-qmode="pick">選用既有</button>
        </div>
        <div id="modalQuizCreate" class="q-builder">
          <div class="field"><label>小測標題</label><input id="mqTitle" value="本課小測" /></div>
          <div class="q-card">
            <div class="between"><span class="q-type">MC 選擇題</span><span class="badge badge-frost">單選</span></div>
            <div class="field mt8"><label>題幹</label><input id="mqPrompt" value="Which word means「毛毛雨」？" /></div>
            <div class="stack gap8">
              <label class="check-item"><input type="radio" name="mqa1" /> thunder</label>
              <label class="check-item"><input type="radio" name="mqa1" checked /> drizzle ✓</label>
              <label class="check-item"><input type="radio" name="mqa1" /> breeze</label>
            </div>
          </div>
          <div class="q-card">
            <div class="between"><span class="q-type">是非題 T/F</span></div>
            <div class="field mt8"><label>題幹</label><input value="「humid」意思係潮濕。" /></div>
            <div class="chips mt8">
              <button type="button" class="chip soft-on">True</button>
              <button type="button" class="chip">False</button>
            </div>
          </div>
          <div class="q-card">
            <div class="between"><span class="q-type">填充題</span></div>
            <div class="field mt8"><label>題幹（用 ____ 表示空位）</label><input value="A light rain is called ____." /></div>
            <div class="field"><label>答案</label><input value="drizzle" /></div>
          </div>
        </div>
        <div id="modalQuizPick" class="hidden">
          <div class="check-list">
            <label class="check-item"><input type="radio" name="mpickq" value="Unit 3 Check" checked /> Unit 3 Check（8 題）</label>
            <label class="check-item"><input type="radio" name="mpickq" value="Weather Words Quick Quiz" /> Weather Words Quick Quiz</label>
            <label class="check-item"><input type="radio" name="mpickq" value="Phonics /th/ Exit Ticket" /> Phonics /th/ Exit Ticket</label>
          </div>
        </div>`;
    }
    if (kind === 'video') {
      return `
        <div class="modal-help"><strong>上載或貼上 URL</strong> — 確認後插入緊湊影片 block。</div>
        <div class="field"><label>上載影片檔</label><input type="file" id="mvFile" accept="video/*" /></div>
        <div class="field"><label>或 Embed URL</label><input id="mvUrl" placeholder="https://youtube.com/… 或串流連結" value="https://example.com/video/phonics-th" /></div>
        <div class="field"><label>標題</label><input id="mvTitle" value="影片 embed" /></div>`;
    }
    if (kind === 'img') {
      return `
        <div class="modal-help"><strong>選擇圖片</strong> — 確認後插入緊湊圖片 block／卡片。</div>
        <div class="field"><label>上載圖片</label><input type="file" id="miFile" accept="image/*" /></div>
        <div class="field"><label>或圖片路徑／URL</label><input id="miSrc" value="img/login-hero.png" /></div>
        <div class="field"><label>說明文字</label><input id="miCaption" value="圖片 block · 剛插入" /></div>
        <div class="chips mb8">
          <button type="button" class="chip soft-on mi-preset" data-src="img/login-hero.png">封面</button>
          <button type="button" class="chip mi-preset" data-src="img/subj-eng.png">English</button>
          <button type="button" class="chip mi-preset" data-src="img/progress.png">進度</button>
        </div>`;
    }
    if (kind === 'vocab') {
      return `
        <div class="modal-help"><strong>生字詞庫</strong> — 確認後插入詞卡 block。</div>
        <div id="modalVocabRows">
          <div class="vocab-row"><input value="drizzle" /><input value="毛毛雨" /><button type="button" class="btn btn-ghost btn-sm vocab-del">刪</button></div>
          <div class="vocab-row"><input value="forecast" /><input value="預報" /><button type="button" class="btn btn-ghost btn-sm vocab-del">刪</button></div>
          <div class="vocab-row"><input value="humid" /><input value="潮濕" /><button type="button" class="btn btn-ghost btn-sm vocab-del">刪</button></div>
        </div>
        <button type="button" class="btn btn-ghost btn-sm mt8" id="modalAddVocabRow">＋ 加詞</button>`;
    }
    return '';
  }

  function openInsertModal(kind, opts) {
    opts = opts || {};
    if (!MODAL_INSERT_TYPES.has(kind)) return;
    insertModalState = {
      kind,
      replaceId: opts.replaceId || null,
      fromHint: !!opts.fromHint
    };
    const modal = document.getElementById('insertModal');
    const bg = document.getElementById('insertModalBg');
    const title = document.getElementById('insertModalTitle');
    const body = document.getElementById('insertModalBody');
    if (!modal || !bg || !body) return;
    if (title) title.textContent = modalTitle(kind);
    body.innerHTML = buildModalBody(kind);
    modal.hidden = false;
    bg.hidden = false;
    document.body.classList.add('modal-open');
    document.querySelectorAll('.attach-btn').forEach(b => b.classList.toggle('on', b.dataset.modal === kind));
    // focus first field
    requestAnimationFrame(() => body.querySelector('input:not([type=file]):not([type=radio])')?.focus());
  }

  function closeInsertModal() {
    insertModalState = { kind: null, replaceId: null, fromHint: false };
    document.getElementById('insertModal')?.setAttribute('hidden', '');
    document.getElementById('insertModalBg')?.setAttribute('hidden', '');
    const modal = document.getElementById('insertModal');
    const bg = document.getElementById('insertModalBg');
    if (modal) modal.hidden = true;
    if (bg) bg.hidden = true;
    document.body.classList.remove('modal-open');
    document.querySelectorAll('.attach-btn').forEach(b => b.classList.remove('on'));
  }

  function collectModalPayload(kind) {
    const body = document.getElementById('insertModalBody');
    if (!body) return {};
    if (kind === 'quiz') {
      const pickMode = !document.getElementById('modalQuizPick')?.classList.contains('hidden');
      if (pickMode) {
        const picked = body.querySelector('input[name="mpickq"]:checked');
        const title = picked ? picked.value : '本課小測';
        return { title, prompt: '（既有小測）' + title };
      }
      return {
        title: body.querySelector('#mqTitle')?.value?.trim() || '本課小測',
        prompt: body.querySelector('#mqPrompt')?.value?.trim() || 'Which word means「毛毛雨」？'
      };
    }
    if (kind === 'video') {
      const file = body.querySelector('#mvFile')?.files?.[0];
      const url = body.querySelector('#mvUrl')?.value?.trim() || '';
      const title = body.querySelector('#mvTitle')?.value?.trim() || '影片 embed';
      const sub = file ? ('上載：' + file.name) : (url || '上載／URL');
      return { title, sub, url };
    }
    if (kind === 'img') {
      const file = body.querySelector('#miFile')?.files?.[0];
      let src = body.querySelector('#miSrc')?.value?.trim() || 'img/login-hero.png';
      const caption = body.querySelector('#miCaption')?.value?.trim() || '圖片 block';
      if (file) {
        try { src = URL.createObjectURL(file); } catch (e) { /* keep path */ }
      }
      return { src, caption };
    }
    if (kind === 'vocab') {
      const words = [...body.querySelectorAll('#modalVocabRows .vocab-row')].map(row => {
        const inputs = row.querySelectorAll('input');
        return { en: (inputs[0]?.value || '').trim(), zh: (inputs[1]?.value || '').trim() };
      }).filter(w => w.en || w.zh);
      return { words: words.length ? words : [{ en: 'drizzle', zh: '毛毛雨' }] };
    }
    return {};
  }

  function confirmInsertModal() {
    const kind = insertModalState.kind;
    if (!kind) return;
    const payload = collectModalPayload(kind);
    const opts = {
      replaceId: insertModalState.replaceId || null,
      fromHint: insertModalState.fromHint,
      payload
    };
    if (opts.fromHint) {
      const hint = document.getElementById('editorAddHint');
      if (hint) hint.textContent = '';
    }
    closeInsertModal();
    insertBlock(kind, opts);
  }

  function sparkSVG(arr, opts) {
    opts = opts || {};
    const w = opts.w || 72;
    const h = opts.h || 24;
    const color = opts.color || '#5E81AC';
    const fill = !!opts.fill;
    const pad = 2;
    const nums = (arr || []).map(Number);
    if (!nums.length) return '';
    const max = Math.max(...nums, 1);
    const min = Math.min(...nums, 0);
    const span = Math.max(max - min, 1);
    const step = w / (nums.length - 1 || 1);
    const pts = nums.map((v, i) => {
      const x = i * step;
      const y = h - pad - ((v - min) / span) * (h - pad * 2);
      return [x, y];
    });
    const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
    const last = pts[pts.length - 1];
    const area = fill
      ? `<path d="${line} L${last[0].toFixed(1)},${h} L0,${h} Z" fill="${color}" fill-opacity=".14"/>`
      : '';
    const uid = 'sg' + Math.abs(Math.round(last[0] * 100 + last[1] * 10 + nums[0] * 7));
    return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">${area}<path d="${line}" fill="none" stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="2.2" fill="${color}"/></svg>`;
  }

  function hydrateSparks(root) {
    (root || document).querySelectorAll('.spark-host[data-spark]').forEach(el => {
      const arr = String(el.dataset.spark || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .map(Number);
      const color = el.dataset.color || '#5E81AC';
      const fill = el.dataset.fill === '1' || el.dataset.fill === 'true';
      const w = Number(el.dataset.w) || 78;
      const h = Number(el.dataset.h) || 28;
      el.innerHTML = sparkSVG(arr, { color, fill, w, h });
    });
  }

  function renderReport(range) {
    const body = document.getElementById('reportBody');
    const factor = range === 'month' ? 1.3 : range === 'term' ? 2.1 : 1;
    const sorted = [...STUDENTS].sort((a, b) => a.opened - b.opened);
    document.getElementById('repMeta').textContent =
      '顯示 28 人 · ' + { week: '本週', month: '本月', term: '學期' }[range || 'week'];
    body.innerHTML = sorted
      .map(s => {
        const idx = STUDENTS.indexOf(s);
        const opened = Math.round(s.opened * factor);
        const done = Math.round(s.done * factor);
        const score =
          s.score === '—'
            ? '—'
            : Math.min(99, Math.round(Number(s.score) + (range === 'term' ? -3 : range === 'month' ? 1 : 0)));
        return `<tr class="student-row" data-idx="${idx}">
      <td><strong>${s.name}</strong>${s.risk ? ' <span class="badge badge-r">未打開</span>' : ''}</td>
      <td>${opened}</td><td>${done}</td><td>${score}</td>
      <td>${sparkSVG(s.spark, { color: s.risk ? '#BF616A' : '#5E81AC', fill: true, w: 72, h: 24 })}</td>
      <td class="small muted">詳情 ›</td>
    </tr>
    <tr class="detail-row hidden" id="detail-${idx}"><td colspan="6" style="background:var(--snow0);padding:12px">
      <div class="row gap12">
        <div style="flex:1">
          <div class="small muted">最近活動（${{ week: '本週', month: '本月', term: '學期' }[range || 'week']}）</div>
          <div class="mt8">Weather Words · ${opened ? '已打開' : '尚未打開'} · Done ${done}</div>
          <div class="progress-bar mt8"><i style="width:${Math.min(100, done * 12)}%"></i></div>
        </div>
        <button class="btn btn-outline btn-sm" data-drawer="${idx}">側欄詳情</button>
      </div>
    </td></tr>`;
      })
      .join('');
  }

  function openDrawer(idx) {
    const s = STUDENTS[idx];
    document.getElementById('drawerName').textContent = s.name;
    document.getElementById('drawerBody').innerHTML = `
    <div class="stack gap12">
      <div class="card card-pad" style="box-shadow:none;border:1px solid var(--snow2)">
        <div class="between"><span class="muted small">Opened</span><strong>${s.opened}</strong></div>
        <div class="between mt8"><span class="muted small">Done</span><strong>${s.done}</strong></div>
        <div class="between mt8"><span class="muted small">Score</span><strong>${s.score}</strong></div>
      </div>
      <div><div class="small muted mb8">兩週趨勢</div>${sparkSVG(s.spark.concat(s.spark), { color: s.risk ? '#BF616A' : '#5E81AC', fill: true, w: 280, h: 40 }).replace('class="spark"', 'class="spark" style="width:100%;height:40px"')}</div>
      <img src="img/mascot.png" style="border-radius:10px;height:100px;width:100%;object-fit:cover" alt=""/>
      <button class="btn btn-primary btn-sm" id="drawerAssign">改為個人指派</button>
    </div>`;
    document.getElementById('drawer').classList.add('open');
    document.getElementById('drawerBg').classList.add('open');
    document.getElementById('drawerAssign').onclick = () => {
      closeDrawer();
      navigate('/assign');
    };
  }

  function closeDrawer() {
    document.getElementById('drawer').classList.remove('open');
    document.getElementById('drawerBg').classList.remove('open');
  }

  function buildRoomHeat(range) {
    document.getElementById('heatLbl').textContent = { week: '本週', month: '本月', term: '學期' }[range];
    const peak = {
      week: ['星期二 10:00–11:00 · 電腦室用量最高', '78%'],
      month: ['月初兩週較高 · 圖書館', '65%'],
      term: ['考試週尖峰 · 全校電腦室', '91%']
    };
    document.getElementById('heatPeak').textContent = peak[range][0];
    document.getElementById('heatPct').textContent = peak[range][1];
    document.getElementById('heatBar').style.width = peak[range][1];
    const rooms = ['電腦室', '圖書館', '5A', '5B', '音樂室'];
    const grid = document.getElementById('roomHeat');
    let html =
      `<div></div><div class="muted" style="text-align:center">一</div><div class="muted" style="text-align:center">二</div><div class="muted" style="text-align:center">三</div><div class="muted" style="text-align:center">四</div><div class="muted" style="text-align:center">五</div>`;
    rooms.forEach((r, ri) => {
      html += `<div class="muted" style="display:flex;align-items:center">${r}</div>`;
      for (let d = 0; d < 5; d++) {
        const lv = (ri * 3 + d * 2 + (range === 'term' ? 2 : range === 'month' ? 1 : 0)) % 5;
        html += `<div class="hm-cell hm-${lv}" style="aspect-ratio:auto;height:28px" data-tip="${r} 週${'一二三四五'[d]}: Lv${lv}"></div>`;
      }
    });
    grid.innerHTML = html;
  }

  function uid(prefix) {
    return (prefix || 'b') + Math.random().toString(36).slice(2, 9);
  }

  function defaultEditorBlocks() {
    return [
      { id: 'b-h1', type: 'h1', content: 'Unit 3 · A Rainy Day' },
      { id: 'b-p1', type: 'p', content: 'It was a rainy Monday morning. Students walked carefully with umbrellas and raincoats. 在此以區塊編輯內文——非 textarea。' },
      { id: 'b-img', type: 'img', src: 'img/subj-eng.png', caption: '圖片 block · 插圖示範' },
      { id: 'b-p2', type: 'p', content: '輸入文字即成段落；或打 / 插入標題、清單、小測、影片、圖片、生字、分隔線。' }
    ];
  }

  function ensureEditorState() {
    if (editorBlocks && Array.isArray(editorBlocks) && editorBlocks.length) return;
    try {
      const raw = localStorage.getItem(EDITOR_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          editorBlocks = parsed;
          return;
        }
      }
    } catch (e) { /* ignore */ }
    editorBlocks = defaultEditorBlocks();
  }

  function persistEditorState() {
    try {
      localStorage.setItem(EDITOR_STORAGE_KEY, JSON.stringify(editorBlocks));
    } catch (e) { /* ignore */ }
  }

  function blockInnerHtml(b) {
    if (b.type === 'h1') return escapeHtml(b.content || '標題');
    if (b.type === 'h2') return escapeHtml(b.content || '小標題');
    if (b.type === 'p') return escapeHtml(b.content || '');
    if (b.type === 'list') {
      const items = (b.items && b.items.length ? b.items : ['清單項目']).map(t => `<li>${escapeHtml(t)}</li>`).join('');
      return `<ul>${items}</ul>`;
    }
    if (b.type === 'divider') return '<hr/>';
    if (b.type === 'img') {
      return `<img src="${escapeAttr(b.src || 'img/login-hero.png')}" alt=""/><div class="small muted" style="padding:6px 10px;background:var(--snow0)">${escapeHtml(b.caption || '圖片 block')}</div>`;
    }
    if (b.type === 'video') {
      return `<div style="width:56px;height:40px;border-radius:8px;background:var(--frost0);color:#fff;display:grid;place-items:center">▶</div><div><strong>${escapeHtml(b.title || '影片 embed')}</strong><div class="small muted">${escapeHtml(b.sub || '上載／URL · 00:00')}</div></div>`;
    }
    if (b.type === 'vocab') {
      const chips = (b.words || [{ en: 'drizzle', zh: '毛毛雨' }, { en: 'forecast', zh: '預報' }])
        .map(w => `<span class="chip soft-on">${escapeHtml(w.en)} · ${escapeHtml(w.zh)}</span>`).join('');
      return `<div class="between"><strong>生字 block</strong><span class="badge badge-g">詞卡</span></div><div class="chips mt8">${chips}</div>`;
    }
    if (b.type === 'quiz' || b.type === 'mc') {
      return `<div class="between"><strong>${escapeHtml(b.title || '本課小測')}</strong><span class="badge badge-frost">附加</span></div><div class="mt8" style="font-weight:600">${escapeHtml(b.prompt || 'Which word means「毛毛雨」？')}</div><div class="mc-opt"><span>○</span> thunder</div><div class="mc-opt"><span>○</span> drizzle</div>`;
    }
    return escapeHtml(b.content || '');
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function escapeAttr(s) { return escapeHtml(s).replace(/'/g, '&#39;'); }

  function isEditableType(type) {
    return type === 'h1' || type === 'h2' || type === 'p' || type === 'list';
  }

  function renderEditor() {
    ensureEditorState();
    const host = document.getElementById('editorBlocks');
    if (!host) return;
    const n = editorBlocks.length;
    host.innerHTML = editorBlocks.map((b, i) => {
      const editable = isEditableType(b.type) ? ' contenteditable="true"' : '';
      const cls = b.type === 'quiz' ? 'quiz' : b.type;
      return `<div class="block-row" data-id="${b.id}" data-type="${b.type}">
        <div class="block-controls">
          <button type="button" class="blk-move blk-up" data-move="up" title="上移" ${i === 0 ? 'disabled' : ''}>▲</button>
          <span class="blk-handle" draggable="true" title="拖曳排序" aria-label="拖曳排序">⠿</span>
          <button type="button" class="blk-move blk-down" data-move="down" title="下移" ${i === n - 1 ? 'disabled' : ''}>▼</button>
        </div>
        <div class="block block-${cls}" data-block-body="1"${editable}>${blockInnerHtml(b)}</div>
      </div>`;
    }).join('');
    closeSlashMenu(true);
  }

  function syncBlockContentFromDom(id) {
    const row = document.querySelector(`.block-row[data-id="${id}"]`);
    if (!row) return;
    const b = editorBlocks.find(x => x.id === id);
    if (!b || !isEditableType(b.type)) return;
    const body = row.querySelector('[data-block-body]');
    if (!body) return;
    if (b.type === 'list') {
      b.items = [...body.querySelectorAll('li')].map(li => li.textContent.trim()).filter(Boolean);
      if (!b.items.length) b.items = ['清單項目'];
    } else {
      b.content = body.textContent;
    }
    persistEditorState();
  }

  function moveBlock(id, dir) {
    const i = editorBlocks.findIndex(b => b.id === id);
    if (i < 0) return;
    const j = dir === 'up' ? i - 1 : i + 1;
    if (j < 0 || j >= editorBlocks.length) return;
    const tmp = editorBlocks[i];
    editorBlocks[i] = editorBlocks[j];
    editorBlocks[j] = tmp;
    persistEditorState();
    renderEditor();
    toast('已重排區塊');
  }

  function reorderBlocks(fromId, toId) {
    if (!fromId || !toId || fromId === toId) return;
    const from = editorBlocks.findIndex(b => b.id === fromId);
    const to = editorBlocks.findIndex(b => b.id === toId);
    if (from < 0 || to < 0) return;
    const [item] = editorBlocks.splice(from, 1);
    editorBlocks.splice(to, 0, item);
    persistEditorState();
    renderEditor();
    toast('已拖曳重排');
  }

  function makeBlock(type, payload) {
    payload = payload || {};
    const id = uid('b');
    if (type === 'h1') return { id, type: 'h1', content: payload.content != null ? payload.content : '新標題區塊' };
    if (type === 'h2') return { id, type: 'h2', content: payload.content != null ? payload.content : '小標題' };
    if (type === 'p') return { id, type: 'p', content: payload.content != null ? payload.content : '新段落——點此編輯內文。' };
    if (type === 'list') return { id, type: 'list', items: payload.items || ['第一點', '第二點'] };
    if (type === 'divider') return { id, type: 'divider' };
    if (type === 'img') return { id, type: 'img', src: payload.src || 'img/login-hero.png', caption: payload.caption || '圖片 block · 剛插入' };
    if (type === 'video') return { id, type: 'video', title: payload.title || '影片 embed', sub: payload.sub || '上載／URL · 新插入', url: payload.url || '' };
    if (type === 'vocab') return { id, type: 'vocab', words: payload.words || [{ en: 'sunny', zh: '晴朗' }, { en: 'humid', zh: '潮濕' }] };
    if (type === 'quiz' || type === 'mc') return { id, type: 'quiz', title: payload.title || '本課小測', prompt: payload.prompt || 'Which word means「毛毛雨」？' };
    return { id, type: 'p', content: payload.content != null ? payload.content : '新段落' };
  }

  function insertBlock(type, opts) {
    opts = opts || {};
    ensureEditorState();
    const block = makeBlock(type === 'mc' ? 'quiz' : type, opts.payload || opts);
    let idx = editorBlocks.length;
    if (opts.replaceId) {
      const i = editorBlocks.findIndex(b => b.id === opts.replaceId);
      if (i >= 0) {
        editorBlocks.splice(i, 1, block);
        idx = i;
      } else {
        editorBlocks.push(block);
        idx = editorBlocks.length - 1;
      }
    } else if (opts.afterId) {
      const i = editorBlocks.findIndex(b => b.id === opts.afterId);
      idx = i >= 0 ? i + 1 : editorBlocks.length;
      editorBlocks.splice(idx, 0, block);
    } else {
      editorBlocks.push(block);
      idx = editorBlocks.length - 1;
    }
    persistEditorState();
    renderEditor();
    toast('已插入：' + ({ h1: '標題', p: '段落', list: '清單', quiz: '小測', video: '影片', vocab: '生字', divider: '分隔線', img: '圖片', mc: '小測' }[type] || type));
    const row = document.querySelector(`.block-row[data-id="${block.id}"] [data-block-body]`);
    if (row && row.isContentEditable) {
      row.focus();
      placeCaretEnd(row);
    }
    return block;
  }

  /** Text types insert immediately; media/quiz open modal. */
  function requestInsert(type, opts) {
    opts = opts || {};
    const t = type === 'mc' ? 'quiz' : type;
    if (MODAL_INSERT_TYPES.has(t)) {
      if (opts.fromHint) {
        const hint = document.getElementById('editorAddHint');
        if (hint) hint.textContent = '';
      }
      // Clear /query text in the block being replaced so modal configure is the only UI
      if (opts.replaceId) {
        const b = editorBlocks && editorBlocks.find(x => x.id === opts.replaceId);
        if (b && isEditableType(b.type)) {
          if (b.type === 'list') b.items = ['清單項目'];
          else b.content = '';
          persistEditorState();
          const body = document.querySelector(`.block-row[data-id="${opts.replaceId}"] [data-block-body]`);
          if (body) body.textContent = b.type === 'list' ? '' : '';
        }
      }
      openInsertModal(t, opts);
      return null;
    }
    return insertBlock(t, opts);
  }

  function placeCaretEnd(el) {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function visibleSlashItems() {
    return [...document.querySelectorAll('#slashItems .slash-item')].filter(el => !el.classList.contains('hidden'));
  }

  function filterSlashMenu(query) {
    const q = (query || '').trim().toLowerCase();
    const items = [...document.querySelectorAll('#slashItems .slash-item')];
    let shown = 0;
    items.forEach(el => {
      const label = (el.querySelector('strong')?.textContent || '') + ' ' + (el.querySelector('.small')?.textContent || '');
      const keys = (el.dataset.keywords || '') + ' ' + (el.dataset.insert || '') + ' ' + label;
      const ok = !q || keys.toLowerCase().includes(q);
      el.classList.toggle('hidden', !ok);
      el.classList.remove('sel');
      if (ok) shown++;
    });
    document.getElementById('slashEmpty')?.classList.toggle('hidden', shown > 0);
    const vis = visibleSlashItems();
    slashState.index = 0;
    if (vis[0]) vis[0].classList.add('sel');
    const lbl = document.getElementById('slashQueryLbl');
    if (lbl) lbl.textContent = '/' + (query || '');
  }

  function openSlashMenu(opts) {
    opts = opts || {};
    const menu = document.getElementById('slashMenu');
    const canvas = document.getElementById('editorCanvas');
    if (!menu || !canvas) return;
    slashState.open = true;
    slashState.query = opts.query || '';
    slashState.replaceId = opts.replaceId || null;
    slashState.fromHint = !!opts.fromHint;
    filterSlashMenu(slashState.query);
    menu.classList.add('open');
    // position near trigger
    let top = 80, left = 48;
    if (opts.anchorEl) {
      const cRect = canvas.getBoundingClientRect();
      const aRect = opts.anchorEl.getBoundingClientRect();
      top = aRect.bottom - cRect.top + canvas.scrollTop + 6;
      left = Math.max(12, aRect.left - cRect.left);
    }
    menu.style.top = top + 'px';
    menu.style.left = left + 'px';
  }

  function closeSlashMenu(silent) {
    slashState.open = false;
    slashState.query = '';
    slashState.replaceId = null;
    slashState.fromHint = false;
    document.getElementById('slashMenu')?.classList.remove('open');
  }

  function toggleSlash() {
    if (slashState.open) closeSlashMenu();
    else {
      const hint = document.getElementById('editorAddHint');
      openSlashMenu({ fromHint: true, anchorEl: hint, query: '' });
      hint?.focus();
    }
  }

  function applySlashSelection() {
    const vis = visibleSlashItems();
    const item = vis[slashState.index] || vis[0];
    if (!item) return;
    const type = item.dataset.insert;
    const replaceId = slashState.replaceId;
    const fromHint = slashState.fromHint;
    closeSlashMenu();
    if (fromHint) {
      const hint = document.getElementById('editorAddHint');
      if (hint) hint.textContent = '';
      requestInsert(type, { fromHint: true });
    } else if (replaceId) {
      requestInsert(type, { replaceId });
    } else {
      requestInsert(type);
    }
  }

  function slashQueryFromText(text) {
    const t = String(text || '')
      .replace(/\u00a0/g, ' ')
      .replace(/\u200b/g, '')
      .replace(/\r/g, '')
      .replace(/\n/g, '')
      .trim();
    const m = t.match(/^\/(.*)$/);
    return m ? (m[1] || '') : null;
  }

  function detectSlashInEditable(el) {
    if (!el || !el.isContentEditable) return null;
    return slashQueryFromText(el.textContent || '');
  }

  /* —— events —— */
  window.addEventListener('hashchange', () => render(parseHash()));

  document.getElementById('roleSwitch').addEventListener('click', e => {
    const btn = e.target.closest('.role-btn');
    if (!btn) return;
    enterRole(btn.dataset.role);
  });

  document.getElementById('navChips').addEventListener('click', e => {
    const c = e.target.closest('.pchip');
    if (!c) return;
    navigate(c.dataset.route);
  });

  document.querySelector('.brand').addEventListener('click', () => navigate(ROLE_HOME[currentRole]));

  document.body.addEventListener('click', e => {
    const scrollBtn = e.target.closest('[data-scroll]');
    if (scrollBtn) {
      e.preventDefault();
      const target = document.getElementById(scrollBtn.dataset.scroll);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const go = e.target.closest('[data-go]');
    if (go) {
      e.preventDefault();
      const r = go.dataset.go;
      if (r === 'role-student') return enterRole('student');
      if (r === 'role-teacher') return enterRole('teacher');
      if (r === 'role-admin') return enterRole('admin');
      navigate(r);
      return;
    }
    const row = e.target.closest('tr.student-row');
    if (row && !e.target.closest('[data-drawer]')) {
      const idx = row.dataset.idx;
      row.classList.toggle('expanded');
      document.getElementById('detail-' + idx)?.classList.toggle('hidden');
      return;
    }
    const dr = e.target.closest('[data-drawer]');
    if (dr) {
      e.stopPropagation();
      openDrawer(Number(dr.dataset.drawer));
    }
  });

  document.getElementById('drawerBg').addEventListener('click', closeDrawer);
  document.getElementById('drawerClose').addEventListener('click', closeDrawer);

  wireChips('#subjFilter', () => {
    forceEmpty = false;
    applySubjectFilters();
  });
  wireChips('#catChips', () => {
    forceEmpty = false;
    applySubjectFilters();
  });
  wireChips('#homeFilter');
  wireChips('#resFilter');
  wireChips('#progRange', c => updateProgress(c.dataset.range));
  wireChips('#progSubj');
  wireChips('#repRange', c => renderReport(c.dataset.range));
  wireChips('#repSubj');
  wireChips('#heatRange', c => {
    buildRoomHeat(c.dataset.range);
    buildContribGraph('usageContrib', { weeks: 26, seed: c.dataset.range === 'term' ? 9 : c.dataset.range === 'month' ? 5 : 7, title: '全校活躍（GitHub 式）' });
  });
  // teacher post switch (any .post-switch)
  document.body.addEventListener('click', e => {
    const btn = e.target.closest('.post-switch .post-btn');
    if (!btn) return;
    applyTeacherPost(btn.dataset.post);
    document.querySelectorAll('.post-switch .post-btn').forEach(b => b.classList.toggle('active', b.dataset.post === currentPost));
    if (pageIdFromRoute(currentRoute) === 'assign' || currentRoute === '/assign') renderAssignScope(currentPost);
    if (pageIdFromRoute(currentRoute) === 'report' || currentRoute === '/report') {
      renderReport(document.querySelector('#repRange .chip.on')?.dataset.range || 'week');
      buildContribGraph('classHeat', { weeks: 12, seed: currentPost === 'grade' ? 33 : currentPost === 'subject' ? 44 : 22, title: '近 12 週完成量' });
    }
    toast('已切換職務：' + TEACHER_POSTS[currentPost].label);
  });

  // quiz create vs pick
  document.querySelector('.editor-toolbar')?.addEventListener('click', e => {
    const modalBtn = e.target.closest('[data-modal]');
    if (modalBtn) {
      requestInsert(modalBtn.dataset.modal);
      return;
    }
    const tb = e.target.closest('[data-tb-insert]');
    if (!tb) return;
    requestInsert(tb.dataset.tbInsert);
  });

  // admin user tabs
  document.getElementById('userTabs')?.addEventListener('click', e => {
    const c = e.target.closest('.chip');
    if (!c) return;
    document.querySelectorAll('#userTabs .chip').forEach(x => x.classList.remove('on'));
    c.classList.add('on');
    const tab = c.dataset.utab;
    document.querySelectorAll('#userBody tr').forEach(tr => {
      tr.classList.toggle('hidden', tr.dataset.utabRow !== tab);
    });
  });

  document.getElementById('btnAddClass')?.addEventListener('click', () => toast('新增班別（示範）'));

  // multi-select popover
  document.getElementById('msTrigger')?.addEventListener('click', e => {
    e.stopPropagation();
    const pop = document.getElementById('msPopover');
    const trig = document.getElementById('msTrigger');
    const open = !pop.classList.contains('open');
    pop.classList.toggle('open', open);
    trig.classList.toggle('open', open);
  });
  document.getElementById('msPopover')?.addEventListener('click', e => {
    e.stopPropagation();
    if (e.target.id === 'msClear') {
      assignSelected.clear();
      renderAssignScope(currentPost);
      return;
    }
    if (e.target.id === 'msDone') {
      document.getElementById('msPopover')?.classList.remove('open');
      document.getElementById('msTrigger')?.classList.remove('open');
      toast('已更新指派對象（' + assignSelected.size + '）');
      return;
    }
    const inp = e.target.closest('input[data-ms-id]');
    if (inp) {
      if (inp.checked) assignSelected.set(inp.dataset.msId, inp.dataset.msLabel);
      else assignSelected.delete(inp.dataset.msId);
      syncAssignChips();
    }
  });
  document.getElementById('msChips')?.addEventListener('click', e => {
    const rm = e.target.closest('[data-ms-remove]');
    if (!rm) return;
    assignSelected.delete(rm.dataset.msRemove);
    renderAssignScope(currentPost);
  });
  document.addEventListener('click', () => {
    document.getElementById('msPopover')?.classList.remove('open');
    document.getElementById('msTrigger')?.classList.remove('open');
  });

  // secondary insert bar → open modals (no inline panels)
  document.getElementById('attachBar')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-modal]');
    if (!btn) return;
    requestInsert(btn.dataset.modal);
  });

  // insert modal events
  document.getElementById('insertModalClose')?.addEventListener('click', closeInsertModal);
  document.getElementById('insertModalCancel')?.addEventListener('click', closeInsertModal);
  document.getElementById('insertModalBg')?.addEventListener('click', closeInsertModal);
  document.getElementById('insertModalConfirm')?.addEventListener('click', confirmInsertModal);
  document.getElementById('insertModalBody')?.addEventListener('click', e => {
    const mode = e.target.closest('[data-qmode]');
    if (mode) {
      const create = mode.dataset.qmode === 'create';
      document.querySelectorAll('#modalQuizModes .chip').forEach(c => c.classList.toggle('soft-on', c === mode));
      document.getElementById('modalQuizCreate')?.classList.toggle('hidden', !create);
      document.getElementById('modalQuizPick')?.classList.toggle('hidden', create);
      return;
    }
    if (e.target.closest('#modalAddVocabRow')) {
      const host = document.getElementById('modalVocabRows');
      if (!host) return;
      const row = document.createElement('div');
      row.className = 'vocab-row';
      row.innerHTML = '<input placeholder="英文／原文" /><input placeholder="中文／解釋" /><button type="button" class="btn btn-ghost btn-sm vocab-del">刪</button>';
      host.appendChild(row);
      return;
    }
    if (e.target.closest('.vocab-del')) {
      e.target.closest('.vocab-row')?.remove();
      return;
    }
    const preset = e.target.closest('.mi-preset');
    if (preset) {
      const src = document.getElementById('miSrc');
      if (src) src.value = preset.dataset.src || src.value;
      document.querySelectorAll('.mi-preset').forEach(c => c.classList.toggle('soft-on', c === preset));
    }
  });

  // admin subject CRUD demo
  document.getElementById('subjList')?.addEventListener('click', e => {
    const hide = e.target.closest('[data-subj-hide]');
    if (hide) {
      hide.closest('.subj-item')?.classList.toggle('hidden-subj');
      toast(hide.closest('.subj-item')?.classList.contains('hidden-subj') ? '已隱藏科目' : '已重新顯示');
      return;
    }
    const ren = e.target.closest('[data-subj-rename]');
    if (ren) {
      const name = ren.closest('.subj-item')?.querySelector('.subj-name');
      if (name) {
        const next = prompt('重新命名科目', name.textContent);
        if (next) { name.textContent = next; toast('已重新命名'); }
      }
    }
  });
  document.getElementById('btnAddSubj')?.addEventListener('click', () => {
    const name = prompt('新增科目名稱', '音樂');
    if (!name) return;
    const list = document.getElementById('subjList');
    const item = document.createElement('div');
    item.className = 'subj-item';
    item.innerHTML = `<span class="handle">⠿</span><strong class="subj-name">${name}</strong><span class="badge badge-frost">新</span><span style="flex:1"></span><button type="button" class="btn btn-ghost btn-sm" data-subj-rename>改名</button><button type="button" class="btn btn-ghost btn-sm" data-subj-hide>隱藏</button>`;
    list?.appendChild(item);
    toast('已新增科目：' + name);
  });


  document.getElementById('btnEmptyDemo')?.addEventListener('click', () => {
    forceEmpty = true;
    document.querySelectorAll('#subjFilter .chip').forEach(x => x.classList.remove('on'));
    // leave none on to simulate empty — mark assigned off intentionally
    applySubjectFilters();
    toast('示範：空狀態 empty.jpg');
  });

  document.getElementById('btnClearEmpty')?.addEventListener('click', () => {
    forceEmpty = false;
    document.querySelectorAll('#subjFilter .chip').forEach(x => x.classList.remove('on'));
    document.querySelector('#subjFilter .chip[data-f="assigned"]')?.classList.add('on');
    applySubjectFilters();
  });

  document.getElementById('editorAddHint')?.addEventListener('focus', () => {
    const hint = document.getElementById('editorAddHint');
    if (!hint) return;
    // keep empty for slash; strip leftover zero-width / nbsp
    if (!(hint.textContent || '').replace(/\u200b/g, '').trim()) hint.textContent = '';
  });
  document.getElementById('btnSlash')?.addEventListener('click', toggleSlash);
  document.getElementById('btnSlashTb')?.addEventListener('click', toggleSlash);

  document.getElementById('slashItems')?.addEventListener('click', e => {
    const item = e.target.closest('.slash-item');
    if (!item || item.classList.contains('hidden')) return;
    const vis = visibleSlashItems();
    slashState.index = Math.max(0, vis.indexOf(item));
    vis.forEach((x, i) => x.classList.toggle('sel', i === slashState.index));
    applySlashSelection();
  });

  /* —— editor canvas: reorder + slash —— */
  document.getElementById('editorCanvas')?.addEventListener('click', e => {
    const up = e.target.closest('[data-move]');
    if (up) {
      const row = up.closest('.block-row');
      if (row) moveBlock(row.dataset.id, up.dataset.move);
      return;
    }
  });

  document.getElementById('editorCanvas')?.addEventListener('input', e => {
    const body = e.target.closest('[data-block-body]');
    const hint = e.target.id === 'editorAddHint' ? e.target : null;
    if (body) {
      const row = body.closest('.block-row');
      const id = row?.dataset.id;
      if (id) syncBlockContentFromDom(id);
      const q = detectSlashInEditable(body);
      if (q !== null) {
        openSlashMenu({ query: q, replaceId: id, anchorEl: row || body });
      } else if (slashState.open && slashState.replaceId === id) {
        closeSlashMenu();
      }
      return;
    }
    if (hint) {
      const raw = (hint.textContent || '').replace(/\u200b/g, '').replace(/\u00a0/g, ' ');
      const q = slashQueryFromText(raw);
      if (q !== null) {
        openSlashMenu({ query: q, fromHint: true, anchorEl: hint });
      } else if (slashState.open && slashState.fromHint) {
        closeSlashMenu();
      }
      // Plain typing (not starting with /) → paragraph block immediately
      const trimmedStart = raw.replace(/^\s+/, '');
      if (trimmedStart && !trimmedStart.startsWith('/')) {
        const content = raw.replace(/\s+$/, '');
        hint.textContent = '';
        closeSlashMenu();
        insertBlock('p', { payload: { content } });
      }
    }
  });

  document.getElementById('editorCanvas')?.addEventListener('keydown', e => {
    const inEditor = e.target.closest('#editorCanvas');
    if (!inEditor) return;

    if (slashState.open) {
      const vis = visibleSlashItems();
      if (e.key === 'Escape') {
        e.preventDefault();
        // strip leading /query from current editable
        const body = e.target.closest('[data-block-body]');
        const hint = e.target.id === 'editorAddHint' ? e.target : null;
        if (body && detectSlashInEditable(body) !== null) {
          body.textContent = '';
          syncBlockContentFromDom(body.closest('.block-row')?.dataset.id);
        }
        if (hint) hint.textContent = '';
        closeSlashMenu();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!vis.length) return;
        slashState.index = (slashState.index + 1) % vis.length;
        vis.forEach((x, i) => x.classList.toggle('sel', i === slashState.index));
        vis[slashState.index]?.scrollIntoView({ block: 'nearest' });
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!vis.length) return;
        slashState.index = (slashState.index - 1 + vis.length) % vis.length;
        vis.forEach((x, i) => x.classList.toggle('sel', i === slashState.index));
        vis[slashState.index]?.scrollIntoView({ block: 'nearest' });
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        applySlashSelection();
        return;
      }
    }

    // Enter on add-hint without slash → paragraph (or empty paragraph)
    if (e.key === 'Enter' && !e.shiftKey) {
      const hint = e.target.id === 'editorAddHint' ? e.target : null;
      if (hint && !slashState.open) {
        e.preventDefault();
        const raw = (hint.textContent || '').replace(/\u200b/g, '').replace(/\u00a0/g, ' ').trim();
        hint.textContent = '';
        if (raw.startsWith('/')) return;
        insertBlock('p', { payload: { content: raw || '新段落——點此編輯內文。' } });
        return;
      }
    }

    // Start slash with `/` — open after browser inserts the character
    if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const body = e.target.closest('[data-block-body]');
      const hint = e.target.id === 'editorAddHint' ? e.target : null;
      const row = body && body.closest('.block-row');
      const canBody = !!(body && isEditableType(row && row.dataset.type) && !(body.textContent || '').trim());
      const canHint = !!(hint && !(hint.textContent || '').replace(/\u200b/g, '').trim());
      if (canBody || canHint) {
        requestAnimationFrame(function () {
          if (canBody) {
            const q = detectSlashInEditable(body);
            if (q !== null) openSlashMenu({ query: q, replaceId: row.dataset.id, anchorEl: row });
          } else if (canHint) {
            const q = slashQueryFromText(hint.textContent || '');
            if (q !== null) openSlashMenu({ query: q, fromHint: true, anchorEl: hint });
          }
        });
      }
    }
  });

  // Drag reorder via handle
  document.getElementById('editorCanvas')?.addEventListener('dragstart', e => {
    const handle = e.target.closest('.blk-handle');
    if (!handle) {
      // prevent dragging from contenteditable text
      if (e.target.closest('[data-block-body]')) e.preventDefault();
      return;
    }
    const row = handle.closest('.block-row');
    if (!row) return;
    dragBlockId = row.dataset.id;
    row.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', dragBlockId);
  });
  document.getElementById('editorCanvas')?.addEventListener('dragend', e => {
    document.querySelectorAll('.block-row.dragging,.block-row.drag-over').forEach(el => {
      el.classList.remove('dragging', 'drag-over');
    });
    dragBlockId = null;
  });
  document.getElementById('editorCanvas')?.addEventListener('dragover', e => {
    const row = e.target.closest('.block-row');
    if (!row || !dragBlockId) return;
    e.preventDefault();
    document.querySelectorAll('.block-row.drag-over').forEach(el => el.classList.remove('drag-over'));
    if (row.dataset.id !== dragBlockId) row.classList.add('drag-over');
  });
  document.getElementById('editorCanvas')?.addEventListener('drop', e => {
    const row = e.target.closest('.block-row');
    if (!row || !dragBlockId) return;
    e.preventDefault();
    reorderBlocks(dragBlockId, row.dataset.id);
    dragBlockId = null;
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (insertModalState.kind) {
        closeInsertModal();
        return;
      }
      if (slashState.open) closeSlashMenu();
    }
  });

  document.getElementById('btnPublish')?.addEventListener('click', () => toast('已發佈上架（示範）'));
  document.getElementById('btnAssignConfirm')?.addEventListener('click', () => {
    if (!assignSelected.size) return toast('請先選擇指派對象');
    toast('已確認指派（示範）· ' + TEACHER_POSTS[currentPost].label + ' · ' + assignSelected.size + ' 個對象');
  });
  document.getElementById('btnMarkDone')?.addEventListener('click', () => toast('已標記完成 ✓'));


  /* —— inline quiz (same-page attach) —— */
  document.body.addEventListener('click', e => {
    const opt = e.target.closest('.quiz-opt');
    if (opt) {
      const group = opt.closest('.quiz-opts');
      if (!group) return;
      group.querySelectorAll('.quiz-opt').forEach(o => {
        o.classList.remove('selected');
        const b = o.querySelector('.quiz-bullet');
        if (b) b.textContent = '○';
      });
      opt.classList.add('selected');
      const b = opt.querySelector('.quiz-bullet');
      if (b) b.textContent = '●';
      return;
    }
    const submit = e.target.closest('.quiz-submit');
    if (submit) {
      const root = submit.closest('[data-quiz]') || submit.closest('.quiz-attach');
      const id = root?.dataset.quiz || 'quiz';
      const answered = root ? root.querySelectorAll('.quiz-opt.selected').length : 0;
      const fills = root ? [...root.querySelectorAll('.quiz-fill')].filter(i => i.value.trim()).length : 0;
      toast('已提交小測（示範）· ' + id + ' · 已選 ' + answered + ' · 填空 ' + fills);
    }
  });

  document.getElementById('attachQuizSel')?.addEventListener('change', e => {
    const v = e.target.value || '';
    if (v.includes('獨立')) toast('將另存為獨立小測教材');
    else if (v.includes('不附加')) toast('已取消附加小測');
    else toast('附加小測：學生將在資源同頁看到「本課小測」');
  });

  hydrateSparks();

  // boot
  if (!location.hash || location.hash === '#') {
    location.hash = '#/login';
  } else {
    render(parseHash());
  }
})();
