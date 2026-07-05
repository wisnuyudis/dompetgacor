# Dompet Gacor — Setup, Build & Next Steps 💚

Dokumen ini menggantikan summary terminal yang keburu ke-close. Isinya:
1. Prasyarat
2. Setup Supabase (schema + Auth + keys)
3. Build & jalankan **backend** (Next.js)
4. Build & jalankan **mobile** (React Native)
5. Yang **masih perlu ditambahkan** sebelum dianggap "selesai"
6. Troubleshooting

Arsitektur singkat:

```
Mobile (RN) ──login/session──► Supabase Auth
     │  Bearer access_token
     ▼
Backend Next.js  ──verify token (service_role)──► Supabase
     │  panggil RPC transfer_funds / topup_wallet / pay_qr (SECURITY DEFINER)
     ▼
Postgres (RLS aktif, mutasi saldo hanya lewat RPC)
```

---

## 1. Prasyarat

| Tool | Versi | Catatan |
|------|-------|---------|
| Node.js | **≥ 22.11.0** | wajib (lihat `mobile/package.json > engines`) |
| npm | 10+ | |
| Akun Supabase | — | project gratis cukup |
| **iOS**: Xcode + CocoaPods | Xcode 15+ | `sudo gem install cocoapods` |
| **Android**: Android Studio + JDK 17 | | SDK + emulator / device |
| Supabase CLI *(opsional)* | | untuk `supabase db push`; bisa diganti copy-paste SQL |

Cek: `node -v` harus ≥ 22.11.

---

## 2. Setup Supabase

### 2.1 Buat project
1. Masuk ke <https://supabase.com> → **New project**.
2. Catat **Database password**.
3. Tunggu provisioning selesai (~2 menit).

### 2.2 Jalankan migrasi (schema + RPC + RLS)
Ada 2 file yang **harus dijalankan berurutan**:

- `backend/supabase/migrations/0001_init.sql` — tabel `profiles`, `wallets`, `transactions`, trigger auto-create profile+wallet saat register, dan **RLS policies**.
- `backend/supabase/migrations/0002_functions.sql` — RPC atomic: `topup_wallet`, `transfer_funds`, `pay_qr`.

**Cara A — SQL Editor (paling gampang):**
Buka **SQL Editor** di dashboard → New query → copy-paste isi `0001_init.sql` → Run → ulangi untuk `0002_functions.sql`.

**Cara B — Supabase CLI:**
```bash
cd backend
supabase link --project-ref <PROJECT-REF>
supabase db push
```

### 2.3 Konfigurasi Auth
App pakai **email + password** (`supabase.auth.signUp` / `signInWithPassword`).

- **Authentication → Providers → Email**: pastikan **enabled**.
- **Untuk development**, matikan **"Confirm email"** (Authentication → Providers → Email → *Confirm email* = OFF).
  > Kalau confirm email ON, `signUp` mengembalikan `needsVerification: true` dan session masih `null` sampai user klik link verifikasi. Untuk demo/tes lebih enak OFF.
- Trigger `on_auth_user_created` otomatis membuat baris `profiles` + `wallets` begitu user register — tidak perlu setup tambahan.

### 2.4 Ambil kredensial
**Project Settings → API**, catat:
- **Project URL** → `...supabase.co`
- **anon / public key**
- **service_role key** ⚠️ **RAHASIA** — hanya dipakai di backend, jangan pernah masuk ke app mobile.

---

## 3. Backend (Next.js)

```bash
cd backend
cp .env.example .env.local
```

Isi `backend/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

Install & jalankan:
```bash
npm install
npm run dev          # http://localhost:3000
```

Cek sehat: buka <http://localhost:3000/api/health> → harus `{"ok":true,...}`.

**Build produksi:**
```bash
npm run build
npm run start        # port 3000
```

Endpoint yang tersedia (semua butuh header `Authorization: Bearer <access_token>`, kecuali `/api/health`):
`/api/wallet`, `/api/transactions`, `/api/transfer`, `/api/topup`, `/api/qr/pay`, `/api/users/search`.

---

## 4. Mobile (React Native 0.84)

```bash
cd mobile
cp .env.example .env
npm install
```

Isi `mobile/.env` — **URL backend tergantung target:**
```env
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_ANON_KEY=<anon-key>

