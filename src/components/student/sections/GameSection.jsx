/**
 * SR MVP — GameSection (REVISED)
 * src/components/student/sections/GameSection.jsx
 *
 * Semua game buatan guru.
 * Dua case: (A) game tersedia, (B) game tidak tersedia.
 */
import { useState } from 'react';
import { Btn, Card, ProgressBar } from '../../shared/UI';
import { C } from '../../../styles/tokens';

/* ── Data game (semua buatan guru) ─────────────────────────────────────── */
const GAMES_GURU = [
  {
    id: 'g1', nama: 'Algebraic Quest', mapelLabel: 'Matematika', mapelIcon: '📐', mapelColor: C.teal,
    icon: '⚔️', bg: '#D4F0F3',
    deskripsi: 'RPG berbasis soal aljabar. Kalahkan musuh dengan menjawab soal persamaan dan fungsi!',
    skorSiswa: 870, bestSkor: 1200, pemain: 24,
    kategori: 'RPG', level: 'Menengah', soalPerLevel: 5,
  },
  {
    id: 'g2', nama: 'EcoWorld Explorer', mapelLabel: 'IPA', mapelIcon: '🔬', mapelColor: C.green,
    icon: '🌿', bg: '#C6F6D5',
    deskripsi: 'Jelajahi ekosistem virtual dan pelajari rantai makanan serta interaksi organisme.',
    skorSiswa: 450, bestSkor: 800, pemain: 18,
    kategori: 'Simulasi', level: 'Dasar', soalPerLevel: 8,
  },
  {
    id: 'g3', nama: 'Word Battle', mapelLabel: 'B. Indonesia', mapelIcon: '📖', mapelColor: C.purple,
    icon: '📝', bg: '#E9D8FD',
    deskripsi: 'Battle menulis teks — tulis argumen terbaik untuk mengalahkan lawan dalam waktu singkat.',
    skorSiswa: 320, bestSkor: 560, pemain: 12,
    kategori: 'Kompetisi', level: 'Menengah', soalPerLevel: 3,
  },
  {
    id: 'g4', nama: 'History Map', mapelLabel: 'IPS', mapelIcon: '🌍', mapelColor: C.orange,
    icon: '🗺️', bg: '#FEEBC8',
    deskripsi: 'Tempatkan kerajaan-kerajaan Nusantara di peta dan jawab soal sejarah!',
    skorSiswa: 210, bestSkor: 400, pemain: 20,
    kategori: 'Puzzle', level: 'Dasar', soalPerLevel: 10,
  },
];

/* ── Toggle: ubah ke true = simulasi "tidak ada game" ──────────────────── */
const GAMES_AVAILABLE = GAMES_GURU.length > 0;  // set false untuk test empty state

const TAB_OPTS = [
  { id: 'all', label: 'Semua' },
  { id: 'active', label: 'Sudah Mulai' },
  { id: 'baru', label: 'Belum Mulai' },
];

