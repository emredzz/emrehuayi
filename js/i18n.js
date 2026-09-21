/* ============================================================
   i18n.js — Türkçe / İngilizce metinler
   HTML'de data-i18n="anahtar" yazan her elemanın metni
   applyTranslations() ile doldurulur.
   ============================================================ */

const I18N = (() => {
  const dict = {
    tr: {
      "app.name": "Mini Todo",
      "app.tagline": "Görevlerini topla, gününü planla.",
      "app.about": "Görevlerini kategorilere ayır, önceliklerini belirle ve son tarihlerini takip et. Her şey senin tarayıcında saklanır: sunucu yok, veri dışarı çıkmaz. İnternet bağlantısı olmadan da çalışır.",

      "auth.signin": "Giriş Yap",
      "auth.signup": "Kayıt Ol",
      "auth.welcome": "Tekrar hoş geldin",
      "auth.welcomeSub": "Devam etmek için giriş yap.",
      "auth.createTitle": "Hesap oluştur",
      "auth.createSub": "Birkaç saniye sürer.",
      "auth.email": "E-posta",
      "auth.password": "Şifre",
      "auth.passwordAgain": "Şifre tekrar",
      "auth.fullName": "Ad Soyad",
      "auth.username": "Kullanıcı adı",
      "auth.remember": "Beni hatırla",
      "auth.forgot": "Şifremi unuttum",
      "auth.noAccount": "Hesabın yok mu?",
      "auth.hasAccount": "Zaten hesabın var mı?",
      "auth.signinBtn": "Giriş yap",
      "auth.signupBtn": "Hesap oluştur",
      "auth.showPass": "Şifreyi göster",
      "auth.hidePass": "Şifreyi gizle",
      "auth.resetTitle": "Şifre sıfırla",
      "auth.resetSub": "Bu uygulama tamamen yerelde çalıştığı için e-posta gönderilmez. Hesabının e-postasını gir ve yeni şifreni belirle.",
      "auth.newPassword": "Yeni şifre",
      "auth.resetBtn": "Şifreyi güncelle",

      "nav.dashboard": "Panel",
      "nav.tasks": "Görevler",
      "nav.categories": "Kategoriler",
      "nav.profile": "Profil",

      "dash.greeting": "Merhaba",
      "dash.today": "Bugünün görevleri",
      "dash.pending": "Bekleyen",
      "dash.completed": "Tamamlanan",
      "dash.total": "Toplam",
      "dash.overdue": "Gecikmiş",
      "dash.noToday": "Bugün için görev yok. Keyfini çıkar.",
      "dash.recent": "Son eklenenler",

      "tasks.title": "Görevler",
      "tasks.add": "Görev Ekle",
      "tasks.search": "Görevlerde ara...",
      "tasks.all": "Tümü",
      "tasks.empty": "Burada görev yok.",
      "tasks.emptyHint": "Yeni bir görev ekleyerek başla.",
      "tasks.newTitle": "Yeni Görev",
      "tasks.editTitle": "Görevi Düzenle",
      "tasks.fieldTitle": "Görev başlığı",
      "tasks.fieldDesc": "Açıklama",
      "tasks.fieldCategory": "Kategori",
      "tasks.fieldPriority": "Öncelik",
      "tasks.fieldDue": "Son tarih",
      "tasks.create": "Görevi Oluştur",
      "tasks.save": "Kaydet",
      "tasks.noCategory": "Kategorisiz",
      "tasks.overdue": "Gecikti",
      "tasks.dueToday": "Bugün",
      "tasks.deleteTitle": "Görev silinsin mi?",
      "tasks.deleteBody": "Bu işlem geri alınamaz.",

      "prio.low": "Düşük",
      "prio.medium": "Orta",
      "prio.high": "Yüksek",

      "cat.title": "Kategoriler",
      "cat.new": "Yeni Kategori",
      "cat.name": "Kategori adı",
      "cat.icon": "Simge",
      "cat.color": "Renk",
      "cat.create": "Oluştur",
      "cat.save": "Kaydet",
      "cat.editTitle": "Kategoriyi Düzenle",
      "cat.taskCount": "görev",
      "cat.deleteTitle": "Kategori silinsin mi?",
      "cat.deleteBody": "Bu kategorideki görevler silinmez, kategorisiz kalır.",
      "cat.empty": "Henüz kategori yok.",
      "cat.all": "Tüm kategoriler",

      "sort.created": "Eklenme sırası",
      "sort.due": "Son tarihe göre",
      "sort.priority": "Önceliğe göre",
      "sort.title": "A-Z",

      "profile.title": "Profil",
      "profile.photo": "Profil fotoğrafı",
      "profile.upload": "Fotoğraf yükle",
      "profile.removePhoto": "Kaldır",
      "profile.fullName": "Ad soyad",
      "profile.email": "E-posta",
      "profile.username": "Kullanıcı adı",
      "profile.saveProfile": "Profili kaydet",
      "profile.changePass": "Şifre değiştir",
      "profile.currentPass": "Mevcut şifre",
      "profile.newPass": "Yeni şifre",
      "profile.newPassAgain": "Yeni şifre tekrar",
      "profile.updatePass": "Şifreyi güncelle",

      "set.title": "Ayarlar",
      "set.theme": "Görünüm",
      "set.dark": "Koyu",
      "set.light": "Açık",
      "set.notifications": "Bildirimler",
      "set.notificationsHint": "Görev tamamlandığında bildirim göster",
      "set.emailNotifications": "E-posta bildirimleri",
      "set.emailHint": "Yerel uygulamada e-posta gönderilmez, tercih olarak saklanır",
      "set.language": "Dil",
      "set.defaultView": "Varsayılan görev görünümü",
      "set.logout": "Çıkış Yap",
      "set.dangerTitle": "Verileri sıfırla",
      "set.dangerHint": "Bu hesaba ait tüm görev ve kategoriler silinir.",
      "set.resetData": "Verileri sil",
      "set.resetConfirm": "Tüm veriler silinsin mi?",
      "set.resetBody": "Görevlerin ve kategorilerin kalıcı olarak silinecek.",

      "common.cancel": "İptal",
      "common.delete": "Sil",
      "common.edit": "Düzenle",
      "common.close": "Kapat",
      "common.optional": "isteğe bağlı",
      "common.confirm": "Onayla",

      "msg.signedIn": "Giriş yapıldı",
      "msg.signedUp": "Hesap oluşturuldu",
      "msg.signedOut": "Çıkış yapıldı",
      "msg.taskAdded": "Görev eklendi",
      "msg.taskUpdated": "Görev güncellendi",
      "msg.taskDeleted": "Görev silindi",
      "msg.taskDone": "Görev tamamlandı",
      "msg.catAdded": "Kategori eklendi",
      "msg.catUpdated": "Kategori güncellendi",
      "msg.catDeleted": "Kategori silindi",
      "msg.profileSaved": "Profil kaydedildi",
      "msg.passChanged": "Şifre güncellendi",
      "msg.dataReset": "Veriler silindi",
      "msg.settingSaved": "Ayar kaydedildi",

      "err.required": "Bu alan zorunlu",
      "err.emailInvalid": "Geçerli bir e-posta gir",
      "err.emailTaken": "Bu e-posta zaten kayıtlı",
      "err.userTaken": "Bu kullanıcı adı alınmış",
      "err.passShort": "Şifre en az 6 karakter olmalı",
      "err.passMatch": "Şifreler eşleşmiyor",
      "err.credentials": "E-posta veya şifre hatalı",
      "err.userNotFound": "Bu e-postayla kayıtlı hesap yok",
      "err.currentPass": "Mevcut şifre hatalı",
      "err.nameShort": "En az 3 karakter olmalı",
      "err.userShort": "Kullanıcı adı en az 3 karakter olmalı",
      "err.catName": "Kategori adı gerekli",
      "err.catTaken": "Bu isimde bir kategori zaten var",
      "err.imageBig": "Görsel çok büyük (en fazla 1 MB)",
      "err.storageFull": "Tarayıcı depolama alanı dolu"
    },

    en: {
      "app.name": "Mini Todo",
      "app.tagline": "Collect your tasks, plan your day.",
      "app.about": "Sort your tasks into categories, set their priority and keep an eye on due dates. Everything is stored in your own browser: no server, no data leaving the machine. It works offline too.",

      "auth.signin": "Sign In",
      "auth.signup": "Sign Up",
      "auth.welcome": "Welcome back",
      "auth.welcomeSub": "Sign in to continue.",
      "auth.createTitle": "Create account",
      "auth.createSub": "It only takes a few seconds.",
      "auth.email": "Email",
      "auth.password": "Password",
      "auth.passwordAgain": "Confirm password",
      "auth.fullName": "Full name",
      "auth.username": "Username",
      "auth.remember": "Remember me",
      "auth.forgot": "Forgot password",
      "auth.noAccount": "Dont have an account?",
      "auth.hasAccount": "Already have an account?",
      "auth.signinBtn": "Sign in",
      "auth.signupBtn": "Create account",
      "auth.showPass": "Show password",
      "auth.hidePass": "Hide password",
      "auth.resetTitle": "Reset password",
      "auth.resetSub": "This app runs entirely offline, so no email is sent. Enter your account email and set a new password.",
      "auth.newPassword": "New password",
      "auth.resetBtn": "Update password",

      "nav.dashboard": "Dashboard",
      "nav.tasks": "Tasks",
      "nav.categories": "Categories",
      "nav.profile": "Profile",

      "dash.greeting": "Hello",
      "dash.today": "Todays tasks",
      "dash.pending": "Pending",
      "dash.completed": "Completed",
      "dash.total": "Total",
      "dash.overdue": "Overdue",
      "dash.noToday": "Nothing due today. Enjoy it.",
      "dash.recent": "Recently added",

      "tasks.title": "Tasks",
      "tasks.add": "Add Task",
      "tasks.search": "Search tasks...",
      "tasks.all": "All",
      "tasks.empty": "No tasks here.",
      "tasks.emptyHint": "Start by adding a new task.",
      "tasks.newTitle": "Add New Task",
      "tasks.editTitle": "Edit Task",
      "tasks.fieldTitle": "Task title",
      "tasks.fieldDesc": "Description",
      "tasks.fieldCategory": "Category",
      "tasks.fieldPriority": "Priority",
      "tasks.fieldDue": "Due date",
      "tasks.create": "Create Task",
      "tasks.save": "Save",
      "tasks.noCategory": "Uncategorized",
      "tasks.overdue": "Overdue",
      "tasks.dueToday": "Today",
      "tasks.deleteTitle": "Delete this task?",
      "tasks.deleteBody": "This action cannot be undone.",

      "prio.low": "Low",
      "prio.medium": "Medium",
      "prio.high": "High",

      "cat.title": "Categories",
      "cat.new": "New Category",
      "cat.name": "Category name",
      "cat.icon": "Icon",
      "cat.color": "Color",
      "cat.create": "Create",
      "cat.save": "Save",
      "cat.editTitle": "Edit Category",
      "cat.taskCount": "tasks",
      "cat.deleteTitle": "Delete this category?",
      "cat.deleteBody": "Tasks in it are kept, they just become uncategorized.",
      "cat.empty": "No categories yet.",
      "cat.all": "All categories",

      "sort.created": "Date added",
      "sort.due": "Due date",
      "sort.priority": "Priority",
      "sort.title": "A-Z",

      "profile.title": "Profile",
      "profile.photo": "Profile photo",
      "profile.upload": "Upload photo",
      "profile.removePhoto": "Remove",
      "profile.fullName": "Full name",
      "profile.email": "Email",
      "profile.username": "Username",
      "profile.saveProfile": "Save profile",
      "profile.changePass": "Change password",
      "profile.currentPass": "Current password",
      "profile.newPass": "New password",
      "profile.newPassAgain": "Confirm new password",
      "profile.updatePass": "Update password",

      "set.title": "Settings",
      "set.theme": "Appearance",
      "set.dark": "Dark",
      "set.light": "Light",
      "set.notifications": "Notifications",
      "set.notificationsHint": "Show a notice when a task is completed",
      "set.emailNotifications": "Email notifications",
      "set.emailHint": "No email is sent in a local app, the preference is stored",
      "set.language": "Language",
      "set.defaultView": "Default task view",
      "set.logout": "Log Out",
      "set.dangerTitle": "Reset data",
      "set.dangerHint": "Deletes every task and category on this account.",
      "set.resetData": "Delete data",
      "set.resetConfirm": "Delete all data?",
      "set.resetBody": "Your tasks and categories will be permanently removed.",

      "common.cancel": "Cancel",
      "common.delete": "Delete",
      "common.edit": "Edit",
      "common.close": "Close",
      "common.optional": "optional",
      "common.confirm": "Confirm",

      "msg.signedIn": "Signed in",
      "msg.signedUp": "Account created",
      "msg.signedOut": "Signed out",
      "msg.taskAdded": "Task added",
      "msg.taskUpdated": "Task updated",
      "msg.taskDeleted": "Task deleted",
      "msg.taskDone": "Task completed",
      "msg.catAdded": "Category added",
      "msg.catUpdated": "Category updated",
      "msg.catDeleted": "Category deleted",
      "msg.profileSaved": "Profile saved",
      "msg.passChanged": "Password updated",
      "msg.dataReset": "Data deleted",
      "msg.settingSaved": "Setting saved",

      "err.required": "This field is required",
      "err.emailInvalid": "Enter a valid email",
      "err.emailTaken": "This email is already registered",
      "err.userTaken": "This username is taken",
      "err.passShort": "Password must be at least 6 characters",
      "err.passMatch": "Passwords do not match",
      "err.credentials": "Wrong email or password",
      "err.userNotFound": "No account with that email",
      "err.currentPass": "Current password is wrong",
      "err.nameShort": "Must be at least 3 characters",
      "err.userShort": "Username must be at least 3 characters",
      "err.catName": "Category name is required",
      "err.catTaken": "A category with this name already exists",
      "err.imageBig": "Image is too large (1 MB max)",
      "err.storageFull": "Browser storage is full"
    }
  };

  let current = "tr";

  function setLang(lang) {
    current = dict[lang] ? lang : "tr";
    document.documentElement.lang = current;
  }

  function getLang() {
    return current;
  }

  /* t("anahtar") — karşılığı yoksa anahtarın kendisini döndürür,
     böylece eksik çeviri ekranda hemen fark edilir. */
  function t(key) {
    return (dict[current] && dict[current][key]) || key;
  }

  function applyTranslations(root = document) {
    root.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    root.querySelectorAll("[data-i18n-ph]").forEach((el) => {
      el.placeholder = t(el.dataset.i18nPh);
    });
    root.querySelectorAll("[data-i18n-title]").forEach((el) => {
      el.title = t(el.dataset.i18nTitle);
    });
  }

  /* Tarihi seçili dile göre okunur biçime çevirir:
     "24 Eylül 2026" / "24 September 2026" */
  function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    const locale = current === "tr" ? "tr-TR" : "en-GB";
    return d.toLocaleDateString(locale, {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  return { setLang, getLang, t, applyTranslations, formatDate };
})();
