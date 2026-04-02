/**
 * SR MVP — MSW Mock Handlers
 * Tim 6 Fase 2 | src/mocks/handlers.js
 *
 * Mock Service Worker — intercept semua API di browser dengan response
 * yang IDENTIK bentuknya dengan response server nyata.
 * Shape sudah final → swap ke real API di Fase 3 tanpa ubah UI.
 *
 * Setup:
 *   npx msw init public/ --save
 *   Di main.jsx:
 *     if (import.meta.env.VITE_USE_MSW === 'true') {
 *       const { worker } = await import('./mocks/browser');
 *       await worker.start({ onUnhandledRequest: 'bypass' });
 *     }
 */

import { http, HttpResponse, delay } from 'msw';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const url = (path) => `${BASE}${path}`;

export const handlers = [

  // ── Auth ─────────────────────────────────────────────────────────
  http.post(url('/auth/login'), async ({ request }) => {
    const { email, role } = await request.json();
    await delay(400);
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
    await delay(200);
    return HttpResponse.json({ message: 'Berhasil logout' });
  }),

  // ── Mentor Chat Tim 5 ─────────────────────────────────────────────
  http.post(url('/mentor/chat'), async ({ request }) => {
    const { message, sub_materi } = await request.json();
    await delay(1200 + Math.random() * 600);
    const reply = [
      'Pertanyaan menarik tentang **' + (sub_materi || 'materi ini') + '**!',
      'Kamu bertanya: "' + (message || '') + '"',
      '',
      'Mari kita bahas step by step... \uD83D\uDE0A',
      '',
      '\u2460 Pahami konsep dasarnya',
      '\u2461 Coba contoh sederhana',
      '\u2462 Latihan soal',
      '',
      'Mau mulai dari mana?',
    ].join('\n');
    return HttpResponse.json({
      reply,
      session_id: 'sess_' + Date.now(),
    });
  }),

  // ── Content RAG Tim 3 ─────────────────────────────────────────────
  http.post(url('/content/generate'), async ({ request }) => {
    const { tipe, sub_materi } = await request.json();
    await delay(2000);

    const topik = (sub_materi || 'Materi').toUpperCase();
    const nama = sub_materi || 'Materi';

    const contentMap = {
      flashcard: {
        cards: [
          { depan: 'Apa itu ' + nama + '?', belakang: 'Konsep fundamental yang penting dipahami.' },
          { depan: 'Rumus utama ' + nama, belakang: 'Lihat buku referensi halaman 42-45.' },
          { depan: 'Contoh penerapan ' + nama, belakang: 'Dapat ditemukan dalam kehidupan sehari-hari.' },
        ],
      },
      mindmap: {
        content: [
          '\uD83D\uDD11 ' + topik,
          '\u251C\u2500 Konsep Utama',
          '\u2502  \u251C\u2500 Definisi',
          '\u2502  \u2514\u2500 Contoh',
          '\u2514\u2500 Aplikasi',
          '   \u251C\u2500 Di sekolah',
          '   \u2514\u2500 Di kehidupan nyata',
        ].join('\n'),
      },
      catatan: {
        content: [
          '# ' + nama,
          '',
          '## Pengertian',
          'Deskripsi lengkap tentang konsep utama materi ini.',
          '',
          '## Poin Penting',
          '- Poin pertama yang perlu diingat',
          '- Poin kedua yang penting',
          '- Poin ketiga sebagai pelengkap',
          '',
          '## Contoh',
          'Contoh konkret penerapan dalam kehidupan nyata.',
        ].join('\n'),
      },
    };

    return HttpResponse.json({
      tipe,
      content: contentMap[tipe] ?? {},
      generated_at: new Date().toISOString(),
    });
  }),

  http.post(url('/content/curriculum'), async () => {
    await delay(1800);
    return HttpResponse.json({
      doc_id: 'doc_' + Date.now(),
      chunk_count: 42,
      status: 'indexed',
    });
  }),

  http.post(url('/content/quiz/submit'), async ({ request }) => {
    const { score } = await request.json();
    await delay(300);
    return HttpResponse.json({
      submitted: true,
      score,
      recorded_at: new Date().toISOString(),
    });
  }),

  // ── Emotion Tim 1 ─────────────────────────────────────────────────
  http.post(url('/emotion/detect'), async () => {
    await delay(300);
    const emotions = ['senang', 'netral', 'netral', 'bingung', 'senang'];
    return HttpResponse.json({
      emosi: emotions[Math.floor(Math.random() * emotions.length)],
      confidence: 0.7 + Math.random() * 0.28,
      timestamp: new Date().toISOString(),
    });
  }),

  // ── Game Tim 4 ────────────────────────────────────────────────────
  http.post(url('/game/generate'), async ({ request }) => {
    const { topik, mapel_id } = await request.json();
    await delay(2500);
    return HttpResponse.json({
      game_id: 'game_' + Date.now(),
      nama: 'Quest: ' + (topik || 'Pelajaran'),
      deskripsi: 'Game edukasi interaktif tentang ' + (topik || 'pelajaran ini'),
      mapel_id: mapel_id || '',
      status: 'ready',
      config: {
        levels: 3,
        questions_per_level: 5,
        timer_seconds: 30,
      },
    });
  }),

  http.get(url('/game/list'), async () => {
    await delay(400);
    return HttpResponse.json([
      { game_id: 'g1', nama: 'Algebraic Quest', mapel_id: 'mat', status: 'ready', pemain: 24 },
      { game_id: 'g2', nama: 'EcoWorld Explorer', mapel_id: 'ipa', status: 'ready', pemain: 18 },
    ]);
  }),

  // ── Admin — Kelas ─────────────────────────────────────────────────
  http.get(url('/admin/kelas'), async () => {
    await delay(300);
    return HttpResponse.json([
      {
        id: 'k1', nama: 'Kelas X IPA 1', tingkat: 'X', jurusan: 'IPA',
        tahunAjaran: '2025/2026', waliKelasId: 'g2',
        mapelGuruMap: { mat: 'g1', ipa: 'g2' }, siswaIds: ['s1', 's2', 's3'],
      },
      {
        id: 'k2', nama: 'Kelas X IPS 1', tingkat: 'X', jurusan: 'IPS',
        tahunAjaran: '2025/2026', waliKelasId: 'g4',
        mapelGuruMap: { mat: 'g1', ips: 'g4' }, siswaIds: ['s4', 's5'],
      },
    ]);
  }),

  http.post(url('/admin/kelas'), async ({ request }) => {
    const body = await request.json();
    await delay(400);
    return HttpResponse.json({ ...body, id: 'k_' + Date.now() });
  }),

  http.put(url('/admin/kelas/:id'), async ({ request }) => {
    const body = await request.json();
    await delay(400);
    return HttpResponse.json(body);
  }),

  http.delete(url('/admin/kelas/:id'), async () => {
    await delay(300);
    return HttpResponse.json({ deleted: true });
  }),

  // ── Admin — Guru ──────────────────────────────────────────────────
  http.get(url('/admin/guru'), async () => {
    await delay(300);
    return HttpResponse.json([
      { id: 'g1', nama: 'Bpk. Hendra, M.Pd.', nip: '198205152008011005', email: 'hendra@sr-malang.sch.id', mapelIds: ['mat'], kelasIds: ['k1', 'k2'], avatar: 'BH' },
      { id: 'g2', nama: 'Sri Dewi, S.Pd.', nip: '197911222005012003', email: 'dewi@sr-malang.sch.id', mapelIds: ['ipa'], kelasIds: ['k1'], avatar: 'SD' },
    ]);
  }),

  http.post(url('/admin/guru'), async ({ request }) => {
    const body = await request.json();
    await delay(400);
    return HttpResponse.json({ ...body, id: 'g_' + Date.now() });
  }),

  http.put(url('/admin/guru/:id'), async ({ request }) => {
    const body = await request.json();
    await delay(400);
    return HttpResponse.json(body);
  }),

  // ── Admin — Siswa ─────────────────────────────────────────────────
  http.get(url('/admin/siswa'), async () => {
    await delay(300);
    return HttpResponse.json([
      { id: 's1', nama: 'Ahmad Fauzi', nis: '2025001', email: 'ahmad@siswa.sr', kelasId: 'k1', avatar: 'AF' },
      { id: 's2', nama: 'Dewi Rahayu', nis: '2025002', email: 'dewi@siswa.sr', kelasId: 'k1', avatar: 'DR' },
    ]);
  }),

  http.post(url('/admin/siswa'), async ({ request }) => {
    const body = await request.json();
    await delay(400);
    return HttpResponse.json({ ...body, id: 's_' + Date.now() });
  }),

  http.delete(url('/admin/siswa/:id'), async () => {
    await delay(300);
    return HttpResponse.json({ deleted: true });
  }),

  // ── Admin — Mapel ─────────────────────────────────────────────────
  http.get(url('/admin/mapel'), async () => {
    await delay(300);
    return HttpResponse.json([
      { id: 'mat', label: 'Matematika', icon: '\uD83D\uDCCF', color: '#0D5C63' },
      { id: 'ipa', label: 'IPA', icon: '\uD83D\uDD2C', color: '#DD6B20' },
      { id: 'bin', label: 'B. Indonesia', icon: '\uD83D\uDCD6', color: '#6B46C1' },
      { id: 'ips', label: 'IPS', icon: '\uD83C\uDF0D', color: '#2F855A' },
    ]);
  }),

  http.post(url('/admin/mapel'), async ({ request }) => {
    const body = await request.json();
    await delay(400);
    return HttpResponse.json({ ...body, id: 'mapel_' + Date.now() });
  }),

  http.put(url('/admin/mapel/:id'), async ({ request }) => {
    const body = await request.json();
    await delay(400);
    return HttpResponse.json(body);
  }),

  http.delete(url('/admin/mapel/:id'), async () => {
    await delay(300);
    return HttpResponse.json({ deleted: true });
  }),
  // ────────────────────────────────────────────────────────────────
  // MISSING HANDLERS — ditambahkan Fase 2 Rev (evaluasi poin 3)
  // ────────────────────────────────────────────────────────────────

  // ── Auth: register, refresh, /me ─────────────────────────────────
  http.post(url('/auth/register'), async ({ request }) => {
    const body = await request.json();
    await delay(600);
    return HttpResponse.json({
      message: 'Registrasi berhasil. Akun menunggu verifikasi admin.',
      user_id: 'usr_' + Date.now(),
    });
  }),

  http.post(url('/auth/refresh'), async () => {
    await delay(200);
    return HttpResponse.json({
      access_token: 'mock_refreshed_jwt_' + Date.now(),
      refresh_token: 'mock_refresh_new',
    });
  }),

  http.get(url('/auth/me'), async () => {
    await delay(200);
    return HttpResponse.json({
      id: 'usr_001',
      nama: 'Budi Santoso',
      email: 'budi@siswa.sr',
      role: 'siswa',
      sekolah_id: 'sr_malang_001',
      kelas_id: '10ipa1',
      nis: '2025009',
    });
  }),

  // ── Emotion: history ─────────────────────────────────────────────
  http.get(url('/emotion/history'), async ({ request }) => {
    const params = new URL(request.url).searchParams;
    await delay(300);
    const now = new Date();
    return HttpResponse.json([
      { emosi: 'senang', confidence: 0.91, timestamp: new Date(now - 300000).toISOString() },
      { emosi: 'netral', confidence: 0.78, timestamp: new Date(now - 240000).toISOString() },
      { emosi: 'bingung', confidence: 0.82, timestamp: new Date(now - 180000).toISOString() },
      { emosi: 'netral', confidence: 0.75, timestamp: new Date(now - 120000).toISOString() },
      { emosi: 'senang', confidence: 0.88, timestamp: new Date(now - 60000).toISOString() },
    ]);
  }),

  // ── Content: recommend, progress ─────────────────────────────────
  http.get(url('/content/recommend'), async () => {
    await delay(500);
    return HttpResponse.json([
      { mapel_id: 'mat', sub_materi: 'Fungsi Kuadrat', alasan: 'Lanjutan dari Persamaan Linear yang sudah selesai' },
      { mapel_id: 'ipa', sub_materi: 'Sel & Jaringan', alasan: 'Relevan dengan topik Ekosistem yang sedang dipelajari' },
      { mapel_id: 'bin', sub_materi: 'Teks Argumentasi', alasan: 'Direkomendasikan berdasarkan profil minat siswa' },
    ]);
  }),

  http.get(url('/content/progress'), async () => {
    await delay(300);
    return HttpResponse.json({
      siswa_id: 'usr_001',
      total_materi: 12,
      selesai: 4,
      dalam_proses: 3,
      belum_dimulai: 5,
      rata_rata_quiz: 78,
      streak_hari: 7,
      total_waktu_menit: 225,
      by_mapel: [
        { mapel_id: 'mat', selesai: 2, progress_avg: 72 },
        { mapel_id: 'ipa', selesai: 1, progress_avg: 85 },
        { mapel_id: 'bin', selesai: 1, progress_avg: 64 },
        { mapel_id: 'ips', selesai: 0, progress_avg: 30 },
      ],
    });
  }),

  // ── Game: detail, score ───────────────────────────────────────────
  http.get(url('/game/:game_id'), async ({ params }) => {
    await delay(300);
    return HttpResponse.json({
      game_id: params.game_id,
      nama: 'Algebraic Quest',
      deskripsi: 'Selesaikan persamaan untuk mengalahkan musuh!',
      mapel_id: 'mat',
      status: 'ready',
      config: { levels: 3, questions_per_level: 5, timer_seconds: 30 },
      leaderboard: [
        { siswa_nama: 'Dewi Rahayu', skor: 950, rank: 1 },
        { siswa_nama: 'Rizki Pratama', skor: 880, rank: 2 },
        { siswa_nama: 'Budi Santoso', skor: 750, rank: 3 },
      ],
    });
  }),

  http.post(url('/game/score'), async ({ request }) => {
    const body = await request.json();
    await delay(300);
    return HttpResponse.json({
      saved: true,
      siswa_id: body.siswa_id,
      game_id: body.game_id,
      skor: body.skor,
      rank: 3,
      recorded_at: new Date().toISOString(),
    });
  }),

  // ── Mentor: history, reset session ───────────────────────────────
  http.get(url('/mentor/chat/history'), async ({ request }) => {
    const params = new URL(request.url).searchParams;
    await delay(400);
    return HttpResponse.json([
      { role: 'ai', text: `Halo! Kita belajar **${params.get('sub_materi') || 'materi ini'}** ya. Siap?`, timestamp: new Date(Date.now() - 600000).toISOString(), team: 'Tim 5' },
      { role: 'user', text: 'Siap pak!', timestamp: new Date(Date.now() - 540000).toISOString() },
      { role: 'ai', text: 'Bagus! Mari mulai dari konsep dasar dulu...', timestamp: new Date(Date.now() - 480000).toISOString(), team: 'Tim 5' },
    ]);
  }),

  http.delete(url('/mentor/chat/session'), async () => {
    await delay(200);
    return HttpResponse.json({ deleted: true, message: 'Sesi chat berhasil di-reset.' });
  }),

  // ── Admin: detail endpoints ───────────────────────────────────────
  http.get(url('/admin/kelas/:id/siswa'), async ({ params }) => {
    await delay(300);
    const siswaByKelas = {
      k1: [
        { id: 's1', nama: 'Ahmad Fauzi', nis: '2025001', email: 'ahmad@siswa.sr', status: 'Aktif', avatar: 'AF' },
        { id: 's2', nama: 'Dewi Rahayu', nis: '2025002', email: 'dewi@siswa.sr', status: 'Aktif', avatar: 'DR' },
        { id: 's3', nama: 'Rizki Pratama', nis: '2025003', email: 'rizki@siswa.sr', status: 'Aktif', avatar: 'RP' },
      ],
      k2: [
        { id: 's9', nama: 'Budi Santoso', nis: '2025009', email: 'budi@siswa.sr', status: 'Aktif', avatar: 'BS' },
      ],
    };
    return HttpResponse.json(siswaByKelas[params.id] || []);
  }),

  http.get(url('/admin/guru/:id'), async ({ params }) => {
    await delay(200);
    const guru = {
      g1: { id: 'g1', nama: 'Bpk. Hendra, M.Pd.', nip: '198205152008011005', email: 'hendra@sr-malang.sch.id', mapelIds: ['mat'], kelasIds: ['k1', 'k2'], status: 'Aktif', bergabung: 'Agustus 2022', avatar: 'BH' },
      g2: { id: 'g2', nama: 'Sri Dewi, S.Pd.', nip: '197911222005012003', email: 'dewi@sr-malang.sch.id', mapelIds: ['ipa'], kelasIds: ['k1'], status: 'Aktif', bergabung: 'Januari 2021', avatar: 'SD' },
    };
    return HttpResponse.json(guru[params.id] || { id: params.id, nama: 'Unknown', status: 'Aktif' });
  }),

  http.get(url('/admin/siswa/:id'), async ({ params }) => {
    await delay(200);
    const siswa = {
      s1: { id: 's1', nama: 'Ahmad Fauzi', nis: '2025001', email: 'ahmad@siswa.sr', kelasId: 'k1', status: 'Aktif', bergabung: 'Jul 2025', lastLogin: '4 hari lalu', avatar: 'AF' },
      s2: { id: 's2', nama: 'Dewi Rahayu', nis: '2025002', email: 'dewi@siswa.sr', kelasId: 'k1', status: 'Aktif', bergabung: 'Jul 2025', lastLogin: 'Hari ini', avatar: 'DR' },
    };
    return HttpResponse.json(siswa[params.id] || { id: params.id, nama: 'Unknown', status: 'Aktif' });
  }),

  http.post(url('/admin/nilai/upload'), async ({ request }) => {
    await delay(1500);
    return HttpResponse.json({
      doc_id: 'nilai_' + Date.now(),
      filename: 'nilai.csv',
      rows_parsed: 32,
      rows_valid: 30,
      rows_error: 2,
      status: 'processed',
      processed_at: new Date().toISOString(),
    });
  }),
];