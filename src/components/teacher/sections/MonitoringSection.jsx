/**
 * SR MVP — MonitoringSection (Portal Guru) — REVISED
 * src/components/teacher/sections/MonitoringSection.jsx
 *
 * Struktur baru:
 *  ┌────────────────────────────────┬──────────────┐
 *  │  CENTER (flex:1, scroll)       │  RIGHT PANEL │
 *  │  ─ Header (judul + WS badge)   │  ─ Alert     │
 *  │  ─ 4 KPI cards                 │  ─ Distribusi│
 *  │  ─ Tabel aktivitas siswa       │    Emosi     │
 *  │    (scrollable, max-height)    │  ─ Live Event│
 *  └────────────────────────────────┴──────────────┘
 */
import { useState } from 'react';
import { Card, Btn, Avatar, EmotionBadge, EmotionColor, ProgressBar } from '../../shared/UI';
import { C } from '../../../styles/tokens';
import { STUDENTS } from '../../../data/masterData';
import { useWebSocket } from '../../../hooks/useWebSocket';

/* ── WS Status Badge ──────────────────────────────────────────────────── */
const WsBadge = ({ wsStatus, isDummy, activeCount }) => {
  const cfg = {
    connecting: { bg: C.amberL, color: C.orange, dot: C.amber, label: 'Menghubungkan…' },
    connected: { bg: C.greenL, color: C.green, dot: C.green, label: isDummy ? `Live (dummy) · ${activeCount} aktif` : `Live · ${activeCount} aktif` },
    disconnected: { bg: '#EDF2F7', color: C.slate, dot: C.slate, label: 'Terputus' },
    error: { bg: '#FEE2E2', color: C.red, dot: C.red, label: 'Error WS' },
    idle: { bg: '#EDF2F7', color: C.slate, dot: C.slate, label: 'Idle' },
  }[wsStatus] || { bg: '#EDF2F7', color: C.slate, dot: C.slate, label: wsStatus };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 99, background: cfg.bg, fontSize: 11, fontWeight: 700, color: cfg.color }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, display: 'inline-block', animation: wsStatus === 'connected' ? 'pulse 1.5s infinite' : 'none' }} />
      {cfg.label}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════ */