export default function GameSection() {
  const [tab, setTab] = useState('all');
  const [playModal, setPlayModal] = useState(null);

  const filtered = GAMES_GURU.filter(g => {
    if (tab === 'active') return g.skorSiswa > 0;
    if (tab === 'baru') return g.skorSiswa === 0;
    return true;
  });

  /* ── CASE B: Tidak ada game ─────────────────────────────────── */
  if (!GAMES_AVAILABLE) return (
    <div style={{ overflowY: 'auto', height: '100%', padding: '20px 22px' }}>
      <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 20, fontWeight: 600, color: C.dark, marginBottom: 4 }}>🎮 Game Edukasi</div>
      <div style={{ fontSize: 12, color: C.slate, marginBottom: 24 }}>Belajar sambil bermain — skor direkam oleh guru!</div>

      {/* Empty state */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', background: C.white, borderRadius: 18, border: `2px dashed ${C.tealXL}`, textAlign: 'center', marginBottom: 20 }}>
        <div style={{ width: 88, height: 88, borderRadius: 24, background: `linear-gradient(135deg,${C.purple}18,${C.purple}08)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, marginBottom: 16 }}>🎮</div>
        <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 20, fontWeight: 600, color: C.dark, marginBottom: 8 }}>Game Belum Tersedia</div>
        <div style={{ fontSize: 13, color: C.darkL, maxWidth: 380, lineHeight: 1.7, marginBottom: 16 }}>
          Gurumu belum membuat game untuk kelas ini. Nantikan game seru yang akan segera hadir!
        </div>
        <div style={{ background: C.tealXL, borderRadius: 12, padding: '12px 20px', fontSize: 12, color: C.teal, maxWidth: 380, lineHeight: 1.6 }}>
          💡 Guru dapat membuat game dari menu <strong>Buat Game</strong> di Portal Guru. Game mencakup kuis, RPG, simulasi, dan puzzle.
        </div>
      </div>

      {/* Preview — coming soon */}
      <div style={{ fontWeight: 700, fontSize: 13, color: C.dark, marginBottom: 12 }}>📬 Akan Segera Hadir</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[
          { mapel: 'Matematika', icon: '📐', color: C.teal, desc: 'Algebra Quest — selesaikan soal untuk naik level!', status: 'Dalam pengembangan' },
          { mapel: 'IPA', icon: '🔬', color: C.orange, desc: 'EcoWorld — jelajahi ekosistem virtual', status: 'Dalam pengembangan' },
          { mapel: 'B. Indonesia', icon: '📖', color: C.purple, desc: 'Word Battle — tulis argumen terbaik & menangkan duel', status: 'Segera hadir' },
          { mapel: 'IPS', icon: '🌍', color: C.green, desc: 'History Map — tempatkan kerajaan di peta Nusantara', status: 'Segera hadir' },
        ].map(item => (
          <Card key={item.mapel} style={{ padding: 16, opacity: .65 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{item.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 12, color: C.dark }}>{item.mapel}</div>
                <div style={{ fontSize: 9, color: item.color, fontWeight: 700 }}>👨‍🏫 Buatan Guru · {item.status}</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: C.darkL, lineHeight: 1.5 }}>{item.desc}</div>
          </Card>
        ))}
      </div>
    </div>
  );

  /* ── CASE A: Game tersedia ──────────────────────────────────── */
  return (
    <div style={{ overflowY: 'auto', height: '100%', padding: '20px 22px' }}>
      <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 20, fontWeight: 600, color: C.dark, marginBottom: 4 }}>🎮 Game Edukasi</div>
      <div style={{ fontSize: 12, color: C.slate, marginBottom: 16 }}>Mari Belajar sambil bermain</div>

      {/* Tab filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {TAB_OPTS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '7px 14px', borderRadius: 99, border: `1.5px solid ${tab === t.id ? C.purple : C.tealXL}`, background: tab === t.id ? C.purple : C.white, color: tab === t.id ? C.white : C.darkL, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s' }}>
            {t.label}
            {t.id === 'all' && <span style={{ marginLeft: 5, fontSize: 9, background: tab === 'all' ? 'rgba(255,255,255,.2)' : C.tealXL, padding: '1px 5px', borderRadius: 99 }}>{GAMES_GURU.length}</span>}
          </button>
        ))}
      </div>

      {/* Game cards */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: C.slate, fontSize: 13 }}>
          Tidak ada game di kategori ini.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {filtered.map(g => (
            <Card key={g.id} style={{ overflow: 'hidden', transition: 'transform .2s, box-shadow .2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${g.mapelColor}22`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ height: 5, background: `linear-gradient(90deg,${g.mapelColor},${g.mapelColor}88)` }} />
              <div style={{ padding: 16 }}>
                {/* Header */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: g.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{g.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: C.dark }}>{g.nama}</div>
                    <div style={{ fontSize: 11, color: g.mapelColor, fontWeight: 700 }}>{g.mapelIcon} {g.mapelLabel}</div>
                    <div style={{ fontSize: 10, color: C.slate, marginTop: 1 }}>{g.kategori} · Level {g.level}</div>
                  </div>
                  <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 99, background: C.amberL, color: C.orange, fontWeight: 700, flexShrink: 0 }}>👨‍🏫 Guru</span>
                </div>

                <div style={{ fontSize: 12, color: C.darkL, lineHeight: 1.5, marginBottom: 12 }}>{g.deskripsi}</div>

                <Btn variant="primary" onClick={() => setPlayModal(g)}
                  style={{ width: '100%', justifyContent: 'center', background: `linear-gradient(135deg,${g.mapelColor},${g.mapelColor}cc)` }}>
                  {g.skorSiswa > 0 ? '▶ Lanjutkan' : '🎮 Mulai Game'}
                </Btn>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Play modal */}
      {playModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div className="bounce-in" style={{ background: C.white, borderRadius: 20, padding: 32, width: '100%', maxWidth: 420, textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,.3)' }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>{playModal.icon}</div>
            <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 22, fontWeight: 600, color: C.dark, marginBottom: 4 }}>{playModal.nama}</div>
            <div style={{ fontSize: 11, color: C.orange, fontWeight: 700, marginBottom: 8 }}>👨‍🏫 Buatan Guru · {playModal.kategori}</div>
            <div style={{ fontSize: 12, color: C.darkL, marginBottom: 16, lineHeight: 1.6 }}>{playModal.deskripsi}</div>

            <div style={{ background: C.tealXL, borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 11, color: C.teal }}>
              🎮 Game engine sedang dimuat...<br />
              <span style={{ fontSize: 10, color: C.slate }}>Integrasi game engine tersedia di fase berikutnya.</span>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <Btn variant="ghost" onClick={() => setPlayModal(null)} style={{ flex: 1, justifyContent: 'center' }}>Tutup</Btn>
              <Btn variant="primary" style={{ flex: 2, justifyContent: 'center', background: `linear-gradient(135deg,${playModal.mapelColor},${playModal.mapelColor}cc)` }}>
                ▶ {playModal.skorSiswa > 0 ? 'Lanjutkan Bermain' : 'Mulai Sekarang'}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
