/**
 * SR MVP — TeacherView Shell
 * Tim 6 Fase 2 | src/components/teacher/TeacherView.jsx
 *
 * Shell: state + routing only. Render logic → sections/.
 * WebSocket live monitoring diintegrasikan di MonitoringSection.
 */
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ChangePasswordModal from '../shared/ChangePasswordModal';
import { C } from '../../styles/tokens';
import { SUBJECTS, TEACHERS, SEEDED_TEACHER_ID, CLASSES } from '../../data/masterData';

import MonitoringSection from './sections/MonitoringSection';
import UploadSection from './sections/UploadSection';
import GameSection from './sections/GameSection';

const TeacherView = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const onNavigate = (screen) => {
    if (screen === 'login') { logout(); navigate('/login', { replace: true }); return; }
    if (screen === 'student') { navigate('/siswa'); return; }
  };

  const [activeClass, setActiveClass] = useState('10ipa1');
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [recommendations, setRecommendations] = useState({});
  const [recModal, setRecModal] = useState(null);
  const [recText, setRecText] = useState('');
  const [recPipeline, setRecPipeline] = useState(null);
  const [sentToAI, setSentToAI] = useState({});
  const [downloadModal, setDownloadModal] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [pwdToast, setPwdToast] = useState(false);
  const [nilaiUploads, setNilaiUploads] = useState([
    { id: 'uv1', filename: 'nilai_uts_mat_x_ipa1.csv', tanggal: '10 Mar 2026', status: 'Selesai', siswa: 32, kelas: 'X IPA 1' },
    { id: 'uv2', filename: 'nilai_harian_mat_xi_ipa2.xlsx', tanggal: '5 Mar 2026', status: 'Selesai', siswa: 28, kelas: 'XI IPA 2' },
  ]);
  const [uploading, setUploading] = useState(false);
  const [gameForm, setGameForm] = useState({ mapel: '', topik: '', prompt: '', kelas: '' });
  const [gameGenerating, setGameGenerating] = useState(false);
  const [gamePreview, setGamePreview] = useState(null);
  const [gameSent, setGameSent] = useState(false);
  const [barTooltip, setBarTooltip] = useState(null);
  const [recAttachments, setRecAttachments] = useState({});
  const [recUploadDragging, setRecUploadDragging] = useState(false);
  const recFileInputRef = useRef(null);

  const teacher = TEACHERS.find(t => t.id === SEEDED_TEACHER_ID);
  const teacherMapel = SUBJECTS.find(s => s.id === teacher?.mapelId);
  const cls = CLASSES.find(c => c.id === activeClass);

  const saveRec = (studentId) => {
    const text = recText.trim(); if (!text) return;
    setRecommendations(p => ({ ...p, [studentId]: text }));
    setRecModal(null); setRecText(''); setRecPipeline('saving');
    setTimeout(() => setRecPipeline('tim3'), 800);
    setTimeout(() => setRecPipeline('tim5'), 1800);
    setTimeout(() => {
      setRecPipeline('done');
      setSentToAI(p => ({ ...p, [studentId]: { mapelId: teacher?.mapelId, text, ts: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) } }));
      if (typeof window !== 'undefined') window.__srAiContext = window.__srAiContext || {};
      window.__srAiContext[studentId] = { mapelId: teacher?.mapelId, text };
      setTimeout(() => setRecPipeline(null), 2500);
    }, 3000);
  };

  const handleRecFileSelect = (files, studentId) => {
    if (!files) return;
    const allowed = /\.(jpg|jpeg|png|pdf|docx|doc|xlsx|mp4)$/i;
    const parsed = Array.from(files).filter(f => allowed.test(f.name)).map(f => ({
      name: f.name,
      size: f.size > 1024 * 1024 ? `${(f.size / 1024 / 1024).toFixed(1)} MB` : `${Math.round(f.size / 1024)} KB`,
      ext: f.name.split('.').pop().toLowerCase(),
    }));
    setRecAttachments(p => ({ ...p, [studentId]: [...(p[studentId] || []), ...parsed].slice(0, 5) }));
  };
  const removeRecAttachment = (sid, idx) => setRecAttachments(p => ({ ...p, [sid]: (p[sid] || []).filter((_, i) => i !== idx) }));

  const navItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'upload', icon: '📤', label: 'Upload Nilai' },
    { id: 'buatgame', icon: '🎮', label: 'Buat Game' },
  ];

  const sharedMonitoring = {
    teacher, teacherMapel, cls, activeClass, setActiveClass,
    recommendations, recModal, setRecModal, recText, setRecText,
    recPipeline, setRecPipeline, sentToAI, setSentToAI,
    downloadModal, setDownloadModal, downloadLoading, setDownloadLoading,
    recAttachments, setRecAttachments, recUploadDragging, setRecUploadDragging,
    recFileInputRef, handleRecFileSelect, removeRecAttachment, saveRec,
    barTooltip, setBarTooltip, selectedStudent, setSelectedStudent,
  };

  return (
    <>
      <div style={{ display: 'flex', height: '100vh', background: C.cream, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ width: 210, background: C.dark, display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>🏫</span>
            <div>
              <div style={{ color: C.white, fontWeight: 700, fontSize: 13 }}>Sekolah Rakyat</div>

              <div style={{ color: 'rgba(255,255,255,.4)', fontSize: 9 }}>Portal Guru</div>
            </div>
          </div>
          <div style={{ padding: '14px', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: teacher?.bg || `linear-gradient(135deg,${C.teal},${C.tealL})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{teacher?.initials || 'GR'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: C.white, fontWeight: 700, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{teacher?.name || 'Guru'}</div>
                <div style={{ color: teacherMapel?.color || C.teal, fontSize: 10, fontWeight: 700, marginTop: 1 }}>{teacherMapel?.icon} {teacherMapel?.label}</div>
              </div>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 6px' }}>
            <div style={{ padding: "6px 10px", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,.25)", textTransform: "uppercase", letterSpacing: 1.5 }}>Menu Utama</div>
            {navItems.map(item => (
              <button key={item.id} onClick={() => setActivePage(item.id)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px', background: activePage === item.id ? 'rgba(13,92,99,.5)' : 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 2, transition: 'all .15s' }}
                onMouseEnter={e => { if (activePage !== item.id) e.currentTarget.style.background = 'rgba(255,255,255,.06)'; }}
                onMouseLeave={e => { if (activePage !== item.id) e.currentTarget.style.background = 'transparent'; }}>
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                <span style={{ fontSize: 12, fontWeight: activePage === item.id ? 700 : 400, color: activePage === item.id ? C.white : 'rgba(255,255,255,.55)' }}>{item.label}</span>
                {activePage === item.id && <span style={{ marginLeft: 'auto', width: 4, height: 4, borderRadius: '50%', background: C.amber }} />}
              </button>
            ))}
            <div style={{ padding: "0 6px", marginTop: 8 }}>
              <div style={{ padding: "6px 10px", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,.25)", textTransform: "uppercase", letterSpacing: 1.5 }}>Daftar Kelas</div>
              {CLASSES.map(c => (
                <button key={c.id} onClick={() => setActiveClass(c.id)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px",
                    background: activeClass === c.id ? "rgba(13,92,99,.45)" : "transparent",
                    border: "none", borderRadius: 8, color: activeClass === c.id ? C.white : "rgba(255,255,255,.5)",
                    fontFamily: "inherit", fontSize: 11, cursor: "pointer", marginBottom: 2, transition: "all .18s"
                  }}>
                  <span>{c.label}</span>
                  <span style={{ background: "rgba(255,255,255,.1)", borderRadius: 99, padding: "1px 7px", fontSize: 9 }}>{c.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: '6px 8px 8px', borderTop: '1px solid rgba(255,255,255,.07)', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <button onClick={() => setShowChangePwd(true)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, color: 'rgba(255,255,255,.45)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
              <span>🔐</span> Ganti Password
            </button>
            <button onClick={() => onNavigate('login')}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'rgba(229,62,62,.12)', border: '1px solid rgba(229,62,62,.2)', borderRadius: 8, color: 'rgba(229,62,62,.75)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
              <span>🚪</span> Keluar / Logout
            </button>
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {activePage === 'dashboard' && <MonitoringSection {...sharedMonitoring} />}
          {activePage === 'upload' && <UploadSection teacherMapel={teacherMapel} cls={cls} nilaiUploads={nilaiUploads} uploading={uploading} setUploading={setUploading} setNilaiUploads={setNilaiUploads} />}
          {activePage === 'buatgame' && <GameSection gameForm={gameForm} setGameForm={setGameForm} gameGenerating={gameGenerating} setGameGenerating={setGameGenerating} gamePreview={gamePreview} setGamePreview={setGamePreview} gameSent={gameSent} setGameSent={setGameSent} />}
        </div>
      </div>

      {/* RecPipeline toast */}
      {recPipeline && recPipeline !== 'done' && (
        <div style={{ position: 'fixed', bottom: 28, right: 24, background: C.dark, color: C.white, borderRadius: 12, padding: '12px 18px', fontSize: 12, zIndex: 9999, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.3)', borderTopColor: C.white, borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
          {recPipeline === 'saving' && 'Menyimpan rekomendasi…'}
          {recPipeline === 'tim3' && 'Mengirim ke Tim 3 RAG…'}
          {recPipeline === 'tim5' && 'Mengirim ke Tim 5 Mentor…'}
        </div>
      )}
      {recPipeline === 'done' && (
        <div style={{ position: 'fixed', bottom: 28, right: 24, background: C.green, color: '#fff', borderRadius: 12, padding: '12px 18px', fontSize: 12, zIndex: 9999, fontWeight: 700 }}>
          ✅ Rekomendasi dikirim ke AI!
        </div>
      )}

      {showChangePwd && <ChangePasswordModal role="guru" userName={teacher?.name || 'Guru'} onClose={() => setShowChangePwd(false)} onSuccess={() => { setPwdToast(true); setTimeout(() => setPwdToast(false), 3500); }} />}
      {pwdToast && <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: C.green, color: '#fff', borderRadius: 99, padding: '10px 22px', fontSize: 13, fontWeight: 700, zIndex: 9999 }}>✅ Password berhasil diubah!</div>}
    </>
  );
};

export default TeacherView;
