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

Login page: type username/password, or use **示範快速進入** (學生 → `s24012`, 老師 → `t.wang`, Admin → `admin`).

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

- EdCity / Google buttons stay visual; they toast to use username/password.
- Header role switcher is unchanged (proto chrome). API permissions still follow the logged-in account.
- 級主任 panel remains a proto layout switch — not one of the 10 seeded accounts.
- Canonical article/video/vocab/quiz pages keep proto markup (seed content matches). New editor publishes show up on the English subject grid.
