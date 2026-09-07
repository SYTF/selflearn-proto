/** Public login/nav shape: id + enabled + label only. Never include credentials. */
function publicSsoProvider(row) {
  return {
    id: row.id,
    enabled: !!row.enabled,
    label: row.label
  };
}

function isFilled(value) {
  if (value == null) return false;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return String(value).trim() !== '';
}

/**
 * Admin GET mask: same keys as stored JSON, values are `{ set: true|false }`.
 * Never returns secret strings. Empty stored `{}` stays `{}`.
 */
function maskCredentials(creds) {
  if (!creds || typeof creds !== 'object' || Array.isArray(creds)) return {};
  const out = {};
  Object.keys(creds).forEach((key) => {
    out[key] = { set: isFilled(creds[key]) };
  });
  return out;
}

function adminSsoProvider(row) {
  return {
    id: row.id,
    label: row.label,
    enabled: !!row.enabled,
    credentials: maskCredentials(row.credentials),
    updated_at: row.updated_at,
    updated_by: row.updated_by
  };
}

/** Shallow-merge credentials JSON. Returns null if patch is present but not a plain object. */
function mergeCredentials(current, patch) {
  const base = current && typeof current === 'object' && !Array.isArray(current) ? Object.assign({}, current) : {};
  if (patch === undefined) return base;
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return null;
  return Object.assign(base, patch);
}

module.exports = { publicSsoProvider, adminSsoProvider, maskCredentials, mergeCredentials };
