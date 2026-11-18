const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { test } = require('node:test');

const packs = ['romantic', 'secrets', 'dare', 'afterdark', 'complete'];
const page = fs.readFileSync('play.html', 'utf8').match(/<script>\s*([\s\S]*?)<\/script>/)[1]
  .replace(/const \{createClient\}=await import\([^\n]+\);/, '')
  .replace(/boot\(\);\s*$/, 'boot()');
const cards = fs.readFileSync('i18n-cards.js', 'utf8');
const i18n = fs.readFileSync('i18n-core.js', 'utf8');

async function checkDeck(lang, requested, owned, expected) {
  const nodes = new Map();
  function node(id) {
    if (!nodes.has(id)) {
      const classes = new Set(['app', 'locked'].includes(id) ? ['hidden'] : []);
      nodes.set(id, {
        dataset: {}, style: {}, setAttribute() {}, appendChild() {},
        classList: {
          add: name => classes.add(name),
          remove: name => classes.delete(name),
          contains: name => classes.has(name),
          toggle: (name, enabled) => enabled ? classes.add(name) : classes.delete(name)
        }
      });
    }
    return nodes.get(id);
  }

  const storage = new Map();
  const context = vm.createContext({
    window: {},
    document: {
      documentElement: {}, head: { appendChild() {} }, querySelectorAll: () => [],
      getElementById: node, createElement: () => node('element'), querySelector: () => node('card')
    },
    MutationObserver: class { observe() {} },
    URLSearchParams,
    location: { pathname: '/play', search: '?pack=' + requested + '&lang=' + lang },
    navigator: { onLine: true },
    localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) },
    setTimeout: () => 0,
    clearTimeout() {},
    createClient: () => ({
      auth: { getSession: async () => ({ data: { session: { access_token: 'test', user: { id: 'fixture' } } } }) }
    }),
    fetch: async (url, options) => {
      assert.equal(url, '/api/my-games');
      assert.equal(options.headers.Authorization, 'Bearer test');
      return Response.json({ games: owned.map(product_code => ({ product_code })) });
    }
  });

  vm.runInContext(i18n + '\n' + cards, context);
  await vm.runInContext(page, context);
  assert.equal(!node('app').classList.contains('hidden'), expected);
  assert.equal(!node('locked').classList.contains('hidden'), !expected);
  if (!expected) return;

  const decks = context.window.MRG_CARD_DECKS[lang];
  const count = requested === 'complete' ? Object.values(decks).flat().length : decks[requested].length;
  assert.ok(count > 1);
  for (let index = 1; index <= count; index++) {
    assert.equal(node('progress').textContent, 'Karta ' + index + ' z ' + count);
    assert.ok(node('text').textContent.trim());
    node('next').onclick();
  }
  assert.equal(node('progress').textContent, 'Karta 1 z ' + count);
}

for (const lang of ['sk', 'cz', 'pl', 'en']) {
  test('all decks and purchase isolation in ' + lang, async () => {
    for (const pack of packs) {
      await checkDeck(lang, pack, [pack], true);
      await checkDeck(lang, pack, [], false);
      if (pack === 'complete') continue;
      await checkDeck(lang, pack, ['complete'], true);
      for (const other of packs.filter(code => code !== pack)) {
        await checkDeck(lang, other, [pack], false);
      }
    }
  });
}
