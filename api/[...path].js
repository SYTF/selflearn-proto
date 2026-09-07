const bcrypt = require('bcryptjs');
const { getSql } = require('./_lib/db');
const auth = require('./_lib/auth');
const access = require('./_lib/access');
const { gradeQuiz } = require('./_lib/grade');
const http = require('./_lib/http');

async function findUser(sql, id) {
  const rows = await sql`
    SELECT u.id, u.username, u.display_name, u.role, u.teacher_subrole,
      u.class_id, u.subject_id, u.status, u.password_hash,
      c.name AS class_name, s.slug AS subject_slug, s.name AS subject_name
    FROM users u
    LEFT JOIN classes c ON c.id = u.class_id
    LEFT JOIN subjects s ON s.id = u.subject_id
    WHERE u.id = ${id}
  `;
  return rows[0] || null;
}

async function findUserByUsername(sql, username) {
  const rows = await sql`
    SELECT u.id, u.username, u.display_name, u.role, u.teacher_subrole,
      u.class_id, u.subject_id, u.status, u.password_hash,
      c.name AS class_name, s.slug AS subject_slug, s.name AS subject_name
    FROM users u
    LEFT JOIN classes c ON c.id = u.class_id
    LEFT JOIN subjects s ON s.id = u.subject_id
    WHERE u.username = ${username}
  `;
  return rows[0] || null;
}

function requireUser(req, res) {
  return http.needUser(req, res, auth);
}

async function actor(req, res, sql) {
  const sess = requireUser(req, res);
  if (!sess) return null;
  const user = await findUser(sql, sess.uid);
  if (!user || user.status !== 'active') {
    http.fail(res, 401, '帳號已停用或無效');
    return null;
  }
  return user;
}

async function handleLogin(req, res, sql) {
  const body = await http.readBody(req);
  const username = String(body.username || '').trim();
  const password = String(body.password || '');
  if (!username || !password) return http.fail(res, 400, '請輸入帳號與密碼');
  const user = await findUserByUsername(sql, username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return http.fail(res, 401, '帳號或密碼錯誤');
  }
  if (user.status !== 'active') return http.fail(res, 403, '帳號已暫停');
  const token = auth.makeSession(user);
  http.send(res, 200, { user: access.publicUser(user) }, { 'Set-Cookie': auth.cookieHeader(token, req) });
}

function handleLogout(req, res) {
  http.send(res, 200, { ok: true }, { 'Set-Cookie': auth.clearCookieHeader(req) });
}

async function handleMe(req, res, sql) {
  const user = await actor(req, res, sql);
  if (!user) return;
  http.send(res, 200, { user: access.publicUser(user) });
}

async function handleSubjects(req, res, sql, id) {
  if (req.method === 'GET') {
    const rows = await sql`SELECT * FROM subjects ORDER BY sort_order, id`;
    return http.send(res, 200, { subjects: rows });
  }
  const user = await actor(req, res, sql);
  if (!user) return;
  if (!access.canManageSchool(user)) return http.fail(res, 403, '僅 Admin 可管理科目');
  if (req.method === 'POST') {
    const body = await http.readBody(req);
    const name = String(body.name || '').trim();
    if (!name) return http.fail(res, 400, '請輸入科目名稱');
    const slug = String(body.slug || name).trim().toLowerCase().replace(/\s+/g, '-');
    const max = await sql`SELECT COALESCE(MAX(sort_order), 0) AS m FROM subjects`;
    const rows = await sql`
      INSERT INTO subjects (slug, name, color, cover, tagline, sort_order, hidden, is_core)
      VALUES (${slug}, ${name}, ${body.color || '#5E81AC'}, ${body.cover || 'img/subj-eng.png'}, ${body.tagline || ''}, ${(max[0] && max[0].m) + 1}, false, false)
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
      RETURNING *
    `;
    return http.send(res, 200, { subject: rows[0] });
  }
  if ((req.method === 'PATCH' || req.method === 'PUT') && id) {
    const body = await http.readBody(req);
    const cur = (await sql`SELECT * FROM subjects WHERE id = ${Number(id)}`)[0];
    if (!cur) return http.fail(res, 404, '找不到科目');
    const name = body.name != null ? String(body.name).trim() : cur.name;
    const hidden = body.hidden != null ? !!body.hidden : cur.hidden;
    const sort = body.sort_order != null ? Number(body.sort_order) : cur.sort_order;
    const rows = await sql`
      UPDATE subjects SET name = ${name}, hidden = ${hidden}, sort_order = ${sort}
      WHERE id = ${Number(id)} RETURNING *
    `;
    return http.send(res, 200, { subject: rows[0] });
  }
  http.fail(res, 405, '方法不支援');
}

