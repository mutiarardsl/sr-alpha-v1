/**
 * SR MVP — DashboardSection (REVISED)
 * src/components/student/sections/DashboardSection.jsx
 *
 * Perubahan:
 *  1. Rekomendasi: per-mapel dari RAG, tombol "Mulai Belajar"
 *  2. Progress: per-mapel + topik terakhir saja (tanpa waktu & persentase), tombol "Lanjutkan"
 *  3. Aktivitas Terbaru: mapel | topik | durasi | status badge
 */
import { C } from '../../../styles/tokens';
import { Card } from '../../shared/UI';

/* ── Fallback rekomendasi jika belum ada pretestResult ──────────────────── */
const REKOM_DEFAULT = [
  {
    id: "rm1", mapelId: 'mat', mapelLabel: 'Matematika', mapelIcon: '📐', mapelColor: C.teal,
    subMateri: 'Persamaan Linear',
    alasan: 'Topik fundamental Matematika yang sering jadi dasar materi lanjutan.',
    tag: '⭐ Disarankan',
  },
  {
    id: "rm3", mapelId: 'fis', mapelLabel: 'Fisika', mapelIcon: '⚛️', mapelColor: C.orange,
    subMateri: 'Gerak Lurus',
    alasan: 'Konsep dasar Fisika — kecepatan, percepatan, dan gerak yang wajib dipahami.',
    tag: '⭐ Disarankan',
  },
  {
    id: "rm2", mapelId: 'bio', mapelLabel: 'Biologi', mapelIcon: '🧬', mapelColor: C.green,
    subMateri: 'Ekosistem',
    alasan: 'Memahami interaksi makhluk hidup dan rantai makanan dalam ekosistem.',
    tag: '⭐ Disarankan',
  },
];

/* ── Ambil topik terakhir per mapel dari progressData ──────────────────── */
const getLastTopicPerMapel = (progressData) => {
  const byMapel = {};
  const all = [...progressData.belumSelesai, ...progressData.sudahSelesai];
  all.forEach(m => {
    if (!byMapel[m.mapelId]) {
      byMapel[m.mapelId] = m;
    }
  });
  return Object.values(byMapel);
};

/* ── Status helper ──────────────────────────────────────────────────────── */
const getStatusBadge = (quizScore10) => {
  // quizScore10 = jumlah benar dari 10 soal
  if (quizScore10 === null || quizScore10 === undefined) return null;
  const pct = (quizScore10 / 10) * 100;
  return pct >= 70
    ? { label: '⭐ Hebat!', bg: C.greenL, color: C.green }
    : { label: '🔄 Yuk Coba Lagi', bg: C.amberL, color: C.orange };
};

const fmtDurasi = (menit) => {
  if (!menit && menit !== 0) return '—';
  if (menit < 60) return `${menit} mnt`;
  return `${Math.floor(menit / 60)}j ${menit % 60 > 0 ? (menit % 60) + 'mnt' : ''}`.trim();
};

/* ── Sub-components ─────────────────────────────────────────────────────── */
const RekomCard = ({ rekom, onStart }) => (
  <div style={{
    background: C.white, borderRadius: 14, overflow: 'hidden',
    border: `1.5px solid ${rekom.mapelColor}22`,
    boxShadow: `0 2px 12px ${rekom.mapelColor}10`,
    transition: 'transform .2s, box-shadow .2s',
    display: 'flex', flexDirection: 'column',
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 20px ${rekom.mapelColor}22`; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 2px 12px ${rekom.mapelColor}10`; }}>
    <div style={{ height: 4, background: `linear-gradient(90deg,${rekom.mapelColor},${rekom.mapelColor}88)` }} />
    <div style={{ padding: '14px 14px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: `${rekom.mapelColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
          {rekom.mapelIcon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: rekom.mapelColor, textTransform: 'uppercase', letterSpacing: 0.8 }}>{rekom.mapelLabel}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.dark, lineHeight: 1.3, marginTop: 2 }}>{rekom.subMateri}</div>
        </div>
        {rekom.tag && (
          <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 99, background: `${rekom.mapelColor}15`, color: rekom.mapelColor, fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap' }}>
            {rekom.tag}
          </span>
        )}
      </div>
      <div style={{ fontSize: 11, color: C.darkL, lineHeight: 1.55, marginBottom: 10, flex: 1 }}>{rekom.alasan}</div>
      <button onClick={() => onStart(rekom)}
        style={{ width: '100%', padding: '9px 0', borderRadius: 9, border: 'none', background: `linear-gradient(135deg,${rekom.mapelColor},${rekom.mapelColor}cc)`, color: C.white, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity .2s' }}
        onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
        📚 Mulai Belajar
      </button>
    </div>
  </div>
);

const ProgressCard = ({ m, onResume }) => (
  <div style={{ background: C.white, borderRadius: 12, padding: '12px 14px', border: `1px solid ${m.mapelColor}22`, display: 'flex', alignItems: 'center', gap: 12 }}>
    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${m.mapelColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
      {m.mapelIcon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: m.mapelColor }}>{m.mapelLabel}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: C.dark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.subMateri}</div>
    </div>
    <button onClick={() => onResume(m)}
      style={{ padding: '7px 14px', borderRadius: 8, border: `1.5px solid ${m.mapelColor}`, background: 'none', color: m.mapelColor, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0, transition: 'all .2s', whiteSpace: 'nowrap' }}
      onMouseEnter={e => { e.currentTarget.style.background = m.mapelColor; e.currentTarget.style.color = C.white; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = m.mapelColor; }}>
      Lanjutkan →
    </button>
  </div>
);

