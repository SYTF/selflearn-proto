const { gradeQuiz, answersMatch } = require('../api/_lib/grade');
const { canWriteResource, canManageSchool, canAssign, canViewResource } = require('../api/_lib/access');
const { pathParts } = require('../api/_lib/http');
const { publicSsoProvider, adminSsoProvider, maskCredentials, mergeCredentials } = require('../api/_lib/sso');

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    failed += 1;
    console.error('FAIL', msg);
  } else {
    console.log('ok ', msg);
  }
}

const admin = { role: 'admin', teacher_subrole: null, subject_id: null };
const head = { role: 'teacher', teacher_subrole: 'subject_head', subject_id: 2 };
const homeroom = { role: 'teacher', teacher_subrole: 'class_teacher', subject_id: null };
const subjTeacher = { role: 'teacher', teacher_subrole: 'subject_teacher', subject_id: 2 };
const student = { role: 'student', teacher_subrole: null, subject_id: null };
const eng = { subject_id: 2, status: 'published', visibility: 'assigned' };
const math = { subject_id: 3, status: 'published', visibility: 'assigned' };
const draft = { subject_id: 2, status: 'draft', visibility: 'assigned' };

assert(canWriteResource(admin, eng), 'admin writes any subject');
assert(canWriteResource(head, eng), '科主任 writes own subject');
assert(!canWriteResource(head, math), '科主任 cannot write other subject');
assert(!canWriteResource(homeroom, eng), '班主任 resources read-only');
assert(!canWriteResource(subjTeacher, eng), '一班老師 resources read-only');
assert(!canWriteResource(student, eng), 'student cannot write');
assert(canManageSchool(admin) && !canManageSchool(head), 'only admin manages school');
assert(canAssign(homeroom) && canAssign(head) && !canAssign(student), 'teachers can assign');
assert(canViewResource(student, eng, true), 'student sees assigned published');
assert(!canViewResource(student, eng, false), 'student hides unassigned');
assert(!canViewResource(student, draft, true), 'student hides draft');
assert(canViewResource(homeroom, draft, false), 'teacher can see draft');

const qs = [
  { id: 1, sort_order: 1, qtype: 'mc', answer: 'b' },
  { id: 2, sort_order: 2, qtype: 'tf', answer: 'f' },
  { id: 3, sort_order: 3, qtype: 'fill', answer: 'umbrellas|umbrella' }
];
const g = gradeQuiz(qs, { 1: 'b', 2: 'f', 3: 'Umbrellas' });
assert(g.score === 100 && g.correct === 3, 'perfect MC/TF/fill grades 100');
const g2 = gradeQuiz(qs, { 1: 'a', 2: 't', 3: 'rain' });
assert(g2.score === 0, 'all wrong grades 0');
assert(answersMatch('drizzle|rain', 'Rain', 'fill'), 'fill accepts alt answers');

function routeKey(req) {
  return pathParts(req).parts.join('/');
}
assert(routeKey({ url: '/api/health' }) === 'health', 'url /api/health');
assert(routeKey({ url: '/api/auth/login' }) === 'auth/login', 'url nested login');
assert(routeKey({ url: '/api/auth/me' }) === 'auth/me', 'url nested me');
assert(routeKey({ url: '/api/resources?subject=eng' }) === 'resources', 'url resources keeps path');
assert(pathParts({ url: '/api/resources?subject=eng' }).search.get('subject') === 'eng', 'url search subject');
assert(routeKey({ url: '/api/[...path]', query: { path: 'auth/login' } }) === 'auth/login', 'rewrite string path splits');
assert(routeKey({ url: '/api/[...path]', query: { path: ['auth', 'login'] } }) === 'auth/login', 'rewrite array path');
assert(routeKey({ url: '/api/health', query: { path: 'health' } }) === 'health', 'single-segment query.path string');
assert(routeKey({ url: '/api/auth/login', query: { path: 'auth/login' } }) === 'auth/login', 'url wins over joined query string');
assert(routeKey({ url: '/api/progress' }) === 'progress', 'url progress');
assert(routeKey({ url: '/api/subjects/2' }) === 'subjects/2', 'url subjects id');
assert(routeKey({ url: '/api/auth/sso-config' }) === 'auth/sso-config', 'url public sso-config');
assert(routeKey({ url: '/api/admin/sso-providers' }) === 'admin/sso-providers', 'url admin sso list');
assert(routeKey({ url: '/api/admin/sso-providers/edcity' }) === 'admin/sso-providers/edcity', 'url admin sso patch id');
assert(routeKey({ url: '/api/[...path]', query: { path: 'admin/sso-providers/google' } }) === 'admin/sso-providers/google', 'rewrite admin sso id');

const leaked = publicSsoProvider({ id: 'google', enabled: true, label: 'Google', credentials: { client_secret: 'nope' } });
assert(leaked.id === 'google' && leaked.enabled === true && leaked.label === 'Google', 'public sso shape fields');
assert(!Object.prototype.hasOwnProperty.call(leaked, 'credentials'), 'public sso omits credentials');
assert(JSON.stringify(mergeCredentials({ app_code: 'a' }, { client_id: 'b' })) === JSON.stringify({ app_code: 'a', client_id: 'b' }), 'credentials shallow merge');
assert(mergeCredentials({ app_code: 'keep' }, undefined).app_code === 'keep', 'omit credentials keeps current');
assert(mergeCredentials({ a: 1 }, ['x']) === null, 'credentials array rejected');
assert(JSON.stringify(maskCredentials({})) === '{}', 'empty credentials mask is {}');
assert(JSON.stringify(maskCredentials({ client_id: 'abc', client_secret: '', app_code: '  ' })) === JSON.stringify({
  client_id: { set: true }, client_secret: { set: false }, app_code: { set: false }
}), 'mask filled vs empty keys');
assert(JSON.stringify(maskCredentials({ client_secret: 'real-secret' })).indexOf('real-secret') < 0, 'mask omits secret values');
const adminRow = adminSsoProvider({
  id: 'google', label: 'Google', enabled: true,
  credentials: { client_secret: 'nope' }, updated_at: 't', updated_by: 1
});
assert(adminRow.credentials.client_secret.set === true && !Object.prototype.hasOwnProperty.call(adminRow.credentials.client_secret, 'value'), 'admin GET uses {set}');
assert(JSON.stringify(adminRow).indexOf('nope') < 0, 'admin GET never echoes secret');

const fs = require('fs');
const path = require('path');
const liveSrc = fs.readFileSync(path.join(__dirname, '../js/live.js'), 'utf8');
const appSrc = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
const htmlSrc = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
assert(!/api\(['"]resources\?subject=eng['"]\)/.test(liveSrc), 'library fetch not hardcoded to eng');
assert(htmlSrc.indexOf('id="navDrawer"') >= 0 && htmlSrc.indexOf('id="navBurger"') >= 0, 'left nav drawer + hamburger');
assert(htmlSrc.indexOf('id="subjPick"') >= 0, 'subject picker on library');
assert(appSrc.indexOf('pass-toggle') >= 0, 'password eye toggle');
assert(appSrc.indexOf("route: '/subject', label: '科目瀏覽'") >= 0, '一班老師 nav is school-wide 科目瀏覽');
assert(appSrc.indexOf('js-need-write') >= 0 || htmlSrc.indexOf('js-need-write') >= 0, 'write affordances gated');

if (failed) {
  console.error('\n' + failed + ' failed');
  process.exit(1);
}
console.log('\ncheck ok');