async function handleUsers(req, res, sql, id) {
  const user = await actor(req, res, sql);
  if (!user) return;
  if (req.method === 'GET') {
    if (!access.canManageSchool(user) && user.role !== 'teacher') {
      return http.fail(res, 403, '無權限');
    }
    const rows = await sql`
      SELECT u.id, u.username, u.display_name, u.role, u.teacher_subrole,
        u.class_id, u.subject_id, u.status,
        c.name AS class_name, s.name AS subject_name
      FROM users u
      LEFT JOIN classes c ON c.id = u.class_id
      LEFT JOIN subjects s ON s.id = u.subject_id
      ORDER BY u.role, u.id
    `;
    return http.send(res, 200, { users: rows.map(access.publicUser) });
  }
  if (!access.canManageSchool(user)) return http.fail(res, 403, '僅 Admin 可管理用戶');
  if (req.method === 'POST') {
    const body = await http.readBody(req);
    const username = String(body.username || '').trim();
    const display_name = String(body.display_name || '').trim();
    const role = String(body.role || 'student');
    const password = String(body.password || 'Demo123!');
    if (!username || !display_name) return http.fail(res, 400, '請輸入帳號與姓名');
    if (!['admin', 'teacher', 'student'].includes(role)) return http.fail(res, 400, '角色無效');
    const hash = bcrypt.hashSync(password, 10);
    const sub = body.teacher_subrole || null;
    const rows = await sql`
      INSERT INTO users (username, password_hash, display_name, role, teacher_subrole, class_id, subject_id, status)
      VALUES (
        ${username}, ${hash}, ${display_name}, ${role}, ${sub},
        ${body.class_id || null}, ${body.subject_id || null}, ${body.status || 'active'}
      )
      ON CONFLICT (username) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        role = EXCLUDED.role,
        teacher_subrole = EXCLUDED.teacher_subrole,
        class_id = EXCLUDED.class_id,
        subject_id = EXCLUDED.subject_id,
        status = EXCLUDED.status
      RETURNING id
    `;
    const created = await findUser(sql, rows[0].id);
    return http.send(res, 200, { user: access.publicUser(created) });
  }
  if ((req.method === 'PATCH' || req.method === 'PUT') && id) {
    const body = await http.readBody(req);
    const cur = await findUser(sql, Number(id));
    if (!cur) return http.fail(res, 404, '找不到用戶');
    const display_name = body.display_name != null ? String(body.display_name).trim() : cur.display_name;
    const status = body.status != null ? body.status : cur.status;
    const role = body.role != null ? body.role : cur.role;
    const sub = body.teacher_subrole !== undefined ? body.teacher_subrole : cur.teacher_subrole;
    const class_id = body.class_id !== undefined ? body.class_id : cur.class_id;
    const subject_id = body.subject_id !== undefined ? body.subject_id : cur.subject_id;
    await sql`
      UPDATE users SET
        display_name = ${display_name}, status = ${status}, role = ${role},
        teacher_subrole = ${sub}, class_id = ${class_id}, subject_id = ${subject_id}
      WHERE id = ${Number(id)}
    `;
    if (body.password) {
      const hash = bcrypt.hashSync(String(body.password), 10);
      await sql`UPDATE users SET password_hash = ${hash} WHERE id = ${Number(id)}`;
    }
    const updated = await findUser(sql, Number(id));
    return http.send(res, 200, { user: access.publicUser(updated) });
  }
  http.fail(res, 405, '方法不支援');
}

