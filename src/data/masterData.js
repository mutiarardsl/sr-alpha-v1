import { C } from '../styles/tokens.js'

// ─── Subjects ──────────────────────────────────────────────────────
// ADMIN_MAPEL_LIST is the single source of truth for mapel metadata.
// Dibagi per penjurusan: MIPA, SOSIAL, dan UMUM (lintas jurusan).
// SUBJECTS derives from it to guarantee color/label consistency.

export const ADMIN_MAPEL_LIST_MIPA = [
  { id: "mat", label: "Matematika", icon: "📐", color: "#319795", jurusan: "MIPA" }, // teal
  { id: "fis", label: "Fisika", icon: "⚛️", color: "#DD6B20", jurusan: "MIPA" }, // orange
  { id: "kim", label: "Kimia", icon: "🧪", color: "#805AD5", jurusan: "MIPA" }, // purple
  { id: "bio", label: "Biologi", icon: "🧬", color: "#38A169", jurusan: "MIPA" }, // green
];

export const ADMIN_MAPEL_LIST_SOSIAL = [
  { id: "geo", label: "Geografi", icon: "🗺️", color: "#2B6CB0", jurusan: "SOSIAL" }, // blue
  { id: "eko", label: "Ekonomi", icon: "💰", color: "#D69E2E", jurusan: "SOSIAL" }, // yellow
  { id: "sos", label: "Sosiologi", icon: "👥", color: "#718096", jurusan: "SOSIAL" }, // gray
  { id: "ant", label: "Antropologi", icon: "🗿", color: "#A0522D", jurusan: "SOSIAL" }, // brown
];

// Mapel lintas jurusan (wajib semua penjurusan)
export const ADMIN_MAPEL_LIST_UMUM = [
  { id: "bin", label: "B. Indonesia", icon: "📖", color: "#9B2C2C", jurusan: "UMUM" }, // red
  { id: "eng", label: "B. Inggris", icon: "🌐", color: "#3182CE", jurusan: "UMUM" }, // blue alt
  { id: "ppkn", label: "PPKn", icon: "🏛️", color: "#C53030", jurusan: "UMUM" }, // civic
  { id: "pjok", label: "PJOK", icon: "⚽", color: "#2F855A", jurusan: "UMUM" }, // sport
  { id: "cod", label: "Coding", icon: "💻", color: "#2D3748", jurusan: "UMUM" }, // tech
];

// Flat list (seluruh mapel) — tetap diekspor agar komponen lama tidak perlu diubah
export const ADMIN_MAPEL_LIST = [
  ...ADMIN_MAPEL_LIST_MIPA,
  ...ADMIN_MAPEL_LIST_SOSIAL,
  ...ADMIN_MAPEL_LIST_UMUM,
];

// SUBJECTS = mapel IPA dengan sub-topik (student-facing UI, disesuaikan kelas X IPA)
const SUBJECT_SUBS = {
  mat: [
    "Aljabar",
    "Persamaan & Pertidaksamaan",
    "Fungsi & Grafik",
    "Statistika & Peluang"
  ],
  fis: [
    "Gerak Lurus",
    "Hukum Newton",
    "Usaha & Energi",
    "Gelombang & Optik"
  ],
  kim: [
    "Struktur Atom",
    "Sistem Periodik",
    "Reaksi Kimia",
    "Stoikiometri"
  ],
  bio: [
    "Sel & Jaringan",
    "Sistem Organ",
    "Genetika",
    "Ekosistem"
  ],
  bin: [
    "Teks Argumentasi",
    "Puisi & Prosa",
    "Surat Dinas",
    "Debat"
  ],
}

export const SUBJECTS = ADMIN_MAPEL_LIST
  .filter(m => SUBJECT_SUBS[m.id])
  .map(m => ({ ...m, subs: SUBJECT_SUBS[m.id] }))

export const TEACHERS = [
  { id: "t1", name: "Sri Dewi, S.Pd.", initials: "SD", mapelId: "fis", bg: `linear-gradient(135deg,${C.amber},${C.orange})` },
  { id: "t2", name: "Bpk. Hendra, M.Pd.", initials: "BH", mapelId: "mat", bg: `linear-gradient(135deg,${C.teal},${C.tealL})` },
  { id: "t3", name: "Ibu Ratna, S.Pd.", initials: "IR", mapelId: "bin", bg: `linear-gradient(135deg,${C.purple},#9B72DB)` },
  { id: "t4", name: "Bpk. Yoga, S.Pd.", initials: "BY", mapelId: "eko", bg: `linear-gradient(135deg,${C.green},#48BB78)` },
]

export const SEEDED_TEACHER_ID = "t2"

export const CLASSES = [
  { id: "10ipa1", label: "Kelas X IPA 1", count: 32 },
  { id: "10ips2", label: "Kelas X IPS 1", count: 30 },
  { id: "10ipa3", label: "Kelas X IPA 3", count: 28 },
]

