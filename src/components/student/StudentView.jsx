/**
 * SR MVP — StudentView Shell (REVISED)
 * src/components/student/StudentView.jsx
 *
 * Perubahan:
 *  - Kamera: camGranted state dikelola di sini, di-reset saat buka chat baru
 *  - recentActivity + addRecentActivity → diteruskan ke Dashboard & Chat
 *  - openChatWithWebcam: dipakai oleh "Mulai Belajar" & "Lanjutkan"
 *    → set chatMateri + reset camGranted → navigasi ke chat
 *  - Hapus showCamModal (modal kamera sekarang inside ChatSection)
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Btn } from '../shared/UI';
import ChangePasswordModal from '../shared/ChangePasswordModal';
import { C } from '../../styles/tokens';
import { CONF_CONTENT_INIT, PROGRESS_DATA_INIT, DUMMY_MESSAGES } from '../../data/masterData';
import DashboardSection from './sections/DashboardSection';
import ProgressSection from './sections/ProgressSection';
import SearchSection from './sections/SearchSection';
import GameSection from './sections/GameSection';
import ChatSection from './sections/ChatSection';

const makeKey = (mapelId, sub) => `${mapelId}__${sub}`;

const StudentView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  // Ambil pretestResult dari navigation state (dikirim oleh PretestPage)
  const pretestResult = location.state?.pretestResult || null;

  const onNavigate = (screen) => {
    if (screen === 'login') { logout(); navigate('/login', { replace: true }); return; }
    if (screen === 'teacher') { navigate('/guru'); return; }
    if (screen === 'dashboard' || screen === 'student') { navigate('/siswa'); return; }
  };

  /* ── Navigation ─────────────────────────────────────────────── */
  const [activePage, setActivePage] = useState('dashboard');

  /* ── Chat state ─────────────────────────────────────────────── */
  const [chatMateri, setChatMateri] = useState(null);
  // msgsByKey: key adalah mapelId__subMateri (untuk topik) atau mapel__mapelId (untuk greeting mapel)
  // DUMMY_MESSAGES sudah menggunakan format key yang benar, di-merge di sini sebagai riwayat awal
  const [msgsByKey, setMsgsByKey] = useState({ ...DUMMY_MESSAGES });
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [sttActive, setSttActive] = useState(false);
  const [ttsActive, setTtsActive] = useState(false);
  const messagesEnd = useRef(null);
  const chatFileRef = useRef(null);
  const [chatAttachments, setChatAttachments] = useState([]);

  /* ── Content / quiz state ───────────────────────────────────── */
  const [confContent, setConfContent] = useState(CONF_CONTENT_INIT);
  const [confOverlay, setConfOverlay] = useState(null);
  const [confGenerating, setConfGenerating] = useState(false);
  const [flashIdx, setFlashIdx] = useState(0);
  const [flashFlipped, setFlashFlipped] = useState(false);
  const [quizActive, setQuizActive] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [progressData, setProgressData] = useState(PROGRESS_DATA_INIT);

  /* ── Camera (inside ChatSection) ────────────────────────────── */
  const [camGranted, setCamGranted] = useState(false);
  const [camPendingMateri, setCamPendingMateri] = useState(null);
  const [showCamModal, setShowCamModal] = useState(false);

  /* ── Recent activity (dashboard) ────────────────────────────── */
  const [recentActivity, setRecentActivity] = useState([]);
  const addRecentActivity = (entry) => {
    setRecentActivity(prev => [entry, ...prev].slice(0, 20));
  };

  /* ── Search ─────────────────────────────────────────────────── */
  const [searchQ, setSearchQ] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchConfirmTopic, setSearchConfirmTopic] = useState(null);
  const [searchGenerating, setSearchGenerating] = useState(false);
  const [searchGenDone, setSearchGenDone] = useState(false);

  /* ── Misc modals ─────────────────────────────────────────────── */
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [pwdToast, setPwdToast] = useState(false);

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [msgsByKey, typing, chatMateri]);
  /* ── Open chat with webcam flow ─────────────────────────────── */

  // Dipanggil oleh "Mulai Belajar" (dari rekomendasi) & "Lanjutkan" (dari progress).
  // materiOrMapel: { mapelId, mapelLabel, mapelIcon, mapelColor, [subMateri] }
  //const openChatWithWebcam = (materiOrMapel) => {
  //setChatMateri(materiOrMapel);
  //setCamGranted(false);                       // selalu reset agar kamera minta izin ulang
  //setQuizActive(false);
  //setQuizAnswers({});
  //setQuizSubmitted(false);
  //setConfOverlay(null);
  //setActivePage('chat');
  //};
  const openChatWithWebcam = (materiOrMapel) => {
    setCamPendingMateri(materiOrMapel);
    setShowCamModal(true);
  };

  const startChat = (materiOrMapel) => {
    setChatMateri(materiOrMapel);
    setCamGranted(true);
    setActivePage("chat");
    setQuizActive(false);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setConfOverlay(null);
    // Catatan: pesan untuk topik/mapel akan diinisialisasi di ChatSection via getGreet/getTopikMateri
    // jika belum ada di msgsByKey — tidak perlu pre-populate di sini
  };

  /* ── Nav items ───────────────────────────────────────────────── */
  const navItems = [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { id: 'progress', icon: '📈', label: 'Progress Belajar' },
    { id: 'search', icon: '🔍', label: 'Cari Topik' },
    { id: 'game', icon: '🎮', label: 'Game Edukasi' },
  ];

  const sharedChat = {
    chatMateri, setChatMateri,
    msgsByKey, setMsgsByKey,
    input, setInput, typing, setTyping,
    sttActive, setSttActive, ttsActive, setTtsActive,
    confContent, setConfContent, confOverlay, setConfOverlay, confGenerating, setConfGenerating,
    flashIdx, setFlashIdx, flashFlipped, setFlashFlipped,
    quizActive, setQuizActive, quizAnswers, setQuizAnswers, quizSubmitted, setQuizSubmitted,
    progressData, setProgressData,
    messagesEnd, chatFileRef, chatAttachments, setChatAttachments,
    setActivePage,
    camGranted, setCamGranted,
    addRecentActivity,
  };

  return (
    <>
      <div style={{ display: 'flex', height: '100vh', background: C.cream, overflow: 'hidden' }}>

        {/* ── Sidebar (hidden during chat) ── */}
        {activePage !== 'chat' && (
          <div style={{ width: 210, background: C.dark, display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>
            {/* Logo */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>🏫</span>
              <div>
                <div style={{ color: C.white, fontWeight: 700, fontSize: 13 }}>Sekolah Rakyat</div>
                <div style={{ color: 'rgba(255,255,255,.4)', fontSize: 9 }}>Portal Siswa</div>
              </div>
            </div>

            {/* User info */}
            <div style={{ padding: '14px', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg,${C.teal},${C.tealL})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, border: `2px solid ${C.amber}`, flexShrink: 0 }}>BS</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: C.white, fontWeight: 700, fontSize: 13 }}>Budi Santoso</div>
                  <div style={{ color: 'rgba(255,255,255,.4)', fontSize: 10, marginTop: 1 }}>SR Kota Malang</div>
                  <div style={{ color: 'rgba(255,255,255,.35)', fontSize: 10 }}>Kelas X IPA 1</div>
                </div>
              </div>
            </div>

            {/* Nav items */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 6px' }}>
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
            </div>

            {/* Footer */}
            <div style={{ padding: '6px 8px 8px', borderTop: '1px solid rgba(255,255,255,.07)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <button onClick={() => setShowChangePwd(true)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, color: 'rgba(255,255,255,.45)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.1)'; e.currentTarget.style.color = 'rgba(255,255,255,.8)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.04)'; e.currentTarget.style.color = 'rgba(255,255,255,.45)'; }}>
                <span>🔐</span> Ganti Password
              </button>
              <button onClick={() => onNavigate('login')}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'rgba(229,62,62,.12)', border: '1px solid rgba(229,62,62,.2)', borderRadius: 8, color: 'rgba(229,62,62,.75)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(229,62,62,.22)'; e.currentTarget.style.color = '#E53E3E'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(229,62,62,.12)'; e.currentTarget.style.color = 'rgba(229,62,62,.75)'; }}>
                <span>🚪</span> Keluar / Logout
              </button>
            </div>
          </div>
        )}

        {/* ── Main content ── */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', width: '100%' }}>
          {activePage === 'dashboard' && (
            <DashboardSection
              progressData={progressData}
              setActivePage={setActivePage}
              openChatWithWebcam={openChatWithWebcam}
              recentActivity={recentActivity}
              pretestResult={pretestResult}
            />
          )}
          {activePage === 'progress' && (
            <ProgressSection
              progressData={progressData}
              openChatWithWebcam={openChatWithWebcam}
            />
          )}
          {activePage === 'search' && (
            <SearchSection
              progressData={progressData} openChatWithWebcam={openChatWithWebcam} setActivePage={setActivePage}
              searchQ={searchQ} setSearchQ={setSearchQ}
              searchResult={searchResult} setSearchResult={setSearchResult}
              searchConfirmTopic={searchConfirmTopic} setSearchConfirmTopic={setSearchConfirmTopic}
              searchGenerating={searchGenerating} setSearchGenerating={setSearchGenerating}
              searchGenDone={searchGenDone} setSearchGenDone={setSearchGenDone}
            />
          )}
          {activePage === 'game' && <GameSection />}
          {activePage === 'chat' && <ChatSection {...sharedChat} />}
        </div>
      </div>

      {/* ── Popup Kamera — sederhana, tanpa scan/frame ── */}
      {showCamModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(26,35,50,.6)", backdropFilter: "blur(4px)",
          zIndex: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: 24
        }}>
          <div className="bounce-in" style={{
            background: C.white, borderRadius: 20, width: 400, padding: 28,
            boxShadow: "0 24px 60px rgba(0,0,0,.25)"
          }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>📷</div>
              <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 18, fontWeight: 600, color: C.dark, marginBottom: 6 }}>
                Izinkan Akses Kamera?
              </div>
              <div style={{ fontSize: 13, color: C.darkL, lineHeight: 1.6 }}>
                Mentor AI membutuhkan kamera untuk mendeteksi emosi belajarmu saat mempelajari{" "}
                <strong style={{ color: C.teal }}>{camPendingMateri?.subMateri || "materi"}</strong>
              </div>
            </div>
            <div style={{ background: C.cream, borderRadius: 10, padding: "10px 14px", marginBottom: 20, fontSize: 12, color: C.slate, lineHeight: 1.6 }}>
              🔒 Data kamera hanya diproses lokal untuk deteksi emosi.
              Kamera <strong>otomatis mati</strong> saat kamu keluar dari sesi belajar.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn variant="ghost" onClick={() => { setShowCamModal(false); setCamPendingMateri(null); }} style={{ flex: 1, justifyContent: "center" }}>
                Tidak Sekarang
              </Btn>
              <Btn variant="amber" onClick={() => {
                setShowCamModal(false);
                if (camPendingMateri) {
                  startChat(camPendingMateri);
                  setCamPendingMateri(null);
                }
              }} style={{ flex: 2, justifyContent: "center" }}>
                📷 Izinkan & Mulai Belajar
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* ── Change Password Modal ── */}
      {showChangePwd && (
        <ChangePasswordModal
          role="siswa" userName="Budi Santoso"
          onClose={() => setShowChangePwd(false)}
          onSuccess={() => { setPwdToast(true); setTimeout(() => setPwdToast(false), 3500); }}
        />
      )}

      {/* ── Toast ── */}
      {pwdToast && (
        <div className="bounce-in" style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: C.green, color: '#fff', borderRadius: 99, padding: '10px 22px', fontSize: 13, fontWeight: 700, zIndex: 9999 }}>
          ✅ Password berhasil diubah!
        </div>
      )}
    </>
  );
};

export default StudentView;
