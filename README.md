# Mini Todo

Tarayıcıda çalışan görev yöneticisi. Sunucu yok, veritabanı yok, derleme adımı yok — saf HTML, CSS ve JavaScript. Tüm veriler `localStorage`'da, kullanıcının kendi makinesinde durur.

## Çalıştırma

`index.html` dosyasına çift tıklayın. Başka hiçbir şeye gerek yok.

Kod `type="module"` kullanmadığı için `file://` protokolüyle de sorunsuz açılır. Yine de yerel bir sunucu tercih ederseniz:

```bash
python -m http.server 8000
# tarayıcıda: http://localhost:8000
```

## Demo hesabı

Uygulama ilk açıldığında denenecek hazır bir hesap oluşturulur:

```
E-posta: qwe@gmail.com
Şifre  : 123456
```

Giriş formunun altındaki **Demo ile gir** düğmesi bu bilgileri doldurup doğrudan girer. Hesap, dört kategoriye dağılmış sekiz örnek görevle gelir — ikisi tamamlanmış, biri gecikmiş, ikisi bugüne ait. Tarihler her açılışta bugüne göre hesaplanır, yani demo ne zaman açılırsa açılsın dolu görünür.

Hesap yalnızca daha önce yoksa oluşturulur; demo hesapta yaptığınız değişiklikler sayfayı yenileyince kaybolmaz.

## Özellikler

**Kimlik doğrulama**
- Kayıt olma ve giriş yapma
- Şifre göster/gizle
- Beni hatırla — işaretliyse oturum `localStorage`'a, değilse `sessionStorage`'a yazılır (ikincisi sekme kapanınca silinir)
- Şifremi unuttum
- Form doğrulama (alan bazında hata mesajları)

**Görevler**
- Ekleme, düzenleme, silme, tamamlandı işaretleme
- Öncelik: Düşük / Orta / Yüksek
- Son tarih; gecikmiş ve bugün olanlar ayrı renklendirilir
- Başlık ve açıklamada arama
- Duruma, kategoriye ve önceliğe göre filtreleme
- Eklenme, son tarih, öncelik ve A-Z sıralaması

**Kategoriler**
- Hazır gelenler: Work, Personal, Learning, Shopping
- Ad, simge ve renk seçerek yeni kategori
- Kategori başına görev sayısı
- Kategori silinince içindeki görevler silinmez, kategorisiz kalır

**Profil ve ayarlar**
- Profil fotoğrafı (base64 olarak saklanır, 1 MB sınırı)
- Ad soyad, e-posta, kullanıcı adı düzenleme
- Şifre değiştirme
- Açık / koyu tema
- Bildirimler ve e-posta bildirimi tercihleri
- Dil: Türkçe / İngilizce
- Varsayılan görev görünümü
- Verileri sıfırlama, çıkış

## Klavye kısayolları

| Tuş | İşlev |
|---|---|
| `N` | Yeni görev |
| `Ctrl` + `K` | Aramaya odaklan |
| `Esc` | Açık pencereyi kapat |

## Dosya yapısı

```
index.html          Tüm ekranların işaretlemesi ve SVG simge seti
css/style.css       Stiller, tema değişkenleri, duyarlı düzen
js/storage.js       localStorage / sessionStorage sarmalayıcı
js/utils.js         Ortak yardımcılar (kimlik, HTML kaçışı, tarih, karma)
js/icons.js         Simge yardımcısı ve eski emoji kayıtlarının dönüşümü
js/i18n.js          Türkçe / İngilizce metinler
js/data.js          Görev, kategori ve ayar işlemleri
js/auth.js          Kayıt, giriş, oturum, şifre
js/ui.js            Bildirim, modal, onay kutusu, form hataları
js/app.js           Sayfa akışı, render, olay bağlama
```

Betikler `index.html` içinde bu sırayla yüklenir; her dosya kendinden öncekine dayanır.

## Veriler nerede duruyor

Tarayıcının `localStorage` alanında, `minitodo:` önekiyle:

| Anahtar | İçerik |
|---|---|
| `minitodo:users` | Kayıtlı kullanıcılar |
| `minitodo:session` | Açık oturum |
| `minitodo:u:<id>:tasks` | Kullanıcının görevleri |
| `minitodo:u:<id>:categories` | Kullanıcının kategorileri |
| `minitodo:u:<id>:settings` | Kullanıcının ayarları |

Her kullanıcının verisi kendi kimliği altında ayrıldığı için aynı tarayıcıda birden fazla hesap birbirine karışmaz.

Verileri tamamen temizlemek için tarayıcı geliştirici araçlarından (F12) Application → Local Storage yolunu izleyin, ya da uygulama içinde Profil → Verileri sil.

## Güvenlik notu

Şifreler düz metin olarak saklanmaz, tuzlanmış basit bir karma ile tutulur. **Bu gerçek bir güvenlik önlemi değildir.** `localStorage` kullanıcı tarafından okunabilir ve değiştirilebilir; kullanılan karma fonksiyonu kriptografik değildir. Amaç yalnızca şifrenin depolamada açıkça görünmemesi.

Gerçek bir uygulamada kimlik doğrulama sunucu tarafında yapılmalı, şifreler bcrypt/argon2 gibi algoritmalarla saklanmalıdır. Bu proje tek kullanıcılık yerel bir demodur.

Kullanıcıdan gelen tüm metinler ekrana basılmadan önce HTML kaçışından geçirilir, böylece görev başlığına kod yazarak çalıştırmak mümkün değildir.

## Arayüz

Simgelerin tamamı `index.html` içindeki gizli SVG sprite'ında tanımlı satır ikonlarıdır; emoji kullanılmaz. Her simge bulunduğu yerin rengini ve yazı boyutunu miras alır, böylece açık ve koyu temada ayrı bir düzenleme gerekmez.

Renkler doygunluğu düşürülmüş tonlardan seçildi: saf siyah yerine kırık koyu gri metin, keskin çizgiler yerine düşük kontrastlı kenarlıklar, sert gölgeler yerine geniş ve soluk gölgeler.

Daha önce emoji ile kaydedilmiş kategoriler okunurken otomatik olarak yeni simge setine çevrilir; eski veriyle açıldığında kategoriler simgesiz kalmaz.

## Tarayıcı desteği

Güncel Chrome, Edge, Firefox ve Safari. Kategori rozetlerindeki renk geçişleri CSS `color-mix()` kullanır; desteklemeyen eski tarayıcılarda rozet arka planı saydam görünür, işlevsellik etkilenmez.
