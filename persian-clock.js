function initPersianClock() {
    function toPersianDigits(str) {
        return str.replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
    }
    function toJalali(gy, gm, gd) {
        var g_d_m = [0,31,59,90,120,151,181,212,243,273,304,334];
        var jy = (gy <= 1600) ? 0 : 979;
        gy -= (gy <= 1600) ? 621 : 1600;
        var gy2 = (gm > 2) ? (gy + 1) : gy;
        var days = (365 * gy) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99)/100) +
           Math.floor((gy2 + 399)/400) - 80 + gd + g_d_m[gm-1];
        jy += 33 * Math.floor(days / 12053);
        days %= 12053;
        jy += 4 * Math.floor(days/1461);
        days %= 1461;
        if(days > 365){
            jy += Math.floor((days - 1)/365);
            days = (days - 1)%365;
        }
        var jm = (days < 186) ? 1 + Math.floor(days/31) : 7 + Math.floor((days-186)/30);
        var jd = 1 + ((days < 186) ? (days%31) : ((days-186)%30));
        return [jy + 1, jm, jd];
    }
    var persianMonths = [
        "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
        "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
    ];
    var persianWeekdays = [
        "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه", "شنبه"
    ];
    function updatePersianClock() {
        const now = new Date();
        let h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
        var elHour = document.getElementById("persianHour");
        var elMinute = document.getElementById("persianMinute");
        var elSecond = document.getElementById("persianSecond");
        var elDate = document.getElementById("persianDate");
        if (!elHour || !elMinute || !elSecond || !elDate) return;
        elHour.textContent = toPersianDigits(h.toString().padStart(2, "0"));
        elMinute.textContent = toPersianDigits(m.toString().padStart(2, "0"));
        elSecond.textContent = toPersianDigits(s.toString().padStart(2, "0"));
        var [jy, jm, jd] = toJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
        var weekday = persianWeekdays[now.getDay()];
        var dateStr = `${weekday}، ${toPersianDigits(jd.toString())} ${persianMonths[jm - 1]} ${toPersianDigits(jy.toString())}`;
        elDate.textContent = dateStr;
    }
    setInterval(updatePersianClock, 1000);
    updatePersianClock();
}