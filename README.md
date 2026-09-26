# Campus Dashboard

Dashboard pribadi: Jadwal Kuliah, Tugas (deadline, individu/kelompok, status), Tracker Film/Series (episode, ongoing), dan Tracker Buku (chapter). Dibuat dengan **Next.js** + **Supabase**, siap deploy ke **Vercel**.

## 1. Setup Supabase

1. Buat project baru di https://supabase.com
2. Buka **SQL Editor** → paste isi file `supabase_schema.sql` → Run
3. Buka **Project Settings > API**, catat:
   - `Project URL` → jadi `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → jadi `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> Catatan: skema ini pakai policy "public full access" (tanpa login), cocok untuk dashboard pribadi. Kalau nanti mau multi-user dengan login, tambahkan Supabase Auth + kolom `user_id` + ubah policy jadi `using (auth.uid() = user_id)`.

## 2. Jalankan lokal (opsional)

```bash
npm install
cp .env.example .env.local
# isi .env.local dengan URL & anon key dari Supabase
npm run dev
```

Buka http://localhost:3000

## 3. Deploy ke Vercel

1. Push folder ini ke repo GitHub (atau upload langsung lewat Vercel CLI)
2. Di https://vercel.com → **New Project** → import repo
3. Saat konfigurasi, tambahkan Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

Atau via CLI:
```bash
npm i -g vercel
vercel
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel --prod
```

## Fitur

- **Jadwal Kuliah** — tampilan grid 7 hari seperti kalender mingguan, tambah/edit/hapus mata kuliah beserta jam & ruangan.
- **Tugas** — judul, deadline, tipe (individu/kelompok), status (belum/dikerjakan/selesai), filter cepat, dashboard menampilkan deadline terdekat.
- **Film & Series** — tipe movie/series, status tonton, progres episode (+1 klik), tandai ongoing + interval update rilis (mingguan), tanggal terakhir nonton.
- **Buku** — progres chapter (+1 klik), status baca, tanggal terakhir baca.

## Struktur folder

```
pages/
  _app.js       # layout + navbar
  index.js      # ringkasan dashboard
  schedule.js   # jadwal kuliah
  tasks.js      # tugas
  movies.js     # film & series
  books.js      # buku
lib/supabaseClient.js
styles/globals.css
supabase_schema.sql
```

## Pengembangan lanjut (opsional)

- Tambah Supabase Auth (login) untuk multi-user
- Notifikasi deadline (email/push) pakai Supabase Edge Functions + cron
- Kalender bulanan penuh untuk jadwal (bukan cuma tampilan mingguan)
