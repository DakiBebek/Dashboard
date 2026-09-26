import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const empty = {
  title: '', media_type: 'movie', status: 'belum', current_episode: 0, total_episode: '',
  update_interval_weeks: '', last_watched: '', is_ongoing: false, notes: '',
};

export default function Movies() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('movies').select('*').order('created_at', { ascending: false });
    setItems(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title) return;
    const payload = {
      ...form,
      total_episode: form.total_episode === '' ? null : Number(form.total_episode),
      update_interval_weeks: form.update_interval_weeks === '' ? null : Number(form.update_interval_weeks),
      last_watched: form.last_watched || null,
      current_episode: Number(form.current_episode) || 0,
    };
    if (editingId) {
      await supabase.from('movies').update(payload).eq('id', editingId);
    } else {
      await supabase.from('movies').insert(payload);
    }
    setForm(empty);
    setEditingId(null);
    load();
  }

  function startEdit(item) {
    setForm({
      title: item.title,
      media_type: item.media_type,
      status: item.status,
      current_episode: item.current_episode || 0,
      total_episode: item.total_episode ?? '',
      update_interval_weeks: item.update_interval_weeks ?? '',
      last_watched: item.last_watched || '',
      is_ongoing: !!item.is_ongoing,
      notes: item.notes || '',
    });
    setEditingId(item.id);
  }

  async function remove(id) {
    if (!confirm('Hapus item ini?')) return;
    await supabase.from('movies').delete().eq('id', id);
    load();
  }

  async function bumpEpisode(item) {
    const newEp = (item.current_episode || 0) + 1;
    await supabase.from('movies').update({
      current_episode: newEp,
      last_watched: new Date().toISOString().slice(0, 10),
      status: item.total_episode && newEp >= item.total_episode ? 'selesai' : 'ditonton',
    }).eq('id', item.id);
    load();
  }

  return (
    <div>
      <h1>Film & Series</h1>

      <div className="card">
        <h2>{editingId ? 'Edit' : 'Tambah'} Film/Series</h2>
        <form className="inline-form" onSubmit={handleSubmit}>
          <input type="text" placeholder="Judul" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <select value={form.media_type} onChange={(e) => setForm({ ...form, media_type: e.target.value })}>
            <option value="movie">Movie</option>
            <option value="series">Series</option>
          </select>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="belum">Belum ditonton</option>
            <option value="ditonton">Sedang ditonton</option>
            <option value="selesai">Selesai ditonton</option>
          </select>
          {form.media_type === 'series' && (
            <>
              <input type="number" min="0" placeholder="Eps sekarang" value={form.current_episode}
                onChange={(e) => setForm({ ...form, current_episode: e.target.value })} style={{ width: 100 }} />
              <input type="number" min="0" placeholder="Total eps" value={form.total_episode}
                onChange={(e) => setForm({ ...form, total_episode: e.target.value })} style={{ width: 100 }} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                <input type="checkbox" checked={form.is_ongoing}
                  onChange={(e) => setForm({ ...form, is_ongoing: e.target.checked })} />
                Ongoing
              </label>
              {form.is_ongoing && (
                <input type="number" min="1" placeholder="Update tiap (minggu)" value={form.update_interval_weeks}
                  onChange={(e) => setForm({ ...form, update_interval_weeks: e.target.value })} style={{ width: 150 }} />
              )}
            </>
          )}
          <input type="date" value={form.last_watched}
            onChange={(e) => setForm({ ...form, last_watched: e.target.value })} title="Terakhir ditonton" />
          <input type="text" placeholder="Catatan" value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <button type="submit">{editingId ? 'Simpan' : 'Tambah'}</button>
          {editingId && (
            <button type="button" className="secondary" onClick={() => { setForm(empty); setEditingId(null); }}>Batal</button>
          )}
        </form>
      </div>

      {loading ? <p>Memuat...</p> : (
        <div className="card">
          <table>
            <thead>
              <tr><th>Judul</th><th>Tipe</th><th>Progress</th><th>Status</th><th>Terakhir Nonton</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id}>
                  <td><strong>{i.title}</strong>{i.notes && <div style={{ color: '#888', fontSize: 12 }}>{i.notes}</div>}</td>
                  <td>{i.media_type === 'series' ? 'Series' : 'Movie'}{i.is_ongoing && <div style={{ fontSize: 11, color: '#888' }}>Ongoing · update {i.update_interval_weeks || '?'} mgg</div>}</td>
                  <td>
                    {i.media_type === 'series'
                      ? `Eps ${i.current_episode || 0}${i.total_episode ? ` / ${i.total_episode}` : ''}`
                      : '—'}
                    {i.media_type === 'series' && i.status !== 'selesai' && (
                      <div><button className="secondary" style={{ fontSize: 11, padding: '2px 6px', marginTop: 4 }} onClick={() => bumpEpisode(i)}>+1 Eps</button></div>
                    )}
                  </td>
                  <td><span className={`badge ${i.status}`}>{i.status}</span></td>
                  <td>{i.last_watched ? new Date(i.last_watched).toLocaleDateString('id-ID') : '—'}</td>
                  <td className="actions">
                    <button className="secondary" onClick={() => startEdit(i)}>Edit</button>
                    <button className="danger" onClick={() => remove(i.id)}>Hapus</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={6} className="empty">Belum ada data.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
