package com.eid.sheepescape

import android.app.Activity
import android.content.Intent
import android.webkit.WebView
import androidx.activity.result.ActivityResultLauncher
import com.google.android.gms.games.PlayGames
import com.google.android.gms.games.PlayGamesSdk

/**
 * لوحات المتصدرين عبر ألعاب Google Play (PGS v2).
 * كل مستوى صعوبة له لوحة مستقلة. أي فشل يُبتلع بصمت كي لا يتعطل التطبيق.
 */
class Games(
    private val act: Activity,
    private val web: WebView,
    private val launcher: ActivityResultLauncher<Intent>
) {
    private companion object {
        val BOARDS = mapOf(
            "easy" to "CggInqLA3g0QAhAB",
            "normal" to "CggInqLA3g0QAhAC",
            "hard" to "CggInqLA3g0QAhAD"
        )
    }

    fun init() {
        try { PlayGamesSdk.initialize(act) } catch (_: Throwable) { }
    }

    /** يرسل نقاط الجولة؛ ألعاب Google Play تحتفظ بالأعلى فقط. */
    fun submit(diff: String, score: Long) {
        try {
            val id = BOARDS[diff] ?: return
            if (score <= 0L) return
            PlayGames.getLeaderboardsClient(act).submitScore(id, score)
        } catch (_: Throwable) { }
    }

    /** يفتح لوحة المستوى (أو كل اللوحات إن لم يُحدَّد)، ويسجّل الدخول أولاً عند الحاجة. */
    fun show(diff: String?) {
        try {
            val sign = PlayGames.getGamesSignInClient(act)
            sign.isAuthenticated().addOnCompleteListener { t ->
                if (t.isSuccessful && t.result.isAuthenticated) {
                    open(diff)
                } else {
                    sign.signIn().addOnCompleteListener { s ->
                        if (s.isSuccessful && s.result.isAuthenticated) open(diff) else fail()
                    }
                }
            }
        } catch (_: Throwable) { fail() }
    }

    private fun open(diff: String?) {
        try {
            val c = PlayGames.getLeaderboardsClient(act)
            val id = diff?.let { BOARDS[it] }
            val task = if (id != null) c.getLeaderboardIntent(id) else c.getAllLeaderboardsIntent()
            task.addOnSuccessListener { launcher.launch(it) }.addOnFailureListener { fail() }
        } catch (_: Throwable) { fail() }
    }

    private fun fail() {
        act.runOnUiThread {
            try { web.evaluateJavascript("window.__lbFail&&window.__lbFail()", null) } catch (_: Throwable) { }
        }
    }
}
