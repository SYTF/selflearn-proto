/* 自學無窮 · clickable prototype */
(function () {
  const NAV = {
    student: [
      { route: '/home', label: '科目主頁' },
      { route: '/subject/eng', label: 'English' },
      { route: '/article/1', label: '文章' },
      { route: '/video/1', label: '影片' },
      { route: '/resource/vocab', label: '生字資源' },
      { route: '/progress', label: '我的進度' }
    ],
    teacher: [
      { route: '/teacher', label: 'Dashboard' },
      { route: '/assign', label: '指派' },
      { route: '/report', label: '班報表' },
      { route: '/editor', label: '上架／編輯' }
    ],
    admin: [
      { route: '/admin', label: '系統總覽' },
      { route: '/heatmap', label: '熱力圖' }
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

  function parseHash() {
    const raw = (location.hash || '#/login').replace(/^#/, '') || '/login';
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
    if (route === '/progress') return 'progress';
    if (route === '/teacher') return 'teacher';
    if (route === '/assign') return 'assign';
    if (route === '/report') return 'report';
    if (route === '/editor') return 'editor';
    if (route === '/admin') return 'admin';
    if (route === '/heatmap') return 'heatmap';
    return 'login';
  }

  function roleForRoute(route) {
    if (['/teacher', '/assign', '/report', '/editor'].some(p => route === p || route.startsWith(p))) return 'teacher';
    if (route === '/admin' || route === '/heatmap') return 'admin';
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
      buildCal();
    }
    if (pageId === 'report') {
      renderReport(document.querySelector('#repRange .chip.on')?.dataset.range || 'week');
      buildClassHeat();
    }
    if (pageId === 'heatmap') {
      buildRoomHeat(document.querySelector('#heatRange .chip.on')?.dataset.range || 'week');
    }
    if (pageId === 'subject') {
      applySubjectFilters();
    }
    window.scrollTo(0, 0);
  }

  function renderNav() {
    const nav = document.getElementById('navChips');
    nav.innerHTML = NAV[currentRole]
      .map(i => {
        const active =
          currentRoute === i.route ||
          (i.route.startsWith('/subject') && currentRoute.startsWith('/subject')) ||
          (i.route.startsWith('/article') && currentRoute.startsWith('/article')) ||
          (i.route.startsWith('/video') && currentRoute.startsWith('/video')) ||
          (i.route.startsWith('/resource') && currentRoute.startsWith('/resource'));
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

  function buildCal() {
    const el = document.getElementById('calHeat');
    const levels = [0, 1, 0, 2, 3, 1, 4, 2, 0, 1, 3, 4, 2, 1, 0, 2, 3, 1, 0, 4, 2, 3, 1, 2, 0, 1, 3, 4];
    el.innerHTML = levels
      .map((lv, i) => `<div class="hm-cell hm-${lv}" data-tip="Day ${i + 1}: ${lv * 2} 份完成"></div>`)
      .join('');
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
      <img src="img/mascot.jpg" style="border-radius:10px;height:100px;width:100%;object-fit:cover" alt=""/>
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

  function buildClassHeat() {
    const el = document.getElementById('classHeat');
    const lv = [1, 2, 3, 4, 2, 1, 0];
    el.innerHTML = lv
      .map((v, i) => `<div class="hm-cell hm-${v}" data-tip="週${'一二三四五六日'[i]}: ${v * 8} 人次"></div>`)
      .join('');
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

  function toggleSlash() {
    document.getElementById('slashMenu').classList.toggle('open');
  }

  function insertBlock(type) {
    const canvas = document.getElementById('editorCanvas');
    const hint = canvas.querySelector('.slash-hint');
    const html = {
      h1: `<div class="block block-h1" contenteditable="true">新標題區塊</div>`,
      p: `<div class="block block-p" contenteditable="true">新段落——點此編輯內文。</div>`,
      img: `<div class="block block-img"><img src="img/login-hero.jpg" alt=""/><div class="small muted" style="padding:6px 10px;background:var(--snow0)">圖片 block · 剛插入</div></div>`,
      video: `<div class="block block-video"><div style="width:56px;height:40px;border-radius:8px;background:var(--frost0);color:#fff;display:grid;place-items:center">▶</div><div><strong>影片 embed</strong><div class="small muted">新插入 · 00:00</div></div></div>`,
      vocab: `<div class="block block-vocab"><div class="between"><strong>生字 block</strong><span class="badge badge-g">新</span></div><div class="chips mt8"><span class="chip soft-on">sunny · 晴朗</span></div></div>`,
      mc: `<div class="block block-mc"><div class="between"><strong>MC 題 block</strong><span class="badge badge-frost">單選</span></div><div class="mt8" style="font-weight:600">新題目？</div><div class="mc-opt"><span>○</span> 選項 A</div><div class="mc-opt"><span>○</span> 選項 B</div></div>`
    };
    const wrap = document.createElement('div');
    wrap.innerHTML = html[type] || html.p;
    const node = wrap.firstElementChild;
    if (hint) canvas.insertBefore(node, hint);
    else canvas.appendChild(node);
    toast('已插入區塊：' + type);
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
  wireChips('#heatRange', c => buildRoomHeat(c.dataset.range));
  wireChips('#assignScope', c => {
    ['class', 'year', 'indiv'].forEach(s => {
      const el = document.getElementById('scope' + s.charAt(0).toUpperCase() + s.slice(1));
      if (el) el.classList.toggle('hidden', s !== c.dataset.scope);
    });
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

  document.getElementById('btnSlash')?.addEventListener('click', toggleSlash);
  document.getElementById('btnSlashTb')?.addEventListener('click', toggleSlash);

  document.querySelectorAll('#slashMenu .slash-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('#slashMenu .slash-item').forEach(x => x.classList.remove('sel'));
      item.classList.add('sel');
      insertBlock(item.dataset.insert);
      document.getElementById('slashMenu').classList.remove('open');
    });
  });

  document.getElementById('btnPublish')?.addEventListener('click', () => toast('已發佈上架（示範）'));
  document.getElementById('btnAssignConfirm')?.addEventListener('click', () => toast('已確認指派（示範）'));
  document.getElementById('btnMarkDone')?.addEventListener('click', () => toast('已標記完成 ✓'));

  hydrateSparks();

  // boot
  if (!location.hash || location.hash === '#') {
    location.hash = '#/login';
  } else {
    render(parseHash());
  }
})();
