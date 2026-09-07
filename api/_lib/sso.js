/** Public login/nav shape: id + enabled + label only. Never include credentials. */
function publicSsoProvider(row) {
  return {
    id: row.id,
    enabled: !!row.enabled,
    label: row.label
  };
}

/** Shallow-merge credentials JSON. Returns null if patch is present but not a plain object. */
function mergeCredentials(current, patch) {
  const base = current && typeof current === 'object' && !Array.isArray(current) ? Object.assign({}, current) : {};
  if (patch === undefined) return base;
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return null;
  return Object.assign(base, patch);
}

module.exports = { publicSsoProvider, mergeCredentials };
