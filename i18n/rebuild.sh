#!/bin/sh
# ترتيب البناء بعد أي تعديل على ملفات src3d أو index.html
cd "$(dirname "$0")" && node wrap.js ../src3d/gl_*.js >/dev/null && python3 ../src3d/build.py && node wrap.js ../app/src/main/assets/index.html >/dev/null && python3 build_i18n.py