const MonitoringSection = ({
  teacher, teacherMapel, cls, activeClass, setActiveClass,
  recommendations, recModal, setRecModal, recText, setRecText,
  recPipeline, setRecPipeline, sentToAI, setSentToAI,
  downloadModal, setDownloadModal, downloadLoading, setDownloadLoading,
  recAttachments, setRecAttachments, recUploadDragging, setRecUploadDragging,
  recFileInputRef, handleRecFileSelect, removeRecAttachment, saveRec,
  barTooltip, setBarTooltip, selectedStudent, setSelectedStudent,
}) => {
  /* ── WebSocket ─────────────────────────────────────────────── */
  const { wsStatus, events, liveStudents, activeCount, isDummy } = useWebSocket({
    kelasId: activeClass,
    guruId: teacher?.id || 'g1',
    enabled: true,
  });

  /* Merge live data */
  const studentsWithLive = STUDENTS.map(s => {
    const live = liveStudents[s.id];
    if (!live) return s;
    return {
      ...s,
      todayActive: live.aktif ?? s.todayActive,
      emotionKey: live.emosi || s.emotionKey,
      emotion: live.emosi ? (live.emosi.charAt(0).toUpperCase() + live.emosi.slice(1)) : s.emotion,
      chatProgress: live.progress ? { ...s.chatProgress, [teacher?.mapelId]: live.progress } : s.chatProgress,
      todayTopik: live.topik || s.todayTopik,
      todayQuizScore: live.lastQuiz ?? s.todayQuizScore,
    };
  });

  const getProgress = (st) => st.chatProgress?.[teacher?.mapelId] ?? 0;

  const aktifHariIni = studentsWithLive.filter(s => s.todayActive);
  const tidakAktif = studentsWithLive.filter(s => !s.todayActive);
  const butuhPerhatian = [
    ...studentsWithLive.filter(s => !s.todayActive && s.status === 'Perhatian'),
    ...studentsWithLive.filter(s => s.todayActive && s.todayQuizScore != null && s.todayQuizScore < 5),
  ].filter((v, i, a) => a.findIndex(x => x.id === v.id) === i);

  const avgProgressToday = aktifHariIni.length > 0
    ? Math.round(aktifHariIni.reduce((a, s) => a + getProgress(s), 0) / aktifHariIni.length)
    : 0;

  /* Distribusi emosi */
  const emotionToday = { senang: 0, netral: 0, bingung: 0, sedih: 0 };
  aktifHariIni.forEach(s => { if (emotionToday[s.emotionKey] !== undefined) emotionToday[s.emotionKey]++; });
  const emotionMax = Math.max(...Object.values(emotionToday), 1);

  const EMOSI_META = {
    senang: { emoji: '😊', label: 'Senang', color: C.green },
    netral: { emoji: '😐', label: 'Netral', color: C.slate },
    bingung: { emoji: '😵', label: 'Bingung', color: C.amber },
    sedih: { emoji: '😢', label: 'Sedih', color: C.purple },
  };


  /* Urutan: aktif dulu, lalu tidak aktif */
  const sortedStudents = [
    ...studentsWithLive.filter(s => s.todayActive),
    ...studentsWithLive.filter(s => !s.todayActive),
  ];

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

      {/* ══════════ CENTER COLUMN ══════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '12px 20px', background: C.white, borderBottom: `1px solid rgba(13,92,99,.08)`, display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 17, fontWeight: 600, color: C.dark }}>{cls?.label}</div>
            <div style={{ fontSize: 11, color: C.slate, marginTop: 1 }}>
              {teacherMapel?.icon} <strong style={{ color: teacherMapel?.color }}>{teacherMapel?.label}</strong>
              {' · '}{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
          <div style={{ flex: 1 }} />
          <button onClick={() => setDownloadModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: `linear-gradient(135deg,${C.teal},${C.tealL})`, border: 'none', borderRadius: 99, cursor: 'pointer', fontFamily: 'inherit', color: C.white, fontSize: 11, fontWeight: 700 }}>
            📥 Unduh Laporan
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* ── 4 KPI Cards ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            {[
              { icon: '👥', label: 'Total Siswa', value: cls?.count, sub: `Di ${cls?.label || 'kelas ini'}`, color: C.teal },
              { icon: '🟢', label: 'Aktif Hari Ini', value: aktifHariIni.length, sub: `${Math.round(aktifHariIni.length / (cls?.count || STUDENTS.length) * 100)}% dari total`, color: C.green },
              { icon: '📊', label: 'Rata-rata Progress', value: `${avgProgressToday}%`, sub: aktifHariIni.length > 0 ? `${aktifHariIni.length} siswa aktif` : 'Belum ada aktivitas', color: C.purple },
              { icon: '⚠️', label: 'Perlu Diperhatikan', value: butuhPerhatian.length, sub: butuhPerhatian.length > 0 ? 'Tindak lanjut segera' : 'Semua aman ✓', color: butuhPerhatian.length > 0 ? C.red : C.green },
            ].map(s => (
              <Card key={s.label} style={{ padding: '14px' }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 10, color: C.slate, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .7 }}>{s.label}</div>
                <div style={{ fontSize: s.value?.toString().length > 4 ? 20 : 26, fontWeight: 800, color: C.dark, margin: '3px 0' }}>{s.value}</div>
                <div style={{ fontSize: 10, color: s.color, fontWeight: 600, lineHeight: 1.3 }}>{s.sub}</div>
              </Card>
            ))}
          </div>

          {/* ── Tabel Aktivitas Siswa (scrollable) ── */}
          <Card style={{ overflow: 'hidden', flex: 1, minHeight: 0 }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid rgba(13,92,99,.08)`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.dark }}>
                  Aktivitas Siswa Hari Ini
                  <span style={{ marginLeft: 8, fontSize: 11, color: teacherMapel?.color }}>({teacherMapel?.icon} {teacherMapel?.label})</span>
                </div>
                <div style={{ fontSize: 11, color: C.slate, marginTop: 2 }}>
                  Siswa yang tidak aktif hari ini ditandai <span style={{ color: C.slate, fontWeight: 600 }}>—</span>
                </div>
              </div>
            </div>

            {/* Table dengan max-height + scroll */}
            <div style={{ overflowX: 'auto', maxHeight: 360, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                  <tr style={{ background: C.cream }}>
                    {['Nama Siswa', 'Terakhir Aktif', 'Nilai Quiz', 'Durasi Belajar', 'Emosi', 'Aksi'].map(h => (
                      <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: C.slate, textTransform: 'uppercase', letterSpacing: .7, whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedStudents.map((st, idx) => {
                    const isActive = st.todayActive;
                    const live = liveStudents[st.id];
                    const rowBg = !isActive && st.status === 'Perhatian'
                      ? 'rgba(229,62,62,.03)'
                      : !isActive ? 'rgba(0,0,0,.012)' : 'transparent';

                    return (
                      <tr key={st.id}
                        style={{ borderTop: `1px solid rgba(13,92,99,.05)`, background: rowBg, transition: 'background .15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(13,92,99,.03)'}
                        onMouseLeave={e => e.currentTarget.style.background = rowBg}>

                        {/* Nama */}
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ position: 'relative' }}>
                              <div style={{ width: 30, height: 30, borderRadius: '50%', background: isActive ? st.avatarBg : '#CBD5E0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 10, flexShrink: 0 }}>
                                {st.avatar}
                              </div>
                              {isActive && (
                                <span style={{ position: 'absolute', bottom: -1, right: -1, width: 8, height: 8, borderRadius: '50%', background: C.green, border: '1px solid white' }} />
                              )}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13, color: isActive ? C.dark : C.slate }}>
                                {st.name}
                                {st.status === 'Perhatian' && !isActive && (
                                  <span style={{ marginLeft: 5, fontSize: 9, background: C.redL, color: C.red, padding: '1px 5px', borderRadius: 99, fontWeight: 700 }}>Perhatian</span>
                                )}
                              </div>
                              {st.todayTopik && isActive && (
                                <div style={{ fontSize: 9, color: C.slate }}>{st.todayTopik}</div>
                              )}
                            </div>
                            {live && <span style={{ width: 6, height: 6, borderRadius: '50%', background: live.aktif ? C.green : C.slate, flexShrink: 0, animation: live.aktif ? 'pulse 1.5s infinite' : 'none' }} />}
                          </div>
                        </td>

                        {/* Terakhir Aktif */}
                        <td style={{ padding: '10px 12px' }}>
                          {isActive
                            ? <span style={{ fontSize: 11, color: C.green, fontWeight: 600 }}>{st.lastActive}</span>
                            : <span style={{ fontSize: 11, color: st.status === 'Perhatian' ? C.red : C.slate }}>{st.lastActive}</span>
                          }
                        </td>

                        {/* Nilai Quiz (format X/10) */}
                        <td style={{ padding: '10px 12px' }}>
                          {isActive && st.todayQuizScore != null
                            ? <span style={{ fontSize: 13, fontWeight: 800, color: st.todayQuizScore / st.todayQuizTotal >= 0.7 ? C.green : st.todayQuizScore / st.todayQuizTotal >= 0.5 ? C.amber : C.red }}>
                              {st.todayQuizScore}/{st.todayQuizTotal}
                            </span>
                            : <span style={{ fontSize: 13, color: C.slate }}>—</span>
                          }
                        </td>

                        {/* Durasi */}
                        <td style={{ padding: '10px 12px' }}>
                          {isActive && st.todayStudyHours != null
                            ? <span style={{ fontSize: 12, color: C.darkL, fontWeight: 600 }}>{st.todayStudyHours.toFixed(1)} jam</span>
                            : <span style={{ fontSize: 13, color: C.slate }}>—</span>
                          }
                        </td>

                        {/* Emosi */}
                        <td style={{ padding: '10px 12px' }}>
                          {isActive
                            ? <EmotionBadge emotion={st.emotion} emotionKey={st.emotionKey} />
                            : <span style={{ fontSize: 13, color: C.slate }}>—</span>
                          }
                        </td>

                        {/* Aksi */}
                        <td style={{ padding: '10px 12px' }}>
                          <button onClick={() => setSelectedStudent(st)}
                            style={{ background: isActive ? C.tealXL : '#EDF2F7', border: 'none', borderRadius: 7, padding: '5px 10px', fontSize: 11, color: isActive ? C.teal : C.slate, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                            Detail →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ padding: '9px 16px', borderTop: `1px solid rgba(13,92,99,.07)`, fontSize: 11, color: C.slate, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <span>+ {Math.max(0, (cls?.count || 32) - sortedStudents.length)} siswa lainnya</span>
              <button style={{ background: 'none', border: 'none', color: C.teal, fontWeight: 600, fontSize: 11, cursor: 'pointer' }}>
                Tampilkan Semua →
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* ══════════ RIGHT PANEL ══════════ */}
      <div style={{ width: 260, background: C.white, borderLeft: `1px solid rgba(13,92,99,.1)`, overflowY: 'auto', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>

        {/* ── Alert: Perlu Tindakan ── */}
        <div style={{ padding: '14px 14px 12px', borderBottom: `1px solid rgba(13,92,99,.07)` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.dark, marginBottom: 8 }}>⚠️ Perlu Tindakan Hari Ini</div>
          {butuhPerhatian.length === 0 ? (
            <div style={{ fontSize: 11, color: C.green, background: C.greenL, borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
              ✅ Semua siswa terpantau aman
            </div>
          ) : (
            butuhPerhatian.slice(0, 4).map((st, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 9, paddingBottom: 9, borderBottom: i < Math.min(butuhPerhatian.length, 4) - 1 ? `1px solid rgba(13,92,99,.06)` : 'none' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: st.avatarBg || C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 10, flexShrink: 0 }}>
                  {st.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.dark }}>{st.name}</div>
                  <div style={{ fontSize: 10, color: !st.todayActive ? C.red : C.amber, fontWeight: 600 }}>
                    {!st.todayActive ? 'Tidak aktif hari ini' : st.todayQuizScore != null ? `Quiz: ${st.todayQuizScore}/${st.todayQuizTotal} ⚠` : 'Perlu perhatian'}
                  </div>
                </div>
                <button onClick={() => { setRecModal(st.id); setRecText(recommendations[st.id] || ''); }}
                  style={{ background: C.amberL, border: 'none', borderRadius: 6, padding: '3px 7px', fontSize: 10, color: C.orange, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
                  Rekomen
                </button>
              </div>
            ))
          )}
        </div>

        {/* ── Distribusi Emosi (bar chart vertikal) ── */}
        <div style={{ padding: '12px 14px', borderBottom: `1px solid rgba(13,92,99,.07)` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.dark, marginBottom: 3 }}>😊 Distribusi Emosi Kelas</div>
          <div style={{ fontSize: 10, color: C.slate, marginBottom: 10 }}>
            Dari {aktifHariIni.length} siswa aktif
          </div>
          {aktifHariIni.length === 0 ? (
            <div style={{ fontSize: 11, color: C.slate, textAlign: 'center', padding: '12px 0' }}>Belum ada siswa aktif</div>
          ) : (
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 80, marginBottom: 8 }}>
              {Object.entries(emotionToday).map(([ek, v]) => {
                const meta = EMOSI_META[ek];
                const barH = v === 0 ? 0 : Math.max(Math.round((v / emotionMax) * 64), 6);
                return (
                  <div key={ek} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: v > 0 ? meta.color : C.slate, lineHeight: 1 }}>{v}</div>
                    <div style={{ width: '100%', borderRadius: '3px 3px 0 0', height: barH, background: v > 0 ? meta.color : '#E8EFF5', minHeight: 4, transition: 'height .5s ease' }} />
                    <div style={{ fontSize: 13, lineHeight: 1 }}>{meta.emoji}</div>
                    <div style={{ fontSize: 8, color: C.slate, textAlign: 'center', lineHeight: 1.2 }}>{meta.label}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Live Event Feed ── */}
        <div style={{ padding: '12px 14px', flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.dark, marginBottom: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
            ⚡ Live Event Feed
            <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 99, background: wsStatus === 'connected' ? C.greenL : C.amberL, color: wsStatus === 'connected' ? C.green : C.orange, fontWeight: 700 }}>
              {wsStatus === 'connected' ? 'LIVE' : wsStatus.toUpperCase()}
            </span>
          </div>
          <div style={{ fontSize: 10, color: C.slate, marginBottom: 10 }}>Event real-time dari WebSocket</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {events.length === 0 ? (
              <div style={{ fontSize: 11, color: C.slate, textAlign: 'center', padding: '20px 0' }}>Menunggu event...</div>
            ) : (
              events.slice(0, 10).map((ev, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '6px 8px', borderRadius: 8, background: i === 0 ? C.tealXL : C.cream, fontSize: 11 }}>
                  <span style={{ fontSize: 9, color: C.slate, flexShrink: 0, marginTop: 2, whiteSpace: 'nowrap' }}>{ev.timestamp}</span>
                  <div style={{ flex: 1, color: C.dark, lineHeight: 1.4 }}>
                    <strong>{ev.siswa.nama}</strong>{' '}
                    {ev.type === 'student_emotion' && `→ emosi: ${ev.payload.emosi} (${Math.round(ev.payload.confidence * 100)}%)`}
                    {ev.type === 'student_progress' && `→ ${ev.payload.topik} ${ev.payload.progress}%`}
                    {ev.type === 'student_active' && `→ mulai: ${ev.payload.topik}`}
                    {ev.type === 'student_quiz' && `→ quiz: ${ev.payload.score}/100`}
                    {ev.type === 'student_inactive' && `→ tidak aktif`}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Modal Rekomendasi ── */}
      {recModal && (() => {
        const s = STUDENTS.find(x => x.id === recModal);
        if (!s) return null;
        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(26,35,50,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(3px)" }} onClick={() => setRecModal(null)}>
            <div className="bounce-in" onClick={e => e.stopPropagation()}
              style={{ background: C.white, borderRadius: 16, padding: 28, width: 500, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>💬</div>
              <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 18, fontWeight: 600, color: C.dark, marginBottom: 4 }}>Beri Rekomendasi</div>
              <div style={{ fontSize: 13, color: C.darkL, marginBottom: 12 }}>
                untuk <strong>{recModal.name}</strong> — {teacherMapel?.icon} {teacherMapel?.label}
              </div>
              {/* Rekomendasi AI */}
              <div style={{ background: C.tealXL, borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontSize: 12, color: C.teal }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>🤖 Saran dari Sistem AI:</div>
                Siswa perlu pendekatan visual pada sub-topik <strong>{teacherMapel?.subs?.[0] || "materi ini"}</strong>.
                Disarankan mode eksplorasi game untuk membangun konsep dasar.
              </div>
              {/* Input guru */}
              <textarea value={recText} onChange={e => setRecText(e.target.value)}
                placeholder="Tulis rekomendasi guru... (akan diteruskan ke AI sebagai konteks belajar siswa)" rows={3}
                style={{
                  width: "100%", padding: "10px 12px", border: `1.5px solid ${C.tealXL}`, borderRadius: 9,
                  fontSize: 13, outline: "none", resize: "none", fontFamily: "inherit", marginBottom: 12
                }}
                onFocus={e => e.target.style.borderColor = C.teal}
                onBlur={e => e.target.style.borderColor = C.tealXL} />
              {/* Upload lampiran */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.slate, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>📎 Lampiran Materi (opsional)</div>
                <div
                  onDragOver={e => { e.preventDefault(); setRecUploadDragging(true); }}
                  onDragLeave={() => setRecUploadDragging(false)}
                  onDrop={e => { e.preventDefault(); setRecUploadDragging(false); handleRecFileSelect(e.dataTransfer.files, recModal.id); }}
                  onClick={() => recFileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${recUploadDragging ? C.teal : C.tealXL}`, borderRadius: 10, padding: "14px 16px",
                    textAlign: "center", cursor: "pointer", background: recUploadDragging ? C.tealXL : "#FAFEFF", transition: "all .2s", marginBottom: 8
                  }}>
                  <input ref={recFileInputRef} type="file" multiple accept=".jpg,.jpeg,.png,.pdf,.docx,.doc,.xlsx,.mp4"
                    style={{ display: "none" }} onChange={e => handleRecFileSelect(e.target.files, recModal.id)} />
                  <div style={{ fontSize: 22, marginBottom: 4 }}>📂</div>
                  <div style={{ fontSize: 12, color: C.tealL, fontWeight: 600 }}>
                    {recUploadDragging ? "Lepaskan untuk upload" : "Klik atau drag & drop file"}
                  </div>
                  <div style={{ fontSize: 10, color: C.slate, marginTop: 3 }}>PDF, Word, Excel, Gambar, Video · Maks 5 file</div>
                </div>
                {(recAttachments[recModal.id] || []).length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {(recAttachments[recModal.id] || []).map((f, i) => {
                      const extIcon = { pdf: "📄", docx: "📝", doc: "📝", xlsx: "📊", jpg: "🖼️", jpeg: "🖼️", png: "🖼️", mp4: "🎬" }[f.ext] || "📎";
                      return (
                        <div key={i} style={{
                          display: "flex", alignItems: "center", gap: 8, padding: "7px 10px",
                          background: C.cream, borderRadius: 8, border: `1px solid ${C.tealXL}`
                        }}>
                          <span style={{ fontSize: 14 }}>{extIcon}</span>
                          <div style={{ flex: 1, overflow: "hidden" }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: C.dark, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                            <div style={{ fontSize: 10, color: C.slate }}>{f.size}</div>
                          </div>
                          <button onClick={() => removeRecAttachment(recModal.id, i)}
                            style={{ background: "none", border: "none", color: C.slate, cursor: "pointer", fontSize: 14 }}>✕</button>
                        </div>
                      );
                    })}
                    <div style={{ fontSize: 10, color: C.teal, fontWeight: 600, marginTop: 2 }}>
                      ✅ {(recAttachments[recModal.id] || []).length} lampiran terkirim
                    </div>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Btn variant="ghost" onClick={() => { setRecModal(null); setRecText(""); }} style={{ flex: 1, justifyContent: "center" }}>Batal</Btn>
                <Btn variant="amber" onClick={() => saveRec(recModal.id)} style={{ flex: 1, justifyContent: "center" }}>💾 Simpan </Btn>
              </div>
              {recommendations[recModal.id] && (
                <div style={{ marginTop: 10, background: C.greenL, borderRadius: 8, padding: "8px 12px", fontSize: 12, color: C.green }}>
                  ✅ Tersimpan: "{recommendations[recModal.id]}"
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ── Modal Download ── */}
      {downloadModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,35,50,.5)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: C.white, borderRadius: 16, width: 380, padding: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: C.dark, marginBottom: 4 }}>📥 Unduh Laporan</div>
            <div style={{ fontSize: 12, color: C.slate, marginBottom: 16 }}>{cls?.label} · {teacherMapel?.label}</div>
            {!downloadLoading ? (
              <>
                {['Laporan Aktivitas Harian.pdf', 'Progress Siswa.xlsx', 'Distribusi Emosi.pdf'].map(name => (
                  <div key={name} onClick={() => { setDownloadLoading(true); setTimeout(() => setDownloadLoading(false), 1500); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 9, border: `1px solid ${C.tealXL}`, marginBottom: 8, cursor: 'pointer', background: C.cream }}>
                    <span style={{ fontSize: 18 }}>{name.endsWith('.pdf') ? '📄' : '📊'}</span>
                    <span style={{ fontSize: 12, color: C.dark, fontWeight: 600 }}>{name}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: C.teal, fontWeight: 700 }}>↓</span>
                  </div>
                ))}
                <Btn variant="ghost" onClick={() => setDownloadModal(false)} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>Tutup</Btn>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: 32, height: 32, border: `3px solid ${C.tealXL}`, borderTopColor: C.teal, borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 10px' }} />
                <div style={{ fontSize: 13, color: C.slate }}>Menyiapkan laporan...</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Panel Detail Siswa ── */}
      {selectedStudent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,35,50,.4)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', zIndex: 998, backdropFilter: 'blur(2px)' }}
          onClick={() => setSelectedStudent(null)}>
          <div className="slide-right" onClick={e => e.stopPropagation()}
            style={{ width: 390, height: '100vh', background: C.white, overflowY: 'auto', boxShadow: '-10px 0 40px rgba(0,0,0,.15)', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ padding: '16px 18px', borderBottom: `1px solid rgba(13,92,99,.08)`, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: selectedStudent.todayActive ? selectedStudent.avatarBg : '#CBD5E0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                {selectedStudent.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: C.dark }}>{selectedStudent.name}</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
                  {selectedStudent.todayActive
                    ? <span style={{ fontSize: 10, background: C.greenL, color: C.green, padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>🟢 Aktif Hari Ini</span>
                    : <span style={{ fontSize: 10, background: '#EDF2F7', color: C.slate, padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>⚪ Tidak Aktif</span>
                  }
                  {selectedStudent.status === 'Perhatian' &&
                    <span style={{ fontSize: 10, background: C.redL, color: C.red, padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>⚠ Perhatian</span>
                  }
                  {selectedStudent.todayActive && <EmotionBadge emotion={selectedStudent.emotion} emotionKey={selectedStudent.emotionKey} />}
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} style={{ background: C.cream, border: 'none', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', fontSize: 14, color: C.slate }}>✕</button>
            </div>

            {/* Riwayat */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.dark, marginBottom: 12 }}>📋 Riwayat Belajar</div>
              {(!selectedStudent.riwayat || selectedStudent.riwayat.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '36px 0' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                  <div style={{ fontSize: 13, color: C.slate }}>Belum ada riwayat belajar</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedStudent.riwayat.map((r, i) => (
                    <div key={i} style={{ background: C.cream, borderRadius: 10, padding: '12px 14px', border: `1px solid rgba(13,92,99,.07)` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>{r.topik}</div>
                          <div style={{ fontSize: 10, color: C.slate, marginTop: 2 }}>{r.tanggal}</div>
                        </div>
                        <span style={{ fontSize: 16 }}>{r.emosi?.split(' ')[0] || '—'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div style={{ flex: 1, background: C.white, borderRadius: 7, padding: '6px 9px', textAlign: 'center' }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: r.quiz / r.quizTotal >= 0.7 ? C.green : r.quiz / r.quizTotal >= 0.5 ? C.amber : C.red }}>{r.quiz}/{r.quizTotal}</div>
                          <div style={{ fontSize: 9, color: C.slate, marginTop: 1 }}>Quiz</div>
                        </div>
                        <div style={{ flex: 1, background: C.white, borderRadius: 7, padding: '6px 9px', textAlign: 'center' }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: C.teal }}>{r.durasi.toFixed(1)} jam</div>
                          <div style={{ fontSize: 9, color: C.slate, marginTop: 1 }}>Durasi</div>
                        </div>
                        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 9, color: C.slate }}>Skor</span>
                            <span style={{ fontSize: 9, fontWeight: 700, color: r.quiz / r.quizTotal >= 0.7 ? C.green : r.quiz / r.quizTotal >= 0.5 ? C.amber : C.red }}>
                              {Math.round(r.quiz / r.quizTotal * 100)}%
                            </span>
                          </div>
                          <div style={{ background: '#E8EFF5', borderRadius: 99, height: 5, overflow: 'hidden' }}>
                            <div style={{ width: `${r.quiz / r.quizTotal * 100}%`, height: '100%', borderRadius: 99, background: r.quiz / r.quizTotal >= 0.7 ? C.green : r.quiz / r.quizTotal >= 0.5 ? C.amber : C.red, transition: 'width .5s' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Rekomen */}
            <div style={{ padding: '14px 18px', borderTop: `1px solid rgba(13,92,99,.08)`, flexShrink: 0 }}>
              {recommendations[selectedStudent.id] && (
                <div style={{ background: C.amberL, borderRadius: 8, padding: '9px 12px', fontSize: 12, marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, color: C.orange, marginBottom: 3 }}>📝 Rekomendasi Aktif</div>
                  <div style={{ color: C.darkL, fontSize: 11 }}>{recommendations[selectedStudent.id]}</div>
                </div>
              )}
              <Btn variant="amber" onClick={() => { setRecModal(selectedStudent.id); setRecText(recommendations[selectedStudent.id] || ''); }}
                style={{ width: '100%', justifyContent: 'center' }}>
                💬 {recommendations[selectedStudent.id] ? 'Edit' : 'Beri'} Rekomendasi
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitoringSection;
