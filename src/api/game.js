/**
 * SR MVP — Game API (Tim 4)
 * Tim 6 Fase 2 | src/api/game.js
 *
 * Antarmuka ke LLM Game Asset Generator Tim 4.
 * Generate skenario + parameter game, ambil daftar game, simpan skor.
 */

import { apiClient } from "./client";

/**
 * Generate game baru dari topik pelajaran — POST /game/generate
 * Guru memicu ini dari portal guru.
 *
 * @param {{
 *   mapel_id: string,
 *   topik: string,
 *   kelas_id: string,
 *   kelas_target?: string,     // "X"|"XI"|"XII"
 *   prompt_tambahan?: string
 * }} payload
 * @returns {Promise<{
 *   game_id: string,
 *   nama: string,
 *   deskripsi: string,
 *   config: object,            // JSON schema game Tim 4
 *   status: "generating"|"ready"
 * }>}
 */
export async function generateGame(payload) {
  const { data } = await apiClient.post("/game/generate", payload);
  return data;
}

/**
 * Ambil daftar game tersedia untuk kelas/mapel — GET /game/list
 * @param {{ kelas_id?:string, mapel_id?:string }} params
 */
export async function getGameList(params) {
  const { data } = await apiClient.get("/game/list", { params });
  return data;
}

/**
 * Ambil config/skenario game tertentu — GET /game/:game_id
 * @param {string} gameId
 */
export async function getGame(gameId) {
  const { data } = await apiClient.get(`/game/${gameId}`);
  return data;
}

/**
 * Simpan skor siswa setelah main — POST /game/score
 * @param {{ siswa_id:string, game_id:string, skor:number, durasi_detik:number }} payload
 */
export async function saveScore(payload) {
  const { data } = await apiClient.post("/game/score", payload);
  return data;
}
