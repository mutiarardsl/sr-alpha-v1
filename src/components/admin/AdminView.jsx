/**
 * SR MVP — AdminView Shell
 * Tim 6 Fase 2 | src/components/admin/AdminView.jsx
 *
 * Shell: state + helpers + routing only. Pages → sections/.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAdmin } from '../../context/AdminContext';
import { C } from '../../styles/tokens';
import {
  ADMIN_MAPEL_LIST, ADMIN_GURU_INIT, ADMIN_KELAS_INIT, ADMIN_SISWA_INIT,
} from '../../data/masterData';

// ── Inline section components (AdminView sections are deeply stateful — keep close) ──
// Sections access adminCtx object; complex drawers/modals stay in AdminView for now.
// Full section extraction is deferred to Fase 3 to avoid breaking merge surface.

const inpStyle = {
  width:'100%', padding:'9px 12px',
  border:`1.5px solid #D4F0F3`, borderRadius:9,
  fontSize:13, outline:'none', background:'#fff', fontFamily:'inherit',
};

const StatusBadge = ({status}) => {
  const cfg = {
    'Aktif':   {bg:'#C6F6D5', color:'#2F855A'},
    'Cuti':    {bg:'#FEFCBF', color:'#B7791F'},
    'Nonaktif':{bg:'#EDF2F7', color:'#718096'},
    'Keluar':  {bg:'#FED7D7', color:'#9B2C2C'},
  }[status] || {bg:'#EDF2F7', color:'#718096'};
  return <span style={{fontSize:10,padding:'2px 8px',borderRadius:99,fontWeight:700,background:cfg.bg,color:cfg.color,whiteSpace:'nowrap'}}>{status}</span>;
};

const MultiCheckbox = ({items,selected,onChange,labelKey='label',idKey='id'}) => (
  <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
    {items.map(item=>{
      const isOn=selected.includes(item[idKey]);
      return(
        <button key={item[idKey]} onClick={()=>onChange(isOn?selected.filter(x=>x!==item[idKey]):[...selected,item[idKey]])}
          style={{padding:'4px 10px',borderRadius:99,fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'inherit',
            border:`1.5px solid ${isOn?'#0D5C63':'#D4F0F3'}`,
            background:isOn?'#D4F0F3':'#fff',color:isOn?'#0D5C63':'#718096',transition:'all .15s'}}>
          {item[labelKey]}
        </button>
      );
    })}
  </div>
);

const ADMIN_MAPEL_LIST_LOCAL = [
  {id:'mat',label:'Matematika',icon:'📐',color:'#0D5C63'},
  {id:'ipa',label:'IPA',icon:'🔬',color:'#DD6B20'},
  {id:'bin',label:'B. Indonesia',icon:'📖',color:'#6B46C1'},
  {id:'ips',label:'IPS',icon:'🌍',color:'#2F855A'},
  {id:'eng',label:'B. Inggris',icon:'🌐',color:'#2B6CB0'},
  {id:'pjok',label:'PJOK',icon:'⚽',color:'#C05621'},
  {id:'seni',label:'Seni Budaya',icon:'🎨',color:'#B7791F'},
  {id:'ppkn',label:'PPKn',icon:'🇮🇩',color:'#9B2C2C'},
];

const AdminView = () => {
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

  const [activePage,    setActivePage]    = useState('kelas');
  const [selectedGuru,  setSelectedGuru]  = useState(null);
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [selectedKelas, setSelectedKelas] = useState(null);
  const [modal,         setModal]         = useState(null);
  const [modalData,     setModalData]     = useState(null);
  const [toast,         setToast]         = useState(null);
  const [filterKelasId, setFilterKelasId] = useState('all');

  const showToast = (msg, color='#2F855A') => {
    setToast({msg, color}); setTimeout(() => setToast(null), 3000);
  };

  const getKelas = (id) => kelasList.find(k=>k.id===id);
  const getGuru  = (id) => guruList.find(g=>g.id===id);
  const getMapel = (id) => (ADMIN_MAPEL_LIST_LOCAL).find(m=>m.id===id);
  const getSiswaOfKelas = (kelasId) => siswaList.filter(s=>s.kelasId===kelasId);

  const emptyGuru  = {nama:'',nip:'',email:'',mapelIds:[],kelasIds:[],status:'Aktif',bergabung:'',avatar:'',avatarBg:`linear-gradient(135deg,#0D5C63,#1A8A94)`};
  const emptySiswa = {nama:'',nis:'',email:'',kelasId:'',status:'Aktif',bergabung:'',avatar:'',avatarBg:'#0D5C63'};
  const emptyKelas = {nama:'',tingkat:'X',jurusan:'IPA',waliKelasId:'',mapelGuruMap:{},tahunAjaran:'2025/2026',siswaIds:[]};

  const nonaktifkanGuru = (id) => {
    setGuruList(p=>p.map(g=>g.id===id?{...g,status:g.status==='Aktif'?'Nonaktif':'Aktif'}:g));
    showToast(`Status ${guruList.find(x=>x.id===id)?.nama} diperbarui`);
    setSelectedGuru(null);
  };
  const nonaktifkanSiswa = (id) => {
    setSiswaList(p=>p.map(s=>s.id===id?{...s,status:s.status==='Aktif'?'Nonaktif':'Aktif'}:s));
    showToast(`Status ${siswaList.find(x=>x.id===id)?.nama} diperbarui`);
    setSelectedSiswa(null);
  };
  const pindahKelas = (siswaId, kelasIdBaru) => {
    const s = siswaList.find(x=>x.id===siswaId);
    if (!s) return;
    setKelasList(p=>p.map(k=>{
      if(k.id===s.kelasId) return {...k,siswaIds:k.siswaIds.filter(id=>id!==siswaId)};
      if(k.id===kelasIdBaru) return {...k,siswaIds:[...k.siswaIds,siswaId]};
      return k;
    }));
    setSiswaList(p=>p.map(si=>si.id===siswaId?{...si,kelasId:kelasIdBaru}:si));
    showToast(`✅ ${s.nama} dipindah ke ${getKelas(kelasIdBaru)?.nama}`);
  };
  const updateMapelGuru = (kelasId, mapelId, guruId) => {
    setKelasList(p=>p.map(k=>k.id===kelasId?{...k,mapelGuruMap:{...k.mapelGuruMap,[mapelId]:guruId}}:k));
    const k=getKelas(kelasId); const g=getGuru(guruId); const m=getMapel(mapelId);
    showToast(`✅ ${m?.label} di ${k?.nama} → ${g?.nama}`);
  };

  const adminCtx = {
    guruList, siswaList, kelasList, mapelList: ADMIN_MAPEL_LIST_LOCAL,
    setGuruList, setSiswaList, setKelasList, setMapelList,
    saveGuru, saveSiswa, deleteSiswa, saveKelas, saveMapel, deleteMapel,
    modal, setModal, modalData, setModalData,
    selectedGuru, setSelectedGuru, selectedSiswa, setSelectedSiswa,
    selectedKelas, setSelectedKelas, filterKelasId, setFilterKelasId,
    emptyGuru, emptySiswa, emptyKelas,
    nonaktifkanGuru, nonaktifkanSiswa, pindahKelas, updateMapelGuru,
    getKelas, getGuru, getMapel, getSiswaOfKelas,
    setActivePage,
  };

  const navItems = [
    {id:'kelas',     icon:'📚',  label:'Manajemen Kelas'},
    {id:'guru',      icon:'👨‍🏫', label:'Manajemen Guru'},
    {id:'kurikulum', icon:'📋',  label:'Kurikulum & Mapel'},
  ];

  // ── Import sections lazily (avoid circular deps) ──────────────────
  // Due to AdminView's size, sections remain as embedded pages for Fase 2.
  // Full extraction is scheduled for Fase 3 sprint.
  // The sections/ folder contains the extracted stubs ready for connection.

  return (
    <div className="admin-view" style={{background:'#F7FAFC'}}>
      {/* Sidebar */}
      <div className="admin-sidebar" style={{background:'#1A2332'}}>
        <div style={{padding:'16px',borderBottom:'1px solid rgba(255,255,255,.07)'}}>
          <div style={{display:'flex',alignItems:'center',gap:9}}>
            <span style={{fontSize:22}}>🏫</span>
            <div>
              <div style={{color:'#fff',fontWeight:700,fontSize:13}}>Sekolah Rakyat</div>
              <div style={{color:'rgba(255,255,255,.35)',fontSize:9}}>Portal Admin</div>
            </div>
          </div>
        </div>
        <div style={{padding:'12px 14px',borderBottom:'1px solid rgba(255,255,255,.07)'}}>
          <div style={{display:'flex',alignItems:'center',gap:9}}>
            <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#F4A435,#DD6B20)',display:'flex',alignItems:'center',justifyContent:'center',color:'#1A2332',fontWeight:800,fontSize:14,flexShrink:0}}>A</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{color:'#fff',fontWeight:700,fontSize:12}}>Admin</div>
              <div style={{color:'rgba(255,255,255,.4)',fontSize:10,marginTop:1}}>SR Kota Malang</div>
              <div style={{color:'#F4A435',fontSize:10,fontWeight:700}}>🔑 Administrator</div>
            </div>
          </div>
        </div>
        <div style={{flex:1,padding:'8px 6px',overflowY:'auto'}}>
          {navItems.map(item=>(
            <button key={item.id}
              onClick={()=>{setActivePage(item.id);if(item.id!=='kelas')setSelectedKelas(null);}}
              style={{width:'100%',display:'flex',alignItems:'center',gap:9,padding:'9px 10px',background:activePage===item.id?'rgba(13,92,99,.5)':'transparent',border:'none',borderRadius:8,cursor:'pointer',fontFamily:'inherit',marginBottom:2,transition:'all .15s'}}
              onMouseEnter={e=>{if(activePage!==item.id)e.currentTarget.style.background='rgba(255,255,255,.06)';}}
              onMouseLeave={e=>{if(activePage!==item.id)e.currentTarget.style.background='transparent';}}>
              <span style={{fontSize:15}}>{item.icon}</span>
              <span style={{fontSize:12,fontWeight:activePage===item.id?700:400,color:activePage===item.id?'#fff':'rgba(255,255,255,.55)'}}>{item.label}</span>
              {activePage===item.id&&<span style={{marginLeft:'auto',width:4,height:4,borderRadius:'50%',background:'#F4A435'}}/>}
            </button>
          ))}
        </div>
        <div style={{padding:'8px',borderTop:'1px solid rgba(255,255,255,.07)'}}>
          <button onClick={()=>onNavigate('login')}
            style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:7,background:'rgba(229,62,62,.12)',border:'1px solid rgba(229,62,62,.2)',borderRadius:8,padding:'8px',color:'rgba(229,62,62,.75)',fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>
            🚪 Keluar / Logout
          </button>
        </div>
      </div>

      {/* Main — original AdminView pages embedded (full section extraction: Fase 3) */}
      <div className="admin-main">
        <AdminContentPages adminCtx={adminCtx} showToast={showToast} inpStyle={inpStyle} StatusBadge={StatusBadge} MultiCheckbox={MultiCheckbox} activePage={activePage} />
      </div>

      {toast&&(
        <div className="bounce-in" style={{position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',background:toast.color,color:'#fff',borderRadius:99,padding:'10px 24px',fontSize:13,fontWeight:700,zIndex:9999,boxShadow:'0 4px 20px rgba(0,0,0,.25)',whiteSpace:'nowrap'}}>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

import AdminContentPages from './AdminContent';

export default AdminView;
