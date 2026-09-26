import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';

export default function Home() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [{ count: taskCount }, { count: taskDone }, { count: movieCount }, { count: bookCount }] =
          await Promise.all([
            supabase.from('tasks').select('*', { count: 'exact', head: true }).neq('status', 'selesai'),
            supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'selesai'),
            supabase.from('movies').select('*', { count: 'exact', head: true }).neq('status', 'selesai'),
            supabase.from('books').select('*', { count: 'exact', head: true }).neq('status', 'selesai'),
          ]);

        const { data: nearest } = await supabase
          .from('tasks')
          .select('*')
          .neq('status', 'selesai')
          .order('deadline', { ascending: true })
          .limit(3);

        setStats({ taskCount, taskDone, movieCount, bookCount, nearest: nearest || [] });
      } catch (e) {
        setError(e.message || 'Gagal memuat data. Cek konfigurasi Supabase.');
      }
    }
    load();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {error && <div className="card" style={{ color: '#c92a2a' }}>{error}</div>}
      {!stats && !error && <p>Memuat...</p>}
      {stats && (
        <>
          <div className="grid">
            <div className="card">
              <h2>Tugas Aktif</h2>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{stats.taskCount ?? 0}</div>
              <small>{stats.taskDone ?? 0} sudah selesai</small>
            </div>
            <div className="card">
              <h2>Film/Series Aktif</h2>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{stats.movieCount ?? 0}</div>
            </div>
            <div className="card">
              <h2>Buku Aktif</h2>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{stats.bookCount ?? 0}</div>
            </div>
          </div>

          <div className="card">
            <h2>Deadline Terdekat</h2>
            {stats.nearest.length === 0 && <p className="empty">Tidak ada tugas aktif.</p>}
            {stats.nearest.map((t) => (
              <div key={t.id} style={{ padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
                <strong>{t.title}</strong> — {new Date(t.deadline).toLocaleString('id-ID')}{' '}
                <span className={`badge ${t.status}`}>{t.status}</span>
              </div>
            ))}
            <div style={{ marginTop: 10 }}>
              <Link href="/tasks">Lihat semua tugas →</Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