async function handleClasses(req, res, sql) {
  const user = await actor(req, res, sql);
  if (!user) return;
  if (req.method === 'GET') {
    const rows = await sql`
      SELECT c.*, u.display_name AS homeroom_name,
        (SELECT COUNT(*)::int FROM users su WHERE su.class_id = c.id AND su.role = 'student') AS student_count
      FROM classes c
      LEFT JOIN users u ON u.id = c.homeroom_user_id
      ORDER BY c.grade_key, c.name
    `;
    return http.send(res, 200, { classes: rows });
  }
  if (!access.canManageSchool(user)) return http.fail(res, 403, '僅 Admin 可管理班級');
  if (req.method === 'POST') {
    const body = await http.readBody(req);
    const name = String(body.name || '').trim();
    const grade = String(body.grade || '').trim() || '五年級';
    const grade_key = String(body.grade_key || 'p5').trim();
    if (!name) return http.fail(res, 400, '請輸入班別');
    const rows = await sql`
      INSERT INTO classes (name, grade, grade_key, homeroom_user_id)
      VALUES (${name}, ${grade}, ${grade_key}, ${body.homeroom_user_id || null})
      RETURNING *
    `;
    return http.send(res, 200, { class: rows[0] });
  }
  http.fail(res, 405, '方法不支援');
}

function resourceRoute(r) {
  if (r.type === 'article') return '/article/' + r.slug;
  if (r.type === 'video') return '/video/' + r.slug;
  if (r.type === 'vocab') return '/resource/' + r.slug;
  return '/quiz/' + r.slug;
}

async function assignedSet(sql, user) {
  if (user.role !== 'student') return new Set();
  const rows = await sql`
    SELECT resource_id FROM assignments
    WHERE class_id = ${user.class_id} OR user_id = ${user.id}
  `;
  return new Set(rows.map((r) => r.resource_id));
}

