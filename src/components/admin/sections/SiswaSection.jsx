/**
 * SR MVP — SiswaSection (Portal Admin)
 * Tim 6 Fase 2 | src/components/admin/sections/SiswaSection.jsx
 */
import { useState, useRef } from 'react';
import { Card, Btn, Avatar, ProgressBar } from '../../shared/UI';
import { C } from '../../../styles/tokens';


const SiswaSection = ({ adminCtx, showToast, inpStyle, StatusBadge, MultiCheckbox }) => {
  const { guruList, siswaList, kelasList, mapelList, setGuruList, setSiswaList, setKelasList, setMapelList,
    saveGuru, saveSiswa, deleteSiswa, saveKelas, saveMapel, deleteMapel,
    modal, setModal, modalData, setModalData, selectedGuru, setSelectedGuru,
    selectedSiswa, setSelectedSiswa, selectedKelas, setSelectedKelas,
    nonaktifkanGuru, nonaktifkanSiswa, pindahKelas, updateMapelGuru, getKelas, getGuru, getMapel, getSiswaOfKelas,
    emptyGuru, emptySiswa, emptyKelas, filterKelasId, setFilterKelasId,
  } = adminCtx;
  const [search, setSearch] = useState("");
  const [filterKelas, setFilterKelas] = useState(filterKelasId||"all");
  const filtered = siswaList.filter(s=>{
    const matchK = filterKelas==="all"||s.kelasId===filterKelas;
    const matchQ = !search||s.nama.toLowerCase().includes(search.toLowerCase())||s.nis.includes(search);
    return matchK&&matchQ;
  });
  return(
    <div className="admin-page">
      {/* Header */}
      <div className="admin-header" style={{background:C.white,borderBottom:`1px solid rgba(13,92,99,.08)`}}>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Source Serif 4',serif",fontSize:19,fontWeight:600,color:C.dark}}>🎒 Manajemen Siswa</div>
          <div style={{fontSize:11,color:C.slate,marginTop:2}}>{siswaList.length} siswa terdaftar</div>
        </div>
        <div style={{position:"relative"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Cari nama / NIS..."
            style={{...inpStyle,width:180,paddingLeft:30}}
            onFocus={e=>e.target.style.borderColor=C.teal}
            onBlur={e=>e.target.style.borderColor=C.tealXL}/>
          <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:12,color:C.slate}}>🔍</span>
        </div>
        <select value={filterKelas} onChange={e=>setFilterKelas(e.target.value)}
          style={{...inpStyle,width:150}}>
          <option value="all">Semua Kelas</option>
          {kelasList.map(k=><option key={k.id} value={k.id}>{k.nama}</option>)}
        </select>
        <Btn variant="primary" onClick={()=>{setModalData({...emptySiswa});setModal("tambah-siswa");}}>
          + Tambah Siswa
        </Btn>
      </div>

      {/* Tabel */}
      <div className="admin-table-wrap">
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead style={{position:"sticky",top:0,zIndex:2}}>
            <tr style={{background:C.cream}}>
              {["Nama Siswa","NIS","Email","Kelas","Aksi"].map(h=>(
                <th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:10,fontWeight:700,
                  color:C.slate,textTransform:"uppercase",letterSpacing:.7,whiteSpace:"nowrap",
                  borderBottom:`1px solid rgba(13,92,99,.08)`}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(s=>{
              const kelas = getKelas(s.kelasId);
              return(
                <tr key={s.id} style={{borderTop:`1px solid rgba(13,92,99,.05)`,cursor:"pointer",transition:"background .15s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(13,92,99,.02)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                  onClick={()=>setSelectedSiswa(s.id)}>
                  <td style={{padding:"11px 14px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:9}}>
                      <Avatar initials={s.avatar} bg={s.avatarBg} size={30}/>
                      <div style={{fontWeight:600,fontSize:13,color:C.dark}}>{s.nama}</div>
                    </div>
                  </td>
                  <td style={{padding:"11px 14px"}}><span style={{fontSize:11,color:C.darkL,fontFamily:"monospace"}}>{s.nis}</span></td>
                  <td style={{padding:"11px 14px"}}><span style={{fontSize:12,color:C.teal}}>{s.email}</span></td>
                  <td style={{padding:"11px 14px"}}>
                    {kelas?<span style={{fontSize:11,padding:"2px 8px",borderRadius:99,background:C.tealXL,color:C.teal,fontWeight:600}}>
                      {kelas.nama.replace("Kelas ","")}
                    </span>:<span style={{fontSize:11,color:C.slate}}>—</span>}
                  </td>
                  <td style={{padding:"11px 14px"}} onClick={e=>e.stopPropagation()}>
                    <button onClick={()=>{setModalData({...s});setModal("edit-siswa");}}
                      style={{background:C.tealXL,border:"none",borderRadius:6,padding:"4px 9px",
                        fontSize:11,color:C.teal,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                      Edit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length===0&&(
          <div style={{textAlign:"center",padding:"48px 0"}}>
            <div style={{fontSize:36,marginBottom:10}}>🔍</div>
            <div style={{fontSize:14,color:C.slate}}>Tidak ada siswa ditemukan</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SiswaSection;
