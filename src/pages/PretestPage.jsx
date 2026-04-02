/**
 * SR MVP — PretestPage (RANCANGAN BARU — 3 Tahap)
 * src/pages/PretestPage.jsx
 *
 * Tahap 1 : Siswa centang mapel yang dirasa kurang (multi-select)
 * Tahap 2 : Per mapel terpilih → soal pilihan ganda dari PRETEST_QUESTIONS
 * Tahap 3 : Topik yang salah → kartu rekomendasi → navigate ke dashboard
 *           dengan pretestResult.wrongTopics
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { C } from '../styles/tokens';
import { Btn, Card, ProgressBar } from '../components/shared/UI';
import { SUBJECTS, PRETEST_QUESTIONS } from '../data/masterData';

const MAPEL_META = {
  mat: { label: 'Matematika', icon: '📐', color: C.teal, desc: 'Aljabar, Persamaan, Statistika, dll.' },
  ipa: { label: 'IPA', icon: '🔬', color: C.orange, desc: 'Ekosistem, Sel, Fisika, Kimia, dll.' },
  bin: { label: 'B. Indonesia', icon: '📖', color: C.purple, desc: 'Teks, Puisi, Surat, Debat, dll.' },
  ips: { label: 'IPS', icon: '🌍', color: C.green, desc: 'Sejarah, Geografi, Ekonomi, dll.' },
};
const MAPEL_IDS = ['mat', 'ipa', 'bin', 'ips'];

const buildSoalList = (selectedMapels) => {
  const list = [];
  selectedMapels.forEach(mid => {
    (PRETEST_QUESTIONS[mid] || []).forEach((q) => {
      list.push({ ...q, mapelId: mid });
    });
  });
  return list;
};

export default function PretestPage() {
  const navigate = useNavigate();

  const [stage, setStage] = useState('select');
  const [selectedMapels, setSelectedMapels] = useState([]);
  const [soalList, setSoalList] = useState([]);
  const [soalIdx, setSoalIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [chosen, setChosen] = useState(null);

  const toggleMapel = (mid) =>
    setSelectedMapels(prev =>
      prev.includes(mid) ? prev.filter(m => m !== mid) : [...prev, mid]
    );

  const startSoal = () => {
    if (selectedMapels.length === 0) return;
    const list = buildSoalList(selectedMapels);
    setSoalList(list);
    setSoalIdx(0);
    setAnswers({});
    setStage('soal');
  };

  const soalKey = (s) => `${s.mapelId}__${s.subMateri}`;

  const choosePilihan = (piIdx) => {
    const s = soalList[soalIdx];
    const key = soalKey(s);
    if (answers[key] !== undefined) return;
    setChosen(piIdx);
    setAnswers(prev => ({ ...prev, [key]: piIdx }));
    setTimeout(() => {
      setChosen(null);
      if (soalIdx < soalList.length - 1) setSoalIdx(soalIdx + 1);
      else setStage('result');
    }, 450);
  };

  const computeWrongTopics = () => {
    const wrong = [];
    soalList.forEach(s => {
      const key = soalKey(s);
      const userAns = answers[key];
      if (userAns !== s.jawaban) {
        const meta = MAPEL_META[s.mapelId];
        if (!wrong.find(w => w.subMateri === s.subMateri && w.mapelId === s.mapelId)) {
          wrong.push({
            mapelId: s.mapelId,
            mapelLabel: meta.label,
            mapelIcon: meta.icon,
            mapelColor: meta.color,
            subMateri: s.subMateri,
          });
        }
      }
    });
    return wrong;
  };

  const handleMulaiBelajar = () => {
    const wrongTopics = computeWrongTopics();
    navigate('/siswa', { state: { pretestResult: { wrongTopics } } });
  };

  /* ── TAHAP 1: PILIH MAPEL ─────────────────────────────────── */
  if (stage === 'select') return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg,${C.teal}18,${C.cream} 40%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="bounce-in" style={{ maxWidth: 540, width: '100%' }}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 52, marginBottom: 10 }}>🎯</div>
          <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 24, fontWeight: 600, color: C.dark, marginBottom: 8 }}>
            Pretest Awal — Kenali Kelemahanmu
          </div>
          <div style={{ fontSize: 13, color: C.darkL, lineHeight: 1.7 }}>
            Pilih mata pelajaran yang <strong>kamu rasa masih kurang</strong>.<br />
            Kamu akan diberi beberapa soal untuk mengetahui topik mana yang perlu diperkuat.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          {MAPEL_IDS.map(mid => {
            const m = MAPEL_META[mid];
            const selected = selectedMapels.includes(mid);
            return (
              <button key={mid} onClick={() => toggleMapel(mid)} style={{
                padding: '18px 16px', borderRadius: 14,
                border: `2px solid ${selected ? m.color : C.tealXL}`,
                background: selected ? `${m.color}12` : C.white,
                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                transition: 'all .2s', position: 'relative',
              }}
                onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor = m.color; e.currentTarget.style.background = `${m.color}06`; } }}
                onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = C.tealXL; e.currentTarget.style.background = C.white; } }}>
                <div style={{
                  position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: '50%',
                  background: selected ? m.color : 'transparent', border: `2px solid ${selected ? m.color : C.tealXL}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: C.white, transition: 'all .2s',
                }}>{selected && '✓'}</div>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{m.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: selected ? m.color : C.dark, marginBottom: 4 }}>{m.label}</div>
                <div style={{ fontSize: 11, color: C.slate, lineHeight: 1.4 }}>{m.desc}</div>
              </button>
            );
          })}
        </div>

        {selectedMapels.length > 0 && (
          <div className="fade-in" style={{ background: C.tealXL, borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: C.teal, display: 'flex', gap: 8 }}>
            <span>📝</span>
            <span>Kamu akan mengerjakan <strong>{selectedMapels.reduce((acc, mid) => acc + (PRETEST_QUESTIONS[mid]?.length || 0), 0)} soal</strong> dari {selectedMapels.length} mata pelajaran terpilih.</span>
          </div>
        )}

        <Btn variant="amber" onClick={startSoal} disabled={selectedMapels.length === 0}
          style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 15, opacity: selectedMapels.length === 0 ? .5 : 1 }}>
          {selectedMapels.length === 0 ? 'Pilih minimal 1 mapel' : `Mulai Pretest (${selectedMapels.length} mapel) →`}
        </Btn>

        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <button onClick={() => navigate('/siswa', { replace: true })}
            style={{ background: 'none', border: 'none', fontSize: 12, color: C.slate, cursor: 'pointer', textDecoration: 'underline' }}>
            Lewati — langsung ke dashboard
          </button>
        </div>
      </div>
    </div>
  );

  /* ── TAHAP 2: SOAL ────────────────────────────────────────── */
  if (stage === 'soal') {
    const s = soalList[soalIdx];
    const meta = MAPEL_META[s.mapelId];
    const key = soalKey(s);
    const done = Object.keys(answers).length;
    const total = soalList.length;
    const mapelsInSoal = [...new Set(soalList.map(q => q.mapelId))];

    return (
      <div style={{ minHeight: '100vh', background: `linear-gradient(160deg,${meta.color}12,${C.cream} 40%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 560 }}>

          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: meta.color, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>
              Pretest — Soal Pengetahuan
            </div>
            <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 20, fontWeight: 600, color: C.dark }}>
              Jawab Sesuai Kemampuanmu ✍️
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <ProgressBar value={(done / total) * 100} height={7} color={meta.color} />
            <span style={{ fontSize: 12, fontWeight: 700, color: meta.color, whiteSpace: 'nowrap' }}>{done}/{total}</span>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
            {mapelsInSoal.map(mid => {
              const mm = MAPEL_META[mid];
              const isActive = mid === s.mapelId;
              const soalForMapel = soalList.filter(q => q.mapelId === mid);
              const doneForMapel = soalForMapel.filter(q => answers[soalKey(q)] !== undefined).length;
              const isDone = doneForMapel === soalForMapel.length;
              return (
                <div key={mid} style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 99,
                  fontSize: 11, fontWeight: 600,
                  background: isDone ? `${mm.color}22` : isActive ? mm.color : C.cream,
                  color: isDone ? mm.color : isActive ? C.white : C.slate,
                  border: `1.5px solid ${isActive ? mm.color : C.tealXL}`, transition: 'all .3s',
                }}>
                  <span>{mm.icon}</span><span>{mm.label}</span>
                  {isDone && <span style={{ fontSize: 10 }}>✓</span>}
                </div>
              );
            })}
          </div>

          <Card style={{ padding: 28 }} key={soalIdx}>
            <div className="fade-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${meta.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  {meta.icon}
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: meta.color, textTransform: 'uppercase', letterSpacing: 1.2 }}>{meta.label}</div>
                  <div style={{ fontSize: 11, color: C.slate }}>Topik: <strong style={{ color: C.dark }}>{s.subMateri}</strong></div>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: 11, color: C.slate }}>Soal {soalIdx + 1}/{total}</div>
              </div>

              <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 17, fontWeight: 600, color: C.dark, lineHeight: 1.6, marginBottom: 20 }}>
                {s.soal}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {s.pilihan.map((p, pi) => {
                  const isChosen = chosen === pi || answers[key] === pi;
                  return (
                    <button key={pi} onClick={() => answers[key] === undefined && choosePilihan(pi)} style={{
                      textAlign: 'left', padding: '11px 16px', borderRadius: 10,
                      border: `2px solid ${isChosen ? meta.color : C.tealXL}`,
                      background: isChosen ? `${meta.color}12` : C.white,
                      cursor: answers[key] !== undefined ? 'default' : 'pointer',
                      fontFamily: 'inherit', fontSize: 13,
                      color: isChosen ? meta.color : C.dark,
                      fontWeight: isChosen ? 700 : 400,
                      transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 10,
                    }}
                      onMouseEnter={e => { if (answers[key] === undefined && !isChosen) { e.currentTarget.style.borderColor = meta.color; e.currentTarget.style.background = `${meta.color}06`; } }}
                      onMouseLeave={e => { if (!isChosen) { e.currentTarget.style.borderColor = C.tealXL; e.currentTarget.style.background = C.white; } }}>
                      <span style={{
                        width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 800,
                        background: isChosen ? meta.color : C.cream,
                        color: isChosen ? C.white : C.slate, transition: 'all .2s',
                      }}>{String.fromCharCode(65 + pi)}</span>
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          {soalIdx > 0 && answers[key] === undefined && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
              <button onClick={() => setSoalIdx(soalIdx - 1)}
                style={{ background: 'none', border: 'none', fontSize: 13, color: C.slate, cursor: 'pointer', textDecoration: 'underline' }}>
                ← Kembali ke soal sebelumnya
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── TAHAP 3: HASIL ───────────────────────────────────────── */
  const wrongTopics = computeWrongTopics();
  const correctCount = soalList.length - wrongTopics.length;
  const pctCorrect = Math.round((correctCount / soalList.length) * 100);

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg,${C.teal}18,${C.cream} 40%)`, display: 'flex', alignItems: 'flex-start', overflowY: 'auto', justifyContent: 'center', padding: 24 }}>
      <div className="bounce-in" style={{ maxWidth: 540, width: '100%' }}>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 52, marginBottom: 8 }}>
            {pctCorrect >= 70 ? '🌟' : pctCorrect >= 40 ? '📊' : '💪'}
          </div>
          <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 24, fontWeight: 600, color: C.dark }}>
            Hasil Pretestmu!
          </div>
          <div style={{ fontSize: 13, color: C.darkL, marginTop: 6, lineHeight: 1.6 }}>
            {correctCount} dari {soalList.length} soal dijawab benar
            <span style={{ marginLeft: 8, fontSize: 15, fontWeight: 800, color: pctCorrect >= 70 ? C.green : pctCorrect >= 40 ? C.amber : C.red }}>
              ({pctCorrect}%)
            </span>
          </div>
        </div>

        {wrongTopics.length > 0 ? (
          <Card style={{ padding: 20, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.dark, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>🎯</span> Topik yang Perlu Diperkuat
            </div>
            <div style={{ fontSize: 11, color: C.slate, marginBottom: 14 }}>
              Topik ini akan menjadi <strong>rekomendasi belajar</strong> di dashboardmu — klik langsung untuk mulai.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {wrongTopics.map((wt, i) => (
                <div key={i} style={{
                  background: C.white, borderRadius: 10, padding: '12px 14px',
                  border: `1.5px solid ${wt.mapelColor}33`,
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${wt.mapelColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    {wt.mapelIcon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: wt.mapelColor, textTransform: 'uppercase', letterSpacing: 0.8 }}>{wt.mapelLabel}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>{wt.subMateri}</div>
                  </div>
                  <span style={{ fontSize: 9, padding: '3px 9px', borderRadius: 99, background: `${wt.mapelColor}15`, color: wt.mapelColor, fontWeight: 700, whiteSpace: 'nowrap' }}>
                    ⚡ Perlu Latihan
                  </span>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card style={{ padding: 20, marginBottom: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🏆</div>
            <div style={{ fontWeight: 700, color: C.green, fontSize: 15, marginBottom: 6 }}>Semua benar! Kamu sudah sangat siap!</div>
            <div style={{ fontSize: 12, color: C.darkL }}>Dashboard akan menampilkan topik-topik lanjutan.</div>
          </Card>
        )}

        <Btn variant="amber" onClick={handleMulaiBelajar}
          style={{ width: '100%', justifyContent: 'center', padding: '13px 36px', fontSize: 15 }}>
          🚀 Lihat Rekomendasi & Mulai Belajar →
        </Btn>
      </div>
    </div>
  );
}