// Emotion keys: "engagement" | "boredom" | "confusion" | "frustration"
export const STUDENTS = [
  {
    id: "s1", name: "Ahmad Fauzi", avatar: "AF", avatarBg: "#E53E3E", emotion: "😵 Confusion", emotionKey: "confusion",
    status: "Perhatian", lastActive: "4 hari lalu",
    todayActive: false, todayStudyHours: null, todayQuizScore: null, todayQuizTotal: null, todayTopik: null,
    riwayat: [
      { tanggal: "Senin, 10 Mar 2026", topik: "Aljabar Dasar", durasi: 0.5, quiz: 30, quizTotal: 10, emosi: "😵 Confusion" },
      { tanggal: "Rabu, 5 Mar 2026", topik: "Persamaan Linear", durasi: 0.7, quiz: 40, quizTotal: 10, emosi: "😵 Confusion" },
    ]
  },
  {
    id: "s2", name: "Dewi Rahayu", avatar: "DR", avatarBg: C.teal, emotion: "🟢 Engagement", emotionKey: "engagement",
    status: "Normal", lastActive: "Hari ini 13:45",
    todayActive: true, todayStudyHours: 2.0, todayQuizScore: 8, todayQuizTotal: 10, todayTopik: "Fungsi Kuadrat",
    riwayat: [
      { tanggal: "Senin, 16 Mar 2026", topik: "Fungsi Kuadrat", durasi: 2.5, quiz: 8, quizTotal: 10, emosi: "🟢 Engagement" },
      { tanggal: "Jumat, 14 Mar 2026", topik: "Statistika", durasi: 1.8, quiz: 9, quizTotal: 10, emosi: "🟢 Engagement" },
      { tanggal: "Kamis, 13 Mar 2026", topik: "Persamaan Linear", durasi: 2.0, quiz: 8, quizTotal: 10, emosi: "😴 Boredom" },
    ]
  },
  {
    id: "s3", name: "Rizki Pratama", avatar: "RP", avatarBg: C.amber, emotion: "😤 Frustration", emotionKey: "frustration",
    status: "Perhatian", lastActive: "3 hari lalu",
    todayActive: false, todayStudyHours: null, todayQuizScore: null, todayQuizTotal: null, todayTopik: null,
    riwayat: [
      { tanggal: "Jumat, 13 Mar 2026", topik: "Persamaan Linear", durasi: 0.6, quiz: 4, quizTotal: 10, emosi: "😤 Frustration" },
      { tanggal: "Rabu, 11 Mar 2026", topik: "Aljabar Dasar", durasi: 0.5, quiz: 3, quizTotal: 10, emosi: "😵 Confusion" },
    ]
  },
  {
    id: "s4", name: "Siti Nurhaliza", avatar: "SN", avatarBg: C.purple, emotion: "🟢 Engagement", emotionKey: "engagement",
    status: "Normal", lastActive: "Hari ini 14:30",
    todayActive: true, todayStudyHours: 1.5, todayQuizScore: 10, todayQuizTotal: 10, todayTopik: "Statistika",
    riwayat: [
      { tanggal: "Senin, 16 Mar 2026", topik: "Statistika", durasi: 3.0, quiz: 10, quizTotal: 10, emosi: "🟢 Engagement" },
      { tanggal: "Jumat, 14 Mar 2026", topik: "Fungsi Kuadrat", durasi: 2.5, quiz: 10, quizTotal: 10, emosi: "🟢 Engagement" },
      { tanggal: "Kamis, 13 Mar 2026", topik: "Persamaan Linear", durasi: 2.0, quiz: 9, quizTotal: 10, emosi: "🟢 Engagement" },
      { tanggal: "Rabu, 12 Mar 2026", topik: "Aljabar Dasar", durasi: 2.2, quiz: 10, quizTotal: 10, emosi: "🟢 Engagement" },
    ]
  },
  {
    id: "s5", name: "Bagas Firmansyah", avatar: "BF", avatarBg: C.green, emotion: "😴 Boredom", emotionKey: "boredom",
    status: "Normal", lastActive: "Hari ini 11:20",
    todayActive: true, todayStudyHours: 1.0, todayQuizScore: 7, todayQuizTotal: 10, todayTopik: "Persamaan Linear",
    riwayat: [
      { tanggal: "Senin, 16 Mar 2026", topik: "Persamaan Linear", durasi: 1.0, quiz: 7, quizTotal: 10, emosi: "😴 Boredom" },
      { tanggal: "Jumat, 14 Mar 2026", topik: "Statistika", durasi: 1.5, quiz: 6, quizTotal: 10, emosi: "😴 Boredom" },
      { tanggal: "Rabu, 12 Mar 2026", topik: "Aljabar Dasar", durasi: 1.3, quiz: 7, quizTotal: 10, emosi: "🟢 Engagement" },
    ]
  },
  {
    id: "s6", name: "Lina Kartika", avatar: "LK", avatarBg: "#B7791F", emotion: "😵 Confusion", emotionKey: "confusion",
    status: "Normal", lastActive: "Hari ini 12:30",
    todayActive: true, todayStudyHours: 0.5, todayQuizScore: 6, todayQuizTotal: 10, todayTopik: "Persamaan Linear",
    riwayat: [
      { tanggal: "Minggu, 15 Mar 2026", topik: "Statistika", durasi: 0.8, quiz: 4, quizTotal: 10, emosi: "😵 Confusion" },
      { tanggal: "Jumat, 13 Mar 2026", topik: "Persamaan Linear", durasi: 1.0, quiz: 5, quizTotal: 10, emosi: "😵 Confusion" },
    ]
  },
]


// ─── Admin seed data ────────────────────────────────────────────────

