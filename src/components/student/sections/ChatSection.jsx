/**
 * SR MVP — ChatSection (REVISED — Full Dummy Flow)
 * src/components/student/sections/ChatSection.jsx
 *
 * Alur:
 *  1. Izin kamera
 *  2. Chat dimulai di level MAPEL — AI greets + tampilkan daftar topik sebagai pesan chat
 *  3. Siswa klik/pilih topik → AI deliver materi topik itu
 *  4. Topik tersimpan di riwayat left panel
 *  5. Jika kembali ke mapel yang sama: greet sesuaikan + tampilkan riwayat topik
 *
 * Format Konten & Quiz: slide-out CENTER MODAL (bukan right sidebar overlay)
 * - Bisa generate ulang, riwayat tersimpan
 * - Quiz: bisa diulang, riwayat tersimpan
 */
import { useState, useRef, useEffect } from 'react';
import { Btn, Card, Divider } from '../../shared/UI';
import { C } from '../../../styles/tokens';
import { CONF_TYPES, SUBJECTS } from '../../../data/masterData';

/* ─────────────────────────────────────────────────────────────────── */
const makeKey = (mapelId, sub) => `${mapelId}__${sub}`;
const renderText = (text) => text.split('\n').map((line, i, arr) => (
  <p key={i} style={{ marginBottom: i < arr.length - 1 ? 5 : 0, lineHeight: 1.6 }}
    dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
));

