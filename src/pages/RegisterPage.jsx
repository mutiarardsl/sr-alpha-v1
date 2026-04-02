/**
 * SR MVP — Register Page (REVISED)
 * src/pages/RegisterPage.jsx
 *
 * Fitur: Google OAuth (mock), manual form, konfirmasi password, Terms & Agreement
 */
import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { C } from '../styles/tokens';
import { Btn, Card, Spinner } from '../components/shared/UI';
import { SEKOLAH_LIST, KELAS_SMA } from '../data/masterData';

/* ── Google accounts mock ─────────────────────────────────────────────── */
const GOOGLE_ACCOUNTS = [
  { name: 'Budi Santoso', email: 'budi.santoso@gmail.com', avatar: 'BS', color: C.teal },
  { name: 'Ahmad Fauzi', email: 'ahmad.fauzi@gmail.com', avatar: 'AF', color: '#E53E3E' },
  { name: 'Dewi Rahayu', email: 'dewi.rahayu@gmail.com', avatar: 'DR', color: C.purple },
];

/* ── Password strength ────────────────────────────────────────────────── */
const strength = (p) => {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
};
const STR_LABEL = ['', 'Lemah', 'Cukup', 'Kuat', 'Sangat Kuat'];
const STR_COLOR = ['', C.red, C.amber, C.tealL, C.green];

/* ── Terms text ───────────────────────────────────────────────────────── */
const TERMS = `SYARAT & KETENTUAN PENGGUNAAN — SEKOLAH RAKYAT
Versi 2.0 | Berlaku: 1 Januari 2026

1. PENERIMAAN
   Dengan mendaftar Anda menyetujui seluruh ketentuan ini. Siswa di bawah 18 tahun memerlukan persetujuan orang tua/wali.

2. AKUN PENGGUNA
   • Data yang diinput harus akurat sesuai identitas asli.
   • Akun bersifat pribadi dan tidak boleh dipindahtangankan.
   • Anda bertanggung jawab menjaga kerahasiaan kata sandi.

3. PENGGUNAAN PLATFORM
   • Hanya untuk tujuan pembelajaran resmi.
   • Dilarang menyebarkan konten yang melanggar norma atau hukum.
   • Dilarang menggunakan untuk kegiatan komersial tanpa izin.

4. DATA & PRIVASI
   • Data digunakan untuk personalisasi pembelajaran dan laporan guru.
   • Data tidak dijual kepada pihak ketiga.
   • Akses kamera hanya aktif selama sesi belajar untuk deteksi emosi; tidak direkam.

5. HAK KEKAYAAN INTELEKTUAL
   Seluruh konten adalah milik Sekolah Rakyat. Dilarang mendistribusikan ulang tanpa izin.

6. PENONAKTIFAN AKUN
   Pelanggaran terhadap ketentuan ini dapat mengakibatkan penonaktifan akun.`;

