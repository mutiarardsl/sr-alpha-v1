/**
 * SR MVP — KelasSection (Portal Admin)
 * Tim 6 Fase 2 | src/components/admin/sections/KelasSection.jsx
 * Mencakup PageKelas + PageKelasDetail (dipecah dari AdminView).
 */
import { useState } from 'react';
import { Card, Btn, Avatar } from '../../shared/UI';
import { C } from '../../../styles/tokens';

const KelasSection = ({ adminCtx, showToast, inpStyle, StatusBadge, MultiCheckbox, FormTambahMapel }) => {
  const { guruList, siswaList, kelasList, mapelList, setGuruList, setSiswaList, setKelasList, setMapelList,
    saveKelas, getKelas, getGuru, getMapel, getSiswaOfKelas,
    modal, setModal, modalData, setModalData, selectedKelas, setSelectedKelas,
    emptyKelas, updateMapelGuru, pindahKelas, nonaktifkanSiswa,
  } = adminCtx;
  // ── PAGE: KELAS ──────────────────────────────────────────────────
  const PageKelas = () => {
    if (selectedKelas) return <PageKelasDetail kelasId={selectedKelas}/>;
    return(
      <div className="admin-page-scroll" style={{padding:"20px 24px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div>
            <div style={{fontFamily:"'Source Serif 4',serif",fontSize:19,fontWeight:600,color:C.dark}}>📚 Manajemen Kelas</div>
            <div style={{fontSize:11,color:C.slate,marginTop:2}}>{kelasList.length} kelas terdaftar</div>
          </div>
          <Btn variant="primary" onClick={()=>{setModalData({...emptyKelas});setModal("tambah-kelas");}}>+ Tambah Kelas</Btn>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
          {kelasList.map(k=>{
            const wk=getGuru(k.waliKelasId);
            const siswas=getSiswaOfKelas(k.id);
            const mapelCount=Object.keys(k.mapelGuruMap).length;
            const alerts=[];
            if(!k.waliKelasId) alerts.push("Belum ada wali kelas");
            if(mapelCount<3) alerts.push("Mapel belum lengkap");
            return(
              <Card key={k.id} style={{overflow:"hidden",cursor:"pointer",transition:"transform .2s,box-shadow .2s"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(13,92,99,.12)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 2px 12px rgba(26,35,50,.07)";}}>
                <div style={{height:4,background:k.jurusan==="IPA"?C.teal:C.amber}}/>
                <div style={{padding:"16px"}}>
                  {alerts.length>0&&(
                    <div style={{background:C.amberL,borderRadius:7,padding:"5px 10px",fontSize:10,
                      color:C.orange,fontWeight:600,marginBottom:10}}>
                      ⚠ {alerts.join(" · ")}
                    </div>
                  )}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                    <div>
                      <div style={{fontFamily:"'Source Serif 4',serif",fontSize:16,fontWeight:600,color:C.dark}}>{k.nama}</div>
                      <div style={{fontSize:11,color:C.slate,marginTop:2}}>TA {k.tahunAjaran}</div>
                    </div>
                    <button onClick={(e)=>{e.stopPropagation();setModalData({...k});setModal("edit-kelas");}}
                      style={{width:30,height:30,background:C.cream,border:`1px solid ${C.tealXL}`,borderRadius:8,
                        fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
                        color:C.teal,flexShrink:0,transition:"all .15s"}}
                      onMouseEnter={e=>{e.currentTarget.style.background=C.tealXL;}}
                      onMouseLeave={e=>{e.currentTarget.style.background=C.cream;}}>
                      ✏️
                    </button>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                    <div style={{background:C.cream,borderRadius:8,padding:"9px 10px"}}>
                      <div style={{fontSize:18,fontWeight:800,color:C.dark}}>{siswas.length}</div>
                      <div style={{fontSize:9,color:C.slate}}>Total Siswa</div>
                    </div>
                    <div style={{background:C.cream,borderRadius:8,padding:"9px 10px"}}>
                      <div style={{fontSize:18,fontWeight:800,color:C.dark}}>{mapelCount}</div>
                      <div style={{fontSize:9,color:C.slate}}>Mapel Terisi</div>
                    </div>
                  </div>
                  <div style={{marginBottom:14}}>
                    <div style={{fontSize:10,color:C.slate,marginBottom:4}}>Wali Kelas</div>
                    {wk
                      ?<div style={{display:"flex",alignItems:"center",gap:6}}>
                        <Avatar initials={wk.avatar} bg={wk.avatarBg} size={24}/>
                        <span style={{fontSize:12,color:C.dark,fontWeight:600}}>{wk.nama}</span>
                      </div>
                      :<span style={{fontSize:11,color:C.red}}>⚠ Belum ditentukan</span>}
                  </div>
                  <Btn variant="primary" size="sm" onClick={()=>setSelectedKelas(k.id)} style={{width:"100%",justifyContent:"center"}}>
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
  const PageKelasDetail = ({kelasId}) => {
    const k = getKelas(kelasId);
    const [editMapelId, setEditMapelId] = useState(null);
    if (!k) return null;
    const wk = getGuru(k.waliKelasId);
    const siswas = getSiswaOfKelas(kelasId);
    // Guru yg bisa mengajar mapel tertentu
    const guruForMapel = (mapelId) => guruList.filter(g=>g.mapelIds.includes(mapelId)&&g.status==="Aktif");

    return(
      <div className="admin-page-scroll" style={{padding:"20px 24px"}}>
        {/* Breadcrumb */}
        <button onClick={()=>setSelectedKelas(null)}
          style={{background:"none",border:"none",color:C.teal,fontWeight:700,fontSize:13,
            cursor:"pointer",marginBottom:16,display:"flex",alignItems:"center",gap:5,padding:0}}>
          ← Kembali ke Daftar Kelas
        </button>

        {/* Header kelas */}
        <div style={{background:`linear-gradient(135deg,${C.teal},${C.tealL})`,borderRadius:16,
          padding:"20px 24px",marginBottom:20,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",right:-20,top:-20,width:100,height:100,borderRadius:"50%",background:"rgba(255,255,255,.06)"}}/>
          <div style={{position:"relative",zIndex:1}}>
            <div style={{fontFamily:"'Source Serif 4',serif",color:C.white,fontSize:22,fontWeight:600,marginBottom:4}}>{k.nama}</div>
            <div style={{color:"rgba(255,255,255,.7)",fontSize:12}}>
              Tahun Ajaran {k.tahunAjaran} · Tingkat {k.tingkat} · Jurusan {k.jurusan}
            </div>
            <div style={{display:"flex",gap:16,marginTop:12}}>
              {[
                {v:siswas.length,l:"Siswa"},
                {v:Object.keys(k.mapelGuruMap).length,l:"Mapel"},
              ].map(s=>(
                <div key={s.l} style={{background:"rgba(255,255,255,.15)",borderRadius:9,padding:"8px 14px",textAlign:"center"}}>
                  <div style={{fontWeight:800,fontSize:18,color:C.white}}>{s.v}</div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,.7)"}}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:18,marginBottom:18}}>
          {/* Wali Kelas */}
          <Card style={{padding:"16px"}}>
            <div style={{fontWeight:700,fontSize:13,color:C.dark,marginBottom:12}}>👤 Wali Kelas</div>
            {wk?(
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <Avatar initials={wk.avatar} bg={wk.avatarBg} size={40}/>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:13,color:C.dark}}>{wk.nama}</div>
                  <div style={{fontSize:11,color:C.slate}}>{wk.mapelIds.map(id=>getMapel(id)?.label).join(", ")}</div>
                  <div style={{fontSize:10,color:C.teal}}>{wk.email}</div>
                </div>
              </div>
            ):(
              <div style={{fontSize:12,color:C.red}}>⚠ Belum ada wali kelas</div>
            )}
            <div style={{marginTop:10}}>
              <label style={{fontSize:10,fontWeight:700,color:C.slate,display:"block",marginBottom:5}}>Ganti Wali Kelas</label>
              <select defaultValue={k.waliKelasId||""}
                onChange={e=>{
                  setKelasList(p=>p.map(kl=>kl.id===kelasId?{...kl,waliKelasId:e.target.value}:kl));
                  const g=getGuru(e.target.value);
                  showToast(`✅ Wali kelas ${k.nama} → ${g?.nama}`);
                }}
                style={{...inpStyle}}>
                <option value="">— Pilih Guru —</option>
                {guruList.filter(g=>g.status==="Aktif").map(g=>(
                  <option key={g.id} value={g.id}>{g.nama}</option>
                ))}
              </select>
            </div>
          </Card>

          {/* Info kelas */}
          <Card style={{padding:"16px"}}>
            <div style={{fontWeight:700,fontSize:13,color:C.dark,marginBottom:12}}>📋 Info Kelas</div>
            {[
              {l:"Nama Kelas",v:k.nama},
              {l:"Tingkat",v:`Kelas ${k.tingkat}`},
              {l:"Jurusan",v:k.jurusan},
              {l:"Tahun Ajaran",v:k.tahunAjaran},
            ].map(item=>(
              <div key={item.l} style={{display:"flex",justifyContent:"space-between",marginBottom:8,
                paddingBottom:8,borderBottom:`1px solid rgba(13,92,99,.06)`}}>
                <span style={{fontSize:11,color:C.slate}}>{item.l}</span>
                <span style={{fontSize:12,fontWeight:600,color:C.dark}}>{item.v}</span>
              </div>
            ))}
          </Card>
        </div>

        {/* Pengaturan Guru per Mapel */}
        <Card style={{overflow:"hidden",marginBottom:18}}>
          <div style={{padding:"12px 16px",borderBottom:`1px solid rgba(13,92,99,.08)`,
            display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{fontWeight:700,fontSize:14,color:C.dark}}>📚 Pengaturan Guru per Mapel</div>
              <div style={{fontSize:11,color:C.slate,marginTop:2}}>
                {Object.keys(k.mapelGuruMap).length} mapel ditetapkan · Klik "Ganti" untuk mengubah guru, atau tambah/hapus mapel
              </div>
            </div>
            <button onClick={()=>setEditMapelId("__add__")}
              style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",
                background:`linear-gradient(135deg,${C.teal},${C.tealL})`,border:"none",
                borderRadius:8,color:C.white,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
              + Tambah Mapel
            </button>
          </div>

          {/* Form tambah mapel baru ke kelas — komponen terpisah agar hooks tidak kondisional */}
          {editMapelId==="__add__"&&(
            <FormTambahMapel
              k={k} kelasId={kelasId}
              mapelList={mapelList} guruList={guruList}
              inpStyle={inpStyle} getMapel={getMapel} getGuru={getGuru}
              setKelasList={setKelasList} showToast={showToast}
              onDone={()=>setEditMapelId(null)}
            />
          )}

          <div style={{padding:"8px 0"}}>
            {Object.entries(k.mapelGuruMap).length===0&&(
              <div style={{textAlign:"center",padding:"20px 0",fontSize:12,color:C.slate}}>
                Belum ada mapel ditetapkan. Klik "+ Tambah Mapel" untuk memulai.
              </div>
            )}
            {Object.entries(k.mapelGuruMap).map(([mapelId, guruId])=>{
              const mapel       = getMapel(mapelId);
              const assignedGuru= getGuru(guruId);
              const eligible    = guruList.filter(g=>g.mapelIds.includes(mapelId)&&g.status==="Aktif");
              const isEditing   = editMapelId===mapelId;
              if(!mapel) return null;
              return(
                <div key={mapelId} style={{display:"flex",alignItems:"center",gap:12,
                  padding:"10px 16px",borderBottom:`1px solid rgba(13,92,99,.05)`}}>
                  <div style={{width:32,height:32,borderRadius:8,background:mapel.color+"18",
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>
                    {mapel.icon}
                  </div>
                  <div style={{width:130,flexShrink:0}}>
                    <div style={{fontSize:12,fontWeight:700,color:C.dark}}>{mapel.label}</div>
                  </div>
                  <div style={{flex:1}}>
                    {isEditing?(
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <select defaultValue={guruId||""}
                          onChange={e=>{
                            setKelasList(p=>p.map(kl=>kl.id===kelasId
                              ?{...kl,mapelGuruMap:{...kl.mapelGuruMap,[mapelId]:e.target.value}}:kl));
                            const g=getGuru(e.target.value);
                            showToast(`✅ ${mapel.label} di ${k.nama} → ${g?.nama||"(kosong)"}`);
                            setEditMapelId(null);
                          }}
                          style={{...inpStyle,flex:1,padding:"6px 10px",fontSize:12}}>
                          <option value="">— Tidak ada guru —</option>
                          {eligible.map(g=><option key={g.id} value={g.id}>{g.nama}</option>)}
                          {eligible.length===0&&<option disabled>Belum ada guru mapel ini</option>}
                        </select>
                        <button onClick={()=>setEditMapelId(null)}
                          style={{background:"none",border:"none",color:C.slate,cursor:"pointer",fontSize:14}}>✕</button>
                      </div>
                    ):(
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        {assignedGuru?(
                          <>
                            <Avatar initials={assignedGuru.avatar} bg={assignedGuru.avatarBg} size={24}/>
                            <span style={{fontSize:12,color:C.dark}}>{assignedGuru.nama}</span>
                          </>
                        ):(
                          <span style={{fontSize:11,color:C.slate,fontStyle:"italic"}}>Belum ada guru</span>
                        )}
                      </div>
                    )}
                  </div>
                  {!isEditing&&(
                    <div style={{display:"flex",gap:5,flexShrink:0}}>
                      <button onClick={()=>setEditMapelId(mapelId)}
                        style={{background:C.tealXL,border:"none",borderRadius:7,padding:"5px 9px",
                          fontSize:11,color:C.teal,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                        {assignedGuru?"Ganti":"Tetapkan"}
                      </button>
                      <button onClick={()=>{
                        if(!window.confirm(`Hapus ${mapel.label} dari ${k.nama}?`)) return;
                        setKelasList(p=>p.map(kl=>{
                          if(kl.id!==kelasId) return kl;
                          const newMap={...kl.mapelGuruMap};
                          delete newMap[mapelId];
                          return {...kl,mapelGuruMap:newMap};
                        }));
                        showToast(`🗑 ${mapel.label} dihapus dari ${k.nama}`,C.red);
                      }}
                        style={{background:C.redL,border:"none",borderRadius:7,padding:"5px 9px",
                          fontSize:11,color:C.red,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
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
        <Card style={{overflow:"hidden"}}>
          <div style={{padding:"12px 16px",borderBottom:`1px solid rgba(13,92,99,.08)`,
            display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{fontWeight:700,fontSize:14,color:C.dark}}>🎒 Daftar Siswa</div>
              <div style={{fontSize:11,color:C.slate,marginTop:1}}>{siswas.length} siswa di kelas ini</div>
            </div>
            <Btn variant="soft" size="sm" onClick={()=>{
              setModalData({...emptySiswa,kelasId:kelasId});
              setModal("tambah-siswa");
            }}>+ Tambah Siswa</Btn>
          </div>
          <div style={{overflowX:"auto",maxHeight:380,overflowY:"auto",width:"100%"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{background:C.cream}}>
                  {["Nama","NIS","Email","Aksi"].map(h=>(
                    <th key={h} style={{padding:"8px 14px",textAlign:"left",fontSize:10,fontWeight:700,
                      color:C.slate,textTransform:"uppercase",letterSpacing:.7,whiteSpace:"nowrap"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {siswas.map(s=>(
                  <tr key={s.id} style={{borderTop:`1px solid rgba(13,92,99,.05)`}}
                    onMouseEnter={e=>e.currentTarget.style.background="rgba(13,92,99,.02)"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{padding:"9px 14px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:7}}>
                        <Avatar initials={s.avatar} bg={s.avatarBg} size={26}/>
                        <span style={{fontSize:12,fontWeight:600,color:C.dark}}>{s.nama}</span>
                      </div>
                    </td>
                    <td style={{padding:"9px 14px"}}><span style={{fontSize:11,fontFamily:"monospace",color:C.darkL}}>{s.nis}</span></td>
                    <td style={{padding:"9px 14px"}}><span style={{fontSize:11,color:C.teal}}>{s.email}</span></td>
                    <td style={{padding:"9px 14px"}}>
                      <div style={{display:"flex",gap:4}}>
                        <button onClick={()=>{setModalData({...s});setModal("edit-siswa");}}
                          style={{background:C.tealXL,border:"none",borderRadius:6,padding:"3px 8px",
                            fontSize:10,color:C.teal,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Edit</button>
                        <button onClick={()=>{
                          if(!window.confirm(`Hapus ${s.nama} dari ${k.nama}?`)) return;
                          setSiswaList(p=>p.filter(x=>x.id!==s.id));
                          setKelasList(p=>p.map(kl=>kl.id===kelasId?{...kl,siswaIds:kl.siswaIds.filter(id=>id!==s.id)}:kl));
                          showToast(`🗑 ${s.nama} dihapus`,C.red);
                        }}
                          style={{background:C.redL,border:"none",borderRadius:6,padding:"3px 8px",
                            fontSize:10,color:C.red,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {siswas.length===0&&(
              <div style={{textAlign:"center",padding:"28px 0"}}>
                <div style={{fontSize:12,color:C.slate}}>Belum ada siswa di kelas ini</div>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  };

  // ── DRAWER: DETAIL GURU ──────────────────────────────────────────
  const GuruDrawer = () => {
    const g = guruList.find(x=>x.id===selectedGuru);
    if (!g) return null;
    return(
      <div style={{position:"fixed",inset:0,background:"rgba(26,35,50,.4)",display:"flex",
        alignItems:"center",justifyContent:"flex-end",zIndex:998,backdropFilter:"blur(2px)"}}
        onClick={()=>setSelectedGuru(null)}>
        <div className="slide-right" onClick={e=>e.stopPropagation()}
          style={{width:380,height:"100vh",background:C.white,overflowY:"auto",
            boxShadow:"-10px 0 40px rgba(0,0,0,.15)",display:"flex",flexDirection:"column"}}>
          {/* Header */}
          <div style={{padding:"18px 18px 14px",borderBottom:`1px solid rgba(13,92,99,.08)`,
            display:"flex",alignItems:"flex-start",gap:12}}>
            <Avatar initials={g.avatar} bg={g.avatarBg} size={48}/>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:16,color:C.dark}}>{g.nama}</div>
              <div style={{fontSize:11,color:C.slate,marginTop:2}}>{g.email}</div>
            </div>
            <button onClick={()=>setSelectedGuru(null)} style={{background:C.cream,border:"none",borderRadius:8,
              width:28,height:28,cursor:"pointer",fontSize:14,color:C.slate}}>✕</button>
          </div>

          <div style={{flex:1,overflowY:"auto",padding:"16px 18px"}}>
            {/* Info */}
            {[
              {l:"NIP",v:g.nip},
            ].map(item=>(
              <div key={item.l} style={{display:"flex",justifyContent:"space-between",
                padding:"8px 0",borderBottom:`1px solid rgba(13,92,99,.06)`}}>
                <span style={{fontSize:12,color:C.slate}}>{item.l}</span>
                <span style={{fontSize:12,fontWeight:600,color:C.dark}}>{item.v}</span>
              </div>
            ))}

            {/* Mapel */}
            <div style={{marginTop:14,marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:700,color:C.dark,marginBottom:8}}>📚 Mapel yang Diajar</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {g.mapelIds.map(mid=>{
                  const m=getMapel(mid);
                  return m?<span key={mid} style={{fontSize:11,padding:"4px 10px",borderRadius:99,
                    background:m.color+"18",color:m.color,fontWeight:600}}>{m.icon} {m.label}</span>:null;
                })}
              </div>
            </div>

            {/* Kelas */}
            <div style={{marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:700,color:C.dark,marginBottom:8}}>🎓 Kelas yang Dipegang</div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {g.kelasIds.map(kid=>{
                  const k=getKelas(kid);
                  if(!k) return null;
                  const isWali=k.waliKelasId===g.id;
                  return(
                    <div key={kid} style={{display:"flex",alignItems:"center",gap:8,
                      padding:"7px 10px",background:C.cream,borderRadius:8}}>
                      <span style={{fontSize:11,fontWeight:600,color:C.dark,flex:1}}>{k.nama}</span>
                      {isWali&&<span style={{fontSize:9,padding:"1px 7px",borderRadius:99,
                        background:C.tealXL,color:C.teal,fontWeight:700}}>Wali Kelas</span>}
                      <span style={{fontSize:10,color:C.slate}}>{k.jurusan}</span>
                    </div>
                  );
                })}
                {g.kelasIds.length===0&&<span style={{fontSize:12,color:C.slate,fontStyle:"italic"}}>Belum mengajar di kelas manapun</span>}
              </div>
            </div>
          </div>

          {/* Aksi */}
          <div style={{padding:"14px 18px",borderTop:`1px solid rgba(13,92,99,.08)`,
            display:"flex",gap:8,flexShrink:0}}>
            <Btn variant="soft" onClick={()=>{setModalData({...g});setModal("edit-guru");setSelectedGuru(null);}}
              style={{flex:1,justifyContent:"center"}}>✏️ Edit Data</Btn>
          </div>
        </div>
      </div>
    );
  };

  // ── DRAWER: DETAIL SISWA ─────────────────────────────────────────
  const SiswaDrawer = () => {
    const s = siswaList.find(x=>x.id===selectedSiswa);
    const [pindahTarget, setPindahTarget] = useState("");
    const [showPindah, setShowPindah] = useState(false);
    if (!s) return null;
    const kelas = getKelas(s.kelasId);
    return(
      <div style={{position:"fixed",inset:0,background:"rgba(26,35,50,.4)",display:"flex",
        alignItems:"center",justifyContent:"flex-end",zIndex:998,backdropFilter:"blur(2px)"}}
        onClick={()=>setSelectedSiswa(null)}>
        <div className="slide-right" onClick={e=>e.stopPropagation()}
          style={{width:360,height:"100vh",background:C.white,overflowY:"auto",
            boxShadow:"-10px 0 40px rgba(0,0,0,.15)",display:"flex",flexDirection:"column"}}>
          {/* Header */}
          <div style={{padding:"18px 18px 14px",borderBottom:`1px solid rgba(13,92,99,.08)`,
            display:"flex",alignItems:"flex-start",gap:12}}>
            <Avatar initials={s.avatar} bg={s.avatarBg} size={48}/>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:16,color:C.dark}}>{s.nama}</div>
              <div style={{fontSize:11,color:C.slate,marginTop:2}}>{s.email}</div>
              {kelas&&<span style={{marginTop:6,display:"inline-block",fontSize:10,padding:"2px 8px",borderRadius:99,
                background:C.tealXL,color:C.teal,fontWeight:700}}>{kelas.nama.replace("Kelas ","")}</span>}
            </div>
            <button onClick={()=>setSelectedSiswa(null)} style={{background:C.cream,border:"none",borderRadius:8,
              width:28,height:28,cursor:"pointer",fontSize:14,color:C.slate}}>✕</button>
          </div>

          <div style={{flex:1,overflowY:"auto",padding:"16px 18px"}}>
            {[
              {l:"NIS",v:s.nis},
              {l:"Kelas",v:kelas?.nama||"—"},
            ].map(item=>(
              <div key={item.l} style={{display:"flex",justifyContent:"space-between",
                padding:"9px 0",borderBottom:`1px solid rgba(13,92,99,.06)`}}>
                <span style={{fontSize:12,color:C.slate}}>{item.l}</span>
                <span style={{fontSize:12,fontWeight:600,color:C.dark}}>{item.v}</span>
              </div>
            ))}
          </div>

          {/* Aksi */}
          <div style={{padding:"14px 18px",borderTop:`1px solid rgba(13,92,99,.08)`,
            display:"flex",gap:8,flexShrink:0}}>
            <Btn variant="soft" onClick={()=>{setModalData({...s});setModal("edit-siswa");setSelectedSiswa(null);}}
              style={{flex:1,justifyContent:"center"}}>✏️ Edit Data</Btn>
          </div>
        </div>
      </div>
    );
  };

  // ── MODAL: FORM GURU ─────────────────────────────────────────────
  const ModalGuru = () => {
    const [form, setForm] = useState(modalData||{...emptyGuru});
    const isEdit = !!form.id;
    const setF = (k,v) => setForm(p=>({...p,[k]:v}));
    return(
      <div style={{position:"fixed",inset:0,background:"rgba(26,35,50,.55)",display:"flex",
        alignItems:"center",justifyContent:"center",zIndex:1200,backdropFilter:"blur(4px)"}}
        onClick={()=>setModal(null)}>
        <div className="bounce-in" onClick={e=>e.stopPropagation()}
          style={{background:C.white,borderRadius:16,padding:28,width:520,maxHeight:"88vh",
            overflowY:"auto",boxShadow:"0 24px 60px rgba(0,0,0,.2)"}}>
          <div style={{fontFamily:"'Source Serif 4',serif",fontSize:18,fontWeight:600,color:C.dark,marginBottom:4}}>
            {isEdit?"✏️ Edit Data Guru":"👨‍🏫 Tambah Guru Baru"}
          </div>
          <div style={{fontSize:12,color:C.slate,marginBottom:18}}>SR Kota Malang · {ADMIN_KELAS_INIT[0].tahunAjaran}</div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div>
              <label style={{fontSize:11,fontWeight:700,color:C.dark,display:"block",marginBottom:5}}>Nama Lengkap *</label>
              <input value={form.nama} onChange={e=>setF("nama",e.target.value)}
                placeholder="Nama lengkap + gelar" style={{...inpStyle}}
                onFocus={e=>e.target.style.borderColor=C.teal} onBlur={e=>e.target.style.borderColor=C.tealXL}/>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:700,color:C.dark,display:"block",marginBottom:5}}>NIP</label>
              <input value={form.nip} onChange={e=>setF("nip",e.target.value)}
                placeholder="18 digit NIP" style={{...inpStyle}}
                onFocus={e=>e.target.style.borderColor=C.teal} onBlur={e=>e.target.style.borderColor=C.tealXL}/>
            </div>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:11,fontWeight:700,color:C.dark,display:"block",marginBottom:5}}>Email *</label>
            <input value={form.email} onChange={e=>setF("email",e.target.value)}
              placeholder="nama@sr-malang.sch.id" style={{...inpStyle}}
              onFocus={e=>e.target.style.borderColor=C.teal} onBlur={e=>e.target.style.borderColor=C.tealXL}/>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:11,fontWeight:700,color:C.dark,display:"block",marginBottom:8}}>Mapel yang Diajar *</label>
            <MultiCheckbox items={mapelList} selected={form.mapelIds}
              onChange={v=>setF("mapelIds",v)} idKey="id" labelKey="label"/>
          </div>
          <div style={{marginBottom:20}}>
            <label style={{fontSize:11,fontWeight:700,color:C.dark,display:"block",marginBottom:8}}>Kelas yang Dipegang</label>
            <MultiCheckbox items={kelasList.map(k=>({id:k.id,label:k.nama.replace("Kelas ","")}))}
              selected={form.kelasIds} onChange={v=>setF("kelasIds",v)} idKey="id" labelKey="label"/>
          </div>
          <div style={{display:"flex",gap:10}}>
            <Btn variant="ghost" onClick={()=>setModal(null)} style={{flex:1,justifyContent:"center"}}>Batal</Btn>
            <Btn variant="amber" onClick={()=>saveGuru(form)} disabled={!form.nama||!form.email}
              style={{flex:2,justifyContent:"center"}}>
              {isEdit?"💾 Simpan Perubahan":"✅ Tambah Guru"}
            </Btn>
          </div>
        </div>
      </div>
    );
  };

  // ── MODAL: FORM SISWA ────────────────────────────────────────────
  const ModalSiswa = () => {
    const [form, setForm] = useState(modalData||{...emptySiswa});
    const isEdit = !!form.id;
    const setF = (k,v) => setForm(p=>({...p,[k]:v}));
    return(
      <div style={{position:"fixed",inset:0,background:"rgba(26,35,50,.55)",display:"flex",
        alignItems:"center",justifyContent:"center",zIndex:1200,backdropFilter:"blur(4px)"}}
        onClick={()=>setModal(null)}>
        <div className="bounce-in" onClick={e=>e.stopPropagation()}
          style={{background:C.white,borderRadius:16,padding:28,width:480,maxHeight:"88vh",
            overflowY:"auto",boxShadow:"0 24px 60px rgba(0,0,0,.2)"}}>
          <div style={{fontFamily:"'Source Serif 4',serif",fontSize:18,fontWeight:600,color:C.dark,marginBottom:4}}>
            {isEdit?"✏️ Edit Data Siswa":"🎒 Tambah Siswa Baru"}
          </div>
          <div style={{fontSize:12,color:C.slate,marginBottom:18}}>SR Kota Malang</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div>
              <label style={{fontSize:11,fontWeight:700,color:C.dark,display:"block",marginBottom:5}}>Nama Lengkap *</label>
              <input value={form.nama} onChange={e=>setF("nama",e.target.value)}
                placeholder="Nama lengkap siswa" style={{...inpStyle}}
                onFocus={e=>e.target.style.borderColor=C.teal} onBlur={e=>e.target.style.borderColor=C.tealXL}/>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:700,color:C.dark,display:"block",marginBottom:5}}>NIS *</label>
              <input value={form.nis} onChange={e=>setF("nis",e.target.value)}
                placeholder="Nomor Induk Siswa" style={{...inpStyle}}
                onFocus={e=>e.target.style.borderColor=C.teal} onBlur={e=>e.target.style.borderColor=C.tealXL}/>
            </div>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:11,fontWeight:700,color:C.dark,display:"block",marginBottom:5}}>Email</label>
            <input value={form.email} onChange={e=>setF("email",e.target.value)}
              placeholder="nama@siswa.sr" style={{...inpStyle}}
              onFocus={e=>e.target.style.borderColor=C.teal} onBlur={e=>e.target.style.borderColor=C.tealXL}/>
          </div>
          <div style={{marginBottom:20}}>
            <label style={{fontSize:11,fontWeight:700,color:C.dark,display:"block",marginBottom:5}}>Kelas *</label>
            <select value={form.kelasId} onChange={e=>setF("kelasId",e.target.value)} style={{...inpStyle}}>
              <option value="">— Pilih Kelas —</option>
              {kelasList.map(k=><option key={k.id} value={k.id}>{k.nama}</option>)}
            </select>
          </div>
          <div style={{display:"flex",gap:10}}>
            <Btn variant="ghost" onClick={()=>setModal(null)} style={{flex:1,justifyContent:"center"}}>Batal</Btn>
            <Btn variant="amber" onClick={()=>saveSiswa(form)} disabled={!form.nama||!form.nis||!form.kelasId}
              style={{flex:2,justifyContent:"center"}}>
              {isEdit?"💾 Simpan Perubahan":"✅ Tambah Siswa"}
            </Btn>
          </div>
        </div>
      </div>
    );
  };

  // ── MODAL: FORM KELAS ────────────────────────────────────────────
  const ModalKelas = () => {
    const [form, setForm] = useState(modalData||{...emptyKelas});
    const isEdit = !!form.id;
    const setF = (k,v) => setForm(p=>({...p,[k]:v}));
    return(
      <div style={{position:"fixed",inset:0,background:"rgba(26,35,50,.55)",display:"flex",
        alignItems:"center",justifyContent:"center",zIndex:1200,backdropFilter:"blur(4px)"}}
        onClick={()=>setModal(null)}>
        <div className="bounce-in" onClick={e=>e.stopPropagation()}
          style={{background:C.white,borderRadius:16,padding:28,width:460,maxHeight:"88vh",
            overflowY:"auto",boxShadow:"0 24px 60px rgba(0,0,0,.2)"}}>
          <div style={{fontFamily:"'Source Serif 4',serif",fontSize:18,fontWeight:600,color:C.dark,marginBottom:4}}>
            {isEdit?"✏️ Edit Kelas":"📚 Tambah Kelas Baru"}
          </div>
          <div style={{fontSize:12,color:C.slate,marginBottom:18}}>SR Kota Malang</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div>
              <label style={{fontSize:11,fontWeight:700,color:C.dark,display:"block",marginBottom:5}}>Nama Kelas *</label>
              <input value={form.nama} onChange={e=>setF("nama",e.target.value)}
                placeholder="Contoh: Kelas X IPA 2" style={{...inpStyle}}
                onFocus={e=>e.target.style.borderColor=C.teal} onBlur={e=>e.target.style.borderColor=C.tealXL}/>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:700,color:C.dark,display:"block",marginBottom:5}}>Tahun Ajaran</label>
              <input value={form.tahunAjaran} onChange={e=>setF("tahunAjaran",e.target.value)}
                placeholder="2025/2026" style={{...inpStyle}}
                onFocus={e=>e.target.style.borderColor=C.teal} onBlur={e=>e.target.style.borderColor=C.tealXL}/>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div>
              <label style={{fontSize:11,fontWeight:700,color:C.dark,display:"block",marginBottom:5}}>Tingkat</label>
              <select value={form.tingkat} onChange={e=>setF("tingkat",e.target.value)} style={{...inpStyle}}>
                {["X","XI","XII"].map(t=><option key={t} value={t}>Kelas {t}</option>)}
              </select>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:700,color:C.dark,display:"block",marginBottom:5}}>Jurusan</label>
              <select value={form.jurusan} onChange={e=>setF("jurusan",e.target.value)} style={{...inpStyle}}>
                {["IPA","IPS","Bahasa","Umum"].map(j=><option key={j} value={j}>{j}</option>)}
              </select>
            </div>
          </div>
          <div style={{marginBottom:20}}>
            <label style={{fontSize:11,fontWeight:700,color:C.dark,display:"block",marginBottom:5}}>Wali Kelas</label>
            <select value={form.waliKelasId||""} onChange={e=>setF("waliKelasId",e.target.value)} style={{...inpStyle}}>
              <option value="">— Belum ditentukan —</option>
              {guruList.filter(g=>g.status==="Aktif").map(g=>(
                <option key={g.id} value={g.id}>{g.nama}</option>
              ))}
            </select>
          </div>
          <div style={{display:"flex",gap:10}}>
            <Btn variant="ghost" onClick={()=>setModal(null)} style={{flex:1,justifyContent:"center"}}>Batal</Btn>
            <Btn variant="amber" onClick={()=>saveKelas(form)} disabled={!form.nama}
              style={{flex:2,justifyContent:"center"}}>
              {isEdit?"💾 Simpan Perubahan":"✅ Buat Kelas"}
            </Btn>
          </div>
        </div>
      </div>
    );
  };


};

export default KelasSection;
