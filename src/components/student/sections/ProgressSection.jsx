/**
 * SR MVP — ProgressSection (Portal Siswa)
 * Tim 6 Fase 2 | src/components/student/sections/ProgressSection.jsx
 *
 * Dipecah dari StudentView.jsx (sebelumnya PageProgress inline).
 */
import { useState } from 'react';
import { C } from '../../../styles/tokens';
import MateriCard from '../MateriCard';

const ProgressSection = ({ progressData, openChatWithWebcam }) => {
  const [tab, setTab] = useState('all');
  const items = tab === 'done'
    ? progressData.sudahSelesai
    : tab === 'ongoing'
      ? progressData.belumSelesai
      : [...progressData.belumSelesai, ...progressData.sudahSelesai];

  return (
    <div style={{ overflowY: 'auto', height: '100%', padding: '20px 22px', width: '100%' }}>
      <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 20, fontWeight: 600, color: C.dark, marginBottom: 6 }}>📈 Progress Belajarku</div>
      <div style={{ fontSize: 12, color: C.slate, marginBottom: 16 }}>Semua topik yang pernah kamu pelajari</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { id: 'all', label: `Semua ${[...progressData.belumSelesai, ...progressData.sudahSelesai].length}` },
          { id: 'ongoing', label: `Lanjutkan ${progressData.belumSelesai.length}` },
          { id: 'done', label: `Selesai ${progressData.sudahSelesai.length}` },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '6px 14px', borderRadius: 99, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: tab === t.id ? C.teal : '#EDF2F7', color: tab === t.id ? C.white : C.darkL, fontSize: 12, fontWeight: 700 }}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
        {items.map(m => (
          <MateriCard key={m.id} m={m} progressData={progressData} openChatWithWebcam={openChatWithWebcam} />
        ))}
      </div>
      {items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
          <div style={{ fontSize: 14, color: C.slate }}>Belum ada materi di kategori ini</div>
        </div>
      )}
    </div>
  );
};

export default ProgressSection;