async function handleResources(req, res, sql, id, search) {
  const user = await actor(req, res, sql);
  if (!user) return;
  if (req.method === 'GET' && !id) {
    const subject = search.get('subject');
    let rows;
    if (subject) {
      rows = await sql`
        SELECT r.*, s.slug AS subject_slug, s.name AS subject_name
        FROM resources r JOIN subjects s ON s.id = r.subject_id
        WHERE s.slug = ${subject} OR s.id::text = ${subject}
        ORDER BY r.id
      `;
    } else {
      rows = await sql`
        SELECT r.*, s.slug AS subject_slug, s.name AS subject_name
        FROM resources r JOIN subjects s ON s.id = r.subject_id
        ORDER BY r.id
      `;
    }
    const assigned = await assignedSet(sql, user);
    const prog = user.role === 'student'
      ? await sql`SELECT resource_id, completed_at, score FROM progress WHERE user_id = ${user.id}`
      : [];
    const pmap = {};
    prog.forEach((p) => { pmap[p.resource_id] = p; });
    const list = rows
      .filter((r) => access.canViewResource(user, r, assigned.has(r.id)))
      .map((r) => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        type: r.type,
        category: r.category,
        subject_id: r.subject_id,
        subject_slug: r.subject_slug,
        subject_name: r.subject_name,
        cover: r.cover,
        status: r.status,
        visibility: r.visibility,
        duration_label: r.duration_label,
        is_assigned: assigned.has(r.id),
        in_progress: !!(pmap[r.id] && pmap[r.id].completed_at == null && pmap[r.id]),
        completed: !!(pmap[r.id] && pmap[r.id].completed_at),
        score: pmap[r.id] ? pmap[r.id].score : null,
        route: resourceRoute(r),
        can_write: access.canWriteResource(user, r)
      }));
    return http.send(res, 200, { resources: list, can_create: access.canWriteResource(user, user.role === 'admin' ? null : { subject_id: user.subject_id }) });
  }
  if (req.method === 'GET' && id) {
    const key = Number.isFinite(Number(id)) && String(Number(id)) === String(id) ? Number(id) : id;
    const rows = typeof key === 'number'
      ? await sql`SELECT r.*, s.slug AS subject_slug, s.name AS subject_name FROM resources r JOIN subjects s ON s.id = r.subject_id WHERE r.id = ${key}`
      : await sql`SELECT r.*, s.slug AS subject_slug, s.name AS subject_name FROM resources r JOIN subjects s ON s.id = r.subject_id WHERE r.slug = ${String(key)}`;
    const r = rows[0];
    if (!r) return http.fail(res, 404, '找不到教材');
    const assigned = await assignedSet(sql, user);
    if (!access.canViewResource(user, r, assigned.has(r.id))) return http.fail(res, 403, '無權限');
    const questions = await sql`
      SELECT id, quiz_key, sort_order, qtype, prompt, options FROM quiz_questions
      WHERE resource_id = ${r.id} ORDER BY sort_order, id
    `;
    if (user.role === 'student') {
      await sql`
        INSERT INTO progress (user_id, resource_id, opened_at, minutes)
        VALUES (${user.id}, ${r.id}, now(), 1)
        ON CONFLICT (user_id, resource_id) DO UPDATE SET
          opened_at = COALESCE(progress.opened_at, now()),
          minutes = progress.minutes + 1
      `;
      await sql`
        INSERT INTO activity (user_id, day, count) VALUES (${user.id}, CURRENT_DATE, 1)
        ON CONFLICT (user_id, day) DO UPDATE SET count = activity.count + 1
      `;
    }
    return http.send(res, 200, {
      resource: Object.assign({}, r, {
        is_assigned: assigned.has(r.id),
        can_write: access.canWriteResource(user, r),
        route: resourceRoute(r)
      }),
      questions
    });
  }
  if (req.method === 'POST') {
    const body = await http.readBody(req);
    const subject_id = Number(body.subject_id || user.subject_id);
    if (!access.canWriteResource(user, { subject_id })) {
      return http.fail(res, 403, '教材鎖定：僅 Admin 或本科科主任可建立／編輯');
    }
    const title = String(body.title || '').trim();
    if (!title) return http.fail(res, 400, '請輸入標題');
    const type = body.type || 'article';
    const slug = String(body.slug || ('r-' + Date.now())).trim();
    const rows = await sql`
      INSERT INTO resources (slug, title, type, category, subject_id, cover, status, visibility, duration_label, blocks, meta, created_by)
      VALUES (
        ${slug}, ${title}, ${type}, ${body.category || type}, ${subject_id},
        ${body.cover || 'img/subj-eng.png'}, ${body.status || 'draft'},
        ${body.visibility || 'assigned'}, ${body.duration_label || ''},
        ${JSON.stringify(body.blocks || [])}::jsonb,
        ${JSON.stringify(body.meta || {})}::jsonb,
        ${user.id}
      )
      RETURNING *
    `;
    return http.send(res, 200, { resource: rows[0] });
  }
  if ((req.method === 'PATCH' || req.method === 'PUT') && id) {
    const cur = (await sql`SELECT * FROM resources WHERE id = ${Number(id)} OR slug = ${String(id)}`)[0];
    if (!cur) return http.fail(res, 404, '找不到教材');
    if (!access.canWriteResource(user, cur)) {
      return http.fail(res, 403, '教材鎖定：僅 Admin 或本科科主任可建立／編輯／發佈');
    }
    const body = await http.readBody(req);
    const title = body.title != null ? String(body.title).trim() : cur.title;
    const status = body.status != null ? body.status : cur.status;
    const visibility = body.visibility != null ? body.visibility : cur.visibility;
    const blocks = body.blocks != null ? JSON.stringify(body.blocks) : JSON.stringify(cur.blocks);
    const meta = body.meta != null ? JSON.stringify(body.meta) : JSON.stringify(cur.meta);
    const cover = body.cover != null ? body.cover : cur.cover;
    const category = body.category != null ? body.category : cur.category;
    const rows = await sql`
      UPDATE resources SET
        title = ${title}, status = ${status}, visibility = ${visibility},
        blocks = ${blocks}::jsonb, meta = ${meta}::jsonb, cover = ${cover},
        category = ${category}, updated_at = now()
      WHERE id = ${cur.id}
      RETURNING *
    `;
    return http.send(res, 200, { resource: rows[0] });
  }
  http.fail(res, 405, '方法不支援');
}

