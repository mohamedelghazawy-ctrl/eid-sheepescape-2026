package com.eid.sheepescape

import android.Manifest
import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import java.util.Calendar

/** تذكيرات محلية (بدون سيرفر): بعد 48 ساعة، 5 أيام، 14 يوماً من آخر خروج من اللعبة. */
object Reminders {
    private const val PREFS = "se_prefs"
    private const val K_ON = "remind_on"
    private const val K_LAST = "last_stop"
    const val CHANNEL = "reminders"
    private const val H = 3600_000L
    private val DELAYS = longArrayOf(48 * H, 5 * 24 * H, 14 * 24 * H)

    private const val K_LANG = "lang"
    private val TITLES = mapOf("ar" to "هروب خروف العيد", "en" to "Eid Sheep Escape", "id" to "Pelarian Domba Idul Adha", "tr" to "Kurban Bayramı Koyunu Kaçıyor", "fr" to "Évasion du Mouton de l'Aïd", "ur" to "عید کے دنبے کا فرار", "bn" to "ঈদের ভেড়ার পলায়ন", "ms" to "Larian Biri-biri Aidiladha", "fa" to "فرار گوسفند عید قربان", "ru" to "Побег барашка на Курбан-байрам")
    private val CH_NAMES = mapOf("ar" to "تذكيرات اللعبة", "en" to "Game reminders", "id" to "Pengingat game", "tr" to "Oyun hatırlatıcıları", "fr" to "Rappels du jeu", "ur" to "کھیل کی یاد دہانیاں", "bn" to "খেলার স্মারক", "ms" to "Peringatan permainan", "fa" to "یادآورهای بازی", "ru" to "Напоминания игры")
    private val TEXTS = mapOf(
        "ar" to arrayOf(
            arrayOf("الخروف ينتظرك! 🐑 مكافأتك اليومية في خطر!", "بسيوني يسأل عنك.. تعال اهرب قبل العيد! 🔪", "تحدي العيد اليومي جاهز.. لا تضيّع المكافأة! 🎁"),
            arrayOf("بسيوني ما زال يطاردك! 😅 كم متراً ستهرب اليوم؟", "البرسيم 🍀 مشتاق إليك.. ارجع واجمع المزيد!", "مكافآتك اليومية بانتظارك، وبالونة العيد 🎈 أيضاً!"),
            arrayOf("اشتقنا لك! 🐑 الخروف ما زال هارباً وينتظر مساعدتك.", "هل نسيت الخروف؟ عُد وأكمل الهروب من بسيوني! 🏃")
        ),
        "en" to arrayOf(
            arrayOf("The sheep is waiting for you! 🐑 Your daily reward is at risk!", "Bassy is asking about you.. come run before Eid! 🔪", "Today's Eid challenge is ready.. don't miss the reward! 🎁"),
            arrayOf("Bassy is still chasing you! 😅 How many meters will you run today?", "The clovers 🍀 miss you.. come back and collect more!", "Your daily rewards are waiting, and an Eid balloon 🎈 too!"),
            arrayOf("We miss you! 🐑 The sheep is still on the run and needs your help.", "Forgot about the sheep? Come back and keep escaping Bassy! 🏃")
        ),
        "id" to arrayOf(
            arrayOf("Si domba menunggumu! 🐑 Hadiah harianmu terancam hangus!", "Pak Jagal menanyakanmu.. ayo kabur sebelum Idul Adha! 🔪", "Tantangan harian Idul Adha sudah siap.. jangan lewatkan hadiahnya! 🎁"),
            arrayOf("Pak Jagal masih mengejarmu! 😅 Berapa meter kamu akan lari hari ini?", "Semanggi 🍀 merindukanmu.. kembali dan kumpulkan lagi!", "Hadiah harianmu menunggu, dan balon Idul Adha 🎈 juga!"),
            arrayOf("Kami kangen kamu! 🐑 Si domba masih buron dan butuh bantuanmu.", "Lupa sama si domba? Kembali dan lanjutkan kabur dari Pak Jagal! 🏃")
        ),
        "tr" to arrayOf(
            arrayOf("Koyun seni bekliyor! 🐑 Günlük ödülün tehlikede!", "Beşir seni soruyor.. bayramdan önce gel de kaç! 🔪", "Günlük bayram görevi hazır.. ödülü kaçırma! 🎁"),
            arrayOf("Beşir hâlâ peşinde! 😅 Bugün kaç metre kaçacaksın?", "Yoncalar 🍀 seni özledi.. dön ve daha çok topla!", "Günlük ödüllerin seni bekliyor, bir bayram balonu 🎈 da!"),
            arrayOf("Seni özledik! 🐑 Koyun hâlâ kaçak ve yardımına ihtiyacı var.", "Koyunu unuttun mu? Dön ve Beşir’den kaçmaya devam et! 🏃")
        ),
        "fr" to arrayOf(
            arrayOf("Le mouton vous attend ! 🐑 Votre récompense du jour est en danger !", "Bassou le Boucher demande de vos nouvelles.. venez courir avant l'Aïd ! 🔪", "Le défi de l'Aïd du jour est prêt.. ne ratez pas la récompense ! 🎁"),
            arrayOf("Bassou vous poursuit toujours ! 😅 Combien de mètres allez-vous courir aujourd'hui ?", "Les trèfles 🍀 vous réclament.. revenez en ramasser !", "Vos récompenses quotidiennes vous attendent, et un ballon de l'Aïd 🎈 aussi !"),
            arrayOf("Vous nous manquez ! 🐑 Le mouton est toujours en fuite et a besoin de vous.", "Vous avez oublié le mouton ? Revenez et continuez à fuir Bassou ! 🏃")
        ),
        "ur" to arrayOf(
            arrayOf("دنبہ آپ کا انتظار کر رہا ہے! 🐑 آپ کا روزانہ انعام خطرے میں ہے!", "بشیر قصائی آپ کا پوچھ رہا ہے.. عید سے پہلے آ کر بھاگیں! 🔪", "آج کا عید چیلنج تیار ہے.. انعام ضائع نہ کریں! 🎁"),
            arrayOf("بشیر قصائی اب بھی آپ کے پیچھے ہے! 😅 آج کتنے میٹر بھاگیں گے؟", "برسیم 🍀 آپ کو یاد کر رہے ہیں.. واپس آئیں اور مزید جمع کریں!", "آپ کے روزانہ انعام منتظر ہیں، اور عید کا غبارہ 🎈 بھی!"),
            arrayOf("ہمیں آپ کی یاد آ رہی ہے! 🐑 دنبہ اب بھی فرار ہے اور آپ کی مدد چاہتا ہے۔", "دنبے کو بھول گئے؟ واپس آئیں اور بشیر قصائی سے بھاگتے رہیں! 🏃")
        ),
        "bn" to arrayOf(
            arrayOf("ভেড়া আপনার অপেক্ষায়! 🐑 আপনার দৈনিক পুরস্কার ঝুঁকিতে!", "কসাই বশির আপনার খোঁজ করছে.. ঈদের আগে এসে পালান! 🔪", "আজকের ঈদের চ্যালেঞ্জ তৈরি.. পুরস্কার হাতছাড়া করবেন না! 🎁"),
            arrayOf("কসাই বশির এখনও আপনার পিছু নিচ্ছে! 😅 আজ কত মিটার পালাবেন?", "ক্লোভার 🍀 আপনাকে মিস করছে.. ফিরে এসে আরও জমান!", "আপনার দৈনিক পুরস্কার অপেক্ষায়, সঙ্গে ঈদের বেলুন 🎈ও!")
,            arrayOf("আমরা আপনাকে মিস করছি! 🐑 ভেড়া এখনও পলাতক, আপনার সাহায্য দরকার।", "ভেড়াকে ভুলে গেলেন? ফিরে এসে কসাই বশিরের কাছ থেকে পালাতে থাকুন! 🏃")
        ),
        "ms" to arrayOf(
            arrayOf("Biri-biri menunggu anda! 🐑 Ganjaran harian anda hampir hangus!", "Pak Mat Sembelih tanya pasal anda.. mari lari sebelum Hari Raya! 🔪", "Cabaran Hari Raya hari ini dah sedia.. jangan lepaskan ganjarannya! 🎁"),
            arrayOf("Pak Mat Sembelih masih mengejar anda! 😅 Berapa meter anda nak lari hari ini?", "Semanggi 🍀 rindukan anda.. kembali dan kumpul lagi!", "Ganjaran harian menanti anda, begitu juga belon Hari Raya 🎈!"),
            arrayOf("Kami rindu anda! 🐑 Biri-biri masih dalam pelarian dan perlukan bantuan anda.", "Lupa pada biri-biri? Kembali dan teruskan lari daripada Pak Mat Sembelih! 🏃")
        ),
        "fa" to arrayOf(
            arrayOf("گوسفند منتظر توست! 🐑 جایزهٔ روزانه‌ات در خطر است!", "قصاب رحیم سراغ تو را می‌گیرد.. پیش از عید بیا و فرار کن! 🔪", "چالش امروز عید آماده است.. جایزه را از دست نده! 🎁"),
            arrayOf("قصاب رحیم هنوز دنبالت است! 😅 امروز چند متر فرار می‌کنی؟", "شبدرها 🍀 دلتنگ تو شده‌اند.. برگرد و بیشتر جمع کن!", "جایزه‌های روزانه‌ات منتظرند، با یک بادکنک عید 🎈!"),
            arrayOf("دلمان برایت تنگ شده! 🐑 گوسفند هنوز فراری است و به کمکت نیاز دارد.", "گوسفند را فراموش کردی؟ برگرد و از دست قصاب رحیم فرار کن! 🏃")
        ),
        "ru" to arrayOf(
            arrayOf("Барашек ждёт тебя! 🐑 Твоя ежедневная награда под угрозой!", "Мясник Рахим спрашивает о тебе.. беги, пока не наступил праздник! 🔪", "Праздничное задание на сегодня готово.. не упусти награду! 🎁"),
            arrayOf("Мясник Рахим всё ещё гонится за тобой! 😅 Сколько метров пробежишь сегодня?", "Клевер 🍀 скучает по тебе.. вернись и собери ещё!", "Ежедневные награды ждут тебя, и праздничный шарик 🎈 тоже!"),
            arrayOf("Мы скучаем! 🐑 Барашек всё ещё в бегах и нуждается в твоей помощи.", "Забыл про барашка? Вернись и продолжай убегать от мясника Рахима! 🏃")
        )
    )

