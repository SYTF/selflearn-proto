const crypto = require('crypto');

const COOKIE = 'sl_session';
const WEEK = 7 * 24 * 60 * 60;

function secret() {
  return process.env.SESSION_SECRET || 'selflearn-cyberbook-demo';
}

function b64url(buf) {
  return Buffer.from(buf)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function fromB64url(s) {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  return Buffer.from(String(s).replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64');
}

function sign(payload) {
  const body = b64url(JSON.stringify(payload));
  const mac = crypto.createHmac('sha256', secret()).update(body).digest();
  return body + '.' + b64url(mac);
}

function verify(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [body, mac] = token.split('.');
  const expect = b64url(crypto.createHmac('sha256', secret()).update(body).digest());
  const a = Buffer.from(mac);
  const b = Buffer.from(expect);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(fromB64url(body).toString('utf8'));
    if (!data || !data.exp || Date.now() > data.exp) return null;
    return data;
  } catch (e) {
    return null;
  }
}

function parseCookies(req) {
  const h = req.headers.cookie || '';
  const out = {};
  h.split(';').forEach((p) => {
    const i = p.indexOf('=');
    if (i < 0) return;
    const k = p.slice(0, i).trim();
    const v = p.slice(i + 1).trim();
    try {
      out[k] = decodeURIComponent(v);
    } catch (e) {
      out[k] = v;
    }
  });
  return out;
}

function cookieHeader(token, req) {
  const proto = (req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
  const secure = process.env.VERCEL === '1' || proto === 'https';
  const parts = [
    `${COOKIE}=${encodeURIComponent(token)}`,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    `Max-Age=${WEEK}`
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

function clearCookieHeader(req) {
  const proto = (req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
  const secure = process.env.VERCEL === '1' || proto === 'https';
  const parts = [`${COOKIE}=`, 'HttpOnly', 'Path=/', 'SameSite=Lax', 'Max-Age=0'];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

function makeSession(user) {
  return sign({
    uid: user.id,
    username: user.username,
    role: user.role,
    teacher_subrole: user.teacher_subrole,
    subject_id: user.subject_id,
    class_id: user.class_id,
    exp: Date.now() + WEEK * 1000
  });
}

function sessionFromReq(req) {
  return verify(parseCookies(req)[COOKIE]);
}

module.exports = {
  COOKIE,
  makeSession,
  sessionFromReq,
  cookieHeader,
  clearCookieHeader
};
