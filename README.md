# Dompet Gacor 💚

Aplikasi mobile **e-wallet** (React Native) + **backend Next.js** dengan **Supabase**.

Brand color: `#6EEB83` (green). UI bilingual (Bahasa Indonesia / English, default ID).

## Struktur Monorepo

```
dompetgacor/
├── mobile/      # React Native 0.84 app (Android + iOS, TypeScript)
└── backend/     # Next.js (App Router) API + Supabase admin + migrasi SQL
```

## Fitur (MVP)

- 🔐 Autentikasi: Onboarding, Register, Login (Supabase Auth)
- 🏠 Home: saldo, kartu virtual, menu cepat, transaksi terakhir
- 💸 Transfer antar pengguna (atomic via RPC)
- ➕ Top-up saldo
- 📷 QR Pay: generate & scan QR pembayaran
- 🧾 Riwayat transaksi lengkap
- 👤 Profil

## Quick start

### 1. Backend
```bash
cd backend
cp .env.example .env.local      # isi kredensial Supabase
npm install
npm run dev                     # http://localhost:3000
```

Jalankan migrasi SQL di Supabase (SQL Editor atau CLI):
```bash
# isi file di backend/supabase/migrations/ secara berurutan
supabase db push                # atau copy-paste ke SQL Editor
```

### 2. Mobile
```bash
cd mobile
cp .env.example .env            # isi SUPABASE_URL, SUPABASE_ANON_KEY, API_BASE_URL
npm install
# iOS (butuh CocoaPods):
cd ios && pod install && cd ..
npm run ios       # atau: npm run android
```

## Konfigurasi Supabase

Aplikasi memakai Supabase untuk **Auth** + **Postgres** + **RLS**.
Kunci yang diperlukan ada di `*/.env.example`. Lihat `backend/supabase/migrations/`
untuk schema, RLS policies, dan RPC `transfer_funds` / `topup_wallet`.
# dompetgacor
