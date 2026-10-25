#!/usr/bin/env python3
"""يبني strings.json من قوائم الترجمة (يُستخدم مرة واحدة للبذر؛ بعدها عدّل strings.json مباشرة)"""
import json, tr_en, tr_id, tr_tr
J = json.load(open('keys.json', encoding='utf-8')); H = json.load(open('html_keys.json', encoding='utf-8'))
AK = ["إيقاف مؤقت","يسار","يمين","قفز","تزحلق","هروب خروف العيد من الجزار بسيوني","الموسيقى","المؤثرات","الاهتزاز","التذكيرات"]
out = {}
for m, lg in ((tr_en,'en'),(tr_id,'id'),(tr_tr,'tr')):
    assert len(m.J)==len(J) and len(m.H)==len(H) and len(m.A)==len(AK), lg
    for ks, vs in ((J,m.J),(H,m.H),(AK,m.A)):
        for k, v in zip(ks, vs): out.setdefault(k, {})[lg] = v
json.dump(out, open('strings.json','w',encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(out))
