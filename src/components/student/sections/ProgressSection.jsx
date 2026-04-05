/**
 * SR MVP — ProgressSection (REVISED)
 * src/components/student/sections/ProgressSection.jsx
 *
 * Fitur baru:
 *  - List semua mapel IPA + Umum (sesuai kelas X IPA 1 Budi Santoso)
 *  - Per mapel bisa di-expand → tampil daftar subMateri
 *  - Status per subMateri: selesai (✅), sedang belajar (🔄), belum dipelajari (⬜)
 *  - Selesai = sudah mengerjakan quiz (quizDone di progressData)
 *  - Siswa bisa klik subMateri mana saja untuk mulai/lanjutkan belajar
 */
import { useState } from 'react';
import { C } from '../../../styles/tokens';
import { ADMIN_MAPEL_LIST_MIPA, ADMIN_MAPEL_LIST_UMUM } from '../../../data/masterData';

// ── Kurikulum X IPA: semua subMateri per mapel ──────────────────────────────
const KURIKULUM_IPA = {
  mat: ['Aljabar Dasar', 'Persamaan & Pertidaksamaan', 'Fungsi & Grafik', 'Statistika & Peluang'],
  fis: ['Gerak Lurus', 'Hukum Newton', 'Usaha & Energi', 'Gelombang & Optik'],
  kim: ['Struktur Atom', 'Sistem Periodik', 'Reaksi Kimia', 'Stoikiometri'],
  bio: ['Sel & Jaringan', 'Sistem Organ', 'Genetika', 'Ekosistem'],
  bin: ['Teks Argumentasi', 'Puisi & Prosa', 'Surat Dinas', 'Debat'],
  eng: ['Reading Comprehension', 'Writing Skills', 'Grammar Essentials', 'Speaking & Listening'],
  ppkn: ['Pancasila & UUD 1945', 'Hak & Kewajiban', 'Demokrasi', 'Wawasan Kebangsaan'],
  pjok: ['Kebugaran Jasmani', 'Permainan Bola Besar', 'Permainan Bola Kecil', 'Senam & Renang'],
};

// Urutan tampil: MIPA dulu, lalu mapel umum yang ada di kurikulum
const MAPEL_IPA_LIST = [
  ...ADMIN_MAPEL_LIST_MIPA,
  ...ADMIN_MAPEL_LIST_UMUM.filter(m => KURIKULUM_IPA[m.id]),
];

// ── Status helpers ───────────────────────────────────────────────────────────
const getStatus = (mapelId, subMateri, progressData) => {
  const selesai = progressData.sudahSelesai.find(
    m => m.mapelId === mapelId && m.subMateri === subMateri
  );
  if (selesai) return { key: 'done', label: 'Selesai', emoji: '✅', color: C.green, bg: C.greenL };

  const ongoing = progressData.belumSelesai.find(
    m => m.mapelId === mapelId && m.subMateri === subMateri
  );
  if (ongoing) return { key: 'ongoing', label: 'Sedang Belajar', emoji: '🔄', color: C.orange, bg: C.amberL };

  return { key: 'untouched', label: 'Belum Dipelajari', emoji: '⬜', color: C.slate, bg: '#F1F5F9' };
};

const getMapelStats = (mapelId, progressData) => {
  const subs = KURIKULUM_IPA[mapelId] || [];
  const done = subs.filter(sub =>
    progressData.sudahSelesai.find(m => m.mapelId === mapelId && m.subMateri === sub)
  ).length;
  const ongoing = subs.filter(sub =>
    progressData.belumSelesai.find(m => m.mapelId === mapelId && m.subMateri === sub)
  ).length;
  return { done, ongoing, total: subs.length };
};

