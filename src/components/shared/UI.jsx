/**
 * SR MVP — Shared UI Components
 * Tim 6 Fase 2 | src/components/shared/UI.jsx
 *
 * Komponen atom yang dipakai di seluruh aplikasi.
 * Semua token warna dari src/styles/tokens.js
 */

import { C } from '../../styles/tokens';

// ── Button ─────────────────────────────────────────────────────────
export const Btn = ({ children, variant = 'primary', onClick, style = {}, disabled = false, size = 'md' }) => {
  const sizes = { sm: '6px 12px', md: '9px 18px', lg: '12px 28px' };
  const vars = {
    primary: { background: C.teal,   color: C.white,  boxShadow: `0 2px 8px rgba(13,92,99,.3)` },
    amber:   { background: C.amber,  color: C.dark,   boxShadow: `0 2px 8px rgba(244,164,53,.3)` },
    ghost:   { background: 'transparent', color: C.teal, border: `1.5px solid ${C.teal}` },
    danger:  { background: C.red,    color: C.white },
    soft:    { background: C.tealXL, color: C.teal },
    dark:    { background: C.dark,   color: C.white },
    green:   { background: C.green,  color: C.white },
  };
  return (
    <button
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: sizes[size], borderRadius: 8, border: 'none',
        fontFamily: 'inherit', fontWeight: 600, fontSize: size === 'sm' ? 12 : 14,
        transition: 'all .18s', cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? .5 : 1, ...vars[variant], ...style,
      }}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.opacity = '.9'; } }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.opacity = '1'; }}
    >
      {children}
    </button>
  );
};

// ── Badge ──────────────────────────────────────────────────────────
export const Badge = ({ label, color = 'teal' }) => {
  const m = {
    teal:   { bg: C.tealXL,  fg: C.teal },
    amber:  { bg: C.amberL,  fg: C.orange },
    red:    { bg: C.redL,    fg: C.red },
    green:  { bg: C.greenL,  fg: C.green },
    purple: { bg: C.purpleL, fg: C.purple },
    slate:  { bg: '#EDF2F7', fg: C.darkL },
  };
  const s = m[color] ?? m.teal;
  return (
    <span style={{ background: s.bg, color: s.fg, padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
      {label}
    </span>
  );
};

// ── Avatar ─────────────────────────────────────────────────────────
export const Avatar = ({ initials, bg = '#0D5C63', size = 36 }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%', background: bg,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 700, fontSize: size * .35, flexShrink: 0,
  }}>
    {initials}
  </div>
);

// ── ProgressBar ────────────────────────────────────────────────────
export const ProgressBar = ({ value, color = C.teal, height = 6 }) => (
  <div style={{ background: '#E8EFF5', borderRadius: 99, height, overflow: 'hidden', flex: 1 }}>
    <div style={{ width: `${Math.min(value, 100)}%`, height: '100%', background: color, borderRadius: 99, transition: 'width .6s' }} />
  </div>
);

// ── Card ───────────────────────────────────────────────────────────
export const Card = ({ children, style = {} }) => (
  <div style={{
    background: C.white, borderRadius: 14,
    boxShadow: '0 2px 12px rgba(26,35,50,.07)',
    border: `1px solid rgba(13,92,99,.08)`, ...style,
  }}>
    {children}
  </div>
);

// ── Divider ────────────────────────────────────────────────────────
export const Divider = () => (
  <div style={{ height: 1, background: 'rgba(13,92,99,.08)', margin: '10px 0' }} />
);

// ── Emotion helpers ────────────────────────────────────────────────
export const EmotionColor = { senang: C.green, netral: C.darkL, bingung: C.amber, sedih: C.red };

export const EmotionBadge = ({ emotion, emotionKey }) => (
  <span style={{
    background: (EmotionColor[emotionKey] ?? C.dark) + '22',
    color: EmotionColor[emotionKey] ?? C.dark,
    padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
  }}>
    {emotion}
  </span>
);

// ── Loading Spinner ────────────────────────────────────────────────
export const Spinner = ({ size = 18, color = C.teal }) => (
  <div style={{
    width: size, height: size,
    border: `2px solid rgba(13,92,99,.15)`,
    borderTopColor: color,
    borderRadius: '50%',
    animation: 'spin .8s linear infinite',
    flexShrink: 0,
  }} />
);

// ── Status Badge ───────────────────────────────────────────────────
export const StatusBadge = ({ status }) => {
  const cfg = {
    'Aktif':    { bg: C.greenL, color: C.green },
    'Cuti':     { bg: C.amberL, color: C.orange },
    'Nonaktif': { bg: '#EDF2F7', color: C.darkL },
    'Keluar':   { bg: C.redL,   color: C.red },
    'Normal':   { bg: C.greenL, color: C.green },
    'Perhatian':{ bg: C.redL,   color: C.red },
  }[status] ?? { bg: '#EDF2F7', color: C.darkL };
  return (
    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, fontWeight: 700, background: cfg.bg, color: cfg.color, whiteSpace: 'nowrap' }}>
      {status}
    </span>
  );
};

// ── Global style injector ──────────────────────────────────────────
export const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    html,body,#root{height:100%;width:100%;overflow:hidden;}
    body{font-family:'Plus Jakarta Sans',sans-serif;background:${C.cream};color:${C.dark};}
    ::-webkit-scrollbar{width:4px;height:4px;}
    ::-webkit-scrollbar-track{background:transparent;}
    ::-webkit-scrollbar-thumb{background:${C.tealXL};border-radius:99px;}
    @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slideIn{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}
    @keyframes slideRight{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:translateX(0)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes bounceIn{0%{transform:scale(.8);opacity:0}70%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
    @keyframes waveTyping{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
    @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
    .fade-in{animation:fadeIn .35s ease both;}
    .slide-in{animation:slideIn .3s ease both;}
    .slide-right{animation:slideRight .3s ease both;}
    .bounce-in{animation:bounceIn .4s cubic-bezier(.34,1.56,.64,1) both;}
    button{cursor:pointer;font-family:inherit;}
    input,textarea,select{font-family:inherit;}
    .admin-view{display:flex;width:100vw;height:100vh;overflow:hidden;position:fixed;inset:0;}
    .admin-sidebar{width:220px;flex-shrink:0;display:flex;flex-direction:column;overflow:hidden;}
    .admin-main{flex:1;min-width:0;display:flex;overflow:hidden;}
    .admin-page{flex:1;min-width:0;display:flex;flex-direction:column;overflow:hidden;}
    .admin-page-scroll{flex:1;overflow:auto;width:100%;}
    .admin-table-wrap{flex:1;overflow:auto;}
    .admin-table-wrap table{width:100%;border-collapse:collapse;}
    .admin-header{padding:16px 24px;background:#fff;border-bottom:1px solid rgba(13,92,99,.08);display:flex;align-items:center;gap:12px;flex-shrink:0;flex-wrap:wrap;}
    .shimmer{background:linear-gradient(90deg,${C.tealXL} 25%,#e8f8fa 50%,${C.tealXL} 75%);background-size:400px 100%;animation:shimmer 1.4s infinite;}
  `}</style>
);
