/**
 * SR MVP — UploadSection (Portal Guru) — REVISED
 * src/components/teacher/sections/UploadSection.jsx
 *
 * Perubahan:
 *  - Tambah tombol Submit setelah file dipilih (sebelum proses upload)
 *  - Fitur Hapus (🗑) pada setiap item riwayat upload + konfirmasi inline
 */
import { useState, useRef } from 'react';
import { Card, Btn } from '../../shared/UI';
import { C } from '../../../styles/tokens';
import { SUBJECTS } from '../../../data/masterData';

/* ── Konstanta ─────────────────────────────────────────────────────────── */
const TINGKAT_OPT = ['X', 'XI', 'XII'];

const KELAS_BY_TINGKAT = {
  X: ['X IPA 1', 'X IPA 2', 'X IPS 1', 'X IPS 2'],
  XI: ['XI IPA 1', 'XI IPA 2', 'XI IPS 1', 'XI IPS 2'],
  XII: ['XII IPA 1', 'XII IPA 2', 'XII IPS 1', 'XII IPS 2'],
};

const TOPIK_BY_MAPEL = {
  mat: ['Aljabar Dasar', 'Persamaan Linear', 'Fungsi Kuadrat', 'Statistika', 'Trigonometri', 'Logaritma'],
  ipa: ['Ekosistem', 'Sel & Jaringan', 'Gerak Lurus', 'Energi & Kalor', 'Sistem Periodik'],
  bin: ['Teks Argumentasi', 'Puisi', 'Surat Dinas', 'Debat', 'Teks Narasi'],
  ips: ['Peradaban Awal', 'Kerajaan Nusantara', 'Ekonomi Dasar', 'Geografi Fisik'],
  eng: ['Simple Present', 'Past Tense', 'Reading Comprehension', 'Writing'],
  pjok: ['Kebugaran Jasmani', 'Permainan Bola', 'Atletik'],
  seni: ['Seni Rupa', 'Musik Tradisional', 'Teater'],
  ppkn: ['Pancasila', 'UUD 1945', 'Otonomi Daerah'],
};

const inp = {
  width: '100%', padding: '9px 12px', boxSizing: 'border-box',
  border: `1.5px solid ${C.tealXL}`, borderRadius: 9,
  fontSize: 13, outline: 'none', background: C.white, transition: 'border-color .2s',
};

