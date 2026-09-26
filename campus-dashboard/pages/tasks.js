import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const empty = { title: '', course_name: '', deadline: '', task_type: 'individu', status: 'belum', notes: '' };

export default function Tasks() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('semua');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('tasks').select('*').order('deadline', { ascending: true });
    setItems(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.deadline) return;
    if (editingId) {
      await supabase.from('tasks').update(form).eq('id', editingId);
    } else {
      await supabase.from('tasks').insert(form);
    }
    setForm(empty);
    setEditingId(null);
    load();
  }

  function startEdit(item) {
    setForm({
      title: item.title,
      course_name: item.course_name || '',
      deadline: item.deadline ? item.deadline.slice(0, 16) : '',
      task_type: item.task_type,
      status: item.status,
      notes: item.notes || '',
    });
    setEditingId(item.id);
  }

  async function remove(id) {
    if (!confirm('Hapus tugas ini?')) return;
    await supabase.from('tasks').delete().eq('id', id);
    load();
  }

  async function quickStatus(item, status) {
    await supabase.from('tasks').update({ status }).eq('id', item.id);
    load();
  }

  const filtered = items.filter((i) => filterStatus === 'semua' || i.status === filterStatus);

  return (
    <div>
      <h1>Tugas</h1>

      <div className="card">
        <h2>{editingId ? 'Edit Tugas' : 'Tambah Tugas'}</h2>
        <form className="inline-form" onSubmit={handleSubmit}>
          <input type="text" placeholder="Judul tugas" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input type="text" placeholder="Mata kuliah" value={form.course_name}
            onChange={(e) => setForm({ ...form, course_name: e.target.value })} />
          <input type="datetime-local" value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          <select value={form.task_type} onChange={(e) => setForm({ ...form, task_type: e.target.value })}>
            <option value="individu">Individu</option>
            <option value="kelompok">Kelompok</option>
          </select>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="belum">Belum dikerjakan</option>
            <option value="dikerjakan">Sedang dikerjakan</option>
            <option value="selesai">Sudah selesai</option>
          </select>
          <input type="text" placeholder="Catatan (opsional)" value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <button type="submit">{editingId ? 'Simpan' : 'Tambah'}</button>
          {editingId && (
            <button type="button" className="secondary" onClick={() => { setForm(empty); setEditingId(null); }}>Batal</button>
          )}
        </form>
      </div>

      <div className="filters">
        {['semua', 'belum', 'dikerjakan', 'selesai'].map((s) => (
          <button key={s} className={filterStatus === s ? '' : 'secondary'} onClick={() => setFilterStatus(s)}>
            {s === 'semua' ? 'Semua' : s}
          </button>
        ))}
      </div>

      {loading ? <p>Memuat...</p> : (
        <div className="card">
          <table>
            <thead>
              <tr><th>Judul</th><th>Deadline</th><th>Tipe</th><th>Status</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr key={i.id}>
                  <td><strong>{i.title}</strong>{i.course_name && <div style={{ color: '#888', fontSize: 12 }}>{i.course_name}</div>}</td>
                  <td>{new Date(i.deadline).toLocaleString('id-ID')}</td>
                  <td><span className={`badge ${i.task_type}`}>{i.task_type}</span></td>
                  <td>
                    <select value={i.status} onChange={(e) => quickStatus(i, e.target.value)} style={{ fontSize: 12 }}>
                      <option value="belum">Belum</option>
                      <option value="dikerjakan">Dikerjakan</option>
                      <option value="selesai">Selesai</option>
                    </select>
                  </td>
                  <td className="actions">
                    <button className="secondary" onClick={() => startEdit(i)}>Edit</button>
                    <button className="danger" onClick={() => remove(i.id)}>Hapus</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5} className="empty">Tidak ada tugas.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
