/**
 * SR MVP — MSW Mock Handlers
 * Tim 6 Fase 2 | src/mocks/handlers.js
 *
 * Mock Service Worker — intercept semua API di browser.
 * Shape sudah final → swap ke real API di Fase 3 tanpa ubah UI.
 *
 * PENTING: Handler menggunakan `store` in-memory yang di-seed dari masterData.
 * Mutasi (POST/PUT/DELETE) menulis ke store sehingga GET berikutnya
 * selalu mengembalikan state terkini — sinkron dengan AdminContext.
 */

import { http, HttpResponse, delay } from 'msw';
import {
  ADMIN_GURU_INIT,
  ADMIN_SISWA_INIT,
  ADMIN_KELAS_INIT,
  ADMIN_MAPEL_LIST,
} from '../data/masterData';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const url = (path) => `${BASE}${path}`;

// ─── In-memory store ──────────────────────────────────────────────
// Sumber kebenaran tunggal untuk semua handler Admin.
// structuredClone memastikan mutasi tidak bocor ke masterData.
const store = {
  guru: structuredClone(ADMIN_GURU_INIT),
  siswa: structuredClone(ADMIN_SISWA_INIT),
  kelas: structuredClone(ADMIN_KELAS_INIT),
  mapel: structuredClone(ADMIN_MAPEL_LIST),
};

// ─── Helper ───────────────────────────────────────────────────────
const d = (ms = 300) => delay(ms);

