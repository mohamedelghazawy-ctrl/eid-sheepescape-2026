# هروب خروف العيد — مشروع Android

مشروع Android Studio يغلّف اللعبة (HTML5/Canvas) داخل WebView بملء الشاشة، وتعمل بدون إنترنت.

## الهيكل
```
SheepEscape/
├─ settings.gradle.kts / build.gradle.kts / gradle.properties
└─ app/
   ├─ build.gradle.kts
   └─ src/main/
      ├─ AndroidManifest.xml
      ├─ assets/index.html          ← اللعبة كاملة (عدّلها هنا)
      ├─ java/com/eid/sheepescape/MainActivity.kt
      └─ res/ (strings, themes, colors, أيقونة التطبيق)
```

## التشغيل
1. افتح المجلد `SheepEscape` في **Android Studio** (Meerkat 2024.3.1 أو أحدث) ودعه يزامن Gradle (يلزم JDK 17).
2. وصّل هاتفاً أو شغّل محاكياً ثم Run ▶.
3. لملف APK: `Build > Build Bundle(s) / APK(s) > Build APK(s)`.
4. للنشر على Google Play: `Build > Generate Signed Bundle (AAB)` وأنشئ keystore.

## ما يفعله الغلاف
- شاشة كاملة، تدعم كل الاتجاهات وأحجام الشاشات (بدون قفل اتجاه)، إبقاء الشاشة مضاءة.
- `localStorage` مفعّل لحفظ التقدم، و WebAudio يعمل بلا ضغطة إضافية.
- خدمة الملفات عبر `https://appassets.androidplatform.net/assets/` (أصل آمن وثابت).
- زر الرجوع يُمرَّر للّعبة (إيقاف مؤقت ← القائمة ← اضغط مرتين للخروج) عبر `AndroidBridge.exit()`.
- روابط واتساب/المواقع تُفتح خارج التطبيق.
- اهتزاز عبر صلاحية `VIBRATE`.

## تخصيص
- رقم واتساب والموقع: `CONFIG` داخل `assets/index.html`.
- اسم التطبيق: `res/values/strings.xml`. المعرّف: `applicationId` في `app/build.gradle.kts`.
- الأيقونة: `res/drawable-nodpi/ic_launcher_foreground.png` (الخلفية البرتقالية في `res/values/colors.xml`).

## الإعلان المكافئ (بالونة مقابل إعلان)
حالياً يظهر إعلان **تجريبي** مدته 5 ثوانٍ داخل اللعبة. لربط إعلان حقيقي (مثل AdMob Rewarded):
1. أضف مكتبة الإعلانات وجهّزها في `MainActivity.kt`.
2. أضف إلى `Bridge` دالة `@JavascriptInterface fun showRewardedAd()` تعرض الإعلان.
3. عند اكتمال المشاهدة نفّذ: `webView.evaluateJavascript("window.__adResult(true)", null)` (أو `false` إن أُغلق قبل الانتهاء).
اللعبة تكتشف الدالة تلقائياً وتتوقف عن عرض الإعلان التجريبي.
