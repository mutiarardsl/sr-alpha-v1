/* AdminContent — bridge for Fase 2. Full section split scheduled Fase 3. */
/**
 * SR MVP — Admin View (Portal Admin)
 * Tim 6 Fase 2 | src/components/admin/AdminView.jsx
 *
 * Refactored from App.jsx.
 * State management: AdminContext (AdminProvider dari context/AdminContext.jsx)
 */

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAdmin } from '../../context/AdminContext';
import { Btn, Avatar, Card, ProgressBar, Spinner, StatusBadge } from '../shared/UI';
import { C } from '../../styles/tokens';
import {
  ADMIN_MAPEL_LIST, ADMIN_GURU_INIT, ADMIN_KELAS_INIT, ADMIN_SISWA_INIT,
} from '../../data/masterData';

// ═══════════════════════════════════════════════════════════════════
// ─── ADMIN DATA ───────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════
const ADMIN_SEKOLAH = {
  nama: "SR Kota Malang", kota: "Malang", provinsi: "Jawa Timur",
  kepalaSekolah: "Dr. Bambang Sudiro, M.Pd.", email: "admin@sr-malang.sch.id",
  tahunAjaran: "2025/2026", akreditasi: "A",
};

// ═══════════════════════════════════════════════════════════════════
// ─── ADMIN VIEW ───────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════
// ─── FORM TAMBAH MAPEL KE KELAS (top-level agar hooks valid) ─────
const FormTambahMapel = ({ k, kelasId, mapelList, guruList, inpStyle, getMapel, getGuru, setKelasList, showToast, onDone }) => {
  const [pilihMapel, setPilihMapel] = useState("");
  const [pilihGuru, setPilihGuru] = useState("");
  const sudahAda = Object.keys(k.mapelGuruMap);
  const tersedia = mapelList.filter(m => !sudahAda.includes(m.id));
  const guruUntuk = pilihMapel ? guruList.filter(g => g.mapelIds.includes(pilihMapel) && g.status === "Aktif") : [];
  return (
    <div style={{ padding: "12px 16px", background: "#D4F0F3", borderBottom: `1px solid rgba(13,92,99,.1)` }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#0D5C63", marginBottom: 8 }}>➕ Tambah Mapel ke Kelas Ini</div>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 150 }}>
          <label style={{ fontSize: 10, color: "#0D5C63", fontWeight: 600, display: "block", marginBottom: 4 }}>Pilih Mapel</label>
          <select value={pilihMapel} onChange={e => { setPilihMapel(e.target.value); setPilihGuru(""); }}
            style={{ ...inpStyle, padding: "7px 10px", fontSize: 12 }}>
            <option value="">— Pilih mapel —</option>
            {tersedia.map(m => <option key={m.id} value={m.id}>{m.icon} {m.label}</option>)}
            {tersedia.length === 0 && <option disabled>Semua mapel sudah ditetapkan</option>}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 150 }}>
          <label style={{ fontSize: 10, color: "#0D5C63", fontWeight: 600, display: "block", marginBottom: 4 }}>Pilih Guru (opsional)</label>
          <select value={pilihGuru} onChange={e => setPilihGuru(e.target.value)}
            style={{ ...inpStyle, padding: "7px 10px", fontSize: 12 }} disabled={!pilihMapel}>
            <option value="">— Tanpa guru dulu —</option>
            {guruUntuk.map(g => <option key={g.id} value={g.id}>{g.nama}</option>)}
            {pilihMapel && guruUntuk.length === 0 && <option disabled>Belum ada guru mapel ini</option>}
          </select>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button disabled={!pilihMapel}
            onClick={() => {
              setKelasList(p => p.map(kl => kl.id === kelasId ? { ...kl, mapelGuruMap: { ...kl.mapelGuruMap, [pilihMapel]: pilihGuru || "" } } : kl));
              const m = getMapel(pilihMapel); const g = getGuru(pilihGuru);
              showToast(`✅ ${m?.label} ditambahkan ke ${k.nama}${g ? ` · Guru: ${g.nama}` : ""}`);
              onDone();
            }}
            style={{
              padding: "8px 14px", background: pilihMapel ? "#0D5C63" : "#CBD5E0", border: "none", borderRadius: 8,
              color: "#fff", fontSize: 12, fontWeight: 700, cursor: pilihMapel ? "pointer" : "not-allowed", fontFamily: "inherit",
              opacity: pilihMapel ? 1 : .6
            }}>
            Tambahkan
          </button>
          <button onClick={onDone}
            style={{ background: "none", border: "none", color: "#0D5C63", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}>
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminContent = ({ adminCtx }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const onNavigate = (screen) => {
    if (screen === 'login') { logout(); navigate('/login', { replace: true }); return; }
  };
  const {
    guruList, siswaList, kelasList, mapelList,
    setKelasList, setGuruList, setSiswaList, setMapelList,
    saveGuru, saveSiswa, deleteSiswa, saveKelas, saveMapel, deleteMapel,
  } = useAdmin();
  const [activePage, setActivePage] = useState("kelas");
  const [selectedGuru, setSelectedGuru] = useState(null);
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [selectedKelas, setSelectedKelas] = useState(null); // detail kelas
  const [modal, setModal] = useState(null); // "tambah-guru"|"edit-guru"|"tambah-siswa"|"edit-siswa"|"tambah-kelas"|"edit-kelas"
  const [modalData, setModalData] = useState(null);
  const [toast, setToast] = useState(null);
  const [filterKelasId, setFilterKelasId] = useState("all");

  const showToast = (msg, color = C.green) => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  // ── helpers ──────────────────────────────────────────────────────
  const getKelas = (id) => kelasList.find(k => k.id === id);
  const getGuru = (id) => guruList.find(g => g.id === id);
  const getMapel = (id) => mapelList.find(m => m.id === id);
  const getSiswaOfKelas = (kelasId) => siswaList.filter(s => s.kelasId === kelasId);

  const totalSiswaAktif = siswaList.filter(s => s.status === "Aktif").length;
  const totalGuruAktif = guruList.filter(g => g.status === "Aktif").length;
  const kelasKosong = kelasList.filter(k => !k.waliKelasId || Object.keys(k.mapelGuruMap).length < 3);

  // ── FORM HELPERS ─────────────────────────────────────────────────
  const emptyGuru = { nama: "", nip: "", email: "", mapelIds: [], kelasIds: [], status: "Aktif", bergabung: "", avatar: "", avatarBg: `linear-gradient(135deg,${C.teal},${C.tealL})` };
  const emptySiswa = { nama: "", nis: "", email: "", kelasId: "", status: "Aktif", bergabung: "", avatar: "", avatarBg: C.teal };
  const emptyKelas = { nama: "", tingkat: "X", jurusan: "IPA", waliKelasId: "", mapelGuruMap: {}, tahunAjaran: "2025/2026", siswaIds: [] };




  const nonaktifkanGuru = (id) => {
    setGuruList(p => p.map(g => g.id === id ? { ...g, status: g.status === "Aktif" ? "Nonaktif" : "Aktif" } : g));
    const g = guruList.find(x => x.id === id);
    showToast(`Status ${g?.nama} diperbarui`);
    setSelectedGuru(null);
  };

  const nonaktifkanSiswa = (id) => {
    setSiswaList(p => p.map(s => s.id === id ? { ...s, status: s.status === "Aktif" ? "Nonaktif" : "Aktif" } : s));
    const s = siswaList.find(x => x.id === id);
    showToast(`Status ${s?.nama} diperbarui`);
    setSelectedSiswa(null);
  };

  const pindahKelas = (siswaId, kelasIdBaru) => {
    const s = siswaList.find(x => x.id === siswaId);
    if (!s) return;
    // hapus dari kelas lama, tambah ke kelas baru
    setKelasList(p => p.map(k => {
      if (k.id === s.kelasId) return { ...k, siswaIds: k.siswaIds.filter(id => id !== siswaId) };
      if (k.id === kelasIdBaru) return { ...k, siswaIds: [...k.siswaIds, siswaId] };
      return k;
    }));
    setSiswaList(p => p.map(si => si.id === siswaId ? { ...si, kelasId: kelasIdBaru } : si));
    showToast(`✅ ${s.nama} dipindah ke ${getKelas(kelasIdBaru)?.nama}`);
  };

  const updateMapelGuru = (kelasId, mapelId, guruId) => {
    setKelasList(p => p.map(k => k.id === kelasId
      ? { ...k, mapelGuruMap: { ...k.mapelGuruMap, [mapelId]: guruId } } : k));
    const k = getKelas(kelasId); const g = getGuru(guruId); const m = getMapel(mapelId);
    showToast(`✅ ${m?.label} di ${k?.nama} → ${g?.nama}`);
  };

  // ── INPUT STYLE ──────────────────────────────────────────────────
  const inpStyle = {
    width: "100%", padding: "9px 12px", border: `1.5px solid ${C.tealXL}`,
    borderRadius: 9, fontSize: 13, outline: "none", background: C.white, fontFamily: "inherit",
    transition: "border-color .2s"
  };

  // ── STATUS BADGE ────────────────────────────────────────────────
  const StatusBadge = ({ status }) => {
    const cfg = {
      "Aktif": { bg: C.greenL, color: C.green },
      "Cuti": { bg: C.amberL, color: C.orange },
      "Nonaktif": { bg: "#EDF2F7", color: C.slate },
      "Keluar": { bg: C.redL, color: C.red },
    }[status] || { bg: "#EDF2F7", color: C.slate };
    return <span style={{
      fontSize: 10, padding: "2px 8px", borderRadius: 99, fontWeight: 700,
      background: cfg.bg, color: cfg.color, whiteSpace: "nowrap"
    }}>{status}</span>;
  };

  // ── MULTI SELECT CHECKBOXES ──────────────────────────────────────
  const MultiCheckbox = ({ items, selected, onChange, labelKey = "label", idKey = "id" }) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {items.map(item => {
        const isOn = selected.includes(item[idKey]);
        return (
          <button key={item[idKey]} onClick={() => onChange(isOn ? selected.filter(x => x !== item[idKey]) : [...selected, item[idKey]])}
            style={{
              padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              border: `1.5px solid ${isOn ? C.teal : C.tealXL}`,
              background: isOn ? C.tealXL : C.white, color: isOn ? C.teal : C.slate, transition: "all .15s"
            }}>
            {item[labelKey]}
          </button>
        );
      })}
    </div>
  );

  // ── PAGE: IKHTISAR ───────────────────────────────────────────────
  const PageIkhtisar = () => {
    const alerts = [];
    kelasList.forEach(k => {
      if (!k.waliKelasId) alerts.push(`${k.nama}: belum ada wali kelas`);
      if (Object.keys(k.mapelGuruMap).length < 3) alerts.push(`${k.nama}: belum semua mapel memiliki guru`);
    });
    return (
      <div style={{ overflowY: "auto", width: "100%", height: "100%", padding: "20px 24px", boxSizing: "border-box" }}>
        <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 22, fontWeight: 600, color: C.dark, marginBottom: 4 }}>
          🏠 Ikhtisar Sekolah
        </div>
        <div style={{ fontSize: 13, color: C.slate, marginBottom: 20 }}>
          {ADMIN_SEKOLAH.nama} · {ADMIN_SEKOLAH.kota} · Tahun Ajaran {ADMIN_KELAS_INIT[0].tahunAjaran}
        </div>

        {/* KPI */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { icon: "👨‍🏫", label: "Total Guru", value: guruList.length, sub: `${totalGuruAktif} aktif`, color: C.teal, onClick: () => setActivePage("guru") },
            { icon: "🎒", label: "Total Siswa", value: siswaList.length, sub: `${totalSiswaAktif} aktif`, color: C.purple, onClick: () => setActivePage("siswa") },
            { icon: "📚", label: "Total Kelas", value: kelasList.length, sub: `${mapelList.length} mapel tersedia`, color: C.orange, onClick: () => setActivePage("kelas") },
            {
              icon: "⚠️", label: "Perlu Ditinjau", value: alerts.length + guruList.filter(g => g.status === "Cuti").length,
              sub: alerts.length > 0 ? "Ada item perlu perhatian" : "Semua normal", color: alerts.length > 0 ? C.red : C.green
            },
          ].map(s => (
            <Card key={s.label} style={{ padding: "16px", cursor: s.onClick ? "pointer" : "default", transition: "transform .2s,box-shadow .2s" }}
              onClick={s.onClick}
              onMouseEnter={e => { if (s.onClick) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(13,92,99,.12)"; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(26,35,50,.07)"; }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 10, color: C.slate, fontWeight: 600, textTransform: "uppercase", letterSpacing: .8 }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: C.dark, margin: "4px 0" }}>{s.value}</div>
              <div style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>{s.sub}</div>
            </Card>
          ))}
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div style={{
            background: C.amberL, borderRadius: 12, padding: "14px 16px", marginBottom: 20,
            border: `1px solid ${C.amber}44`
          }}>
            <div style={{ fontWeight: 700, color: C.orange, marginBottom: 8, fontSize: 13 }}>⚠️ Perlu Ditindaklanjuti</div>
            {alerts.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: C.dark, marginBottom: 4 }}>
                <span style={{ color: C.amber }}>•</span>{a}
              </div>
            ))}
          </div>
        )}

        {/* Tabel ringkasan kelas */}
        <Card style={{ overflow: "hidden", marginBottom: 20 }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid rgba(13,92,99,.08)`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.dark }}>📚 Ringkasan Kelas</div>
            <Btn variant="soft" size="sm" onClick={() => setActivePage("kelas")}>Kelola Kelas →</Btn>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: C.cream }}>
                  {["Kelas", "Jurusan", "Wali Kelas", "Siswa", "Mapel Diajar", "Aksi"].map(h => (
                    <th key={h} style={{
                      padding: "9px 14px", textAlign: "left", fontSize: 10, fontWeight: 700,
                      color: C.slate, textTransform: "uppercase", letterSpacing: .7, whiteSpace: "nowrap"
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {kelasList.map(k => {
                  const wk = getGuru(k.waliKelasId);
                  const jmapel = Object.keys(k.mapelGuruMap).length;
                  return (
                    <tr key={k.id} style={{ borderTop: `1px solid rgba(13,92,99,.06)` }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(13,92,99,.02)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "11px 14px" }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: C.dark }}>{k.nama}</div>
                        <div style={{ fontSize: 10, color: C.slate }}>TA {k.tahunAjaran}</div>
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        <span style={{
                          fontSize: 11, padding: "2px 8px", borderRadius: 99, fontWeight: 700,
                          background: k.jurusan === "IPA" ? C.tealXL : C.amberL,
                          color: k.jurusan === "IPA" ? C.teal : C.orange
                        }}>{k.jurusan}</span>
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        {wk
                          ? <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Avatar initials={wk.avatar} bg={wk.avatarBg} size={24} />
                            <span style={{ fontSize: 12, color: C.dark }}>{wk.nama}</span>
                          </div>
                          : <span style={{ fontSize: 11, color: C.red, fontWeight: 600 }}>⚠ Belum ditentukan</span>}
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: C.dark }}>{k.siswaIds.length}</span>
                        <span style={{ fontSize: 10, color: C.slate }}> siswa</span>
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                          {Object.keys(k.mapelGuruMap).map(mid => {
                            const m = getMapel(mid);
                            return m ? <span key={mid} style={{
                              fontSize: 9, padding: "1px 6px", borderRadius: 99,
                              background: m.color + "18", color: m.color, fontWeight: 600
                            }}>{m.icon}</span> : null;
                          })}
                          {jmapel === 0 && <span style={{ fontSize: 10, color: C.red }}>—</span>}
                        </div>
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        <button onClick={() => setSelectedKelas(k.id)}
                          style={{
                            background: C.tealXL, border: "none", borderRadius: 7, padding: "5px 10px",
                            fontSize: 11, color: C.teal, fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
                          }}>
                          Detail →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Guru cuti / nonaktif */}
        {guruList.filter(g => g.status !== "Aktif").length > 0 && (
          <Card style={{ padding: "16px" }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.dark, marginBottom: 10 }}>👨‍🏫 Guru Tidak Aktif</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {guruList.filter(g => g.status !== "Aktif").map(g => (
                <div key={g.id} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                  background: C.cream, borderRadius: 9
                }}>
                  <Avatar initials={g.avatar} bg={g.avatarBg} size={32} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.dark }}>{g.nama}</div>
                    <div style={{ fontSize: 10, color: C.slate }}>{g.mapelIds.map(id => getMapel(id)?.label).join(", ")}</div>
                  </div>
                  <StatusBadge status={g.status} />
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  };

  // ── PAGE: GURU ───────────────────────────────────────────────────
  const PageGuru = () => {
    const [search, setSearch] = useState("");
    const filtered = guruList.filter(g => {
      return !search || g.nama.toLowerCase().includes(search.toLowerCase()) || g.email.toLowerCase().includes(search.toLowerCase());
    });
    return (
      <div className="admin-page">
        {/* Header */}
        <div className="admin-header" style={{ background: C.white, borderBottom: `1px solid rgba(13,92,99,.08)` }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 19, fontWeight: 600, color: C.dark }}>👨‍🏫 Manajemen Guru</div>
            <div style={{ fontSize: 11, color: C.slate, marginTop: 2 }}>{guruList.length} guru terdaftar</div>
          </div>
          <div style={{ position: "relative" }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama / email..."
              style={{ ...inpStyle, width: 200, paddingLeft: 30 }}
              onFocus={e => e.target.style.borderColor = C.teal}
              onBlur={e => e.target.style.borderColor = C.tealXL} />
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: C.slate }}>🔍</span>
          </div>
          <Btn variant="primary" onClick={() => { setModalData({ ...emptyGuru }); setModal("tambah-guru"); }}>
            + Tambah Guru
          </Btn>
        </div>

        {/* Tabel */}
        <div className="admin-table-wrap">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
              <tr style={{ background: C.cream }}>
                {["Nama Guru", "NIP", "Email", "Mapel Diajar", "Kelas", "Aksi"].map(h => (
                  <th key={h} style={{
                    padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700,
                    color: C.slate, textTransform: "uppercase", letterSpacing: .7, whiteSpace: "nowrap",
                    borderBottom: `1px solid rgba(13,92,99,.08)`
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(g => (
                <tr key={g.id} style={{ borderTop: `1px solid rgba(13,92,99,.05)`, cursor: "pointer", transition: "background .15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(13,92,99,.02)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  onClick={() => setSelectedGuru(g.id)}>
                  <td style={{ padding: "11px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <Avatar initials={g.avatar} bg={g.avatarBg} size={32} />
                      <div style={{ fontWeight: 600, fontSize: 13, color: C.dark }}>{g.nama}</div>
                    </div>
                  </td>
                  <td style={{ padding: "11px 14px" }}><span style={{ fontSize: 11, color: C.darkL, fontFamily: "monospace" }}>{g.nip}</span></td>
                  <td style={{ padding: "11px 14px" }}><span style={{ fontSize: 12, color: C.teal }}>{g.email}</span></td>
                  <td style={{ padding: "11px 14px" }}>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {g.mapelIds.map(mid => {
                        const m = getMapel(mid);
                        return m ? <span key={mid} style={{
                          fontSize: 10, padding: "2px 8px", borderRadius: 99,
                          background: m.color + "18", color: m.color, fontWeight: 600
                        }}>{m.icon} {m.label}</span> : null;
                      })}
                    </div>
                  </td>
                  <td style={{ padding: "11px 14px" }}>
                    <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                      {g.kelasIds.map(kid => {
                        const k = getKelas(kid);
                        return k ? <span key={kid} style={{
                          fontSize: 10, padding: "2px 7px", borderRadius: 99,
                          background: C.tealXL, color: C.teal, fontWeight: 600
                        }}>{k.nama.replace("Kelas ", "")}</span> : null;
                      })}
                      {g.kelasIds.length === 0 && <span style={{ fontSize: 11, color: C.slate }}>—</span>}
                    </div>
                  </td>
                  <td style={{ padding: "11px 14px" }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button onClick={() => { setModalData({ ...g }); setModal("edit-guru"); }}
                        style={{
                          background: C.tealXL, border: "none", borderRadius: 6, padding: "4px 9px",
                          fontSize: 11, color: C.teal, fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
                        }}>
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
              <div style={{ fontSize: 14, color: C.slate }}>Tidak ada guru ditemukan</div>
            </div>
          )}
        </div>
      </div>
    );
  };
  const PageSiswa = () => {
    const [search, setSearch] = useState("");
    const [filterKelas, setFilterKelas] = useState(filterKelasId || "all");
    const filtered = siswaList.filter(s => {
      const matchK = filterKelas === "all" || s.kelasId === filterKelas;
      const matchQ = !search || s.nama.toLowerCase().includes(search.toLowerCase()) || s.nis.includes(search);
      return matchK && matchQ;
    });
    return (
      <div className="admin-page">
        {/* Header */}
        <div className="admin-header" style={{ background: C.white, borderBottom: `1px solid rgba(13,92,99,.08)` }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 19, fontWeight: 600, color: C.dark }}>🎒 Manajemen Siswa</div>
            <div style={{ fontSize: 11, color: C.slate, marginTop: 2 }}>{siswaList.length} siswa terdaftar</div>
          </div>
          <div style={{ position: "relative" }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama / NIS..."
              style={{ ...inpStyle, width: 180, paddingLeft: 30 }}
              onFocus={e => e.target.style.borderColor = C.teal}
              onBlur={e => e.target.style.borderColor = C.tealXL} />
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: C.slate }}>🔍</span>
          </div>
          <select value={filterKelas} onChange={e => setFilterKelas(e.target.value)}
            style={{ ...inpStyle, width: 150 }}>
            <option value="all">Semua Kelas</option>
            {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
          </select>
          <Btn variant="primary" onClick={() => { setModalData({ ...emptySiswa }); setModal("tambah-siswa"); }}>
            + Tambah Siswa
          </Btn>
        </div>

        {/* Tabel */}
        <div className="admin-table-wrap">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
              <tr style={{ background: C.cream }}>
                {["Nama Siswa", "NIS", "Email", "Kelas", "Aksi"].map(h => (
                  <th key={h} style={{
                    padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700,
                    color: C.slate, textTransform: "uppercase", letterSpacing: .7, whiteSpace: "nowrap",
                    borderBottom: `1px solid rgba(13,92,99,.08)`
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const kelas = getKelas(s.kelasId);
                return (
                  <tr key={s.id} style={{ borderTop: `1px solid rgba(13,92,99,.05)`, cursor: "pointer", transition: "background .15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(13,92,99,.02)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    onClick={() => setSelectedSiswa(s.id)}>
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <Avatar initials={s.avatar} bg={s.avatarBg} size={30} />
                        <div style={{ fontWeight: 600, fontSize: 13, color: C.dark }}>{s.nama}</div>
                      </div>
                    </td>
                    <td style={{ padding: "11px 14px" }}><span style={{ fontSize: 11, color: C.darkL, fontFamily: "monospace" }}>{s.nis}</span></td>
                    <td style={{ padding: "11px 14px" }}><span style={{ fontSize: 12, color: C.teal }}>{s.email}</span></td>
                    <td style={{ padding: "11px 14px" }}>
                      {kelas ? <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: C.tealXL, color: C.teal, fontWeight: 600 }}>
                        {kelas.nama.replace("Kelas ", "")}
                      </span> : <span style={{ fontSize: 11, color: C.slate }}>—</span>}
                    </td>
                    <td style={{ padding: "11px 14px" }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => { setModalData({ ...s }); setModal("edit-siswa"); }}
                        style={{
                          background: C.tealXL, border: "none", borderRadius: 6, padding: "4px 9px",
                          fontSize: 11, color: C.teal, fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
                        }}>
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
              <div style={{ fontSize: 14, color: C.slate }}>Tidak ada siswa ditemukan</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── PAGE: KELAS ──────────────────────────────────────────────────
  const PageKelas = () => {
    if (selectedKelas) return <PageKelasDetail kelasId={selectedKelas} />;
    return (
      <div className="admin-page-scroll" style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 19, fontWeight: 600, color: C.dark }}>📚 Manajemen Kelas</div>
            <div style={{ fontSize: 11, color: C.slate, marginTop: 2 }}>{kelasList.length} kelas terdaftar</div>
          </div>
          <Btn variant="primary" onClick={() => { setModalData({ ...emptyKelas }); setModal("tambah-kelas"); }}>+ Tambah Kelas</Btn>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
          {kelasList.map(k => {
            const wk = getGuru(k.waliKelasId);
            const siswas = getSiswaOfKelas(k.id);
            const mapelCount = Object.keys(k.mapelGuruMap).length;
            const alerts = [];
            if (!k.waliKelasId) alerts.push("Belum ada wali kelas");
            if (mapelCount < 3) alerts.push("Mapel belum lengkap");
            return (
              <Card key={k.id} style={{ overflow: "hidden", cursor: "pointer", transition: "transform .2s,box-shadow .2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(13,92,99,.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(26,35,50,.07)"; }}>
                <div style={{ height: 4, background: k.jurusan === "IPA" ? C.teal : C.amber }} />
                <div style={{ padding: "16px" }}>
                  {alerts.length > 0 && (
                    <div style={{
                      background: C.amberL, borderRadius: 7, padding: "5px 10px", fontSize: 10,
                      color: C.orange, fontWeight: 600, marginBottom: 10
                    }}>
                      ⚠ {alerts.join(" · ")}
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 16, fontWeight: 600, color: C.dark }}>{k.nama}</div>
                      <div style={{ fontSize: 11, color: C.slate, marginTop: 2 }}>TA {k.tahunAjaran}</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setModalData({ ...k }); setModal("edit-kelas"); }}
                      style={{
                        width: 30, height: 30, background: C.cream, border: `1px solid ${C.tealXL}`, borderRadius: 8,
                        fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        color: C.teal, flexShrink: 0, transition: "all .15s"
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = C.tealXL; }}
                      onMouseLeave={e => { e.currentTarget.style.background = C.cream; }}>
                      ✏️
                    </button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                    <div style={{ background: C.cream, borderRadius: 8, padding: "9px 10px" }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: C.dark }}>{siswas.length}</div>
                      <div style={{ fontSize: 9, color: C.slate }}>Total Siswa</div>
                    </div>
                    <div style={{ background: C.cream, borderRadius: 8, padding: "9px 10px" }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: C.dark }}>{mapelCount}</div>
                      <div style={{ fontSize: 9, color: C.slate }}>Mapel Terisi</div>
                    </div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10, color: C.slate, marginBottom: 4 }}>Wali Kelas</div>
                    {wk
                      ? <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Avatar initials={wk.avatar} bg={wk.avatarBg} size={24} />
                        <span style={{ fontSize: 12, color: C.dark, fontWeight: 600 }}>{wk.nama}</span>
                      </div>
                      : <span style={{ fontSize: 11, color: C.red }}>⚠ Belum ditentukan</span>}
                  </div>
                  <Btn variant="primary" size="sm" onClick={() => setSelectedKelas(k.id)} style={{ width: "100%", justifyContent: "center" }}>
                    Kelola Kelas
                  </Btn>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  // ── PAGE: DETAIL KELAS ───────────────────────────────────────────
  const PageKelasDetail = ({ kelasId }) => {
    const k = getKelas(kelasId);
    const [editMapelId, setEditMapelId] = useState(null);
    if (!k) return null;
    const wk = getGuru(k.waliKelasId);
    const siswas = getSiswaOfKelas(kelasId);
    // Guru yg bisa mengajar mapel tertentu
    const guruForMapel = (mapelId) => guruList.filter(g => g.mapelIds.includes(mapelId) && g.status === "Aktif");

    return (
      <div className="admin-page-scroll" style={{ padding: "20px 24px" }}>
        {/* Breadcrumb */}
        <button onClick={() => setSelectedKelas(null)}
          style={{
            background: "none", border: "none", color: C.teal, fontWeight: 700, fontSize: 13,
            cursor: "pointer", marginBottom: 16, display: "flex", alignItems: "center", gap: 5, padding: 0
          }}>
          ← Kembali ke Daftar Kelas
        </button>

        {/* Header kelas */}
        <div style={{
          background: `linear-gradient(135deg,${C.teal},${C.tealL})`, borderRadius: 16,
          padding: "20px 24px", marginBottom: 20, position: "relative", overflow: "hidden"
        }}>
          <div style={{ position: "absolute", right: -20, top: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,.06)" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontFamily: "'Source Serif 4',serif", color: C.white, fontSize: 22, fontWeight: 600, marginBottom: 4 }}>{k.nama}</div>
            <div style={{ color: "rgba(255,255,255,.7)", fontSize: 12 }}>
              Tahun Ajaran {k.tahunAjaran} · Tingkat {k.tingkat} · Jurusan {k.jurusan}
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
              {[
                { v: siswas.length, l: "Siswa" },
                { v: Object.keys(k.mapelGuruMap).length, l: "Mapel" },
              ].map(s => (
                <div key={s.l} style={{ background: "rgba(255,255,255,.15)", borderRadius: 9, padding: "8px 14px", textAlign: "center" }}>
                  <div style={{ fontWeight: 800, fontSize: 18, color: C.white }}>{s.v}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,.7)" }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 18, marginBottom: 18 }}>
          {/* Wali Kelas */}
          <Card style={{ padding: "16px" }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.dark, marginBottom: 12 }}>👤 Wali Kelas</div>
            {wk ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar initials={wk.avatar} bg={wk.avatarBg} size={40} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: C.dark }}>{wk.nama}</div>
                  <div style={{ fontSize: 11, color: C.slate }}>{wk.mapelIds.map(id => getMapel(id)?.label).join(", ")}</div>
                  <div style={{ fontSize: 10, color: C.teal }}>{wk.email}</div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 12, color: C.red }}>⚠ Belum ada wali kelas</div>
            )}
            <div style={{ marginTop: 10 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: C.slate, display: "block", marginBottom: 5 }}>Ganti Wali Kelas</label>
              <select defaultValue={k.waliKelasId || ""}
                onChange={e => {
                  setKelasList(p => p.map(kl => kl.id === kelasId ? { ...kl, waliKelasId: e.target.value } : kl));
                  const g = getGuru(e.target.value);
                  showToast(`✅ Wali kelas ${k.nama} → ${g?.nama}`);
                }}
                style={{ ...inpStyle }}>
                <option value="">— Pilih Guru —</option>
                {guruList.filter(g => g.status === "Aktif").map(g => (
                  <option key={g.id} value={g.id}>{g.nama}</option>
                ))}
              </select>
            </div>
          </Card>

          {/* Info kelas */}
          <Card style={{ padding: "16px" }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.dark, marginBottom: 12 }}>📋 Info Kelas</div>
            {[
              { l: "Nama Kelas", v: k.nama },
              { l: "Tingkat", v: `Kelas ${k.tingkat}` },
              { l: "Jurusan", v: k.jurusan },
              { l: "Tahun Ajaran", v: k.tahunAjaran },
            ].map(item => (
              <div key={item.l} style={{
                display: "flex", justifyContent: "space-between", marginBottom: 8,
                paddingBottom: 8, borderBottom: `1px solid rgba(13,92,99,.06)`
              }}>
                <span style={{ fontSize: 11, color: C.slate }}>{item.l}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.dark }}>{item.v}</span>
              </div>
            ))}
          </Card>
        </div>

        {/* Pengaturan Guru per Mapel */}
        <Card style={{ overflow: "hidden", marginBottom: 18 }}>
          <div style={{
            padding: "12px 16px", borderBottom: `1px solid rgba(13,92,99,.08)`,
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.dark }}>📚 Pengaturan Guru per Mapel</div>
              <div style={{ fontSize: 11, color: C.slate, marginTop: 2 }}>
                {Object.keys(k.mapelGuruMap).length} mapel ditetapkan · Klik "Ganti" untuk mengubah guru, atau tambah/hapus mapel
              </div>
            </div>
            <button onClick={() => setEditMapelId("__add__")}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
                background: `linear-gradient(135deg,${C.teal},${C.tealL})`, border: "none",
                borderRadius: 8, color: C.white, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit"
              }}>
              + Tambah Mapel
            </button>
          </div>

          {/* Form tambah mapel baru ke kelas — komponen terpisah agar hooks tidak kondisional */}
          {editMapelId === "__add__" && (
            <FormTambahMapel
              k={k} kelasId={kelasId}
              mapelList={mapelList} guruList={guruList}
              inpStyle={inpStyle} getMapel={getMapel} getGuru={getGuru}
              setKelasList={setKelasList} showToast={showToast}
              onDone={() => setEditMapelId(null)}
            />
          )}

          <div style={{ padding: "8px 0" }}>
            {Object.entries(k.mapelGuruMap).length === 0 && (
              <div style={{ textAlign: "center", padding: "20px 0", fontSize: 12, color: C.slate }}>
                Belum ada mapel ditetapkan. Klik "+ Tambah Mapel" untuk memulai.
              </div>
            )}
            {Object.entries(k.mapelGuruMap).map(([mapelId, guruId]) => {
              const mapel = getMapel(mapelId);
              const assignedGuru = getGuru(guruId);
              const eligible = guruList.filter(g => g.mapelIds.includes(mapelId) && g.status === "Aktif");
              const isEditing = editMapelId === mapelId;
              if (!mapel) return null;
              return (
                <div key={mapelId} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 16px", borderBottom: `1px solid rgba(13,92,99,.05)`
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, background: mapel.color + "18",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0
                  }}>
                    {mapel.icon}
                  </div>
                  <div style={{ width: 130, flexShrink: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.dark }}>{mapel.label}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    {isEditing ? (
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <select defaultValue={guruId || ""}
                          onChange={e => {
                            setKelasList(p => p.map(kl => kl.id === kelasId
                              ? { ...kl, mapelGuruMap: { ...kl.mapelGuruMap, [mapelId]: e.target.value } } : kl));
                            const g = getGuru(e.target.value);
                            showToast(`✅ ${mapel.label} di ${k.nama} → ${g?.nama || "(kosong)"}`);
                            setEditMapelId(null);
                          }}
                          style={{ ...inpStyle, flex: 1, padding: "6px 10px", fontSize: 12 }}>
                          <option value="">— Tidak ada guru —</option>
                          {eligible.map(g => <option key={g.id} value={g.id}>{g.nama}</option>)}
                          {eligible.length === 0 && <option disabled>Belum ada guru mapel ini</option>}
                        </select>
                        <button onClick={() => setEditMapelId(null)}
                          style={{ background: "none", border: "none", color: C.slate, cursor: "pointer", fontSize: 14 }}>✕</button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {assignedGuru ? (
                          <>
                            <Avatar initials={assignedGuru.avatar} bg={assignedGuru.avatarBg} size={24} />
                            <span style={{ fontSize: 12, color: C.dark }}>{assignedGuru.nama}</span>
                          </>
                        ) : (
                          <span style={{ fontSize: 11, color: C.slate, fontStyle: "italic" }}>Belum ada guru</span>
                        )}
                      </div>
                    )}
                  </div>
                  {!isEditing && (
                    <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                      <button onClick={() => setEditMapelId(mapelId)}
                        style={{
                          background: C.tealXL, border: "none", borderRadius: 7, padding: "5px 9px",
                          fontSize: 11, color: C.teal, fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
                        }}>
                        {assignedGuru ? "Ganti" : "Tetapkan"}
                      </button>
                      <button onClick={() => {
                        if (!window.confirm(`Hapus ${mapel.label} dari ${k.nama}?`)) return;
                        setKelasList(p => p.map(kl => {
                          if (kl.id !== kelasId) return kl;
                          const newMap = { ...kl.mapelGuruMap };
                          delete newMap[mapelId];
                          return { ...kl, mapelGuruMap: newMap };
                        }));
                        showToast(`🗑 ${mapel.label} dihapus dari ${k.nama}`, C.red);
                      }}
                        style={{
                          background: C.redL, border: "none", borderRadius: 7, padding: "5px 9px",
                          fontSize: 11, color: C.red, fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
                        }}>
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Daftar Siswa di Kelas */}
        <Card style={{ overflow: "hidden" }}>
          <div style={{
            padding: "12px 16px", borderBottom: `1px solid rgba(13,92,99,.08)`,
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.dark }}>🎒 Daftar Siswa</div>
              <div style={{ fontSize: 11, color: C.slate, marginTop: 1 }}>{siswas.length} siswa di kelas ini</div>
            </div>
            <Btn variant="soft" size="sm" onClick={() => {
              setModalData({ ...emptySiswa, kelasId: kelasId });
              setModal("tambah-siswa");
            }}>+ Tambah Siswa</Btn>
          </div>
          <div style={{ overflowX: "auto", maxHeight: 380, overflowY: "auto", width: "100%" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: C.cream }}>
                  {["Nama", "NIS", "Email", "Aksi"].map(h => (
                    <th key={h} style={{
                      padding: "8px 14px", textAlign: "left", fontSize: 10, fontWeight: 700,
                      color: C.slate, textTransform: "uppercase", letterSpacing: .7, whiteSpace: "nowrap"
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {siswas.map(s => (
                  <tr key={s.id} style={{ borderTop: `1px solid rgba(13,92,99,.05)` }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(13,92,99,.02)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "9px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <Avatar initials={s.avatar} bg={s.avatarBg} size={26} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: C.dark }}>{s.nama}</span>
                      </div>
                    </td>
                    <td style={{ padding: "9px 14px" }}><span style={{ fontSize: 11, fontFamily: "monospace", color: C.darkL }}>{s.nis}</span></td>
                    <td style={{ padding: "9px 14px" }}><span style={{ fontSize: 11, color: C.teal }}>{s.email}</span></td>
                    <td style={{ padding: "9px 14px" }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={() => { setModalData({ ...s }); setModal("edit-siswa"); }}
                          style={{
                            background: C.tealXL, border: "none", borderRadius: 6, padding: "3px 8px",
                            fontSize: 10, color: C.teal, fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
                          }}>Edit</button>
                        <button onClick={() => {
                          if (!window.confirm(`Hapus ${s.nama} dari ${k.nama}?`)) return;
                          setSiswaList(p => p.filter(x => x.id !== s.id));
                          setKelasList(p => p.map(kl => kl.id === kelasId ? { ...kl, siswaIds: kl.siswaIds.filter(id => id !== s.id) } : kl));
                          showToast(`🗑 ${s.nama} dihapus`, C.red);
                        }}
                          style={{
                            background: C.redL, border: "none", borderRadius: 6, padding: "3px 8px",
                            fontSize: 10, color: C.red, fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
                          }}>Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {siswas.length === 0 && (
              <div style={{ textAlign: "center", padding: "28px 0" }}>
                <div style={{ fontSize: 12, color: C.slate }}>Belum ada siswa di kelas ini</div>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  };

  // ── DRAWER: DETAIL GURU ──────────────────────────────────────────
  const GuruDrawer = () => {
    const g = guruList.find(x => x.id === selectedGuru);
    if (!g) return null;
    return (
      <div style={{
        position: "fixed", inset: 0, background: "rgba(26,35,50,.4)", display: "flex",
        alignItems: "center", justifyContent: "flex-end", zIndex: 998, backdropFilter: "blur(2px)"
      }}
        onClick={() => setSelectedGuru(null)}>
        <div className="slide-right" onClick={e => e.stopPropagation()}
          style={{
            width: 380, height: "100vh", background: C.white, overflowY: "auto",
            boxShadow: "-10px 0 40px rgba(0,0,0,.15)", display: "flex", flexDirection: "column"
          }}>
          {/* Header */}
          <div style={{
            padding: "18px 18px 14px", borderBottom: `1px solid rgba(13,92,99,.08)`,
            display: "flex", alignItems: "flex-start", gap: 12
          }}>
            <Avatar initials={g.avatar} bg={g.avatarBg} size={48} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: C.dark }}>{g.nama}</div>
              <div style={{ fontSize: 11, color: C.slate, marginTop: 2 }}>{g.email}</div>
            </div>
            <button onClick={() => setSelectedGuru(null)} style={{
              background: C.cream, border: "none", borderRadius: 8,
              width: 28, height: 28, cursor: "pointer", fontSize: 14, color: C.slate
            }}>✕</button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px" }}>
            {/* Info */}
            {[
              { l: "NIP", v: g.nip },
            ].map(item => (
              <div key={item.l} style={{
                display: "flex", justifyContent: "space-between",
                padding: "8px 0", borderBottom: `1px solid rgba(13,92,99,.06)`
              }}>
                <span style={{ fontSize: 12, color: C.slate }}>{item.l}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.dark }}>{item.v}</span>
              </div>
            ))}

            {/* Mapel */}
            <div style={{ marginTop: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.dark, marginBottom: 8 }}>📚 Mapel yang Diajar</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {g.mapelIds.map(mid => {
                  const m = getMapel(mid);
                  return m ? <span key={mid} style={{
                    fontSize: 11, padding: "4px 10px", borderRadius: 99,
                    background: m.color + "18", color: m.color, fontWeight: 600
                  }}>{m.icon} {m.label}</span> : null;
                })}
              </div>
            </div>

            {/* Kelas */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.dark, marginBottom: 8 }}>🎓 Kelas yang Dipegang</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {g.kelasIds.map(kid => {
                  const k = getKelas(kid);
                  if (!k) return null;
                  const isWali = k.waliKelasId === g.id;
                  return (
                    <div key={kid} style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "7px 10px", background: C.cream, borderRadius: 8
                    }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.dark, flex: 1 }}>{k.nama}</span>
                      {isWali && <span style={{
                        fontSize: 9, padding: "1px 7px", borderRadius: 99,
                        background: C.tealXL, color: C.teal, fontWeight: 700
                      }}>Wali Kelas</span>}
                      <span style={{ fontSize: 10, color: C.slate }}>{k.jurusan}</span>
                    </div>
                  );
                })}
                {g.kelasIds.length === 0 && <span style={{ fontSize: 12, color: C.slate, fontStyle: "italic" }}>Belum mengajar di kelas manapun</span>}
              </div>
            </div>
          </div>

          {/* Aksi */}
          <div style={{
            padding: "14px 18px", borderTop: `1px solid rgba(13,92,99,.08)`,
            display: "flex", gap: 8, flexShrink: 0
          }}>
            <Btn variant="soft" onClick={() => { setModalData({ ...g }); setModal("edit-guru"); setSelectedGuru(null); }}
              style={{ flex: 1, justifyContent: "center" }}>✏️ Edit Data</Btn>
          </div>
        </div>
      </div>
    );
  };

  // ── DRAWER: DETAIL SISWA ─────────────────────────────────────────
  const SiswaDrawer = () => {
    const s = siswaList.find(x => x.id === selectedSiswa);
    const [pindahTarget, setPindahTarget] = useState("");
    const [showPindah, setShowPindah] = useState(false);
    if (!s) return null;
    const kelas = getKelas(s.kelasId);
    return (
      <div style={{
        position: "fixed", inset: 0, background: "rgba(26,35,50,.4)", display: "flex",
        alignItems: "center", justifyContent: "flex-end", zIndex: 998, backdropFilter: "blur(2px)"
      }}
        onClick={() => setSelectedSiswa(null)}>
        <div className="slide-right" onClick={e => e.stopPropagation()}
          style={{
            width: 360, height: "100vh", background: C.white, overflowY: "auto",
            boxShadow: "-10px 0 40px rgba(0,0,0,.15)", display: "flex", flexDirection: "column"
          }}>
          {/* Header */}
          <div style={{
            padding: "18px 18px 14px", borderBottom: `1px solid rgba(13,92,99,.08)`,
            display: "flex", alignItems: "flex-start", gap: 12
          }}>
            <Avatar initials={s.avatar} bg={s.avatarBg} size={48} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: C.dark }}>{s.nama}</div>
              <div style={{ fontSize: 11, color: C.slate, marginTop: 2 }}>{s.email}</div>
              {kelas && <span style={{
                marginTop: 6, display: "inline-block", fontSize: 10, padding: "2px 8px", borderRadius: 99,
                background: C.tealXL, color: C.teal, fontWeight: 700
              }}>{kelas.nama.replace("Kelas ", "")}</span>}
            </div>
            <button onClick={() => setSelectedSiswa(null)} style={{
              background: C.cream, border: "none", borderRadius: 8,
              width: 28, height: 28, cursor: "pointer", fontSize: 14, color: C.slate
            }}>✕</button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px" }}>
            {[
              { l: "NIS", v: s.nis },
              { l: "Kelas", v: kelas?.nama || "—" },
            ].map(item => (
              <div key={item.l} style={{
                display: "flex", justifyContent: "space-between",
                padding: "9px 0", borderBottom: `1px solid rgba(13,92,99,.06)`
              }}>
                <span style={{ fontSize: 12, color: C.slate }}>{item.l}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.dark }}>{item.v}</span>
              </div>
            ))}
          </div>

          {/* Aksi */}
          <div style={{
            padding: "14px 18px", borderTop: `1px solid rgba(13,92,99,.08)`,
            display: "flex", gap: 8, flexShrink: 0
          }}>
            <Btn variant="soft" onClick={() => { setModalData({ ...s }); setModal("edit-siswa"); setSelectedSiswa(null); }}
              style={{ flex: 1, justifyContent: "center" }}>✏️ Edit Data</Btn>
          </div>
        </div>
      </div>
    );
  };

  // ── MODAL: FORM GURU ─────────────────────────────────────────────
  const ModalGuru = () => {
    const [form, setForm] = useState(modalData || { ...emptyGuru });
    const isEdit = !!form.id;
    const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));
    return (
      <div style={{
        position: "fixed", inset: 0, background: "rgba(26,35,50,.55)", display: "flex",
        alignItems: "center", justifyContent: "center", zIndex: 1200, backdropFilter: "blur(4px)"
      }}
        onClick={() => setModal(null)}>
        <div className="bounce-in" onClick={e => e.stopPropagation()}
          style={{
            background: C.white, borderRadius: 16, padding: 28, width: 520, maxHeight: "88vh",
            overflowY: "auto", boxShadow: "0 24px 60px rgba(0,0,0,.2)"
          }}>
          <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 18, fontWeight: 600, color: C.dark, marginBottom: 4 }}>
            {isEdit ? "✏️ Edit Data Guru" : "👨‍🏫 Tambah Guru Baru"}
          </div>
          <div style={{ fontSize: 12, color: C.slate, marginBottom: 18 }}>SR Kota Malang · {ADMIN_KELAS_INIT[0].tahunAjaran}</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.dark, display: "block", marginBottom: 5 }}>Nama Lengkap *</label>
              <input value={form.nama} onChange={e => setF("nama", e.target.value)}
                placeholder="Nama lengkap + gelar" style={{ ...inpStyle }}
                onFocus={e => e.target.style.borderColor = C.teal} onBlur={e => e.target.style.borderColor = C.tealXL} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.dark, display: "block", marginBottom: 5 }}>NIP</label>
              <input value={form.nip} onChange={e => setF("nip", e.target.value)}
                placeholder="18 digit NIP" style={{ ...inpStyle }}
                onFocus={e => e.target.style.borderColor = C.teal} onBlur={e => e.target.style.borderColor = C.tealXL} />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.dark, display: "block", marginBottom: 5 }}>Email *</label>
            <input value={form.email} onChange={e => setF("email", e.target.value)}
              placeholder="nama@sr-malang.sch.id" style={{ ...inpStyle }}
              onFocus={e => e.target.style.borderColor = C.teal} onBlur={e => e.target.style.borderColor = C.tealXL} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.dark, display: "block", marginBottom: 8 }}>Mapel yang Diajar *</label>
            <MultiCheckbox items={mapelList} selected={form.mapelIds}
              onChange={v => setF("mapelIds", v)} idKey="id" labelKey="label" />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.dark, display: "block", marginBottom: 8 }}>Kelas yang Dipegang</label>
            <MultiCheckbox items={kelasList.map(k => ({ id: k.id, label: k.nama.replace("Kelas ", "") }))}
              selected={form.kelasIds} onChange={v => setF("kelasIds", v)} idKey="id" labelKey="label" />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="ghost" onClick={() => setModal(null)} style={{ flex: 1, justifyContent: "center" }}>Batal</Btn>
            <Btn variant="amber" onClick={() => saveGuru(form)} disabled={!form.nama || !form.email}
              style={{ flex: 2, justifyContent: "center" }}>
              {isEdit ? "💾 Simpan Perubahan" : "✅ Tambah Guru"}
            </Btn>
          </div>
        </div>
      </div>
    );
  };

  // ── MODAL: FORM SISWA ────────────────────────────────────────────
  const ModalSiswa = () => {
    const [form, setForm] = useState(modalData || { ...emptySiswa });
    const isEdit = !!form.id;
    const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));
    return (
      <div style={{
        position: "fixed", inset: 0, background: "rgba(26,35,50,.55)", display: "flex",
        alignItems: "center", justifyContent: "center", zIndex: 1200, backdropFilter: "blur(4px)"
      }}
        onClick={() => setModal(null)}>
        <div className="bounce-in" onClick={e => e.stopPropagation()}
          style={{
            background: C.white, borderRadius: 16, padding: 28, width: 480, maxHeight: "88vh",
            overflowY: "auto", boxShadow: "0 24px 60px rgba(0,0,0,.2)"
          }}>
          <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 18, fontWeight: 600, color: C.dark, marginBottom: 4 }}>
            {isEdit ? "✏️ Edit Data Siswa" : "🎒 Tambah Siswa Baru"}
          </div>
          <div style={{ fontSize: 12, color: C.slate, marginBottom: 18 }}>SR Kota Malang</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.dark, display: "block", marginBottom: 5 }}>Nama Lengkap *</label>
              <input value={form.nama} onChange={e => setF("nama", e.target.value)}
                placeholder="Nama lengkap siswa" style={{ ...inpStyle }}
                onFocus={e => e.target.style.borderColor = C.teal} onBlur={e => e.target.style.borderColor = C.tealXL} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.dark, display: "block", marginBottom: 5 }}>NIS *</label>
              <input value={form.nis} onChange={e => setF("nis", e.target.value)}
                placeholder="Nomor Induk Siswa" style={{ ...inpStyle }}
                onFocus={e => e.target.style.borderColor = C.teal} onBlur={e => e.target.style.borderColor = C.tealXL} />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.dark, display: "block", marginBottom: 5 }}>Email</label>
            <input value={form.email} onChange={e => setF("email", e.target.value)}
              placeholder="nama@siswa.sr" style={{ ...inpStyle }}
              onFocus={e => e.target.style.borderColor = C.teal} onBlur={e => e.target.style.borderColor = C.tealXL} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.dark, display: "block", marginBottom: 5 }}>Kelas *</label>
            <select value={form.kelasId} onChange={e => setF("kelasId", e.target.value)} style={{ ...inpStyle }}>
              <option value="">— Pilih Kelas —</option>
              {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="ghost" onClick={() => setModal(null)} style={{ flex: 1, justifyContent: "center" }}>Batal</Btn>
            <Btn variant="amber" onClick={() => saveSiswa(form)} disabled={!form.nama || !form.nis || !form.kelasId}
              style={{ flex: 2, justifyContent: "center" }}>
              {isEdit ? "💾 Simpan Perubahan" : "✅ Tambah Siswa"}
            </Btn>
          </div>
        </div>
      </div>
    );
  };

  // ── MODAL: FORM KELAS ────────────────────────────────────────────
  const ModalKelas = () => {
    const [form, setForm] = useState(modalData || { ...emptyKelas });
    const isEdit = !!form.id;
    const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));
    return (
      <div style={{
        position: "fixed", inset: 0, background: "rgba(26,35,50,.55)", display: "flex",
        alignItems: "center", justifyContent: "center", zIndex: 1200, backdropFilter: "blur(4px)"
      }}
        onClick={() => setModal(null)}>
        <div className="bounce-in" onClick={e => e.stopPropagation()}
          style={{
            background: C.white, borderRadius: 16, padding: 28, width: 460, maxHeight: "88vh",
            overflowY: "auto", boxShadow: "0 24px 60px rgba(0,0,0,.2)"
          }}>
          <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 18, fontWeight: 600, color: C.dark, marginBottom: 4 }}>
            {isEdit ? "✏️ Edit Kelas" : "📚 Tambah Kelas Baru"}
          </div>
          <div style={{ fontSize: 12, color: C.slate, marginBottom: 18 }}>SR Kota Malang</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.dark, display: "block", marginBottom: 5 }}>Nama Kelas *</label>
              <input value={form.nama} onChange={e => setF("nama", e.target.value)}
                placeholder="Contoh: Kelas X IPA 2" style={{ ...inpStyle }}
                onFocus={e => e.target.style.borderColor = C.teal} onBlur={e => e.target.style.borderColor = C.tealXL} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.dark, display: "block", marginBottom: 5 }}>Tahun Ajaran</label>
              <input value={form.tahunAjaran} onChange={e => setF("tahunAjaran", e.target.value)}
                placeholder="2025/2026" style={{ ...inpStyle }}
                onFocus={e => e.target.style.borderColor = C.teal} onBlur={e => e.target.style.borderColor = C.tealXL} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.dark, display: "block", marginBottom: 5 }}>Tingkat</label>
              <select value={form.tingkat} onChange={e => setF("tingkat", e.target.value)} style={{ ...inpStyle }}>
                {["X", "XI", "XII"].map(t => <option key={t} value={t}>Kelas {t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.dark, display: "block", marginBottom: 5 }}>Jurusan</label>
              <select value={form.jurusan} onChange={e => setF("jurusan", e.target.value)} style={{ ...inpStyle }}>
                {["IPA", "IPS", "Bahasa", "Umum"].map(j => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.dark, display: "block", marginBottom: 5 }}>Wali Kelas</label>
            <select value={form.waliKelasId || ""} onChange={e => setF("waliKelasId", e.target.value)} style={{ ...inpStyle }}>
              <option value="">— Belum ditentukan —</option>
              {guruList.filter(g => g.status === "Aktif").map(g => (
                <option key={g.id} value={g.id}>{g.nama}</option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="ghost" onClick={() => setModal(null)} style={{ flex: 1, justifyContent: "center" }}>Batal</Btn>
            <Btn variant="amber" onClick={() => saveKelas(form)} disabled={!form.nama}
              style={{ flex: 2, justifyContent: "center" }}>
              {isEdit ? "💾 Simpan Perubahan" : "✅ Buat Kelas"}
            </Btn>
          </div>
        </div>
      </div>
    );
  };

  // ── PAGE: KURIKULUM ──────────────────────────────────────────────
  const PageKurikulum = () => {
    const [modalMapel, setModalMapel] = useState(null); // null | {id?,label,icon,color,deskripsi,jamPerMinggu,tipe}
    const [konfirmHapus, setKonfirmHapus] = useState(null); // mapel id

    const emptyMapel = { label: "", icon: "📗", color: "#0D5C63", deskripsi: "", jamPerMinggu: 2, tipe: "Wajib" };
    const ICON_OPTIONS = ["📐", "🔬", "📖", "🌍", "🌐", "⚽", "🎨", "🇮🇩", "🎵", "💻", "🧪", "📊", "🏛️", "🔭", "🧮", "📗", "🖊️", "🌿"];
    const COLOR_OPTIONS = [
      { label: "Teal", value: "#0D5C63" }, { label: "Orange", value: "#DD6B20" },
      { label: "Purple", value: "#6B46C1" }, { label: "Green", value: "#2F855A" },
      { label: "Blue", value: "#2B6CB0" }, { label: "Brown", value: "#C05621" },
      { label: "Gold", value: "#B7791F" }, { label: "Red", value: "#9B2C2C" },
      { label: "Pink", value: "#D53F8C" }, { label: "Slate", value: "#4A5568" },
    ];

    const saveMapel = (data) => {
      if (data.id) {
        setMapelList(p => p.map(m => m.id === data.id ? { ...m, ...data } : m));
        showToast(`✅ Mapel ${data.label} diperbarui`);
      } else {
        const newId = data.label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "").slice(0, 10) + `_${Date.now()}`.slice(-4);
        setMapelList(p => [...p, { ...data, id: newId }]);
        showToast(`✅ Mapel ${data.label} ditambahkan ke kurikulum`);
      }
      setModalMapel(null);
    };

    const hapusMapel = (id) => {
      const m = mapelList.find(x => x.id === id);
      // cek apakah masih dipakai di kelas manapun
      const dipakaiDi = kelasList.filter(k => k.mapelGuruMap[id]);
      if (dipakaiDi.length > 0) {
        showToast(`⚠ ${m?.label} masih dipakai di: ${dipakaiDi.map(k => k.nama).join(", ")}`, C.red);
        setKonfirmHapus(null); return;
      }
      setMapelList(p => p.filter(x => x.id !== id));
      // hapus juga dari mapelIds guru
      setGuruList(p => p.map(g => ({ ...g, mapelIds: g.mapelIds.filter(mid => mid !== id) })));
      showToast(`🗑 ${m?.label} dihapus dari kurikulum`, C.red);
      setKonfirmHapus(null);
    };

    // Ringkasan pemakaian mapel per kelas
    const mapelUsage = (mapelId) => kelasList.filter(k => Object.keys(k.mapelGuruMap).includes(mapelId));
    const mapelGuruCount = (mapelId) => guruList.filter(g => g.mapelIds.includes(mapelId) && g.status === "Aktif").length;

    const ModalMapel = () => {
      const [form, setForm] = useState(modalMapel);
      const [kurikulumFile, setKurikulumFile] = useState(null);
      const [uploading, setUploading] = useState(false);
      const fileRef = useRef(null);
      const isEdit = !!form.id;
      const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

      const handleFileSelect = (files) => {
        if (!files?.length) return;
        const f = files[0];
        setUploading(true);
        setTimeout(() => { setKurikulumFile({ name: f.name, size: f.size > 1024 * 1024 ? `${(f.size / 1024 / 1024).toFixed(1)} MB` : `${Math.round(f.size / 1024)} KB` }); setUploading(false); }, 1200);
      };

      return (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(26,35,50,.55)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 1200, backdropFilter: "blur(4px)"
        }}
          onClick={() => setModalMapel(null)}>
          <div className="bounce-in" onClick={e => e.stopPropagation()}
            style={{
              background: C.white, borderRadius: 16, padding: 28, width: 480, maxHeight: "88vh", overflowY: "auto",
              boxShadow: "0 24px 60px rgba(0,0,0,.2)"
            }}>
            <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 18, fontWeight: 600, color: C.dark, marginBottom: 4 }}>
              {isEdit ? "✏️ Edit Mata Pelajaran" : "📋 Tambah Mata Pelajaran Baru"}
            </div>
            <div style={{ fontSize: 12, color: C.slate, marginBottom: 20 }}>Kurikulum SR Kota Malang</div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.dark, display: "block", marginBottom: 5 }}>Nama Mata Pelajaran *</label>
              <input value={form.label} onChange={e => setF("label", e.target.value)}
                placeholder="Contoh: Matematika" style={{ ...inpStyle }}
                onFocus={e => e.target.style.borderColor = C.teal} onBlur={e => e.target.style.borderColor = C.tealXL} />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.dark, display: "block", marginBottom: 5 }}>Deskripsi (opsional)</label>
              <textarea value={form.deskripsi || ""} onChange={e => setF("deskripsi", e.target.value)}
                placeholder="Deskripsi singkat mata pelajaran..." rows={3}
                style={{ ...inpStyle, resize: "none", lineHeight: 1.5 }}
                onFocus={e => e.target.style.borderColor = C.teal} onBlur={e => e.target.style.borderColor = C.tealXL} />
            </div>

            {/* Upload Kurikulum untuk AI */}
            <div style={{ marginBottom: 22 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.dark, display: "block", marginBottom: 5 }}>
                📄 Upload Kurikulum (untuk AI)
              </label>
              <div style={{ fontSize: 11, color: C.slate, marginBottom: 8, lineHeight: 1.5 }}>
                Dokumen kurikulum akan diteruskan ke Agent AI untuk mendukung konten belajar siswa pada mapel ini.
              </div>
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  border: `2px dashed ${C.tealXL}`, borderRadius: 10, padding: "16px",
                  textAlign: "center", cursor: "pointer", background: "#FAFEFF", transition: "all .2s", marginBottom: 8
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.teal}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.tealXL}>
                <input ref={fileRef} type="file" accept=".pdf,.docx,.doc,.pptx,.txt"
                  style={{ display: "none" }} onChange={e => handleFileSelect(e.target.files)} />
                {uploading ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <div style={{ width: 14, height: 14, border: `2px solid ${C.tealXL}`, borderTopColor: C.teal, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
                    <span style={{ fontSize: 12, color: C.teal }}>Memproses...</span>
                  </div>
                ) : kurikulumFile ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, textAlign: "left" }}>
                    <span style={{ fontSize: 24 }}>📄</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.dark }}>{kurikulumFile.name}</div>
                      <div style={{ fontSize: 10, color: C.slate }}>{kurikulumFile.size}</div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); setKurikulumFile(null); }}
                      style={{ background: "none", border: "none", color: C.slate, cursor: "pointer", fontSize: 16 }}>✕</button>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>📂</div>
                    <div style={{ fontSize: 12, color: C.tealL, fontWeight: 600 }}>Klik untuk upload kurikulum</div>
                    <div style={{ fontSize: 10, color: C.slate, marginTop: 3 }}>PDF, Word, PowerPoint, TXT</div>
                  </>
                )}
              </div>
              {kurikulumFile && (
                <div style={{ background: C.tealXL, borderRadius: 8, padding: "8px 12px", fontSize: 11, color: C.teal, display: "flex", gap: 6, alignItems: "center" }}>
                  <span>🤖</span>
                  <span>File kurikulum akan diteruskan ke Agent AI untuk mendukung konten belajar siswa.</span>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <Btn variant="ghost" onClick={() => setModalMapel(null)} style={{ flex: 1, justifyContent: "center" }}>Batal</Btn>
              <Btn variant="amber" onClick={() => saveMapel(form)} disabled={!form.label.trim()}
                style={{ flex: 2, justifyContent: "center" }}>
                {isEdit ? "💾 Simpan Perubahan" : "✅ Tambah Mapel"}
              </Btn>
            </div>
          </div>
        </div>
      );
    };

    // Tipe badge warna
    const tipeCfg = {
      "Wajib": { bg: C.tealXL, color: C.teal },
      "Peminatan": { bg: C.purpleL, color: C.purple },
      "Muatan Lokal": { bg: C.amberL, color: C.orange },
      "Ekstra": { bg: C.greenL, color: C.green },
    };

    const byTipe = ["Wajib", "Peminatan", "Muatan Lokal", "Ekstra"].reduce((acc, t) => {
      acc[t] = mapelList.filter(m => (m.tipe || "Wajib") === t); return acc;
    }, {});

    return (
      <div className="admin-page-scroll" style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 22, fontWeight: 600, color: C.dark }}>📋 Kurikulum & Mata Pelajaran</div>
            <div style={{ fontSize: 12, color: C.slate, marginTop: 3 }}>
              SR Kota Malang · {mapelList.length} mata pelajaran terdaftar
            </div>
          </div>
          <Btn variant="primary" onClick={() => setModalMapel({ ...emptyMapel })}>
            + Tambah Mata Pelajaran
          </Btn>
        </div>

        {/* Daftar mapel — grid sederhana */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12, marginBottom: 20 }}>
          {mapelList.map(m => (
            <Card key={m.id} style={{ padding: "16px", transition: "transform .2s,box-shadow .2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(13,92,99,.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(26,35,50,.07)"; }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: m.color + "18",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0
                }}>
                  {m.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.dark }}>{m.label}</div>
                  {m.deskripsi && <div style={{
                    fontSize: 11, color: C.slate, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis",
                    display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical"
                  }}>{m.deskripsi}</div>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setModalMapel({ ...emptyMapel, ...m })}
                  style={{
                    flex: 1, padding: "7px", background: C.tealXL, border: "none", borderRadius: 8,
                    fontSize: 12, color: C.teal, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 4
                  }}>
                  ✏️ Edit
                </button>
                <button onClick={() => setKonfirmHapus(m.id)}
                  style={{
                    padding: "7px 12px", background: C.redL, border: "none", borderRadius: 8,
                    fontSize: 12, color: C.red, fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
                  }}>
                  🗑 Hapus
                </button>
              </div>
            </Card>
          ))}
        </div>

        {mapelList.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: C.dark, marginBottom: 6 }}>Belum ada mata pelajaran</div>
            <div style={{ fontSize: 13, color: C.slate, marginBottom: 20 }}>Tambahkan mata pelajaran untuk kurikulum sekolah</div>
            <Btn variant="primary" onClick={() => setModalMapel({ ...emptyMapel })}>+ Tambah Mata Pelajaran</Btn>
          </div>
        )}

        {/* Modal tambah/edit mapel */}
        {modalMapel && <ModalMapel />}

        {/* Konfirmasi hapus */}
        {konfirmHapus && (() => {
          const m = mapelList.find(x => x.id === konfirmHapus);
          const usedIn = mapelUsage(konfirmHapus);
          return (
            <div style={{
              position: "fixed", inset: 0, background: "rgba(26,35,50,.55)", display: "flex",
              alignItems: "center", justifyContent: "center", zIndex: 1200, backdropFilter: "blur(4px)"
            }}
              onClick={() => setKonfirmHapus(null)}>
              <div className="bounce-in" onClick={e => e.stopPropagation()}
                style={{
                  background: C.white, borderRadius: 14, padding: 26, width: 380,
                  boxShadow: "0 24px 60px rgba(0,0,0,.2)"
                }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>⚠️</div>
                <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 17, fontWeight: 600, color: C.dark, marginBottom: 8 }}>
                  Hapus {m?.label}?
                </div>
                {usedIn.length > 0 ? (
                  <div style={{ background: C.redL, borderRadius: 9, padding: "10px 12px", marginBottom: 14, fontSize: 12, color: C.red }}>
                    ⚠ Mapel ini masih digunakan di {usedIn.length} kelas: {usedIn.map(k => k.nama).join(", ")}.<br />
                    Hapus mapel dari kelas tersebut terlebih dahulu.
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: C.darkL, marginBottom: 16, lineHeight: 1.6 }}>
                    Mapel ini akan dihapus dari kurikulum. Data mapel di guru yang mengampu juga akan dihapus.
                  </div>
                )}
                <div style={{ display: "flex", gap: 10 }}>
                  <Btn variant="ghost" onClick={() => setKonfirmHapus(null)} style={{ flex: 1, justifyContent: "center" }}>Batal</Btn>
                  {usedIn.length === 0 && (
                    <Btn variant="danger" onClick={() => hapusMapel(konfirmHapus)} style={{ flex: 1, justifyContent: "center" }}>
                      🗑 Hapus
                    </Btn>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    );
  };

  // ── SIDEBAR ADMIN ────────────────────────────────────────────────
  const navItems = [
    { id: "kelas", icon: "📚", label: "Manajemen Kelas" },
    { id: "guru", icon: "👨‍🏫", label: "Manajemen Guru" },
    { id: "kurikulum", icon: "📋", label: "Kurikulum & Mapel" },
  ];

  // ── RENDER ───────────────────────────────────────────────────────
  return (
    <div className="admin-view" style={{ background: C.cream }}>
      {/* Sidebar */}
      <div className="admin-sidebar" style={{ background: C.dark }}>
        {/* Logo */}
        <div style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ fontSize: 22 }}>🏫</span>
            <div>
              <div style={{ color: C.white, fontWeight: 700, fontSize: 13 }}>Sekolah Rakyat</div>
              <div style={{ color: "rgba(255,255,255,.35)", fontSize: 9 }}>Portal Admin</div>
            </div>
          </div>
        </div>

        {/* Admin profile */}
        <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg,${C.amber},${C.orange})`,
              display: "flex", alignItems: "center", justifyContent: "center", color: C.dark, fontWeight: 800, fontSize: 14, flexShrink: 0
            }}>A</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: C.white, fontWeight: 700, fontSize: 12 }}>Admin</div>
              <div style={{ color: "rgba(255,255,255,.4)", fontSize: 10, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>SR Kota Malang</div>
              <div style={{ color: C.amber, fontSize: 10, fontWeight: 700 }}>🔑 Administrator</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, padding: "8px 6px", overflowY: "auto" }}>
          {navItems.map(item => (
            <button key={item.id}
              onClick={() => { setActivePage(item.id); if (item.id !== "kelas") setSelectedKelas(null); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "9px 10px",
                background: activePage === item.id ? "rgba(13,92,99,.5)" : "transparent",
                border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", marginBottom: 2, transition: "all .15s"
              }}
              onMouseEnter={e => { if (activePage !== item.id) e.currentTarget.style.background = "rgba(255,255,255,.06)"; }}
              onMouseLeave={e => { if (activePage !== item.id) e.currentTarget.style.background = "transparent"; }}>
              <span style={{ fontSize: 15 }}>{item.icon}</span>
              <span style={{
                fontSize: 12, fontWeight: activePage === item.id ? 700 : 400,
                color: activePage === item.id ? C.white : "rgba(255,255,255,.55)"
              }}>{item.label}</span>
              {activePage === item.id && <span style={{ marginLeft: "auto", width: 4, height: 4, borderRadius: "50%", background: C.amber }} />}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: "8px", borderTop: "1px solid rgba(255,255,255,.07)" }}>
          <button onClick={() => onNavigate("login")}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              background: "rgba(229,62,62,.12)", border: "1px solid rgba(229,62,62,.2)",
              borderRadius: 8, padding: "8px", color: "rgba(229,62,62,.75)", fontSize: 11, cursor: "pointer", fontFamily: "inherit"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(229,62,62,.22)"; e.currentTarget.style.color = "#E53E3E"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(229,62,62,.12)"; e.currentTarget.style.color = "rgba(229,62,62,.75)"; }}>
            🚪 Keluar / Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="admin-main">
        {activePage === "guru" && <PageGuru />}
        {activePage === "kelas" && <PageKelas />}
        {activePage === "kurikulum" && <PageKurikulum />}
      </div>

      {/* Drawers */}
      {selectedGuru && <GuruDrawer />}

      {/* Modals */}
      {(modal === "tambah-guru" || modal === "edit-guru") && <ModalGuru />}
      {(modal === "tambah-siswa" || modal === "edit-siswa") && <ModalSiswa />}
      {(modal === "tambah-kelas" || modal === "edit-kelas") && <ModalKelas />}

      {/* Toast */}
      {toast && (
        <div className="bounce-in" style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: toast.color, color: "#fff", borderRadius: 99, padding: "10px 24px", fontSize: 13, fontWeight: 700,
          zIndex: 9999, boxShadow: "0 4px 20px rgba(0,0,0,.25)", whiteSpace: "nowrap"
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}; // end AdminView


export default AdminContent;
