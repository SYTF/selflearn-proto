const { gradeQuiz, answersMatch } = require('../api/_lib/grade');
const { canWriteResource, canManageSchool, canAssign, canViewResource } = require('../api/_lib/access');

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

if (failed) {
  console.error('\n' + failed + ' failed');
  process.exit(1);
}
console.log('\ncheck ok');
