/**
 * SR MVP — IkhtisarSection (Portal Admin)
 * Tim 6 Fase 2 | src/components/admin/sections/IkhtisarSection.jsx
 */
import { useState } from 'react';
import { Card, Btn } from '../../shared/UI';
import { C } from '../../../styles/tokens';

const IkhtisarSection = ({ adminCtx, showToast, StatusBadge }) => {
  const { guruList, siswaList, kelasList, mapelList, setActivePage } = adminCtx;
  const totalSiswaAktif = siswaList.filter(s=>s.status==="Aktif").length;
  const totalGuruAktif  = guruList.filter(g=>g.status==="Aktif").length;
  const kelasKosong     = kelasList.filter(k=>!k.waliKelasId||Object.keys(k.mapelGuruMap).length<3);

  const alerts = [];
  kelasList.forEach(k=>{
    if(!k.waliKelasId) alerts.push(`${k.nama}: belum ada wali kelas`);
    if(Object.keys(k.mapelGuruMap).length < 3) alerts.push(`${k.nama}: belum semua mapel memiliki guru`);
  });
  return(
    <div style={{overflowY:"auto",width:"100%",height:"100%",padding:"20px 24px",boxSizing:"border-box"}}>
      <div style={{fontFamily:"'Source Serif 4',serif",fontSize:22,fontWeight:600,color:C.dark,marginBottom:4}}>
        🏠 Ikhtisar Sekolah
      </div>
      <div style={{fontSize:13,color:C.slate,marginBottom:20}}>
        {ADMIN_SEKOLAH.nama} · {ADMIN_SEKOLAH.kota} · Tahun Ajaran {ADMIN_KELAS_INIT[0].tahunAjaran}
      </div>

      {/* KPI */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
        {[
          {icon:"👨‍🏫",label:"Total Guru",value:guruList.length,sub:`${totalGuruAktif} aktif`,color:C.teal,onClick:()=>setActivePage("guru")},
          {icon:"🎒",label:"Total Siswa",value:siswaList.length,sub:`${totalSiswaAktif} aktif`,color:C.purple,onClick:()=>setActivePage("siswa")},
          {icon:"📚",label:"Total Kelas",value:kelasList.length,sub:`${mapelList.length} mapel tersedia`,color:C.orange,onClick:()=>setActivePage("kelas")},
          {icon:"⚠️",label:"Perlu Ditinjau",value:alerts.length+guruList.filter(g=>g.status==="Cuti").length,
            sub:alerts.length>0?"Ada item perlu perhatian":"Semua normal",color:alerts.length>0?C.red:C.green},
        ].map(s=>(
          <Card key={s.label} style={{padding:"16px",cursor:s.onClick?"pointer":"default",transition:"transform .2s,box-shadow .2s"}}
            onClick={s.onClick}
            onMouseEnter={e=>{if(s.onClick){e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(13,92,99,.12)";}}}
            onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 2px 12px rgba(26,35,50,.07)";}}>
            <div style={{fontSize:26,marginBottom:8}}>{s.icon}</div>
            <div style={{fontSize:10,color:C.slate,fontWeight:600,textTransform:"uppercase",letterSpacing:.8}}>{s.label}</div>
            <div style={{fontSize:28,fontWeight:800,color:C.dark,margin:"4px 0"}}>{s.value}</div>
            <div style={{fontSize:11,color:s.color,fontWeight:600}}>{s.sub}</div>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      {alerts.length>0&&(
        <div style={{background:C.amberL,borderRadius:12,padding:"14px 16px",marginBottom:20,
          border:`1px solid ${C.amber}44`}}>
          <div style={{fontWeight:700,color:C.orange,marginBottom:8,fontSize:13}}>⚠️ Perlu Ditindaklanjuti</div>
          {alerts.map((a,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:7,fontSize:12,color:C.dark,marginBottom:4}}>
              <span style={{color:C.amber}}>•</span>{a}
            </div>
          ))}
        </div>
      )}

      {/* Tabel ringkasan kelas */}
      <Card style={{overflow:"hidden",marginBottom:20}}>
        <div style={{padding:"12px 16px",borderBottom:`1px solid rgba(13,92,99,.08)`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontWeight:700,fontSize:14,color:C.dark}}>📚 Ringkasan Kelas</div>
          <Btn variant="soft" size="sm" onClick={()=>setActivePage("kelas")}>Kelola Kelas →</Btn>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{background:C.cream}}>
                {["Kelas","Jurusan","Wali Kelas","Siswa","Mapel Diajar","Aksi"].map(h=>(
                  <th key={h} style={{padding:"9px 14px",textAlign:"left",fontSize:10,fontWeight:700,
                    color:C.slate,textTransform:"uppercase",letterSpacing:.7,whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {kelasList.map(k=>{
                const wk = getGuru(k.waliKelasId);
                const jmapel = Object.keys(k.mapelGuruMap).length;
                return(
                  <tr key={k.id} style={{borderTop:`1px solid rgba(13,92,99,.06)`}}
                    onMouseEnter={e=>e.currentTarget.style.background="rgba(13,92,99,.02)"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{padding:"11px 14px"}}>
                      <div style={{fontWeight:700,fontSize:13,color:C.dark}}>{k.nama}</div>
                      <div style={{fontSize:10,color:C.slate}}>TA {k.tahunAjaran}</div>
                    </td>
                    <td style={{padding:"11px 14px"}}>
                      <span style={{fontSize:11,padding:"2px 8px",borderRadius:99,fontWeight:700,
                        background:k.jurusan==="IPA"?C.tealXL:C.amberL,
                        color:k.jurusan==="IPA"?C.teal:C.orange}}>{k.jurusan}</span>
                    </td>
                    <td style={{padding:"11px 14px"}}>
                      {wk
                        ?<div style={{display:"flex",alignItems:"center",gap:6}}>
                          <Avatar initials={wk.avatar} bg={wk.avatarBg} size={24}/>
                          <span style={{fontSize:12,color:C.dark}}>{wk.nama}</span>
                        </div>
                        :<span style={{fontSize:11,color:C.red,fontWeight:600}}>⚠ Belum ditentukan</span>}
                    </td>
                    <td style={{padding:"11px 14px"}}>
                      <span style={{fontWeight:700,fontSize:14,color:C.dark}}>{k.siswaIds.length}</span>
                      <span style={{fontSize:10,color:C.slate}}> siswa</span>
                    </td>
                    <td style={{padding:"11px 14px"}}>
                      <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                        {Object.keys(k.mapelGuruMap).map(mid=>{
                          const m=getMapel(mid);
                          return m?<span key={mid} style={{fontSize:9,padding:"1px 6px",borderRadius:99,
                            background:m.color+"18",color:m.color,fontWeight:600}}>{m.icon}</span>:null;
                        })}
                        {jmapel===0&&<span style={{fontSize:10,color:C.red}}>—</span>}
                      </div>
                    </td>
                    <td style={{padding:"11px 14px"}}>
                      <button onClick={()=>setSelectedKelas(k.id)}
                        style={{background:C.tealXL,border:"none",borderRadius:7,padding:"5px 10px",
                          fontSize:11,color:C.teal,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
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
      {guruList.filter(g=>g.status!=="Aktif").length>0&&(
        <Card style={{padding:"16px"}}>
          <div style={{fontWeight:700,fontSize:13,color:C.dark,marginBottom:10}}>👨‍🏫 Guru Tidak Aktif</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {guruList.filter(g=>g.status!=="Aktif").map(g=>(
              <div key={g.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",
                background:C.cream,borderRadius:9}}>
                <Avatar initials={g.avatar} bg={g.avatarBg} size={32}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:600,color:C.dark}}>{g.nama}</div>
                  <div style={{fontSize:10,color:C.slate}}>{g.mapelIds.map(id=>getMapel(id)?.label).join(", ")}</div>
                </div>
                <StatusBadge status={g.status}/>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default IkhtisarSection;
