/**
 * SR MVP — GameSection (Portal Guru) — REVISED
 * src/components/teacher/sections/GameSection.jsx
 *
 * Perubahan: field "Tipe Game" dihapus.
 * State: 'idle' | 'generating' | 'preview' | 'published'
 */
import { useState } from 'react';
import { Card, Btn } from '../../shared/UI';
import { C } from '../../../styles/tokens';
import { SUBJECTS, CLASSES } from '../../../data/masterData';

/* ── Preview canvas kosong ─────────────────────────────────────────────── */
const GameCanvas = ({ preview }) => {
  const color = preview?.color || C.teal;
  const icon = preview?.icon || '🎮';
  const nama = preview?.nama || 'Game Edukasi';

  return (
    <div style={{
      width: '100%', aspectRatio: '16/9',
      background: `linear-gradient(135deg, ${color}18 0%, ${color}06 100%)`,
      border: `2px solid ${color}33`, borderRadius: 14,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden', marginBottom: 16,
    }}>
      {/* Grid background */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle, ${color}22 1px, transparent 1px)`, backgroundSize: '28px 28px', opacity: .5 }} />

      {/* Corner markers */}
      <div style={{ position: 'absolute', top: 12, left: 12, width: 40, height: 40, borderTop: `2px solid ${color}44`, borderLeft: `2px solid ${color}44`, borderRadius: '4px 0 0 0' }} />
      <div style={{ position: 'absolute', top: 12, right: 12, width: 40, height: 40, borderTop: `2px solid ${color}44`, borderRight: `2px solid ${color}44`, borderRadius: '0 4px 0 0' }} />
      <div style={{ position: 'absolute', bottom: 12, left: 12, width: 40, height: 40, borderBottom: `2px solid ${color}44`, borderLeft: `2px solid ${color}44`, borderRadius: '0 0 0 4px' }} />
      <div style={{ position: 'absolute', bottom: 12, right: 12, width: 40, height: 40, borderBottom: `2px solid ${color}44`, borderRight: `2px solid ${color}44`, borderRadius: '0 0 4px 0' }} />

      {/* HUD top bar */}
      <div style={{ position: 'absolute', top: 16, left: 56, right: 56, display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ flex: 1, height: 8, borderRadius: 99, background: `${color}20`, overflow: 'hidden' }}>
          <div style={{ width: '68%', height: '100%', background: `linear-gradient(90deg,${color},${color}cc)`, borderRadius: 99 }} />
        </div>
        <span style={{ fontSize: 9, fontWeight: 700, color, whiteSpace: 'nowrap' }}>⭐ 870 pts</span>
      </div>

      {/* Center */}
      <div style={{ position: 'relative', textAlign: 'center', zIndex: 1 }}>
        <div style={{ fontSize: 52, marginBottom: 10, filter: `drop-shadow(0 4px 8px ${color}44)` }}>{icon}</div>
        <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 20, fontWeight: 700, color, marginBottom: 16 }}>{nama}</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${color}15`, border: `1px solid ${color}33`, borderRadius: 99, padding: '5px 14px' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: `${color}88`, animation: 'pulse 1.5s infinite' }} />
          <span style={{ fontSize: 10, fontWeight: 600, color, opacity: .8 }}>Preview — Game Engine siap di-embed</span>
        </div>
      </div>

      {/* Level indicators */}
      <div style={{ position: 'absolute', bottom: 16, left: 56, right: 56, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {['Level 1', 'Level 2', 'Level 3'].map((lv, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: i === 0 ? color : `${color}25`, border: `1px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>
              {i === 0 ? '✓' : i === 1 ? '?' : '🔒'}
            </div>
            <span style={{ fontSize: 8, color, opacity: i === 0 ? 1 : .5 }}>{lv}</span>
          </div>
        ))}
        <div style={{ flex: 1, height: 2, background: `${color}20`, margin: '0 8px', borderRadius: 99 }}>
          <div style={{ width: '33%', height: '100%', background: color, borderRadius: 99 }} />
        </div>
        <span style={{ fontSize: 9, color, opacity: .7 }}>33% selesai</span>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════ */
const GameSection = ({ gameForm, setGameForm, gameGenerating, setGameGenerating, gamePreview, setGamePreview, gameSent, setGameSent }) => {
  const [phase, setPhase] = useState('idle'); // 'idle' | 'generating' | 'preview' | 'published'

  const handleGenerate = () => {
    if (!gameForm.topik || !gameForm.mapel) return;
    setPhase('generating');
    setGameGenerating(true);
    setGamePreview(null);
    setGameSent(false);

    setTimeout(() => {
      const subj = SUBJECTS.find(s => s.id === gameForm.mapel);
      setGamePreview({
        nama: gameForm.topik ? `${gameForm.topik} Quest` : 'Edu Adventure',
        mapel: subj?.label || 'Matematika',
        icon: subj?.icon || '📐',
        color: subj?.color || C.teal,
        deskripsi: gameForm.prompt || `Game edukasi interaktif tentang ${gameForm.topik}.`,
        soalCount: 10, estimasi: '15–25 menit',
        kelas: gameForm.kelas
          ? CLASSES.find(c => c.id === gameForm.kelas)?.label
          : 'Semua kelas yang diajar',
      });
      setGameGenerating(false);
      setPhase('preview');
    }, 2500);
  };

  const handlePublish = () => { setGameSent(true); setPhase('published'); };
  const handleUlangi = () => { setGamePreview(null); setGameSent(false); setPhase('idle'); };

  const formValid = gameForm.topik.trim() && gameForm.mapel;

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
      <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 20, fontWeight: 600, color: C.dark, marginBottom: 4 }}>
        🎮 Buat Game Edukasi
      </div>
      <div style={{ fontSize: 12, color: C.slate, marginBottom: 20 }}>
        Deskripsikan game yang ingin dibuat. <strong style={{ color: C.teal }}>AI Agent</strong> akan men-generate game interaktif untuk siswa.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 20, alignItems: 'start' }}>

        {/* ── Form konfigurasi ── */}
        <Card style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: 16 }}>⚙️ Konfigurasi Game</div>

          {/* Mata Pelajaran */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.dark, display: 'block', marginBottom: 5 }}>
              Mata Pelajaran <span style={{ color: C.red }}>*</span>
            </label>
            <select value={gameForm.mapel} onChange={e => setGameForm(p => ({ ...p, mapel: e.target.value }))}
              style={{ width: '100%', padding: '9px 12px', border: `1.5px solid ${C.tealXL}`, borderRadius: 9, fontSize: 13, outline: 'none', background: C.white, color: gameForm.mapel ? C.dark : C.slate }}>
              <option value="">Pilih mata pelajaran...</option>
              {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
            </select>
          </div>

          {/* Topik */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.dark, display: 'block', marginBottom: 5 }}>
              Topik / Sub-materi <span style={{ color: C.red }}>*</span>
            </label>
            <input value={gameForm.topik} onChange={e => setGameForm(p => ({ ...p, topik: e.target.value }))}
              placeholder="Contoh: Persamaan Linear, Ekosistem..."
              style={{ width: '100%', padding: '9px 12px', border: `1.5px solid ${C.tealXL}`, borderRadius: 9, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = C.teal}
              onBlur={e => e.target.style.borderColor = C.tealXL} />
          </div>

          {/* Kelas tujuan */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.dark, display: 'block', marginBottom: 5 }}>Dikirim ke Kelas</label>
            <select value={gameForm.kelas} onChange={e => setGameForm(p => ({ ...p, kelas: e.target.value }))}
              style={{ width: '100%', padding: '9px 12px', border: `1.5px solid ${C.tealXL}`, borderRadius: 9, fontSize: 13, outline: 'none', background: C.white }}>
              <option value="">Semua kelas yang diajar</option>
              {CLASSES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>

          {/* Prompt */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.dark, display: 'block', marginBottom: 5 }}>
              Prompt / Deskripsi Game{' '}
              <span style={{ fontSize: 10, color: C.slate, fontWeight: 400 }}>(opsional)</span>
            </label>
            <textarea value={gameForm.prompt} onChange={e => setGameForm(p => ({ ...p, prompt: e.target.value }))}
              placeholder="Contoh: Buat game dimana siswa harus menyelesaikan soal untuk naik level. Ada 10 soal dengan tingkat kesulitan meningkat."
              rows={5} style={{ width: '100%', padding: '9px 12px', border: `1.5px solid ${C.tealXL}`, borderRadius: 9, fontSize: 13, outline: 'none', resize: 'none', lineHeight: 1.5, boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = C.teal}
              onBlur={e => e.target.style.borderColor = C.tealXL} />
          </div>

          <Btn variant="amber" onClick={handleGenerate}
            disabled={gameGenerating || !formValid || phase === 'published'}
            style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: 14 }}>
            {gameGenerating
              ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: C.dark, borderRadius: '50%', animation: 'spin .8s linear infinite' }} /> Generating...</>
              : phase === 'published' ? '✅ Sudah Dipublish' : '🤖 Generate Game'
            }
          </Btn>

          {phase === 'published' && (
            <button onClick={handleUlangi} style={{ width: '100%', marginTop: 8, padding: '9px 0', background: 'none', border: `1.5px solid ${C.tealXL}`, borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, color: C.darkL, fontWeight: 600, transition: 'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.color = C.teal; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.tealXL; e.currentTarget.style.color = C.darkL; }}>
              🔄 Buat Game Baru
            </button>
          )}
        </Card>

        {/* ── Preview ── */}
        <div>
          {/* Idle */}
          {phase === 'idle' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10, color: C.slate, padding: '60px 20px', background: C.white, borderRadius: 16, border: `1.5px dashed ${C.tealXL}` }}>
              <div style={{ fontSize: 52, opacity: .25 }}>🎮</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Preview game akan muncul di sini</div>
              <div style={{ fontSize: 12 }}>Isi form & klik Generate untuk memulai</div>
            </div>
          )}

          {/* Generating */}
          {phase === 'generating' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14, padding: '60px 20px', background: C.white, borderRadius: 16, border: `1.5px solid ${C.tealXL}` }}>
              <div style={{ width: 52, height: 52, border: `4px solid ${C.tealXL}`, borderTopColor: C.teal, borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>Generate game...</div>
              <div style={{ fontSize: 12, color: C.slate }}>AI Agent menyusun level, soal, dan mekanik game</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['Membangun level', 'Generate soal', 'Menyusun mekanik', 'Finalisasi'].map((step, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: i < 2 ? C.teal : C.tealXL, animation: i === 1 ? 'pulse 1s infinite' : 'none' }} />
                    <span style={{ fontSize: 8, color: i < 2 ? C.teal : C.slate }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview + Publish / Ulangi */}
          {(phase === 'preview' || phase === 'published') && gamePreview && (
            <Card style={{ overflow: 'hidden' }}>
              <div style={{ height: 5, background: `linear-gradient(90deg,${gamePreview.color},${gamePreview.color}88)` }} />
              <div style={{ padding: '18px 18px 0' }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: gamePreview.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                    {gamePreview.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 16, color: C.dark }}>{gamePreview.nama}</div>
                    <div style={{ fontSize: 11, color: gamePreview.color, fontWeight: 700 }}>{gamePreview.mapel}</div>
                    <div style={{ fontSize: 10, color: C.slate, marginTop: 2 }}>
                      {gamePreview.soalCount} soal · {gamePreview.estimasi} · {gamePreview.kelas}
                    </div>
                  </div>
                </div>
              </div>

              {/* Canvas preview */}
              <div style={{ padding: '0 18px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.slate, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                  📺 Preview Tampilan Game
                </div>
                <GameCanvas preview={gamePreview} />
              </div>

              <div style={{ padding: '0 18px 16px' }}>
                <div style={{ fontSize: 12, color: C.darkL, lineHeight: 1.6, marginBottom: 12 }}>{gamePreview.deskripsi}</div>

                {/* Tombol Ulangi / Publish */}
                {phase === 'preview' && (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={handleUlangi} style={{
                      flex: 1, padding: '11px 0', borderRadius: 10,
                      border: `1.5px solid ${C.tealXL}`, background: C.white,
                      color: C.darkL, fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all .2s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = C.cream; e.currentTarget.style.borderColor = C.tealL; e.currentTarget.style.color = C.dark; }}
                      onMouseLeave={e => { e.currentTarget.style.background = C.white; e.currentTarget.style.borderColor = C.tealXL; e.currentTarget.style.color = C.darkL; }}>
                      🔄 Ulangi
                    </button>
                    <Btn variant="primary" onClick={handlePublish}
                      style={{ flex: 2, justifyContent: 'center', padding: '11px', fontSize: 13 }}>
                      🚀 Publish ke Siswa
                    </Btn>
                  </div>
                )}

                {/* Berhasil dipublish */}
                {phase === 'published' && (
                  <div style={{ background: C.greenL, borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>✅</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.green, marginBottom: 3 }}>Game berhasil dipublish!</div>
                    <div style={{ fontSize: 11, color: C.green, opacity: .8, marginBottom: 10 }}>
                      Dikirim ke: <strong>{gamePreview.kelas}</strong>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameSection;