async function handleAssign(req, res, sql) {
  const user = await actor(req, res, sql);
  if (!user) return;
  if (!access.canAssign(user)) return http.fail(res, 403, '無權指派');
  if (req.method !== 'POST') return http.fail(res, 405, '方法不支援');
  const body = await http.readBody(req);
  const resourceIds = Array.isArray(body.resource_ids) ? body.resource_ids : [];
  const classIds = Array.isArray(body.class_ids) ? body.class_ids : [];
  const userIds = Array.isArray(body.user_ids) ? body.user_ids : [];
  if (!resourceIds.length) return http.fail(res, 400, '請選擇教材');
  if (!classIds.length && !userIds.length) return http.fail(res, 400, '請選擇指派對象');
  let n = 0;
  for (const rid of resourceIds) {
    for (const cid of classIds) {
      await sql`
        INSERT INTO assignments (resource_id, class_id, due_at, assigned_by)
        VALUES (${Number(rid)}, ${Number(cid)}, ${body.due_at || null}, ${user.id})
      `;
      n += 1;
    }
    for (const uid of userIds) {
      await sql`
        INSERT INTO assignments (resource_id, user_id, due_at, assigned_by)
        VALUES (${Number(rid)}, ${Number(uid)}, ${body.due_at || null}, ${user.id})
      `;
      n += 1;
    }
  }
  http.send(res, 200, { ok: true, count: n });
}

