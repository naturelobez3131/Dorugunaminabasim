# Gunluk Aktivite AI 📋✨

Telefon, PC, Android ve iPhone'da calisan **gunluk aktivite planlama + AI kalori takibi** uygulamasi. Tek kod tabani (PWA) — tarayicidan kullanilir veya "Ana ekrana ekle" ile uygulama gibi yuklenir.

Cal AI tarzinda **acik tonlu, sade ve temiz** bir arayuz.

## Ozellikler

- **AI ile gunu planlama** — Gununu kisaca anlat ("sabah spor, gunduz ofis, aksam ders"), AI tum gunu saatli bir zaman cizelgesine donustursun. Istersen her seyi manuel de ekleyebilirsin.
- **Puan kasma** — Yapilan aktiviteleri tikledikce kategoriye gore puan kazanirsin (spor 30, ogrenme 25, is 20…). Gun serisi (streak) takibi.
- **Rank sistemi** — Bronz → Gumus → Altin → Platin → Elmas → Usta → Efsane. Puan arttikca rank yukselir.
- **AI kalori & diyet** — Yemegin fotografini cek, AI kalori ve makrolari (protein/karb/yag) tahmin etsin. Gunluk kalori hedefine gore ilerleme.
- **Bildirimler** — Saati yaklasan aktivite icin kilit ekraninda hatirlatma.
- **PWA** — Cevrimdisi acilir, ana ekrana yuklenir, mobil + masaustu.

## Kurulum

```bash
npm install
npm run dev      # gelistirme sunucusu
npm run build    # uretim derlemesi (dist/)
npm run preview  # derlemeyi onizle
```

Ikonlar zaten `public/` icinde uretildi. Yeniden uretmek istersen:

```bash
node scripts/generate-icons.mjs
```

## AI'yi etkinlestirme

Uygulama **API anahtari olmadan da** calisir (demo planlar ve tahmini kalori degerleri uretir). Gercek AI icin:

1. Profil → **AI Ayarlari** bolumune git.
2. Claude API anahtarini (`sk-ant-...`) yapistir.
3. Model varsayilani `claude-opus-4-8`.

AI ozellikleri Claude API kullanir:
- **Planlama**: metin → yapilandirilmis gunluk plan (JSON schema ile garantili).
- **Yemek analizi**: fotograf (vision) → kalori + makrolar.

## Yayina alma (GitHub Pages)

Repo'ya push edildiginde `.github/workflows/deploy.yml` uygulamayi otomatik
derleyip GitHub Pages'e yayinlar.

**Yayin adresi:** https://naturelobez3131.github.io/Dorugunaminabasim/

Ilk yayinda Pages'in etkin olmasi gerekir. Workflow `actions/configure-pages`
ile bunu otomatik dener; eger izin yoksa GitHub'da bir kez:
**Settings → Pages → Build and deployment → Source: GitHub Actions** secilir.
Sonraki her push otomatik gunceller. Telefonda bu adresi acip "Ana ekrana ekle"
ile PWA olarak yukleyebilirsin.

### Alternatif: Vercel / Netlify

- **Vercel**: Projeyi import et, framework "Vite", build `npm run build`, output `dist`.
- **Netlify**: Build `npm run build`, publish dizini `dist`.

Bu platformlar kok dizinde (`/`) sunar; ekstra `BASE_PATH` gerekmez.

## Mimari

```
src/
  lib/
    anthropic.ts    # Claude API: planDay() + analyzeFood() (+ demo yedek)
    notifications.ts# Hatirlatma zamanlayici (Web Notifications + SW)
    image.ts        # Fotograf -> base64 + kucuk onizleme
    ranks.ts        # Puan -> rank esikleri
    util.ts         # tarih, puan, kategori yardimcilari
  screens/          # Today, Plan, Nutrition, Profile
  components/       # Ring, BottomNav
  store.ts          # Zustand + localStorage kaliciligi
  types.ts
```

## Guvenlik notu

Bu demo, API anahtarini **tarayicida** saklar ve dogrudan Claude API'ye gonderir (`dangerouslyAllowBrowser`). Gercek bir uretim dagitiminda anahtari bir **backend/proxy** arkasina alin; istemciye gomulu birakmayin.

## Kilit ekrani bildirimleri hakkinda

Web Notifications API ile uygulama acik veya arka planda asili iken hatirlaticilar kilit ekraninda gosterilir. Uygulama **tamamen kapaliyken** zamanlanmis bildirim icin sunucu tarafli **Web Push (VAPID)** altyapisi eklenmelidir; arayuz ayni kalir.