export const ADMIN_GURU_INIT = [
  {
    id: "g1", nama: "Bpk. Hendra, M.Pd.", nip: "198205152008011005", email: "hendra@sr-malang.sch.id",
    mapelIds: ["mat"], kelasIds: ["k1", "k2", "k3"], bergabung: "Agustus 2022", avatar: "BH",
    avatarBg: `linear-gradient(135deg,#0D5C63,#1A8A94)`
  },
  {
    id: "g2", nama: "Sri Dewi, S.Pd.", nip: "197911222005012003", email: "dewi@sr-malang.sch.id",
    mapelIds: ["fis", "kim", "bio"], kelasIds: ["k1", "k4"], bergabung: "Januari 2021", avatar: "SD",
    avatarBg: `linear-gradient(135deg,#F4A435,#DD6B20)`
  },
  {
    id: "g3", nama: "Ibu Ratna, S.Pd.", nip: "198507102010012009", email: "ratna@sr-malang.sch.id",
    mapelIds: ["bin"], kelasIds: ["k1", "k2", "k3", "k4"], bergabung: "Juli 2023", avatar: "IR",
    avatarBg: `linear-gradient(135deg,#6B46C1,#9B72DB)`
  },
  {
    id: "g4", nama: "Bpk. Yoga, S.Pd.", nip: "199001152015011002", email: "yoga@sr-malang.sch.id",
    mapelIds: ["geo", "eko", "sos"], kelasIds: ["k2", "k3"], bergabung: "Agustus 2023", avatar: "BY",
    avatarBg: `linear-gradient(135deg,#2F855A,#48BB78)`
  },
  {
    id: "g5", nama: "Ibu Sari, S.Pd.", nip: "198803042012012006", email: "sari@sr-malang.sch.id",
    mapelIds: ["eng"], kelasIds: ["k1", "k2", "k3", "k4"], bergabung: "Maret 2022", avatar: "IS",
    avatarBg: `linear-gradient(135deg,#2B6CB0,#4299E1)`
  },
  {
    id: "g6", nama: "Bpk. Anton, S.Pd.", nip: "198612102014011004", email: "anton@sr-malang.sch.id",
    mapelIds: ["pjok"], kelasIds: ["k1", "k4"], bergabung: "Juli 2021", avatar: "BA",
    avatarBg: `linear-gradient(135deg,#C05621,#ED8936)`
  },
  {
    id: "g7", nama: "Ibu Wulan, S.Sn.", nip: "199205282016012008", email: "wulan@sr-malang.sch.id",
    mapelIds: ["seni"], kelasIds: ["k2", "k3"], bergabung: "Oktober 2024", avatar: "IW",
    avatarBg: `linear-gradient(135deg,#B7791F,#D69E2E)`
  },
  {
    id: "g8", nama: "Bpk. Dedi, S.Pd.", nip: "198109152009011007", email: "dedi@sr-malang.sch.id",
    mapelIds: ["ppkn", "geo"], kelasIds: ["k1", "k2"], bergabung: "Agustus 2020", avatar: "BD",
    avatarBg: `linear-gradient(135deg,#9B2C2C,#C53030)`
  },
]

export const ADMIN_KELAS_INIT = [
  {
    id: "k1", nama: "Kelas X IPA 1", tingkat: "X", jurusan: "IPA", waliKelasId: "g2",
    mapelGuruMap: { mat: "g1", fis: "g2", kim: "g2", bio: "g2", bin: "g3", eng: "g5", pjok: "g6", ppkn: "g8" },
    tahunAjaran: "2025/2026", siswaIds: ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9"]
  },
  {
    id: "k2", nama: "Kelas X IPS 1", tingkat: "X", jurusan: "IPS", waliKelasId: "g4",
    mapelGuruMap: { mat: "g1", bin: "g3", geo: "g4", eko: "g4", sos: "g4", eng: "g5", seni: "g7", ppkn: "g8" },
    tahunAjaran: "2025/2026", siswaIds: ["s10", "s11", "s12", "s13", "s14"]
  },
  {
    id: "k3", nama: "Kelas XI IPA 1", tingkat: "XI", jurusan: "IPA", waliKelasId: "g1",
    mapelGuruMap: { mat: "g1", fis: "g2", kim: "g2", bio: "g2", bin: "g3", eng: "g5", seni: "g7" },
    tahunAjaran: "2025/2026", siswaIds: ["s15", "s16", "s17", "s18", "s19", "s20", "s21"]
  },
  {
    id: "k4", nama: "Kelas XI IPS 2", tingkat: "XI", jurusan: "IPS", waliKelasId: "g3",
    mapelGuruMap: { mat: "g1", bin: "g3", geo: "g4", eko: "g4", eng: "g5", pjok: "g6" },
    tahunAjaran: "2025/2026", siswaIds: ["s22", "s23", "s24", "s25", "s26"]
  },
]

