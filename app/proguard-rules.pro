# Keep JavaScript bridge
-keepclassmembers class com.gamexbreak.sheepescape.MainActivity$Bridge {
    @android.webkit.JavascriptInterface <methods>;
}
