/**
 * SR MVP — Mentor Chat API (Tim 5)
 * Tim 6 Fase 2 | src/api/mentor.js
 *
 * Antarmuka ke LLM Private Mentor Chatbot (Tim 5).
 * Mendukung dua mode:
 *   1. Non-streaming  → POST /mentor/chat
 *   2. Streaming SSE  → POST /mentor/chat/stream  (dipakai hooks/useStreamingChat)
 */

import { apiClient } from "./client";

/**
 * Kirim pesan ke mentor, tunggu full response (non-streaming).
 * Dipakai sebagai fallback jika SSE tidak tersedia.
 *
 * @param {{
 *   siswa_id: string,
 *   mapel_id: string,
 *   sub_materi: string,
 *   message: string,
 *   context?: {
 *     emosi?: string,
 *     progress?: number,
 *     rekomendasi_guru?: string
 *   }
 * }} payload
 * @returns {Promise<{ reply: string, session_id: string }>}
 */
export async function sendMessage(payload) {
  const { data } = await apiClient.post("/mentor/chat", payload);
  return data;
}

/**
 * Ambil history percakapan satu sesi — GET /mentor/chat/history
 * @param {{ siswa_id: string, mapel_id: string, sub_materi: string }} params
 * @returns {Promise<Array<{ role:"user"|"ai", text:string, timestamp:string }>>}
 */
export async function getChatHistory(params) {
  const { data } = await apiClient.get("/mentor/chat/history", { params });
  return data;
}

/**
 * Reset sesi chat — DELETE /mentor/chat/session
 * @param {{ siswa_id: string, mapel_id: string, sub_materi: string }} params
 */
export async function resetSession(params) {
  const { data } = await apiClient.delete("/mentor/chat/session", { params });
  return data;
}
