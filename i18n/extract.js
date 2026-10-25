// يستخرج كل النصوص العربية من سكربت اللعبة ويكتب keys.json
const acorn = require('/opt/npm-tools/node_modules/acorn'), walk = require('/opt/npm-tools/node_modules/acorn-walk'), fs = require('fs');
const html = fs.readFileSync('../app/src/main/assets/index.html', 'utf8');
const AR = /[؀-ۿ]/;
// موضع السكربتات
const scripts = []; const re = /<script>([\s\S]*?)<\/script>/g; let m;
while ((m = re.exec(html))) { if (m[1].startsWith('!function')) continue; scripts.push({ start: m.index + 8, code: m[1] }); }
const out = new Map(), ctx = {};
for (const sc of scripts) {
  const ast = acorn.parse(sc.code, { ecmaVersion: 'latest', ranges: true, sourceType: 'script' });
  walk.ancestor(ast, {
    Literal(n, st, anc) { if (typeof n.value === 'string' && AR.test(n.value)) { const p = anc[anc.length - 2]; const c = p.type + (p.type === 'BinaryExpression' ? p.operator : '') + (p.type === 'Property' && p.key === n ? ':key' : ''); (ctx[c] = ctx[c] || []).push(n.value); out.set(n.value, 1); } },
    TemplateLiteral(n, st, anc) { const key = n.quasis.map((q, i) => q.value.cooked + (i < n.expressions.length ? '{' + i + '}' : '')).join(''); if (AR.test(key)) { const p = anc[anc.length - 2]; (ctx['T:' + p.type] = ctx['T:' + p.type] || []).push(key); out.set(key, 1); } }
  });
}
fs.writeFileSync('keys.json', JSON.stringify([...out.keys()], null, 0));
console.log(out.size);
for (const c in ctx) console.log(c, ctx[c].length, ctx[c].length < 6 ? JSON.stringify(ctx[c]).slice(0, 300) : '');