export const ADMIN_SISWA_INIT = [
  { id: "s1", nama: "Ahmad Fauzi", nis: "2025001", email: "ahmad@siswa.sr", kelasId: "k1", bergabung: "Jul 2025", lastLogin: "4 hari lalu", avatar: "AF", avatarBg: "#E53E3E" },
  { id: "s2", nama: "Dewi Rahayu", nis: "2025002", email: "dewi@siswa.sr", kelasId: "k1", bergabung: "Jul 2025", lastLogin: "Hari ini", avatar: "DR", avatarBg: "#0D5C63" },
  { id: "s3", nama: "Rizki Pratama", nis: "2025003", email: "rizki@siswa.sr", kelasId: "k1", bergabung: "Jul 2025", lastLogin: "3 hari lalu", avatar: "RP", avatarBg: "#F4A435" },
  { id: "s4", nama: "Siti Nurhaliza", nis: "2025004", email: "siti@siswa.sr", kelasId: "k1", bergabung: "Jul 2025", lastLogin: "Hari ini", avatar: "SN", avatarBg: "#6B46C1" },
  { id: "s5", nama: "Bagas Firmansyah", nis: "2025005", email: "bagas@siswa.sr", kelasId: "k1", bergabung: "Jul 2025", lastLogin: "Hari ini", avatar: "BF", avatarBg: "#2F855A" },
  { id: "s6", nama: "Lina Kartika", nis: "2025006", email: "lina@siswa.sr", kelasId: "k1", bergabung: "Jul 2025", lastLogin: "1 hari lalu", avatar: "LK", avatarBg: "#B7791F" },
  { id: "s7", nama: "Dino Prasetyo", nis: "2025007", email: "dino@siswa.sr", kelasId: "k1", bergabung: "Jul 2025", lastLogin: "2 hari lalu", avatar: "DP", avatarBg: "#2B6CB0" },
  { id: "s8", nama: "Ayu Maharani", nis: "2025008", email: "ayu@siswa.sr", kelasId: "k1", bergabung: "Jul 2025", lastLogin: "5 hari lalu", avatar: "AM", avatarBg: "#D53F8C" },
  { id: "s9", nama: "Budi Santoso", nis: "2025009", email: "budi@siswa.sr", kelasId: "k1", bergabung: "Jul 2025", lastLogin: "Hari ini", avatar: "BS", avatarBg: "#0D5C63" },
  { id: "s10", nama: "Citra Dewi", nis: "2025010", email: "citra@siswa.sr", kelasId: "k2", bergabung: "Jul 2025", lastLogin: "1 hari lalu", avatar: "CD", avatarBg: "#9B2C2C" },
  { id: "s11", nama: "Fajar Nugroho", nis: "2025011", email: "fajar@siswa.sr", kelasId: "k2", bergabung: "Jul 2025", lastLogin: "3 hari lalu", avatar: "FN", avatarBg: "#2F855A" },
  { id: "s12", nama: "Gilang Ramadhan", nis: "2025012", email: "gilang@siswa.sr", kelasId: "k2", bergabung: "Jul 2025", lastLogin: "Hari ini", avatar: "GR", avatarBg: "#DD6B20" },
  { id: "s13", nama: "Hana Pertiwi", nis: "2025013", email: "hana@siswa.sr", kelasId: "k2", bergabung: "Jul 2025", lastLogin: "2 hari lalu", avatar: "HP", avatarBg: "#6B46C1" },
  { id: "s14", nama: "Ilham Saputra", nis: "2025014", email: "ilham@siswa.sr", kelasId: "k2", bergabung: "Jul 2025", lastLogin: "2 minggu lalu", avatar: "IS", avatarBg: "#718096" },
  { id: "s15", nama: "Joko Widodo Jr.", nis: "2024001", email: "joko@siswa.sr", kelasId: "k3", bergabung: "Jul 2024", lastLogin: "Hari ini", avatar: "JW", avatarBg: "#0D5C63" },
  { id: "s16", nama: "Kartika Sari", nis: "2024002", email: "kartika@siswa.sr", kelasId: "k3", bergabung: "Jul 2024", lastLogin: "1 hari lalu", avatar: "KS", avatarBg: "#D53F8C" },
  { id: "s17", nama: "Lukman Hakim", nis: "2024003", email: "lukman@siswa.sr", kelasId: "k3", bergabung: "Jul 2024", lastLogin: "4 hari lalu", avatar: "LH", avatarBg: "#F4A435" },
  { id: "s18", nama: "Maya Anggraini", nis: "2024004", email: "maya@siswa.sr", kelasId: "k3", bergabung: "Jul 2024", lastLogin: "Hari ini", avatar: "MA", avatarBg: "#2B6CB0" },
  { id: "s19", nama: "Nanda Putra", nis: "2024005", email: "nanda@siswa.sr", kelasId: "k3", bergabung: "Jul 2024", lastLogin: "2 hari lalu", avatar: "NP", avatarBg: "#2F855A" },
  { id: "s20", nama: "Okta Purnama", nis: "2024006", email: "okta@siswa.sr", kelasId: "k3", bergabung: "Jul 2024", lastLogin: "1 bulan lalu", avatar: "OP", avatarBg: "#718096" },
  { id: "s21", nama: "Putri Handayani", nis: "2024007", email: "putri@siswa.sr", kelasId: "k3", bergabung: "Jul 2024", lastLogin: "Hari ini", avatar: "PH", avatarBg: "#9B2C2C" },
  { id: "s22", nama: "Qori Rahmawati", nis: "2024008", email: "qori@siswa.sr", kelasId: "k4", bergabung: "Jul 2024", lastLogin: "Hari ini", avatar: "QR", avatarBg: "#6B46C1" },
  { id: "s23", nama: "Rafi Maulana", nis: "2024009", email: "rafi@siswa.sr", kelasId: "k4", bergabung: "Jul 2024", lastLogin: "3 hari lalu", avatar: "RM", avatarBg: "#DD6B20" },
  { id: "s24", nama: "Sinta Wulandari", nis: "2024010", email: "sinta@siswa.sr", kelasId: "k4", bergabung: "Jul 2024", lastLogin: "1 hari lalu", avatar: "SW", avatarBg: "#D53F8C" },
  { id: "s25", nama: "Toni Harahap", nis: "2024011", email: "toni@siswa.sr", kelasId: "k4", bergabung: "Jul 2024", lastLogin: "Hari ini", avatar: "TH", avatarBg: "#0D5C63" },
  { id: "s26", nama: "Umar Faruq", nis: "2024012", email: "umar@siswa.sr", kelasId: "k4", bergabung: "Jul 2024", lastLogin: "5 hari lalu", avatar: "UF", avatarBg: "#2F855A" },
]

