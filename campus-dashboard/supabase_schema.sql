-- ==========================================================
-- SCHEMA DASHBOARD: Jadwal Kuliah, Tugas, Film/Series, Buku
-- Jalankan di Supabase: Dashboard > SQL Editor > New query
-- ==========================================================

-- 1) JADWAL KULIAH
create table if not exists schedules (
  id uuid primary key default gen_random_uuid(),
  course_name text not null,
  day_of_week int not null check (day_of_week between 1 and 7), -- 1=Senin ... 7=Minggu
  start_time time not null,
  end_time time not null,
  room text,
  lecturer text,
  created_at timestamptz default now()
);

-- 2) TUGAS
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  course_name text,
  deadline timestamptz not null,
  task_type text not null default 'individu' check (task_type in ('individu','kelompok')),
  status text not null default 'belum' check (status in ('belum','dikerjakan','selesai')),
  notes text,
  created_at timestamptz default now()
);

-- 3) FILM / SERIES TRACKER
create table if not exists movies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  media_type text not null default 'movie' check (media_type in ('movie','series')),
  status text not null default 'belum' check (status in ('belum','ditonton','selesai')), -- belum=belum ditonton, ditonton=sedang, selesai=tamat
  current_episode int default 0,
  total_episode int,
  update_interval_weeks int, -- khusus series ongoing: rilis eps baru tiap berapa minggu
  last_watched date,
  is_ongoing boolean default false,
  notes text,
  created_at timestamptz default now()
);

-- 4) BUKU TRACKER
create table if not exists books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text,
  status text not null default 'belum' check (status in ('belum','dibaca','selesai')),
  current_chapter int default 0,
  total_chapter int,
  last_read date,
  notes text,
  created_at timestamptz default now()
);

-- ==========================================================
-- ROW LEVEL SECURITY (opsional, untuk single-user tanpa login
-- ini dimatikan supaya anon key bisa langsung baca/tulis).
-- Kalau nanti mau tambah login multi-user, aktifkan RLS dan
-- tambahkan kolom user_id + policy per user.
-- ==========================================================
alter table schedules enable row level security;
alter table tasks enable row level security;
alter table movies enable row level security;
alter table books enable row level security;

create policy "public full access" on schedules for all using (true) with check (true);
create policy "public full access" on tasks for all using (true) with check (true);
create policy "public full access" on movies for all using (true) with check (true);
create policy "public full access" on books for all using (true) with check (true);