/* ═══════════════ QUIZ BANK (10 soal per topik) ══════════════════ */
const QUIZ_BANK = {
  /* ── Matematika ── */
  'mat__Aljabar Dasar': [
    { soal: 'Sederhanakan: 3a + 2b + 5a − b', pilihan: ['8a+b', '8a−b', '8a+3b', '6a+b'], jawaban: 0 },
    { soal: 'Nilai x jika 4x = 28 adalah', pilihan: ['5', '6', '7', '8'], jawaban: 2 },
    { soal: 'Bentuk aljabar dari "dua kali x dikurangi 3" adalah', pilihan: ['2x−3', '3−2x', '2x+3', 'x−6'], jawaban: 0 },
    { soal: 'Koefisien dari 7y² adalah', pilihan: ['y', '2', '7', '7y'], jawaban: 2 },
    { soal: 'Suku-suku sejenis dari 3x²+2y+5x²−y adalah', pilihan: ['3x²&5x²; 2y&−y', '3x² & 2y', '5x² & −y', 'Tidak ada'], jawaban: 0 },
    { soal: 'Hasil dari (3x+2)+(5x−4) adalah', pilihan: ['8x−2', '8x+2', '8x−6', '2x−2'], jawaban: 0 },
    { soal: 'Jika a=3, nilai 4a²−2a adalah', pilihan: ['28', '30', '36', '42'], jawaban: 1 },
    { soal: 'Bentuk paling sederhana dari 6m/3 adalah', pilihan: ['2m', '3m', 'm', '6'], jawaban: 0 },
    { soal: 'Hasil dari 2(x+4)−3(x−1) adalah', pilihan: ['−x+11', '−x+5', '5x+11', 'x+11'], jawaban: 0 },
    { soal: 'Jika 3x+6=18, maka x =', pilihan: ['2', '4', '6', '8'], jawaban: 1 },
  ],
  'mat__Persamaan Linear': [
    { soal: 'Selesaikan: 3x + 9 = 24', pilihan: ['x=3', 'x=5', 'x=7', 'x=4'], jawaban: 1 },
    { soal: 'Jika 2y − 6 = 10, maka y =', pilihan: ['y=2', 'y=6', 'y=8', 'y=10'], jawaban: 2 },
    { soal: 'Tentukan x: 5x = 35 − 10', pilihan: ['x=4', 'x=5', 'x=6', 'x=7'], jawaban: 1 },
    { soal: 'Selesaikan: x/4 + 3 = 7', pilihan: ['x=8', 'x=10', 'x=16', 'x=12'], jawaban: 2 },
    { soal: '4x − 8 = 2x + 6, maka x =', pilihan: ['x=5', 'x=7', 'x=9', 'x=11'], jawaban: 1 },
    { soal: '7x − 3 = 4x + 12, maka x =', pilihan: ['x=3', 'x=4', 'x=5', 'x=6'], jawaban: 2 },
    { soal: 'Nilai x pada 2(x+3) = 14 adalah', pilihan: ['x=2', 'x=4', 'x=6', 'x=8'], jawaban: 1 },
    { soal: 'Tentukan x: x/3 − 2 = 4', pilihan: ['x=12', 'x=18', 'x=6', 'x=9'], jawaban: 1 },
    { soal: '5x + 10 = 30, maka x =', pilihan: ['x=2', 'x=4', 'x=6', 'x=8'], jawaban: 1 },
    { soal: '3(2x − 1) = 15, maka x =', pilihan: ['x=2', 'x=3', 'x=4', 'x=5'], jawaban: 1 },
  ],
  'mat__Fungsi Kuadrat': [
    { soal: 'Bentuk umum fungsi kuadrat adalah', pilihan: ['ax+b=0', 'ax²+bx+c', 'ax³+bx', 'a/x+b'], jawaban: 1 },
    { soal: 'Akar dari x²−5x+6=0 adalah', pilihan: ['x=2 & x=3', 'x=1 & x=6', 'x=−2 & x=−3', 'x=2 & x=−3'], jawaban: 0 },
    { soal: 'Titik puncak parabola y=x²−4x+3 adalah', pilihan: ['(2,−1)', '(−2,1)', '(2,1)', '(−2,−1)'], jawaban: 0 },
    { soal: 'Diskriminan dari 2x²+3x+1=0 adalah', pilihan: ['D=1', 'D=17', 'D=−1', 'D=9'], jawaban: 0 },
    { soal: 'Jika D>0 maka persamaan kuadrat memiliki', pilihan: ['Tidak ada akar', 'Dua akar kembar', 'Dua akar berbeda', 'Satu akar'], jawaban: 2 },
    { soal: 'Nilai a pada x²+2x−8=0 adalah', pilihan: ['a=1', 'a=2', 'a=−8', 'a=0'], jawaban: 0 },
    { soal: 'Akar x²+4x+4=0 adalah', pilihan: ['x=−2 (kembar)', 'x=2 (kembar)', 'x=2 & −2', 'x=−4'], jawaban: 0 },
    { soal: 'Persamaan kuadrat dengan akar 3 & −1 adalah', pilihan: ['x²−2x−3=0', 'x²+2x−3=0', 'x²−2x+3=0', 'x²+2x+3=0'], jawaban: 0 },
    { soal: 'Grafik y=x²+1 berpotongan sumbu-x sebanyak', pilihan: ['0 kali', '1 kali', '2 kali', '3 kali'], jawaban: 0 },
    { soal: 'Untuk y=−x²+4, nilai maksimum y adalah', pilihan: ['4', '−4', '0', '∞'], jawaban: 0 },
  ],
  'mat__Statistika': [
    { soal: 'Mean dari 4, 7, 8, 6, 5 adalah', pilihan: ['5', '6', '7', '8'], jawaban: 1 },
    { soal: 'Modus dari 3,3,4,5,5,5,6 adalah', pilihan: ['3', '4', '5', '6'], jawaban: 2 },
    { soal: 'Median dari 2,4,6,8,10 adalah', pilihan: ['4', '5', '6', '7'], jawaban: 2 },
    { soal: 'Jangkauan (range) dari 3,7,1,9,5 adalah', pilihan: ['6', '7', '8', '9'], jawaban: 2 },
    { soal: 'Data 2,5,3,7,8 diurutkan menjadi', pilihan: ['2,3,5,7,8', '2,5,3,7,8', '8,7,5,3,2', '3,2,5,7,8'], jawaban: 0 },
    { soal: 'Varians mengukur', pilihan: ['Nilai tengah', 'Sebaran data', 'Nilai terbesar', 'Frekuensi data'], jawaban: 1 },
    { soal: 'Histogram menampilkan data dalam bentuk', pilihan: ['Garis', 'Lingkaran', 'Batang', 'Titik-titik'], jawaban: 2 },
    { soal: 'Simpangan baku adalah', pilihan: ['Kuadrat varians', 'Akar varians', 'Setengah jangkauan', 'Rata-rata absolut'], jawaban: 1 },
    { soal: 'Mean dari 10, 20, 30 adalah', pilihan: ['15', '20', '25', '30'], jawaban: 1 },
    { soal: 'Kuartil bawah (Q1) berada pada posisi', pilihan: ['25% data', '50% data', '75% data', '100% data'], jawaban: 0 },
  ],
  /* ── IPA ── */
  'ipa__Ekosistem': [
    { soal: 'Organisme yang membuat makanan sendiri disebut', pilihan: ['Konsumen', 'Produsen', 'Dekomposer', 'Predator'], jawaban: 1 },
    { soal: 'Contoh organisme dekomposer adalah', pilihan: ['Singa', 'Padi', 'Jamur', 'Harimau'], jawaban: 2 },
    { soal: 'Rantai makanan dimulai dari', pilihan: ['Herbivora', 'Produsen', 'Karnivora', 'Omnivora'], jawaban: 1 },
    { soal: 'Interaksi saling menguntungkan disebut', pilihan: ['Parasitisme', 'Komensalisme', 'Mutualisme', 'Predasi'], jawaban: 2 },
    { soal: 'Energi dalam ekosistem mengalir dari', pilihan: ['Konsumen ke produsen', 'Produsen ke konsumen', 'Dekomposer ke produsen', 'Konsumen ke dekomposer'], jawaban: 1 },
    { soal: 'Ekosistem buatan contohnya adalah', pilihan: ['Hutan hujan', 'Sawah', 'Terumbu karang', 'Padang rumput'], jawaban: 1 },
    { soal: 'Faktor abiotik meliputi', pilihan: ['Tumbuhan & hewan', 'Suhu & cahaya', 'Bakteri & jamur', 'Hewan & mineral'], jawaban: 1 },
    { soal: 'Hewan yang memakan produsen disebut', pilihan: ['Karnivora', 'Omnivora', 'Herbivora', 'Dekomposer'], jawaban: 2 },
    { soal: 'Piramida makanan menunjukkan', pilihan: ['Jumlah spesies', 'Aliran energi', 'Kecepatan reproduksi', 'Usia organisme'], jawaban: 1 },
    { soal: 'Pencemaran air dapat menyebabkan', pilihan: ['Ekosistem lebih stabil', 'Keragaman hayati naik', 'Kepunahan organisme air', 'Pertumbuhan produsen'], jawaban: 2 },
  ],
  'ipa__Sel & Jaringan': [
    { soal: 'Organel sel yang menghasilkan energi disebut', pilihan: ['Ribosom', 'Mitokondria', 'Nukleus', 'Vakuola'], jawaban: 1 },
    { soal: 'Dinding sel hanya ditemukan pada sel', pilihan: ['Hewan', 'Tumbuhan', 'Manusia', 'Bakteri dan tumbuhan'], jawaban: 3 },
    { soal: 'Proses fotosintesis berlangsung di', pilihan: ['Mitokondria', 'Ribosom', 'Kloroplas', 'Vakuola'], jawaban: 2 },
    { soal: 'Membran sel berfungsi sebagai', pilihan: ['Tempat sintesis protein', 'Pengendali masuk-keluarnya zat', 'Tempat fotosintesis', 'Penyimpan energi'], jawaban: 1 },
    { soal: 'Jaringan yang terdiri dari sel-sel yang terus membelah disebut', pilihan: ['Meristematik', 'Epidermis', 'Parenkim', 'Sklerenkim'], jawaban: 0 },
    { soal: 'Sel eukariotik berbeda dari prokariotik karena', pilihan: ['Tidak memiliki DNA', 'Memiliki membran inti', 'Tidak memiliki membran', 'Lebih kecil'], jawaban: 1 },
    { soal: 'Ribosom berfungsi untuk', pilihan: ['Respirasi sel', 'Sintesis protein', 'Pembelahan sel', 'Penyimpanan energi'], jawaban: 1 },
    { soal: 'Darah termasuk jenis jaringan', pilihan: ['Epitel', 'Ikat', 'Otot', 'Saraf'], jawaban: 1 },
    { soal: 'Vakuola pada sel tumbuhan berfungsi untuk', pilihan: ['Fotosintesis', 'Respirasi', 'Menyimpan cadangan makanan dan air', 'Sintesis protein'], jawaban: 2 },
    { soal: 'Jaringan yang menghantarkan impuls listrik disebut', pilihan: ['Jaringan otot', 'Jaringan ikat', 'Jaringan saraf', 'Jaringan epitel'], jawaban: 2 },
  ],
  'ipa__Gerak Lurus': [
    { soal: 'Kecepatan rata-rata dihitung dengan rumus', pilihan: ['v=s/t', 'v=t/s', 'v=s×t', 'v=s²/t'], jawaban: 0 },
    { soal: 'GLB singkatan dari', pilihan: ['Gerak Lurus Beraturan', 'Gerak Lambat Berulang', 'Gerak Lurus Berjalan', 'Gerakan Linear Besar'], jawaban: 0 },
    { soal: 'Pada GLBB, yang berubah secara konstan adalah', pilihan: ['Posisi', 'Kecepatan', 'Percepatan', 'Jarak'], jawaban: 2 },
    { soal: 'Percepatan gravitasi bumi sekitar', pilihan: ['5 m/s²', '9,8 m/s²', '12 m/s²', '3 m/s²'], jawaban: 1 },
    { soal: 'Jika kecepatan awal 0, percepatan 4 m/s², setelah 3 s kecepatannya', pilihan: ['4 m/s', '8 m/s', '12 m/s', '16 m/s'], jawaban: 2 },
    { soal: 'Grafik v-t untuk GLB berbentuk', pilihan: ['Garis miring naik', 'Garis horizontal', 'Kurva melengkung', 'Garis turun'], jawaban: 1 },
    { soal: 'Satuan percepatan adalah', pilihan: ['m/s', 'm/s²', 'kg·m/s', 'N/m'], jawaban: 1 },
    { soal: 'Jarak tempuh dalam t detik pada GLB dengan kecepatan v adalah', pilihan: ['s=v/t', 's=v·t', 's=v+t', 's=v²·t'], jawaban: 1 },
    { soal: 'Benda jatuh bebas mengalami', pilihan: ['GLB', 'GLBB diperlambat', 'GLBB dipercepat', 'Gerak melingkar'], jawaban: 2 },
    { soal: 'Kelajuan dan kecepatan berbeda karena kecepatan memiliki', pilihan: ['Nilai lebih besar', 'Arah gerak', 'Satuan berbeda', 'Tidak ada perbedaan'], jawaban: 1 },
  ],
  'ipa__Energi & Kalor': [
    { soal: 'Satuan energi dalam SI adalah', pilihan: ['Watt', 'Joule', 'Newton', 'Kalori'], jawaban: 1 },
    { soal: 'Kalor yang diperlukan untuk menaikkan suhu benda bergantung pada', pilihan: ['Warna benda', 'Massa dan jenis benda', 'Bentuk benda', 'Posisi benda'], jawaban: 1 },
    { soal: 'Rumus kalor Q = m × c × ΔT, c adalah', pilihan: ['Massa', 'Kalor jenis', 'Perubahan suhu', 'Kapasitas kalor'], jawaban: 1 },
    { soal: 'Perpindahan kalor melalui zat perantara yang tidak ikut pindah disebut', pilihan: ['Konduksi', 'Konveksi', 'Radiasi', 'Evaporasi'], jawaban: 0 },
    { soal: 'Air mendidih pada suhu', pilihan: ['90°C', '95°C', '100°C', '110°C'], jawaban: 2 },
    { soal: 'Energi potensial gravitasi dirumuskan sebagai', pilihan: ['Ep=mv', 'Ep=mgh', 'Ep=½mv²', 'Ep=Fxs'], jawaban: 1 },
    { soal: 'Hukum kekekalan energi menyatakan', pilihan: ['Energi dapat diciptakan', 'Energi dapat dimusnahkan', 'Energi berubah bentuk, jumlah tetap', 'Energi selalu bertambah'], jawaban: 2 },
    { soal: 'Konveksi umumnya terjadi pada', pilihan: ['Benda padat', 'Zat cair dan gas', 'Ruang hampa', 'Hanya pada logam'], jawaban: 1 },
    { soal: 'Lebur terjadi pada perubahan wujud dari', pilihan: ['Cair ke gas', 'Padat ke cair', 'Gas ke cair', 'Cair ke padat'], jawaban: 1 },
    { soal: 'Radiasi panas dapat merambat melalui', pilihan: ['Hanya udara', 'Hanya air', 'Ruang hampa', 'Hanya benda padat'], jawaban: 2 },
  ],
  /* ── B. Indonesia ── */
  'bin__Teks Argumentasi': [
    { soal: 'Teks argumentasi bertujuan untuk', pilihan: ['Menghibur pembaca', 'Meyakinkan pembaca dengan bukti', 'Menceritakan kejadian', 'Mendeskripsikan objek'], jawaban: 1 },
    { soal: 'Bagian teks argumentasi yang berisi pendapat utama disebut', pilihan: ['Argumen', 'Tesis', 'Penegasan', 'Simpulan'], jawaban: 1 },
    { soal: 'Argumen yang baik harus didukung oleh', pilihan: ['Opini pribadi', 'Kata-kata emosional', 'Data & fakta', 'Perbandingan semata'], jawaban: 2 },
    { soal: 'Kata penghubung yang menunjukkan sebab-akibat adalah', pilihan: ['Dan, serta', 'Karena, sehingga', 'Tetapi, namun', 'Atau, maupun'], jawaban: 1 },
    { soal: 'Struktur teks argumentasi yang benar adalah', pilihan: ['Tesis→Argumen→Penegasan', 'Argumen→Tesis→Penegasan', 'Penegasan→Tesis→Argumen', 'Tesis→Penegasan→Argumen'], jawaban: 0 },
    { soal: 'Kalimat "Meskipun mahal, produk ini berkualitas tinggi" adalah contoh kalimat', pilihan: ['Perbandingan', 'Sebab-akibat', 'Perlawanan (konsesi)', 'Simpulan'], jawaban: 2 },
    { soal: 'Fakta dalam teks argumentasi berfungsi untuk', pilihan: ['Memperindah bahasa', 'Menghibur pembaca', 'Memperkuat pendapat', 'Mempersingkat teks'], jawaban: 2 },
    { soal: 'Paragraf penutup teks argumentasi berisi', pilihan: ['Argumen baru', 'Penegasan kembali tesis', 'Data tambahan', 'Pertanyaan retoris'], jawaban: 1 },
    { soal: 'Kata "oleh karena itu" termasuk konjungsi', pilihan: ['Koordinatif', 'Subordinatif', 'Kausalitas/kesimpulan', 'Temporal'], jawaban: 2 },
    { soal: 'Pernyataan "Semua siswa harus belajar keras" termasuk jenis kalimat', pilihan: ['Fakta', 'Opini', 'Pertanyaan', 'Perintah'], jawaban: 1 },
  ],
  'bin__Puisi': [
    { soal: 'Rima pada akhir baris puisi disebut', pilihan: ['Ritme', 'Rima akhir', 'Diksi', 'Irama'], jawaban: 1 },
    { soal: 'Pilihan kata yang indah dalam puisi disebut', pilihan: ['Rima', 'Irama', 'Diksi', 'Majas'], jawaban: 2 },
    { soal: 'Majas yang membandingkan secara langsung tanpa kata pembanding disebut', pilihan: ['Simile', 'Metafora', 'Personifikasi', 'Hiperbola'], jawaban: 1 },
    { soal: 'Puisi yang tidak terikat aturan baku disebut', pilihan: ['Puisi lama', 'Soneta', 'Puisi bebas', 'Pantun'], jawaban: 2 },
    { soal: 'Bait dalam puisi terdiri dari beberapa', pilihan: ['Kata', 'Baris', 'Paragraf', 'Stanza'], jawaban: 1 },
    { soal: 'Personifikasi adalah majas yang', pilihan: ['Melebih-lebihkan', 'Menyamakan benda dengan manusia', 'Membandingkan dua hal', 'Mengulang kata'], jawaban: 1 },
    { soal: '"Bulan tersenyum di langit malam" menggunakan majas', pilihan: ['Hiperbola', 'Simile', 'Personifikasi', 'Metafora'], jawaban: 2 },
    { soal: 'Pantun memiliki ciri khas yaitu', pilihan: ['4 baris: 2 sampiran & 2 isi', '3 baris berima', 'Bebas tanpa aturan', '6 baris berirama'], jawaban: 0 },
    { soal: 'Nada dan suasana puisi dipengaruhi oleh', pilihan: ['Hanya diksi', 'Diksi, irama & rima', 'Hanya panjang baris', 'Jumlah bait'], jawaban: 1 },
    { soal: 'Fungsi utama puisi adalah', pilihan: ['Memberi informasi akurat', 'Mengekspresikan perasaan & keindahan bahasa', 'Membuat laporan', 'Mendeskripsikan objek secara detail'], jawaban: 1 },
  ],
  'bin__Surat Dinas': [
    { soal: 'Surat dinas digunakan untuk keperluan', pilihan: ['Pribadi', 'Keluarga', 'Kedinasan/resmi', 'Persahabatan'], jawaban: 2 },
    { soal: 'Bagian surat yang berisi tujuan penulisan surat disebut', pilihan: ['Kepala surat', 'Isi surat', 'Perihal', 'Lampiran'], jawaban: 2 },
    { soal: 'Bahasa yang digunakan dalam surat dinas adalah', pilihan: ['Santai dan informal', 'Baku dan resmi', 'Gaul dan kekinian', 'Puitis dan metaforis'], jawaban: 1 },
    { soal: 'Nomor surat pada surat dinas terletak di bagian', pilihan: ['Bawah surat', 'Isi surat', 'Kepala surat', 'Penutup'], jawaban: 2 },
    { soal: 'Tembusan pada surat dinas berarti', pilihan: ['Penerima utama surat', 'Pengirim surat', 'Pihak lain yang perlu tahu isi surat', 'Lampiran surat'], jawaban: 2 },
    { soal: 'Format penulisan tanggal yang benar pada surat dinas adalah', pilihan: ['1/1/2025', 'Januari 1, 2025', '1 Januari 2025', '01-01-2025'], jawaban: 2 },
    { soal: 'Salam penutup surat dinas yang tepat adalah', pilihan: ['Salam rindu', 'Wassalamu alaikum', 'Hormat kami', 'Dengan salam'], jawaban: 2 },
    { soal: 'Kop surat berisi', pilihan: ['Isi pokok surat', 'Identitas lembaga pengirim', 'Nama penerima', 'Perihal surat'], jawaban: 1 },
    { soal: 'Kata sapaan yang tepat dalam surat dinas kepada seseorang adalah', pilihan: ['Hey kamu', 'Dengan hormat', 'Halo Bapak', 'Sob'], jawaban: 1 },
    { soal: 'Lampiran dalam surat berarti', pilihan: ['Penutup surat', 'Dokumen yang disertakan', 'Tembusan surat', 'Nomor surat'], jawaban: 1 },
  ],
  'bin__Debat': [
    { soal: 'Dalam debat, pihak yang mendukung pernyataan disebut', pilihan: ['Oposisi', 'Tim netral', 'Afirmatif/Pro', 'Moderator'], jawaban: 2 },
    { soal: 'Tugas moderator dalam debat adalah', pilihan: ['Memenangkan perdebatan', 'Memimpin dan mengatur jalannya debat', 'Menilai argumen', 'Menyatakan pemenang'], jawaban: 1 },
    { soal: 'Argumen dalam debat harus didasarkan pada', pilihan: ['Emosi semata', 'Fakta, data, dan logika', 'Opini pribadi', 'Asumsi'], jawaban: 1 },
    { soal: 'Sanggahan dalam debat disebut', pilihan: ['Afirmasi', 'Rebuttal/bantahan', 'Simpulan', 'Pernyataan awal'], jawaban: 1 },
    { soal: 'Mosi dalam debat adalah', pilihan: ['Pendapat pembicara pertama', 'Topik atau pernyataan yang diperdebatkan', 'Peraturan debat', 'Kesimpulan akhir'], jawaban: 1 },
    { soal: 'Etika dalam berdebat yang baik adalah', pilihan: ['Memotong pembicaraan lawan', 'Berbicara lantang saat lawan bicara', 'Mendengarkan dan merespons dengan sopan', 'Mengabaikan argumen lawan'], jawaban: 2 },
    { soal: 'Argumen yang efektif dalam debat menggunakan', pilihan: ['Repetisi kata', 'Data, contoh konkret, dan logika', 'Hanya perasaan', 'Bahasa kiasan semata'], jawaban: 1 },
    { soal: 'Tim oposisi bertugas untuk', pilihan: ['Mendukung mosi', 'Menolak dan menyangkal mosi', 'Menilai jalannya debat', 'Mencatat waktu'], jawaban: 1 },
    { soal: 'Cara membuka argumen yang baik dalam debat adalah', pilihan: ['Langsung menyerang lawan', 'Menyatakan posisi & argumen utama', 'Bertanya pada moderator', 'Diam menunggu'], jawaban: 1 },
    { soal: 'Simpulan debat berisi', pilihan: ['Argumen baru', 'Rangkuman posisi dan argumen kunci', 'Pertanyaan untuk lawan', 'Permohonan maaf'], jawaban: 1 },
  ],
  /* ── IPS ── */
  'ips__Peradaban Awal': [
    { soal: 'Manusia purba yang pertama berjalan tegak disebut', pilihan: ['Homo sapiens', 'Homo erectus', 'Meganthropus', 'Pithecanthropus'], jawaban: 1 },
    { soal: 'Periode sejarah sebelum mengenal tulisan disebut', pilihan: ['Prasejarah', 'Sejarah awal', 'Era modern', 'Zaman klasik'], jawaban: 0 },
    { soal: 'Peradaban tertua di dunia berkembang di lembah sungai', pilihan: ['Nil & Tigris-Eufrat', 'Amazon & Congo', 'Rhine & Danube', 'Thames & Seine'], jawaban: 0 },
    { soal: 'Tulisan tertua yang dikenal adalah', pilihan: ['Huruf latin', 'Aksara Arab', 'Kuneiform (Mesopotamia)', 'Hanzi (China)'], jawaban: 2 },
    { soal: 'Manusia mulai bercocok tanam pada zaman', pilihan: ['Paleolitikum', 'Mesolitikum', 'Neolitikum', 'Megalitikum'], jawaban: 2 },
    { soal: 'Piramida Giza dibangun oleh peradaban', pilihan: ['Mesopotamia', 'Mesir Kuno', 'Yunani Kuno', 'Roma'], jawaban: 1 },
    { soal: 'Food gathering berarti manusia hidup dengan cara', pilihan: ['Bercocok tanam', 'Beternak', 'Mengumpulkan makanan dari alam', 'Berdagang'], jawaban: 2 },
    { soal: 'Menhir adalah peninggalan zaman batu berupa', pilihan: ['Gua hunian', 'Batu tegak berdiri', 'Perkakas batu halus', 'Lukisan gua'], jawaban: 1 },
    { soal: 'Homo sapiens artinya', pilihan: ['Manusia kera', 'Manusia berdiri', 'Manusia cerdas', 'Manusia besar'], jawaban: 2 },
    { soal: 'Peradaban Mesopotamia berkembang di wilayah', pilihan: ['Mesir', 'Irak kini (antara Tigris-Eufrat)', 'India', 'China'], jawaban: 1 },
  ],
  'ips__Kerajaan Nusantara': [
    { soal: 'Kerajaan Hindu tertua di Nusantara adalah', pilihan: ['Majapahit', 'Sriwijaya', 'Kutai', 'Mataram Kuno'], jawaban: 2 },
    { soal: 'Kerajaan maritim terbesar di Nusantara adalah', pilihan: ['Kutai', 'Sriwijaya', 'Majapahit', 'Demak'], jawaban: 1 },
    { soal: 'Gajah Mada dikenal karena', pilihan: ['Mendirikan Majapahit', 'Sumpah Palapa untuk menyatukan Nusantara', 'Memimpin Sriwijaya', 'Mengalahkan Mongol'], jawaban: 1 },
    { soal: 'Kerajaan Majapahit mencapai puncak kejayaan di bawah', pilihan: ['Hayam Wuruk & Gajah Mada', 'Ken Arok', 'Raden Wijaya', 'Tribhuwana Tunggadewi'], jawaban: 0 },
    { soal: 'Agama Islam masuk ke Nusantara sekitar abad', pilihan: ['5 M', '10 M', '13 M', '17 M'], jawaban: 2 },
    { soal: 'Kerajaan Demak adalah kerajaan Islam pertama di', pilihan: ['Sumatera', 'Kalimantan', 'Jawa', 'Sulawesi'], jawaban: 2 },
    { soal: 'Prasasti Yupa adalah peninggalan dari kerajaan', pilihan: ['Sriwijaya', 'Kutai', 'Tarumanegara', 'Majapahit'], jawaban: 1 },
    { soal: 'Borobudur adalah peninggalan kerajaan', pilihan: ['Majapahit', 'Sriwijaya', 'Mataram Budha/Syailendra', 'Demak'], jawaban: 2 },
    { soal: 'Raja Purnawarman merupakan raja dari kerajaan', pilihan: ['Kutai', 'Tarumanegara', 'Sriwijaya', 'Kalingga'], jawaban: 1 },
    { soal: 'Wali Songo adalah sebutan untuk', pilihan: ['9 raja Jawa', '9 ulama penyebar Islam di Jawa', '9 pahlawan kemerdekaan', '9 kesultanan'], jawaban: 1 },
  ],
  'ips__Ekonomi Dasar': [
    { soal: 'Ilmu ekonomi mempelajari', pilihan: ['Sejarah uang', 'Cara manusia memenuhi kebutuhan dengan sumber daya terbatas', 'Hukum perdagangan', 'Sistem pemerintahan'], jawaban: 1 },
    { soal: 'Kebutuhan primer contohnya adalah', pilihan: ['Ponsel', 'Mobil', 'Makanan & pakaian', 'Hiburan'], jawaban: 2 },
    { soal: 'Hukum permintaan menyatakan bahwa', pilihan: ['Harga naik → permintaan naik', 'Harga naik → permintaan turun', 'Harga naik → penawaran turun', 'Harga naik → penawaran naik'], jawaban: 1 },
    { soal: 'Pasar adalah tempat terjadinya', pilihan: ['Produksi barang', 'Transaksi antara penjual & pembeli', 'Penyimpanan barang', 'Distribusi barang'], jawaban: 1 },
    { soal: 'Uang kartal adalah', pilihan: ['Cek & giro', 'Uang kertas & logam', 'Deposito', 'Obligasi'], jawaban: 1 },
    { soal: 'Inflasi berarti', pilihan: ['Harga barang turun terus', 'Nilai uang naik', 'Kenaikan harga umum secara terus-menerus', 'Pertumbuhan ekonomi'], jawaban: 2 },
    { soal: 'Faktor produksi meliputi', pilihan: ['Tanah, modal, tenaga kerja, kewirausahaan', 'Uang, mesin, gudang', 'Ekspor, impor, investasi', 'Harga, permintaan, penawaran'], jawaban: 0 },
    { soal: 'Subsidi adalah', pilihan: ['Pajak tambahan', 'Bantuan pemerintah kepada produsen/konsumen', 'Larangan impor', 'Kenaikan tarif'], jawaban: 1 },
    { soal: 'Titik ekuilibrium pasar adalah saat', pilihan: ['Harga tertinggi', 'Harga terendah', 'Permintaan sama dengan penawaran', 'Penawaran lebih besar dari permintaan'], jawaban: 2 },
    { soal: 'APBN adalah singkatan dari', pilihan: ['Anggaran Pendapatan Belanja Negara', 'Aturan Perbankan Berbasis Nasional', 'Asosiasi Pengusaha Besar Nusantara', 'Administrasi Publik Berbasis Nasional'], jawaban: 0 },
  ],
  'ips__Geografi': [
    { soal: 'Garis khatulistiwa disebut juga', pilihan: ['Meridian', 'Equator', 'Paralel', 'Lintang Utara'], jawaban: 1 },
    { soal: 'Garis bujur digunakan untuk menentukan', pilihan: ['Iklim', 'Waktu & zona waktu', 'Ketinggian', 'Kelembapan'], jawaban: 1 },
    { soal: 'Indonesia terletak di antara dua samudra yaitu', pilihan: ['Atlantik & Hindia', 'Hindia & Pasifik', 'Artik & Pasifik', 'Atlantik & Pasifik'], jawaban: 1 },
    { soal: 'Iklim tropis ditandai dengan', pilihan: ['Suhu dingin sepanjang tahun', 'Curah hujan tinggi & suhu panas stabil', 'Musim salju tiap tahun', 'Padang gurun luas'], jawaban: 1 },
    { soal: 'Peta topografi menampilkan', pilihan: ['Batas negara', 'Ketinggian & kontur permukaan bumi', 'Jalur perdagangan', 'Sebaran penduduk'], jawaban: 1 },
    { soal: 'Skala peta 1:100.000 berarti', pilihan: ['1 cm di peta = 1 km nyata', '1 cm di peta = 100 km nyata', '1 m di peta = 100 km nyata', '1 mm di peta = 1 km nyata'], jawaban: 0 },
    { soal: 'Gempa yang disebabkan pergeseran lempeng bumi disebut', pilihan: ['Gempa vulkanik', 'Gempa tektonik', 'Gempa runtuhan', 'Gempa buatan'], jawaban: 1 },
    { soal: 'Erosi adalah', pilihan: ['Penumpukan sedimen', 'Pengikisan tanah oleh air/angin', 'Pelapukan batu', 'Letusan gunung'], jawaban: 1 },
    { soal: 'Curah hujan tinggi dan hutan lebat khas wilayah', pilihan: ['Gurun', 'Sabana', 'Tropis', 'Tundra'], jawaban: 2 },
    { soal: 'Jumlah penduduk yang besar di suatu wilayah kecil menunjukkan', pilihan: ['Kepadatan penduduk rendah', 'Kepadatan penduduk tinggi', 'Laju pertumbuhan negatif', 'Migrasi tinggi'], jawaban: 1 },
  ],
};

