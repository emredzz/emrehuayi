/* ============================================================
   data.js — görevler, kategoriler ve ayarlar
   Her şey kullanıcı kimliğine göre ayrılır:
     minitodo:u:<id>:tasks
     minitodo:u:<id>:categories
     minitodo:u:<id>:settings
   Böylece aynı tarayıcıda birden fazla hesap birbirine karışmaz.
   ============================================================ */

const Data = (() => {
  const PRIORITIES = ["low", "medium", "high"];

  const DEFAULT_SETTINGS = {
    theme: "light",
    notifications: true,
    emailNotifications: false,
    language: "tr",
    defaultView: "all" // all | today | pending | completed
  };

  /* Yeni hesap açıldığında hazır gelen kategoriler */
  const DEFAULT_CATEGORIES = [
    { name: "Work", icon: "💼", color: "#6366f1" },
    { name: "Personal", icon: "🏠", color: "#ec4899" },
    { name: "Learning", icon: "📚", color: "#f59e0b" },
    { name: "Shopping", icon: "🛒", color: "#10b981" }
  ];

  const key = (userId, ad) => `u:${userId}:${ad}`;

  /* ---------- Kategoriler ---------- */

  function getCategories(userId) {
    const liste = Store.read(key(userId, "categories"), []);
    return Array.isArray(liste) ? liste : [];
  }

  function saveCategories(userId, liste) {
    return Store.write(key(userId, "categories"), liste);
  }

  function addCategory(userId, { name, icon, color }) {
    const temiz = String(name || "").trim();
    if (!temiz) return { ok: false, errors: { name: "err.catName" } };

    const mevcut = getCategories(userId);
    if (mevcut.some((c) => c.name.toLowerCase() === temiz.toLowerCase())) {
      return { ok: false, errors: { name: "err.catTaken" } };
    }

    const kategori = {
      id: Utils.uid(),
      name: temiz,
      icon: icon || "📁",
      color: color || "#6366f1",
      createdAt: new Date().toISOString()
    };
    mevcut.push(kategori);
    if (!saveCategories(userId, mevcut)) {
      return { ok: false, errors: { name: "err.storageFull" } };
    }
    return { ok: true, category: kategori };
  }

  function updateCategory(userId, id, { name, icon, color }) {
    const temiz = String(name || "").trim();
    if (!temiz) return { ok: false, errors: { name: "err.catName" } };

    const liste = getCategories(userId);
    if (liste.some((c) => c.id !== id && c.name.toLowerCase() === temiz.toLowerCase())) {
      return { ok: false, errors: { name: "err.catTaken" } };
    }

    const idx = liste.findIndex((c) => c.id === id);
    if (idx === -1) return { ok: false, errors: { name: "err.catName" } };

    liste[idx] = { ...liste[idx], name: temiz, icon: icon || "📁", color: color || "#6366f1" };
    saveCategories(userId, liste);
    return { ok: true, category: liste[idx] };
  }

  /* Kategori silinince görevler silinmez, kategorisiz kalır. */
  function deleteCategory(userId, id) {
    saveCategories(userId, getCategories(userId).filter((c) => c.id !== id));

    const gorevler = getTasks(userId).map((t) =>
      t.categoryId === id ? { ...t, categoryId: null } : t
    );
    saveTasks(userId, gorevler);
  }

  function getCategory(userId, id) {
    return getCategories(userId).find((c) => c.id === id) || null;
  }

  /* ---------- Görevler ---------- */

  function getTasks(userId) {
    const liste = Store.read(key(userId, "tasks"), []);
    return Array.isArray(liste) ? liste : [];
  }

  function saveTasks(userId, liste) {
    return Store.write(key(userId, "tasks"), liste);
  }

  function addTask(userId, { title, description, categoryId, priority, dueDate }) {
    const temiz = String(title || "").trim();
    if (!temiz) return { ok: false, errors: { title: "err.required" } };

    const gorev = {
      id: Utils.uid(),
      title: temiz,
      description: String(description || "").trim(),
      categoryId: categoryId || null,
      priority: PRIORITIES.includes(priority) ? priority : "medium",
      dueDate: dueDate || null,
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString()
    };

    const liste = getTasks(userId);
    liste.unshift(gorev);
    if (!saveTasks(userId, liste)) {
      return { ok: false, errors: { title: "err.storageFull" } };
    }
    return { ok: true, task: gorev };
  }

  function updateTask(userId, id, patch) {
    if (patch.title !== undefined && !String(patch.title).trim()) {
      return { ok: false, errors: { title: "err.required" } };
    }

    const liste = getTasks(userId);
    const idx = liste.findIndex((t) => t.id === id);
    if (idx === -1) return { ok: false, errors: { title: "err.required" } };

    const guncel = { ...liste[idx], ...patch };
    if (patch.title !== undefined) guncel.title = String(patch.title).trim();
    if (patch.description !== undefined) guncel.description = String(patch.description).trim();
    if (patch.priority !== undefined && !PRIORITIES.includes(patch.priority)) {
      guncel.priority = "medium";
    }

    liste[idx] = guncel;
    saveTasks(userId, liste);
    return { ok: true, task: guncel };
  }

  function deleteTask(userId, id) {
    saveTasks(userId, getTasks(userId).filter((t) => t.id !== id));
  }

  function toggleTask(userId, id) {
    const liste = getTasks(userId);
    const idx = liste.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    const tamamlandi = !liste[idx].completed;
    liste[idx].completed = tamamlandi;
    liste[idx].completedAt = tamamlandi ? new Date().toISOString() : null;
    saveTasks(userId, liste);
    return liste[idx];
  }

  /* ---------- Arama / filtre / sıralama ---------- */

  function filterTasks(userId, { search, status, categoryId, priority, sort } = {}) {
    let liste = getTasks(userId);

    const q = String(search || "").trim().toLowerCase();
    if (q) {
      liste = liste.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }

    if (status === "today") liste = liste.filter((t) => Utils.isToday(t.dueDate) && !t.completed);
    else if (status === "pending") liste = liste.filter((t) => !t.completed);
    else if (status === "completed") liste = liste.filter((t) => t.completed);
    else if (status === "overdue") {
      liste = liste.filter((t) => !t.completed && Utils.isOverdue(t.dueDate));
    }

    if (categoryId) liste = liste.filter((t) => t.categoryId === categoryId);
    if (priority) liste = liste.filter((t) => t.priority === priority);

    const oncelikSirasi = { high: 0, medium: 1, low: 2 };
    if (sort === "priority") {
      liste = [...liste].sort(
        (a, b) => oncelikSirasi[a.priority] - oncelikSirasi[b.priority]
      );
    } else if (sort === "due") {
      // Son tarihi olmayanlar en sona
      liste = [...liste].sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
    } else if (sort === "title") {
      liste = [...liste].sort((a, b) => a.title.localeCompare(b.title));
    }

    return liste;
  }

  function stats(userId) {
    const liste = getTasks(userId);
    return {
      total: liste.length,
      completed: liste.filter((t) => t.completed).length,
      pending: liste.filter((t) => !t.completed).length,
      today: liste.filter((t) => Utils.isToday(t.dueDate) && !t.completed).length,
      overdue: liste.filter((t) => !t.completed && Utils.isOverdue(t.dueDate)).length
    };
  }

  function countByCategory(userId, categoryId) {
    return getTasks(userId).filter((t) => t.categoryId === categoryId).length;
  }

  /* ---------- Ayarlar ---------- */

  function getSettings(userId) {
    return { ...DEFAULT_SETTINGS, ...Store.read(key(userId, "settings"), {}) };
  }

  function saveSettings(userId, patch) {
    const yeni = { ...getSettings(userId), ...patch };
    Store.write(key(userId, "settings"), yeni);
    return yeni;
  }

  /* ---------- Kurulum / sıfırlama ---------- */

  function seedDefaults(userId) {
    const kategoriler = DEFAULT_CATEGORIES.map((c) => ({
      id: Utils.uid(),
      name: c.name,
      icon: c.icon,
      color: c.color,
      createdAt: new Date().toISOString()
    }));
    saveCategories(userId, kategoriler);
    saveTasks(userId, []);
    Store.write(key(userId, "settings"), { ...DEFAULT_SETTINGS });
  }

  function resetData(userId) {
    saveTasks(userId, []);
    seedDefaults(userId);
  }

  /* Demo hesabı için örnek görevler.
     Tarihler bugüne göre kaydırılır, böylece demo ne zaman
     açılırsa açılsın "bugün" ve "gecikmiş" görevler dolu görünür. */
  function seedDemoTasks(userId) {
    const kategoriler = getCategories(userId);
    const bul = (ad) => {
      const k = kategoriler.find((c) => c.name === ad);
      return k ? k.id : null;
    };

    const gunEkle = (fark) => {
      const d = new Date();
      d.setDate(d.getDate() + fark);
      const ay = String(d.getMonth() + 1).padStart(2, "0");
      const gun = String(d.getDate()).padStart(2, "0");
      return `${d.getFullYear()}-${ay}-${gun}`;
    };

    const taslak = [
      { title: "Haftalık raporu tamamla", description: "Pazartesi toplantısından önce gönderilecek.",
        cat: "Work", priority: "high", gun: 0 },
      { title: "Market alışverişi", description: "Kahve, süt, meyve.",
        cat: "Shopping", priority: "low", gun: 0 },
      { title: "Sunum taslağını hazırla", description: "",
        cat: "Work", priority: "high", gun: -2 },
      { title: "Toplantı notlarını takımla paylaş", description: "",
        cat: "Work", priority: "medium", gun: 2 },
      { title: "JavaScript modüllerini çalış", description: "import/export ve kapsam konuları.",
        cat: "Learning", priority: "medium", gun: 5 },
      { title: "Spor salonuna git", description: "",
        cat: "Personal", priority: "low", gun: 1 },
      { title: "Elektrik faturasını öde", description: "",
        cat: "Personal", priority: "medium", gun: -1, bitti: true },
      { title: "Kitabın ikinci bölümünü bitir", description: "",
        cat: "Learning", priority: "low", gun: -3, bitti: true }
    ];

    const simdi = new Date().toISOString();
    const gorevler = taslak.map((t, i) => ({
      id: Utils.uid() + i,
      title: t.title,
      description: t.description,
      categoryId: bul(t.cat),
      priority: t.priority,
      dueDate: gunEkle(t.gun),
      completed: Boolean(t.bitti),
      completedAt: t.bitti ? simdi : null,
      createdAt: simdi
    }));

    saveTasks(userId, gorevler);
  }

  return {
    PRIORITIES,
    getCategories,
    getCategory,
    addCategory,
    updateCategory,
    deleteCategory,
    getTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    filterTasks,
    stats,
    countByCategory,
    getSettings,
    saveSettings,
    seedDefaults,
    seedDemoTasks,
    resetData
  };
})();
