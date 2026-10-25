#!/usr/bin/env python3
"""يدمج ملفات الـ3D داخل index.html ويضمّن مكتبة three.min.js. التشغيل: python3 build.py"""
import re, sys, os
H = os.path.dirname(os.path.abspath(__file__))
IDX = os.path.join(H, '..', 'app', 'src', 'main', 'assets', 'index.html')
THREE = os.environ.get('THREE_JS', '/home/claude/mrdoob/three.js/build/three.min.js')
s = open(IDX, encoding='utf-8').read()
parts = []
for f in ['gl_core.js', 'gl_buildings.js', 'gl_props.js', 'gl_chars.js', 'gl_intro.js', 'gl_stage.js', 'gl_frame.js']:
    t = open(os.path.join(H, f), encoding='utf-8').read()
    t = '\n'.join(l for l in t.split('\n') if not l.startswith('/*3D-'))
    parts.append(t)
block = '/*3D-BEGIN*/\n' + '\n'.join(parts) + '\n/*3D-END*/'
if '/*3D-BEGIN*/' in s:
    s = re.sub(r'/\*3D-BEGIN\*/.*?/\*3D-END\*/', lambda m: block, s, flags=re.S)
else:
    sys.exit('markers missing in index.html')
three = open(THREE, encoding='utf-8').read()
if '<!--THREE-BEGIN-->' in s:
    s = re.sub(r'<!--THREE-BEGIN-->.*?<!--THREE-END-->', lambda m: '<!--THREE-BEGIN--><script>' + three + '</script><!--THREE-END-->', s, flags=re.S)
open(IDX, 'w', encoding='utf-8').write(s)
print('built', len(s))