const getQuiz = (key) => QUIZ_BANK[key] || Array.from({ length: 10 }, (_, i) => ({
  soal: `Soal ${i + 1}: Pilih jawaban yang paling tepat untuk topik ini.`,
  pilihan: ['A: Sangat paham', 'B: Cukup paham', 'C: Kurang paham', 'D: Perlu belajar lagi'], jawaban: 0,
}));

/* ═══════════════ MATERI per topik ════════════════════════════════ */
const MATERI_CONTENT = {
  'mat__Aljabar Dasar': `**Aljabar Dasar — Matematika** 📐\n\nAljabar adalah cabang matematika yang menggunakan simbol (variabel) untuk merepresentasikan angka.\n\n**Konsep Utama:**\n• **Variabel**: simbol seperti x, y, a yang mewakili bilangan\n• **Konstanta**: angka tetap seperti 3, -7, 2.5\n• **Koefisien**: angka yang mengalikan variabel (misal: pada 5x, koefisiennya adalah 5)\n• **Suku sejenis**: suku yang memiliki variabel & pangkat sama\n\n**Contoh Penyederhanaan:**\n3a + 2b + 5a − b = (3a+5a) + (2b−b) = **8a + b**\n\nAda pertanyaan tentang topik ini?`,

  'mat__Persamaan Linear': `**Persamaan Linear Satu Variabel** 📐\n\nPersamaan linear adalah persamaan berderajat satu dengan bentuk umum **ax + b = c**.\n\n**Langkah penyelesaian:**\n1. Pindahkan konstanta ke ruas kanan (ubah tanda)\n2. Bagi kedua ruas dengan koefisien variabel\n\n**Contoh:**\n3x + 6 = 18\n→ 3x = 18 − 6 = 12\n→ x = 12/3 = **4** ✓\n\n**Coba soal ini:** 2x + 7 = 15, berapa x?\n\nMau latihan lebih banyak soal?`,

  'mat__Fungsi Kuadrat': `**Fungsi Kuadrat** 📐\n\nFungsi kuadrat berbentuk **f(x) = ax² + bx + c** (a ≠ 0).\n\n**Konsep penting:**\n• Grafik berbentuk **parabola** — terbuka ke atas (a>0) atau ke bawah (a<0)\n• **Titik puncak (vertex)**: x = −b/2a\n• **Diskriminan D = b² − 4ac**:\n  - D > 0: 2 akar berbeda\n  - D = 0: 2 akar kembar\n  - D < 0: tidak ada akar real\n\n**Contoh:** x² − 5x + 6 = 0\n→ (x−2)(x−3) = 0 → x = 2 atau x = 3`,

  'mat__Statistika': `**Statistika** 📐\n\nStatistika mempelajari cara mengumpulkan, mengolah, dan menyajikan data.\n\n**Ukuran pemusatan data:**\n• **Mean (rata-rata)**: jumlah semua data ÷ banyak data\n• **Median**: nilai tengah data terurut\n• **Modus**: nilai yang paling sering muncul\n\n**Contoh:**\nData: 4, 7, 8, 6, 5\n→ Mean = (4+7+8+6+5)/5 = 30/5 = **6**\n→ Median = 6 (setelah diurutkan: 4,5,6,7,8)\n→ Modus = tidak ada (semua muncul 1x)`,

  'ipa__Ekosistem': `**Ekosistem** 🔬\n\nEkosistem adalah kesatuan makhluk hidup (biotik) dengan lingkungannya (abiotik) yang saling berinteraksi.\n\n**Komponen:**\n• **Produsen**: tumbuhan hijau (fotosintesis)\n• **Konsumen**: hewan yang memakan produsen/konsumen lain\n• **Dekomposer**: jamur & bakteri pengurai\n\n**Rantai makanan:**\nRumput → Belalang → Katak → Ular → Elang\n\n**Jenis interaksi:**\n• Mutualisme: saling menguntungkan\n• Komensalisme: satu untung, satu netral\n• Parasitisme: satu untung, satu dirugikan`,

  'ipa__Sel & Jaringan': `**Sel & Jaringan** 🔬\n\nSel adalah unit terkecil kehidupan.\n\n**Organel penting:**\n• **Nukleus**: pengendali sel, menyimpan DNA\n• **Mitokondria**: menghasilkan energi (ATP)\n• **Kloroplas**: tempat fotosintesis (sel tumbuhan)\n• **Ribosom**: sintesis protein\n• **Membran sel**: mengatur keluar-masuknya zat\n\n**Perbedaan sel hewan vs tumbuhan:**\nSel tumbuhan: dinding sel + kloroplas + vakuola besar\nSel hewan: tidak ada dinding sel, sentriol ada\n\n**Jaringan** = kumpulan sel sejenis yang bekerja bersama`,

  'ipa__Gerak Lurus': `**Gerak Lurus** 🔬\n\nGerak lurus dibagi dua:\n\n**GLB (Gerak Lurus Beraturan):**\n• Kecepatan konstan, percepatan = 0\n• Rumus: s = v × t\n\n**GLBB (Gerak Lurus Berubah Beraturan):**\n• Percepatan konstan (a)\n• Rumus: v = v₀ + a×t\n• Jarak: s = v₀t + ½at²\n\n**Contoh GLBB:**\nMobil dari diam, percepatan 3 m/s². Setelah 4 detik:\nv = 0 + 3×4 = **12 m/s**`,

  'ipa__Energi & Kalor': `**Energi & Kalor** 🔬\n\n**Energi** adalah kemampuan melakukan usaha. Satuan: Joule (J).\n\n**Bentuk energi:** mekanik, panas, listrik, kimia, nuklir.\n\n**Kalor (Q)** = jenis panas yang berpindah.\nRumus: **Q = m × c × ΔT**\n\n**Perpindahan kalor:**\n• **Konduksi**: melalui zat padat (batang besi)\n• **Konveksi**: melalui aliran fluida (air mendidih)\n• **Radiasi**: tanpa medium (sinar matahari)\n\n**Hukum Kekekalan Energi:** Energi tidak dapat diciptakan atau dimusnahkan, hanya berubah bentuk.`,

  'bin__Teks Argumentasi': `**Teks Argumentasi** 📖\n\nTeks argumentasi bertujuan meyakinkan pembaca dengan pendapat yang didukung fakta & logika.\n\n**Struktur:**\n1. **Tesis**: pernyataan pendapat utama\n2. **Argumen**: bukti, data, fakta pendukung\n3. **Penegasan ulang**: kesimpulan yang memperkuat tesis\n\n**Contoh tesis:** "Penggunaan gadget berlebihan berdampak buruk bagi kesehatan mental remaja."\n\n**Tips menulis argumen kuat:**\n• Gunakan data statistik\n• Cantumkan sumber yang kredibel\n• Hindari kesalahan logika (fallacy)`,

  'bin__Puisi': `**Puisi** 📖\n\nPuisi adalah karya sastra yang mengutamakan keindahan bahasa.\n\n**Unsur pembangun:**\n• **Diksi**: pilihan kata yang indah dan bermakna\n• **Imaji**: gambaran yang membangkitkan indera\n• **Rima**: persamaan bunyi akhir baris\n• **Irama**: pola tekanan dalam baris\n• **Majas**: gaya bahasa (metafora, personifikasi, dll)\n\n**Jenis majas:**\n• Metafora: "Kau adalah bulan hatiku"\n• Personifikasi: "Angin berbisik lirih"\n• Simile: "Cintanya seperti bintang di langit"\n\nApa pertanyaanmu tentang puisi?`,

  'bin__Surat Dinas': `**Surat Dinas** 📖\n\nSurat dinas adalah surat resmi yang digunakan untuk kepentingan kedinasan/organisasi.\n\n**Struktur surat dinas:**\n1. Kop surat (identitas lembaga)\n2. Nomor surat\n3. Tanggal\n4. Perihal (hal)\n5. Lampiran (jika ada)\n6. Alamat tujuan\n7. Salam pembuka\n8. Isi surat\n9. Salam penutup\n10. Tanda tangan & nama terang\n\n**Ciri khas:** bahasa baku, formal, jelas, dan tidak bermakna ganda.`,

  'bin__Debat': `**Debat** 📖\n\nDebat adalah kegiatan saling mempertahankan argumen secara terstruktur.\n\n**Tim dalam debat:**\n• **Afirmatif (Pro)**: mendukung mosi\n• **Oposisi (Kontra)**: menolak mosi\n• **Moderator**: memimpin jalannya debat\n\n**Langkah berdebat yang baik:**\n1. Sampaikan posisi & argumen utama\n2. Dukung dengan data & contoh konkret\n3. Dengarkan argumen lawan dengan seksama\n4. Beri sanggahan (rebuttal) yang logis\n5. Simpulkan posisi di akhir\n\n**Etika debat:** hormati lawan bicara, jangan memotong pembicaraan.`,

  'ips__Peradaban Awal': `**Peradaban Awal Manusia** 🌍\n\nManusia purba berkembang dari jutaan tahun lalu.\n\n**Perkembangan manusia purba di Indonesia:**\n• Meganthropus paleojavanicus (manusia tertua)\n• Pithecanthropus erectus (manusia berdiri)\n• Homo sapiens (manusia cerdas, nenek moyang kita)\n\n**Masa Praaksara (sebelum mengenal tulisan):**\n• Paleolitikum: alat batu kasar, food gathering\n• Mesolitikum: mulai menetap di gua\n• Neolitikum: bercocok tanam, alat batu halus\n• Megalitikum: mendirikan bangunan batu besar\n\n**Peradaban sungai dunia:** Nil (Mesir), Tigris-Eufrat (Mesopotamia), Indus (India), Kuning (China)`,

  'ips__Kerajaan Nusantara': `**Kerajaan-Kerajaan Nusantara** 🌍\n\n**Kerajaan Hindu-Budha:**\n• **Kutai** (400 M) — tertua, di Kalimantan Timur\n• **Tarumanegara** (abad 5) — di Jawa Barat\n• **Sriwijaya** (abad 7–13) — kerajaan maritim besar, di Sumatera\n• **Mataram Kuno** — membangun Borobudur & Prambanan\n• **Majapahit** (1293–1500) — puncak: Hayam Wuruk & Gajah Mada\n\n**Kerajaan Islam:**\n• **Demak** — kerajaan Islam pertama di Jawa\n• **Aceh, Ternate, Tidore, Banten, Mataram Islam**\n\n**Peninggalan penting:** Prasasti Yupa (Kutai), Borobudur (Mataram), Prambanan`,

  'ips__Ekonomi Dasar': `**Ekonomi Dasar** 🌍\n\nIlmu ekonomi mempelajari cara manusia memenuhi kebutuhan dengan sumber daya terbatas.\n\n**Kebutuhan manusia:**\n• Primer: sandang, pangan, papan\n• Sekunder: kendaraan, pendidikan\n• Tersier: wisata, barang mewah\n\n**Hukum permintaan:** harga naik → permintaan turun\n**Hukum penawaran:** harga naik → penawaran naik\n\n**Pasar:** tempat bertemunya penjual & pembeli\n• Pasar konkret: pasar tradisional, mall\n• Pasar abstrak: pasar saham, valuta asing\n\n**Uang:** alat tukar yang diterima umum`,

  'ips__Geografi': `**Geografi** 🌍\n\nGeografi mempelajari bumi dan segala fenomena di atasnya.\n\n**Konsep lokasi:**\n• **Lintang (paralel)**: 0° di khatulistiwa, menentukan iklim\n• **Bujur (meridian)**: 0° di Greenwich, menentukan zona waktu\n\n**Posisi Indonesia:** 6°LU–11°LS, 95°BT–141°BT\n→ Di antara Benua Asia & Australia, Samudra Hindia & Pasifik\n\n**Iklim Indonesia:** tropis — suhu panas, curah hujan tinggi, hutan lebat\n\n**Konsep penting:** peta, skala, proyeksi peta, erosi, sedimentasi, kepadatan penduduk`,
};

