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

function pathParts(req) {
  const url = new URL(req.url, 'http://localhost');
  let parts = url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean);
  if (Array.isArray(req.query && req.query.path)) parts = req.query.path;
  else if (typeof (req.query && req.query.path) === 'string') parts = [req.query.path];
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
