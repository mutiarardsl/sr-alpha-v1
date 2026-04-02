/**
 * SR MVP — Learning Content API (Tim 3 RAG + Agentic)
 * Tim 6 Fase 2 | src/api/content.js
 *
 * Antarmuka ke Agentic RAG Tim 3.
 * Menghasilkan: mindmap, flashcard, catatan, rekomendasi materi.
 */

import { apiClient } from "./client";

/**
 * Generate konten belajar terpersonalisasi.
 * Agent Tim 3 akan query VectorDB + Tim 2 LLM → output terstruktur.
 *
 * @param {{
 *   siswa_id: string,
 *   mapel_id: string,
 *   sub_materi: string,
 *   tipe: "mindmap"|"flashcard"|"catatan",
 *   profil_minat?: string,
 *   emosi?: string
 * }} payload
 * @returns {Promise<{ tipe: string, content: any, generated_at: string }>}
 */
export async function generateContent(payload) {
  const { data } = await apiClient.post("/content/generate", payload);
  return data;
}

/**
 * Ambil rekomendasi topik berikutnya untuk siswa — GET /content/recommend
 * @param {{ siswa_id:string, mapel_id?:string }} params
 * @returns {Promise<Array<{ mapel_id:string, sub_materi:string, alasan:string }>>}
 */
export async function getRecommendations(params) {
  const { data } = await apiClient.get("/content/recommend", { params });
  return data;
}

/**
 * Upload dokumen kurikulum ke RAG VectorDB — POST /content/curriculum
 * Multipart/form-data. File diteruskan ke Tim 3 untuk di-index.
 *
 * @param {{ file: File, mapel_id: string, deskripsi?: string }} payload
 * @param {function(number):void} onProgress - callback progress 0-100
 */
export async function uploadCurriculum(payload, onProgress) {
  const form = new FormData();
  form.append("file",      payload.file);
  form.append("mapel_id",  payload.mapel_id);
  if (payload.deskripsi) form.append("deskripsi", payload.deskripsi);

  const { data } = await apiClient.post("/content/curriculum", form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
    },
  });
  return data;
}

/**
 * Ambil hasil quiz + progress belajar siswa — GET /content/progress
 * @param {{ siswa_id:string }} params
 */
export async function getLearningProgress(params) {
  const { data } = await apiClient.get("/content/progress", { params });
  return data;
}

/**
 * Simpan hasil quiz — POST /content/quiz/submit
 * @param {{ siswa_id:string, mapel_id:string, sub_materi:string, answers: object, score:number }} payload
 */
export async function submitQuiz(payload) {
  const { data } = await apiClient.post("/content/quiz/submit", payload);
  return data;
}
