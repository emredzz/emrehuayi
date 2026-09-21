/* ============================================================
   storage.js — localStorage / sessionStorage sarmalayıcı
   Tüm okuma-yazma buradan geçer: JSON dönüşümü ve hata
   yakalama tek yerde toplanır. Gizli sekmede veya kota
   dolduğunda tarayıcı exception fırlatır, o yüzden her
   erişim try/catch içinde.
   ============================================================ */

const Store = (() => {
  const PREFIX = "minitodo:";

  function read(key, fallback = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (err) {
      console.warn("Store.read başarısız:", key, err);
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.warn("Store.write başarısız:", key, err);
      return false;
    }
  }

  function remove(key) {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch (err) {
      console.warn("Store.remove başarısız:", key, err);
    }
  }

  /* Oturum: "Beni hatırla" işaretliyse localStorage'a,
     değilse sessionStorage'a yazılır. sessionStorage sekme
     kapanınca silinir, kalıcı oturum açılmamış olur. */

  const SESSION_KEY = PREFIX + "session";

  function readSession() {
    try {
      const raw =
        localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.warn("Oturum okunamadı:", err);
      return null;
    }
  }

  function writeSession(session, persist) {
    try {
      const raw = JSON.stringify(session);
      if (persist) {
        localStorage.setItem(SESSION_KEY, raw);
        sessionStorage.removeItem(SESSION_KEY);
      } else {
        sessionStorage.setItem(SESSION_KEY, raw);
        localStorage.removeItem(SESSION_KEY);
      }
      return true;
    } catch (err) {
      console.warn("Oturum yazılamadı:", err);
      return false;
    }
  }

  function clearSession() {
    try {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    } catch (err) {
      console.warn("Oturum silinemedi:", err);
    }
  }

  return { read, write, remove, readSession, writeSession, clearSession };
})();
