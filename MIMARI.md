# Mimari

Projede derleme aracı yok. Kod `import`/`export` kullanmaz, çünkü `type="module"` ile açılan dosyalar `file://` protokolünde CORS engeline takılır — `index.html`'e çift tıklayınca çalışmazdı.

Bunun yerine sıradan `<script>` etiketleri var ve **sıra önemlidir**:

```
storage → utils → icons → i18n → data → auth → ui → app
```

Her dosya kendinden öncekine dayanır.

## Dosyalar

| Dosya | Sorumluluk |
|---|---|
| `storage.js` | localStorage/sessionStorage'a tek giriş kapısı |
| `utils.js` | Kimlik üretme, HTML kaçışı, tarih, şifre karması |
| `icons.js` | Simge adını SVG'ye çevirir, eski emoji kayıtlarını eşler |
| `i18n.js` | TR/EN sözlük |
| `data.js` | Görev, kategori, ayar işlemleri |
| `auth.js` | Kayıt, giriş, oturum, şifre |
| `ui.js` | Bildirim, modal, onay kutusu, form hataları |
| `app.js` | Sayfa geçişleri, render, olay bağlama |

Her dosya bir IIFE'dir:

```js
const Data = (() => {
  const PRIORITIES = [...];        // dışarıdan görünmez
  return { getTasks, addTask };    // sadece bunlar görünür
})();
```

`import` olmadan kapsam yaratmanın yolu budur; sekiz dosya birbirinin değişkenini ezmez.

## Veri düzeni

```
minitodo:users              Kayıtlı kullanıcılar
minitodo:session            Açık oturum
minitodo:u:<id>:tasks       Kullanıcının görevleri
minitodo:u:<id>:categories  Kullanıcının kategorileri
minitodo:u:<id>:settings    Kullanıcının ayarları
```

Veri kullanıcı kimliğine göre ayrıldığı için aynı tarayıcıda iki hesap birbirini görmez.

## Kritik kararlar

**Depolamaya tek kapı.** JSON dönüşümü ve `try/catch` yalnızca `storage.js`'te. localStorage sadece string saklar ve gizli sekmede hata fırlatır; bunu her çağrı yerinde tekrarlamak yerine tek yerde hallediyoruz.

**Beni hatırla = depo seçimi.** İşaretliyse oturum `localStorage`'a, değilse `sessionStorage`'a yazılır. İkincisi sekme kapanınca kendiliğinden silinir — ek mantık gerekmez.

**HTML kaçışı zorunlu.** Listeler `innerHTML` ile çizildiği için ekrana giden her kullanıcı metni `Utils.escapeHtml()` üzerinden geçer. Aksi halde görev başlığına yazılan `<img onerror=...>` çalışır.

**Olay delegasyonu.** Listeler her render'da baştan çizilir, bu yüzden dinleyici tek tek öğelere değil kapsayıcıya bağlanır; tıklanan öğe `e.target.closest("[data-action]")` ile bulunur.

**`form.elements` kullanılır.** `form.id` ve `form.title`, `HTMLFormElement`'in kendi özellikleridir; input'a değil onlara denk gelir ve değer sessizce kaybolur.

**Yerel tarih elle kurulur.** `toISOString()` UTC'ye kaydırdığı için akşam saatlerinde yanlış gün verir; `Utils.todayISO()` yıl/ay/gün'ü yerel saatten birleştirir.

**Simgeler `currentColor` ile boyanır.** Tek SVG sprite, `<use>` ile çağrılır. Simge bulunduğu yerin rengini alır, koyu tema için ayrı set gerekmez.

**Tema CSS değişkeniyle.** Bileşen kuralları hep `var(--bg)` yazar; `<html data-theme="dark">` değişince tüm palet değişir.

## Test

`storage.js`, `utils.js`, `icons.js`, `data.js` ve `auth.js` DOM'a hiç dokunmaz. Bu yüzden Node'da sahte bir `localStorage` verilerek doğrudan çalıştırılabilirler — 82 test bu ayrım sayesinde mümkün.

Arayüz katmanı (`ui.js`, `app.js`) tarayıcı gerektirir ve otomatik test edilmez.