export const handlers = [

  // ── Auth ─────────────────────────────────────────────────────────
  http.post(url('/auth/login'), async ({ request }) => {
    const { email, role } = await request.json();
    await d(400);
    return HttpResponse.json({
      access_token: 'mock_jwt_' + Date.now(),
      refresh_token: 'mock_refresh',
      user: {
        id: 'usr_001',
        nama: email.split('@')[0],
        email,
        role: role ?? 'siswa',
        sekolah_id: 'sr_malang_001',
      },
    });
  }),

  http.post(url('/auth/logout'), async () => {
    await d(200);
    return HttpResponse.json({ message: 'Berhasil logout' });
  }),

  http.post(url('/auth/register'), async () => {
    await d(600);
    return HttpResponse.json({
      message: 'Registrasi berhasil. Akun menunggu verifikasi admin.',
      user_id: 'usr_' + Date.now(),
    });
  }),

  http.post(url('/auth/refresh'), async () => {
    await d(200);
    return HttpResponse.json({
      access_token: 'mock_refreshed_jwt_' + Date.now(),
      refresh_token: 'mock_refresh_new',
    });
  }),

  http.get(url('/auth/me'), async () => {
    await d(200);
    return HttpResponse.json({
      id: 'usr_001', nama: 'Budi Santoso', email: 'budi@siswa.sr',
      role: 'siswa', sekolah_id: 'sr_malang_001',
      kelas_id: '10ipa1', nis: '2025009',
    });
  }),

  // ── Mentor Chat Tim 5 ─────────────────────────────────────────────
  http.post(url('/mentor/chat'), async ({ request }) => {
    const { message, sub_materi } = await request.json();
    await d(1200 + Math.random() * 600);
    const reply = [
      'Pertanyaan menarik tentang **' + (sub_materi || 'materi ini') + '**!',
      'Kamu bertanya: "' + (message || '') + '"',
      '',
      'Mari kita bahas step by step... 😊',
      '',
      '① Pahami konsep dasarnya',
      '② Coba contoh sederhana',
      '③ Latihan soal',
      '',
      'Mau mulai dari mana?',
    ].join('\n');
    return HttpResponse.json({ reply, session_id: 'sess_' + Date.now() });
  }),

  http.get(url('/mentor/chat/history'), async ({ request }) => {
    const params = new URL(request.url).searchParams;
    await d(400);
    return HttpResponse.json([
      { role: 'ai', text: `Halo! Kita belajar **${params.get('sub_materi') || 'materi ini'}** ya. Siap?`, timestamp: new Date(Date.now() - 600000).toISOString(), team: 'Tim 5' },
      { role: 'user', text: 'Siap pak!', timestamp: new Date(Date.now() - 540000).toISOString() },
      { role: 'ai', text: 'Bagus! Mari mulai dari konsep dasar dulu...', timestamp: new Date(Date.now() - 480000).toISOString(), team: 'Tim 5' },
    ]);
  }),

  http.delete(url('/mentor/chat/session'), async () => {
    await d(200);
    return HttpResponse.json({ deleted: true, message: 'Sesi chat berhasil di-reset.' });
  }),

  // ── Content RAG Tim 3 ─────────────────────────────────────────────
  http.post(url('/content/generate'), async ({ request }) => {
    const { tipe, sub_materi } = await request.json();
    await d(2000);
    const topik = (sub_materi || 'Materi').toUpperCase();
    const nama = sub_materi || 'Materi';
    const contentMap = {
      flashcard: {
        cards: [
          { depan: 'Apa itu ' + nama + '?', belakang: 'Konsep fundamental yang penting dipahami.' },
          { depan: 'Rumus utama ' + nama, belakang: 'Lihat buku referensi halaman 42-45.' },
          { depan: 'Contoh penerapan ' + nama, belakang: 'Dapat ditemukan dalam kehidupan sehari-hari.' },
        ]
      },
      mindmap: { content: ['🔑 ' + topik, '├─ Konsep Utama', '│  ├─ Definisi', '│  └─ Contoh', '└─ Aplikasi', '   ├─ Di sekolah', '   └─ Di kehidupan nyata'].join('\n') },
      catatan: { content: ['# ' + nama, '', '## Pengertian', 'Deskripsi lengkap tentang konsep utama materi ini.', '', '## Poin Penting', '- Poin pertama yang perlu diingat', '- Poin kedua yang penting', '', '## Contoh', 'Contoh konkret penerapan dalam kehidupan nyata.'].join('\n') },
    };
    return HttpResponse.json({ tipe, content: contentMap[tipe] ?? {}, generated_at: new Date().toISOString() });
  }),

  http.post(url('/content/curriculum'), async () => {
    await d(1800);
    return HttpResponse.json({ doc_id: 'doc_' + Date.now(), chunk_count: 42, status: 'indexed' });
  }),

  http.post(url('/content/quiz/submit'), async ({ request }) => {
    const { score } = await request.json();
    await d(300);
    return HttpResponse.json({ submitted: true, score, recorded_at: new Date().toISOString() });
  }),

  http.get(url('/content/recommend'), async () => {
    await d(500);
    return HttpResponse.json([
      { mapel_id: 'mat', sub_materi: 'Fungsi Kuadrat', alasan: 'Lanjutan dari Persamaan Linear yang sudah selesai' },
      { mapel_id: 'ipa', sub_materi: 'Sel & Jaringan', alasan: 'Relevan dengan topik Ekosistem yang sedang dipelajari' },
      { mapel_id: 'bin', sub_materi: 'Teks Argumentasi', alasan: 'Direkomendasikan berdasarkan profil minat siswa' },
    ]);
  }),

  http.get(url('/content/progress'), async () => {
    await d(300);
    return HttpResponse.json({
      siswa_id: 'usr_001', total_materi: 12, selesai: 4, dalam_proses: 3, belum_dimulai: 5,
      rata_rata_quiz: 78, streak_hari: 7, total_waktu_menit: 225,
      by_mapel: [
        { mapel_id: 'mat', selesai: 2, progress_avg: 72 },
        { mapel_id: 'ipa', selesai: 1, progress_avg: 85 },
        { mapel_id: 'bin', selesai: 1, progress_avg: 64 },
        { mapel_id: 'ips', selesai: 0, progress_avg: 30 },
      ],
    });
  }),

  // ── Emotion Tim 1 ─────────────────────────────────────────────────
  http.post(url('/emotion/detect'), async () => {
    await d(300);
    const emotions = ['boredom', 'confusion', 'engagement', 'frustration'];
    return HttpResponse.json({
      emosi: emotions[Math.floor(Math.random() * emotions.length)],
      confidence: 0.7 + Math.random() * 0.28,
      timestamp: new Date().toISOString(),
    });
  }),

  http.get(url('/emotion/history'), async () => {
    const now = Date.now();
    await d(300);
    return HttpResponse.json([
      { emosi: 'boredom', confidence: 0.91, timestamp: new Date(now - 300000).toISOString() },
      { emosi: 'confusion', confidence: 0.78, timestamp: new Date(now - 240000).toISOString() },
      { emosi: 'engagement', confidence: 0.82, timestamp: new Date(now - 180000).toISOString() },
      { emosi: 'frustration', confidence: 0.75, timestamp: new Date(now - 120000).toISOString() },
      { emosi: 'boredom', confidence: 0.88, timestamp: new Date(now - 60000).toISOString() },
    ]);
  }),

  // ── Game Tim 4 ────────────────────────────────────────────────────
  http.post(url('/game/generate'), async ({ request }) => {
    const { topik, mapel_id } = await request.json();
    await d(2500);
    return HttpResponse.json({
      game_id: 'game_' + Date.now(),
      nama: 'Quest: ' + (topik || 'Pelajaran'),
      deskripsi: 'Game edukasi interaktif tentang ' + (topik || 'pelajaran ini'),
      mapel_id: mapel_id || '',
      status: 'ready',
      config: { levels: 3, questions_per_level: 5, timer_seconds: 30 },
    });
  }),

  http.get(url('/game/list'), async () => {
    await d(400);
    return HttpResponse.json([
      { game_id: 'g1', nama: 'Algebraic Quest', mapel_id: 'mat', status: 'ready', pemain: 24 },
      { game_id: 'g2', nama: 'EcoWorld Explorer', mapel_id: 'ipa', status: 'ready', pemain: 18 },
    ]);
  }),

  // ── Admin — Mapel (store-backed) ──────────────────────────────────
  http.get(url('/admin/mapel'), async () => {
    await d(300);
    return HttpResponse.json(store.mapel);
  }),

  http.post(url('/admin/mapel'), async ({ request }) => {
    const body = await request.json();
    await d(400);
    const newM = { ...body, id: 'mapel_' + Date.now() };
    store.mapel.push(newM);
    return HttpResponse.json(newM);
  }),

  http.put(url('/admin/mapel/:id'), async ({ request, params }) => {
    const body = await request.json();
    await d(400);
    store.mapel = store.mapel.map(m => m.id === params.id ? { ...m, ...body } : m);
    return HttpResponse.json(store.mapel.find(m => m.id === params.id));
  }),

  http.delete(url('/admin/mapel/:id'), async ({ params }) => {
    await d(300);
    store.mapel = store.mapel.filter(m => m.id !== params.id);
    return HttpResponse.json({ deleted: true });
  }),

  // ── Admin — Guru (store-backed) ───────────────────────────────────
  http.get(url('/admin/guru'), async () => {
    await d(300);
    return HttpResponse.json(store.guru);
  }),

  http.get(url('/admin/guru/:id'), async ({ params }) => {
    await d(200);
    const guru = store.guru.find(g => g.id === params.id);
    return HttpResponse.json(guru ?? { id: params.id, nama: 'Unknown', status: 'Aktif' });
  }),

  http.post(url('/admin/guru'), async ({ request }) => {
    const body = await request.json();
    await d(400);
    const newG = { ...body, id: 'g_' + Date.now() };
    store.guru.push(newG);
    return HttpResponse.json(newG);
  }),

  http.put(url('/admin/guru/:id'), async ({ request, params }) => {
    const body = await request.json();
    await d(400);
    store.guru = store.guru.map(g => g.id === params.id ? { ...g, ...body } : g);
    return HttpResponse.json(store.guru.find(g => g.id === params.id));
  }),

  // ── Admin — Siswa (store-backed) ──────────────────────────────────
  http.get(url('/admin/siswa'), async () => {
    await d(300);
    return HttpResponse.json(store.siswa);
  }),

  http.get(url('/admin/siswa/:id'), async ({ params }) => {
    await d(200);
    const siswa = store.siswa.find(s => s.id === params.id);
    return HttpResponse.json(siswa ?? { id: params.id, nama: 'Unknown', status: 'Aktif' });
  }),

  http.post(url('/admin/siswa'), async ({ request }) => {
    const body = await request.json();
    await d(400);
    const newS = { ...body, id: 's_' + Date.now() };
    store.siswa.push(newS);
    // Daftarkan ke kelas jika kelasId tersedia
    if (body.kelasId) {
      store.kelas = store.kelas.map(k =>
        k.id === body.kelasId ? { ...k, siswaIds: [...k.siswaIds, newS.id] } : k
      );
    }
    return HttpResponse.json(newS);
  }),

  http.delete(url('/admin/siswa/:id'), async ({ params }) => {
    await d(300);
    const s = store.siswa.find(x => x.id === params.id);
    store.siswa = store.siswa.filter(x => x.id !== params.id);
    // Lepas dari kelas
    if (s?.kelasId) {
      store.kelas = store.kelas.map(k =>
        k.id === s.kelasId ? { ...k, siswaIds: k.siswaIds.filter(sid => sid !== params.id) } : k
      );
    }
    return HttpResponse.json({ deleted: true });
  }),

  // ── Admin — Kelas (store-backed) ──────────────────────────────────
  http.get(url('/admin/kelas'), async () => {
    await d(300);
    return HttpResponse.json(store.kelas);
  }),

  http.get(url('/admin/kelas/:id/siswa'), async ({ params }) => {
    await d(300);
    const kelas = store.kelas.find(k => k.id === params.id);
    const siswa = (kelas?.siswaIds ?? []).map(sid => store.siswa.find(s => s.id === sid)).filter(Boolean);
    return HttpResponse.json(siswa);
  }),

  http.post(url('/admin/kelas'), async ({ request }) => {
    const body = await request.json();
    await d(400);
    const newK = { ...body, id: 'k_' + Date.now(), siswaIds: [] };
    store.kelas.push(newK);
    return HttpResponse.json(newK);
  }),

  http.put(url('/admin/kelas/:id'), async ({ request, params }) => {
    const body = await request.json();
    await d(400);
    store.kelas = store.kelas.map(k => k.id === params.id ? { ...k, ...body } : k);
    return HttpResponse.json(store.kelas.find(k => k.id === params.id));
  }),

  http.delete(url('/admin/kelas/:id'), async ({ params }) => {
    await d(300);
    store.kelas = store.kelas.filter(k => k.id !== params.id);
    return HttpResponse.json({ deleted: true });
  }),

  // ── Admin — Upload nilai ──────────────────────────────────────────
  http.post(url('/admin/nilai/upload'), async () => {
    await d(1500);
    return HttpResponse.json({
      doc_id: 'nilai_' + Date.now(), filename: 'nilai.csv',
      rows_parsed: 32, rows_valid: 30, rows_error: 2,
      status: 'processed', processed_at: new Date().toISOString(),
    });
  }),
];
