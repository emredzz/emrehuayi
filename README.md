# Mini Todo

React + Vite ile yazılmış, **tamamen local çalışan** görev yönetimi uygulaması.
Sunucu, veritabanı veya internet bağlantısı gerektirmez; tüm veriler tarayıcının
`localStorage` / `sessionStorage` alanında tutulur.

## Açma / Çalıştırma

**1. Çift tıklayarak (sunucu gerekmez)**

Kök klasördeki **`mini-todo.html`** dosyasına çift tıkla. JS, CSS ve fontlar bu tek
dosyanın içine gömülü olduğu için tarayıcıda doğrudan açılır.

> Kökteki `index.html` dosyasına tıklama — o, geliştirme sunucusunun giriş dosyasıdır
> ve derlenmemiş `src/main.jsx` dosyasına işaret eder; çift tıklayınca boş sayfa gelir.

**2. Geliştirme sunucusu (kod üzerinde çalışırken)**

```bash
npm install     # ilk kurulumda bir kez
npm run dev     # http://localhost:5173
```

**3. Yeniden derleme**

```bash
npm run build   # dist/index.html + kökte mini-todo.html (tek dosya) üretir
npm run preview # derlenmiş sürümü yerel sunucuda açar
```

## Demo hesabı

Uygulama ilk açıldığında hazır bir hesap oluşturulur:

| Kullanıcı adı | Şifre |
| --- | --- |
| `Oğulcan Ödemiş` (veya `ogulcan`, `ogulcan@minitodo.local`) | `1234` |

Giriş ekranındaki "Demo hesabı" bağlantısına tıklayınca form otomatik dolar.

## Özellikler

### Authentication
- Sign In / Sign Up sekmeleri
- Şifre göster/gizle, şifre gücü göstergesi
- Remember me → `localStorage`, işaretsiz → `sessionStorage` (sekme kapanınca oturum biter)
- Forgot password (e-posta doğrulayıp yeni şifre belirleme, local akış)
- Tüm alanlarda form doğrulama ve alan bazlı hata mesajları
- Başarılı girişte Dashboard'a (veya ayarlardaki varsayılan görünüme) yönlendirme

### Tasks
- Bugünün / tamamlanan / bekleyen / gecikmiş görev sayaçları ve günlük ilerleme çubuğu
- Görev ekleme, düzenleme, silme (onay diyaloğu ile)
- Tamamlandı olarak işaretleme
- Öncelik: Low / Medium / High
- Son tarih; geçmiş tarihli görevler "gecikmiş" olarak vurgulanır
- Başlık ve açıklamada arama
- Duruma, kategoriye ve önceliğe göre filtreleme + sıralama (eklenme / son tarih / öncelik / başlık)

### Categories
- Varsayılan kategoriler: Work, Personal, Learning, Shopping
- Kategori kartlarında görev sayısı; karta tıklayınca o kategorinin görevleri açılır
- `+ New Category`: isim, ikon ve renk seçimi + canlı önizleme
- Kategori düzenleme ve silme (silinince görevler kategorisiz kalır, kaybolmaz)

### Profile / Settings
- Profil fotoğrafı yükleme (256px'e küçültülüp saklanır), ad soyad, kullanıcı adı, e-posta
- Şifre değiştirme (mevcut şifre doğrulamalı)
- Dark / Light mode, bildirimler, e-posta bildirimleri
- Dil: Türkçe / English (tüm arayüz)
- Varsayılan görünüm (giriş sonrası açılacak ekran)
- En altta Log Out

## Klasör yapısı

```
src/
  components/
    auth/       AuthScreen (sign in / sign up / forgot password)
    categories/ CategoryModal
    layout/     AppLayout (sidebar, topbar, Avatar)
    tasks/      TaskItem, TaskList, TaskModal
    ui/         Modal, ConfirmDialog, Field, Toasts
  context/      AuthContext (oturum), DataContext (görev/kategori/ayar)
  lib/          storage.js (localStorage katmanı), i18n.js, helpers.js
  pages/        Dashboard, TasksPage, CategoriesPage, ProfilePage
  styles/       index.css (tema değişkenleri dahil tüm stiller)
```

## Not

Şifreler düz metin saklanmaz; basit bir salt + hash uygulanır. Bu **gerçek bir
güvenlik önlemi değildir** — uygulama tek kullanıcılı, local bir demo olarak
tasarlanmıştır. Tarayıcı verisi temizlenirse kayıtlar da silinir.
