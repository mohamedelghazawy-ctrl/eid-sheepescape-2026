// يلف كل نص عربي في السكربتات بـ _t(...) / _tt(...) (آمن للتكرار)
const acorn = require('/opt/npm-tools/node_modules/acorn'), fs = require('fs');
const AR = /[؀-ۿ]/;
function walkAll(n, fn, anc = []) { if (!n || typeof n.type !== 'string') return; fn(n, anc); anc.push(n); for (const k in n) { const v = n[k]; if (Array.isArray(v)) v.forEach(c => c && typeof c.type === 'string' && walkAll(c, fn, anc)); else if (v && typeof v.type === 'string') walkAll(v, fn, anc); } anc.pop(); }
function wrapCode(code) {
  const ast = acorn.parse(code, { ecmaVersion: 'latest', ranges: true, sourceType: 'script' }), edits = [];
  walkAll(ast, (n, anc) => {
    const p = anc[anc.length - 1];
    if (n.type === 'Literal' && typeof n.value === 'string' && AR.test(n.value)) {
      if (p && p.type === 'CallExpression' && p.callee.type === 'Identifier' && (p.callee.name === '_t' || p.callee.name === '_tt')) return;
      if (p && p.type === 'Property' && p.key === n) return;
      if (p && (p.type === 'ImportDeclaration')) return;
      edits.push({ s: n.range[0], e: n.range[1], n, kind: 'lit' });
    } else if (n.type === 'TemplateLiteral') {
      const key = n.quasis.map((q, i) => q.value.cooked + (i < n.expressions.length ? '{' + i + '}' : '')).join('');
      if (AR.test(key)) edits.push({ s: n.range[0], e: n.range[1], n, kind: 'tpl', key });
    }
  });
  edits.sort((a, b) => a.s - b.s || b.e - a.e);
  // بناء شجرة احتواء
  function render(s, e, list) {
    let out = '', pos = s, i = 0;
    while (i < list.length) {
      const ed = list[i]; if (ed.s < pos) { i++; continue; }
      const inner = []; let j = i + 1; while (j < list.length && list[j].e <= ed.e) { inner.push(list[j]); j++; }
      out += code.slice(pos, ed.s);
      if (ed.kind === 'lit') out += '_t(' + code.slice(ed.s, ed.e) + ')';
      else {
        const exprs = ed.n.expressions.map(x => { const sub = inner.filter(q => q.s >= x.range[0] && q.e <= x.range[1]); return render(x.range[0], x.range[1], sub); });
        out += '_tt(' + JSON.stringify(ed.key) + ',[' + exprs.join(',') + '])';
      }
      pos = ed.e; i = j;
    }
    return out + code.slice(pos, e);
  }
  return render(0, code.length, edits);
}
function wrapSkipI18n(code) { const a = code.indexOf('/*I18N-BEGIN*/'), b = code.indexOf('/*I18N-END*/'); if (a < 0) return wrapCode(code); const blk = code.slice(a, b + 12); return wrapCode(code.slice(0, a) + '/*I18N_PH*/' + code.slice(b + 12)).replace('/*I18N_PH*/', () => blk); }
module.exports = { wrapCode };
if (require.main === module) {
  const files = process.argv.slice(2);
  for (const f of files) {
    let src = fs.readFileSync(f, 'utf8');
    if (f.endsWith('.html')) {
      src = src.replace(/<script>([\s\S]*?)<\/script>/g, (m, code) => code.startsWith('!function') ? m : '<script>' + wrapSkipI18n(code) + '</script>');
    } else src = wrapCode(src);
    fs.writeFileSync(f, src); console.log('wrapped', f);
  }
}
