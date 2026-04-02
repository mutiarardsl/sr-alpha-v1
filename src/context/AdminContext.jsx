/**
 * SR MVP — Admin Context
 * Tim 6 Fase 2 | src/context/AdminContext.jsx
 *
 * State management untuk portal admin.
 * Semua fungsi siap di-swap dari dummy ke real API call di Fase 3.
 * Tandai dengan: "TODO Fase 3: ganti dengan apiClient.xxx"
 */
import { createContext, useContext, useState, useCallback } from "react";

const AdminContext = createContext(null);

export function AdminProvider({ initialData, children }) {
  const [guruList,  setGuruList]  = useState(initialData?.guru  ?? []);
  const [siswaList, setSiswaList] = useState(initialData?.siswa ?? []);
  const [kelasList, setKelasList] = useState(initialData?.kelas ?? []);
  const [mapelList, setMapelList] = useState(initialData?.mapel ?? []);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState(null);

  const withLoading = useCallback(async (fn) => {
    setIsLoading(true); setError(null);
    try { return await fn(); }
    catch (err) { setError(err.message ?? "Terjadi kesalahan"); throw err; }
    finally { setIsLoading(false); }
  }, []);

  const saveGuru = useCallback((data) => withLoading(async () => {
    // TODO Fase 3: await guruApi.create/update(data)
    if (data.id) {
      setGuruList(p => p.map(g => g.id === data.id ? { ...g, ...data } : g));
    } else {
      const newG = { ...data, id: `g${Date.now()}`, avatar: data.nama.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() };
      setGuruList(p => [...p, newG]);
    }
  }), [withLoading]);

  const saveSiswa = useCallback((data) => withLoading(async () => {
    // TODO Fase 3: await siswaApi.create/update(data)
    if (data.id) {
      setSiswaList(p => p.map(s => s.id === data.id ? { ...s, ...data } : s));
    } else {
      const newS = { ...data, id: `s${Date.now()}`, avatar: data.nama.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() };
      setSiswaList(p => [...p, newS]);
      if (data.kelasId) setKelasList(p => p.map(k => k.id === data.kelasId ? { ...k, siswaIds: [...k.siswaIds, newS.id] } : k));
    }
  }), [withLoading]);

  const deleteSiswa = useCallback((id) => withLoading(async () => {
    // TODO Fase 3: await siswaApi.delete(id)
    const s = siswaList.find(x => x.id === id);
    setSiswaList(p => p.filter(x => x.id !== id));
    if (s?.kelasId) setKelasList(p => p.map(k => k.id === s.kelasId ? { ...k, siswaIds: k.siswaIds.filter(sid => sid !== id) } : k));
  }), [withLoading, siswaList]);

  const saveKelas = useCallback((data) => withLoading(async () => {
    if (data.id) setKelasList(p => p.map(k => k.id === data.id ? { ...k, ...data } : k));
    else setKelasList(p => [...p, { ...data, id: `k${Date.now()}`, siswaIds: [] }]);
  }), [withLoading]);

  const saveMapel = useCallback((data) => withLoading(async () => {
    if (data.id) setMapelList(p => p.map(m => m.id === data.id ? { ...m, ...data } : m));
    else {
      const id = data.label.toLowerCase().replace(/\s+/g,"_").replace(/[^a-z0-9_]/g,"").slice(0,10) + `_${Date.now()}`.slice(-4);
      setMapelList(p => [...p, { ...data, id }]);
    }
  }), [withLoading]);

  const deleteMapel = useCallback((id) => withLoading(async () => {
    setMapelList(p => p.filter(x => x.id !== id));
    setGuruList(p => p.map(g => ({ ...g, mapelIds: g.mapelIds.filter(mid => mid !== id) })));
  }), [withLoading]);

  return (
    <AdminContext.Provider value={{
      guruList, siswaList, kelasList, mapelList,
      setKelasList, setGuruList, setSiswaList, setMapelList,
      isLoading, error,
      saveGuru, saveSiswa, deleteSiswa, saveKelas, saveMapel, deleteMapel,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin harus dipakai di dalam <AdminProvider>");
  return ctx;
};
