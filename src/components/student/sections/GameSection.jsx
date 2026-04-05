/**
 * SR MVP — GameSection (REVISED)
 * src/components/student/sections/GameSection.jsx
 *
 * Perubahan:
 *  - Hapus play modal
 *  - Klik "Lanjutkan" / "Mulai Game" → full overlay preview game
 *  - Overlay punya tombol Back untuk kembali ke daftar game
 */
import { useState } from 'react';
import { Btn, Card } from '../../shared/UI';
import { C } from '../../../styles/tokens';

const GAMES_GURU = [
  {
    id: 'g1', nama: 'Algebraic Quest', mapelLabel: 'Matematika', mapelIcon: '📐', mapelColor: C.teal,
    icon: '⚔️', bg: '#D4F0F3',
    deskripsi: 'RPG berbasis soal aljabar. Kalahkan musuh dengan menjawab soal persamaan dan fungsi!',
    skorSiswa: 870, bestSkor: 1200, pemain: 24,
    kategori: 'RPG', level: 'Menengah', soalPerLevel: 5,
  },
  {
    id: 'g2', nama: 'EcoWorld Explorer', mapelLabel: 'Biologi', mapelIcon: '🧬', mapelColor: C.green,
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
    id: 'g4', nama: 'Atom Builder', mapelLabel: 'Kimia', mapelIcon: '🧪', mapelColor: '#805AD5',
    icon: '⚗️', bg: '#E9D8FD',
    deskripsi: 'Susun proton, neutron, dan elektron untuk membentuk atom — jawab soal struktur atom!',
    skorSiswa: 0, bestSkor: 600, pemain: 15,
    kategori: 'Puzzle', level: 'Dasar', soalPerLevel: 6,
  },
];

const GAMES_AVAILABLE = GAMES_GURU.length > 0;

const TAB_OPTS = [
  { id: 'all', label: 'Semua' },
  { id: 'active', label: 'Sudah Mulai' },
  { id: 'baru', label: 'Belum Mulai' },
];

