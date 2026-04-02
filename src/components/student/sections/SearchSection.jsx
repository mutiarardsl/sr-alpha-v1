/**
 * SR MVP — SearchSection (Portal Siswa)
 * Tim 6 Fase 2 | src/components/student/sections/SearchSection.jsx
 *
 * Dipecah dari StudentView.jsx (sebelumnya PageSearch inline).
 * Props: progressData, searchQ, setSearchQ, searchResult, setSearchResult,
 *        searchConfirmTopic, setSearchConfirmTopic, searchGenerating, setSearchGenerating,
 *        searchGenDone, setSearchGenDone, openChatWithWebcam, setActivePage
 */
import { Btn, Card } from '../../shared/UI';
import { C } from '../../../styles/tokens';
import MateriCard, { makeKey } from '../MateriCard';
import { RECOMMENDED_MATERIALS, SEARCH_TOPICS } from '../../../data/masterData';

const SearchSection = ({
  progressData, openChatWithWebcam, setActivePage,
  searchQ, setSearchQ, searchResult, setSearchResult,
  searchConfirmTopic, setSearchConfirmTopic,
  searchGenerating, setSearchGenerating,
  searchGenDone, setSearchGenDone,
}) => {
  const popularTopics = ['Persamaan Linear', 'Ekosistem', 'Teks Argumentasi', 'Kerajaan Majapahit', 'Hukum Newton', 'Statistika', 'Trigonometri'];
  const allDoneKeys = new Set([...progressData.sudahSelesai, ...progressData.belumSelesai].map(m => makeKey(m.mapelId, m.subMateri)));
  const unstarted = RECOMMENDED_MATERIALS.filter(m => !allDoneKeys.has(makeKey(m.mapelId, m.subMateri)));

  const doSearch = (q) => {
    if (!q.trim()) { setSearchResult(null); setSearchConfirmTopic(null); setSearchGenDone(false); return; }
    const r = SEARCH_TOPICS.filter(t =>
      t.subMateri.toLowerCase().includes(q.toLowerCase()) ||
      t.topik.toLowerCase().includes(q.toLowerCase()) ||
      t.mapelLabel.toLowerCase().includes(q.toLowerCase())
    );
    setSearchResult(r.length > 0 ? 'results' : 'notfound');
    setSearchGenDone(false);
  };

  if (searchConfirmTopic) {
    return (
      <div style={{ overflowY: 'auto', height: '100%', padding: '24px 22px' }}>
        <button onClick={() => { setSearchConfirmTopic(null); setSearchGenDone(false); setSearchGenerating(false); }}
          style={{ background: 'none', border: 'none', fontSize: 13, color: C.teal, fontWeight: 700, cursor: 'pointer', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Kembali ke Pencarian
        </button>
        <Card style={{ padding: '24px', maxWidth: 520, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: searchConfirmTopic.mapelColor + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 12px' }}>
              {searchConfirmTopic.mapelIcon}
            </div>
            <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 20, fontWeight: 600, color: C.dark, marginBottom: 4 }}>{searchConfirmTopic.subMateri}</div>
            <div style={{ fontSize: 12, color: searchConfirmTopic.mapelColor, fontWeight: 700 }}>{searchConfirmTopic.mapelLabel} · {searchConfirmTopic.topik}</div>
          </div>
          {!searchGenDone ? (
            <>
              <div style={{ background: C.cream, borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, marginBottom: 6 }}>🤖 Tim 3 RAG akan menyiapkan:</div>
                {['Materi pengantar disesuaikan profil belajar', 'Sesi chat interaktif dengan Mentor AI', 'Konten visual (mind map, flashcard)', 'Latihan soal untuk mengukur pemahaman'].map(item => (
                  <div key={item} style={{ display: 'flex', gap: 7, fontSize: 12, color: C.darkL, alignItems: 'flex-start', marginBottom: 4 }}>
                    <span style={{ color: C.teal, flexShrink: 0, marginTop: 1 }}>✓</span>{item}
                  </div>
                ))}
              </div>
              <Btn variant="amber" onClick={() => { setSearchGenerating(true); setTimeout(() => { setSearchGenerating(false); setSearchGenDone(true); }, 2000); }}
                disabled={searchGenerating} style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14 }}>
                {searchGenerating ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: C.dark, borderRadius: '50%', animation: 'spin .8s linear infinite' }} /> Menyiapkan...</> : '🤖 Generate Konten'}
              </Btn>
            </>
          ) : (
            <>
              <div style={{ background: C.greenL, borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: 12, color: C.green }}>
                ✅ Konten berhasil disiapkan! Klik mulai untuk belajar dengan Mentor AI.
              </div>
              <Btn variant="primary" onClick={() => openChatWithWebcam({ mapelId: searchConfirmTopic.mapelId, subMateri: searchConfirmTopic.subMateri, mapelLabel: searchConfirmTopic.mapelLabel, mapelColor: searchConfirmTopic.mapelColor, mapelIcon: searchConfirmTopic.mapelIcon, source: 'search' })}
                style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14 }}>
                ▶ Mulai Belajar →
              </Btn>
            </>
          )}
        </Card>
      </div>
    );
  }

  const filteredTopics = searchQ ? SEARCH_TOPICS.filter(t =>
    t.subMateri.toLowerCase().includes(searchQ.toLowerCase()) ||
    t.topik.toLowerCase().includes(searchQ.toLowerCase())
  ) : [];

  return (
    <div style={{ overflowY: 'auto', height: '100%', padding: '20px 22px', width: '100%' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 20, fontWeight: 600, color: C.dark, marginBottom: 6 }}>🔍 Cari Topik Belajar</div>
        <div style={{ fontSize: 12, color: C.slate, marginBottom: 16 }}>
          Temukan materi di luar rekomendasi harian.
        </div>
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <input value={searchQ} onChange={e => { setSearchQ(e.target.value); doSearch(e.target.value); }}
            placeholder="Cari topik... (contoh: trigonometri, fotosintesis, peradaban mesir)"
            style={{ width: '100%', padding: '13px 16px 13px 46px', borderRadius: 12, fontSize: 14, border: `2px solid ${C.tealXL}`, outline: 'none', background: C.white, transition: 'border .2s' }}
            onFocus={e => e.target.style.borderColor = C.teal} onBlur={e => e.target.style.borderColor = C.tealXL} />
          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 18 }}>🔍</span>
          {searchQ && <button onClick={() => { setSearchQ(''); setSearchResult(null); }} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: 16, color: C.slate, cursor: 'pointer' }}>✕</button>}
        </div>
        {!searchQ && (
          <>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.slate, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Topik Populer</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {popularTopics.map(t => (
                <button key={t} onClick={() => { setSearchQ(t); doSearch(t); }}
                  style={{ padding: '6px 14px', borderRadius: 99, border: `1.5px solid ${C.tealXL}`, background: C.white, color: C.dark, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.tealXL; e.currentTarget.style.borderColor = C.teal; }}
                  onMouseLeave={e => { e.currentTarget.style.background = C.white; e.currentTarget.style.borderColor = C.tealXL; }}>
                  {t}
                </button>
              ))}
            </div>
            {unstarted.length > 0 && (
              <>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.slate, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Belum Dipelajari</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
                  {unstarted.map(m => <MateriCard key={m.id} m={m} forceNew progressData={progressData} openChatWithWebcam={openChatWithWebcam} />)}
                </div>
              </>
            )}
          </>
        )}
        {searchQ && searchResult === 'results' && (
          <div>
            <div style={{ fontSize: 13, color: C.slate, marginBottom: 14 }}>
              <strong style={{ color: C.dark }}>{filteredTopics.length} topik</strong> untuk "<strong>{searchQ}</strong>"
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredTopics.map(t => (
                <div key={`${t.mapelId}${t.subMateri}`} onClick={() => setSearchConfirmTopic(t)}
                  style={{ background: C.white, borderRadius: 12, padding: '14px 16px', cursor: 'pointer', border: `1px solid rgba(13,92,99,.08)`, transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 12 }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.cream; e.currentTarget.style.borderColor = C.tealXL; }}
                  onMouseLeave={e => { e.currentTarget.style.background = C.white; e.currentTarget.style.borderColor = 'rgba(13,92,99,.08)'; }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: t.mapelColor + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{t.mapelIcon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: C.dark }}>{t.subMateri}</div>
                    <div style={{ fontSize: 11, color: t.mapelColor, fontWeight: 600, marginTop: 2 }}>{t.mapelLabel} · {t.topik}</div>
                  </div>
                  <span style={{ color: C.teal, fontSize: 18 }}>›</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {searchQ && searchResult === 'notfound' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🤔</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.dark, marginBottom: 6 }}>Topik tidak ditemukan di index</div>
          </div>
        )}
      </div>
    </div >
  );
};

export default SearchSection;
