/**
 * SR MVP — Admin API
 * Tim 6 Fase 2 | src/api/admin.js
 *
 * CRUD endpoint untuk portal admin.
 * Backend: Tim 6 BE. Semua membutuhkan role "admin".
 */

import { apiClient } from "./client";

// ─── Kelas ───────────────────────────────────────────────────────────
export const kelasApi = {
  list:    ()           => apiClient.get("/admin/kelas").then(r => r.data),
  get:     (id)         => apiClient.get(`/admin/kelas/${id}`).then(r => r.data),
  create:  (payload)    => apiClient.post("/admin/kelas", payload).then(r => r.data),
  update:  (id, payload)=> apiClient.put(`/admin/kelas/${id}`, payload).then(r => r.data),
  delete:  (id)         => apiClient.delete(`/admin/kelas/${id}`).then(r => r.data),
  siswa:   (id)         => apiClient.get(`/admin/kelas/${id}/siswa`).then(r => r.data),
};

// ─── Guru ────────────────────────────────────────────────────────────
export const guruApi = {
  list:    (params)     => apiClient.get("/admin/guru", { params }).then(r => r.data),
  get:     (id)         => apiClient.get(`/admin/guru/${id}`).then(r => r.data),
  create:  (payload)    => apiClient.post("/admin/guru", payload).then(r => r.data),
  update:  (id, payload)=> apiClient.put(`/admin/guru/${id}`, payload).then(r => r.data),
};

// ─── Siswa ───────────────────────────────────────────────────────────
export const siswaApi = {
  list:    (params)     => apiClient.get("/admin/siswa", { params }).then(r => r.data),
  get:     (id)         => apiClient.get(`/admin/siswa/${id}`).then(r => r.data),
  create:  (payload)    => apiClient.post("/admin/siswa", payload).then(r => r.data),
  update:  (id, payload)=> apiClient.put(`/admin/siswa/${id}`, payload).then(r => r.data),
  delete:  (id)         => apiClient.delete(`/admin/siswa/${id}`).then(r => r.data),
};

// ─── Mapel / Kurikulum ───────────────────────────────────────────────
export const mapelApi = {
  list:    ()           => apiClient.get("/admin/mapel").then(r => r.data),
  create:  (payload)    => apiClient.post("/admin/mapel", payload).then(r => r.data),
  update:  (id, payload)=> apiClient.put(`/admin/mapel/${id}`, payload).then(r => r.data),
  delete:  (id)         => apiClient.delete(`/admin/mapel/${id}`).then(r => r.data),
};

// ─── Upload nilai guru ───────────────────────────────────────────────
/**
 * POST /admin/nilai/upload — multipart CSV/XLSX
 * @param {{ file:File, kelas_id:string, mapel_id:string }} payload
 * @param {function(number):void} onProgress
 */
export async function uploadNilai(payload, onProgress) {
  const form = new FormData();
  form.append("file",     payload.file);
  form.append("kelas_id", payload.kelas_id);
  form.append("mapel_id", payload.mapel_id);
  const { data } = await apiClient.post("/admin/nilai/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
    },
  });
  return data;
}