    fun lang(c: Context): String {
        val l = prefs(c).getString(K_LANG, null) ?: java.util.Locale.getDefault().language
        return if (TEXTS.containsKey(l)) l else "en"
    }
    fun setLang(c: Context, l: String) { prefs(c).edit().putString(K_LANG, l).apply() }

    private fun prefs(c: Context) = c.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    fun isOn(c: Context) = prefs(c).getBoolean(K_ON, true)
    fun setOn(c: Context, on: Boolean) { prefs(c).edit().putBoolean(K_ON, on).apply(); if (!on) cancel(c) }

    private fun pi(c: Context, i: Int): PendingIntent = PendingIntent.getBroadcast(
        c, 100 + i, Intent(c, ReminderReceiver::class.java).putExtra("idx", i),
        PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
    )

    fun cancel(c: Context) {
        val am = c.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        for (i in DELAYS.indices) am.cancel(pi(c, i))
    }

    /** يُستدعى عند ترك اللعبة (onStop). */
    fun scheduleFromNow(c: Context) {
        prefs(c).edit().putLong(K_LAST, System.currentTimeMillis()).apply()
        schedule(c)
    }

    fun schedule(c: Context) {
        cancel(c)
        if (!isOn(c)) return
        val last = prefs(c).getLong(K_LAST, 0L); if (last <= 0L) return
        val am = c.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val now = System.currentTimeMillis()
        for (i in DELAYS.indices) {
            val t = quiet(last + DELAYS[i])
            if (t <= now) continue
            try { am.setAndAllowWhileIdle(AlarmManager.RTC, t, pi(c, i)) } catch (_: Throwable) {}
        }
    }

