# 自學無窮 / Cyber Book proto (Neon + Vercel)

Static HTML/CSS/JS prototype with a small Vercel serverless API on Neon. **UI/UX stays the proto screens** — login card, Nord Light dashboards, TipTap-style slash editor, admin tables. Real username/password auth and data sit behind the same markup.

## Architecture

- **Frontend:** existing `index.html` + `css/app.css` + `js/app.js` (hash router). `js/live.js` calls `/api/*` and fills the same DOM.
- **API:** `api/[...path].js` (Vercel Node) using `@neondatabase/serverless` + `bcryptjs`.
- **DB:** Neon Postgres (`lively-night-01277418`, `aws-ap-southeast-1`). Prefer the **pooled** connection string (`-pooler` in the host).

Resource write lock (enforced in API; editor UI unchanged):

| Role | Resources |
| --- | --- |
| Admin | create / edit / publish all |
| 科主任 (`subject_head`) | create / edit / publish **own subject** |
| 班主任 / 一班老師 | read-only on resources (dashboards + assign still work) |
| 學生 | view assigned/published; complete MC |

## Demo accounts

Password for **all** accounts: `Demo123!`

| Username | Name | Role |
| --- | --- | --- |
| `admin` | 系統管理員 | Admin × 1 |
| `t.lee` | 李老師 | 一班老師（English, non-head） |
| `t.wang` | 王老師 | 班主任（5A） |
| `t.chan` | 陳老師 | 科主任（English） |
| `s24012` | 陳曉晴 | 學生 |
| `s24018` | 黃子軒 | 學生 |
| `s24021` | 林凱婷 | 學生（暫停） |
| `s24033` | 李梓朗 | 學生 |
| `s24041` | 張詠心 | 學生 |
| `s24055` | 周浩然 | 學生 |

Login page: username/password only, unless Admin enables EdCity/Google in **SSO 設定**.

Nav follows the logged-in account (`role` + `teacher_subrole`). There is no header role switcher and no teacher identity switcher.

| Role | Nav |
| --- | --- |
| Admin | 總覽／用戶／班級／科目／使用量／SSO 設定／登出 |
| 科主任 (`subject_head`) | 總覽／科目瀏覽／本科資源／編輯上架／指派／登出 |
| 班主任 (`class_teacher`) | 總覽／科目瀏覽／本班進度／指派／登出 |
| 一班老師 (`subject_teacher`) | 總覽／科目瀏覽（全校科目＋教材，唯讀）／登出 |
| 學生 | 首頁／科目／我的進度／登出 |

## SSO config (Frontend)

Username/password login is unchanged. EdCity / Google **login buttons render only when that provider is `enabled`**. Admin `#/admin/sso` reads/writes `/api/admin/sso-providers`. List responses mask credentials as `{ set: true|false }` — the form never expects full secrets back. OAuth handshake is **not** implemented (P0: settings + gate UI; button click toasts「設定未完整」).

| Method | Path | Auth | Body / notes |
| --- | --- | --- | --- |
| `GET` | `/api/auth/sso-config` | none | `{ providers: [{ id, enabled, label }] }` — **never** credentials |
| `GET` | `/api/admin/sso-providers` | admin session | list; `credentials` is **masked** (`{ client_secret: { set: true } }`) |
| `GET` | `/api/admin/sso-providers/:id` | admin session | one provider, same mask |
| `PATCH` | `/api/admin/sso-providers/:id` | admin session | `{ enabled?, label?, credentials? }` — PATCH body uses **real** values; stored JSON is **shallow-merged**. GET/PATCH responses never echo secrets. Non-admin → 403. |

Seeded keys: `edcity`, `google` (`enabled: false`, `credentials: {}`). Do not commit real secrets.

## Vercel env keys

Set in Project Settings → Environment Variables (Production + Preview):

| Key | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | **yes** | Neon **pooled** URI. Do not commit. |
| `SESSION_SECRET` | recommended | Signs the httpOnly session cookie. Any long random string. Falls back to a demo default if unset. |

Do **not** commit `.env`. Copy `.env.example` locally.

## Migrate · seed · deploy

```bash
npm install
export DATABASE_URL='postgresql://…-pooler.…/neondb?sslmode=require'
npm run migrate
npm run seed
npm run check
```

`migrate` and `seed` are idempotent (safe to re-run). Seed resets demo passwords to `Demo123!`.

Then on Vercel: set `DATABASE_URL` (and `SESSION_SECRET`), deploy this branch. Framework: Other / static + `/api` serverless.

## Local API

```bash
npx vercel dev
```

Open the printed localhost URL (hash routes: `#/login`).

## Gaps vs prototype chrome

- OAuth callback is a follow-up: login SSO buttons toast「設定未完整」and do not mint a session.
- Canonical article/video/vocab/quiz pages keep proto markup (seed content matches). The library (`#/subject`) lists **all subjects** with a picker; `#/subject/:slug` filters. Write buttons stay hidden for 一班老師／班主任.
