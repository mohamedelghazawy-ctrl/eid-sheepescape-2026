# Keep JavaScript bridge
-keepclassmembers class com.eid.sheepescape.MainActivity$Bridge {
    @android.webkit.JavascriptInterface <methods>;
}