async function handleProgress(req, res, sql) {
  const user = await actor(req, res, sql);
  if (!user) return;
  if (req.method === 'GET') {
    const rows = await sql`
      SELECT p.*, r.title, r.type, r.slug, r.cover, s.name AS subject_name
      FROM progress p
      JOIN resources r ON r.id = p.resource_id
      JOIN subjects s ON s.id = r.subject_id
      WHERE p.user_id = ${user.id}
      ORDER BY COALESCE(p.completed_at, p.opened_at) DESC NULLS LAST
    `;
    const acts = await sql`
      SELECT day, count FROM activity WHERE user_id = ${user.id} ORDER BY day
    `;
    return http.send(res, 200, { progress: rows, activity: acts });
  }
  if (req.method !== 'POST') return http.fail(res, 405, '方法不支援');
  const body = await http.readBody(req);
  const quizKey = body.quiz_key;
  let resource = null;
  if (body.resource_id) {
    resource = (await sql`SELECT * FROM resources WHERE id = ${Number(body.resource_id)}`)[0];
  } else if (body.slug) {
    resource = (await sql`SELECT * FROM resources WHERE slug = ${String(body.slug)}`)[0];
  } else if (quizKey) {
    resource = (await sql`
      SELECT r.* FROM resources r
      JOIN quiz_questions q ON q.resource_id = r.id
      WHERE q.quiz_key = ${quizKey}
      LIMIT 1
    `)[0];
  }
  if (!resource) return http.fail(res, 404, '找不到教材');
  let score = body.score != null ? Number(body.score) : null;
  let answers = body.answers || null;
  if (quizKey && answers) {
    const qs = await sql`SELECT id, sort_order, qtype, answer FROM quiz_questions WHERE quiz_key = ${quizKey} ORDER BY sort_order, id`;
    const g = gradeQuiz(qs, answers);
    score = g.score;
  }
  const completed = body.completed !== false;
  await sql`
    INSERT INTO progress (user_id, resource_id, opened_at, completed_at, score, answers, minutes)
    VALUES (${user.id}, ${resource.id}, now(), ${completed ? new Date().toISOString() : null}, ${score}, ${answers ? JSON.stringify(answers) : null}::jsonb, ${Number(body.minutes) || 5})
    ON CONFLICT (user_id, resource_id) DO UPDATE SET
      completed_at = COALESCE(EXCLUDED.completed_at, progress.completed_at),
      score = COALESCE(EXCLUDED.score, progress.score),
      answers = COALESCE(EXCLUDED.answers, progress.answers),
      minutes = progress.minutes + EXCLUDED.minutes,
      opened_at = COALESCE(progress.opened_at, now())
  `;
  await sql`
    INSERT INTO activity (user_id, day, count) VALUES (${user.id}, CURRENT_DATE, 1)
    ON CONFLICT (user_id, day) DO UPDATE SET count = activity.count + 1
  `;
  const row = (await sql`SELECT * FROM progress WHERE user_id = ${user.id} AND resource_id = ${resource.id}`)[0];
  http.send(res, 200, { progress: row, score });
}

