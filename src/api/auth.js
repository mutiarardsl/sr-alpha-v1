/**
 * SR MVP — Auth API
 * Tim 6 Fase 2 | src/api/auth.js
 *
 * Semua endpoint autentikasi.
 * Backend: Tim 6 BE (POST /auth/*)
 */

import { apiClient } from "./client";

// ─── Types (JSDoc) ────────────────────────────────────────────────────
/**
 * @typedef {Object} LoginPayload
 * @property {string} email
 * @property {string} password
 * @property {"siswa"|"guru"|"admin"} role
 *
 * @typedef {Object} AuthResponse
 * @property {string} access_token
 * @property {string} refresh_token
 * @property {{ id:string, nama:string, role:string, sekolah_id:string }} user
 */

// ─── Endpoints ────────────────────────────────────────────────────────
/**
 * Login — POST /auth/login
 * @param {LoginPayload} payload
 * @returns {Promise<AuthResponse>}
 */
export async function login(payload) {
  const { data } = await apiClient.post("/auth/login", payload);
  // Simpan token setelah login sukses
  localStorage.setItem("sr_access_token", data.access_token);
  localStorage.setItem("sr_user", JSON.stringify(data.user));
  return data;
}

/**
 * Register siswa baru — POST /auth/register
 * @param {{ nama:string, nis:string, sekolah_id:string, password:string }} payload
 */
export async function register(payload) {
  const { data } = await apiClient.post("/auth/register", payload);
  return data;
}

/**
 * Logout — POST /auth/logout
 * Hapus token di server (blacklist) + bersihkan localStorage
 */
export async function logout() {
  try {
    await apiClient.post("/auth/logout");
  } finally {
    localStorage.removeItem("sr_access_token");
    localStorage.removeItem("sr_user");
  }
}

/**
 * Refresh token — POST /auth/refresh
 * Dipanggil otomatis oleh interceptor saat token near-expiry (opsional Fase 3)
 */
export async function refreshToken() {
  const { data } = await apiClient.post("/auth/refresh");
  localStorage.setItem("sr_access_token", data.access_token);
  return data;
}

/**
 * Ambil profil user saat ini — GET /auth/me
 */
export async function getMe() {
  const { data } = await apiClient.get("/auth/me");
  return data;
}
