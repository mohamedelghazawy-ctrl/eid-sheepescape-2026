package com.eid.sheepescape

import android.app.Activity
import android.content.pm.ApplicationInfo
import android.os.Handler
import android.os.Looper
import android.webkit.WebView
import com.google.android.gms.ads.AdError
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.FullScreenContentCallback
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.MobileAds
import com.google.android.gms.ads.rewarded.RewardedAd
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback
import com.google.android.ump.ConsentInformation
import com.google.android.ump.ConsentRequestParameters
import com.google.android.ump.UserMessagingPlatform

/** إعلانات AdMob بمكافأة: تُستدعى من الجافاسكربت عبر AndroidBridge.showRewardedAd() وتعيد النتيجة إلى window.__adResult(ok, reason) */
class Ads(private val act: Activity, private val web: WebView) {
    private companion object {
        const val UNIT_REAL = "ca-app-pub-6221523107197866/1225087681"
        const val UNIT_TEST = "ca-app-pub-3940256099942544/5224354917"   // معرّف Google التجريبي (للنسخ التجريبية فقط)
    }

    private val ui = Handler(Looper.getMainLooper())
    private var ad: RewardedAd? = null
    private var loading = false
    private var started = false
    private var pendingShow = false
    private var rewarded = false

    private fun unit() = if ((act.applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE) != 0) UNIT_TEST else UNIT_REAL

    /** موافقة المستخدم (UMP) ثم تهيئة SDK ثم تحميل أول إعلان */
    fun init() {
        // تأخير بسيط بعد إقلاع اللعبة، وأي خطأ في الإعلانات لا يُسقط التطبيق
        ui.postDelayed({
            try {
                val ci = UserMessagingPlatform.getConsentInformation(act)
                ci.requestConsentInfoUpdate(act, ConsentRequestParameters.Builder().build(), {
                    try { UserMessagingPlatform.loadAndShowConsentFormIfRequired(act) { startSdk(ci) } } catch (_: Throwable) { startSdk(ci) }
                }, { startSdk(ci) })
                startSdk(ci)   // إن كانت الموافقة محفوظة مسبقاً
            } catch (_: Throwable) { }
        }, 1500)
    }

    private fun startSdk(ci: ConsentInformation) {
        if (started || !ci.canRequestAds()) return
        started = true
        try { MobileAds.initialize(act) { act.runOnUiThread { load() } } } catch (_: Throwable) { started = false }
    }

    private fun load() {
        if (!started || ad != null || loading) return
        loading = true
        try { RewardedAd.load(act, unit(), AdRequest.Builder().build(), object : RewardedAdLoadCallback() {
            override fun onAdLoaded(a: RewardedAd) {
                ad = a; loading = false
                if (pendingShow) { pendingShow = false; show() }
            }
            override fun onAdFailedToLoad(e: LoadAdError) {
                ad = null; loading = false
                if (pendingShow) { pendingShow = false; report(false, "unavail") }
            }
        }) } catch (_: Throwable) { loading = false }
    }

    fun show() {
        act.runOnUiThread {
            val a = ad
            if (a == null) {
                if (!started) { report(false, "unavail"); return@runOnUiThread }
                pendingShow = true; load()
                ui.postDelayed({ if (pendingShow) { pendingShow = false; report(false, "unavail") } }, 8000)
                return@runOnUiThread
            }
            rewarded = false
            a.fullScreenContentCallback = object : FullScreenContentCallback() {
                override fun onAdDismissedFullScreenContent() { ad = null; report(rewarded, "closed"); load() }
                override fun onAdFailedToShowFullScreenContent(e: AdError) { ad = null; report(false, "unavail"); load() }
            }
            try { a.show(act) { rewarded = true } } catch (_: Throwable) { ad = null; report(false, "unavail") }
        }
    }

    private fun report(ok: Boolean, why: String) {
        web.post { web.evaluateJavascript("window.__adResult&&window.__adResult($ok,'$why')", null) }
    }
}