/* ── Main Component ─────────────────────────────────────────────────────── */
const DashboardSection = ({ progressData, setActivePage, openChatWithWebcam, recentActivity = [], pretestResult }) => {
  const mapelProgress = getLastTopicPerMapel(progressData);

  // Bangun daftar rekomendasi:
  // - Jika ada pretestResult.wrongTopics → gunakan itu (dinamis dari pretest)
  // - Jika tidak ada → pakai default
  const rekomList = (pretestResult?.wrongTopics?.length > 0)
    ? pretestResult.wrongTopics.map((wt, i) => ({
      ...wt,
      alasan: i === 0
        ? `Kamu menjawab salah soal ${wt.subMateri} di pretest. Mentor AI siapkan materi step-by-step untuk topik ini.`
        : `${wt.subMateri} perlu penguatan. Mulai dari konsep dasar untuk fondasi yang kuat.`,
      tag: i === 0 ? '⚡ Prioritas' : '📝 Perlu Latihan',
    }))
    : REKOM_DEFAULT;

  /* Dummy recent activity jika belum ada */
  const activity = recentActivity.length > 0 ? recentActivity : [
    /*{ mapelLabel: 'Matematika', mapelIcon: '📐', mapelColor: C.teal, topik: 'Persamaan Linear', durasi: 25, quizScore10: 8, date: 'Hari ini 14:35' },
    { mapelLabel: 'IPA', mapelIcon: '🔬', mapelColor: C.orange, topik: 'Ekosistem', durasi: 18, quizScore10: 5, date: 'Kemarin 10:20' },
    { mapelLabel: 'B. Indonesia', mapelIcon: '📖', mapelColor: C.purple, topik: 'Teks Argumentasi', durasi: 32, quizScore10: 9, date: '2 hari lalu' },
    { mapelLabel: 'Matematika', mapelIcon: '📐', mapelColor: C.teal, topik: 'Aljabar Dasar', durasi: 20, quizScore10: 6, date: '3 hari lalu' },*/
  ];

  return (
    <div style={{ overflowY: 'auto', height: '100%', padding: '20px 22px' }}>

      {/* ── Hero ── */}
      <div style={{ borderRadius: 18, padding: '22px 24px', marginBottom: 18, position: 'relative', overflow: 'hidden', background: `linear-gradient(135deg,${C.teal} 0%,${C.tealL} 60%,${C.dark} 100%)` }}>
        <div style={{ position: 'absolute', right: -30, top: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,.06)' }} />
        <div style={{ position: 'absolute', right: 60, bottom: -50, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ color: 'rgba(255,255,255,.65)', fontSize: 12, marginBottom: 4 }}>
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <div style={{ fontFamily: "'Source Serif 4',serif", color: C.white, fontSize: 22, fontWeight: 600, marginBottom: 4 }}>
            Selamat belajar, Budi! 👋
          </div>
          <div style={{ color: 'rgba(255,255,255,.6)', fontSize: 12 }}>Portal Siswa · SR Kota Malang · Kelas X IPA 1</div>
        </div>
      </div>

      {/* ── KPI ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { icon: '🔥', val: '7 Hari', label: 'Streak Belajar', color: C.amber },
          { icon: '✅', val: progressData.sudahSelesai.length, label: 'Topik Selesai', color: C.green },
          { icon: '🔄', val: progressData.belumSelesai.length, label: 'Sedang Belajar', color: C.teal },
          { icon: '⏱', val: '3j 45m', label: 'Total Belajar', color: C.purple },
        ].map(s => (
          <Card key={s.label} style={{ padding: '14px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 19, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 10, color: C.slate, fontWeight: 600, marginTop: 2, lineHeight: 1.3 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* ── Rekomendasi dari Pretest / RAG ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.dark }}>
              {pretestResult?.wrongTopics?.length > 0 ? '🎯 Rekomendasi dari Pretest' : '⭐ Rekomendasi Belajar'}
            </div>
            <div style={{ fontSize: 11, color: C.slate, marginTop: 2 }}>
              {pretestResult?.wrongTopics?.length > 0
                ? 'Topik yang perlu diperkuat berdasarkan hasil pretestmu'
                : 'Topik pilihan yang bagus untuk kamu pelajari'}
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: rekomList.length === 1 ? '1fr' : rekomList.length === 2 ? '1fr 1fr' : 'repeat(3,1fr)', gap: 12 }}>
          {rekomList.map((r, i) => (
            <RekomCard key={`${r.mapelId}-${r.subMateri}-${i}`} rekom={r}
              onStart={(rekom) => openChatWithWebcam({
                mapelId: rekom.mapelId,
                mapelLabel: rekom.mapelLabel,
                mapelIcon: rekom.mapelIcon,
                mapelColor: rekom.mapelColor,
                subMateri: rekom.subMateri,
                source: pretestResult?.wrongTopics?.length > 0 ? 'pretest' : 'dashboard',
              })} />
          ))}
        </div>
      </div>

      {/* ── Progress per Mapel (topik terakhir, tanpa waktu & %) ── */}
      {mapelProgress.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.dark }}>🔄 Progress Belajar</div>
            <button onClick={() => setActivePage('progress')}
              style={{ background: 'none', border: 'none', fontSize: 11, color: C.teal, fontWeight: 700, cursor: 'pointer' }}>
              Lihat Semua →
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {mapelProgress.slice(0, 4).map(m => (
              <ProgressCard key={m.id} m={m}
                onResume={(materi) => openChatWithWebcam({
                  mapelId: materi.mapelId,
                  mapelLabel: materi.mapelLabel,
                  mapelIcon: materi.mapelIcon,
                  mapelColor: materi.mapelColor,
                  subMateri: materi.subMateri,
                  source: 'resume',
                })} />
            ))}
          </div>
        </div>
      )}

      {/* ── Aktivitas Terbaru ── */}
      <div>
        <div style={{ fontWeight: 700, fontSize: 14, color: C.dark, marginBottom: 12 }}>📋 Aktivitas Terbaru</div>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {/* Header tabel */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 2.5fr 1fr 1.5fr', gap: 8, padding: '10px 16px', background: C.teal }}>
            {['Mata Pelajaran', 'Topik', 'Durasi', 'Status'].map(h => (
              <div key={h} style={{ fontSize: 10, fontWeight: 700, color: C.white }}>{h}</div>
            ))}
          </div>
          {activity.slice(0, 6).map((act, i) => {
            const badge = getStatusBadge(act.quizScore10);
            return (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 2.5fr 1fr 1.5fr', gap: 8, padding: '10px 16px', borderBottom: `1px solid ${C.tealXL}`, background: i % 2 === 0 ? C.white : C.cream, alignItems: 'center' }}>
                {/* Mapel */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: `${act.mapelColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{act.mapelIcon}</div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: act.mapelColor }}>{act.mapelLabel}</div>
                    <div style={{ fontSize: 9, color: C.slate }}>{act.date}</div>
                  </div>
                </div>
                {/* Topik */}
                <div style={{ fontSize: 11, color: C.dark, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{act.topik}</div>
                {/* Durasi */}
                <div style={{ fontSize: 11, fontWeight: 700, color: C.darkL }}>{fmtDurasi(act.durasi)}</div>
                {/* Status */}
                <div>
                  {badge
                    ? <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 99, background: badge.bg, color: badge.color, fontWeight: 700, whiteSpace: 'nowrap' }}>{badge.label}</span>
                    : <span style={{ fontSize: 9, color: C.slate }}>—</span>
                  }
                </div>
              </div>
            );
          })}
          {activity.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', fontSize: 12, color: C.slate }}>
              Belum ada aktivitas. Ayo mulai belajar!
            </div>
          )}
        </Card>
      </div>

    </div>
  );
};

export default DashboardSection;