// ─── Recommended materials ─────────────────────────────────────────
export const RECOMMENDED_MATERIALS = [
  {
    id: "rm1", mapelId: "mat", mapelLabel: "Matematika", mapelIcon: "📐", mapelColor: "#0D5C63",
    subMateri: "Persamaan Linear", topik: "Aljabar",
    deskripsi: "Cara menyelesaikan persamaan satu variabel dengan langkah sistematis", tag: "⭐ Utama"
  },
  {
    id: "rm2", mapelId: "bio", mapelLabel: "Biologi", mapelIcon: "🧬", mapelColor: "#38A169",
    subMateri: "Ekosistem", topik: "Biologi Dasar",
    deskripsi: "Rantai makanan, jaring-jaring makanan, dan interaksi antar organisme", tag: "⭐ Utama"
  },
  {
    id: "rm3", mapelId: "fis", mapelLabel: "Fisika", mapelIcon: "⚛️", mapelColor: "#DD6B20",
    subMateri: "Gerak Lurus", topik: "Fisika",
    deskripsi: "Mempelajari konsep dasar gerak, perpindahan, kecepatan, dan percepatan.", tag: "⭐ Utama"
  },
  {
    id: "rm4", mapelId: "kim", mapelLabel: "Kimia", mapelIcon: "🧪", mapelColor: "#805AD5",
    subMateri: "Sistem Periodik", topik: "Kimia Dasar",
    deskripsi: "Mempelajari struktur zat, reaksi kimia alam kehidupan sehari-hari.", tag: "Topik Baru"
  },
  {
    id: "rm5", mapelId: "mat", mapelLabel: "Matematika", mapelIcon: "📐", mapelColor: "#0D5C63",
    subMateri: "Statistika", topik: "Data & Peluang",
    deskripsi: "Mean, median, modus, dan penyajian data dalam grafik", tag: null
  },
  {
    id: "rm6", mapelId: "bio", mapelLabel: "Biologi", mapelIcon: "🧬", mapelColor: "#38A169",
    subMateri: "Sel & Jaringan", topik: "Biologi",
    deskripsi: "Struktur sel, fungsi organel, dan jaringan pada makhluk hidup", tag: "Topik Baru"
  },
]

export const PROGRESS_DATA_INIT = {
  belumSelesai: [
    { id: "p1", mapelId: "mat", mapelLabel: "Matematika", mapelIcon: "📐", mapelColor: "#0D5C63", subMateri: "Fungsi Kuadrat", topik: "Aljabar Lanjut", progress: 40, lastChat: "1 jam lalu", confDone: ["mindmap"], quizDone: false, quizScore: null },
    { id: "p2", mapelId: "fis", mapelLabel: "Fisika", mapelIcon: "⚛️", mapelColor: "#DD6B20", subMateri: "Hukum Newton", topik: "Fisika", progress: 20, lastChat: "2 hari lalu", confDone: [], quizDone: false, quizScore: null },
    { id: "p3", mapelId: "bin", mapelLabel: "B. Indonesia", mapelIcon: "📖", mapelColor: "#6B46C1", subMateri: "Teks Argumentasi", topik: "Menulis Efektif", progress: 65, lastChat: "Kemarin", confDone: ["flashcard", "markdown"], quizDone: false, quizScore: null },
    { id: "p4", mapelId: "eng", mapelLabel: "B. Inggris", mapelIcon: "🌐", mapelColor: "#3182CE", subMateri: "Introduction", topik: "English", progress: 30, lastChat: "3 hari lalu", confDone: ["mindmap"], quizDone: false, quizScore: null },
  ],
  sudahSelesai: [
    { id: "p6", mapelId: "mat", mapelLabel: "Matematika", mapelIcon: "📐", mapelColor: "#0D5C63", subMateri: "Aljabar Dasar", topik: "Aljabar", progress: 100, lastChat: "Kemarin", confDone: ["mindmap", "flashcard"], quizDone: true, quizScore: 70 },
  ],
}

export const GAMES_DATA = [
  { id: "g1", nama: "Algebraic Quest", mapelId: "mat", mapelLabel: "Matematika", icon: "⚔️", deskripsi: "RPG berbasis soal aljabar. Kalahkan musuh dengan menjawab soal!", skorSiswa: 870, bestSkor: 1200, pemain: 24, color: "#0D5C63", bg: "#D4F0F3" },
  { id: "g2", nama: "EcoWorld Explorer", mapelId: "bio", mapelLabel: "Biologi", icon: "🌿", deskripsi: "Jelajahi ekosistem virtual dan pelajari rantai makanan.", skorSiswa: 450, bestSkor: 800, pemain: 18, color: "#2F855A", bg: "#C6F6D5" },
  { id: "g3", nama: "Word Battle", mapelId: "bin", mapelLabel: "B. Indonesia", icon: "📝", deskripsi: "Battle teks — tulis argumen terbaik untuk mengalahkan lawan.", skorSiswa: 320, bestSkor: 560, pemain: 12, color: "#6B46C1", bg: "#E9D8FD" },
  { id: "g4", nama: "History Map", mapelId: "geo", mapelLabel: "Geografi", icon: "🗺️", deskripsi: "Tempatkan kerajaan di peta dan jawab soal sejarah.", skorSiswa: 210, bestSkor: 400, pemain: 20, color: "#DD6B20", bg: "#FEEBC8" },
]