/* ── Game Overlay: preview full container ─────────────────────────────────── */
const GameOverlay = ({ game, onBack }) => (
  <div style={{
    position: 'absolute', inset: 0, zIndex: 50,
    background: C.white, display: 'flex', flexDirection: 'column',
    borderRadius: 'inherit', overflow: 'hidden',
  }}>
    {/* Top bar */}
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
      borderBottom: `2px solid ${game.mapelColor}22`,
      background: `linear-gradient(135deg,${game.mapelColor}0d,${game.mapelColor}04)`,
    }}>
      <button onClick={onBack} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 14px', borderRadius: 99, border: `1.5px solid ${game.mapelColor}44`,
        background: C.white, color: game.mapelColor, fontWeight: 700, fontSize: 12,
        cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = `${game.mapelColor}12`; }}
        onMouseLeave={e => { e.currentTarget.style.background = C.white; }}
      >
        ← Kembali
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: game.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
          {game.icon}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.dark }}>{game.nama}</div>
          <div style={{ fontSize: 11, color: game.mapelColor, fontWeight: 600 }}>{game.mapelIcon} {game.mapelLabel} · {game.kategori}</div>
        </div>
      </div>

      {game.skorSiswa > 0 && (
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: C.slate }}>Skor Kamu</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: game.mapelColor }}>{game.skorSiswa.toLocaleString()}</div>
        </div>
      )}
    </div>

    {/* Game area */}
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, background: `${game.mapelColor}05` }}>
      {/* Game frame placeholder */}
      <div style={{
        width: '100%', maxWidth: 480,
        background: C.white, borderRadius: 20,
        border: `2px dashed ${game.mapelColor}44`,
        padding: 40, textAlign: 'center',
        boxShadow: `0 8px 32px ${game.mapelColor}18`,
      }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>{game.icon}</div>
        <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 22, fontWeight: 600, color: C.dark, marginBottom: 8 }}>
          {game.nama}
        </div>
        <div style={{ fontSize: 13, color: C.darkL, lineHeight: 1.7, marginBottom: 20 }}>
          {game.deskripsi}
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, justifyContent: 'center' }}>
          {[
            { label: 'Kategori', value: game.kategori },
            { label: 'Level', value: game.level },
            { label: 'Soal/Level', value: game.soalPerLevel },
            { label: 'Pemain', value: game.pemain },
          ].map(s => (
            <div key={s.label} style={{ background: `${game.mapelColor}0f`, borderRadius: 10, padding: '8px 12px', textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: game.mapelColor }}>{s.value}</div>
              <div style={{ fontSize: 10, color: C.slate }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background: C.tealXL, borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 12, color: C.teal, lineHeight: 1.6 }}>
          🎮 <strong>Game engine sedang dimuat.</strong><br />
          <span style={{ fontSize: 11, color: C.slate }}>Integrasi penuh tersedia di fase berikutnya.</span>
        </div>

        <Btn variant="primary" style={{
          width: '100%', justifyContent: 'center', fontSize: 14,
          background: `linear-gradient(135deg,${game.mapelColor},${game.mapelColor}cc)`,
          padding: '12px 0',
        }}>
          {game.skorSiswa > 0 ? '▶ Lanjutkan Bermain' : '🎮 Mulai Sekarang'}
        </Btn>
      </div>
    </div>
  </div>
);

/* ── Main component ─────────────────────────────────────────────────────────── */
export default function GameSection() {
  const [tab, setTab] = useState('all');
  const [activeGame, setActiveGame] = useState(null); // game yang sedang di-preview

  const filtered = GAMES_GURU.filter(g => {
    if (tab === 'active') return g.skorSiswa > 0;
    if (tab === 'baru') return g.skorSiswa === 0;
    return true;
  });

  /* ── CASE B: Tidak ada game ─────────────────────────────────── */
  if (!GAMES_AVAILABLE) return (
    <div style={{ overflowY: 'auto', height: '100%', padding: '20px 22px' }}>
      <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 20, fontWeight: 600, color: C.dark, marginBottom: 4 }}>🎮 Game Edukasi</div>
      <div style={{ fontSize: 12, color: C.slate, marginBottom: 24 }}>Belajar sambil bermain!</div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', background: C.white, borderRadius: 18, border: `2px dashed ${C.tealXL}`, textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 16 }}>🎮</div>
        <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 20, fontWeight: 600, color: C.dark, marginBottom: 8 }}>Game Belum Tersedia</div>
        <div style={{ fontSize: 13, color: C.darkL, maxWidth: 360, lineHeight: 1.7 }}>
          Gurumu belum membuat game untuk kelas ini. Nantikan game seru yang akan segera hadir!
        </div>
      </div>
    </div>
  );

  /* ── CASE A: Game tersedia ──────────────────────────────────── */
  return (
    <div style={{ position: 'relative', overflowY: activeGame ? 'hidden' : 'auto', height: '100%', padding: activeGame ? 0 : '20px 22px' }}>

      {/* Game overlay (full container) */}
      {activeGame && (
        <GameOverlay game={activeGame} onBack={() => setActiveGame(null)} />
      )}

      {/* List view */}
      <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 20, fontWeight: 600, color: C.dark, marginBottom: 4 }}>🎮 Game Edukasi</div>
      <div style={{ fontSize: 12, color: C.slate, marginBottom: 16 }}>Belajar sambil bermain — skor direkam oleh guru!</div>

      {/* Tab filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {TAB_OPTS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              padding: '7px 14px', borderRadius: 99, border: `1.5px solid ${tab === t.id ? C.purple : C.tealXL}`,
              background: tab === t.id ? C.purple : C.white, color: tab === t.id ? C.white : C.darkL,
              fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s',
            }}>
            {t.label}
            {t.id === 'all' && (
              <span style={{ marginLeft: 5, fontSize: 9, background: tab === 'all' ? 'rgba(255,255,255,.2)' : C.tealXL, padding: '1px 5px', borderRadius: 99 }}>
                {GAMES_GURU.length}
              </span>
            )}
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
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: g.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                    {g.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: C.dark }}>{g.nama}</div>
                    <div style={{ fontSize: 11, color: g.mapelColor, fontWeight: 700 }}>{g.mapelIcon} {g.mapelLabel}</div>
                    <div style={{ fontSize: 10, color: C.slate, marginTop: 1 }}>{g.kategori} · Level {g.level}</div>
                  </div>
                  <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 99, background: C.amberL, color: C.orange, fontWeight: 700, flexShrink: 0 }}>👨‍🏫 Guru</span>
                </div>

                {/* Skor siswa (jika sudah pernah main) */}
                {g.skorSiswa > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <div style={{ flex: 1, background: `${g.mapelColor}0f`, borderRadius: 8, padding: '6px 10px', textAlign: 'center' }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: g.mapelColor }}>{g.skorSiswa.toLocaleString()}</div>
                      <div style={{ fontSize: 9, color: C.slate }}>Skor Kamu</div>
                    </div>
                    <div style={{ flex: 1, background: '#F7FAFC', borderRadius: 8, padding: '6px 10px', textAlign: 'center' }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: C.dark }}>{g.bestSkor.toLocaleString()}</div>
                      <div style={{ fontSize: 9, color: C.slate }}>Terbaik</div>
                    </div>
                  </div>
                )}

                <div style={{ fontSize: 12, color: C.darkL, lineHeight: 1.5, marginBottom: 12 }}>{g.deskripsi}</div>

                <Btn
                  variant="primary"
                  onClick={() => setActiveGame(g)}
                  style={{ width: '100%', justifyContent: 'center', background: `linear-gradient(135deg,${g.mapelColor},${g.mapelColor}cc)` }}
                >
                  {g.skorSiswa > 0 ? '▶ Lanjutkan' : '🎮 Mulai Game'}
                </Btn>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