export default function RegisterPage() {
  const navigate = useNavigate();

  /* ── State: method picker ─────────────────────────────────────── */
  const [method, setMethod] = useState(null);   // null | 'google' | 'manual'
  const [step, setStep] = useState(1);       // 1 = data diri, 2 = akun & keamanan
  const [googleAcc, setGoogleAcc] = useState(null);
  const [googleModal, setGoogleModal] = useState(false);

  /* ── State: form ──────────────────────────────────────────────── */
  const [form, setForm] = useState({ name: '', nis: '', kelas: '', sekolah: '', email: '', pass: '', born: '' });
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [terms, setTerms] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  /* ── Sekolah dropdown ─────────────────────────────────────────── */
  const wrapRef = useRef(null);
  const [dropOpen, setDropOpen] = useState(false);
  const [dropQuery, setDropQuery] = useState('');

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(e => ({ ...e, [k]: null })); };

  const filtered = SEKOLAH_LIST.filter(s =>
    !dropQuery || s.nama.toLowerCase().includes(dropQuery.toLowerCase()) || s.kota.toLowerCase().includes(dropQuery.toLowerCase())
  ).slice(0, 8);

  const kelasByTingkat = [
    { label: 'Kelas X', items: KELAS_SMA.filter(k => k.startsWith('X ') && !k.startsWith('XI') && !k.startsWith('XII')) },
    { label: 'Kelas XI', items: KELAS_SMA.filter(k => k.startsWith('XI ')) },
    { label: 'Kelas XII', items: KELAS_SMA.filter(k => k.startsWith('XII ')) },
  ];

  /* ── Styling atoms ────────────────────────────────────────────── */
  const inp = (field) => ({
    width: '100%', padding: '10px 14px', boxSizing: 'border-box',
    border: `1.5px solid ${errors[field] ? C.red : C.tealXL}`, borderRadius: 9,
    fontSize: 14, outline: 'none', background: C.cream, transition: 'border-color .2s',
  });
  const errTxt = { fontSize: 11, color: C.red, marginTop: 3 };

  /* ── Validation ───────────────────────────────────────────────── */
  const validateStep1 = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Nama wajib diisi';
    if (!form.nis.trim()) e.nis = 'NIS wajib diisi';
    if (!form.kelas) e.kelas = 'Pilih kelas';
    if (!form.sekolah.trim()) e.sekolah = 'Pilih sekolah';
    setErrors(e); return !Object.keys(e).length;
  };
  const validateStep2 = () => {
    const e = {};
    if (!form.email.includes('@')) e.email = 'Email tidak valid';
    if (method === 'manual') {
      if (strength(form.pass) < 2) e.pass = 'Password terlalu lemah (min 8 karakter + angka)';
      if (form.pass !== confirm) e.confirm = 'Password tidak cocok';
    }
    if (!terms) e.terms = 'Kamu harus menyetujui syarat & ketentuan';
    setErrors(e); return !Object.keys(e).length;
  };

  const handleNext = () => {
    if (step === 1) { if (validateStep1()) setStep(2); return; }
    if (!validateStep2()) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); navigate('/pretest'); }, 1100);
  };

  const handleGoogleSelect = (acc) => {
    setGoogleAcc(acc);
    setForm(p => ({ ...p, name: acc.name, email: acc.email }));
    setMethod('google');
    setGoogleModal(false);
    setStep(1);
  };

  const str = strength(form.pass);

  /* ══════════════════════════════════════════════════════════════
     SCREEN A — Pilih metode
  ══════════════════════════════════════════════════════════════ */
  if (!method) return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(135deg,${C.dark} 0%,${C.teal} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="fade-in" style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🏫</div>
          <div style={{ fontFamily: "'Source Serif 4',serif", color: C.white, fontSize: 26, fontWeight: 600 }}>Daftar Akun Siswa</div>
          <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 13, marginTop: 6 }}>Pilih cara pendaftaran</div>
        </div>
        <Card style={{ padding: 28 }}>
          {/* Google */}
          <button onClick={() => setGoogleModal(true)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 12, border: `2px solid ${C.tealXL}`, background: C.white, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s', marginBottom: 14 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.background = C.tealXL; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.tealXL; e.currentTarget.style.background = C.white; }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#4285F4,#34A853)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#fff', fontWeight: 800, flexShrink: 0 }}>G</div>
            <div style={{ textAlign: 'left', flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.dark }}>Daftar dengan Google</div>
            </div>
            <span style={{ fontSize: 16, color: C.tealL }}>→</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1, height: 1, background: C.tealXL }} />
            <span style={{ fontSize: 11, color: C.slate, fontWeight: 600 }}>atau</span>
            <div style={{ flex: 1, height: 1, background: C.tealXL }} />
          </div>

          {/* Manual */}
          <button onClick={() => { setMethod('manual'); setStep(1); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 12, border: `2px solid ${C.tealXL}`, background: C.cream, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.amber; e.currentTarget.style.background = C.amberL; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.tealXL; e.currentTarget.style.background = C.cream; }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg,${C.amber},${C.orange})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>✏️</div>
            <div style={{ textAlign: 'left', flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.dark }}>Daftar Manual</div>
              <div style={{ fontSize: 11, color: C.slate, marginTop: 2 }}>Isi form dengan NIS & data sekolah</div>
            </div>
            <span style={{ fontSize: 16, color: C.amber }}>→</span>
          </button>

          <div style={{ textAlign: 'center', marginTop: 18 }}>
            <Link to="/login" style={{ color: C.darkL, fontSize: 12, textDecoration: 'none' }}>
              Sudah punya akun? <strong style={{ color: C.teal }}>Masuk</strong>
            </Link>
          </div>
        </Card>
      </div>

      {/* Google Picker Modal */}
      {googleModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div className="bounce-in" style={{ background: C.white, borderRadius: 20, padding: 26, width: '100%', maxWidth: 360, boxShadow: '0 24px 64px rgba(0,0,0,.3)' }}>
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#4285F4,#34A853)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#fff', fontWeight: 800, margin: '0 auto 10px' }}>G</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: C.dark }}>Pilih Akun Google</div>
              <div style={{ fontSize: 11, color: C.slate, marginTop: 4 }}>Akun yang dipilih akan otomatis terverifikasi</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
              {GOOGLE_ACCOUNTS.map((acc, i) => (
                <button key={i} onClick={() => handleGoogleSelect(acc)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${C.tealXL}`, background: C.cream, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s', textAlign: 'left' }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.tealXL; e.currentTarget.style.borderColor = C.tealL; }}
                  onMouseLeave={e => { e.currentTarget.style.background = C.cream; e.currentTarget.style.borderColor = C.tealXL; }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: acc.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: C.white, fontWeight: 700, flexShrink: 0 }}>{acc.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: C.dark }}>{acc.name}</div>
                    <div style={{ fontSize: 11, color: C.slate }}>{acc.email}</div>
                  </div>
                  <span style={{ fontSize: 10, background: C.greenL, color: C.green, padding: '2px 7px', borderRadius: 99, fontWeight: 700 }}>✓ Terverifikasi</span>
                </button>
              ))}
            </div>
            <button onClick={() => setGoogleModal(false)} style={{ width: '100%', padding: 10, border: `1px solid ${C.tealXL}`, borderRadius: 9, background: 'none', cursor: 'pointer', color: C.slate, fontSize: 13 }}>Batal</button>
          </div>
        </div>
      )}
    </div>
  );

  /* ══════════════════════════════════════════════════════════════
     SCREEN B — Form steps
  ══════════════════════════════════════════════════════════════ */
  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(135deg,${C.dark} 0%,${C.teal} 100%)`, display: 'flex', alignItems: 'flex-start', overflowY: 'auto', justifyContent: 'center', padding: 24 }}>
      <div className="fade-in" style={{ width: '100%', maxWidth: 480 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          {method === 'google' && googleAcc && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.12)', borderRadius: 99, padding: '5px 14px', marginBottom: 10 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: googleAcc.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: C.white, fontWeight: 700 }}>{googleAcc.avatar}</div>
              <span style={{ color: 'rgba(255,255,255,.8)', fontSize: 12 }}>{googleAcc.email}</span>
              <span style={{ fontSize: 9, background: C.green, color: C.white, padding: '1px 7px', borderRadius: 99 }}>✓ Google</span>
            </div>
          )}
          <div style={{ fontFamily: "'Source Serif 4',serif", color: C.white, fontSize: 24, fontWeight: 600 }}>
            {method === 'google' ? 'Lengkapi Profil Siswa' : 'Daftar Akun Siswa'}
          </div>
          <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 13, marginTop: 4 }}>
            Langkah {step} dari 2 — {step === 1 ? 'Data Diri' : method === 'google' ? 'Verifikasi & Persetujuan' : 'Akun & Keamanan'}
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,.15)', borderRadius: 99, marginTop: 10, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${step * 50}%`, background: C.amber, borderRadius: 99, transition: 'width .5s' }} />
          </div>
        </div>

        <Card style={{ padding: 24 }}>
          {/* ── STEP 1 — Data Diri ─────────────────────────────── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.darkL, display: 'block', marginBottom: 5 }}>Nama Lengkap</label>
                  <input style={inp('name')} placeholder="Nama lengkap" value={form.name}
                    onChange={e => set('name', e.target.value)} readOnly={method === 'google'}
                    onFocus={e => !errors.name && (e.target.style.borderColor = C.teal)}
                    onBlur={e => !errors.name && (e.target.style.borderColor = C.tealXL)} />
                  {errors.name && <div style={errTxt}>{errors.name}</div>}
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.darkL, display: 'block', marginBottom: 5 }}>NIS</label>
                  <input style={inp('nis')} placeholder="0000000" value={form.nis}
                    onChange={e => set('nis', e.target.value)}
                    onFocus={e => !errors.nis && (e.target.style.borderColor = C.teal)}
                    onBlur={e => !errors.nis && (e.target.style.borderColor = C.tealXL)} />
                  {errors.nis && <div style={errTxt}>{errors.nis}</div>}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.darkL, display: 'block', marginBottom: 5 }}>Kelas</label>
                <select style={{ ...inp('kelas'), appearance: 'none', color: form.kelas ? C.dark : C.slate }}
                  value={form.kelas} onChange={e => set('kelas', e.target.value)}>
                  <option value="">— Pilih Kelas —</option>
                  {kelasByTingkat.map(g => (
                    <optgroup key={g.label} label={g.label}>
                      {g.items.map(k => <option key={k} value={k}>{k}</option>)}
                    </optgroup>
                  ))}
                </select>
                {errors.kelas && <div style={errTxt}>{errors.kelas}</div>}
              </div>
              <div ref={wrapRef} style={{ position: 'relative' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.darkL, display: 'block', marginBottom: 5 }}>Sekolah Rakyat</label>
                <input style={inp('sekolah')} placeholder="Ketik nama kota atau sekolah..."
                  value={dropQuery || form.sekolah}
                  onFocus={() => setDropOpen(true)}
                  onBlur={() => setTimeout(() => setDropOpen(false), 200)}
                  onChange={e => { setDropQuery(e.target.value); set('sekolah', e.target.value); setDropOpen(true); }} />
                {errors.sekolah && <div style={errTxt}>{errors.sekolah}</div>}
                {dropOpen && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 200, background: C.white, borderRadius: 10, boxShadow: '0 8px 24px rgba(13,92,99,.15)', border: `1.5px solid ${C.tealXL}`, maxHeight: 220, overflowY: 'auto' }}>
                    {filtered.map(s => (
                      <div key={s.id} onMouseDown={() => { set('sekolah', s.nama); setDropQuery(s.nama); setDropOpen(false); }}
                        style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: `1px solid ${C.tealXL}22` }}
                        onMouseEnter={e => e.currentTarget.style.background = C.tealXL}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>{s.nama}</div>
                        <div style={{ fontSize: 11, color: C.slate }}>{s.kota} · {s.provinsi}</div>
                      </div>
                    ))}
                    {filtered.length === 0 && <div style={{ padding: '12px 14px', fontSize: 12, color: C.slate }}>Sekolah tidak ditemukan</div>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 2 — Akun & Terms ─────────────────────────── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Summary */}
              <div style={{ background: C.tealXL, borderRadius: 10, padding: '10px 14px', fontSize: 12, color: C.teal }}>
                <div style={{ fontWeight: 700, marginBottom: 3 }}>📋 Ringkasan Data Diri</div>
                <div><strong>Nama:</strong> {form.name} · <strong>NIS:</strong> {form.nis}</div>
                <div><strong>Kelas:</strong> {form.kelas} · <strong>Sekolah:</strong> {form.sekolah}</div>
              </div>

              {/* Email */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.darkL, display: 'block', marginBottom: 5 }}>Email</label>
                <div style={{ position: 'relative' }}>
                  <input style={{ ...inp('email'), paddingRight: method === 'google' ? 100 : 14 }}
                    placeholder="email@gmail.com" value={form.email}
                    onChange={e => set('email', e.target.value)} readOnly={method === 'google'}
                    onFocus={e => method !== 'google' && !errors.email && (e.target.style.borderColor = C.teal)}
                    onBlur={e => !errors.email && (e.target.style.borderColor = C.tealXL)} />
                  {method === 'google' && (
                    <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 10, background: C.green, color: C.white, padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>✓ Google</span>
                  )}
                </div>
                {errors.email && <div style={errTxt}>{errors.email}</div>}
              </div>

              {/* Password — hanya manual */}
              {method === 'manual' ? (
                <>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.darkL, display: 'block', marginBottom: 5 }}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showPass ? 'text' : 'password'}
                        style={{ ...inp('pass'), paddingRight: 40 }}
                        placeholder="Min 8 karakter" value={form.pass}
                        onChange={e => set('pass', e.target.value)}
                        onFocus={e => !errors.pass && (e.target.style.borderColor = C.teal)}
                        onBlur={e => !errors.pass && (e.target.style.borderColor = C.tealXL)} />
                      <button onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15 }}>
                        {showPass ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {form.pass && (
                      <div style={{ marginTop: 6 }}>
                        <div style={{ display: 'flex', gap: 3, marginBottom: 3 }}>
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i <= str ? STR_COLOR[str] : C.tealXL, transition: 'background .3s' }} />
                          ))}
                        </div>
                        <div style={{ fontSize: 10, color: STR_COLOR[str], fontWeight: 600 }}>{STR_LABEL[str]} · gunakan huruf besar + angka + simbol</div>
                      </div>
                    )}
                    {errors.pass && <div style={errTxt}>{errors.pass}</div>}
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.darkL, display: 'block', marginBottom: 5 }}>Konfirmasi Password</label>
                    <input type="password"
                      style={{ ...inp('confirm'), borderColor: errors.confirm ? C.red : confirm && confirm === form.pass ? C.green : C.tealXL }}
                      placeholder="Ulangi password" value={confirm}
                      onChange={e => { setConfirm(e.target.value); setErrors(ev => ({ ...ev, confirm: null })); }}
                      onFocus={e => e.target.style.borderColor = C.teal}
                      onBlur={e => e.target.style.borderColor = confirm === form.pass ? C.green : C.tealXL} />
                    {confirm && confirm === form.pass && <div style={{ fontSize: 11, color: C.green, marginTop: 3 }}>✓ Password cocok</div>}
                    {errors.confirm && <div style={errTxt}>{errors.confirm}</div>}
                  </div>
                </>
              ) : (
                <div style={{ background: C.greenL, borderRadius: 10, padding: '12px 14px', fontSize: 12, color: C.green, display: 'flex', gap: 10 }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>🔐</span>
                  <div><strong>Keamanan dikelola Google.</strong> Login menggunakan akun Google — tidak perlu password terpisah.</div>
                </div>
              )}

              {/* Terms */}
              <div style={{ background: C.cream, borderRadius: 10, border: `1.5px solid ${errors.terms ? C.red : C.tealXL}`, padding: '12px 14px' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <input type="checkbox" id="terms" checked={terms}
                    onChange={e => { setTerms(e.target.checked); setErrors(ev => ({ ...ev, terms: null })); }}
                    style={{ marginTop: 2, accentColor: C.teal, width: 16, height: 16, cursor: 'pointer', flexShrink: 0 }} />
                  <label htmlFor="terms" style={{ fontSize: 12, color: C.darkL, cursor: 'pointer', lineHeight: 1.6 }}>
                    Saya menyetujui{' '}
                    <button onClick={() => setTermsOpen(true)}
                      style={{ background: 'none', border: 'none', color: C.teal, fontWeight: 700, fontSize: 12, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                      Syarat & Ketentuan
                    </button>
                    {' '}Sekolah Rakyat, termasuk akses kamera untuk deteksi emosi saat belajar.
                  </label>
                </div>
                {errors.terms && <div style={{ ...errTxt, marginTop: 6 }}>{errors.terms}</div>}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <Btn variant="ghost" onClick={() => { if (step === 1) setMethod(null); else setStep(1); }}
              style={{ flex: '0 0 auto', padding: '10px 16px' }}>← Kembali</Btn>
            <Btn variant={step === 2 ? 'amber' : 'primary'} onClick={handleNext} disabled={loading}
              style={{ flex: 1, justifyContent: 'center', padding: 12 }}>
              {loading ? <><Spinner size={16} color={C.dark} /> Memproses...</> : step === 1 ? 'Lanjut →' : '✅ Daftar & Mulai'}
            </Btn>
          </div>
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <Link to="/login" style={{ color: C.darkL, fontSize: 12, textDecoration: 'none' }}>
              Sudah punya akun? <strong style={{ color: C.teal }}>Masuk</strong>
            </Link>
          </div>
        </Card>
      </div>

      {/* Terms Modal */}
      {termsOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: C.white, borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,.3)' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.tealXL}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>📜</span>
              <div style={{ fontWeight: 700, fontSize: 15, color: C.dark, flex: 1 }}>Syarat & Ketentuan Penggunaan</div>
              <button onClick={() => setTermsOpen(false)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: C.slate }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
              <pre style={{ fontSize: 12, color: C.darkL, lineHeight: 1.85, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{TERMS}</pre>
            </div>
            <div style={{ padding: '14px 20px', borderTop: `1px solid ${C.tealXL}`, display: 'flex', gap: 10 }}>
              <Btn variant="ghost" onClick={() => setTermsOpen(false)} style={{ flex: 1, justifyContent: 'center' }}>Tutup</Btn>
              <Btn variant="primary" onClick={() => { setTerms(true); setTermsOpen(false); }} style={{ flex: 1, justifyContent: 'center' }}>✓ Setuju & Tutup</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