    /** لا إشعارات بين 10 م و9 ص: ننقلها إلى 10 ص. */
    private fun quiet(t: Long): Long {
        val cal = Calendar.getInstance().apply { timeInMillis = t }
        val h = cal.get(Calendar.HOUR_OF_DAY)
        if (h >= 22) cal.add(Calendar.DAY_OF_YEAR, 1)
        if (h >= 22 || h < 9) { cal.set(Calendar.HOUR_OF_DAY, 10); cal.set(Calendar.MINUTE, 0); cal.set(Calendar.SECOND, 0) }
        return cal.timeInMillis
    }

    fun show(c: Context, idx: Int) {
        if (!isOn(c)) return
        if (Build.VERSION.SDK_INT >= 33 &&
            ContextCompat.checkSelfPermission(c, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return
        if (!NotificationManagerCompat.from(c).areNotificationsEnabled()) return
        val nm = c.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (Build.VERSION.SDK_INT >= 26) nm.createNotificationChannel(
            NotificationChannel(CHANNEL, CH_NAMES.getValue(lang(c)), NotificationManager.IMPORTANCE_DEFAULT))
        val tx = TEXTS.getValue(lang(c)); val list = tx[idx.coerceIn(0, tx.size - 1)]
        val open = PendingIntent.getActivity(
            c, 200, Intent(c, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
        val n = NotificationCompat.Builder(c, CHANNEL)
            .setSmallIcon(R.drawable.ic_stat_sheep)
            .setColor(0xFFE67E22.toInt())
            .setContentTitle(TITLES.getValue(lang(c)))
            .setContentText(list.random())
            .setAutoCancel(true)
            .setContentIntent(open)
            .build()
        try { nm.notify(300 + idx, n) } catch (_: SecurityException) {}
    }
}

class ReminderReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) { Reminders.show(context, intent.getIntExtra("idx", 0)) }
}

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) Reminders.schedule(context)
    }
}
