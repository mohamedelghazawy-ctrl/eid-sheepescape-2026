#!/usr/bin/env python3
"""يدمج strings.json + محرك الترجمة داخل index.html (بين /*I18N-BEGIN*/ و /*I18N-END*/). التشغيل: python3 build_i18n.py"""
import json, re, os
H = os.path.dirname(os.path.abspath(__file__))
IDX = os.path.join(H, '..', 'app', 'src', 'main', 'assets', 'index.html')
d = json.load(open(os.path.join(H, 'strings.json'), encoding='utf-8'))
data = {lg: {k: v[lg] for k, v in d.items() if lg in v and v[lg] != k} for lg in ('en', 'id', 'tr', 'fr', 'ur', 'bn', 'ms', 'fa', 'ru')}
ENGINE = r'''
var LANG = (function () { var l = ''; try { l = localStorage.getItem('se_lang') || ''; } catch (e) {} if (!/^(ar|en|id|tr|fr|ur|bn|ms|fa|ru)$/.test(l)) { var n = ((navigator.languages && navigator.languages[0]) || navigator.language || 'en').toLowerCase().slice(0, 2); l = /^(ar|en|id|tr|fr|ur|bn|ms|fa|ru)$/.test(n) ? n : 'en'; } return l; })();
var I18N = %s;
var _D = I18N[LANG] || {};
function _t(s) { if (LANG === 'ar') return s; var v = _D[s]; if (v !== undefined) return v; var m = /^(\s*)([\s\S]*?)(\s*)$/.exec(s); if (m[1] || m[3]) { v = _D[m[2]]; if (v !== undefined) return m[1] + v + m[3]; } return s; }
function _tt(k, a) { var s = LANG === 'ar' ? k : (_D[k] !== undefined ? _D[k] : k); return s.replace(/\{(\d+)\}/g, function (_, i) { return a[i]; }); }
function _applyDom() {
  var tw = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT), ns = [], n;
  while ((n = tw.nextNode())) { var p = n.parentNode && n.parentNode.nodeName; if (p === 'SCRIPT' || p === 'STYLE') continue; if (/[؀-ۿ]/.test(n.data)) ns.push(n); }
  ns.forEach(function (n) { var m = /^(\s*)([\s\S]*?)(\s*)$/.exec(n.data), k = m[2].replace(/\s+/g, ' '), v = _D[k]; if (v !== undefined) n.data = m[1] + v + m[3]; });
  document.querySelectorAll('[aria-label],[alt],[title]').forEach(function (el) { ['aria-label', 'alt', 'title'].forEach(function (a) { var x = el.getAttribute(a); if (x && _D[x] !== undefined) el.setAttribute(a, _D[x]); }); });
  document.title = _t(document.title);
}
if (LANG !== 'ar') { document.documentElement.lang = LANG; document.documentElement.dir = (LANG === 'ur' || LANG === 'fa') ? 'rtl' : 'ltr'; _applyDom(); }
try { if (window.AndroidBridge && AndroidBridge.setLang) AndroidBridge.setLang(LANG); } catch (e) {}
''' % json.dumps(data, ensure_ascii=False, separators=(',', ':'))
block = '/*I18N-BEGIN*/' + ENGINE + '/*I18N-END*/'
s = open(IDX, encoding='utf-8').read()
if '/*I18N-BEGIN*/' in s:
    s = re.sub(r'/\*I18N-BEGIN\*/.*?/\*I18N-END\*/', lambda m: block, s, flags=re.S)
else:
    a = '<!--THREE-END-->\n<script>'
    assert a in s, 'main script marker'
    s = s.replace(a, a + '\n' + block + '\n', 1)
open(IDX, 'w', encoding='utf-8').write(s)
print('i18n built', len(block))
