/* ============================================================
   app.js — uygulama akışı
   Oturum kontrolü, sayfa geçişleri, render ve tüm olay bağlama
   burada toplanır. Diğer dosyalar veri/araç katmanı; ekranla
   konuşan tek yer bu.
   ============================================================ */

(() => {
  /* ---------- Durum ---------- */

  const state = {
    user: null,
    page: "dashboard",
    filters: {
      search: "",
      status: "all",
      categoryId: "",
      priority: "",
      sort: "created"
    }
  };

  /* Kategori simgeleri icons.js'te, renkler burada.
     Renkler yumuşak tema için doygunluğu düşürülmüş tonlar. */
  const COLORS = [
    "#7c81e8", "#9b8bdd", "#d98cb3", "#e08989", "#e0a458",
    "#5fb99a", "#5fb0b3", "#6fa8d4", "#8a94a6", "#9ab569"
  ];

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ============================================================
     AÇILIŞ
     ============================================================ */

  function init() {
    bindAuthScreen();
    bindAppShell();
    bindTaskModal();
    bindCategoryModal();
    bindProfilePage();
    bindSettings();
    bindGlobalKeys();

    // Denenecek hazır bir hesap bulunsun; zaten varsa dokunulmaz
    Auth.ensureDemoUser();

    const kullanici = Auth.currentUser();
    if (kullanici) {
      enterApp(kullanici);
    } else {
      // Oturum yokken de kayıtlı bir dil tercihi varsa onu kullan
      applyLanguage(Store.read("lastLanguage", "tr"));
      showAuth();
    }

    UI.bindPasswordToggles();
  }

  function showAuth() {
    $("#authScreen").hidden = false;
    $("#app").hidden = true;
    document.documentElement.dataset.theme = Store.read("lastTheme", "light");
    updateThemeButton();
  }

  /* Giriş başarılı: ayarları yükle, ekranı kur, panele geç */
  function enterApp(user) {
    state.user = user;

    Data.migrateCategoryNames(user.id);

    const ayarlar = Data.getSettings(user.id);
    applyLanguage(ayarlar.language);
    applyTheme(ayarlar.theme);
    state.filters.status = ayarlar.defaultView || "all";

    $("#authScreen").hidden = true;
    $("#app").hidden = false;

    // Filtre çipini varsayılan görünüme göre işaretle
    $$("#statusChips .chip").forEach((c) =>
      c.classList.toggle("is-active", c.dataset.status === state.filters.status)
    );
    $("#filterSort").value = state.filters.sort;

    goPage("dashboard");
    renderAll();
  }

  /* ============================================================
     GİRİŞ EKRANI
     ============================================================ */

  function bindAuthScreen() {
    const signinForm = $("#signinForm");
    const signupForm = $("#signupForm");

    function showTab(hangi) {
      const giris = hangi === "signin";
      $("#tabSignin").classList.toggle("is-active", giris);
      $("#tabSignup").classList.toggle("is-active", !giris);
      $("#tabSignin").setAttribute("aria-selected", String(giris));
      $("#tabSignup").setAttribute("aria-selected", String(!giris));
      signinForm.hidden = !giris;
      signupForm.hidden = giris;
      UI.clearErrors(signinForm);
      UI.clearErrors(signupForm);
    }

    $("#tabSignin").addEventListener("click", () => showTab("signin"));
    $("#tabSignup").addEventListener("click", () => showTab("signup"));
    $$("[data-goto]").forEach((b) =>
      b.addEventListener("click", () => showTab(b.dataset.goto))
    );

    /* --- Giriş --- */
    signinForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(signinForm);
      const sonuc = Auth.signIn({
        email: fd.get("email"),
        password: fd.get("password"),
        remember: fd.get("remember") === "on"
      });

      if (!sonuc.ok) return UI.showErrors(signinForm, sonuc.errors);

      UI.clearErrors(signinForm);
      signinForm.reset();
      enterApp(sonuc.user);
      UI.toast(I18N.t("msg.signedIn"));
    });

    /* --- Kayıt --- */
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(signupForm);
      const sonuc = Auth.signUp({
        fullName: fd.get("fullName"),
        username: fd.get("username"),
        email: fd.get("email"),
        password: fd.get("password"),
        passwordAgain: fd.get("passwordAgain")
      });

      if (!sonuc.ok) return UI.showErrors(signupForm, sonuc.errors);

      // Yeni hesapta oturumu kalıcı açıyoruz
      Store.writeSession({ userId: sonuc.user.id, at: new Date().toISOString() }, true);
      UI.clearErrors(signupForm);
      signupForm.reset();
      enterApp(sonuc.user);
      UI.toast(I18N.t("msg.signedUp"));
    });

    /* --- Demo hesabıyla giriş ---
       Alanları doldurup formu normal akışına sokuyoruz; böylece
       giriş yolu tek yerde kalıyor. */
    $("#demoLoginBtn").addEventListener("click", () => {
      const demo = Auth.demoCredentials();
      const el = signinForm.elements;
      el.email.value = demo.email;
      el.password.value = demo.password;
      el.remember.checked = true;
      UI.clearErrors(signinForm);
      signinForm.requestSubmit();
    });

    /* --- Şifremi unuttum --- */
    $("#forgotLink").addEventListener("click", () => UI.openModal("forgotModal"));

    const forgotForm = $("#forgotForm");
    forgotForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(forgotForm);
      const sonuc = Auth.resetPassword({
        email: fd.get("email"),
        password: fd.get("password"),
        passwordAgain: fd.get("passwordAgain")
      });

      if (!sonuc.ok) return UI.showErrors(forgotForm, sonuc.errors);

      UI.clearErrors(forgotForm);
      forgotForm.reset();
      UI.closeModal("forgotModal");
      UI.toast(I18N.t("msg.passChanged"));
    });
  }

  /* ============================================================
     UYGULAMA KABUĞU
     ============================================================ */

  function bindAppShell() {
    $$(".nav__item").forEach((btn) =>
      btn.addEventListener("click", () => {
        goPage(btn.dataset.page);
        closeSidebar();
      })
    );

    $("#menuBtn").addEventListener("click", () => {
      const acik = $("#sidebar").classList.toggle("is-open");
      document.body.classList.toggle("sidebar-open", acik);
    });
    $("#sidebarBackdrop").addEventListener("click", closeSidebar);

    $("#addTaskBtn").addEventListener("click", () => openTaskModal(null));
    $("#addCategoryBtn").addEventListener("click", () => openCategoryModal(null));

    $("#themeBtn").addEventListener("click", () => {
      const yeni = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(yeni);
      if (state.user) Data.saveSettings(state.user.id, { theme: yeni });
      syncSettingsForm();
    });

    $("#logoutBtn").addEventListener("click", logout);
    $("#logoutBtn2").addEventListener("click", logout);

    /* Arama — her tuşta değil, yazma durunca render */
    $("#globalSearch").addEventListener(
      "input",
      Utils.debounce((e) => {
        state.filters.search = e.target.value;
        if (state.page !== "tasks") goPage("tasks");
        renderTasksPage();
      }, 220)
    );

    /* Panel istatistik kartları ilgili filtreye atlar */
    $$("[data-jump]").forEach((btn) =>
      btn.addEventListener("click", () => {
        state.filters.status = btn.dataset.jump;
        state.filters.categoryId = "";
        state.filters.priority = "";
        $$("#statusChips .chip").forEach((c) =>
          c.classList.toggle("is-active", c.dataset.status === btn.dataset.jump)
        );
        $("#filterCategory").value = "";
        $("#filterPriority").value = "";
        goPage("tasks");
      })
    );

    /* Görev sayfası filtreleri */
    $$("#statusChips .chip").forEach((chip) =>
      chip.addEventListener("click", () => {
        $$("#statusChips .chip").forEach((c) => c.classList.remove("is-active"));
        chip.classList.add("is-active");
        state.filters.status = chip.dataset.status;
        renderTasksPage();
      })
    );

    $("#filterCategory").addEventListener("change", (e) => {
      state.filters.categoryId = e.target.value;
      renderTasksPage();
    });
    $("#filterPriority").addEventListener("change", (e) => {
      state.filters.priority = e.target.value;
      renderTasksPage();
    });
    $("#filterSort").addEventListener("change", (e) => {
      state.filters.sort = e.target.value;
      renderTasksPage();
    });

    /* Görev listelerindeki tıklamalar — tek dinleyici, olay delegasyonu.
       Liste her render'da yeniden çiziliyor, tek tek bağlamak anlamsız. */
    ["#taskList", "#todayList", "#recentList"].forEach((sel) => {
      $(sel).addEventListener("click", onTaskListClick);
    });

    $("#categoryGrid").addEventListener("click", onCategoryGridClick);

    /* Boş durum düğmeleri — listelerin içinde render edildikleri
       için burada tek bir üst dinleyiciyle yakalanıyorlar. */
    $(".main").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-empty-action]");
      if (!btn) return;

      const eylem = btn.dataset.emptyAction;
      if (eylem === "add-task") openTaskModal(null);
      else if (eylem === "add-cat") openCategoryModal(null);
      else if (eylem === "clear-filters") clearAllFilters();
    });

    /* Sonuç şeridindeki filtre etiketleri ve temizleme */
    $("#activeFilters").addEventListener("click", (e) => {
      const tag = e.target.closest("[data-drop]");
      if (tag) dropFilter(tag.dataset.drop);
    });

    $("#clearFilters").addEventListener("click", clearAllFilters);
  }

  function closeSidebar() {
    $("#sidebar").classList.remove("is-open");
    document.body.classList.remove("sidebar-open");
  }

  function goPage(page) {
    state.page = page;

    $$(".page").forEach((p) => (p.hidden = p.id !== `page-${page}`));
    $$(".nav__item").forEach((n) =>
      n.classList.toggle("is-active", n.dataset.page === page)
    );

    const basliklar = {
      dashboard: "nav.dashboard",
      tasks: "nav.tasks",
      categories: "nav.categories",
      profile: "nav.profile"
    };
    const baslik = $("#pageTitle");
    baslik.dataset.i18n = basliklar[page];
    baslik.textContent = I18N.t(basliklar[page]);

    if (page === "dashboard") renderDashboard();
    if (page === "tasks") renderTasksPage();
    if (page === "categories") renderCategories();
    if (page === "profile") renderProfile();
  }

  function logout() {
    Auth.signOut();
    state.user = null;
    $("#globalSearch").value = "";
    state.filters = { search: "", status: "all", categoryId: "", priority: "", sort: "created" };
    showAuth();
    UI.toast(I18N.t("msg.signedOut"), "info");
  }

  /* ============================================================
     RENDER
     ============================================================ */

  function renderAll() {
    renderSidebar();
    renderCategorySelects();
    renderDashboard();
    renderTasksPage();
    renderCategories();
    renderProfile();
    syncSettingsForm();
  }

  function renderSidebar() {
    if (!state.user) return;
    const u = state.user;

    $("#miniName").textContent = u.fullName;
    $("#miniMail").textContent = u.email;
    setAvatar($("#miniAvatar"), u);

    const s = Data.stats(u.id);
    const rozet = $("#navPendingCount");
    rozet.textContent = s.pending;
    rozet.hidden = s.pending === 0;
  }

  /* Avatar: fotoğraf varsa arka plan görseli, yoksa baş harfler */
  function setAvatar(el, user) {
    if (user.avatar) {
      el.style.backgroundImage = `url("${user.avatar}")`;
      el.textContent = "";
      el.classList.add("avatar--img");
    } else {
      el.style.backgroundImage = "";
      el.textContent = Utils.initials(user.fullName);
      el.classList.remove("avatar--img");
    }
  }

  function renderDashboard() {
    if (!state.user) return;
    const u = state.user;

    $("#helloName").textContent = u.fullName.split(" ")[0];
    $("#helloDate").textContent = new Date().toLocaleDateString(
      I18N.getLang() === "tr" ? "tr-TR" : "en-GB",
      { weekday: "long", day: "numeric", month: "long", year: "numeric" }
    );

    const s = Data.stats(u.id);
    $("#statToday").textContent = s.today;
    $("#statPending").textContent = s.pending;
    $("#statCompleted").textContent = s.completed;
    $("#statOverdue").textContent = s.overdue;

    renderProgress(s);

    const bugun = Data.filterTasks(u.id, { status: "today", sort: "priority" });
    $("#todayList").innerHTML = bugun.length
      ? bugun.map(taskItemHTML).join("")
      : emptyHTML("dash.noToday", null, { action: "add-task", labelKey: "tasks.add" });

    const son = Data.getTasks(u.id).slice(0, 5);
    $("#recentList").innerHTML = son.length
      ? son.map(taskItemHTML).join("")
      : emptyHTML("tasks.empty", null, { action: "add-task", labelKey: "empty.addTask" });

    renderSidebar();
  }

  /* Tamamlanma çubuğu — sayıların ne anlama geldiğini
     tek bakışta anlatır. */
  function renderProgress(s) {
    const oran = s.total ? Math.round((s.completed / s.total) * 100) : 0;

    $("#progressCount").textContent = `${s.completed} / ${s.total}`;
    $("#progressFill").style.width = oran + "%";

    let not;
    if (!s.total) not = I18N.t("dash.noTasksYet");
    else if (s.completed === s.total) not = I18N.t("dash.allDone");
    else not = `%${oran} — ${I18N.t("dash.keepGoing")}`;
    $("#progressNote").textContent = not;

    $("#progressBox").classList.toggle("is-complete", s.total > 0 && s.completed === s.total);
  }

  function renderTasksPage() {
    if (!state.user) return;

    const liste = Data.filterTasks(state.user.id, state.filters);
    const suzulu = hasActiveFilters();

    // Boş liste iki farklı sebepten olabilir; her birine ayrı çıkış yolu
    let bos;
    if (suzulu) {
      bos = emptyHTML("empty.noMatch", "empty.noMatchHint", {
        action: "clear-filters",
        labelKey: "empty.clearFilters"
      });
    } else {
      bos = emptyHTML("tasks.empty", "tasks.emptyHint", {
        action: "add-task",
        labelKey: "empty.addTask"
      });
    }

    $("#taskList").innerHTML = liste.length ? liste.map(taskItemHTML).join("") : bos;

    renderResultBar(liste.length, suzulu);
    renderSidebar();
  }

  /* Varsayılan dışına çıkılmış bir filtre var mı? */
  function hasActiveFilters() {
    const f = state.filters;
    return Boolean(
      f.search.trim() || (f.status && f.status !== "all") || f.categoryId || f.priority
    );
  }

  /* Sonuç şeridi: kaç görev görünüyor ve neden bu kadarı görünüyor */
  function renderResultBar(adet, suzulu) {
    $("#resultCount").textContent = `${adet} ${I18N.t("res.found")}`;

    const etiketler = [];
    const f = state.filters;

    if (f.status && f.status !== "all") {
      const anahtar = {
        today: "dash.today",
        pending: "dash.pending",
        completed: "dash.completed",
        overdue: "dash.overdue"
      }[f.status];
      if (anahtar) etiketler.push({ tip: "status", metin: I18N.t(anahtar) });
    }

    if (f.categoryId) {
      const k = Data.getCategory(state.user.id, f.categoryId);
      if (k) etiketler.push({ tip: "category", metin: k.name });
    }

    if (f.priority) etiketler.push({ tip: "priority", metin: I18N.t("prio." + f.priority) });

    if (f.search.trim()) {
      etiketler.push({ tip: "search", metin: `${I18N.t("res.search")}: ${f.search.trim()}` });
    }

    $("#activeFilters").innerHTML = etiketler
      .map(
        (e) => `
        <button type="button" class="tag" data-drop="${e.tip}" title="${Utils.escapeHtml(I18N.t("common.close"))}">
          ${Utils.escapeHtml(e.metin)}${Icon.svg("close", "icon tag__x")}
        </button>`
      )
      .join("");

    $("#clearFilters").hidden = !suzulu;
    $("#resultBar").classList.toggle("is-filtered", suzulu);
  }

  /* Tek bir filtreyi sıfırlar. Render çağrısı ayrı tutuldu ki
     hepsini birden temizlerken liste dört kez yeniden çizilmesin. */
  function resetFilter(tip) {
    if (tip === "status") {
      state.filters.status = "all";
      $$("#statusChips .chip").forEach((c) =>
        c.classList.toggle("is-active", c.dataset.status === "all")
      );
    } else if (tip === "category") {
      state.filters.categoryId = "";
      $("#filterCategory").value = "";
    } else if (tip === "priority") {
      state.filters.priority = "";
      $("#filterPriority").value = "";
    } else if (tip === "search") {
      state.filters.search = "";
      $("#globalSearch").value = "";
    }
  }

  function dropFilter(tip) {
    resetFilter(tip);
    renderTasksPage();
  }

  function clearAllFilters() {
    ["status", "category", "priority", "search"].forEach((t) => resetFilter(t));
    renderTasksPage();
  }

  function emptyHTML(baslikAnahtar, altAnahtar, eylem) {
    return `
      <div class="empty">
        <span class="empty__icon">${Icon.svg("inbox")}</span>
        <p>${Utils.escapeHtml(I18N.t(baslikAnahtar))}</p>
        ${altAnahtar ? `<small>${Utils.escapeHtml(I18N.t(altAnahtar))}</small>` : ""}
        ${eylem
          ? `<button type="button" class="btn btn--ghost empty__btn" data-empty-action="${eylem.action}">
               ${Utils.escapeHtml(I18N.t(eylem.labelKey))}
             </button>`
          : ""}
      </div>`;
  }

  /* Tek bir görev satırı */
  function taskItemHTML(task) {
    const kategori = task.categoryId ? Data.getCategory(state.user.id, task.categoryId) : null;
    const gecikti = !task.completed && Utils.isOverdue(task.dueDate);
    const bugunMu = Utils.isToday(task.dueDate);

    let tarihMetni = "";
    if (task.dueDate) {
      if (gecikti) tarihMetni = I18N.t("tasks.overdue");
      else if (bugunMu) tarihMetni = I18N.t("tasks.dueToday");
      else tarihMetni = I18N.formatDate(task.dueDate);
    }

    const kategoriRozeti = kategori
      ? `<span class="badge" style="--c:${Utils.escapeHtml(kategori.color)}">
           ${Icon.svg(kategori.icon, "icon badge__icon")}${Utils.escapeHtml(kategori.name)}
         </span>`
      : "";

    return `
      <article class="task ${task.completed ? "is-done" : ""}" data-id="${task.id}">
        <button class="task__check" data-action="toggle" aria-label="${Utils.escapeHtml(I18N.t("msg.taskDone"))}">
          ${Icon.svg("check", "icon task__checkIcon")}
        </button>

        <div class="task__body">
          <h4 class="task__title">${Utils.escapeHtml(task.title)}</h4>
          ${task.description ? `<p class="task__desc">${Utils.escapeHtml(task.description)}</p>` : ""}
          <div class="task__meta">
            <span class="prio prio--${task.priority}">${Utils.escapeHtml(I18N.t("prio." + task.priority))}</span>
            ${kategoriRozeti}
            ${tarihMetni
              ? `<span class="due ${gecikti ? "is-overdue" : ""} ${bugunMu ? "is-today" : ""}">
                   ${Icon.svg(gecikti ? "alert" : "clock", "icon due__icon")}${Utils.escapeHtml(tarihMetni)}
                 </span>`
              : ""}
          </div>
        </div>

        <div class="task__actions">
          <button class="iconBtn" data-action="edit" title="${Utils.escapeHtml(I18N.t("common.edit"))}">${Icon.svg("edit")}</button>
          <button class="iconBtn iconBtn--danger" data-action="delete" title="${Utils.escapeHtml(I18N.t("common.delete"))}">${Icon.svg("trash")}</button>
        </div>
      </article>`;
  }

  async function onTaskListClick(e) {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;

    const kart = btn.closest(".task");
    if (!kart) return;
    const id = kart.dataset.id;

    if (btn.dataset.action === "toggle") {
      const gorev = Data.toggleTask(state.user.id, id);
      renderDashboard();
      renderTasksPage();

      if (gorev && gorev.completed) {
        UI.toast(I18N.t("msg.taskDone"));
        const ayarlar = Data.getSettings(state.user.id);
        if (ayarlar.notifications) UI.notify(I18N.t("msg.taskDone"), gorev.title);
      }
      return;
    }

    if (btn.dataset.action === "edit") {
      const gorev = Data.getTasks(state.user.id).find((t) => t.id === id);
      if (gorev) openTaskModal(gorev);
      return;
    }

    if (btn.dataset.action === "delete") {
      const onay = await UI.confirm({
        title: I18N.t("tasks.deleteTitle"),
        body: I18N.t("tasks.deleteBody"),
        confirmText: I18N.t("common.delete")
      });
      if (!onay) return;

      Data.deleteTask(state.user.id, id);
      renderDashboard();
      renderTasksPage();
      renderCategories();
      UI.toast(I18N.t("msg.taskDeleted"), "info");
    }
  }

  /* ---------- Kategoriler ---------- */

  function renderCategories() {
    if (!state.user) return;
    const liste = Data.getCategories(state.user.id);

    $("#categoryGrid").innerHTML = liste.length
      ? liste
          .map((c) => {
            const gorevler = Data.getTasks(state.user.id).filter((t) => t.categoryId === c.id);
            const adet = gorevler.length;
            const biten = gorevler.filter((t) => t.completed).length;
            const oran = adet ? Math.round((biten / adet) * 100) : 0;

            return `
              <article class="catCard" data-id="${c.id}" style="--c:${Utils.escapeHtml(c.color)}">
                <div class="catCard__top">
                  <span class="catCard__icon">${Icon.svg(c.icon)}</span>
                  <div class="catCard__actions">
                    <button class="iconBtn" data-action="edit-cat" title="${Utils.escapeHtml(I18N.t("common.edit"))}">${Icon.svg("edit")}</button>
                    <button class="iconBtn iconBtn--danger" data-action="delete-cat" title="${Utils.escapeHtml(I18N.t("common.delete"))}">${Icon.svg("trash")}</button>
                  </div>
                </div>

                <h4>${Utils.escapeHtml(c.name)}</h4>
                <p>${adet} ${Utils.escapeHtml(I18N.t("cat.taskCount"))} · ${biten} ${Utils.escapeHtml(I18N.t("cat.done"))}</p>

                <div class="catCard__bar" role="presentation">
                  <span style="width:${oran}%"></span>
                </div>

                <button type="button" class="catCard__link" data-action="view-cat">
                  ${Utils.escapeHtml(I18N.t("cat.viewTasks"))}
                </button>
              </article>`;
          })
          .join("")
      : emptyHTML("cat.empty", null, { action: "add-cat", labelKey: "empty.addCat" });

    renderCategorySelects();
  }

  /* Kategori listesi hem filtre hem görev formu açılır menüsünü besler */
  function renderCategorySelects() {
    if (!state.user) return;
    const liste = Data.getCategories(state.user.id);

    const filtre = $("#filterCategory");
    const secili = state.filters.categoryId;
    filtre.innerHTML =
      `<option value="">${Utils.escapeHtml(I18N.t("cat.all"))}</option>` +
      liste
        .map((c) => `<option value="${c.id}">${Utils.escapeHtml(c.name)}</option>`)
        .join("");
    filtre.value = secili;

    const form = $("#taskCategorySelect");
    const formSecili = form.value;
    form.innerHTML =
      `<option value="">${Utils.escapeHtml(I18N.t("tasks.noCategory"))}</option>` +
      liste
        .map((c) => `<option value="${c.id}">${Utils.escapeHtml(c.name)}</option>`)
        .join("");
    form.value = formSecili;
  }

  async function onCategoryGridClick(e) {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;

    const kart = btn.closest(".catCard");
    if (!kart) return;
    const id = kart.dataset.id;

    /* Kategoriden görevlerine geçiş: filtreyi kurup Görevler
       sekmesine atlıyoruz, böylece kullanıcı neyi neden
       gördüğünü sonuç şeridinden okuyabiliyor. */
    if (btn.dataset.action === "view-cat") {
      state.filters.categoryId = id;
      state.filters.status = "all";
      state.filters.priority = "";
      $$("#statusChips .chip").forEach((c) =>
        c.classList.toggle("is-active", c.dataset.status === "all")
      );
      $("#filterPriority").value = "";
      renderCategorySelects();
      $("#filterCategory").value = id;
      goPage("tasks");
      return;
    }

    if (btn.dataset.action === "edit-cat") {
      const kategori = Data.getCategory(state.user.id, id);
      if (kategori) openCategoryModal(kategori);
      return;
    }

    if (btn.dataset.action === "delete-cat") {
      const onay = await UI.confirm({
        title: I18N.t("cat.deleteTitle"),
        body: I18N.t("cat.deleteBody"),
        confirmText: I18N.t("common.delete")
      });
      if (!onay) return;

      Data.deleteCategory(state.user.id, id);
      renderCategories();
      renderTasksPage();
      renderDashboard();
      UI.toast(I18N.t("msg.catDeleted"), "info");
    }
  }

  /* ============================================================
     GÖREV MODALI
     ============================================================ */

  function openTaskModal(task) {
    const form = $("#taskForm");
    UI.clearErrors(form);
    form.reset();
    renderCategorySelects();

    /* form.elements üzerinden gidiyoruz: form.id ve form.title
       doğrudan yazıldığında alanlara değil, formun kendi id/title
       özelliklerine denk gelir ve değer sessizce kaybolur. */
    const el = form.elements;

    if (task) {
      $("#taskModalTitle").textContent = I18N.t("tasks.editTitle");
      $("#taskSubmit").textContent = I18N.t("tasks.save");
      el.id.value = task.id;
      el.title.value = task.title;
      el.description.value = task.description || "";
      el.categoryId.value = task.categoryId || "";
      el.priority.value = task.priority;
      el.dueDate.value = task.dueDate || "";
    } else {
      $("#taskModalTitle").textContent = I18N.t("tasks.newTitle");
      $("#taskSubmit").textContent = I18N.t("tasks.create");
      el.id.value = "";
      el.priority.value = "medium";
      el.dueDate.value = Utils.todayISO();
    }

    UI.openModal("taskModal");
  }

  function bindTaskModal() {
    const form = $("#taskForm");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const id = fd.get("id");

      const veri = {
        title: fd.get("title"),
        description: fd.get("description"),
        categoryId: fd.get("categoryId") || null,
        priority: fd.get("priority"),
        dueDate: fd.get("dueDate") || null
      };

      const sonuc = id
        ? Data.updateTask(state.user.id, id, veri)
        : Data.addTask(state.user.id, veri);

      if (!sonuc.ok) return UI.showErrors(form, sonuc.errors);

      UI.closeModal("taskModal");
      renderDashboard();
      renderTasksPage();
      renderCategories();
      UI.toast(I18N.t(id ? "msg.taskUpdated" : "msg.taskAdded"));
    });
  }

  /* ============================================================
     KATEGORİ MODALI
     ============================================================ */

  function buildPickers() {
    const iconKap = $("#iconPicker");
    if (!iconKap.dataset.built) {
      iconKap.innerHTML = Icon.CATEGORY.map(
        (ad) => `<button type="button" class="iconOpt" data-icon="${ad}">${Icon.svg(ad)}</button>`
      ).join("");
      iconKap.dataset.built = "1";

      iconKap.addEventListener("click", (e) => {
        const btn = e.target.closest(".iconOpt");
        if (!btn) return;
        $$(".iconOpt", iconKap).forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        $("#categoryForm").elements.icon.value = btn.dataset.icon;
      });
    }

    const renkKap = $("#colorPicker");
    if (!renkKap.dataset.built) {
      renkKap.innerHTML = COLORS.map(
        (c) => `<button type="button" class="colorOpt" data-color="${c}" style="--c:${c}"></button>`
      ).join("");
      renkKap.dataset.built = "1";

      renkKap.addEventListener("click", (e) => {
        const btn = e.target.closest(".colorOpt");
        if (!btn) return;
        $$(".colorOpt", renkKap).forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        $("#categoryForm").elements.color.value = btn.dataset.color;
      });
    }
  }

  function openCategoryModal(category) {
    buildPickers();

    const form = $("#categoryForm");
    UI.clearErrors(form);
    form.reset();

    const icon = category ? category.icon : Icon.CATEGORY[0];
    const color = category ? category.color : COLORS[0];

    const el = form.elements;
    el.id.value = category ? category.id : "";
    el.name.value = category ? category.name : "";
    el.icon.value = icon;
    el.color.value = color;

    $$(".iconOpt").forEach((b) => b.classList.toggle("is-active", b.dataset.icon === icon));
    $$(".colorOpt").forEach((b) => b.classList.toggle("is-active", b.dataset.color === color));

    $("#categoryModalTitle").textContent = I18N.t(category ? "cat.editTitle" : "cat.new");
    $("#categorySubmit").textContent = I18N.t(category ? "cat.save" : "cat.create");

    UI.openModal("categoryModal");
  }

  function bindCategoryModal() {
    const form = $("#categoryForm");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const id = fd.get("id");

      const veri = {
        name: fd.get("name"),
        icon: fd.get("icon"),
        color: fd.get("color")
      };

      const sonuc = id
        ? Data.updateCategory(state.user.id, id, veri)
        : Data.addCategory(state.user.id, veri);

      if (!sonuc.ok) return UI.showErrors(form, sonuc.errors);

      UI.closeModal("categoryModal");
      renderCategories();
      renderTasksPage();
      UI.toast(I18N.t(id ? "msg.catUpdated" : "msg.catAdded"));
    });
  }

  /* ============================================================
     PROFİL
     ============================================================ */

  function renderProfile() {
    if (!state.user) return;
    const u = state.user;

    const el = $("#profileForm").elements;
    el.fullName.value = u.fullName;
    el.username.value = u.username;
    el.email.value = u.email;
    setAvatar($("#profileAvatar"), u);
  }

  function bindProfilePage() {
    const form = $("#profileForm");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const sonuc = Auth.updateProfile(state.user.id, {
        fullName: fd.get("fullName"),
        username: fd.get("username"),
        email: fd.get("email")
      });

      if (!sonuc.ok) return UI.showErrors(form, sonuc.errors);

      state.user = sonuc.user;
      UI.clearErrors(form);
      renderSidebar();
      renderDashboard();
      UI.toast(I18N.t("msg.profileSaved"));
    });

    /* --- Fotoğraf yükleme ---
       Dosya base64 olarak localStorage'a gider. Depolama sınırı
       ~5 MB olduğu için 1 MB üstünü kabul etmiyoruz. */
    $("#avatarInput").addEventListener("change", (e) => {
      const dosya = e.target.files && e.target.files[0];
      if (!dosya) return;

      if (dosya.size > 1024 * 1024) {
        UI.toast(I18N.t("err.imageBig"), "error");
        e.target.value = "";
        return;
      }

      const okuyucu = new FileReader();
      okuyucu.onload = () => {
        const sonuc = Auth.updateProfile(state.user.id, {
          fullName: state.user.fullName,
          username: state.user.username,
          email: state.user.email,
          avatar: okuyucu.result
        });

        if (!sonuc.ok) {
          UI.toast(I18N.t("err.storageFull"), "error");
          return;
        }

        state.user = sonuc.user;
        setAvatar($("#profileAvatar"), state.user);
        renderSidebar();
        UI.toast(I18N.t("msg.profileSaved"));
      };
      okuyucu.onerror = () => UI.toast(I18N.t("err.imageBig"), "error");
      okuyucu.readAsDataURL(dosya);
      e.target.value = "";
    });

    $("#removeAvatarBtn").addEventListener("click", () => {
      const sonuc = Auth.updateProfile(state.user.id, {
        fullName: state.user.fullName,
        username: state.user.username,
        email: state.user.email,
        avatar: null
      });
      if (!sonuc.ok) return;

      state.user = sonuc.user;
      setAvatar($("#profileAvatar"), state.user);
      renderSidebar();
      UI.toast(I18N.t("msg.profileSaved"));
    });

    /* --- Şifre değiştirme --- */
    const passForm = $("#passwordForm");
    passForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(passForm);
      const sonuc = Auth.changePassword(state.user.id, {
        current: fd.get("current"),
        next: fd.get("next"),
        nextAgain: fd.get("nextAgain")
      });

      if (!sonuc.ok) return UI.showErrors(passForm, sonuc.errors);

      UI.clearErrors(passForm);
      passForm.reset();
      UI.toast(I18N.t("msg.passChanged"));
    });
  }

  /* ============================================================
     AYARLAR
     ============================================================ */

  function bindSettings() {
    $$("#themeSeg button").forEach((btn) =>
      btn.addEventListener("click", () => {
        applyTheme(btn.dataset.themeVal);
        Data.saveSettings(state.user.id, { theme: btn.dataset.themeVal });
        syncSettingsForm();
        UI.toast(I18N.t("msg.settingSaved"));
      })
    );

    $("#setNotifications").addEventListener("change", (e) => {
      Data.saveSettings(state.user.id, { notifications: e.target.checked });
      // İzin isteme anını kullanıcının açık eylemine bağlıyoruz
      if (e.target.checked) UI.notify(I18N.t("app.name"), I18N.t("msg.settingSaved"));
      UI.toast(I18N.t("msg.settingSaved"));
    });

    $("#setEmailNotifications").addEventListener("change", (e) => {
      Data.saveSettings(state.user.id, { emailNotifications: e.target.checked });
      UI.toast(I18N.t("msg.settingSaved"));
    });

    $("#setLanguage").addEventListener("change", (e) => {
      applyLanguage(e.target.value);
      Data.saveSettings(state.user.id, { language: e.target.value });
      renderAll();
      goPage(state.page);
      UI.toast(I18N.t("msg.settingSaved"));
    });

    $("#setDefaultView").addEventListener("change", (e) => {
      Data.saveSettings(state.user.id, { defaultView: e.target.value });
      UI.toast(I18N.t("msg.settingSaved"));
    });

    $("#resetDataBtn").addEventListener("click", async () => {
      const onay = await UI.confirm({
        title: I18N.t("set.resetConfirm"),
        body: I18N.t("set.resetBody"),
        confirmText: I18N.t("common.delete")
      });
      if (!onay) return;

      Data.resetData(state.user.id);
      renderAll();
      UI.toast(I18N.t("msg.dataReset"), "info");
    });
  }

  function syncSettingsForm() {
    if (!state.user) return;
    const s = Data.getSettings(state.user.id);

    $("#setNotifications").checked = s.notifications;
    $("#setEmailNotifications").checked = s.emailNotifications;
    $("#setLanguage").value = s.language;
    $("#setDefaultView").value = s.defaultView;

    const tema = document.documentElement.dataset.theme;
    $$("#themeSeg button").forEach((b) =>
      b.classList.toggle("is-active", b.dataset.themeVal === tema)
    );
  }

  function applyTheme(tema) {
    document.documentElement.dataset.theme = tema;
    Store.write("lastTheme", tema);
    updateThemeButton();
  }

  function updateThemeButton() {
    const koyu = document.documentElement.dataset.theme === "dark";
    $("#themeBtn").innerHTML = Icon.svg(koyu ? "sun" : "moon");
  }

  function applyLanguage(dil) {
    I18N.setLang(dil);
    Store.write("lastLanguage", dil);
    I18N.applyTranslations();
    UI.bindPasswordToggles();
  }

  /* ============================================================
     KLAVYE
     ============================================================ */

  function bindGlobalKeys() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") UI.closeAllModals();

      // Ctrl/Cmd + K: aramaya odaklan
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        if ($("#app").hidden) return;
        e.preventDefault();
        $("#globalSearch").focus();
      }

      // "n": yeni görev (bir alana yazarken değil)
      if (e.key.toLowerCase() === "n" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const yaziyor = /input|textarea|select/i.test(e.target.tagName);
        if (yaziyor || $("#app").hidden) return;
        if (document.querySelector(".modal.is-open")) return;
        e.preventDefault();
        openTaskModal(null);
      }
    });

    // Modallardaki kapat düğmeleri ve arka plan
    $$("[data-close]").forEach((el) =>
      el.addEventListener("click", () => {
        const modal = el.closest(".modal");
        if (modal) UI.closeModal(modal.id);
      })
    );
  }

  document.addEventListener("DOMContentLoaded", init);
})();