const getGreet = (mapelId, mapelLabel, mapelIcon, mapelColor, studiSessions, subMateriContext, source) => {
  const subj = SUBJECTS.find(s => s.id === mapelId);
  const topikList = subj?.subs || [];
  const hasHistory = studiSessions && studiSessions.length > 0;

  // Jika langsung masuk ke topik (dari rekomendasi/search/resume)
  if (subMateriContext) {
    const alreadyStudied = hasHistory && studiSessions.find(s => s.sub === subMateriContext);

    let greetText;
    if (alreadyStudied) {
      // Dari Progress / "Lanjutkan"
      greetText = `Halo lagi, Budi! 👋 Kita lanjutkan belajar **${subMateriContext}** di ${mapelLabel}.\n\nBerikut ringkasan dari sesi sebelumnya — tanya apa saja untuk melanjutkan!`;
    } else if (source === 'pretest') {
      // Dari rekomendasi pretest
      greetText = `Halo Budi! 🎯 Berdasarkan hasil pretestmu, kamu perlu penguatan di **${subMateriContext}** — ${mapelLabel}.\n\nTenang, Mentor AI akan memandu step-by-step. Yuk kita mulai!`;
    } else {
      // Dari search / topik baru
      greetText = `Halo Budi! 😊 Kamu memilih topik **${subMateriContext}** di ${mapelLabel}.\n\nMentor AI siap membantu. Yuk kita belajar bersama!`;
    }

    return [
      {
        id: Date.now(),
        role: 'ai',
        text: greetText,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        team: 'Tim 5',
        // Tidak ada topikList — langsung masuk ke materi
      },
    ];
  }

  // Masuk tanpa topik → tampilkan daftar pilihan
  let intro = '';
  if (hasHistory) {
    const studiedTopics = studiSessions.map(s => s.sub).filter(Boolean);
    const lastTopik = studiedTopics[studiedTopics.length - 1];
    const studiedStr = studiedTopics.length > 1
      ? `${studiedTopics.slice(0, -1).join(', ')}, dan ${lastTopik}`
      : lastTopik;
    intro = `Halo lagi! 👋 Kamu sudah pernah belajar **${studiedStr}** di ${mapelLabel}.\n\nMau melanjutkan topik yang sama atau pilih topik baru? Berikut semua topik yang tersedia:`;
  } else {
    const greetMap = {
      mat: `Halo Budi! 😊 Selamat datang di sesi **Matematika**.\n\nAku Pak Cerdas, Mentor AI yang akan memandu belajarmu. Berikut adalah topik-topik yang tersedia di ${mapelLabel}:`,
      ipa: `Halo Budi! 🔬 Selamat datang di sesi **IPA (Ilmu Pengetahuan Alam)**.\n\nBersama Mentor AI, kita akan menjelajahi dunia sains! Pilih topik yang ingin kamu pelajari:`,
      bin: `Halo Budi! 📖 Selamat datang di sesi **Bahasa Indonesia**.\n\nBahasa adalah jembatan komunikasi kita. Berikut topik yang siap kamu pelajari:`,
      ips: `Halo Budi! 🌍 Selamat datang di sesi **IPS (Ilmu Pengetahuan Sosial)**.\n\nKita akan menjelajahi sejarah, geografi, dan ekonomi bersama! Pilih topik:`,
    };
    intro = greetMap[mapelId] || `Halo Budi! Selamat datang di sesi **${mapelLabel}**.\n\nPilih topik yang ingin kamu pelajari:`;
  }

  return [
    {
      id: Date.now(),
      role: 'ai',
      text: intro,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      team: 'Tim 5',
      topikList: topikList.length > 0 ? topikList : ['Topik belum tersedia'],
    },
  ];
};