// ── MapelRow: satu baris mapel yang bisa di-expand ───────────────────────────
const MapelRow = ({ mapel, progressData, openChatWithWebcam, isOpen, onToggle }) => {
  const subs = KURIKULUM_IPA[mapel.id] || [];
  const stats = getMapelStats(mapel.id, progressData);
  const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div style={{
      background: C.white, borderRadius: 14,
      border: `1.5px solid ${isOpen ? mapel.color + '44' : '#E2E8F0'}`,
      overflow: 'hidden',
      transition: 'border-color .2s, box-shadow .2s',
      boxShadow: isOpen ? `0 4px 16px ${mapel.color}18` : 'none',
    }}>
      {/* Mapel header */}
      <div
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
          cursor: 'pointer', userSelect: 'none',
          background: isOpen ? `${mapel.color}08` : 'transparent',
        }}
      >
        <div style={{
          width: 40, height: 40, borderRadius: 11, flexShrink: 0,
          background: `${mapel.color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
        }}>
          {mapel.icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: C.dark }}>{mapel.label}</span>
            {stats.done === stats.total && stats.total > 0 && (
              <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 99, background: C.greenL, color: C.green, fontWeight: 700 }}>Tuntas 🎉</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 5, borderRadius: 99, background: '#E2E8F0', overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: mapel.color, transition: 'width .4s' }} />
            </div>
            <span style={{ fontSize: 11, color: C.slate, whiteSpace: 'nowrap', minWidth: 60 }}>
              {stats.done}/{stats.total} selesai
            </span>
          </div>
        </div>

        {stats.ongoing > 0 && (
          <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 99, background: C.amberL, color: C.orange, fontWeight: 700, flexShrink: 0 }}>
            🔄 {stats.ongoing}
          </span>
        )}

        <span style={{ color: C.slate, fontSize: 18, transition: 'transform .2s', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', flexShrink: 0, lineHeight: 1 }}>›</span>
      </div>

      {/* Expanded: daftar subMateri */}
      {isOpen && (
        <div style={{ borderTop: `1px solid ${mapel.color}22`, padding: '8px 12px 12px' }}>
          {subs.map((sub, i) => {
            const status = getStatus(mapel.id, sub, progressData);
            return (
              <div
                key={sub}
                onClick={() => openChatWithWebcam({
                  mapelId: mapel.id,
                  mapelLabel: mapel.label,
                  mapelIcon: mapel.icon,
                  mapelColor: mapel.color,
                  subMateri: sub,
                })}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 10px', borderRadius: 10,
                  cursor: 'pointer',
                  marginBottom: i < subs.length - 1 ? 4 : 0,
                  background: 'transparent',
                  transition: 'background .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = `${mapel.color}0d`}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: 16, flexShrink: 0, width: 22, textAlign: 'center' }}>{status.emoji}</span>
                <span style={{
                  flex: 1, fontSize: 13,
                  color: status.key === 'done' ? C.darkL : C.dark,
                  fontWeight: status.key === 'ongoing' ? 600 : 400,
                  textDecoration: status.key === 'done' ? 'none' : 'none',
                }}>
                  {sub}
                </span>
                <span style={{
                  fontSize: 10, padding: '2px 8px', borderRadius: 99,
                  background: status.bg, color: status.color, fontWeight: 700, whiteSpace: 'nowrap',
                }}>
                  {status.label}
                </span>
                <span style={{ color: mapel.color, fontSize: 14, flexShrink: 0 }}>→</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Main component ───────────────────────────────────────────────────────────
const ProgressSection = ({ progressData, openChatWithWebcam }) => {
  const [openMapel, setOpenMapel] = useState('mat');
  const [filterTab, setFilterTab] = useState('all');

  const allSubs = MAPEL_IPA_LIST.flatMap(m =>
    (KURIKULUM_IPA[m.id] || []).map(s => ({ mapelId: m.id, sub: s }))
  );
  const totalDone = allSubs.filter(({ mapelId, sub }) =>
    progressData.sudahSelesai.find(m => m.mapelId === mapelId && m.subMateri === sub)
  ).length;
  const totalOngoing = allSubs.filter(({ mapelId, sub }) =>
    progressData.belumSelesai.find(m => m.mapelId === mapelId && m.subMateri === sub)
  ).length;

  const filteredMapel = MAPEL_IPA_LIST.filter(mapel => {
    if (filterTab === 'all') return true;
    const stats = getMapelStats(mapel.id, progressData);
    if (filterTab === 'ongoing') return stats.ongoing > 0 || (stats.done > 0 && stats.done < stats.total);
    if (filterTab === 'done') return stats.done === stats.total && stats.total > 0;
    return true;
  });

  return (
    <div style={{ overflowY: 'auto', height: '100%', padding: '20px 22px', width: '100%' }}>
      <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 20, fontWeight: 600, color: C.dark, marginBottom: 2 }}>
        📈 Progress Belajarku
      </div>
      <div style={{ fontSize: 12, color: C.slate, marginBottom: 14 }}>
        Kelas X IPA 1 · Klik mapel untuk lihat materi, klik materi untuk mulai belajar
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {[
          { id: 'all', label: 'Semua Mapel' },
          { id: 'ongoing', label: 'Sedang Belajar' },
          { id: 'done', label: 'Tuntas' },
        ].map(t => (
          <button key={t.id} onClick={() => setFilterTab(t.id)}
            style={{
              padding: '6px 14px', borderRadius: 99, border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 12, fontWeight: 700,
              background: filterTab === t.id ? C.teal : '#EDF2F7',
              color: filterTab === t.id ? C.white : C.darkL,
              transition: 'all .2s',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Mapel accordion list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filteredMapel.map(mapel => (
          <MapelRow
            key={mapel.id}
            mapel={mapel}
            progressData={progressData}
            openChatWithWebcam={openChatWithWebcam}
            isOpen={openMapel === mapel.id}
            onToggle={() => setOpenMapel(prev => prev === mapel.id ? null : mapel.id)}
          />
        ))}
        {filteredMapel.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
            <div style={{ fontSize: 14, color: C.slate }}>Tidak ada mapel di kategori ini</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressSection;
