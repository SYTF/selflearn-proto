const bcrypt = require('bcryptjs');
const { neon } = require('@neondatabase/serverless');
const { cleanUrl } = require('../api/_lib/db');

const PASSWORD = 'Demo123!';

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10, 0, 0, 0);
  return d;
}

function isoDay(d) {
  return d.toISOString().slice(0, 10);
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }
  const sql = neon(cleanUrl(url));
  const hash = bcrypt.hashSync(PASSWORD, 10);

  await sql`
    INSERT INTO subjects (slug, name, color, cover, tagline, sort_order, hidden, is_core) VALUES
      ('chi', '中文', '#BF616A', 'img/subj-chi.png', '閱讀 · 寫作 · 文言文入門', 1, false, true),
      ('eng', 'English', '#5E81AC', 'img/subj-eng.png', 'Vocab · Reading · Phonics', 2, false, true),
      ('math', '數學', '#A3BE8C', 'img/subj-math.png', '四則 · 圖形 · 應用題', 3, false, true),
      ('gs', '常識', '#B48EAD', 'img/subj-gs.png', '科學 · 社區 · STEM', 4, false, false),
      ('va', '視覺藝術', '#D08770', 'img/hero-continue.png', '繪畫 · 設計', 5, false, false)
    ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name, color = EXCLUDED.color, cover = EXCLUDED.cover,
      tagline = EXCLUDED.tagline, sort_order = EXCLUDED.sort_order, is_core = EXCLUDED.is_core
  `;

  const classes = [
    ['5A', '五年級', 'p5'],
    ['5B', '五年級', 'p5'],
    ['5C', '五年級', 'p5'],
    ['5D', '五年級', 'p5'],
    ['4A', '四年級', 'p4'],
    ['6C', '六年級', 'p6']
  ];
  for (const [name, grade, grade_key] of classes) {
    await sql`
      INSERT INTO classes (name, grade, grade_key)
      SELECT ${name}, ${grade}, ${grade_key}
      WHERE NOT EXISTS (SELECT 1 FROM classes WHERE name = ${name})
    `;
  }

  const class5a = (await sql`SELECT id FROM classes WHERE name = '5A'`)[0];
  const eng = (await sql`SELECT id FROM subjects WHERE slug = 'eng'`)[0];

  const users = [
    { username: 'admin', display_name: '系統管理員', role: 'admin', teacher_subrole: null, class_id: null, subject_id: null, status: 'active' },
    { username: 't.lee', display_name: '李老師', role: 'teacher', teacher_subrole: 'subject_teacher', class_id: class5a.id, subject_id: eng.id, status: 'active' },
    { username: 't.wang', display_name: '王老師', role: 'teacher', teacher_subrole: 'class_teacher', class_id: class5a.id, subject_id: null, status: 'active' },
    { username: 't.chan', display_name: '陳老師', role: 'teacher', teacher_subrole: 'subject_head', class_id: null, subject_id: eng.id, status: 'active' },
    { username: 's24012', display_name: '陳曉晴', role: 'student', teacher_subrole: null, class_id: class5a.id, subject_id: null, status: 'active' },
    { username: 's24018', display_name: '黃子軒', role: 'student', teacher_subrole: null, class_id: class5a.id, subject_id: null, status: 'active' },
    { username: 's24021', display_name: '林凱婷', role: 'student', teacher_subrole: null, class_id: class5a.id, subject_id: null, status: 'paused' },
    { username: 's24033', display_name: '李梓朗', role: 'student', teacher_subrole: null, class_id: class5a.id, subject_id: null, status: 'active' },
    { username: 's24041', display_name: '張詠心', role: 'student', teacher_subrole: null, class_id: class5a.id, subject_id: null, status: 'active' },
    { username: 's24055', display_name: '周浩然', role: 'student', teacher_subrole: null, class_id: class5a.id, subject_id: null, status: 'active' }
  ];
  for (const u of users) {
    await sql`
      INSERT INTO users (username, password_hash, display_name, role, teacher_subrole, class_id, subject_id, status)
      VALUES (${u.username}, ${hash}, ${u.display_name}, ${u.role}, ${u.teacher_subrole}, ${u.class_id}, ${u.subject_id}, ${u.status})
      ON CONFLICT (username) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        display_name = EXCLUDED.display_name,
        role = EXCLUDED.role,
        teacher_subrole = EXCLUDED.teacher_subrole,
        class_id = EXCLUDED.class_id,
        subject_id = EXCLUDED.subject_id,
        status = EXCLUDED.status
    `;
  }

  const wang = (await sql`SELECT id FROM users WHERE username = 't.wang'`)[0];
  const chan = (await sql`SELECT id FROM users WHERE username = 't.chan'`)[0];
  await sql`UPDATE classes SET homeroom_user_id = ${wang.id} WHERE name = '5A'`;

  const rainyBlocks = [
    { id: 'b-h1', type: 'h1', content: 'A Rainy Day at School' },
    { id: 'b-p1', type: 'p', content: 'It was a rainy Monday morning. The sky was grey, and the playground was wet. Students walked carefully into the school hall with umbrellas and raincoats.' },
    { id: 'b-h2', type: 'h2', content: 'In the classroom' },
    { id: 'b-p2', type: 'p', content: 'Miss Chan asked everyone to share one word about the weather. Some said drizzle, some said storm, and someone joked about frogs jumping in puddles.' },
    { id: 'b-img', type: 'img', src: 'img/hero-continue.png', caption: '插圖' },
    { id: 'b-h3', type: 'h2', content: 'What we learned' },
    { id: 'b-p3', type: 'p', content: 'We practised describing weather and feelings. Try writing three sentences using today’s new words before you close this page.' }
  ];
  const videoMeta = {
    duration: '04:32',
    chapters: [
      { t: '01:00', title: 'voiced /th/' },
      { t: '02:10', title: 'unvoiced /th/' },
      { t: '03:20', title: 'practice words' }
    ]
  };
  const vocabMeta = {
    words: [
      { n: '01', en: 'drizzle', zh: 'n. 毛毛雨', state: 'mastered' },
      { n: '02', en: 'forecast', zh: 'n. 天氣預報', state: 'review' },
      { n: '03', en: 'humid', zh: 'adj. 潮濕的', state: 'new' },
      { n: '04', en: 'breeze', zh: 'n. 微風', state: 'mastered' },
      { n: '05', en: 'thunder', zh: 'n. 雷聲', state: 'review' },
      { n: '06', en: 'umbrella', zh: 'n. 雨傘', state: 'mastered' }
    ]
  };

  const resources = [
    {
      slug: 'rainy-day',
      title: 'A Rainy Day at School',
      type: 'article',
      category: 'reading',
      cover: 'img/subj-eng.png',
      status: 'published',
      visibility: 'assigned',
      duration_label: '約 8 分',
      blocks: rainyBlocks,
      meta: {},
      created_by: chan.id
    },
    {
      slug: 'phonics-th',
      title: 'Phonics · /th/ sounds',
      type: 'video',
      category: 'video',
      cover: 'img/video.png',
      status: 'published',
      visibility: 'assigned',
      duration_label: '04:32',
      blocks: [{ id: 'v1', type: 'video', title: 'Phonics · /th/ sounds', sub: '04:32', url: '' }],
      meta: videoMeta,
      created_by: chan.id
    },
    {
      slug: 'weather-words',
      title: 'Unit 3 · Weather Words',
      type: 'vocab',
      category: 'vocab',
      cover: 'img/vocab.png',
      status: 'published',
      visibility: 'assigned',
      duration_label: '12 詞',
      blocks: [{ id: 'w1', type: 'vocab', words: vocabMeta.words.map((w) => ({ en: w.en, zh: w.zh })) }],
      meta: vocabMeta,
      created_by: chan.id
    },
    {
      slug: 'unit3-check',
      title: 'Unit 3 Check',
      type: 'quiz',
      category: 'quiz',
      cover: 'img/quiz.png',
      status: 'published',
      visibility: 'assigned',
      duration_label: '10 題',
      blocks: [{ id: 'q1', type: 'quiz', title: 'Unit 3 Check', prompt: 'Pick the odd one out (weather words).' }],
      meta: {},
      created_by: chan.id
    },
    {
      slug: 'campus-garden',
      title: 'Our Campus Garden',
      type: 'article',
      category: 'reading',
      cover: 'img/hero-continue.png',
      status: 'published',
      visibility: 'library',
      duration_label: '選讀',
      blocks: [{ id: 'g1', type: 'p', content: 'Our campus garden has tomatoes, herbs, and a small pond.' }],
      meta: {},
      created_by: chan.id
    },
    {
      slug: 'feelings-moods',
      title: 'Feelings & Moods',
      type: 'vocab',
      category: 'vocab',
      cover: 'img/vocab.png',
      status: 'published',
      visibility: 'assigned',
      duration_label: '8 詞',
      blocks: [{ id: 'f1', type: 'vocab', words: [{ en: 'happy', zh: '開心' }, { en: 'nervous', zh: '緊張' }] }],
      meta: {},
      created_by: chan.id
    },
    {
      slug: 'p4-shared-reading',
      title: 'P4 Shared Reading Pack',
      type: 'article',
      category: 'reading',
      cover: 'img/login-hero.png',
      status: 'draft',
      visibility: 'assigned',
      duration_label: '草稿',
      blocks: [{ id: 'd1', type: 'h1', content: 'P4 Shared Reading Pack' }, { id: 'd2', type: 'p', content: '草稿——科主任編輯中。' }],
      meta: {},
      created_by: chan.id
    }
  ];

  for (const r of resources) {
    await sql`
      INSERT INTO resources (slug, title, type, category, subject_id, cover, status, visibility, duration_label, blocks, meta, created_by)
      VALUES (
        ${r.slug}, ${r.title}, ${r.type}, ${r.category}, ${eng.id}, ${r.cover}, ${r.status},
        ${r.visibility}, ${r.duration_label}, ${JSON.stringify(r.blocks)}::jsonb,
        ${JSON.stringify(r.meta)}::jsonb, ${r.created_by}
      )
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title, type = EXCLUDED.type, category = EXCLUDED.category,
        cover = EXCLUDED.cover, status = EXCLUDED.status, visibility = EXCLUDED.visibility,
        duration_label = EXCLUDED.duration_label, blocks = EXCLUDED.blocks, meta = EXCLUDED.meta
    `;
  }

  const bySlug = {};
  for (const row of await sql`SELECT id, slug FROM resources`) bySlug[row.slug] = row.id;

  const questions = [
    { slug: 'rainy-day', key: 'article-1', sort: 1, qtype: 'mc', prompt: 'Which word means「毛毛雨」?', options: [{ val: 'a', label: 'thunder' }, { val: 'b', label: 'drizzle' }, { val: 'c', label: 'breeze' }], answer: 'b' },
    { slug: 'rainy-day', key: 'article-1', sort: 2, qtype: 'tf', prompt: 'The playground was dry on that Monday morning.', options: [{ val: 't', label: 'True 正確' }, { val: 'f', label: 'False 錯誤' }], answer: 'f' },
    { slug: 'rainy-day', key: 'article-1', sort: 3, qtype: 'fill', prompt: 'Students walked carefully into the school hall with ________ and raincoats.', options: null, answer: 'umbrellas|umbrella' },
    { slug: 'phonics-th', key: 'video-1', sort: 1, qtype: 'mc', prompt: 'Which word has a voiced /th/ sound?', options: [{ val: 'a', label: 'think' }, { val: 'b', label: 'this' }, { val: 'c', label: 'bath' }], answer: 'b' },
    { slug: 'phonics-th', key: 'video-1', sort: 2, qtype: 'tf', prompt: '/θ/ (unvoiced) and /ð/ (voiced) are both written as “th”.', options: [{ val: 't', label: 'True 正確' }, { val: 'f', label: 'False 錯誤' }], answer: 't' },
    { slug: 'phonics-th', key: 'video-1', sort: 3, qtype: 'fill', prompt: 'Complete: “____” (弟弟) starts with a voiced /th/.', options: null, answer: 'brother' },
    { slug: 'weather-words', key: 'vocab-1', sort: 1, qtype: 'mc', prompt: '「天氣預報」的英文是？', options: [{ val: 'a', label: 'thunder' }, { val: 'b', label: 'forecast' }, { val: 'c', label: 'humid' }], answer: 'b' },
    { slug: 'weather-words', key: 'vocab-1', sort: 2, qtype: 'tf', prompt: '“humid” means dry and cool.', options: [{ val: 't', label: 'True 正確' }, { val: 'f', label: 'False 錯誤' }], answer: 'f' },
    { slug: 'weather-words', key: 'vocab-1', sort: 3, qtype: 'fill', prompt: 'A gentle wind is called a ________.', options: null, answer: 'breeze' },
    { slug: 'unit3-check', key: 'standalone-1', sort: 1, qtype: 'mc', prompt: 'Pick the odd one out (weather words).', options: [{ val: 'a', label: 'drizzle' }, { val: 'b', label: 'forecast' }, { val: 'c', label: 'pencil' }], answer: 'c' },
    { slug: 'unit3-check', key: 'standalone-1', sort: 2, qtype: 'tf', prompt: 'Unit 3 focuses on weather vocabulary.', options: [{ val: 't', label: 'True 正確' }, { val: 'f', label: 'False 錯誤' }], answer: 't' },
    { slug: 'unit3-check', key: 'standalone-1', sort: 3, qtype: 'fill', prompt: 'Write one weather word you learned this unit: ________', options: null, answer: 'drizzle|forecast|humid|breeze|thunder|umbrella|rain' }
  ];

  for (const q of questions) {
    const rid = bySlug[q.slug];
    const exists = await sql`SELECT id FROM quiz_questions WHERE quiz_key = ${q.key} AND sort_order = ${q.sort}`;
    if (exists[0]) {
      await sql`
        UPDATE quiz_questions SET prompt = ${q.prompt}, qtype = ${q.qtype},
          options = ${q.options ? JSON.stringify(q.options) : null}::jsonb, answer = ${q.answer}, resource_id = ${rid}
        WHERE id = ${exists[0].id}
      `;
    } else {
      await sql`
        INSERT INTO quiz_questions (resource_id, quiz_key, sort_order, qtype, prompt, options, answer)
        VALUES (${rid}, ${q.key}, ${q.sort}, ${q.qtype}, ${q.prompt}, ${q.options ? JSON.stringify(q.options) : null}::jsonb, ${q.answer})
      `;
    }
  }

  const assignSlugs = ['rainy-day', 'phonics-th', 'weather-words', 'unit3-check', 'feelings-moods'];
  await sql`DELETE FROM assignments WHERE class_id = ${class5a.id}`;
  for (const slug of assignSlugs) {
    await sql`
      INSERT INTO assignments (resource_id, class_id, due_at, assigned_by)
      VALUES (${bySlug[slug]}, ${class5a.id}, ${'2026-09-12'}, ${chan.id})
    `;
  }

  const students = await sql`SELECT id, username FROM users WHERE role = 'student'`;
  const smap = {};
  students.forEach((s) => { smap[s.username] = s.id; });

  for (const s of students) {
    await sql`DELETE FROM progress WHERE user_id = ${s.id}`;
    await sql`DELETE FROM activity WHERE user_id = ${s.id}`;
  }

  const profiles = {
    s24012: { // 陳曉晴 — strong
      rainy: { open: 10, done: true, score: 100, min: 18 },
      phonics: { open: 8, done: true, score: 100, min: 12 },
      weather: { open: 9, done: true, score: 91, min: 20 },
      check: { open: 7, done: true, score: 85, min: 15 },
      feelings: { open: 6, done: true, score: 80, min: 10 },
      garden: { open: 4, done: true, score: 90, min: 8 },
      act: 0.85
    },
    s24018: { // 黃子軒 — not opened
      act: 0
    },
    s24021: { // 林凱婷 — barely
      weather: { open: 2, done: false, score: null, min: 3 },
      act: 0.15
    },
    s24033: { // 李梓朗
      rainy: { open: 8, done: true, score: 85, min: 14 },
      phonics: { open: 7, done: true, score: 80, min: 11 },
      weather: { open: 6, done: true, score: 84, min: 16 },
      check: { open: 5, done: true, score: 78, min: 12 },
      feelings: { open: 3, done: false, score: null, min: 4 },
      act: 0.7
    },
    s24041: {
      rainy: { open: 6, done: true, score: 78, min: 12 },
      phonics: { open: 5, done: true, score: 72, min: 10 },
      weather: { open: 4, done: true, score: 80, min: 11 },
      check: { open: 3, done: false, score: null, min: 5 },
      act: 0.55
    },
    s24055: {
      rainy: { open: 3, done: true, score: 62, min: 9 },
      phonics: { open: 2, done: false, score: null, min: 4 },
      weather: { open: 2, done: false, score: null, min: 3 },
      act: 0.35
    }
  };
  const slugMap = { rainy: 'rainy-day', phonics: 'phonics-th', weather: 'weather-words', check: 'unit3-check', feelings: 'feelings-moods', garden: 'campus-garden' };

  for (const [uname, prof] of Object.entries(profiles)) {
    const uid = smap[uname];
    if (!uid) continue;
    for (const [k, rec] of Object.entries(prof)) {
      if (k === 'act' || !rec || typeof rec !== 'object' || rec.open == null) continue;
      const rid = bySlug[slugMap[k]];
      if (!rid) continue;
      const opened = daysAgo(rec.open);
      const completed = rec.done ? daysAgo(Math.max(rec.open - 2, 0)) : null;
      await sql`
        INSERT INTO progress (user_id, resource_id, opened_at, completed_at, score, minutes)
        VALUES (${uid}, ${rid}, ${opened.toISOString()}, ${completed ? completed.toISOString() : null}, ${rec.score}, ${rec.min})
      `;
    }
    const density = prof.act || 0;
    for (let i = 0; i < 42; i++) {
      const d = daysAgo(i);
      const seed = Math.sin((uid + i) * 12.9898) * 43758.5453;
      const r = seed - Math.floor(seed);
      if (r > density) continue;
      const count = 1 + Math.floor(r * 4);
      await sql`
        INSERT INTO activity (user_id, day, count)
        VALUES (${uid}, ${isoDay(d)}::date, ${count})
        ON CONFLICT (user_id, day) DO UPDATE SET count = EXCLUDED.count
      `;
    }
  }

  const nUsers = (await sql`SELECT COUNT(*)::int AS n FROM users`)[0].n;
  const nRes = (await sql`SELECT COUNT(*)::int AS n FROM resources`)[0].n;
  console.log('seed ok · users', nUsers, '· resources', nRes, '· password', PASSWORD);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
