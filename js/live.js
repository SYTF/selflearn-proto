/* Live API wiring — same UI, real Neon session */
(function () {
  const DEMO = {
    student: { username: 's24012', password: 'Demo123!' },
    teacher: { username: 't.wang', password: 'Demo123!' },
    admin: { username: 'admin', password: 'Demo123!' }
  };
  const P = () => window.SelfLearnProto;
  let me = null;
  let subjects = [];
  let editingId = null;

  function toast(msg) {
    if (P() && P().toast) P().toast(msg);
  }

  async function api(path, opts) {
    opts = opts || {};
    const res = await fetch('/api/' + path.replace(/^\//, ''), {
      method: opts.method || 'GET',
      credentials: 'include',
      headers: opts.body ? { 'Content-Type': 'application/json' } : undefined,
      body: opts.body ? JSON.stringify(opts.body) : undefined
    });
    let data = {};
    try { data = await res.json(); } catch (e) { data = {}; }
    if (!res.ok) {
      const err = new Error(data.error || ('HTTP ' + res.status));
      err.status = res.status;
      throw err;
    }
    return data;
  }

  function applySession(user) {
    me = user;
    if (!user || !P()) return;
    P().setRole(user.role);
    const av = document.getElementById('avatarLbl');
    if (av) av.textContent = user.role === 'student' ? '學' : user.role === 'teacher' ? '師' : '管';
    const hello = document.getElementById('homeHello');
    if (hello) {
      const n = user.display_name || user.username;
      hello.textContent = user.role === 'student' ? '你好，' + n : '你好，' + n;
    }
    if (user.role === 'teacher' && user.teacher_subrole === 'subject_head') P().applyTeacherPost('subject');
    else if (user.role === 'teacher' && user.teacher_subrole === 'class_teacher') P().applyTeacherPost('class');
  }

  async function login(username, password) {
    const errEl = document.getElementById('loginErr');
    if (errEl) { errEl.hidden = true; errEl.textContent = ''; }
    try {
      const data = await api('auth/login', { method: 'POST', body: { username, password } });
      applySession(data.user);
      P().enterRole(data.user.role);
    } catch (e) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = e.message || '登入失敗';
      }
      toast(e.message || '登入失敗');
    }
  }

  async function demoLogin(role) {
    const acc = DEMO[role] || DEMO.student;
    return login(acc.username, acc.password);
  }

  async function restore() {
    try {
      const data = await api('auth/me');
      applySession(data.user);
      if ((location.hash || '#/login') === '#/login' || location.hash === '#' || !location.hash) {
        P().enterRole(data.user.role);
      }
    } catch (e) {
      me = null;
    }
  }

  function collectQuiz(root) {
    const answers = {};
    if (!root) return answers;
    root.querySelectorAll('.quiz-q').forEach((q) => {
      const n = q.dataset.q;
      const sel = q.querySelector('.quiz-opt.selected');
      const fill = q.querySelector('.quiz-fill');
      if (sel) answers[n] = sel.dataset.val;
      else if (fill) answers[n] = fill.value.trim();
    });
    return answers;
  }

  async function submitQuiz(root) {
    const answers = collectQuiz(root);
    const quiz_key = root?.dataset.quiz;
    try {
      const data = await api('progress', { method: 'POST', body: { quiz_key, answers, completed: true } });
      toast('已提交小測 · 分數 ' + (data.score != null ? data.score : '—') + ' 分');
    } catch (e) {
      toast(e.message || '提交失敗');
    }
  }

  async function markDone() {
    try {
      await api('progress', { method: 'POST', body: { slug: 'rainy-day', completed: true, minutes: 8 } });
      toast('已標記完成 ✓');
    } catch (e) {
      toast(e.message || '無法標記');
    }
  }

  async function saveResource(status) {
    if (!P()) return;
    const blocks = P().getEditorBlocks() || [];
    const titleBlock = blocks.find((b) => b.type === 'h1');
    const title = (titleBlock && titleBlock.content) || '未命名教材';
    const sel = document.getElementById('edSubject');
    const cat = document.getElementById('edCategory');
    const vis = document.getElementById('edVisibility');
    const subject = subjects.find((s) => sel && sel.value && sel.value.indexOf(s.name) !== -1) || subjects.find((s) => s.slug === 'eng');
    const catVal = cat ? cat.value : '閱讀 Reading';
    let category = 'reading';
    if (/生字|Vocab/i.test(catVal)) category = 'vocab';
    else if (/影片/.test(catVal)) category = 'video';
    else if (/小測/.test(catVal)) category = 'quiz';
    const type = category === 'reading' ? 'article' : category;
    const body = {
      title,
      type,
      category,
      subject_id: subject && subject.id,
      status,
      visibility: vis ? vis.value : 'assigned',
      blocks,
      cover: 'img/subj-eng.png'
    };
    try {
      let data;
      if (editingId) {
        data = await api('resources/' + editingId, { method: 'PATCH', body: body });
      } else {
        body.slug = 'ed-' + Date.now();
        data = await api('resources', { method: 'POST', body: body });
        editingId = data.resource && data.resource.id;
      }
      toast(status === 'published' ? '已發佈上架' : '已儲存草稿');
    } catch (e) {
      toast(e.message || '儲存失敗');
    }
  }

  async function assign() {
    const selected = P() && P().getAssignSelected ? P().getAssignSelected() : new Map();
    if (!selected.size) return toast('請先選擇指派對象');
    try {
      const res = await api('resources');
      const classRows = await api('classes');
      const published = (res.resources || []).filter((r) => r.status === 'published').map((r) => r.id);
      const classIds = [];
      const userIds = [];
      selected.forEach((label, id) => {
        if (String(id).startsWith('c-') || /^[0-9]+$/.test(id) === false && String(label).match(/^\d?[A-Z]/)) {
          const cls = (classRows.classes || []).find((c) => label.indexOf(c.name) !== -1);
          if (cls) classIds.push(cls.id);
        }
        if (String(id).startsWith('s-') || /同學|學生/.test(label) === false) {
          /* resolved below */
        }
      });
      const users = (await api('users').catch(() => ({ users: [] }))).users || [];
      selected.forEach((label) => {
        const u = users.find((x) => label.indexOf(x.display_name) !== -1);
        if (u && u.role === 'student') userIds.push(u.id);
        const cls = (classRows.classes || []).find((c) => label.indexOf(c.name) !== -1 && !label.includes('·'));
        if (cls && !classIds.includes(cls.id) && /全級|年級/.test(label) === false) classIds.push(cls.id);
      });
      const due = document.querySelector('#pg-assign input[type="date"]');
      await api('assign', {
        method: 'POST',
        body: {
          resource_ids: published.slice(0, 4),
          class_ids: classIds,
          user_ids: userIds.filter((id) => !classIds.length || true),
          due_at: due && due.value
        }
      });
      toast('已確認指派 · ' + selected.size + ' 個對象');
    } catch (e) {
      toast(e.message || '指派失敗');
    }
  }

  function subroleLabel(u) {
    if (u.role === 'admin') return 'Admin';
    if (u.role === 'student') return '學生';
    const map = { class_teacher: '老師 · 班主任', subject_head: '老師 · 科主任', subject_teacher: '老師 · 一班老師' };
    return map[u.teacher_subrole] || '老師';
  }

  function scopeLabel(u) {
    if (u.class_name && u.subject_name) return u.class_name + ' · ' + u.subject_name;
    return u.class_name || u.subject_name || '—';
  }

  async function hydrateUsers() {
    const data = await api('users');
    const body = document.getElementById('userBody');
    if (!body) return;
    const tab = document.querySelector('#userTabs .chip.on')?.dataset.utab || 'students';
    body.innerHTML = (data.users || []).map((u) => {
      const row = u.role === 'admin' ? 'admins' : u.role === 'teacher' ? 'teachers' : 'students';
      const st = u.status === 'paused'
        ? '<span class="badge badge-y">暫停</span>'
        : '<span class="badge badge-g">啟用</span>';
      const hidden = row === tab ? '' : ' class="hidden"';
      return `<tr data-utab-row="${row}" data-user-id="${u.id}"${hidden}>
        <td>${u.display_name}</td><td>${u.username}</td><td>${subroleLabel(u)}</td>
        <td>${scopeLabel(u)}</td><td>${st}</td></tr>`;
    }).join('');
  }

  async function addUser() {
    const display_name = prompt('姓名', '新同學');
    if (!display_name) return;
    const username = prompt('帳號', 's' + Date.now().toString().slice(-5));
    if (!username) return;
    const role = prompt('角色 admin / teacher / student', 'student');
    try {
      await api('users', {
        method: 'POST',
        body: { display_name, username, role: role || 'student', password: 'Demo123!' }
      });
      toast('已新增用戶：' + display_name);
      await hydrateUsers();
    } catch (e) {
      toast(e.message || '新增失敗');
    }
  }

  async function hydrateClasses() {
    const data = await api('classes');
    const tbody = document.querySelector('#pg-admin-classes tbody');
    if (!tbody) return;
    tbody.innerHTML = (data.classes || []).map((c) =>
      `<tr><td><strong>${c.name}</strong></td><td>${c.grade}</td><td>${c.student_count}</td>
       <td>${c.homeroom_name || '—'}</td>
       <td><button type="button" class="btn btn-ghost btn-sm">編輯</button></td></tr>`
    ).join('');
  }

  async function addClass() {
    const name = prompt('班別（例如 5E）', '5E');
    if (!name) return;
    const grade = prompt('年級', '五年級') || '五年級';
    try {
      await api('classes', { method: 'POST', body: { name, grade, grade_key: 'p5' } });
      toast('已新增班別：' + name);
      await hydrateClasses();
    } catch (e) {
      toast(e.message || '新增失敗');
    }
  }

  async function hydrateSubjects() {
    const data = await api('subjects');
    subjects = data.subjects || [];
    const list = document.getElementById('subjList');
    if (!list) return;
    list.innerHTML = subjects.map((s) => {
      const hiddenClass = s.hidden ? ' hidden-subj' : '';
      const core = s.is_core ? '<span class="badge badge-frost">核心</span>' : '';
      return `<div class="subj-item${hiddenClass}" data-subj-id="${s.id}" data-hidden="${s.hidden ? '1' : '0'}">
        <span class="handle">⠿</span><strong class="subj-name">${s.name}</strong>${core}
        <span style="flex:1"></span>
        <button type="button" class="btn btn-ghost btn-sm" data-subj-rename>改名</button>
        <button type="button" class="btn btn-ghost btn-sm" data-subj-hide>${s.hidden ? '顯示' : '隱藏'}</button>
      </div>`;
    }).join('');
    const ed = document.getElementById('edSubject');
    if (ed && subjects.length) {
      ed.innerHTML = subjects.filter((s) => !s.hidden).map((s) => `<option value="${s.id}">${s.name}</option>`).join('');
    }
  }

  async function addSubject() {
    const name = prompt('新增科目名稱', '音樂');
    if (!name) return;
    try {
      await api('subjects', { method: 'POST', body: { name } });
      toast('已新增科目：' + name);
      await hydrateSubjects();
    } catch (e) {
      toast(e.message || '新增失敗');
    }
  }

  async function renameSubject(btn) {
    const item = btn.closest('.subj-item');
    const id = item && item.dataset.subjId;
    const name = item && item.querySelector('.subj-name');
    const next = prompt('重新命名科目', name ? name.textContent : '');
    if (!next || !id) return;
    try {
      await api('subjects/' + id, { method: 'PATCH', body: { name: next } });
      toast('已重新命名');
      await hydrateSubjects();
    } catch (e) {
      toast(e.message || '改名失敗');
    }
  }

  async function toggleSubject(btn) {
    const item = btn.closest('.subj-item');
    const id = item && item.dataset.subjId;
    const hidden = item && item.dataset.hidden === '1';
    if (!id) return;
    try {
      await api('subjects/' + id, { method: 'PATCH', body: { hidden: !hidden } });
      toast(hidden ? '已重新顯示' : '已隱藏科目');
      await hydrateSubjects();
    } catch (e) {
      toast(e.message || '更新失敗');
    }
  }

  function catOf(r) {
    return r.category || r.type;
  }

  async function hydrateSubjectGrid() {
    try {
      const data = await api('resources?subject=eng');
      const grid = document.getElementById('matGrid');
      if (!grid) return;
      const list = data.resources || [];
      if (!list.length) return;
      grid.innerHTML = list.map((r) => {
        const assigned = r.is_assigned ? '1' : '0';
        const progress = r.in_progress ? '1' : '0';
        const badges = [];
        if (r.is_assigned) badges.push('<span class="badge badge-g">已指派</span>');
        if (r.in_progress) badges.push('<span class="badge badge-y">進行中</span>');
        if (r.visibility === 'library') badges.push('<span class="badge badge-frost">圖書館</span>');
        const cover = r.cover || 'img/subj-eng.png';
        const label = { vocab: '生字', reading: '閱讀', video: '影片', quiz: '獨立小測', article: '閱讀' }[catOf(r)] || '教材';
        const badgeCls = catOf(r) === 'quiz' ? 'badge-y' : catOf(r) === 'reading' || catOf(r) === 'article' ? 'badge-p' : 'badge-frost';
        return `<div class="card mat-card s4" data-cat="${catOf(r)}" data-assigned="${assigned}" data-progress="${progress}" data-go="${r.route}">
          <img class="thumb" src="${cover}" alt="" />
          <div class="card-pad">
            <div class="between"><span class="badge ${badgeCls}">${label}</span><span class="small muted">${r.duration_label || ''}</span></div>
            <div class="h2 mt8">${r.title}</div>
            <div class="mat-meta">${badges.join('')}</div>
          </div>
        </div>`;
      }).join('');
      if (P().applySubjectFilters) P().applySubjectFilters();
    } catch (e) { /* keep proto cards */ }
  }

  async function hydrateStudentHome() {
    try {
      const dash = await api('dashboard');
      const k = dash.kpis || {};
      const hello = document.getElementById('homeHello');
      if (hello && dash.user) hello.textContent = '你好，' + dash.user.display_name;
      const doneN = document.querySelector('#pg-home .kpi .n');
      const kpis = document.querySelectorAll('#pg-home .card.kpi .n');
      if (kpis[0]) kpis[0].textContent = String(k.done != null ? k.done : kpis[0].textContent);
      if (kpis[1]) kpis[1].innerHTML = (k.hours != null ? k.hours : '3.2') + '<span class="unit">h</span>';
      if (kpis[3]) kpis[3].textContent = String(k.pending != null ? k.pending : kpis[3].textContent);
    } catch (e) { /* keep proto */ }
  }

  async function hydrateProgress() {
    try {
      const dash = await api('dashboard');
      const k = dash.kpis || {};
      const dn = document.getElementById('kpiDoneN');
      const hn = document.getElementById('kpiHoursN');
      const sn = document.getElementById('kpiScoreN');
      if (dn) dn.textContent = String(k.done != null ? k.done : dn.textContent);
      if (hn) hn.innerHTML = (k.hours != null ? k.hours : '3.2') + '<span class="unit">h</span>';
      if (sn) sn.textContent = String(k.score != null ? k.score : sn.textContent);
      if (P().buildContribGraph) {
        P().buildContribGraph('calHeat', { weeks: 16, seed: (me && me.id) || 11 });
      }
    } catch (e) { /* keep proto */ }
  }

  async function hydrateTeacher() {
    try {
      const dash = await api('dashboard');
      const students = (dash.students || []).map((s) => ({
        name: s.display_name,
        opened: Number(s.opened) || 0,
        done: Number(s.done) || 0,
        score: s.score == null ? '—' : Number(s.score),
        spark: [2, 3, 2, 4, 3, Number(s.done) || 0, Number(s.opened) || 0],
        risk: Number(s.opened) === 0 || Number(s.done) === 0
      }));
      if (students.length && P().setStudents) P().setStudents(students);
      const roster = document.querySelector('#pg-teacher .post-panel[data-post="class"] .stack.gap8');
      if (roster && students.length) {
        roster.innerHTML = students.slice(0, 3).map((s) =>
          `<div class="between"><span>${s.name}</span><span class="badge ${s.risk ? 'badge-r' : 'badge-g'}">${s.risk ? '未打開' : '已完成'}</span></div>`
        ).join('');
      }
    } catch (e) { /* keep proto */ }
  }

  async function hydrateAdmin() {
    try {
      const dash = await api('dashboard');
      const k = dash.kpis || {};
      const ns = document.querySelectorAll('#pg-admin .card.kpi .n');
      if (ns[0] && k.students != null) ns[0].textContent = String(k.students);
      if (ns[1] && k.teachers != null) ns[1].textContent = String(k.teachers);
      if (ns[3] && k.avg != null) ns[3].textContent = String(k.avg);
    } catch (e) { /* keep proto */ }
  }

  async function onRender(pageId) {
    if (pageId === 'login') return;
    if (!me) {
      try {
        const data = await api('auth/me');
        applySession(data.user);
      } catch (e) {
        return;
      }
    }
    if (pageId === 'home') hydrateStudentHome();
    if (pageId === 'subject') hydrateSubjectGrid();
    if (pageId === 'progress') hydrateProgress();
    if (pageId === 'teacher' || pageId === 'report') {
      await hydrateTeacher();
      if (pageId === 'report' && P().renderReport) {
        P().renderReport(document.querySelector('#repRange .chip.on')?.dataset.range || 'week');
      }
    }
    if (pageId === 'admin') hydrateAdmin();
    if (pageId === 'admin-users') hydrateUsers();
    if (pageId === 'admin-classes') hydrateClasses();
    if (pageId === 'admin-subjects') hydrateSubjects();
    if (pageId === 'editor') hydrateSubjects();
  }

  document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    login(document.getElementById('loginUser').value, document.getElementById('loginPass').value);
  });

  document.getElementById('btnAddUser')?.addEventListener('click', () => addUser());

  document.getElementById('avatarLbl')?.addEventListener('click', async () => {
    if (!me) return;
    if (!confirm('登出？')) return;
    try { await api('auth/logout', { method: 'POST' }); } catch (e) { /* ignore */ }
    me = null;
    location.hash = '#/login';
    toast('已登出');
  });

  window.SelfLearnLive = {
    demoLogin,
    onRender,
    submitQuiz,
    markDone,
    publish: () => saveResource('published'),
    saveDraft: () => saveResource('draft'),
    assign,
    addClass,
    addSubject,
    renameSubject,
    toggleSubject
  };

  restore();
})();
