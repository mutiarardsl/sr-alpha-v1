/**
 * SR MVP — GuruSection (Portal Admin)
 * Tim 6 Fase 2 | src/components/admin/sections/GuruSection.jsx
 */
import { useState, useRef } from 'react';
import { Card, Btn, Avatar, ProgressBar } from '../../shared/UI';
import { C } from '../../../styles/tokens';


const GuruSection = ({ adminCtx, showToast, inpStyle, StatusBadge, MultiCheckbox }) => {
  const { guruList, siswaList, kelasList, mapelList, setGuruList, setSiswaList, setKelasList, setMapelList,
    saveGuru, saveSiswa, deleteSiswa, saveKelas, saveMapel, deleteMapel,
    modal, setModal, modalData, setModalData, selectedGuru, setSelectedGuru,
    selectedSiswa, setSelectedSiswa, selectedKelas, setSelectedKelas,
    nonaktifkanGuru, nonaktifkanSiswa, pindahKelas, updateMapelGuru, getKelas, getGuru, getMapel, getSiswaOfKelas,
    emptyGuru, emptySiswa, emptyKelas, filterKelasId, setFilterKelasId,
  } = adminCtx;
  const [search, setSearch] = useState("");
  const filtered = guruList.filter(g=>{
    return !search||g.nama.toLowerCase().includes(search.toLowerCase())||g.email.toLowerCase().includes(search.toLowerCase());
  });
  return(
    <div className="admin-page">
      {/* Header */}
      <div className="admin-header" style={{background:C.white,borderBottom:`1px solid rgba(13,92,99,.08)`}}>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Source Serif 4',serif",fontSize:19,fontWeight:600,color:C.dark}}>👨‍🏫 Manajemen Guru</div>
          <div style={{fontSize:11,color:C.slate,marginTop:2}}>{guruList.length} guru terdaftar</div>
        </div>
        <div style={{position:"relative"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Cari nama / email..."
            style={{...inpStyle,width:200,paddingLeft:30}}
            onFocus={e=>e.target.style.borderColor=C.teal}
            onBlur={e=>e.target.style.borderColor=C.tealXL}/>
          <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:12,color:C.slate}}>🔍</span>
        </div>
        <Btn variant="primary" onClick={()=>{setModalData({...emptyGuru});setModal("tambah-guru");}}>
          + Tambah Guru
        </Btn>
      </div>

      {/* Tabel */}
      <div className="admin-table-wrap">
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead style={{position:"sticky",top:0,zIndex:2}}>
            <tr style={{background:C.cream}}>
              {["Nama Guru","NIP","Email","Mapel Diajar","Kelas","Aksi"].map(h=>(
                <th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:10,fontWeight:700,
                  color:C.slate,textTransform:"uppercase",letterSpacing:.7,whiteSpace:"nowrap",
                  borderBottom:`1px solid rgba(13,92,99,.08)`}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(g=>(
              <tr key={g.id} style={{borderTop:`1px solid rgba(13,92,99,.05)`,cursor:"pointer",transition:"background .15s"}}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(13,92,99,.02)"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                onClick={()=>setSelectedGuru(g.id)}>
                <td style={{padding:"11px 14px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:9}}>
                    <Avatar initials={g.avatar} bg={g.avatarBg} size={32}/>
                    <div style={{fontWeight:600,fontSize:13,color:C.dark}}>{g.nama}</div>
                  </div>
                </td>
                <td style={{padding:"11px 14px"}}><span style={{fontSize:11,color:C.darkL,fontFamily:"monospace"}}>{g.nip}</span></td>
                <td style={{padding:"11px 14px"}}><span style={{fontSize:12,color:C.teal}}>{g.email}</span></td>
                <td style={{padding:"11px 14px"}}>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                    {g.mapelIds.map(mid=>{
                      const m=getMapel(mid);
                      return m?<span key={mid} style={{fontSize:10,padding:"2px 8px",borderRadius:99,
                        background:m.color+"18",color:m.color,fontWeight:600}}>{m.icon} {m.label}</span>:null;
                    })}
                  </div>
                </td>
                <td style={{padding:"11px 14px"}}>
                  <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                    {g.kelasIds.map(kid=>{
                      const k=getKelas(kid);
                      return k?<span key={kid} style={{fontSize:10,padding:"2px 7px",borderRadius:99,
                        background:C.tealXL,color:C.teal,fontWeight:600}}>{k.nama.replace("Kelas ","")}</span>:null;
                    })}
                    {g.kelasIds.length===0&&<span style={{fontSize:11,color:C.slate}}>—</span>}
                  </div>
                </td>
                <td style={{padding:"11px 14px"}} onClick={e=>e.stopPropagation()}>
                  <div style={{display:"flex",gap:5}}>
                    <button onClick={()=>{setModalData({...g});setModal("edit-guru");}}
                      style={{background:C.tealXL,border:"none",borderRadius:6,padding:"4px 9px",
                        fontSize:11,color:C.teal,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length===0&&(
          <div style={{textAlign:"center",padding:"48px 0"}}>
            <div style={{fontSize:36,marginBottom:10}}>🔍</div>
            <div style={{fontSize:14,color:C.slate}}>Tidak ada guru ditemukan</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuruSection;