// ─── Pretest Topic-Level Questions ─────────────────────────────────
// Format: setiap mapel punya beberapa soal, masing-masing terikat ke subMateri
export const PRETEST_QUESTIONS = {
  mat: [
    {
      subMateri: 'Aljabar Dasar',
      soal: 'Sederhanakan: 3a + 2b + 5a − b',
      pilihan: ['8a + b', '8a − b', '8a + 3b', '6a + b'],
      jawaban: 0,
    },
    {
      subMateri: 'Persamaan Linear',
      soal: 'Selesaikan: 2x + 6 = 16, maka x = ...',
      pilihan: ['x = 3', 'x = 5', 'x = 4', 'x = 8'],
      jawaban: 1,
    },
    {
      subMateri: 'Fungsi Kuadrat',
      soal: 'Akar dari x² − 5x + 6 = 0 adalah ...',
      pilihan: ['x = 1 & x = 6', 'x = 2 & x = 3', 'x = −2 & x = −3', 'x = 2 & x = −3'],
      jawaban: 1,
    },
    {
      subMateri: 'Statistika',
      soal: 'Mean dari 4, 7, 8, 6, 5 adalah ...',
      pilihan: ['5', '6', '7', '8'],
      jawaban: 1,
    },
  ],
  // Biologi (IPA)
  bio: [
    {
      subMateri: 'Ekosistem',
      soal: 'Organisme yang membuat makanan sendiri disebut ...',
      pilihan: ['Konsumen', 'Produsen', 'Dekomposer', 'Predator'],
      jawaban: 1,
    },
    {
      subMateri: 'Sel & Jaringan',
      soal: 'Organel sel yang menghasilkan energi disebut ...',
      pilihan: ['Ribosom', 'Mitokondria', 'Nukleus', 'Vakuola'],
      jawaban: 1,
    },
  ],
  // Fisika (IPA)
  fis: [
    {
      subMateri: 'Gerak Lurus',
      soal: 'Kecepatan rata-rata dihitung dengan rumus ...',
      pilihan: ['v = s × t', 'v = t / s', 'v = s / t', 'v = s² / t'],
      jawaban: 2,
    },
    {
      subMateri: 'Energi & Kalor',
      soal: 'Perpindahan kalor melalui zat patat disebut ...',
      pilihan: ['Konveksi', 'Radiasi', 'Konduksi', 'Evaporasi'],
      jawaban: 2,
    },
  ],
  bin: [
    {
      subMateri: 'Teks Argumentasi',
      soal: 'Bagian teks argumentasi yang berisi pendapat utama disebut ...',
      pilihan: ['Argumen', 'Tesis', 'Penegasan', 'Simpulan'],
      jawaban: 1,
    },
    {
      subMateri: 'Puisi',
      soal: 'Pilihan kata yang indah dalam puisi disebut ...',
      pilihan: ['Rima', 'Irama', 'Diksi', 'Majas'],
      jawaban: 2,
    },
    {
      subMateri: 'Surat Dinas',
      soal: 'Bahasa yang digunakan dalam surat dinas adalah ...',
      pilihan: ['Santai dan informal', 'Baku dan resmi', 'Gaul dan kekinian', 'Puitis'],
      jawaban: 1,
    },
    {
      subMateri: 'Debat',
      soal: 'Pihak yang mendukung pernyataan dalam debat disebut ...',
      pilihan: ['Oposisi', 'Netral', 'Afirmatif/Pro', 'Moderator'],
      jawaban: 2,
    },
  ],
  ips: [
    {
      subMateri: 'Peradaban Awal',
      soal: 'Manusia mulai bercocok tanam pada zaman ...',
      pilihan: ['Paleolitikum', 'Mesolitikum', 'Neolitikum', 'Megalitikum'],
      jawaban: 2,
    },
    {
      subMateri: 'Kerajaan Nusantara',
      soal: 'Kerajaan Hindu tertua di Nusantara adalah ...',
      pilihan: ['Majapahit', 'Sriwijaya', 'Kutai', 'Mataram Kuno'],
      jawaban: 2,
    },
    {
      subMateri: 'Ekonomi Dasar',
      soal: 'Hukum permintaan menyatakan bahwa harga naik maka ...',
      pilihan: ['Permintaan naik', 'Permintaan turun', 'Penawaran turun', 'Penawaran naik'],
      jawaban: 1,
    },
    {
      subMateri: 'Geografi',
      soal: 'Garis khatulistiwa disebut juga ...',
      pilihan: ['Meridian', 'Equator', 'Paralel', 'Lintang Utara'],
      jawaban: 1,
    },
  ],
  // Kimia (IPA)
  kim: [
    {
      subMateri: 'Struktur Atom',
      soal: 'Partikel bermuatan negatif dalam atom disebut ...',
      pilihan: ['Proton', 'Neutron', 'Elektron', 'Nukleon'],
      jawaban: 2,
    },
    {
      subMateri: 'Sistem Periodik',
      soal: 'Unsur dengan nomor atom 6 adalah ...',
      pilihan: ['Oksigen', 'Nitrogen', 'Karbon', 'Helium'],
      jawaban: 2,
    },
    {
      subMateri: 'Reaksi Kimia',
      soal: 'Reaksi yang menyerap energi dari lingkungan disebut ...',
      pilihan: ['Eksoterm', 'Endoterm', 'Netral', 'Katalis'],
      jawaban: 1,
    },
  ],
  // B. Inggris (Umum)
  eng: [
    {
      subMateri: 'Reading Comprehension',
      soal: 'The word "benevolent" most closely means ...',
      pilihan: ['Harmful', 'Kind-hearted', 'Angry', 'Confused'],
      jawaban: 1,
    },
    {
      subMateri: 'Grammar Essentials',
      soal: 'Choose the correct sentence:',
      pilihan: [
        'She don\'t like apples.',
        'She doesn\'t likes apples.',
        'She doesn\'t like apples.',
        'She not like apples.',
      ],
      jawaban: 2,
    },
  ],
}

