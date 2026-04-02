/**
 * SR MVP — Login Page (REVISED)
 * src/pages/LoginPage.jsx
 *
 * Tambahan: Google login untuk role Siswa
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { C } from '../styles/tokens';
import { Btn, Card, Spinner } from '../components/shared/UI';

/* Mock Google accounts ---------------------------------------------------- */
const GOOGLE_ACCOUNTS = [
  { name: 'Budi Santoso', email: 'budi.santoso@gmail.com', avatar: 'BS', color: C.teal },
  { name: 'Dewi Rahayu', email: 'dewi.rahayu@gmail.com', avatar: 'DR', color: C.purple },
  { name: 'Ahmad Fauzi', email: 'ahmad.fauzi@gmail.com', avatar: 'AF', color: '#E53E3E' },
];

const ROLE_CONFIG = {
  siswa: { label: '🎒 Siswa', placeholder: 'NIS atau email@sekolahrakyat.id' },
  guru: { label: '👨‍🏫 Guru', placeholder: 'guru@sekolahrakyat.id' },
  admin: { label: '🔑 Admin', placeholder: 'admin@sekolahrakyat.id' },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState('siswa');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleModal, setGoogleModal] = useState(false);

  const handleLogin = async () => {
    if (!email || !pass) { setError('Email dan password wajib diisi.'); return; }
    setLoading(true); setError('');
    try {
      await login(email, pass, role);
      navigate(role === 'guru' ? '/guru' : role === 'admin' ? '/admin' : '/siswa', { replace: true });
    } catch {
      setError('Email atau password salah.');
    } finally { setLoading(false); }
  };

  const handleGoogleLogin = (acc) => {
    setLoading(true);
    setTimeout(() => {
      login(acc.email, 'google_oauth', 'siswa')
        .then(() => navigate('/siswa', { replace: true }))
        .catch(() => { })
        .finally(() => setLoading(false));
    }, 900);
    setGoogleModal(false);
  };

  const inp = {
    width: '100%', padding: '10px 14px',
    border: `1.5px solid ${C.tealXL}`, borderRadius: 9,
    fontSize: 14, outline: 'none', background: C.cream, transition: 'border-color .2s',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(135deg,${C.dark} 0%,${C.teal} 100%)`, display: 'flex', overflowY: 'auto', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 40px', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle at 20% 50%,rgba(244,164,53,.12) 0%,transparent 50%),radial-gradient(circle at 80% 20%,rgba(255,255,255,.04) 0%,transparent 40%)` }} />

      <div className="fade-in" style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48 }}>🏫</div>
          <div style={{ fontFamily: "'Source Serif 4',serif", color: C.white, fontSize: 28, fontWeight: 600, marginTop: 8 }}>Sekolah Rakyat</div>
          <div style={{ color: 'rgba(255,255,255,.55)', fontSize: 13, marginTop: 4 }}>Portal Pembelajaran Digital</div>
        </div>

        <Card style={{ padding: 32 }}>
          {/* Role tabs */}
          <div style={{ display: 'flex', background: C.cream, borderRadius: 10, padding: 4, marginBottom: 24, gap: 4 }}>
            {Object.entries(ROLE_CONFIG).map(([r, cfg]) => (
              <button key={r} onClick={() => { setRole(r); setError(''); }} style={{
                flex: 1, padding: '8px 0', borderRadius: 7, border: 'none', fontFamily: 'inherit',
                fontWeight: 600, fontSize: 12, cursor: 'pointer', transition: 'all .2s',
                background: role === r ? C.teal : 'transparent', color: role === r ? C.white : C.darkL,
              }}>{cfg.label}</button>
            ))}
          </div>

          {/* Google login — only siswa */}
          {role === 'siswa' && (
            <>
              <button onClick={() => setGoogleModal(true)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px',
                borderRadius: 10, border: `1.5px solid ${C.tealXL}`, background: C.white,
                cursor: 'pointer', fontFamily: 'inherit', marginBottom: 14, transition: 'all .2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.background = C.tealXL; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.tealXL; e.currentTarget.style.background = C.white; }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#4285F4,#34A853)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff', fontWeight: 800, flexShrink: 0 }}>G</div>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: C.dark }}>Masuk dengan Google</div>
                </div>
                <span style={{ fontSize: 14, color: C.tealL }}>→</span>
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ flex: 1, height: 1, background: C.tealXL }} />
                <span style={{ fontSize: 11, color: C.slate, fontWeight: 600 }}>atau</span>
                <div style={{ flex: 1, height: 1, background: C.tealXL }} />
              </div>
            </>
          )}

          {/* Email + password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.darkL, display: 'block', marginBottom: 6 }}>
                Email {role === 'siswa' ? '/ NIS' : ''}
              </label>
              <input value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder={ROLE_CONFIG[role].placeholder} style={inp}
                onFocus={e => e.target.style.borderColor = C.teal}
                onBlur={e => e.target.style.borderColor = C.tealXL} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.darkL, display: 'block', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={pass}
                  onChange={e => { setPass(e.target.value); setError(''); }}
                  placeholder="••••••••" style={{ ...inp, paddingRight: 40 }}
                  onFocus={e => e.target.style.borderColor = C.teal}
                  onBlur={e => e.target.style.borderColor = C.tealXL}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                <button onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15 }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: C.redL, color: C.red, borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>⚠ {error}</div>
            )}

            <Btn variant="primary" onClick={handleLogin} disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: 12, marginTop: 4 }}>
              {loading ? <><Spinner size={16} color={C.white} /> Masuk...</> : 'Masuk →'}
            </Btn>
          </div>

          {role === 'siswa' && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <span style={{ fontSize: 13, color: C.darkL }}>Belum punya akun? </span>
              <Link to="/daftar" style={{ color: C.teal, fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>Daftar sekarang</Link>
            </div>
          )}
        </Card>

        <div style={{ textAlign: 'center', marginTop: 20, color: 'rgba(255,255,255,.35)', fontSize: 11 }}>
          © 2025 BPSDM Komdigi — AITF · Powered by Model AI Nusantara
        </div>
      </div>

      {/* Google Account Picker */}
      {googleModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div className="bounce-in" style={{ background: C.white, borderRadius: 20, padding: 28, width: '100%', maxWidth: 360, boxShadow: '0 24px 64px rgba(0,0,0,.3)' }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#4285F4,#34A853)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: '#fff', fontWeight: 800, margin: '0 auto 10px' }}>G</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: C.dark }}>Masuk dengan Google</div>
              <div style={{ fontSize: 11, color: C.slate, marginTop: 4 }}>Pilih akun yang ingin digunakan</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
              {GOOGLE_ACCOUNTS.map((acc, i) => (
                <button key={i} onClick={() => handleGoogleLogin(acc)} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
                  borderRadius: 11, border: `1.5px solid ${C.tealXL}`, background: C.cream,
                  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all .15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.tealXL; e.currentTarget.style.borderColor = C.tealL; }}
                  onMouseLeave={e => { e.currentTarget.style.background = C.cream; e.currentTarget.style.borderColor = C.tealXL; }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: acc.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: C.white, fontWeight: 700, flexShrink: 0 }}>{acc.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: C.dark }}>{acc.name}</div>
                    <div style={{ fontSize: 11, color: C.slate }}>{acc.email}</div>
                  </div>
                  <span style={{ fontSize: 10, background: C.greenL, color: C.green, padding: '2px 7px', borderRadius: 99, fontWeight: 700 }}>✓ Terdaftar</span>
                </button>
              ))}
            </div>
            <button onClick={() => setGoogleModal(false)} style={{ width: '100%', padding: 10, border: `1px solid ${C.tealXL}`, borderRadius: 9, background: 'none', cursor: 'pointer', color: C.slate, fontSize: 13 }}>Batal</button>
          </div>
        </div>
      )}
    </div>
  );
}
