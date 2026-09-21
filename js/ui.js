/* ============================================================
   ui.js — bildirimler, modal yönetimi, onay kutusu,
   form hata gösterimi
   ============================================================ */

const UI = (() => {
  /* ---------- Toast bildirimleri ---------- */

  function toast(mesaj, tur = "success") {
    const kap = document.getElementById("toasts");
    if (!kap) return;

    const el = document.createElement("div");
    el.className = `toast toast--${tur}`;
    el.setAttribute("role", "status");

    const simge = { success: "check", error: "alert", info: "info" }[tur] || "info";
    el.innerHTML =
      `<span class="toast__icon">${Icon.svg(simge)}</span>` +
      `<span class="toast__text">${Utils.escapeHtml(mesaj)}</span>`;
    kap.appendChild(el);

    // Çıkış animasyonu bitince DOM'dan düşür
    setTimeout(() => {
      el.classList.add("toast--out");
      setTimeout(() => el.remove(), 300);
    }, 2600);
  }

  /* ---------- Modal ---------- */

  let acikModal = null;
  let odakKaynagi = null;

  function openModal(id) {
    const el = document.getElementById(id);
    if (!el) return;

    odakKaynagi = document.activeElement;
    el.classList.add("is-open");
    el.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    acikModal = el;

    // İlk alana odaklan — klavyeyle kullananlar için
    const ilk = el.querySelector("input, textarea, select, button");
    if (ilk) setTimeout(() => ilk.focus(), 50);
  }

  function closeModal(id) {
    const el = id ? document.getElementById(id) : acikModal;
    if (!el) return;

    el.classList.remove("is-open");
    el.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (acikModal === el) acikModal = null;

    if (odakKaynagi && typeof odakKaynagi.focus === "function") {
      odakKaynagi.focus();
      odakKaynagi = null;
    }
  }

  function closeAllModals() {
    // Onay kutusu açıkken Escape'e basıldıysa bekleyen promise'i
    // "vazgeçildi" diye kapat, yoksa çağıran sonsuza kadar bekler.
    bitirOnay(false);

    document.querySelectorAll(".modal.is-open").forEach((m) => {
      m.classList.remove("is-open");
      m.setAttribute("aria-hidden", "true");
    });
    document.body.classList.remove("modal-open");
    acikModal = null;
  }

  /* ---------- Onay kutusu ----------
     Promise döndürür: true = onaylandı, false = vazgeçildi.
     Dinleyiciler bir kez bağlanır; her çağrıda sadece bekleyen
     çözücü (resolver) değişir. Böylece art arda açılışlarda
     dinleyici birikmez. */

  let onayCozucu = null;

  function bitirOnay(sonuc) {
    if (!onayCozucu) return;
    const coz = onayCozucu;
    onayCozucu = null;
    closeModal("confirmModal");
    coz(sonuc);
  }

  function initConfirm() {
    const modal = document.getElementById("confirmModal");
    if (!modal || modal.dataset.bound === "1") return;
    modal.dataset.bound = "1";

    document.getElementById("confirmOk").addEventListener("click", () => bitirOnay(true));
    document.getElementById("confirmCancel").addEventListener("click", () => bitirOnay(false));
    modal.querySelectorAll("[data-close]").forEach((b) =>
      b.addEventListener("click", () => bitirOnay(false))
    );
  }

  function confirm({ title, body, confirmText, danger = true }) {
    initConfirm();

    // Önceki çağrı bir şekilde açık kaldıysa onu kapat
    bitirOnay(false);

    return new Promise((resolve) => {
      onayCozucu = resolve;

      document.getElementById("confirmTitle").textContent = title || "";
      document.getElementById("confirmBody").textContent = body || "";

      const onayBtn = document.getElementById("confirmOk");
      onayBtn.textContent = confirmText || I18N.t("common.confirm");
      onayBtn.className = danger ? "btn btn--danger" : "btn btn--primary";

      openModal("confirmModal");
    });
  }

  /* ---------- Form hataları ----------
     errors: { alanAdi: "err.anahtari" }
     HTML'de her alanın yanında <small class="field__error"
     data-error-for="alanAdi"></small> bulunur. */

  function showErrors(form, errors) {
    clearErrors(form);
    Object.entries(errors || {}).forEach(([alan, anahtar]) => {
      const kutu = form.querySelector(`[data-error-for="${alan}"]`);
      const girdi = form.querySelector(`[name="${alan}"]`);
      if (kutu) kutu.textContent = I18N.t(anahtar);
      if (girdi) {
        girdi.classList.add("is-invalid");
        girdi.setAttribute("aria-invalid", "true");
      }
    });

    const ilkHatali = form.querySelector(".is-invalid");
    if (ilkHatali) ilkHatali.focus();
  }

  function clearErrors(form) {
    form.querySelectorAll(".field__error").forEach((e) => (e.textContent = ""));
    form.querySelectorAll(".is-invalid").forEach((e) => {
      e.classList.remove("is-invalid");
      e.removeAttribute("aria-invalid");
    });
  }

  /* ---------- Şifre göster/gizle ----------
     Sayfadaki tüm .pass-toggle düğmelerini tek seferde bağlar. */

  function bindPasswordToggles(root = document) {
    root.querySelectorAll(".pass-toggle").forEach((btn) => {
      // Açık ve kapalı göz simgesi bir kez basılır, görünürlüğü
      // CSS'teki .is-visible sınıfı belirler.
      if (!btn.querySelector("svg")) {
        btn.innerHTML =
          Icon.svg("eye", "icon pass-toggle__on") +
          Icon.svg("eye-off", "icon pass-toggle__off");
      }

      if (btn.dataset.bound === "1") return;
      btn.dataset.bound = "1";

      btn.addEventListener("click", () => {
        const girdi = btn.parentElement.querySelector("input");
        if (!girdi) return;

        const gizli = girdi.type === "password";
        girdi.type = gizli ? "text" : "password";
        btn.classList.toggle("is-visible", gizli);
        btn.title = I18N.t(gizli ? "auth.hidePass" : "auth.showPass");
        btn.setAttribute("aria-label", btn.title);
        girdi.focus();
      });
    });
  }

  /* ---------- Tarayıcı bildirimi ----------
     Ayarlardaki "Bildirimler" açıksa görev tamamlandığında
     sistem bildirimi dener, izin yoksa sessizce toast'a düşer. */

  function notify(baslik, govde) {
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
      try {
        new Notification(baslik, { body: govde });
      } catch (err) {
        console.warn("Bildirim gösterilemedi:", err);
      }
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().catch(() => {});
    }
  }

  return {
    toast,
    openModal,
    closeModal,
    closeAllModals,
    confirm,
    showErrors,
    clearErrors,
    bindPasswordToggles,
    notify
  };
})();