# Android emulator : http://10.0.2.2:3000
# iOS simulator    : http://localhost:3000
# Device fisik     : http://<IP-LAN-komputer>:3000   (mis. http://192.168.1.10:3000)
API_BASE_URL=http://10.0.2.2:3000
```
> `.env` dibaca lewat `react-native-dotenv` (babel). **Setiap ubah `.env`, restart Metro dengan cache reset:** `npm start -- --reset-cache`.

### Android
```bash
npm start -- --reset-cache      # terminal 1 (biarkan jalan)
npm run android                 # terminal 2
```
Permission `INTERNET` & `CAMERA` sudah ada di `AndroidManifest.xml`. Cleartext HTTP (buat konek ke backend `http://`) sudah diaktifkan via placeholder manifest untuk debug.

### iOS
```bash
cd ios && pod install && cd ..
npm start -- --reset-cache      # terminal 1
npm run ios                     # terminal 2
```
`NSCameraUsageDescription` sudah ada di `Info.plist` (buat QR scan).

### Alur uji cepat
1. Register 2 akun berbeda (mis. A & B).
2. Di akun A: **Top Up** → saldo bertambah.
3. Transfer dari A ke B (pakai username/phone/atau user id B).
4. B buka **My QR**, A **Scan** QR B → bayar.
5. Cek **History** di kedua akun.

---

## 5. Yang masih perlu ditambahkan (TODO sebelum "beneran selesai")

Backend + schema sudah jalan untuk MVP, tapi ini belum ada / masih demo:

### Penting (fungsional/keamanan)
- [ ] **PIN transaksi.** Kolom `wallets.pin_hash` sudah ada di schema tapi **belum dipakai** — belum ada endpoint set/verify PIN, dan transfer/pay belum minta PIN. Tambahkan flow set-PIN saat onboarding + verifikasi PIN sebelum `transfer`/`pay`.
- [ ] **Top-up masih simulasi.** `topup_wallet` langsung menambah saldo tanpa payment gateway. Untuk produksi, integrasikan gateway (Midtrans/Xendit/dll) + webhook konfirmasi sebelum kredit saldo.
- [ ] **Rate limiting / anti-abuse** di endpoint `topup` & `transfer` (belum ada).
- [ ] **Email confirmation ON** untuk produksi (di dev boleh OFF) — sesuaikan UI verifikasi.

### Deploy
- [ ] **Deploy backend** (Vercel paling mulus untuk Next.js). Set 3 env var yang sama di dashboard Vercel. Setelah deploy, ganti `API_BASE_URL` di mobile ke URL HTTPS produksi.
- [ ] Setelah backend HTTPS, **matikan cleartext traffic** di Android release.
- [ ] **Build rilis mobile:**
  - Android: `cd android && ./gradlew assembleRelease` (siapkan keystore signing).
  - iOS: Archive lewat Xcode (butuh Apple Developer account).

### Nice to have
- [ ] Avatar upload (kolom `avatar_url` ada, upload belum) → pakai Supabase Storage.
- [ ] Notifikasi (push) untuk transaksi masuk.
- [ ] Refund flow (`type: 'refund'` sudah didefinisikan di schema, belum ada RPC/endpoint).
- [ ] Unit/integration test untuk RPC uang (transfer race condition, saldo minus).
- [ ] Pagination di `/api/transactions` untuk history panjang.

---

## 6. Troubleshooting

| Masalah | Penyebab / Solusi |
|---------|-------------------|
| Mobile "Network request failed" saat login/transfer | `API_BASE_URL` salah. Emulator Android **wajib** `10.0.2.2`, bukan `localhost`. Device fisik pakai IP LAN + pastikan HP satu WiFi dengan komputer. |
| Perubahan `.env` tidak kebaca | Restart Metro: `npm start -- --reset-cache`. |
| `SUPABASE_URL is not set` di backend | Backend baca `.env.local` (bukan `.env`). Pastikan nama file benar & restart `npm run dev`. |
| Register sukses tapi tidak bisa login | "Confirm email" masih ON di Supabase → cek inbox / matikan untuk dev. |
| `WALLET_NOT_FOUND` saat top-up | Trigger `on_auth_user_created` belum jalan → pastikan `0001_init.sql` sudah dieksekusi sebelum user register. |
| `INSUFFICIENT_FUNDS` | Saldo pengirim kurang — top up dulu. |
| iOS build gagal soal Pods | `cd ios && pod install` (atau `pod repo update && pod install`). |
| Kamera QR hitam / crash | Vision Camera butuh izin runtime; terima prompt permission saat pertama buka Scan. |

---

**Ringkasan urutan pertama kali:**
`Supabase project → jalankan 0001 & 0002 SQL → matikan confirm email → isi env backend → npm run dev → isi env mobile (10.0.2.2) → pod install (iOS) → npm run android/ios → register 2 akun → tes.`
