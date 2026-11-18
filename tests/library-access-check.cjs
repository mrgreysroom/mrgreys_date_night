const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test, mock } = require('node:test');

test('library API forwards only a bearer session and preserves purchase results', async () => {
  const { default: handler } = await import('../api/my-games.js');
  async function lookup(authorization) {
    const result = {};
    await handler({ method: 'GET', headers: { authorization } }, {
      setHeader(name, value) { result[name] = value; },
      status(code) { result.code = code; return this; },
      json(payload) { result.payload = payload; },
    });
    assert.equal(result['Cache-Control'], 'private, no-store');
    return result;
  }

  const fetch = mock.method(globalThis, 'fetch', async (_url, request) => {
    assert.equal(request.method, 'POST');
    const token = request.headers.Authorization;
    if (token === 'Bearer invalid') return Response.json({}, { status: 401 });
    if (token === 'Bearer malformed') return Response.json({});
    const products = new Map([
      ['Bearer no-purchase', []],
      ['Bearer one-pack', ['dare']],
      ['Bearer complete', ['complete']],
    ]);
    return Response.json({ games: products.get(token).map(product_code => ({ product_code })) });
  });
  try {
    assert.equal((await lookup()).code, 401);
    assert.equal((await lookup('Bearer token extra')).code, 401);
    assert.equal(fetch.mock.callCount(), 0);
    assert.equal((await lookup('Bearer invalid')).code, 401);
    assert.equal((await lookup('Bearer malformed')).code, 502);
    for (const [token, expected] of [['no-purchase', []], ['one-pack', ['dare']], ['complete', ['complete']]]) {
      const result = await lookup('Bearer ' + token);
      assert.equal(result.code, 200);
      assert.deepEqual(result.payload.games.map(game => game.product_code), expected);
    }
  } finally {
    fetch.mock.restore();
  }
});

test('library and game both use the authenticated purchase endpoint', () => {
  for (const file of ['account.html', 'play.html']) {
    const html = readFileSync(new URL('../' + file, 'file://' + __filename), 'utf8');
    assert.match(html, /fetch\("\/api\/my-games"/);
    assert.doesNotMatch(html, /\/rest\/v1\/entitlements/);
  }
});
