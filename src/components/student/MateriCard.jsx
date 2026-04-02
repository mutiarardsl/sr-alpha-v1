/**
 * SR MVP — MateriCard
 * Tim 6 Fase 2 | src/components/student/MateriCard.jsx
 *
 * Card materi yang dipakai di DashboardSection, ProgressSection, SearchSection.
 * Dipindah dari inline di StudentView agar bisa di-reuse lintas section.
 */
import { Btn, Card, ProgressBar } from '../shared/UI';
import { C } from '../../styles/tokens';

const makeKey = (mapelId, sub) => `${mapelId}__${sub}`;

const MateriCard = ({ m, forceNew = false, progressData, openChatWithWebcam }) => {
  const done = progressData.sudahSelesai.find(p => p.mapelId === m.mapelId && p.subMateri === m.subMateri);
  const ongoing = progressData.belumSelesai.find(p => p.mapelId === m.mapelId && p.subMateri === m.subMateri);
  const status = forceNew ? 'baru' : done ? 'selesai' : ongoing ? 'lanjutkan' : 'baru';
  const record = done || ongoing || null;
  const btnConfig = {
    baru: { label: '▶ Mulai Belajar', bg: C.teal, color: C.white },
    lanjutkan: { label: '▶ Lanjutkan', bg: m.mapelColor, color: C.white },
    selesai: { label: '↩ Buka Lagi', bg: C.greenL, color: C.green },
  }[status];

  return (
    <Card
      style={{ overflow: 'hidden', transition: 'transform .2s,box-shadow .2s', cursor: 'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(13,92,99,.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(26,35,50,.07)'; }}
    >
      <div style={{ height: 3, background: m.mapelColor }} />
      <div style={{ padding: '13px 13px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: m.mapelColor + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{m.mapelIcon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: m.mapelColor, fontWeight: 700, marginBottom: 1 }}>{m.mapelLabel} · {m.topik}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.dark, lineHeight: 1.3 }}>{m.subMateri}</div>
          </div>
          {m.tag && <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 99, background: m.tag.includes('⭐') ? C.amberL : '#EDF2F7', color: m.tag.includes('⭐') ? C.orange : C.darkL, fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap' }}>{m.tag}</span>}
        </div>
        {m.deskripsi && <div style={{ fontSize: 11, color: C.darkL, lineHeight: 1.5, marginBottom: 8 }}>{m.deskripsi}</div>}
        {status === 'lanjutkan' && record && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: C.slate, marginTop: 4 }}>🕐 Terakhir: {record.lastChat || '—'}</div>
          </div>
        )}
        {status === 'selesai' && record && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: C.greenL, borderRadius: 99, padding: '3px 9px', marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: C.green, fontWeight: 700 }}>✅ Quiz: {record.quizScore}/100</span>
            </div>
            <div style={{ fontSize: 10, color: C.slate }}>🗓 Selesai: {record.lastChat || '—'}</div>
          </div>
        )}
        <button
          onClick={() => openChatWithWebcam({
            mapelId: m.mapelId,
            subMateri: m.subMateri,
            mapelLabel: m.mapelLabel,
            mapelColor: m.mapelColor,
            mapelIcon: m.mapelIcon,
            source: status === 'lanjutkan' || status === 'selesai' ? 'resume' : 'search',
          })}
          style={{ display: 'block', width: '100%', padding: '9px 12px', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 12, textAlign: 'center', transition: 'all .2s', background: btnConfig.bg, color: btnConfig.color }}
        >
          {btnConfig.label}
        </button>
      </div>
    </Card>
  );
};

export { makeKey };
export default MateriCard;
