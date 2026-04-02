/**
 * SR MVP — KurikulumSection (Portal Admin)
 * Tim 6 Fase 2 | src/components/admin/sections/KurikulumSection.jsx
 */
import { useState, useRef } from 'react';
import { Card, Btn } from '../../shared/UI';
import { C } from '../../../styles/tokens';

const KurikulumSection = ({ adminCtx, showToast, inpStyle, StatusBadge }) => {
  const { mapelList, setMapelList, saveMapel, deleteMapel, getMapel, modal, setModal, modalData, setModalData, emptyMapel } = adminCtx;
  // ── PAGE: KURIKULUM ──────────────────────────────────────────────
  const PageKurikulum = () => {
    const [modalMapel, setModalMapel] = useState(null); // null | {id?,label,icon,color,deskripsi,jamPerMinggu,tipe}
    const [konfirmHapus, setKonfirmHapus] = useState(null); // mapel id

    const emptyMapel = {label:"",icon:"📗",color:"#0D5C63",deskripsi:"",jamPerMinggu:2,tipe:"Wajib"};
    const ICON_OPTIONS = ["📐","🔬","📖","🌍","🌐","⚽","🎨","🇮🇩","🎵","💻","🧪","📊","🏛️","🔭","🧮","📗","🖊️","🌿"];
    const COLOR_OPTIONS = [
      {label:"Teal",    value:"#0D5C63"},{label:"Orange",  value:"#DD6B20"},
      {label:"Purple",  value:"#6B46C1"},{label:"Green",   value:"#2F855A"},
      {label:"Blue",    value:"#2B6CB0"},{label:"Brown",   value:"#C05621"},
      {label:"Gold",    value:"#B7791F"},{label:"Red",     value:"#9B2C2C"},
      {label:"Pink",    value:"#D53F8C"},{label:"Slate",   value:"#4A5568"},
    ];

    const saveMapel = (data) => {
      if(data.id) {
        setMapelList(p=>p.map(m=>m.id===data.id?{...m,...data}:m));
        showToast(`✅ Mapel ${data.label} diperbarui`);
      } else {
        const newId = data.label.toLowerCase().replace(/\s+/g,"_").replace(/[^a-z0-9_]/g,"").slice(0,10)+`_${Date.now()}`.slice(-4);
        setMapelList(p=>[...p,{...data,id:newId}]);
        showToast(`✅ Mapel ${data.label} ditambahkan ke kurikulum`);
      }
      setModalMapel(null);
    };

    const hapusMapel = (id) => {
      const m = mapelList.find(x=>x.id===id);
      // cek apakah masih dipakai di kelas manapun
      const dipakaiDi = kelasList.filter(k=>k.mapelGuruMap[id]);
      if(dipakaiDi.length>0){
        showToast(`⚠ ${m?.label} masih dipakai di: ${dipakaiDi.map(k=>k.nama).join(", ")}`,C.red);
        setKonfirmHapus(null); return;
      }
      setMapelList(p=>p.filter(x=>x.id!==id));
      // hapus juga dari mapelIds guru
      setGuruList(p=>p.map(g=>({...g,mapelIds:g.mapelIds.filter(mid=>mid!==id)})));
      showToast(`🗑 ${m?.label} dihapus dari kurikulum`,C.red);
      setKonfirmHapus(null);
    };

    // Ringkasan pemakaian mapel per kelas
    const mapelUsage = (mapelId) => kelasList.filter(k=>Object.keys(k.mapelGuruMap).includes(mapelId));
    const mapelGuruCount = (mapelId) => guruList.filter(g=>g.mapelIds.includes(mapelId)&&g.status==="Aktif").length;

    const ModalMapel = () => {
      const [form, setForm] = useState(modalMapel);
      const [kurikulumFile, setKurikulumFile] = useState(null);
      const [uploading, setUploading] = useState(false);
      const fileRef = useRef(null);
      const isEdit = !!form.id;
      const setF = (k,v) => setForm(p=>({...p,[k]:v}));

      const handleFileSelect = (files) => {
        if(!files?.length) return;
        const f = files[0];
        setUploading(true);
        setTimeout(()=>{ setKurikulumFile({name:f.name, size:f.size>1024*1024?`${(f.size/1024/1024).toFixed(1)} MB`:`${Math.round(f.size/1024)} KB`}); setUploading(false); }, 1200);
      };

      return(
        <div style={{position:"fixed",inset:0,background:"rgba(26,35,50,.55)",display:"flex",
          alignItems:"center",justifyContent:"center",zIndex:1200,backdropFilter:"blur(4px)"}}
          onClick={()=>setModalMapel(null)}>
          <div className="bounce-in" onClick={e=>e.stopPropagation()}
            style={{background:C.white,borderRadius:16,padding:28,width:480,maxHeight:"88vh",overflowY:"auto",
              boxShadow:"0 24px 60px rgba(0,0,0,.2)"}}>
            <div style={{fontFamily:"'Source Serif 4',serif",fontSize:18,fontWeight:600,color:C.dark,marginBottom:4}}>
              {isEdit?"✏️ Edit Mata Pelajaran":"📋 Tambah Mata Pelajaran Baru"}
            </div>
            <div style={{fontSize:12,color:C.slate,marginBottom:20}}>Kurikulum SR Kota Malang</div>

            <div style={{marginBottom:14}}>
              <label style={{fontSize:11,fontWeight:700,color:C.dark,display:"block",marginBottom:5}}>Nama Mata Pelajaran *</label>
              <input value={form.label} onChange={e=>setF("label",e.target.value)}
                placeholder="Contoh: Matematika" style={{...inpStyle}}
                onFocus={e=>e.target.style.borderColor=C.teal} onBlur={e=>e.target.style.borderColor=C.tealXL}/>
            </div>

            <div style={{marginBottom:18}}>
              <label style={{fontSize:11,fontWeight:700,color:C.dark,display:"block",marginBottom:5}}>Deskripsi (opsional)</label>
              <textarea value={form.deskripsi||""} onChange={e=>setF("deskripsi",e.target.value)}
                placeholder="Deskripsi singkat mata pelajaran..." rows={3}
                style={{...inpStyle,resize:"none",lineHeight:1.5}}
                onFocus={e=>e.target.style.borderColor=C.teal} onBlur={e=>e.target.style.borderColor=C.tealXL}/>
            </div>

            {/* Upload Kurikulum untuk AI */}
            <div style={{marginBottom:22}}>
              <label style={{fontSize:11,fontWeight:700,color:C.dark,display:"block",marginBottom:5}}>
                📄 Upload Kurikulum (untuk AI)
              </label>
              <div style={{fontSize:11,color:C.slate,marginBottom:8,lineHeight:1.5}}>
                Dokumen kurikulum akan diteruskan ke Agent AI untuk mendukung konten belajar siswa pada mapel ini.
              </div>
              <div
                onClick={()=>fileRef.current?.click()}
                style={{border:`2px dashed ${C.tealXL}`,borderRadius:10,padding:"16px",
                  textAlign:"center",cursor:"pointer",background:"#FAFEFF",transition:"all .2s",marginBottom:8}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=C.teal}
                onMouseLeave={e=>e.currentTarget.style.borderColor=C.tealXL}>
                <input ref={fileRef} type="file" accept=".pdf,.docx,.doc,.pptx,.txt"
                  style={{display:"none"}} onChange={e=>handleFileSelect(e.target.files)}/>
                {uploading?(
                  <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                    <div style={{width:14,height:14,border:`2px solid ${C.tealXL}`,borderTopColor:C.teal,borderRadius:"50%",animation:"spin .8s linear infinite"}}/>
                    <span style={{fontSize:12,color:C.teal}}>Memproses...</span>
                  </div>
                ):kurikulumFile?(
                  <div style={{display:"flex",alignItems:"center",gap:10,textAlign:"left"}}>
                    <span style={{fontSize:24}}>📄</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:600,color:C.dark}}>{kurikulumFile.name}</div>
                      <div style={{fontSize:10,color:C.slate}}>{kurikulumFile.size}</div>
                    </div>
                    <button onClick={e=>{e.stopPropagation();setKurikulumFile(null);}}
                      style={{background:"none",border:"none",color:C.slate,cursor:"pointer",fontSize:16}}>✕</button>
                  </div>
                ):(
                  <>
                    <div style={{fontSize:24,marginBottom:6}}>📂</div>
                    <div style={{fontSize:12,color:C.tealL,fontWeight:600}}>Klik untuk upload kurikulum</div>
                    <div style={{fontSize:10,color:C.slate,marginTop:3}}>PDF, Word, PowerPoint, TXT</div>
                  </>
                )}
              </div>
              {kurikulumFile&&(
                <div style={{background:C.tealXL,borderRadius:8,padding:"8px 12px",fontSize:11,color:C.teal,display:"flex",gap:6,alignItems:"center"}}>
                  <span>🤖</span>
                  <span>File kurikulum akan diteruskan ke Agent AI untuk mendukung konten belajar siswa.</span>
                </div>
              )}
            </div>

            <div style={{display:"flex",gap:10}}>
              <Btn variant="ghost" onClick={()=>setModalMapel(null)} style={{flex:1,justifyContent:"center"}}>Batal</Btn>
              <Btn variant="amber" onClick={()=>saveMapel(form)} disabled={!form.label.trim()}
                style={{flex:2,justifyContent:"center"}}>
                {isEdit?"💾 Simpan Perubahan":"✅ Tambah Mapel"}
              </Btn>
            </div>
          </div>
        </div>
      );
    };

    // Tipe badge warna
    const tipeCfg = {
      "Wajib":       {bg:C.tealXL,  color:C.teal},
      "Peminatan":   {bg:C.purpleL, color:C.purple},
      "Muatan Lokal":{bg:C.amberL,  color:C.orange},
      "Ekstra":      {bg:C.greenL,  color:C.green},
    };

    const byTipe = ["Wajib","Peminatan","Muatan Lokal","Ekstra"].reduce((acc,t)=>{
      acc[t]=mapelList.filter(m=>(m.tipe||"Wajib")===t); return acc;
    },{});

    return(
      <div className="admin-page-scroll" style={{padding:"20px 24px"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20}}>
          <div>
            <div style={{fontFamily:"'Source Serif 4',serif",fontSize:22,fontWeight:600,color:C.dark}}>📋 Kurikulum & Mata Pelajaran</div>
            <div style={{fontSize:12,color:C.slate,marginTop:3}}>
              SR Kota Malang · {mapelList.length} mata pelajaran terdaftar
            </div>
          </div>
          <Btn variant="primary" onClick={()=>setModalMapel({...emptyMapel})}>
            + Tambah Mata Pelajaran
          </Btn>
        </div>

        {/* Daftar mapel — grid sederhana */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12,marginBottom:20}}>
          {mapelList.map(m=>(
            <Card key={m.id} style={{padding:"16px",transition:"transform .2s,box-shadow .2s"}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(13,92,99,.1)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 2px 12px rgba(26,35,50,.07)";}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                <div style={{width:40,height:40,borderRadius:10,background:m.color+"18",
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
                  {m.icon}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:14,color:C.dark}}>{m.label}</div>
                  {m.deskripsi&&<div style={{fontSize:11,color:C.slate,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",
                    display:"-webkit-box",WebkitLineClamp:1,WebkitBoxOrient:"vertical"}}>{m.deskripsi}</div>}
                </div>
              </div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>setModalMapel({...emptyMapel,...m})}
                  style={{flex:1,padding:"7px",background:C.tealXL,border:"none",borderRadius:8,
                    fontSize:12,color:C.teal,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
                  ✏️ Edit
                </button>
                <button onClick={()=>setKonfirmHapus(m.id)}
                  style={{padding:"7px 12px",background:C.redL,border:"none",borderRadius:8,
                    fontSize:12,color:C.red,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                  🗑 Hapus
                </button>
              </div>
            </Card>
          ))}
        </div>

        {mapelList.length===0&&(
          <div style={{textAlign:"center",padding:"60px 0"}}>
            <div style={{fontSize:48,marginBottom:12}}>📋</div>
            <div style={{fontSize:16,fontWeight:600,color:C.dark,marginBottom:6}}>Belum ada mata pelajaran</div>
            <div style={{fontSize:13,color:C.slate,marginBottom:20}}>Tambahkan mata pelajaran untuk kurikulum sekolah</div>
            <Btn variant="primary" onClick={()=>setModalMapel({...emptyMapel})}>+ Tambah Mata Pelajaran</Btn>
          </div>
        )}

        {/* Modal tambah/edit mapel */}
        {modalMapel&&<ModalMapel/>}

        {/* Konfirmasi hapus */}
        {konfirmHapus&&(()=>{
          const m=mapelList.find(x=>x.id===konfirmHapus);
          const usedIn=mapelUsage(konfirmHapus);
          return(
            <div style={{position:"fixed",inset:0,background:"rgba(26,35,50,.55)",display:"flex",
              alignItems:"center",justifyContent:"center",zIndex:1200,backdropFilter:"blur(4px)"}}
              onClick={()=>setKonfirmHapus(null)}>
              <div className="bounce-in" onClick={e=>e.stopPropagation()}
                style={{background:C.white,borderRadius:14,padding:26,width:380,
                  boxShadow:"0 24px 60px rgba(0,0,0,.2)"}}>
                <div style={{fontSize:32,marginBottom:10}}>⚠️</div>
                <div style={{fontFamily:"'Source Serif 4',serif",fontSize:17,fontWeight:600,color:C.dark,marginBottom:8}}>
                  Hapus {m?.label}?
                </div>
                {usedIn.length>0?(
                  <div style={{background:C.redL,borderRadius:9,padding:"10px 12px",marginBottom:14,fontSize:12,color:C.red}}>
                    ⚠ Mapel ini masih digunakan di {usedIn.length} kelas: {usedIn.map(k=>k.nama).join(", ")}.<br/>
                    Hapus mapel dari kelas tersebut terlebih dahulu.
                  </div>
                ):(
                  <div style={{fontSize:13,color:C.darkL,marginBottom:16,lineHeight:1.6}}>
                    Mapel ini akan dihapus dari kurikulum. Data mapel di guru yang mengampu juga akan dihapus.
                  </div>
                )}
                <div style={{display:"flex",gap:10}}>
                  <Btn variant="ghost" onClick={()=>setKonfirmHapus(null)} style={{flex:1,justifyContent:"center"}}>Batal</Btn>
                  {usedIn.length===0&&(
                    <Btn variant="danger" onClick={()=>hapusMapel(konfirmHapus)} style={{flex:1,justifyContent:"center"}}>
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

export default KurikulumSection;
