/**
 * SR MVP — Emotion Detection API (Tim 1)
 * Tim 6 Fase 2 | src/api/emotion.js
 *
 * Antarmuka ke Image Classifier Tim 1.
 * Mengirim frame webcam → menerima klasifikasi emosi.
 */

import { apiClient } from "./client";

/**
 * Deteksi emosi dari satu frame gambar — POST /emotion/detect
 * Frame dikirim sebagai base64 JPEG.
 *
 * @param {{
 *   siswa_id: string,
 *   frame_base64: string,     // JPEG base64 tanpa prefix "data:image/..."
 *   session_id?: string
 * }} payload
 * @returns {Promise<{
 *   emosi: "senang"|"netral"|"bingung"|"sedih"|"marah",
 *   confidence: number,       // 0.0 - 1.0
 *   timestamp: string
 * }>}
 */
export async function detectEmotion(payload) {
  const { data } = await apiClient.post("/emotion/detect", payload);
  return data;
}

/**
 * Ambil riwayat emosi satu sesi belajar — GET /emotion/history
 * @param {{ siswa_id:string, session_id:string }} params
 */
export async function getEmotionHistory(params) {
  const { data } = await apiClient.get("/emotion/history", { params });
  return data;
}
