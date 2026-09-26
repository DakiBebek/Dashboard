import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const DAYS = [
  { id: 1, label: 'Senin' },
  { id: 2, label: 'Selasa' },
  { id: 3, label: 'Rabu' },
  { id: 4, label: 'Kamis' },
  { id: 5, label: 'Jumat' },
  { id: 6, label: 'Sabtu' },
  { id: 7, label: 'Minggu' },
];

const empty = { course_name: '', day_of_week: 1, start_time: '', end_time: '', room: '', lecturer: '' };

export default function Schedule() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('schedules').select('*').order('start_time');
    setItems(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.course_name || !form.start_time || !form.end_time) return;
    if (editingId) {
      await supabase.from('schedules').update(form).eq('id', editingId);
    } else {
      await supabase.from('schedules').insert(form);
    }
    setForm(empty);
    setEditingId(null);
    load();
  }

  function startEdit(item) {
    setForm({
      course_name: item.course_name,
      day_of_week: item.day_of_week,
      start_time: item.start_time,
      end_time: item.end_time,
      room: item.room || '',
      lecturer: item.lecturer || '',
    });
    setEditingId(item.id);
  }

  async function remove(id) {
    if (!confirm('Hapus jadwal ini?')) return;
    await supabase.from('schedules').delete().eq('id', id);
    load();
  }

  return (
    <div>
      <h1>Jadwal Kuliah</h1>

      <div className="card">
        <h2>{editingId ? 'Edit Jadwal' : 'Tambah Jadwal'}</h2>
        <form className="inline-form" onSubmit={handleSubmit}>
          <input type="text" placeholder="Nama mata kuliah" value={form.course_name}
            onChange={(e) => setForm({ ...form, course_name: e.target.value })} />
          <select value={form.day_of_week} onChange={(e) => setForm({ ...form, day_of_week: Number(e.target.value) })}>
            {DAYS.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select>
          <input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
          <input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
          <input type="text" placeholder="Ruangan" value={form.room}
            onChange={(e) => setForm({ ...form, room: e.target.value })} />
          <input type="text" placeholder="Dosen" value={form.lecturer}
            onChange={(e) => setForm({ ...form, lecturer: e.target.value })} />
          <button type="submit">{editingId ? 'Simpan' : 'Tambah'}</button>
          {editingId && (
            <button type="button" className="secondary" onClick={() => { setForm(empty); setEditingId(null); }}>Batal</button>
          )}
        </form>
      </div>

      {loading ? <p>Memuat...</p> : (
        <div className="card">
          <div className="grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {DAYS.map((d) => {
              const dayItems = items.filter((i) => i.day_of_week === d.id);
              return (
                <div className="day-col" key={d.id}>
                  <h3>{d.label}</h3>
                  {dayItems.length === 0 && <div className="empty" style={{ fontSize: 11 }}>—</div>}
                  {dayItems.map((i) => (
                    <div className="class-block" key={i.id}>
                      <strong>{i.course_name}</strong>
                      <small>{i.start_time?.slice(0,5)}–{i.end_time?.slice(0,5)}</small>
                      {i.room && <small>Ruang {i.room}</small>}
                      <div className="actions" style={{ marginTop: 4 }}>
                        <button className="secondary" style={{ padding: '2px 6px', fontSize: 11 }} onClick={() => startEdit(i)}>Edit</button>
                        <button className="danger" style={{ padding: '2px 6px', fontSize: 11 }} onClick={() => remove(i.id)}>Hapus</button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