// ─── Pretest / Interest Profiling ──────────────────────────────────
export const INTEREST_QUESTIONS = [
  {
    id: 1, category: "Gaya Belajar", icon: "🧠", q: "Saat belajar hal baru, kamu lebih suka...",
    options: [{ label: "Mengerjakan soal latihan", scores: [3, 0, 0, 0] }, { label: "Membuat peta pikiran kreatif", scores: [0, 3, 0, 0] }, { label: "Diskusi bersama teman", scores: [0, 0, 3, 0] }, { label: "Mengamati contoh di alam", scores: [0, 0, 0, 3] }]
  },
  {
    id: 2, category: "Hobi", icon: "🎯", q: "Di waktu luang, kamu paling sering...",
    options: [{ label: "Main puzzle atau strategi", scores: [3, 1, 0, 0] }, { label: "Menggambar atau menulis", scores: [0, 3, 1, 0] }, { label: "Ngobrol dan main bareng", scores: [0, 0, 3, 1] }, { label: "Jalan-jalan ke alam", scores: [0, 1, 0, 3] }]
  },
  {
    id: 3, category: "Cita-cita", icon: "🌟", q: "Pekerjaan impianmu adalah...",
    options: [{ label: "Ilmuwan / programmer", scores: [3, 0, 0, 1] }, { label: "Seniman / desainer", scores: [0, 3, 1, 0] }, { label: "Dokter / guru", scores: [1, 0, 3, 0] }, { label: "Peneliti alam", scores: [1, 0, 0, 3] }]
  },
  {
    id: 4, category: "Problem Solving", icon: "💡", q: "Saat ada masalah, kamu biasanya...",
    options: [{ label: "Analisis data dan logika", scores: [3, 0, 0, 0] }, { label: "Cari solusi kreatif", scores: [0, 3, 0, 0] }, { label: "Minta pendapat orang lain", scores: [0, 0, 3, 0] }, { label: "Langsung eksperimen", scores: [1, 0, 0, 3] }]
  },
  {
    id: 5, category: "Mapel Favorit", icon: "📚", q: "Pelajaran yang paling kamu nikmati...",
    options: [{ label: "Matematika / Fisika", scores: [3, 0, 0, 0] }, { label: "B. Indonesia / Seni", scores: [0, 3, 0, 0] }, { label: "IPS / PKn", scores: [0, 0, 3, 1] }, { label: "IPA / Biologi", scores: [1, 0, 0, 3] }]
  },
  {
    id: 6, category: "Kerja Tim", icon: "🤝", q: "Dalam kerja kelompok, kamu berperan sebagai...",
    options: [{ label: "Perencana dan data", scores: [3, 0, 0, 0] }, { label: "Desain presentasi", scores: [0, 3, 1, 0] }, { label: "Pemimpin diskusi", scores: [0, 0, 3, 0] }, { label: "Riset lapangan", scores: [1, 0, 0, 3] }]
  },
]

export const INTEREST_DIMS = [
  { key: "logis", label: "Logis & Analitis", icon: "🔢", color: C.teal, desc: "Kamu kuat di angka dan logika sistematis." },
  { key: "kreatif", label: "Kreatif & Ekspresif", icon: "🎨", color: C.purple, desc: "Kamu berbakat dalam ekspresi dan ide inovatif." },
  { key: "sosial", label: "Sosial & Empatik", icon: "💬", color: C.green, desc: "Kamu hebat berinteraksi dan memimpin." },
  { key: "alam", label: "Natural & Eksploratif", icon: "🌿", color: C.orange, desc: "Kamu tertarik sains terapan dan eksplorasi." },
]

export const SEKOLAH_LIST = [
  { id: "sr-jkt-1", nama: "SR Jakarta Pusat", kota: "Jakarta Pusat", provinsi: "DKI Jakarta" },
  { id: "sr-jkt-2", nama: "SR Jakarta Selatan", kota: "Jakarta Selatan", provinsi: "DKI Jakarta" },
  { id: "sr-bdg-1", nama: "SR Kota Bandung", kota: "Bandung", provinsi: "Jawa Barat" },
  { id: "sr-sby-1", nama: "SR Kota Surabaya", kota: "Surabaya", provinsi: "Jawa Timur" },
  { id: "sr-mlg-1", nama: "SR Kota Malang", kota: "Malang", provinsi: "Jawa Timur" },
  { id: "sr-smg-1", nama: "SR Kota Semarang", kota: "Semarang", provinsi: "Jawa Tengah" },
  { id: "sr-mdn-1", nama: "SR Kota Medan", kota: "Medan", provinsi: "Sumatera Utara" },
  { id: "sr-mkr-1", nama: "SR Kota Makassar", kota: "Makassar", provinsi: "Sulawesi Selatan" },
]

export const KELAS_SMA = [
  "X IPA 1", "X IPA 2", "X IPS 1", "X IPS 2", ,
]