const getTopikMateri = (mapelId, mapelLabel, topik) => {
  if (!topik || !mapelId) {
    return [{
      id: Date.now(),
      role: 'ai',
      text: 'Terjadi kesalahan saat memuat topik. Silakan kembali dan pilih topik kembali.',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      team: 'Tim 5',
    }];
  }
  const key = `${mapelId}__${topik}`;
  const content = MATERI_CONTENT[key] ||
    `**${topik}** — ${mapelLabel || 'Mata Pelajaran'}\n\nMateri untuk topik **${topik}** sedang disiapkan oleh Tim RAG. Sementara itu, kamu bisa bertanya tentang konsep yang ingin kamu pahami dari topik ini!\n\nContoh pertanyaan:\n• Apa definisi dari ${topik}?\n• Bagaimana cara memahami ${topik}?\n• Berikan contoh penerapan ${topik}!`;

  return [
    {
      id: Date.now(),
      role: 'ai',
      text: content,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      team: 'Tim 5'
    },
    {
      id: Date.now() + 1,
      role: 'ai',
      text: `Apakah ada bagian dari **${topik}** yang ingin kamu tanyakan lebih lanjut? Atau kamu sudah siap untuk mencoba **Latihan Soal Quiz** di panel kanan? 😊`,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      team: 'Tim 5'
    },
  ];
};

const getConfContent = (topik, mapelLabel) => ({
  mindmap: {
    generated: true, ts: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    content: `🧠 ${topik}\n├─ Konsep Utama\n│  ├─ Definisi & Pengertian\n│  ├─ Ciri-ciri\n│  └─ Contoh Nyata\n├─ Sub-topik\n│  ├─ Poin 1\n│  ├─ Poin 2\n│  └─ Poin 3\n└─ Penerapan\n   ├─ Soal Latihan\n   └─ Kehidupan Sehari-hari`,
  },
  flashcard: {
    generated: true, ts: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    cards: [
      { depan: `Apa definisi dari ${topik}?`, belakang: `${topik} adalah konsep penting dalam ${mapelLabel} yang mencakup teori dasar, contoh aplikasi, dan relevansinya dalam kehidupan.` },
      { depan: `Sebutkan ciri-ciri utama ${topik}!`, belakang: `Ciri utama: (1) Memiliki komponen spesifik, (2) Dapat diidentifikasi berdasarkan karakteristiknya, (3) Saling berkaitan dengan konsep lain.` },
      { depan: `Bagaimana ${topik} diterapkan dalam kehidupan?`, belakang: `Penerapan ${topik} dapat ditemui dalam konteks sehari-hari seperti alam, teknologi, dan fenomena sosial di sekitar kita.` },
    ],
  },
  markdown: {
    generated: true, ts: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    content: `# ${topik}\n\n## 1. Pengertian\n${topik} adalah konsep fundamental dalam ${mapelLabel} yang perlu dipahami secara mendalam.\n\n## 2. Konsep Utama\n- **Poin pertama**: Deskripsi dan penjelasan\n- **Poin kedua**: Contoh konkret\n- **Poin ketiga**: Hubungan dengan konsep lain\n\n## 3. Contoh\nContoh penerapan dalam kehidupan sehari-hari:\n1. Contoh pertama dengan penjelasan\n2. Contoh kedua dengan ilustrasi\n\n## 4. Latihan\nCoba kerjakan soal-soal di panel Quiz untuk mengukur pemahaman!`,
  },
});

