function send(res, status, body, extraHeaders) {
  const headers = Object.assign({ 'Content-Type': 'application/json; charset=utf-8' }, extraHeaders || {});
  res.writeHead(status, headers);
  res.end(JSON.stringify(body));
}

function fail(res, status, message) {
  send(res, status, { error: message });
}

function readBody(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return Promise.resolve(req.body);
  }
  if (typeof req.body === 'string') {
    try {
      return Promise.resolve(req.body ? JSON.parse(req.body) : {});
    } catch (e) {
      return Promise.reject(e);
    }
  }
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => {
      data += c;
      if (data.length > 1e6) {
        req.destroy();
        reject(new Error('body too large'));
      }
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function splitSegs(value) {
  return (Array.isArray(value) ? value : [value])
    .flatMap((s) => String(s).split('/'))
    .map((s) => {
      try {
        return decodeURIComponent(s);
      } catch (e) {
        return s;
      }
    })
    .filter((s) => s && s !== '[...path]');
}

function pathParts(req) {
  const url = new URL(req.url || '/', 'http://localhost');
  const fromUrl = splitSegs(url.pathname.replace(/^\/api\/?/, ''));
  const q = req.query && req.query.path;
  const fromQuery = q == null || q === '' ? [] : splitSegs(q);
  // vercel.json rewrite is required: Other/static only maps one /api segment natively.
  const parts = fromUrl.length ? fromUrl : fromQuery;
  return { parts, search: url.searchParams };
}

function needUser(req, res, auth) {
  const sess = auth.sessionFromReq(req);
  if (!sess) {
    fail(res, 401, '請先登入');
    return null;
  }
  return sess;
}

module.exports = { send, fail, readBody, pathParts, needUser };