export const SEARCH_TOPICS = [
  { mapelId: "mat", mapelLabel: "Matematika", mapelIcon: "📐", mapelColor: "#0D5C63", subMateri: "Turunan Fungsi", topik: "Kalkulus" },
  { mapelId: "mat", mapelLabel: "Matematika", mapelIcon: "📐", mapelColor: "#0D5C63", subMateri: "Trigonometri", topik: "Geometri" },
  { mapelId: "mat", mapelLabel: "Matematika", mapelIcon: "📐", mapelColor: "#0D5C63", subMateri: "Logaritma", topik: "Aljabar" },
  { mapelId: "fis", mapelLabel: "Fisika", mapelIcon: "⚛️", mapelColor: "#DD6B20", subMateri: "Energi & Kalor", topik: "Fisika" },
  { mapelId: "kim", mapelLabel: "Kimia", mapelIcon: "🧪", mapelColor: "#805AD5", subMateri: "Sistem Periodik", topik: "Kimia" },
  { mapelId: "bin", mapelLabel: "B. Indonesia", mapelIcon: "📖", mapelColor: "#6B46C1", subMateri: "Puisi", topik: "Sastra" },
  { mapelId: "bin", mapelLabel: "B. Indonesia", mapelIcon: "📖", mapelColor: "#6B46C1", subMateri: "Surat Dinas", topik: "Formal" },
  { mapelId: "geo", mapelLabel: "Geografi", mapelIcon: "🗺️", mapelColor: "#2B6CB0", subMateri: "Geografi Fisik", topik: "Geografi" },
  { mapelId: "eko", mapelLabel: "Ekonomi", mapelIcon: "💰", mapelColor: "#D69E2E", subMateri: "Perdagangan Internasional", topik: "Ekonomi" },
]

export const CONF_TYPES = [
  { type: "mindmap", icon: "🧠", label: "Mind Map", color: "#6B46C1", bgLight: "#E9D8FD" },
  { type: "flashcard", icon: "🃏", label: "Flashcard", color: "#0D5C63", bgLight: "#D4F0F3" },
  { type: "markdown", icon: "📄", label: "Catatan", color: "#2F855A", bgLight: "#C6F6D5" },
]

export const CONF_CONTENT_INIT = {
  "mat__Persamaan Linear": {
    mindmap: { generated: false, ts: "Hari ini 14:35", content: "📐 PERSAMAAN LINEAR\n├─ Bentuk: ax + b = c\n└─ Cara: pindah konstanta, bagi koefisien" },
    flashcard: {
      generated: false, ts: "Hari ini 14:40", cards: [
        { depan: "Apa itu Persamaan Linear?", belakang: "Persamaan berderajat satu, bentuk ax + b = c" },
      ]
    },
    markdown: { generated: false, ts: "Hari ini 14:45", content: "# Persamaan Linear\n\n## Langkah\n1. Pindahkan konstanta\n2. Bagi koefisien variabel" },
  },
}

// DUMMY_MESSAGES: key format = mapelId__subMateri (konsisten dengan makeKey di ChatSection)
// Ini adalah riwayat percakapan demo yang sudah pernah terjadi
export const DUMMY_MESSAGES = {
  "mat__Persamaan Linear": [
    {
      id: 1,
      role: "ai",
      text: "Selamat datang di topik **Persamaan Linear**! 📐\n\nPersamaan linear adalah persamaan berderajat satu dengan bentuk umum **ax + b = c**.\n\n**Langkah penyelesaian:**\n1. Pindahkan konstanta ke ruas kanan (ubah tanda)\n2. Bagi kedua ruas dengan koefisien variabel\n\n**Contoh:**\n3x + 6 = 18\n→ 3x = 18 − 6 = 12\n→ x = 12/3 = **4** ✓\n\n**Coba soal ini:** 2x + 7 = 15, berapa x?\n\nMau latihan lebih banyak soal?",
      time: "14:30",
      team: "Tim 5"
    },
    {
      id: 2,
      role: "user",
      text: "x = 4",
      time: "14:31"
    },
    {
      id: 3,
      role: "ai",
      text: "Benar sekali! 🎉 **x = 4**\n\nKamu sudah paham konsep dasar Persamaan Linear. Apakah ada bagian yang ingin kamu tanyakan lebih lanjut? Atau kamu sudah siap untuk **Latihan Soal Quiz** di panel kanan? 😊",
      time: "14:31",
      team: "Tim 5"
    }
  ],
  "mat__Aljabar Dasar": [
    {
      id: 1,
      role: "ai",
      text: "Mari belajar **Aljabar Dasar**! 📐\n\nAljabar adalah cabang matematika yang menggunakan simbol (variabel) untuk merepresentasikan angka.\n\n**Konsep Utama:**\n• **Variabel**: simbol seperti x, y, a yang mewakili bilangan\n• **Koefisien**: angka yang mengalikan variabel (pada 5x, koefisiennya 5)\n• **Suku sejenis**: suku yang memiliki variabel & pangkat sama\n\n**Contoh Penyederhanaan:**\n3a + 2b + 5a − b = (3a+5a) + (2b−b) = **8a + b**\n\nAda pertanyaan tentang topik ini?",
      time: "10:00",
      team: "Tim 5"
    },
    {
      id: 2,
      role: "user",
      text: "Koefisien dari 4x itu berapa?",
      time: "10:02"
    },
    {
      id: 3,
      role: "ai",
      text: "Pertanyaan bagus! 😊\n\nKoefisien dari **4x** adalah **4** — yaitu angka yang langsung mengalikan variabel x.\n\nContoh lain:\n• 7y → koefisien = 7\n• -3a → koefisien = -3\n• x → koefisien = 1 (tersirat)\n\nSudah jelas? Atau ada yang ingin ditanyakan lagi?",
      time: "10:02",
      team: "Tim 5"
    }
  ]
}

export const QUIZ_DATA = {
  "mat__Persamaan Linear": [
    { id: 1, soal: "Selesaikan: 3x + 9 = 24", pilihan: ["x=3", "x=5", "x=7", "x=4"], jawaban: 1 },
    { id: 2, soal: "Jika 2y - 6 = 10, nilai y adalah...", pilihan: ["y=2", "y=6", "y=8", "y=10"], jawaban: 2 },
    { id: 3, soal: "Tentukan x: 5x = 35 - 10", pilihan: ["x=4", "x=5", "x=6", "x=7"], jawaban: 1 },
  ],
}