/* ═══════════════ WEBCAM SCREEN ══════════════════════════════════ */
const WebcamScreen = ({ mapelIcon, mapelLabel, mapelColor, onGrant, onDeny }) => (
  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.cream }}>
    <div className="fade-in" style={{ maxWidth: 420, width: '100%', padding: 24 }}>
      <Card style={{ padding: 32, textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: `${mapelColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, margin: '0 auto 18px' }}>📷</div>
        <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 20, fontWeight: 600, color: C.dark, marginBottom: 8 }}>Izinkan Akses Kamera</div>
        <div style={{ fontSize: 13, color: C.darkL, lineHeight: 1.7, marginBottom: 20 }}>
          Mentor AI menggunakan kamera untuk mendeteksi emosi belajarmu secara real-time agar respons bisa disesuaikan.
        </div>
        {[
          { icon: '😊', text: 'Mendeteksi ekspresi wajah untuk personalisasi respons AI' },
          { icon: '🔒', text: 'Video tidak direkam atau diunggah ke server' },
          { icon: '🚫', text: 'Kamera hanya aktif selama sesi chat berlangsung' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: C.tealXL, borderRadius: 9, padding: '9px 12px', textAlign: 'left', marginBottom: 8 }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
            <span style={{ fontSize: 12, color: C.teal }}>{item.text}</span>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <Btn variant="ghost" onClick={onDeny} style={{ flex: 1, justifyContent: 'center' }}>Tidak Sekarang</Btn>
          <Btn variant="primary" onClick={onGrant} style={{ flex: 2, justifyContent: 'center' }}>📷 Izinkan Kamera →</Btn>
        </div>
        <div style={{ marginTop: 10, fontSize: 10, color: C.slate }}>{mapelIcon} {mapelLabel}</div>
      </Card>
    </div>
  </div>
);

/* ═══════════════ CENTER MODAL (Format Konten & Quiz) ════════════ */
const CenterModal = ({ children, onClose }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,35,50,.55)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    onClick={onClose}>
    <div className="bounce-in" onClick={e => e.stopPropagation()}
      style={{ background: C.white, borderRadius: 18, width: '100%', maxWidth: 680, maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,.28)', overflow: 'hidden' }}>
      {children}
    </div>
  </div>
);

/* ═══════════════ MAIN ChatSection ══════════════════════════════ */
const ChatSection = ({
  chatMateri, setChatMateri,
  msgsByKey, setMsgsByKey,
  input, setInput, typing, setTyping,
  sttActive, setSttActive, ttsActive, setTtsActive,
  confContent, setConfContent, confOverlay, setConfOverlay, confGenerating, setConfGenerating,
  flashIdx, setFlashIdx, flashFlipped, setFlashFlipped,
  quizActive, setQuizActive, quizAnswers, setQuizAnswers, quizSubmitted, setQuizSubmitted,
  progressData, setProgressData,
  messagesEnd, chatFileRef, chatAttachments, setChatAttachments,
  setActivePage,
  camGranted, setCamGranted,
  addRecentActivity,
}) => {
  const [subMateri, setSubMateri] = useState(null);
  const [openDrops, setOpenDrops] = useState({});
  const [confModal, setConfModal] = useState(null); // { type }
  const [quizModal, setQuizModal] = useState(false);
  const [quizHistory, setQuizHistory] = useState({});  // key → [{score, ts}]
  const [currentQuizAns, setCurrentQuizAns] = useState({});
  const [currentQuizSub, setCurrentQuizSub] = useState(false);
  const sessionStart = useRef(null);

  /* Sync subMateri dari chatMateri prop */
  useEffect(() => {
    if (chatMateri?.subMateri) setSubMateri(chatMateri.subMateri);
    else setSubMateri(null);
  }, [chatMateri?.mapelId, chatMateri?.subMateri]);

  const toggleDrop = (t) => setOpenDrops(p => ({ ...p, [t]: !p[t] }));

  if (!chatMateri) return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 40 }}>💬</div>
      <div style={{ fontWeight: 700, fontSize: 16, color: C.dark }}>Pilih materi dulu</div>
      <div style={{ fontSize: 13, color: C.slate, marginBottom: 8 }}>Klik "Mulai Belajar" atau "Lanjutkan" dari Dashboard</div>
      <Btn variant="primary" onClick={() => setActivePage('dashboard')}>← Ke Dashboard</Btn>
    </div>
  );

  /* ── Fase 1: Kamera ── */
  if (!camGranted) return (
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      <div style={{ width: 180, background: C.white, borderRight: `1px solid rgba(13,92,99,.08)`, padding: 14, display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
        <button onClick={() => { setActivePage('dashboard'); setChatMateri(null); }}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', color: C.teal, fontWeight: 700, fontSize: 12, cursor: 'pointer', padding: 0 }}>
          ← Kembali
        </button>
        <div style={{ flex: 1 }} />
        <div style={{ background: C.tealXL, borderRadius: 9, padding: '9px 10px' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: C.teal }}>🔒 Langkah 1 dari 2</div>
          <div style={{ fontSize: 10, color: C.darkL, marginTop: 2 }}>Izinkan kamera untuk melanjutkan</div>
        </div>
      </div>
      <WebcamScreen
        mapelIcon={chatMateri.mapelIcon} mapelLabel={chatMateri.mapelLabel} mapelColor={chatMateri.mapelColor}
        onGrant={() => { setCamGranted(true); sessionStart.current = Date.now(); }}
        onDeny={() => { setActivePage('dashboard'); setChatMateri(null); }}
      />
    </div>
  );

  /* ── Derived values (post-camera) ── */
  const mapelKey = `mapel__${chatMateri.mapelId}`;

  /* ── Riwayat topik per mapel ── */
  const getSessions = () =>
    Object.keys(msgsByKey)
      .filter(k => k.startsWith(chatMateri.mapelId + '__'))
      .map(k => {
        const sub = k.split('__').slice(1).join('__');
        const done_ = progressData.sudahSelesai.find(m => m.mapelId === chatMateri.mapelId && m.subMateri === sub);
        const ong_ = progressData.belumSelesai.find(m => m.mapelId === chatMateri.mapelId && m.subMateri === sub);
        return { k, sub, score: done_?.quizScore ?? null, done: !!done_, ongoing: !!ong_ };
      });

  const sessions = getSessions();

  /* ── Pilih topik dari chat ── */
  const handlePickTopik = (topik) => {
    const k = makeKey(chatMateri.mapelId, topik);
    setSubMateri(topik);
    setChatMateri(p => ({ ...p, subMateri: topik }));

    // Pastikan pesan topik ada di state
    if (!msgsByKey[k]) {
      setMsgsByKey(p => ({ ...p, [k]: getTopikMateri(chatMateri.mapelId, chatMateri.mapelLabel, topik) }));
    }

    // Tambahkan pesan pilihan siswa ke chat mapel
    const selectMsg = {
      id: Date.now(),
      role: 'user',
      text: `Aku mau belajar **${topik}**`,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
    setMsgsByKey(p => ({ ...p, [mapelKey]: [...(p[mapelKey] || []), selectMsg] }));
    setQuizActive(false); setQuizAnswers({}); setQuizSubmitted(false); setConfOverlay(null);
    if (!sessionStart.current) sessionStart.current = Date.now();
  };

  /* ── State setelah kamera diizinkan ── */
  useEffect(() => {
    if (!camGranted || !chatMateri) return;
    const mapelKey = `mapel__${chatMateri.mapelId}`;

    const sess = Object.keys(msgsByKey)
      .filter(k => k.startsWith(chatMateri.mapelId + '__'))
      .map(k => ({ k, sub: k.split('__').slice(1).join('__') }));

    // Jika masuk langsung ke subMateri (dari rekomendasi / lanjutkan / search)
    if (chatMateri.subMateri) {
      const topikKey = makeKey(chatMateri.mapelId, chatMateri.subMateri);

      // Inisialisasi greeting mapelKey jika belum ada (tanpa konteks subMateri — fallback)
      if (!msgsByKey[mapelKey]) {
        setMsgsByKey(p => ({
          ...p,
          [mapelKey]: getGreet(
            chatMateri.mapelId, chatMateri.mapelLabel, chatMateri.mapelIcon, chatMateri.mapelColor,
            sess, null, null
          )
        }));
      }

      // Inisialisasi topik dengan greeting kontekstual di key topik
      if (!msgsByKey[topikKey]) {
        // Buat greeting kontekstual sebagai pesan pertama di key topik
        const contextGreet = getGreet(
          chatMateri.mapelId, chatMateri.mapelLabel, chatMateri.mapelIcon, chatMateri.mapelColor,
          sess,
          chatMateri.subMateri,
          chatMateri.source || null
        );
        const materiMsgs = getTopikMateri(chatMateri.mapelId, chatMateri.mapelLabel, chatMateri.subMateri);
        setMsgsByKey(p => ({
          ...p,
          [topikKey]: [...contextGreet, ...materiMsgs]
        }));
      }
      setSubMateri(chatMateri.subMateri);

    } else {
      // Masuk tanpa subMateri → tampilkan daftar pilihan
      if (!msgsByKey[mapelKey]) {
        setMsgsByKey(p => ({
          ...p,
          [mapelKey]: getGreet(
            chatMateri.mapelId, chatMateri.mapelLabel, chatMateri.mapelIcon, chatMateri.mapelColor,
            sess, null, null
          )
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camGranted, chatMateri?.mapelId, chatMateri?.subMateri]);

  /* ── Active chat key & messages ── */
  const activeKey = subMateri ? makeKey(chatMateri.mapelId, subMateri) : mapelKey;
  // Ambil messages dari state — fallback ke loading placeholder jika belum ada (useEffect akan segera mengisinya)
  const rawMsgs = msgsByKey[activeKey];
  const msgs = rawMsgs && rawMsgs.length > 0
    ? rawMsgs
    : subMateri
      ? getTopikMateri(chatMateri.mapelId, chatMateri.mapelLabel, subMateri)
      : getGreet(chatMateri.mapelId, chatMateri.mapelLabel, chatMateri.mapelIcon, chatMateri.mapelColor, sessions, null, null);
  const kConf = confContent[activeKey] || {};
  const hasConf = CONF_TYPES.some(ct => kConf[ct.type]?.generated);
  const quizSoal = getQuiz(activeKey);
  const quizResultRecord = progressData.sudahSelesai.find(m => m.mapelId === chatMateri.mapelId && m.subMateri === subMateri);
  const quizBestScore = quizHistory[activeKey]?.reduce((best, r) => Math.max(best, r.score), 0) ?? null;

  /* ── Send message ── */
  const sendMsg = () => {
    if (!input.trim() && !chatAttachments.length) return;
    const userMsg = { id: Date.now(), role: 'user', text: input, time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) };
    setMsgsByKey(p => ({ ...p, [activeKey]: [...(p[activeKey] || []), userMsg] }));
    setInput(''); setTyping(true);
    setTimeout(() => {
      const aiReply = {
        id: Date.now() + 1, role: 'ai', text: subMateri
          ? `Pertanyaan bagus tentang **${subMateri}**! 😊\n\nMari kita telaah lebih dalam. Konsep kunci yang perlu dipahami:\n\n1. Pahami definisi dasarnya terlebih dahulu\n2. Lihat contoh nyata di sekitar kita\n3. Coba kerjakan soal latihan untuk memastikan pemahamanmu\n\nApa yang masih membingungkan?`
          : `Aku siap membantu! Silakan pilih topik dulu dari daftar yang ada, atau tanya apa saja seputar **${chatMateri.mapelLabel}**. 😊`,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }), team: 'Tim 5'
      };
      setMsgsByKey(p => ({ ...p, [activeKey]: [...(p[activeKey] || []), aiReply] }));
      setTyping(false);
      setTimeout(() => messagesEnd?.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    }, 1100);
  };

  /* ── Generate Format Konten ── */
  const generateConf = (type) => {
    setConfGenerating(true);
    setTimeout(() => {
      const content = getConfContent(subMateri || chatMateri.mapelLabel, chatMateri.mapelLabel);
      setConfContent(p => ({ ...p, [activeKey]: { ...(p[activeKey] || {}), [type]: content[type] } }));
      setConfGenerating(false);
    }, 1500);
  };

  /* ── Submit Quiz ── */
  const submitCurrentQuiz = () => {
    const correct = quizSoal.filter((s, i) => currentQuizAns[i] === s.jawaban).length;
    const score = Math.round((correct / quizSoal.length) * 100);

    // Save to quiz history
    setQuizHistory(p => ({
      ...p,
      [activeKey]: [...(p[activeKey] || []), { score, ts: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }), correct, total: quizSoal.length }],
    }));

    // Update progress
    if (subMateri) {
      const newRecord = { id: `q_${Date.now()}`, ...chatMateri, subMateri, progress: 100, lastChat: 'Baru saja', confDone: [], quizDone: true, quizScore: score };
      setProgressData(p => ({
        sudahSelesai: [...p.sudahSelesai.filter(m => !(m.mapelId === chatMateri.mapelId && m.subMateri === subMateri)), newRecord],
        belumSelesai: p.belumSelesai.filter(m => !(m.mapelId === chatMateri.mapelId && m.subMateri === subMateri)),
      }));
    }

    setCurrentQuizSub(true);

    const durasMin = sessionStart.current ? Math.max(1, Math.round((Date.now() - sessionStart.current) / 60000)) : 15;
    addRecentActivity?.({
      mapelLabel: chatMateri.mapelLabel, mapelIcon: chatMateri.mapelIcon, mapelColor: chatMateri.mapelColor,
      topik: subMateri || chatMateri.mapelLabel, durasi: durasMin, quizScore10: correct, date: 'Baru saja',
    });
  };

  /* ─────────────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────────────── */
  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden', position: 'relative' }}>

      {/* ══ PANEL KIRI ══════════════════════════════════════════ */}
      <div style={{ width: 200, minWidth: 200, background: C.white, borderRight: `1px solid rgba(13,92,99,.08)`, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ padding: '14px 14px 12px' }}>
          <button onClick={() => { setActivePage('dashboard'); setChatMateri(null); setSubMateri(null); }}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', color: C.teal, fontWeight: 700, fontSize: 12, cursor: 'pointer', marginBottom: 14, padding: 0 }}>
            ← Kembali
          </button>

          {/* Kamera aktif */}
          <div style={{ background: `${C.red}0F`, border: `1px solid ${C.red}33`, borderRadius: 9, padding: '7px 10px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.red, display: 'inline-block', animation: 'pulse 1.2s infinite', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.red }}>Kamera Aktif</div>
              <div style={{ fontSize: 9, color: C.slate }}>Deteksi emosi ON</div>
            </div>
          </div>

          {/* Mapel info */}
          <div style={{ width: 38, height: 38, borderRadius: 10, background: `${chatMateri.mapelColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 6 }}>
            {chatMateri.mapelIcon}
          </div>
          <div style={{ fontSize: 10, color: chatMateri.mapelColor, fontWeight: 700, marginBottom: 2 }}>{chatMateri.mapelLabel}</div>
          {subMateri ? (
            <>
              <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 12, fontWeight: 600, color: C.dark, lineHeight: 1.4, marginBottom: 8 }}>{subMateri}</div>
            </>
          ) : (
            <div style={{ fontSize: 11, color: C.slate, marginBottom: 8, fontStyle: 'italic' }}>Belum pilih topik</div>
          )}

          <Divider />

          {/* STT / TTS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 8 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: C.slate, marginBottom: 4 }}>Kontrol Suara</div>
            {[
              { label: 'STT', icon: '🎙', active: sttActive, toggle: () => setSttActive(p => !p), color: C.teal },
              { label: 'TTS', icon: '🔊', active: ttsActive, toggle: () => setTtsActive(p => !p), color: C.purple },
            ].map(ctrl => (
              <button key={ctrl.label} onClick={ctrl.toggle} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 9px', borderRadius: 8, border: `1px solid ${ctrl.active ? ctrl.color : C.tealXL}`, background: ctrl.active ? `${ctrl.color}0F` : C.white, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}>
                <span style={{ fontSize: 13 }}>{ctrl.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: ctrl.active ? ctrl.color : C.darkL, flex: 1, textAlign: 'left' }}>{ctrl.label}</span>
                <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 99, background: ctrl.active ? ctrl.color : C.cream, color: ctrl.active ? C.white : C.slate }}>{ctrl.active ? 'ON' : 'OFF'}</span>
              </button>
            ))}
          </div>

          {/* Riwayat topik mapel */}
          {sessions.length > 0 && (
            <>
              <Divider style={{ margin: '12px 0 8px' }} />
              <div style={{ fontSize: 9, fontWeight: 700, color: C.slate, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                📚 Riwayat {chatMateri.mapelLabel}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {sessions.map(sess => {
                  const isActive = sess.sub === subMateri;
                  const qh = quizHistory[sess.k];
                  const bestQ = qh ? Math.max(...qh.map(r => r.score)) : null;
                  return (
                    <button key={sess.k} onClick={() => {
                      setSubMateri(sess.sub);
                      setChatMateri(cm => ({ ...cm, subMateri: sess.sub }));
                      setQuizActive(false); setQuizAnswers({}); setQuizSubmitted(false); setConfOverlay(null);
                    }} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 9px', borderRadius: 8, border: `1px solid ${isActive ? chatMateri.mapelColor : C.tealXL}`, background: isActive ? `${chatMateri.mapelColor}12` : C.white, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all .15s' }}
                      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = C.cream; e.currentTarget.style.borderColor = C.tealL; } }}
                      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = C.white; e.currentTarget.style.borderColor = C.tealXL; } }}>
                      <span style={{ fontSize: 12 }}>{chatMateri.mapelIcon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: C.dark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sess.sub}</div>
                        <div style={{ fontSize: 8, color: C.slate }}>
                          {bestQ != null ? `Quiz: ${bestQ}/100` : sess.done ? '✅ Selesai' : '🔄 Belajar'}
                        </div>
                      </div>
                      {isActive && <span style={{ fontSize: 8, color: chatMateri.mapelColor }}>●</span>}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ══ PANEL TENGAH — Chat ══════════════════════════════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, background: C.cream }}>
        {/* Header */}
        <div style={{ padding: '10px 14px', background: C.white, borderBottom: `1px solid rgba(13,92,99,.08)`, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg,${C.teal},${C.tealL})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>🤖</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.dark }}>Mentor AI — Pak Cerdas</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.green, display: 'inline-block' }} />
              <span style={{ fontSize: 10, color: C.green }}>Online</span>
              <span style={{ fontSize: 10, color: C.slate, marginLeft: 6 }}>· {subMateri || chatMateri.mapelLabel}</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {msgs.map(msg => (
            <div key={msg.id}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                {msg.role === 'ai' && (
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: `linear-gradient(135deg,${C.teal},${C.tealL})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>🤖</div>
                )}
                <div style={{ maxWidth: '72%' }}>
                  {msg.role === 'ai' && msg.team && <div style={{ fontSize: 9, color: C.slate, marginBottom: 3, marginLeft: 4 }}>{msg.team} · {msg.time}</div>}
                  <div style={{ padding: '9px 12px', borderRadius: msg.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px', background: msg.role === 'user' ? `linear-gradient(135deg,${C.teal},${C.tealL})` : C.white, color: msg.role === 'ai' ? C.dark : C.white, fontSize: 13, boxShadow: msg.role === 'ai' ? '0 2px 8px rgba(26,35,50,.07)' : '0 2px 8px rgba(13,92,99,.25)' }}>
                    {renderText(msg.text)}
                  </div>
                  {msg.role === 'user' && <div style={{ fontSize: 9, color: C.slate, marginTop: 2, textAlign: 'right' }}>{msg.time}</div>}
                </div>
              </div>

              {/* Topic buttons setelah greeting */}
              {msg.role === 'ai' && msg.topikList && !subMateri && (
                <div style={{ marginLeft: 34, marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {msg.topikList.map(t => {
                    const studied = sessions.find(s => s.sub === t);
                    return (
                      <button key={t} onClick={() => handlePickTopik(t)}
                        style={{ padding: '8px 14px', borderRadius: 10, border: `1.5px solid ${chatMateri.mapelColor}44`, background: studied ? `${chatMateri.mapelColor}10` : C.white, color: C.dark, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 6 }}
                        onMouseEnter={e => { e.currentTarget.style.background = `${chatMateri.mapelColor}18`; e.currentTarget.style.borderColor = chatMateri.mapelColor; }}
                        onMouseLeave={e => { e.currentTarget.style.background = studied ? `${chatMateri.mapelColor}10` : C.white; e.currentTarget.style.borderColor = `${chatMateri.mapelColor}44`; }}>
                        <span>{chatMateri.mapelIcon}</span>
                        <span>{t}</span>
                        {studied && <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 99, background: C.greenL, color: C.green, fontWeight: 700 }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
          {typing && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: `linear-gradient(135deg,${C.teal},${C.tealL})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🤖</div>
              <div style={{ padding: '9px 12px', background: C.white, borderRadius: '4px 12px 12px 12px', display: 'flex', gap: 4, alignItems: 'center' }}>
                {[0, 1, 2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: C.teal, animation: `waveTyping 1s ${i * .2}s infinite` }} />)}
              </div>
            </div>
          )}
          <div ref={messagesEnd} />
        </div>

        {/* Input */}
        <div style={{ padding: '8px 12px', background: C.white, borderTop: `1px solid rgba(13,92,99,.08)`, flexShrink: 0 }}>
          {chatAttachments.length > 0 && (
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 6 }}>
              {chatAttachments.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 7px', background: C.cream, borderRadius: 6, fontSize: 10 }}>
                  <span>📎</span><span style={{ maxWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                  <button onClick={() => setChatAttachments(p => p.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.slate, fontSize: 11 }}>✕</button>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
            <input type="file" ref={chatFileRef} style={{ display: 'none' }} multiple onChange={e => {
              const parsed = Array.from(e.target.files).map(f => ({ name: f.name, size: `${Math.round(f.size / 1024)} KB`, ext: f.name.split('.').pop() }));
              setChatAttachments(p => [...p, ...parsed].slice(0, 3));
            }} />
            <button onClick={() => chatFileRef.current?.click()} style={{ width: 34, height: 34, borderRadius: 8, background: C.cream, border: `1px solid ${C.tealXL}`, cursor: 'pointer', fontSize: 14, flexShrink: 0 }}>📎</button>
            {sttActive && <button style={{ width: 34, height: 34, borderRadius: 8, background: C.red, border: 'none', cursor: 'pointer', fontSize: 14, flexShrink: 0, animation: 'pulse 1.5s infinite' }}>🎙</button>}
            <textarea value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
              placeholder={subMateri ? `Tanya tentang ${subMateri}...` : `Tanya tentang ${chatMateri.mapelLabel}...`}
              style={{ flex: 1, padding: '8px 10px', border: `1.5px solid ${C.tealXL}`, borderRadius: 9, fontSize: 13, resize: 'none', outline: 'none', minHeight: 38, maxHeight: 84, lineHeight: 1.5 }}
              rows={1} />
            <Btn variant="primary" onClick={sendMsg} disabled={!input.trim() && !chatAttachments.length}
              style={{ height: 38, paddingLeft: 12, paddingRight: 12, flexShrink: 0, fontSize: 12 }}>Kirim →</Btn>
          </div>
        </div>
      </div>

      {/* ══ PANEL KANAN ══════════════════════════════════════════ */}
      <div style={{ width: 238, minWidth: 238, background: C.white, borderLeft: `1px solid rgba(13,92,99,.08)`, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

        {/* Format Konten */}
        <div style={{ padding: '12px 12px 8px', borderBottom: `1px solid rgba(13,92,99,.06)`, flexShrink: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: C.dark, marginBottom: 3 }}>📦 Format Konten</div>
          <div style={{ fontSize: 10, color: C.slate, marginBottom: 8 }}>
            {subMateri ? 'Generate materi dari RAG' : 'Pilih topik dulu'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {CONF_TYPES.map(ct => {
              const done_ = kConf[ct.type]?.generated;
              return (
                <button key={ct.type}
                  onClick={() => { if (!subMateri) return; if (!done_) generateConf(ct.type); setConfModal({ type: ct.type }); }}
                  disabled={!subMateri}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 9, border: `1.5px solid ${done_ ? ct.color : C.tealXL}`, cursor: subMateri ? 'pointer' : 'not-allowed', fontFamily: 'inherit', background: done_ ? ct.bgLight : C.white, color: done_ ? ct.color : C.slate, fontSize: 12, fontWeight: 700, textAlign: 'left', transition: 'all .2s', opacity: subMateri ? 1 : .5 }}>
                  <span style={{ fontSize: 15 }}>{ct.icon}</span>
                  <span style={{ flex: 1 }}>{ct.label}</span>
                  {done_
                    ? <span style={{ fontSize: 9, opacity: .8 }}>✓ Lihat →</span>
                    : <span style={{ fontSize: 9, color: C.tealL }}>+ Buat</span>
                  }
                </button>
              );
            })}
          </div>
        </div>

        {/* Riwayat konten yang sudah di-generate */}
        {hasConf && (
          <div style={{ padding: '10px 12px', borderBottom: `1px solid rgba(13,92,99,.06)`, flexShrink: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 11, color: C.dark, marginBottom: 8 }}>📋 Riwayat Konten</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {CONF_TYPES.map(ct => {
                const data = kConf[ct.type];
                if (!data?.generated) return null;
                return (
                  <div key={ct.type}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: 7, border: `1px solid ${ct.color}33`, background: ct.bgLight }}>
                      <span style={{ fontSize: 13 }}>{ct.icon}</span>
                      <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: ct.color }}>{ct.label}</span>
                      <span style={{ fontSize: 9, color: C.slate, fontWeight: 400 }}>{data.ts}</span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => setConfModal({ type: ct.type })}
                          style={{ fontSize: 9, padding: '2px 6px', borderRadius: 5, border: `1px solid ${ct.color}55`, background: 'none', color: ct.color, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>Lihat</button>
                        <button onClick={() => { generateConf(ct.type); setConfModal({ type: ct.type }); }}
                          style={{ fontSize: 9, padding: '2px 6px', borderRadius: 5, border: `1px solid ${C.tealXL}`, background: 'none', color: C.slate, cursor: 'pointer', fontFamily: 'inherit' }}>↺</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quiz */}
        <div style={{ padding: '10px 12px', flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: C.dark, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            📝 Latihan Soal
            {quizBestScore != null && (
              <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 99, background: C.greenL, color: C.green, fontWeight: 700 }}>Best: {quizBestScore}</span>
            )}
          </div>

          {!subMateri ? (
            <div style={{ fontSize: 11, color: C.slate, background: C.cream, borderRadius: 8, padding: '10px', textAlign: 'center' }}>
              Pilih topik dulu untuk mulai latihan soal
            </div>
          ) : (
            <>
              <Btn variant="amber" onClick={() => { setQuizModal(true); setCurrentQuizAns({}); setCurrentQuizSub(false); }}
                style={{ width: '100%', justifyContent: 'center', padding: '9px', fontSize: 11, marginBottom: 8 }}>
                📝 {quizBestScore != null ? 'Ulangi Quiz' : `Mulai Quiz (${quizSoal.length} soal)`}
              </Btn>

              {/* Riwayat quiz */}
              {(quizHistory[activeKey] || []).length > 0 && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.slate, marginBottom: 6 }}>Riwayat Quiz</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 160, overflowY: 'auto' }}>
                    {[...(quizHistory[activeKey] || [])].reverse().map((r, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', borderRadius: 7, background: C.cream }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: r.score >= 70 ? C.greenL : C.amberL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: r.score >= 70 ? C.green : C.orange, flexShrink: 0 }}>
                          {r.score}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 10, fontWeight: 600, color: C.dark }}>{r.correct}/{r.total} benar</div>
                          <div style={{ fontSize: 8, color: C.slate }}>{r.ts}</div>
                        </div>
                        <span style={{ fontSize: 9 }}>{r.score >= 70 ? '⭐' : '💪'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ══ CENTER MODAL — Format Konten ══════════════════════════ */}
      {confModal && (() => {
        const ct = CONF_TYPES.find(t => t.type === confModal.type);
        if (!ct) return null;
        const data = kConf[ct.type];
        return (
          <CenterModal onClose={() => setConfModal(null)}>
            {/* Header */}
            <div style={{ padding: '16px 22px', background: ct.color, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <span style={{ fontSize: 26 }}>{ct.icon}</span>
              <div style={{ flex: 1, color: C.white }}>
                <div style={{ fontWeight: 700, fontSize: 17 }}>{ct.label}</div>
                <div style={{ fontSize: 11, opacity: .8 }}>{subMateri} · {chatMateri.mapelLabel}</div>
              </div>
              <button onClick={() => { generateConf(confModal.type); }}
                style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,.3)', background: 'rgba(255,255,255,.15)', color: C.white, cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: 'inherit' }}>
                ↺ Generate Ulang
              </button>
              <button onClick={() => setConfModal(null)}
                style={{ background: 'rgba(255,255,255,.2)', border: 'none', borderRadius: 8, width: 32, height: 32, color: C.white, cursor: 'pointer', fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '22px 26px' }}>
              {confGenerating ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, gap: 16 }}>
                  <div style={{ width: 44, height: 44, border: `4px solid ${ct.bgLight}`, borderTopColor: ct.color, borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
                  <div style={{ fontWeight: 700, fontSize: 15, color: C.dark }}>Generating {ct.label}...</div>
                  <div style={{ fontSize: 12, color: C.slate }}>Tim 3 RAG sedang menyusun konten</div>
                </div>
              ) : !data?.generated ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: C.slate }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>{ct.icon}</div>
                  <div style={{ fontSize: 14 }}>Klik "Generate Ulang" untuk membuat {ct.label}</div>
                </div>
              ) : (
                <>
                  {ct.type === 'mindmap' && (
                    <div>
                      <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 18, fontWeight: 600, color: C.dark, marginBottom: 16 }}>🧠 Peta Pikiran: {subMateri}</div>
                      <div style={{ background: ct.bgLight, borderRadius: 14, padding: '18px 22px' }}>
                        <pre style={{ fontSize: 14, color: ct.color, lineHeight: 1.9, fontFamily: 'monospace', whiteSpace: 'pre-wrap', fontWeight: 600 }}>{data.content}</pre>
                      </div>
                    </div>
                  )}
                  {ct.type === 'flashcard' && data.cards && (
                    <div>
                      <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 18, fontWeight: 600, color: C.dark, marginBottom: 16 }}>🃏 Flashcard: {subMateri}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
                        {data.cards.map((card, ci) => (
                          <div key={ci} style={{ borderRadius: 12, overflow: 'hidden', border: `1.5px solid ${ct.color}33` }}>
                            <div style={{ background: ct.color, padding: '8px 14px', fontSize: 11, color: C.white, fontWeight: 700 }}>Kartu {ci + 1}</div>
                            <div style={{ padding: '14px', background: ct.bgLight }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: C.dark, marginBottom: 8 }}>❓ {card.depan}</div>
                              <div style={{ fontSize: 13, color: C.darkL, lineHeight: 1.6, borderTop: `1px solid ${ct.color}22`, paddingTop: 8 }}>💡 {card.belakang}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {ct.type === 'markdown' && (
                    <div>
                      <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: 18, fontWeight: 600, color: C.dark, marginBottom: 16 }}>📄 Catatan: {subMateri}</div>
                      <div style={{ background: C.white, borderRadius: 14, padding: '20px 24px', border: `1.5px solid ${ct.color}33`, lineHeight: 1.8 }}>
                        <pre style={{ fontSize: 13, color: C.dark, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{data.content}</pre>
                      </div>
                    </div>
                  )}
                  <div style={{ background: C.tealXL, borderRadius: 10, padding: '10px 14px', marginTop: 16, fontSize: 11, color: C.teal, display: 'flex', gap: 8 }}>
                    <span>💡</span><span>Konten tersimpan. Kamu bisa generate ulang kapan saja — riwayat versi sebelumnya tersimpan di panel kanan.</span>
                  </div>
                </>
              )}
            </div>
          </CenterModal>
        );
      })()}

      {/* ══ CENTER MODAL — Quiz ══════════════════════════════════ */}
      {quizModal && (
        <CenterModal onClose={() => setQuizModal(false)}>
          {/* Header */}
          <div style={{ padding: '16px 22px', background: chatMateri.mapelColor, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <span style={{ fontSize: 22 }}>📝</span>
            <div style={{ flex: 1, color: C.white }}>
              <div style={{ fontWeight: 700, fontSize: 17 }}>Latihan Soal — {subMateri}</div>
              <div style={{ fontSize: 11, opacity: .8 }}>{chatMateri.mapelLabel} · {quizSoal.length} soal</div>
            </div>
            {!currentQuizSub && (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.8)', padding: '4px 12px', borderRadius: 99, background: 'rgba(255,255,255,.15)' }}>
                {Object.keys(currentQuizAns).length}/{quizSoal.length} dijawab
              </div>
            )}
            <button onClick={() => setQuizModal(false)}
              style={{ background: 'rgba(255,255,255,.2)', border: 'none', borderRadius: 8, width: 32, height: 32, color: C.white, cursor: 'pointer', fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '22px 26px' }}>
            {!currentQuizSub ? (
              <>
                {quizSoal.map((s, si) => (
                  <div key={si} style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: 10, lineHeight: 1.5 }}>
                      <span style={{ fontSize: 12, color: chatMateri.mapelColor, fontWeight: 800, marginRight: 6 }}>{si + 1}.</span>
                      {s.soal}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {s.pilihan.map((p, pi) => (
                        <button key={pi} onClick={() => setCurrentQuizAns(a => ({ ...a, [si]: pi }))} style={{
                          textAlign: 'left', padding: '10px 14px', borderRadius: 9,
                          border: `2px solid ${currentQuizAns[si] === pi ? chatMateri.mapelColor : C.tealXL}`,
                          background: currentQuizAns[si] === pi ? `${chatMateri.mapelColor}12` : C.white,
                          cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, color: currentQuizAns[si] === pi ? chatMateri.mapelColor : C.dark,
                          fontWeight: currentQuizAns[si] === pi ? 700 : 400, transition: 'all .15s',
                        }}>
                          <span style={{ fontWeight: 800, marginRight: 8 }}>{String.fromCharCode(65 + pi)}.</span>{p}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              /* Hasil quiz */
              (() => {
                const lastResult = (quizHistory[activeKey] || []).slice(-1)[0];
                const sc = lastResult?.score ?? 0;
                const pass = sc >= 70;
                return (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ fontSize: 56, marginBottom: 12 }}>{pass ? '🌟' : '💪'}</div>
                    <div style={{ fontWeight: 800, fontSize: 42, color: pass ? C.green : C.amber, marginBottom: 6 }}>{sc}/100</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: pass ? C.green : C.orange, marginBottom: 12 }}>
                      {pass ? '⭐ Hebat! Topik ini sudah kamu kuasai!' : '🔄 Yuk Coba Lagi!'}
                    </div>
                    <div style={{ fontSize: 13, color: C.darkL, marginBottom: 8 }}>
                      {lastResult?.correct} dari {lastResult?.total} soal benar
                    </div>
                    {/* Detail per soal */}
                    <div style={{ textAlign: 'left', background: C.cream, borderRadius: 12, padding: '16px 18px', marginBottom: 16 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: C.dark, marginBottom: 12 }}>🔍 Review Jawaban</div>
                      {quizSoal.map((s, si) => {
                        const userAns = currentQuizAns[si];
                        const correct = userAns === s.jawaban;
                        return (
                          <div key={si} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: si < quizSoal.length - 1 ? `1px solid rgba(13,92,99,.07)` : 'none' }}>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 4 }}>
                              <span style={{ fontSize: 14, flexShrink: 0 }}>{correct ? '✅' : '❌'}</span>
                              <div style={{ fontSize: 12, color: C.dark, fontWeight: 600 }}>{si + 1}. {s.soal}</div>
                            </div>
                            {!correct && (
                              <div style={{ marginLeft: 20, fontSize: 11 }}>
                                <span style={{ color: C.red }}>Jawabanmu: {s.pilihan[userAns] ?? '—'}</span>
                                <span style={{ color: C.green, marginLeft: 10 }}>✓ Benar: {s.pilihan[s.jawaban]}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {/* Evaluasi RAG */}
                    <div style={{ background: C.tealXL, borderRadius: 10, padding: '14px 16px', textAlign: 'left', marginBottom: 16 }}>
                      <div style={{ fontWeight: 700, fontSize: 12, color: C.teal, marginBottom: 6 }}>🤖 Evaluasi RAG:</div>
                      <div style={{ fontSize: 12, color: C.teal, lineHeight: 1.6 }}>
                        {pass
                          ? `Luar biasa! Pemahamanmu tentang ${subMateri} sudah solid. Pertimbangkan untuk menjelajahi topik berikutnya di ${chatMateri.mapelLabel}.`
                          : `Ada beberapa konsep ${subMateri} yang masih perlu diperkuat. Saran RAG: (1) Review Mind Map, (2) Baca kembali materi di chat, (3) Tanya Mentor AI untuk bagian yang sulit, (4) Coba quiz lagi.`
                        }
                      </div>
                    </div>
                  </div>
                );
              })()
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '14px 22px', borderTop: `1px solid rgba(13,92,99,.07)`, display: 'flex', gap: 10, flexShrink: 0 }}>
            {!currentQuizSub ? (
              <>
                <Btn variant="ghost" onClick={() => setQuizModal(false)} style={{ flex: 1, justifyContent: 'center' }}>Tutup</Btn>
                <Btn variant="primary" onClick={submitCurrentQuiz}
                  disabled={Object.keys(currentQuizAns).length < quizSoal.length}
                  style={{ flex: 2, justifyContent: 'center', padding: '11px', fontSize: 13, background: `linear-gradient(135deg,${chatMateri.mapelColor},${chatMateri.mapelColor}cc)` }}>
                  Kumpulkan Jawaban ✓
                </Btn>
              </>
            ) : (
              <>
                <Btn variant="ghost" onClick={() => setQuizModal(false)} style={{ flex: 1, justifyContent: 'center' }}>Tutup</Btn>
                <Btn variant="amber" onClick={() => { setCurrentQuizAns({}); setCurrentQuizSub(false); }}
                  style={{ flex: 2, justifyContent: 'center', fontSize: 13 }}>
                  🔄 Ulangi Quiz
                </Btn>
              </>
            )}
          </div>
        </CenterModal>
      )}
    </div>
  );
};

export default ChatSection;
