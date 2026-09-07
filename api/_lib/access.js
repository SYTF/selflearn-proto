/** Resource write lock: Admin full; 科主任 own subject; other teachers read-only. */
function canWriteResource(user, resource) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role !== 'teacher') return false;
  if (user.teacher_subrole !== 'subject_head') return false;
  if (!resource) return true;
  return Number(resource.subject_id) === Number(user.subject_id);
}

function canManageSchool(user) {
  return !!(user && user.role === 'admin');
}

function canAssign(user) {
  return !!(user && (user.role === 'admin' || user.role === 'teacher'));
}

function canViewResource(user, resource, assigned) {
  if (!user) return false;
  if (user.role === 'admin' || user.role === 'teacher') return true;
  if (!resource || resource.status !== 'published') return false;
  if (resource.visibility === 'library') return true;
  return !!assigned;
}

function publicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    display_name: row.display_name,
    role: row.role,
    teacher_subrole: row.teacher_subrole,
    class_id: row.class_id,
    class_name: row.class_name || null,
    subject_id: row.subject_id,
    subject_slug: row.subject_slug || null,
    subject_name: row.subject_name || null,
    status: row.status
  };
}

module.exports = {
  canWriteResource,
  canManageSchool,
  canAssign,
  canViewResource,
  publicUser
};
