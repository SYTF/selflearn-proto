const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');
const { cleanUrl } = require('../api/_lib/db');

function splitSql(raw) {
  return raw
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/--.*$/gm, '')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
}

async function exec(sql, stmt) {
  if (typeof sql.query === 'function') return sql.query(stmt, []);
  return sql([stmt]);
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }
  const sql = neon(cleanUrl(url));
  const file = path.join(__dirname, '..', 'db', 'schema.sql');
  const stmts = splitSql(fs.readFileSync(file, 'utf8'));
  for (const stmt of stmts) {
    await exec(sql, stmt);
  }
  console.log('migrate ok ·', stmts.length, 'statements');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
