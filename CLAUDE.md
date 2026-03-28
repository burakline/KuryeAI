# KuryeAI — Claude Code Yapılandırması

## Git Push Kurulumu

Token `.git/github_token` dosyasında saklanır (git tarafından takip edilmez):

```bash
echo "GHP_TOKEN_BURAYA" > .git/github_token
```

Session-start hook bu dosyayı okuyarak remote URL'i otomatik set eder.

## Vercel Deploy

GitHub push sonrası Vercel otomatik deploy eder.

## Geliştirme Dalı

Tek branch: `claude/connect-github-repo-0uL6U`

Tüm değişiklikler doğrudan bu branch'e commit edilip push edilir.
`main` branch silinmiştir — merge adımı gerekmez.

## Proje Yapısı

- `kuryeai-panel.html` — Kurye uygulaması (GPS takip, vardiya, sipariş)
- `adminai-panel.html` — Admin paneli (kullanıcılar, harita, iletişim, blog yorumları)
- `restoranai-panel.html` — Restoran paneli (sipariş takip, canlı harita)
- `kuryeai-login.html` / `restoranai-login.html` — Giriş sayfaları
- `blog/` — 7 blog yazısı (tema toggle, yorum/beğeni sistemi)
- `theme.css` / `theme.js` — Karanlık/aydınlık tema sistemi
- `firestore.rules` — Firestore güvenlik kuralları
- `database.rules.json` — Realtime Database kuralları
- `vercel.json` — Yönlendirme kuralları (cleanUrls, rewrites)

## Firebase

- Proje: `kuryeai-99bf9`
- RTDB URL: `https://kuryeai-99bf9-default-rtdb.europe-west1.firebasedatabase.app`
- GPS akışı: KuryeAI → RTDB `/couriers/{id}/location` (3sn) → AdminAI & RestoranAI

## Tamamlanan Özellikler

- Blog sayfaları: karanlık/aydınlık tema toggle, beğeni, yorum sistemi
- Blog yorum yönetimi AdminAI panelinde (`nav-yorumlar` sekmesi)
- İletişim mesajları AdminAI panelinde (`nav-iletisim` sekmesi)
- Canlı harita fullscreen butonu düzeltildi (adminai + restoranai)
- Admin harita butonları `admMapWrap` içine taşındı (fullscreen'de görünür)
- Firestore rules: blog_likes, blog_comments, contact_messages eklendi
- database.rules.json trailing comma hatası düzeltildi
- Login sayfalarında yanlış RTDB URL düzeltildi

## Yapılacaklar / Eksikler

- EmailJS gerçek config (iletişim formu şu an çalışmıyor olabilir)
- Admin paneline giriş sadece `burakline@kuryeai.com` ile kısıtlanacak
- Blog auth modalında "Şifremi unuttum" linki eksik
