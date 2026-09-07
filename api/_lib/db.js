const { neon } = require('@neondatabase/serverless');

function cleanUrl(url) {
  try {
    const u = new URL(url);
    u.searchParams.delete('channel_binding');
    return u.toString();
  } catch (e) {
    return url;
  }
}

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    const err = new Error('DATABASE_URL is not set');
    err.status = 500;
    throw err;
  }
  return neon(cleanUrl(url));
}

module.exports = { getSql, cleanUrl };
