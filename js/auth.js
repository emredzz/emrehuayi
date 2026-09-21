/* ============================================================
   auth.js — kayıt, giriş, oturum, şifre işlemleri
   Kullanıcılar localStorage'da "minitodo:users" altında bir
   dizi olarak durur. Oturum ise "Beni hatırla" seçimine göre
   localStorage veya sessionStorage'a yazılır.
   ============================================================ */

const Auth = (() => {
  const USERS_KEY = "users";

  function allUsers() {
    const liste = Store.read(USERS_KEY, []);
    return Array.isArray(liste) ? liste : [];
  }

  function saveUsers(liste) {
    return Store.write(USERS_KEY, liste);
  }

  function findByEmail(email) {
    const hedef = String(email || "").trim().toLowerCase();
    return allUsers().find((u) => u.email.toLowerCase() === hedef) || null;
  }

  function findByUsername(username) {
    const hedef = String(username || "").trim().toLowerCase();
    return allUsers().find((u) => u.username.toLowerCase() === hedef) || null;
  }

  function findById(id) {
    return allUsers().find((u) => u.id === id) || null;
  }

  /* Oturumdaki kullanıcı — yoksa null.
     Oturum kaydı var ama kullanıcı silinmişse oturumu temizler. */
  function currentUser() {
    const oturum = Store.readSession();
    if (!oturum || !oturum.userId) return null;
    const kullanici = findById(oturum.userId);
    if (!kullanici) {
      Store.clearSession();
      return null;
    }
    return kullanici;
  }

  /* ---------- Kayıt ---------- */

  function signUp({ fullName, username, email, password, passwordAgain }) {
    const hatalar = {};

    if (!fullName || fullName.trim().length < 3) hatalar.fullName = "err.nameShort";
    if (!username || username.trim().length < 3) hatalar.username = "err.userShort";
    if (!email || !email.trim()) hatalar.email = "err.required";
    else if (!Utils.isValidEmail(email)) hatalar.email = "err.emailInvalid";
    if (!password) hatalar.password = "err.required";
    else if (password.length < 6) hatalar.password = "err.passShort";
    if (password !== passwordAgain) hatalar.passwordAgain = "err.passMatch";

    if (!hatalar.email && findByEmail(email)) hatalar.email = "err.emailTaken";
    if (!hatalar.username && findByUsername(username)) hatalar.username = "err.userTaken";

    if (Object.keys(hatalar).length) return { ok: false, errors: hatalar };

    const salt = Utils.randomSalt();
    const kullanici = {
      id: Utils.uid(),
      fullName: fullName.trim(),
      username: username.trim(),
      email: email.trim(),
      salt,
      passwordHash: Utils.hashPassword(password, salt),
      avatar: null,
      createdAt: new Date().toISOString()
    };

    const liste = allUsers();
    liste.push(kullanici);
    if (!saveUsers(liste)) return { ok: false, errors: { email: "err.storageFull" } };

    Data.seedDefaults(kullanici.id);
    return { ok: true, user: kullanici };
  }

  /* ---------- Giriş ---------- */

  function signIn({ email, password, remember }) {
    const hatalar = {};
    if (!email || !email.trim()) hatalar.email = "err.required";
    else if (!Utils.isValidEmail(email)) hatalar.email = "err.emailInvalid";
    if (!password) hatalar.password = "err.required";

    if (Object.keys(hatalar).length) return { ok: false, errors: hatalar };

    const kullanici = findByEmail(email);
    if (!kullanici || kullanici.passwordHash !== Utils.hashPassword(password, kullanici.salt)) {
      // Hangisinin yanlış olduğunu söylemiyoruz — kayıtlı e-postaları
      // tek tek denemeyi kolaylaştırmamak için.
      return { ok: false, errors: { password: "err.credentials" } };
    }

    Store.writeSession(
      { userId: kullanici.id, at: new Date().toISOString() },
      Boolean(remember)
    );
    return { ok: true, user: kullanici };
  }

  function signOut() {
    Store.clearSession();
  }

  /* ---------- Şifre sıfırlama ----------
     Yerel uygulamada e-posta gönderilemediği için doğrulama
     adımı yok: e-posta kayıtlıysa yeni şifre doğrudan yazılır. */

  function resetPassword({ email, password, passwordAgain }) {
    const hatalar = {};
    if (!email || !Utils.isValidEmail(email)) hatalar.email = "err.emailInvalid";
    if (!password || password.length < 6) hatalar.password = "err.passShort";
    if (password !== passwordAgain) hatalar.passwordAgain = "err.passMatch";
    if (Object.keys(hatalar).length) return { ok: false, errors: hatalar };

    const liste = allUsers();
    const idx = liste.findIndex((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (idx === -1) return { ok: false, errors: { email: "err.userNotFound" } };

    const salt = Utils.randomSalt();
    liste[idx].salt = salt;
    liste[idx].passwordHash = Utils.hashPassword(password, salt);
    saveUsers(liste);
    return { ok: true };
  }

  /* ---------- Profil ---------- */

  function updateProfile(userId, { fullName, username, email, avatar }) {
    const hatalar = {};
    if (!fullName || fullName.trim().length < 3) hatalar.fullName = "err.nameShort";
    if (!username || username.trim().length < 3) hatalar.username = "err.userShort";
    if (!email || !Utils.isValidEmail(email)) hatalar.email = "err.emailInvalid";

    // Aynı e-posta/kullanıcı adı başkasındaysa hata
    const mailSahibi = findByEmail(email);
    if (mailSahibi && mailSahibi.id !== userId) hatalar.email = "err.emailTaken";
    const adSahibi = findByUsername(username);
    if (adSahibi && adSahibi.id !== userId) hatalar.username = "err.userTaken";

    if (Object.keys(hatalar).length) return { ok: false, errors: hatalar };

    const liste = allUsers();
    const idx = liste.findIndex((u) => u.id === userId);
    if (idx === -1) return { ok: false, errors: { email: "err.userNotFound" } };

    liste[idx].fullName = fullName.trim();
    liste[idx].username = username.trim();
    liste[idx].email = email.trim();
    if (avatar !== undefined) liste[idx].avatar = avatar;

    if (!saveUsers(liste)) return { ok: false, errors: { avatar: "err.storageFull" } };
    return { ok: true, user: liste[idx] };
  }

  function changePassword(userId, { current, next, nextAgain }) {
    const hatalar = {};
    if (!current) hatalar.current = "err.required";
    if (!next || next.length < 6) hatalar.next = "err.passShort";
    if (next !== nextAgain) hatalar.nextAgain = "err.passMatch";
    if (Object.keys(hatalar).length) return { ok: false, errors: hatalar };

    const liste = allUsers();
    const idx = liste.findIndex((u) => u.id === userId);
    if (idx === -1) return { ok: false, errors: { current: "err.userNotFound" } };

    if (liste[idx].passwordHash !== Utils.hashPassword(current, liste[idx].salt)) {
      return { ok: false, errors: { current: "err.currentPass" } };
    }

    const salt = Utils.randomSalt();
    liste[idx].salt = salt;
    liste[idx].passwordHash = Utils.hashPassword(next, salt);
    saveUsers(liste);
    return { ok: true };
  }

  return {
    currentUser,
    findById,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    changePassword
  };
})();
