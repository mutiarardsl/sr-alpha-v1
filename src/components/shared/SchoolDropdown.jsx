/**
 * SR MVP — School Dropdown
 * Tim 6 Fase 2 | src/components/shared/SchoolDropdown.jsx
 */

import { useState, useEffect, useRef } from 'react';
import { C } from '../../styles/tokens';
import { SEKOLAH_LIST } from '../../data/masterData';

const SchoolDropdown = ({ value, onChange, inputStyle }) => {
  const [query, setQuery]     = useState(value || "");
  const [open, setOpen]       = useState(false);
  const [focused, setFocused] = useState(false);
  const wrapRef = useRef(null);
  const filtered = query.length >= 1
    ? SEKOLAH_LIST.filter(s => s.nama.toLowerCase().includes(query.toLowerCase()) || s.kota.toLowerCase().includes(query.toLowerCase())).slice(0,8)
    : SEKOLAH_LIST.slice(0,8);
  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const select = (sekolah) => { setQuery(sekolah.nama); onChange(sekolah.nama); setOpen(false); };
  return (
    <div ref={wrapRef} style={{ position:"relative" }}>
      <div style={{ position:"relative" }}>
        <input style={{ ...inputStyle, borderColor: focused ? C.teal : undefined, paddingRight:36 }}
          placeholder="Ketik nama kota atau sekolah..."
          value={query}
          onFocus={() => { setFocused(true); setOpen(true); }}
          onBlur={() => setFocused(false)}
          onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}/>
        <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", fontSize:12, color:C.slate, pointerEvents:"none" }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div className="fade-in" style={{ position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:200,
          background:C.white, borderRadius:10, boxShadow:"0 8px 24px rgba(13,92,99,.15)",
          border:`1.5px solid ${C.tealXL}`, maxHeight:240, overflowY:"auto" }}>
          {filtered.length === 0 ? (
            <div style={{ padding:"12px 14px", fontSize:13, color:C.slate, textAlign:"center" }}>Sekolah tidak ditemukan</div>
          ) : filtered.map(s => (
            <div key={s.id} onMouseDown={() => select(s)}
              style={{ padding:"10px 14px", cursor:"pointer", borderBottom:`1px solid ${C.tealXL}22`, transition:"background .15s" }}
              onMouseEnter={e => e.currentTarget.style.background = C.tealXL}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={{ fontSize:13, fontWeight:600, color:C.dark }}>{s.nama}</div>
              <div style={{ fontSize:11, color:C.slate, marginTop:1 }}>{s.kota} · {s.provinsi}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchoolDropdown;