/* ══════════════════════════════════════════════════════════════════════ */
const UploadSection = ({ teacherMapel, cls, nilaiUploads, uploading, setUploading, setNilaiUploads }) => {
  const uploadRef = useRef(null);

  /* ── Metadata form ─────────────────────────────────────────── */
  const [meta, setMeta] = useState({
    tingkat: '', kelas: '',
    mapelId: teacherMapel?.id || '',
    topik: '', topikCustom: '',
  });
  const [metaErrors, setMetaErrors] = useState({});
  const [dragging, setDragging] = useState(false);

  /* ── File yang sudah dipilih tapi belum di-submit ──────────── */
  const [pendingFile, setPendingFile] = useState(null);   // { name, size }
  const [confirmDeleteId, setConfirmDeleteId] = useState(null); // id item yang dikonfirmasi hapus

  const setM = (k, v) => {
    setMeta(p => {
      const next = { ...p, [k]: v };
      if (k === 'tingkat') next.kelas = '';
      if (k === 'mapelId') next.topik = '';
      return next;
    });
    setMetaErrors(e => ({ ...e, [k]: null }));
  };

  const validateMeta = () => {
    const e = {};
    if (!meta.tingkat) e.tingkat = 'Pilih tingkat';
    if (!meta.kelas) e.kelas = 'Pilih kelas';
    if (!meta.mapelId) e.mapelId = 'Pilih mata pelajaran';
    if (!meta.topik) e.topik = 'Pilih topik';
    if (meta.topik === '__custom' && !meta.topikCustom.trim()) e.topikCustom = 'Ketik nama topik';
    setMetaErrors(e);
    return !Object.keys(e).length;
  };

  /* ── File picked → tampilkan pending, belum upload ─────────── */
  const handleFilePick = (files) => {
    if (!files?.length) return;
    if (!validateMeta()) return;
    const f = files[0];
    setPendingFile({ name: f.name, size: f.size, rawFiles: files });
  };

  /* ── Submit → proses upload ─────────────────────────────────── */
  const handleSubmit = () => {
    if (!pendingFile || !validateMeta()) return;

    const topikLabel = meta.topik === '__custom' ? meta.topikCustom.trim() : meta.topik;
    const mapelInfo = SUBJECTS.find(s => s.id === meta.mapelId);

    setUploading(true);
    setTimeout(() => {
      const newEntry = {
        id: `uv${Date.now()}`,
        filename: pendingFile.name,
        tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: 'Diproses',
        siswa: 32,
        kelas: `Kelas ${meta.kelas}`,
        tingkat: meta.tingkat,
        mapel: mapelInfo?.label || '—',
        mapelIcon: mapelInfo?.icon || '📋',
        mapelColor: mapelInfo?.color || C.teal,
        topik: topikLabel,
      };
      setNilaiUploads(p => [newEntry, ...p]);
      setPendingFile(null);
      setUploading(false);

      // Auto → Selesai setelah 3 detik
      setTimeout(() => {
        setNilaiUploads(p => p.map(u => u.id === newEntry.id && u.status === 'Diproses' ? { ...u, status: 'Selesai' } : u));
      }, 3000);
    }, 1800);
  };

  /* ── Hapus item riwayat ─────────────────────────────────────── */
  const handleDelete = (id) => {
    setNilaiUploads(p => p.filter(u => u.id !== id));
    setConfirmDeleteId(null);
  };

  /* ── Computed ───────────────────────────────────────────────── */
  const kelasOpts = meta.tingkat ? KELAS_BY_TINGKAT[meta.tingkat] : [];
  const topikOpts = meta.mapelId ? (TOPIK_BY_MAPEL[meta.mapelId] || []) : [];
  const selMapel = SUBJECTS.find(s => s.id === meta.mapelId);
  const metaReady = meta.tingkat && meta.kelas && meta.mapelId && meta.topik &&
    (meta.topik !== '__custom' || meta.topikCustom.trim());

  const errStyle = { fontSize: 10, color: C.red, marginTop: 3 };
  const fmtSize = (bytes) => bytes > 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`;

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
      <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 20, fontWeight: 600, color: C.dark, marginBottom: 4 }}>
        📤 Upload Nilai Siswa
      </div>
      <div style={{ fontSize: 12, color: C.slate, marginBottom: 20 }}>
        Nilai yang di-upload digunakan sebagai konteks rekomendasi konten untuk siswa.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* ── Kolom Kiri — Form ── */}
        <Card style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: 16 }}>Upload File Nilai</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>

            {/* Tingkat */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.dark, display: 'block', marginBottom: 5 }}>
                Tingkat Kelas <span style={{ color: C.red }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {TINGKAT_OPT.map(t => (
                  <button key={t} onClick={() => setM('tingkat', t)} style={{
                    flex: 1, padding: '8px 0', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
                    fontWeight: 700, fontSize: 13,
                    border: `1.5px solid ${meta.tingkat === t ? C.teal : C.tealXL}`,
                    background: meta.tingkat === t ? C.teal : C.white,
                    color: meta.tingkat === t ? C.white : C.darkL, transition: 'all .15s',
                  }}>
                    Kelas {t}
                  </button>
                ))}
              </div>
              {metaErrors.tingkat && <div style={errStyle}>{metaErrors.tingkat}</div>}
            </div>

            {/* Kelas */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.dark, display: 'block', marginBottom: 5 }}>
                Kelas <span style={{ color: C.red }}>*</span>
              </label>
              <select value={meta.kelas} onChange={e => setM('kelas', e.target.value)}
                disabled={!meta.tingkat}
                style={{ ...inp, color: meta.kelas ? C.dark : C.slate, opacity: !meta.tingkat ? .5 : 1, borderColor: metaErrors.kelas ? C.red : C.tealXL }}>
                <option value="">{meta.tingkat ? '— Pilih Kelas —' : '— Pilih Tingkat dulu —'}</option>
                {kelasOpts.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
              {metaErrors.kelas && <div style={errStyle}>{metaErrors.kelas}</div>}
            </div>

            {/* Mata Pelajaran */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.dark, display: 'block', marginBottom: 5 }}>
                Mata Pelajaran <span style={{ color: C.red }}>*</span>
              </label>
              <select value={meta.mapelId} onChange={e => setM('mapelId', e.target.value)}
                style={{ ...inp, color: meta.mapelId ? C.dark : C.slate, borderColor: metaErrors.mapelId ? C.red : C.tealXL }}>
                <option value="">— Pilih Mata Pelajaran —</option>
                {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
              </select>
              {metaErrors.mapelId && <div style={errStyle}>{metaErrors.mapelId}</div>}
            </div>

            {/* Topik */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.dark, display: 'block', marginBottom: 5 }}>
                Topik / Sub-materi <span style={{ color: C.red }}>*</span>
              </label>
              <select value={meta.topik} onChange={e => setM('topik', e.target.value)}
                disabled={!meta.mapelId}
                style={{ ...inp, color: meta.topik ? C.dark : C.slate, opacity: !meta.mapelId ? .5 : 1, borderColor: metaErrors.topik ? C.red : C.tealXL }}>
                <option value="">{meta.mapelId ? '— Pilih Topik —' : '— Pilih Mapel dulu —'}</option>
                {topikOpts.map(t => <option key={t} value={t}>{t}</option>)}
                <option value="__custom">Lainnya (ketik manual)…</option>
              </select>
              {metaErrors.topik && <div style={errStyle}>{metaErrors.topik}</div>}
              {meta.topik === '__custom' && (
                <div style={{ marginTop: 8 }}>
                  <input value={meta.topikCustom} onChange={e => setM('topikCustom', e.target.value)}
                    placeholder="Ketik nama topik..."
                    style={{ ...inp, borderColor: metaErrors.topikCustom ? C.red : C.tealXL }}
                    onFocus={e => e.target.style.borderColor = C.teal}
                    onBlur={e => e.target.style.borderColor = metaErrors.topikCustom ? C.red : C.tealXL} />
                  {metaErrors.topikCustom && <div style={errStyle}>{metaErrors.topikCustom}</div>}
                </div>
              )}
            </div>
          </div>

          {/* Konteks summary */}
          {metaReady && (
            <div style={{ background: C.tealXL, borderRadius: 9, padding: '10px 13px', marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.teal, marginBottom: 6, textTransform: 'uppercase', letterSpacing: .8 }}>Konteks Upload</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
                {[
                  { label: 'Tingkat', val: `Kelas ${meta.tingkat}` },
                  { label: 'Kelas', val: meta.kelas },
                  { label: 'Mapel', val: `${selMapel?.icon} ${selMapel?.label}` },
                  { label: 'Topik', val: meta.topik === '__custom' ? meta.topikCustom : meta.topik },
                ].map(row => (
                  <div key={row.label}>
                    <div style={{ fontSize: 9, color: C.teal, opacity: .75 }}>{row.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.teal }}>{row.val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Drop zone */}
          {!pendingFile ? (
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); handleFilePick(e.dataTransfer.files); }}
              onClick={() => { if (validateMeta()) uploadRef.current?.click(); }}
              style={{
                border: `2px dashed ${dragging ? C.teal : metaReady ? C.tealL : C.tealXL}`,
                borderRadius: 12, padding: '28px 20px', textAlign: 'center',
                cursor: metaReady ? 'pointer' : 'not-allowed',
                background: dragging ? C.tealXL : metaReady ? '#FAFEFF' : C.cream,
                transition: 'all .2s', marginBottom: 12, opacity: metaReady ? 1 : .6,
              }}>
              <input ref={uploadRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }}
                onChange={e => handleFilePick(e.target.files)} />
              <div style={{ fontSize: 36, marginBottom: 8 }}>{metaReady ? '📂' : '🔒'}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: metaReady ? C.dark : C.slate }}>
                {dragging ? 'Lepaskan file di sini!' : metaReady ? 'Drag & drop atau klik untuk pilih file' : 'Lengkapi metadata di atas dulu'}
              </div>
              <div style={{ fontSize: 10, color: C.slate, marginTop: 4 }}>CSV, XLSX · Maks 10 MB</div>
            </div>
          ) : (
            /* ── File dipilih — tampilkan preview + tombol Submit ── */
            <div style={{ marginBottom: 12 }}>
              <div style={{ background: C.tealXL, border: `1.5px solid ${C.tealL}`, borderRadius: 11, padding: '12px 14px', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: pendingFile.name.endsWith('.csv') ? C.teal : C.purple, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    {pendingFile.name.endsWith('.csv') ? '📊' : '📗'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.dark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {pendingFile.name}
                    </div>
                    <div style={{ fontSize: 10, color: C.teal, marginTop: 2 }}>{fmtSize(pendingFile.size)} · Siap diupload</div>
                  </div>
                  <button onClick={() => { setPendingFile(null); if (uploadRef.current) uploadRef.current.value = ''; }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.slate, fontSize: 16, flexShrink: 0, padding: 2 }}
                    title="Hapus pilihan">✕</button>
                </div>
              </div>

              {/* Upload indicator */}
              {uploading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', padding: '10px 0' }}>
                  <div style={{ width: 20, height: 20, border: `3px solid ${C.tealXL}`, borderTopColor: C.teal, borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.teal }}>Mengupload & memproses...</span>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { setPendingFile(null); if (uploadRef.current) uploadRef.current.value = ''; }}
                    style={{ flex: 1, padding: '10px 0', borderRadius: 9, border: `1.5px solid ${C.tealXL}`, background: C.white, color: C.darkL, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = C.cream; e.currentTarget.style.borderColor = C.tealL; }}
                    onMouseLeave={e => { e.currentTarget.style.background = C.white; e.currentTarget.style.borderColor = C.tealXL; }}>
                    Batal
                  </button>
                  <Btn variant="primary" onClick={handleSubmit}
                    style={{ flex: 2, justifyContent: 'center', padding: '10px', fontSize: 13 }}>
                    📤 Submit & Upload
                  </Btn>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* ── Kolom Kanan — Riwayat ── */}
        <Card style={{ padding: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: 14 }}>📁 Riwayat Upload</div>

          {nilaiUploads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: C.slate }}>
              <div style={{ fontSize: 36, marginBottom: 8, opacity: .3 }}>📭</div>
              <div style={{ fontSize: 13 }}>Belum ada file yang diupload</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {nilaiUploads.map(u => (
                <div key={u.id} style={{ borderRadius: 11, border: `1px solid ${C.tealXL}`, background: C.white, overflow: 'hidden', transition: 'box-shadow .2s' }}>
                  {/* Header file */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderBottom: `1px solid ${C.tealXL}` }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: u.filename.endsWith('.csv') ? C.tealXL : C.purpleL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                      {u.filename.endsWith('.csv') ? '📊' : '📗'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.dark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.filename}</div>
                      <div style={{ fontSize: 9, color: C.slate, marginTop: 1 }}>{u.siswa} siswa · {u.tanggal}</div>
                    </div>
                    {/* <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, fontWeight: 700, flexShrink: 0, background: u.status === 'Selesai' ? C.greenL : C.amberL, color: u.status === 'Selesai' ? C.green : C.orange }}>
                      {u.status === 'Selesai' ? '✅ Aktif' : '⏳ Proses'}
                    </span> */}

                    {/* ── Tombol Hapus ── */}
                    {confirmDeleteId === u.id ? (
                      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                        <button onClick={() => handleDelete(u.id)}
                          style={{ padding: '3px 8px', borderRadius: 6, border: 'none', background: C.red, color: C.white, fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                          Hapus
                        </button>
                        <button onClick={() => setConfirmDeleteId(null)}
                          style={{ padding: '3px 8px', borderRadius: 6, border: `1px solid ${C.tealXL}`, background: 'none', color: C.slate, fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}>
                          Batal
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDeleteId(u.id)}
                        title="Hapus file ini"
                        style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 7, border: `1px solid ${C.tealXL}`, background: 'none', cursor: 'pointer', fontSize: 13, color: C.slate, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = C.redL; e.currentTarget.style.borderColor = C.red; e.currentTarget.style.color = C.red; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = C.tealXL; e.currentTarget.style.color = C.slate; }}>
                        🗑
                      </button>
                    )}
                  </div>

                  {/* Metadata tags */}
                  <div style={{ padding: '8px 12px', background: C.cream, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {[
                      { icon: '🎓', val: u.tingkat ? `Kelas ${u.tingkat}` : u.kelas },
                      { icon: u.mapelIcon || '📋', val: u.mapel || '—', color: u.mapelColor },
                      { icon: '📌', val: u.topik || '—' },
                    ].map((tag, ti) => (
                      <span key={ti} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: C.white, border: `1px solid ${C.tealXL}`, color: tag.color || C.darkL, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>{tag.icon}</span>{tag.val}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default UploadSection;
