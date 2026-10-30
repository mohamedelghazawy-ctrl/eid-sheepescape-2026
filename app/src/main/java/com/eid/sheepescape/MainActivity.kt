package com.eid.sheepescape

import android.Manifest
import android.annotation.SuppressLint
import android.content.pm.PackageManager
import android.os.Build
import androidx.activity.result.IntentSenderRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.core.content.ContextCompat
import com.google.android.play.core.appupdate.AppUpdateManager
import com.google.android.play.core.appupdate.AppUpdateManagerFactory
import com.google.android.play.core.appupdate.AppUpdateOptions
import com.google.android.play.core.install.InstallStateUpdatedListener
import com.google.android.play.core.install.model.AppUpdateType
import com.google.android.play.core.install.model.InstallStatus
import com.google.android.play.core.install.model.UpdateAvailability
import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.os.Message
import android.view.View
import android.view.WindowManager
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.webkit.WebViewAssetLoader

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var ads: Ads
    private var updateMgr: AppUpdateManager? = null
    private var updateChecked = false
    private val notifPerm = registerForActivityResult(ActivityResultContracts.RequestPermission()) { }
    private val updateLauncher = registerForActivityResult(ActivityResultContracts.StartIntentSenderForResult()) { }
    private val updateListener = InstallStateUpdatedListener { st ->
        if (st.installStatus() == InstallStatus.DOWNLOADED) showRestartDialog()
    }

    private companion object {
        const val HOST = "appassets.androidplatform.net"
        const val START_URL = "https://$HOST/assets/index.html"
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        WindowCompat.setDecorFitsSystemWindows(window, false)

        webView = WebView(this).apply {
            setBackgroundColor(0xFF2B1B10.toInt())
            overScrollMode = View.OVER_SCROLL_NEVER
            isVerticalScrollBarEnabled = false
            isHorizontalScrollBarEnabled = false
        }
        setContentView(webView)
        ads = Ads(this, webView)
        ads.init()

        // تجنب تداخل شريط الحالة/التنقل مع اللعبة
        ViewCompat.setOnApplyWindowInsetsListener(webView) { v, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout())
            v.setPadding(bars.left, bars.top, bars.right, bars.bottom)
            insets
        }

        // يخدم ملفات assets عبر https://appassets.androidplatform.net (أصل آمن، localStorage ثابت)
        val assetLoader = WebViewAssetLoader.Builder()
            .setDomain(HOST)
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true                       // localStorage لحفظ التقدم
            mediaPlaybackRequiresUserGesture = false       // WebAudio
            allowFileAccess = false
            allowContentAccess = false
            cacheMode = WebSettings.LOAD_DEFAULT
            setSupportZoom(false)
            builtInZoomControls = false
            displayZoomControls = false
            useWideViewPort = true
            loadWithOverviewMode = true
            setSupportMultipleWindows(true)                // لفتح واتساب من window.open
        }

        webView.addJavascriptInterface(Bridge(), "AndroidBridge")

        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? =
                assetLoader.shouldInterceptRequest(request.url)

            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val uri = request.url
                if (uri.host == HOST) return false
                openExternal(uri)
                return true
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            // window.open(...) → نفتحه خارج التطبيق (واتساب/المتصفح)
            override fun onCreateWindow(view: WebView, isDialog: Boolean, isUserGesture: Boolean, resultMsg: Message): Boolean {
                val temp = WebView(view.context)
                temp.webViewClient = object : WebViewClient() {
                    override fun shouldOverrideUrlLoading(v: WebView, request: WebResourceRequest): Boolean {
                        openExternal(request.url); v.destroy(); return true
                    }
                }
                (resultMsg.obj as WebView.WebViewTransport).webView = temp
                resultMsg.sendToTarget()
                return true
            }
        }

        // زر الرجوع: نمرره للّعبة (popstate) — اللعبة نفسها تقرر الإيقاف/القائمة/الخروج
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) webView.goBack() else finish()
            }
        })

        if (savedInstanceState == null) webView.loadUrl(START_URL) else webView.restoreState(savedInstanceState)
    }

    private fun openExternal(uri: Uri) {
        try {
            startActivity(Intent(Intent.ACTION_VIEW, uri).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
        } catch (_: ActivityNotFoundException) { /* لا يوجد تطبيق مناسب */ }
    }

    private fun hideSystemBars() {
        val c = WindowInsetsControllerCompat(window, window.decorView)
        c.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        c.hide(WindowInsetsCompat.Type.systemBars())
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) hideSystemBars()
    }

    override fun onStart() { super.onStart(); Reminders.cancel(this) }
    override fun onStop() { Reminders.scheduleFromNow(this); super.onStop() }

    override fun onResume() { super.onResume(); webView.onResume(); checkUpdate() }

    /** نافذة تحديث داخل اللعبة (تعمل فقط عند التثبيت من Google Play). */
    private fun checkUpdate() {
        try {
            val mgr = updateMgr ?: AppUpdateManagerFactory.create(this).also { updateMgr = it }
            mgr.appUpdateInfo.addOnSuccessListener { info ->
                if (info.installStatus() == InstallStatus.DOWNLOADED) { showRestartDialog(); return@addOnSuccessListener }
                if (!updateChecked && info.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE &&
                    info.isUpdateTypeAllowed(AppUpdateType.FLEXIBLE)) {
                    updateChecked = true
                    mgr.registerListener(updateListener)
                    mgr.startUpdateFlowForResult(info, updateLauncher, AppUpdateOptions.newBuilder(AppUpdateType.FLEXIBLE).build())
                }
            }
        } catch (_: Throwable) { /* غير مثبّت من Google Play */ }
    }

    private fun showRestartDialog() {
        if (isFinishing) return
        val l = Reminders.lang(this)
        val t = when (l) {
            "en" -> arrayOf("Update downloaded 🎉", "A new version of the game is ready. Restart the game to install it (your progress is saved).", "Restart", "Later")
            "id" -> arrayOf("Pembaruan terunduh 🎉", "Versi baru game sudah siap. Mulai ulang game untuk memasangnya (kemajuanmu aman).", "Mulai ulang", "Nanti")
            "tr" -> arrayOf("Güncelleme indirildi 🎉", "Oyunun yeni sürümü hazır. Yüklemek için oyunu yeniden başlat (ilerlemen kayıtlı).", "Yeniden başlat", "Sonra")
            "fr" -> arrayOf("Mise à jour téléchargée 🎉", "Une nouvelle version du jeu est prête. Redémarrez le jeu pour l'installer (votre progression est sauvegardée).", "Redémarrer", "Plus tard")
            "ur" -> arrayOf("اپ ڈیٹ ڈاؤن لوڈ ہو گئی 🎉", "کھیل کا نیا ورژن تیار ہے۔ اسے انسٹال کرنے کے لیے کھیل دوبارہ شروع کریں (آپ کی پیش رفت محفوظ ہے)۔", "دوبارہ شروع کریں", "بعد میں")
            "bn" -> arrayOf("আপডেট ডাউনলোড হয়েছে 🎉", "খেলার নতুন সংস্করণ প্রস্তুত। ইনস্টল করতে খেলাটি আবার চালু করুন (আপনার অগ্রগতি সংরক্ষিত)।", "আবার চালু করুন", "পরে")
            "ms" -> arrayOf("Kemas kini dimuat turun 🎉", "Versi baharu permainan sudah sedia. Mulakan semula permainan untuk memasangnya (kemajuan anda selamat).", "Mulakan semula", "Nanti")
            "fa" -> arrayOf("به‌روزرسانی دانلود شد 🎉", "نسخهٔ جدید بازی آماده است. برای نصب، بازی را دوباره راه‌اندازی کنید (پیشرفت شما ذخیره است).", "راه‌اندازی دوباره", "بعداً")
            "ru" -> arrayOf("Обновление загружено 🎉", "Новая версия игры готова. Перезапустите игру, чтобы установить её (ваш прогресс сохранён).", "Перезапустить", "Позже")
            else -> arrayOf("تم تنزيل التحديث 🎉", "إصدار جديد من اللعبة جاهز. أعد تشغيل اللعبة لتثبيته (تقدمك محفوظ).", "إعادة التشغيل", "لاحقاً")
        }
        AlertDialog.Builder(this)
            .setTitle(t[0])
            .setMessage(t[1])
            .setPositiveButton(t[2]) { _, _ -> try { updateMgr?.completeUpdate() } catch (_: Throwable) {} }
            .setNegativeButton(t[3], null)
            .show()
    }
    override fun onPause() { webView.onPause(); super.onPause() }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        webView.saveState(outState)
    }

    override fun onDestroy() {
        webView.removeJavascriptInterface("AndroidBridge")
        webView.destroy()
        super.onDestroy()
    }

    /** جسر JavaScript ← Android */
    inner class Bridge {
        @JavascriptInterface
        fun exit() { runOnUiThread { finishAndRemoveTask() } }

        @JavascriptInterface
        fun setBrightness(v: Double) {
            runOnUiThread {
                val lp = window.attributes
                lp.screenBrightness = if (v < 0) WindowManager.LayoutParams.BRIGHTNESS_OVERRIDE_NONE else v.toFloat().coerceIn(0.01f, 1f)
                window.attributes = lp
            }
        }

        @JavascriptInterface
        fun showRewardedAd() { ads.show() }

        @JavascriptInterface
        fun setLang(l: String) { Reminders.setLang(this@MainActivity, l) }

        @JavascriptInterface
        fun setReminders(on: Boolean) { Reminders.setOn(this@MainActivity, on) }

        @JavascriptInterface
        fun requestNotifPermission() {
            if (Build.VERSION.SDK_INT >= 33 &&
                ContextCompat.checkSelfPermission(this@MainActivity, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                runOnUiThread { notifPerm.launch(Manifest.permission.POST_NOTIFICATIONS) }
            }
        }
    }
}
