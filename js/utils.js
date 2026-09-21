/* ============================================================
   utils.js — küçük ortak yardımcılar
   ============================================================ */

const Utils = (() => {
  /* Çakışma ihtimali yok denecek kadar düşük kısa kimlik */
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /* Kullanıcı metni HTML'e basılmadan önce buradan geçer.
     Aksi halde başlığa <img onerror=...> yazan biri kendi
     kodunu çalıştırabilir. */
  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /* Yerel saate göre bugün — toISOString() UTC'ye kaydırıp
     akşam saatlerinde yanlış gün verdiği için elle kuruyoruz. */
  function todayISO() {
    const d = new Date();
    const ay = String(d.getMonth() + 1).padStart(2, "0");
    const gun = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${ay}-${gun}`;
  }

  function isOverdue(iso) {
    return Boolean(iso) && iso < todayISO();
  }

  function isToday(iso) {
    return iso === todayISO();
  }

  function isValidEmail(mail) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(mail).trim());
  }

  /* Ad soyaddan baş harfler: "Emre Deniz" -> "ED" */
  function initials(name) {
    const parcalar = String(name || "").trim().split(/\s+/).filter(Boolean);
    if (!parcalar.length) return "?";
    if (parcalar.length === 1) return parcalar[0].slice(0, 2).toUpperCase();
    return (parcalar[0][0] + parcalar[parcalar.length - 1][0]).toUpperCase();
  }

  /* Şifre karması — djb2 tabanlı, tuzlu.
     UYARI: Bu gerçek bir güvenlik önlemi DEĞİL. Sadece şifrenin
     localStorage'da düz metin durmasını engeller. Tarayıcı
     depolaması kullanıcı tarafından okunabilir ve değiştirilebilir;
     gerçek bir uygulamada kimlik doğrulama sunucuda yapılmalı. */
  function hashPassword(password, salt) {
    const girdi = salt + "::" + password;
    let h = 5381;
    for (let i = 0; i < girdi.length; i++) {
      h = (h * 33) ^ girdi.charCodeAt(i);
    }
    // İkinci tur, farklı bir başlangıçla — çakışmayı biraz daha zorlaştırır
    let h2 = 52711;
    for (let i = girdi.length - 1; i >= 0; i--) {
      h2 = (h2 * 31) ^ girdi.charCodeAt(i);
    }
    return (h >>> 0).toString(36) + (h2 >>> 0).toString(36);
  }

  function randomSalt() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  /* Arama kutusu her tuşta yeniden render tetiklemesin diye */
  function debounce(fn, ms = 200) {
    let zamanlayici;
    return function (...args) {
      clearTimeout(zamanlayici);
      zamanlayici = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  return {
    uid,
    escapeHtml,
    todayISO,
    isOverdue,
    isToday,
    isValidEmail,
    initials,
    hashPassword,
    randomSalt,
    debounce
  };
})();
