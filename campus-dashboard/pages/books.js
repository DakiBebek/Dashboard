import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const empty = { title: '', author: '', status: 'belum', current_chapter: 0, total_chapter: '', last_read: '', notes: '' };

export default function Books() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('books').select('*').order('created_at', { ascending: false });
    setItems(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title) return;
    const payload = {
      ...form,
      total_chapter: form.total_chapter === '' ? null : Number(form.total_chapter),
      current_chapter: Number(form.current_chapter) || 0,
      last_read: form.last_read || null,
    };
    if (editingId) {
      await supabase.from('books').update(payload).eq('id', editingId);
    } else {
      await supabase.from('books').insert(payload);
    }
    setForm(empty);
    setEditingId(null);
    load();
  }

  function startEdit(item) {
    setForm({
      title: item.title,
      author: item.author || '',
      status: item.status,
      current_chapter: item.current_chapter || 0,
      total_chapter: item.total_chapter ?? '',
      last_read: item.last_read || '',
      notes: item.notes || '',
    });
    setEditingId(item.id);
  }

  async function remove(id) {
    if (!confirm('Hapus buku ini?')) return;
    await supabase.from('books').delete().eq('id', id);
    load();
  }

  async function bumpChapter(item) {
    const newCh = (item.current_chapter || 0) + 1;
    await supabase.from('books').update({
      current_chapter: newCh,
      last_read: new Date().toISOString().slice(0, 10),
      status: item.total_chapter && newCh >= item.total_chapter ? 'selesai' : 'dibaca',
    }).eq('id', item.id);
    load();
  }

  return (
    <div>
      <h1>Buku</h1>

      <div className="card">
        <h2>{editingId ? 'Edit' : 'Tambah'} Buku</h2>
        <form className="inline-form" onSubmit={handleSubmit}>
          <input type="text" placeholder="Judul buku" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input type="text" placeholder="Penulis" value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })} />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="belum">Belum dibaca</option>
            <option value="dibaca">Sedang dibaca</option>
            <option value="selesai">Selesai dibaca</option>
          </select>
          <input type="number" min="0" placeholder="Chapter sekarang" value={form.current_chapter}
            onChange={(e) => setForm({ ...form, current_chapter: e.target.value })} style={{ width: 130 }} />
          <input type="number" min="0" placeholder="Total chapter" value={form.total_chapter}
            onChange={(e) => setForm({ ...form, total_chapter: e.target.value })} style={{ width: 120 }} />
          <input type="date" value={form.last_read}
            onChange={(e) => setForm({ ...form, last_read: e.target.value })} title="Terakhir baca" />
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
              <tr><th>Judul</th><th>Progress</th><th>Status</th><th>Terakhir Baca</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id}>
                  <td><strong>{i.title}</strong>{i.author && <div style={{ color: '#888', fontSize: 12 }}>{i.author}</div>}</td>
                  <td>
                    Chapter {i.current_chapter || 0}{i.total_chapter ? ` / ${i.total_chapter}` : ''}
                    {i.status !== 'selesai' && (
                      <div><button className="secondary" style={{ fontSize: 11, padding: '2px 6px', marginTop: 4 }} onClick={() => bumpChapter(i)}>+1 Chapter</button></div>
                    )}
                  </td>
                  <td><span className={`badge ${i.status}`}>{i.status}</span></td>
                  <td>{i.last_read ? new Date(i.last_read).toLocaleDateString('id-ID') : '—'}</td>
                  <td className="actions">
                    <button className="secondary" onClick={() => startEdit(i)}>Edit</button>
                    <button className="danger" onClick={() => remove(i.id)}>Hapus</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={5} className="empty">Belum ada data.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
