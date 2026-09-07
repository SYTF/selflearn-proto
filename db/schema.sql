-- Cyber Book / 自學無窮  schema (idempotent)

CREATE TABLE IF NOT EXISTS subjects (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  color TEXT,
  cover TEXT,
  tagline TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  hidden BOOLEAN NOT NULL DEFAULT FALSE,
  is_core BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS classes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  grade TEXT NOT NULL,
  grade_key TEXT NOT NULL,
  homeroom_user_id INT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
  teacher_subrole TEXT NULL CHECK (
    teacher_subrole IS NULL OR teacher_subrole IN ('subject_teacher', 'class_teacher', 'subject_head')
  ),
  class_id INT NULL REFERENCES classes (id),
  subject_id INT NULL REFERENCES subjects (id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS resources (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('article', 'video', 'vocab', 'quiz')),
  category TEXT NOT NULL,
  subject_id INT NOT NULL REFERENCES subjects (id),
  cover TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  visibility TEXT NOT NULL DEFAULT 'assigned' CHECK (visibility IN ('assigned', 'library')),
  duration_label TEXT,
  blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by INT NULL REFERENCES users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id SERIAL PRIMARY KEY,
  resource_id INT NOT NULL REFERENCES resources (id) ON DELETE CASCADE,
  quiz_key TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  qtype TEXT NOT NULL CHECK (qtype IN ('mc', 'tf', 'fill')),
  prompt TEXT NOT NULL,
  options JSONB,
  answer TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS assignments (
  id SERIAL PRIMARY KEY,
  resource_id INT NOT NULL REFERENCES resources (id) ON DELETE CASCADE,
  class_id INT NULL REFERENCES classes (id),
  user_id INT NULL REFERENCES users (id),
  due_at DATE,
  assigned_by INT NULL REFERENCES users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS progress (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  resource_id INT NOT NULL REFERENCES resources (id) ON DELETE CASCADE,
  opened_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  score INT,
  answers JSONB,
  minutes INT NOT NULL DEFAULT 0,
  UNIQUE (user_id, resource_id)
);

CREATE TABLE IF NOT EXISTS activity (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  day DATE NOT NULL,
  count INT NOT NULL DEFAULT 1,
  UNIQUE (user_id, day)
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_resources_subject ON resources (subject_id);
CREATE INDEX IF NOT EXISTS idx_quiz_key ON quiz_questions (quiz_key);
CREATE INDEX IF NOT EXISTS idx_assign_class ON assignments (class_id);
CREATE INDEX IF NOT EXISTS idx_progress_user ON progress (user_id);
CREATE INDEX IF NOT EXISTS idx_activity_day ON activity (day);
