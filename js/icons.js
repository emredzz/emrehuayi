/* ============================================================
   icons.js — simge yardımcısı
   Simgelerin kendisi index.html içindeki gizli SVG sprite'ında
   tanımlı. Buradaki iş, onları <use> ile çağıran küçük bir
   HTML parçası üretmek ve eski emoji değerlerini yeni simge
   adlarına çevirmek.
   ============================================================ */

const Icon = (() => {
  /* Kategori oluştururken seçilebilen simgeler */
  const CATEGORY = [
    "folder", "briefcase", "home", "book",
    "cart", "bulb", "target", "activity",
    "coffee", "plane", "wallet", "music",
    "palette", "heart", "leaf", "graduation",
    "star", "flag"
  ];

  /* Emoji döneminden kalan kayıtlar için karşılık tablosu.
     Tarayıcıda zaten veri oluşturmuş kullanıcıların
     kategorileri simgesiz kalmasın diye. */
  const ESKI_EMOJI = {
    "📁": "folder", "💼": "briefcase", "🏠": "home", "📚": "book",
    "🛒": "cart", "💡": "bulb", "🎯": "target", "🏃": "activity",
    "🍳": "coffee", "✈️": "plane", "✈": "plane", "💰": "wallet",
    "🎵": "music", "🎨": "palette", "🔧": "target", "❤️": "heart",
    "❤": "heart", "🌱": "leaf", "📞": "folder", "🎓": "graduation",
    "🐾": "heart", "⭐": "star"
  };

  /* Bilinmeyen bir değer gelirse klasör simgesine düşer,
     böylece hiçbir kategori boş görünmez. */
  function normalize(deger) {
    if (CATEGORY.includes(deger)) return deger;
    const karsilik = ESKI_EMOJI[deger];
    return CATEGORY.includes(karsilik) ? karsilik : "folder";
  }

  function svg(ad, sinif = "icon") {
    return `<svg class="${sinif}" aria-hidden="true" focusable="false"><use href="#i-${ad}"></use></svg>`;
  }

  return { CATEGORY, normalize, svg };
})();