async function handleDashboard(req, res, sql) {
  const user = await actor(req, res, sql);
  if (!user) return;
  if (user.role === 'student') {
    const assigned = await assignedSet(sql, user);
    const prog = await sql`SELECT * FROM progress WHERE user_id = ${user.id}`;
    const acts = await sql`SELECT day, count FROM activity WHERE user_id = ${user.id}`;
    const done = prog.filter((p) => p.completed_at).length;
    const opened = prog.filter((p) => p.opened_at).length;
    const minutes = prog.reduce((a, p) => a + (p.minutes || 0), 0);
    const scores = prog.filter((p) => p.score != null).map((p) => p.score);
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const assignedN = assigned.size || 1;
    http.send(res, 200, {
      user: access.publicUser(user),
      kpis: {
        done,
        hours: Math.round((minutes / 60) * 10) / 10,
        score: avg,
        pending: Math.max(assignedN - done, 0),
        opened,
        assigned: assigned.size,
        completion: Math.round((done / assignedN) * 100),
        ontime: assigned.size ? Math.min(100, 70 + done * 4) : 0
      },
      progress: prog,
      activity: acts
    });
    return;
  }
  if (user.role === 'teacher') {
    const classId = user.class_id;
    const students = classId
      ? await sql`
          SELECT u.id, u.display_name, u.username, u.status,
            COALESCE((SELECT COUNT(*) FROM progress p WHERE p.user_id = u.id AND p.opened_at IS NOT NULL), 0)::int AS opened,
            COALESCE((SELECT COUNT(*) FROM progress p WHERE p.user_id = u.id AND p.completed_at IS NOT NULL), 0)::int AS done,
            (SELECT ROUND(AVG(p.score)) FROM progress p WHERE p.user_id = u.id AND p.score IS NOT NULL) AS score
          FROM users u WHERE u.role = 'student' AND u.class_id = ${classId}
          ORDER BY done ASC, opened ASC, u.id
        `
      : await sql`
          SELECT u.id, u.display_name, u.username, u.status,
            COALESCE((SELECT COUNT(*) FROM progress p WHERE p.user_id = u.id AND p.opened_at IS NOT NULL), 0)::int AS opened,
            COALESCE((SELECT COUNT(*) FROM progress p WHERE p.user_id = u.id AND p.completed_at IS NOT NULL), 0)::int AS done,
            (SELECT ROUND(AVG(p.score)) FROM progress p WHERE p.user_id = u.id AND p.score IS NOT NULL) AS score
          FROM users u WHERE u.role = 'student'
          ORDER BY done ASC, opened ASC, u.id
        `;
    const resources = await sql`SELECT id, title, status, subject_id FROM resources ORDER BY id`;
    const follow = students.filter((s) => Number(s.opened) === 0 || Number(s.done) === 0).length;
    const avgDone = students.length ? Math.round(students.reduce((a, s) => a + Number(s.done), 0) / students.length) : 0;
    http.send(res, 200, {
      user: access.publicUser(user),
      students,
      resources,
      kpis: { follow, students: students.length, resources: resources.length, avgDone },
      can_write: access.canWriteResource(user, user.subject_id ? { subject_id: user.subject_id } : null)
    });
    return;
  }
  const ucount = await sql`SELECT role, COUNT(*)::int AS n FROM users GROUP BY role`;
  const active = await sql`SELECT COUNT(*)::int AS n FROM users WHERE status = 'active' AND role = 'student'`;
  const teachers = await sql`SELECT COUNT(*)::int AS n FROM users WHERE role = 'teacher'`;
  const pubs = await sql`SELECT COUNT(*)::int AS n FROM resources WHERE status = 'published'`;
  const avg = await sql`SELECT ROUND(AVG(score)) AS a FROM progress WHERE score IS NOT NULL`;
  const doneN = await sql`SELECT COUNT(*)::int AS n FROM progress WHERE completed_at IS NOT NULL`;
  const assignedN = await sql`SELECT COUNT(DISTINCT resource_id)::int AS n FROM assignments`;
  http.send(res, 200, {
    user: access.publicUser(user),
    kpis: {
      students: (ucount.find((r) => r.role === 'student') || {}).n || 0,
      teachers: (teachers[0] && teachers[0].n) || 0,
      published: (pubs[0] && pubs[0].n) || 0,
      avg: (avg[0] && avg[0].a) || 0,
      completion: assignedN[0] && assignedN[0].n ? Math.round(((doneN[0] && doneN[0].n) || 0) / Math.max(assignedN[0].n, 1) * 20) : 0,
      active: (active[0] && active[0].n) || 0
    }
  });
}

async function handleHealth(res, sql) {
  try {
    await sql`SELECT 1 AS ok`;
    http.send(res, 200, { ok: true });
  } catch (e) {
    http.fail(res, 500, 'db down');
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }
  let sql;
  try {
    sql = getSql();
  } catch (e) {
    return http.fail(res, 500, e.message);
  }
  const { parts, search } = http.pathParts(req);
  const [a, b] = parts;
  try {
    if (!a || a === 'health') return await handleHealth(res, sql);
    if (a === 'auth' && b === 'login' && req.method === 'POST') return await handleLogin(req, res, sql);
    if (a === 'auth' && b === 'logout' && req.method === 'POST') return handleLogout(req, res);
    if (a === 'auth' && (b === 'me' || !b) && req.method === 'GET') return await handleMe(req, res, sql);
    if (a === 'subjects') return await handleSubjects(req, res, sql, b);
    if (a === 'users') return await handleUsers(req, res, sql, b);
    if (a === 'classes') return await handleClasses(req, res, sql);
    if (a === 'resources') return await handleResources(req, res, sql, b, search);
    if (a === 'assign') return await handleAssign(req, res, sql);
    if (a === 'progress') return await handleProgress(req, res, sql);
    if (a === 'dashboard') return await handleDashboard(req, res, sql);
    http.fail(res, 404, 'not found');
  } catch (e) {
    console.error(e);
    http.fail(res, 500, e.message || 'server error');
  }
};
