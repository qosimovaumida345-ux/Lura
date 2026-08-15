# Lura Video Editor — Deployment va Build Qo'llanmasi

Ushbu hujjat Lura loyihasini **Render.com** orqali tekinga internetga chiqarish (deploy) hamda **GitHub Actions** yordamida PC (`.exe`) va Android (`.apk`) uchun qanday build qilishni tushuntiradi.

---

## 1. Render.com da `.env` sozlamalari (Backend Deploy)

Render.com da backend (Node.js/Express) ni tekinga yurgazish uchun quyidagilarni qiling:

1. Render.com saytiga kiring va GitHub orqali ro'yxatdan o'ting.
2. Yangi **Web Service** yarating va GitHub'dagi *Lura* repozitoriysini ulang.
3. Sozlamalar:
   - **Environment:** `Node`
   - **Build Command:** `npm install` (server papkasida bo'lsa: `cd server && npm install`)
   - **Start Command:** `npm start` (yoki `node index.js`)
   - **Plan:** Free ($0/month)
4. **Environment Variables (Advanced bo'limi)** ni oching va quyidagilarni kiriting:
   - `PORT` = `3001`
   - `CLIENT_URL` = `https://sizning-frontend-saytingiz.vercel.app` (CORS ruxsati uchun)
   - `OPENROUTER_API_KEY` = `sk-or-v1-*****************` (AI uchun)
   - `JWT_SECRET` = `ixtiyoriy-juda-maxfiy-kod-123`
   - `DATABASE_URL` = (Agar Render PostgreSQL ulasangiz, o'sha yerdagi External DB linkni qo'yasiz).

> **Muhim eslatma:** Render.com ning tekin serveri 15 daqiqa ishlatilmasa uxlab qoladi. Dasturga kirganingizda server uyg'onishi uchun 30-50 soniya vaqt ketishi mumkin.

---

## 2. PC uchun `.exe` qilish (Tauri + GitHub Actions)

Lura asosan React web ilova bo'lsa-da, uni Windows uchun `.exe` qilishning eng tekin va samarali yo'li bu **Tauri** (Rust) hisoblanadi (Electron'dan ko'ra hajmi 10 barobar kichikroq bo'ladi).

Loyiha ildizida (root) `.github/workflows/desktop-build.yml` nomli fayl yaratasiz va quyidagi kodni yozasiz. Bu kod siz GitHub'ga Push qilganingizda avtomatik Windows va Mac uchun o'rnatish (installer) fayllarini yaratib beradi:

```yaml
name: "Build Desktop App (Tauri)"
on:
  push:
    branches: [ main ]

jobs:
  build:
    strategy:
      matrix:
        platform: [windows-latest, macos-latest]
    runs-on: ${{ matrix.platform }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Node.js o'rnatish
        uses: actions/setup-node@v4
        with:
          node-version: 20
          
      - name: Rust o'rnatish
        uses: dtolnay/rust-toolchain@stable
        
      - name: Web qismni build qilish
        run: |
          cd client
          npm install
          npm run build
          
      - name: Tauri .exe/.dmg build qilish
        uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tagName: v1.0.0
          releaseName: 'Lura Desktop'
          releaseBody: 'Lura Video Editor yangi versiyasi'
          releaseDraft: true
          prerelease: false
```
Bu tugagach, GitHub loyihangizning **Releases** bo'limida tayyor `Lura_1.0.0_setup.exe` turgan bo'ladi va uni tekinga yuklab olib o'rnatasiz.

---

## 3. Android uchun `.apk` qilish (Capacitor + GitHub Actions)

Android versiyasini qilish uchun React kodini Native ilovaga aylantiruvchi **CapacitorJS** ishlatiladi. Bu ham tekin va GitHub Actions orqali avtomatlashadi.

Loyihada `.github/workflows/android-build.yml` yaratasiz:

```yaml
name: "Build Android APK"
on:
  push:
    branches: [ main ]

jobs:
  build-android:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Java 17 o'rnatish (Android SDK uchun)
        uses: actions/setup-java@v3
        with:
          distribution: 'zulu'
          java-version: '17'
          
      - name: Node.js o'rnatish
        uses: actions/setup-node@v4
        with:
          node-version: 20
          
      - name: Kodni build qilish (Vite)
        run: |
          cd client
          npm install
          npm run build
          
      - name: Android APK generatsiya qilish
        run: |
          cd client
          npx cap add android
          npx cap sync android
          cd android
          ./gradlew assembleDebug
          
      - name: Tayyor APK ni yuklash
        uses: actions/upload-artifact@v3
        with:
          name: Lura-Android-APK
          path: client/android/app/build/outputs/apk/debug/app-debug.apk
```
Bu jarayon tugagach, GitHub'dagi **Actions** bo'limiga kirsangiz, tayyor `app-debug.apk` faylini ko'rasiz. Uni telefonga tashlab o'rnatsangiz, Lura xuddi CapCut kabi telefon ilovasi bo'lib ochiladi!

---

## Xulosa
1. **Server:** Render.com (Baza va API uxlab qolmasligi uchun kelajakda Supabase'ga o'tish tavsiya qilinadi).
2. **PC (.exe):** GitHub Actions + Tauri (Mukammal va tekin).
3. **Android (.apk):** GitHub Actions + Capacitor (Tez va tekin).
