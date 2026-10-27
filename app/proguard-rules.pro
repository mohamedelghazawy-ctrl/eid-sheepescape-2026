# جسر الجافاسكربت (AndroidBridge): يجب إبقاء الدوال المعلَّمة بـ @JavascriptInterface بأسمائها
-keepclassmembers class com.eid.sheepescape.MainActivity$Bridge {
    @android.webkit.JavascriptInterface <methods>;
}
-keepattributes JavascriptInterface
-keep class com.eid.sheepescape.MainActivity$Bridge { <init>(...); }
# مستقبلات الإشعارات والتذكيرات (مُعرَّفة في الـManifest)
-keep class com.eid.sheepescape.** extends android.content.BroadcastReceiver { <init>(); }
# Play In-App Updates
-dontwarn com.google.android.play.core.**
