export type UserRole = 
  | 'admin'
  | 'kepala_sekolah'
  | 'waka_kesiswaan'
  | 'guru_wali'
  | 'wali_kelas'
  | 'kkk'
  | 'guru_bk'
  | 'kesiswaan';

export interface Role {
  id: string;
  kode: UserRole;
  nama: string;
  deskripsi: string;
  created_at: string;
}

export interface Profile {
  id: string;
  nama_lengkap: string;
  email: string;
  nip: string;
  role_id: string;
  guru_id: string | null;
  role_kode: UserRole;
  aktif: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Guru {
  id: string;
  nip: string;
  nama_lengkap: string;
  email: string;
  no_hp: string;
  jabatan: string;
  status_aktif: boolean;
  created_at: string;
  updated_at: string;
}

export interface KompetensiKeahlian {
  id: string;
  kode: string; // e.g. "RPL", "TKJ", "DKV", "AKL", "BDP"
  nama: string;
  aktif: boolean;
  created_at: string;
}

export interface TahunPelajaran {
  id: string;
  nama: string; // e.g. "2025/2026"
  tanggal_mulai: string;
  tanggal_selesai: string;
  semester_aktif: 'Ganjil' | 'Genap';
  aktif: boolean;
  created_at: string;
}

export interface Kelas {
  id: string;
  nama_kelas: string; // e.g. "X RPL 1"
  tingkat: number; // 10, 11, 12
  kompetensi_keahlian_id: string;
  tahun_pelajaran_id: string;
  wali_kelas_id: string;
  aktif: boolean;
  created_at: string;
}

export interface Siswa {
  id: string;
  nis: string;
  nisn: string;
  nama_lengkap: string;
  jenis_kelamin: 'L' | 'P';
  tanggal_lahir: string;
  alamat: string;
  nama_orang_tua: string;
  no_hp_orang_tua: string;
  kelas_id: string;
  kompetensi_keahlian_id: string;
  tahun_pelajaran_id: string;
  status: 'Aktif' | 'Lulus' | 'Pindah' | 'Drop Out';
  created_at: string;
  updated_at: string;
}

export interface PenugasanGuru {
  id: string;
  guru_id: string;
  role_id: string;
  kelas_id: string | null;
  kompetensi_keahlian_id: string | null;
  siswa_id: string | null;
  tahun_pelajaran_id: string;
  aktif: boolean;
  created_at: string;
}

// 11. Jurnal Guru Wali
export type JenisLayananGuruWali = 
  | 'Bimbingan'
  | 'Pembinaan'
  | 'Monitoring'
  | 'Konsultasi'
  | 'Layanan Kolaborasi BK & Kesiswaan';

export interface JurnalGuruWali {
  id: string;
  siswa_id: string;
  guru_id: string;
  tanggal: string;
  waktu: string;
  jenis_layanan: JenisLayananGuruWali;
  permasalahan: string;
  uraian_layanan: string;
  hasil_layanan: string;
  rencana_tindak_lanjut: string;
  status: 'Berjalan' | 'Selesai' | 'Perlu Koordinasi';
  dokumentasi_url: string | null;
  created_at: string;
  updated_at: string;
}

// 12. Jurnal Wali Kelas
export interface JurnalWaliKelas {
  id: string;
  siswa_id: string;
  guru_id: string;
  kelas_id: string;
  tanggal: string;
  waktu: string;
  jenis_layanan: string;
  permasalahan: string;
  tindakan: string;
  hasil: string;
  tindak_lanjut: string;
  status: 'Berjalan' | 'Selesai' | 'Perlu Koordinasi';
  dokumentasi_url: string | null;
  created_at: string;
  updated_at: string;
}

// 13. Jurnal KKK
export interface JurnalKKK {
  id: string;
  siswa_id: string;
  guru_id: string;
  kompetensi_keahlian_id: string;
  tanggal: string;
  waktu: string;
  jenis_kegiatan: string;
  permasalahan: string;
  tindakan: string;
  hasil: string;
  tindak_lanjut: string;
  status: 'Berjalan' | 'Selesai' | 'Perlu Koordinasi';
  dokumentasi_url: string | null;
  created_at: string;
  updated_at: string;
}

// 14. Data Layanan BK
export type BidangLayananBK = 'Pribadi' | 'Sosial' | 'Belajar' | 'Karier';
export type JenisLayananBK = 
  | 'Konseling Individu'
  | 'Konseling Kelompok'
  | 'Bimbingan Klasikal'
  | 'Bimbingan Kelompok'
  | 'Konsultasi'
  | 'Mediasi'
  | 'Home Visit'
  | 'Rujukan';

export interface JurnalBK {
  id: string;
  siswa_id: string;
  guru_bk_id: string;
  tanggal: string;
  waktu: string;
  jenis_layanan: JenisLayananBK;
  bidang_layanan: BidangLayananBK;
  tujuan_layanan: string;
  identifikasi_kebutuhan: string;
  intervensi: string;
  hasil_layanan: string;
  rencana_tindak_lanjut: string;
  jadwal_berikutnya: string | null;
  status_layanan: 'Baru' | 'Dalam Proses' | 'Selesai' | 'Alih Tangan Kasus';
  dokumentasi_url: string | null;
  created_at: string;
  updated_at: string;
}

// 15. Data BK Rahasia (Restricted - Guru BK Only)
export interface KonselingRestricted {
  id: string;
  jurnal_bk_id: string;
  siswa_id: string;
  guru_bk_id: string;
  catatan_rahasia: string;
  hasil_assessment: string;
  rekomendasi_profesional: string;
  created_at: string;
  updated_at: string;
}

export interface AsesmenBKRestricted {
  id: string;
  siswa_id: string;
  guru_bk_id: string;
  tanggal: string;
  jenis_asesmen: string;
  hasil_asesmen: string;
  catatan_profesional: string;
  rekomendasi: string;
  created_at: string;
  updated_at: string;
}

export interface RujukanBK {
  id: string;
  siswa_id: string;
  guru_bk_id: string;
  tanggal: string;
  jenis_rujukan: string;
  tujuan_rujukan: string;
  alasan_rujukan: string;
  status: 'Diusulkan' | 'Disetujui' | 'Berjalan' | 'Selesai';
  hasil_rujukan: string;
  created_at: string;
  updated_at: string;
}

// 17. Master Tatib & Pelanggaran
export interface MasterPoinTatib {
  id: string;
  kode: string;
  nama_pelanggaran: string;
  kategori: 'Perilaku' | 'Kerajinan' | 'Kerapian' | 'Ketertiban' | 'Kehadiran' | 'Kepribadian' | 'Pelanggaran Berat' | string;
  nomor_urut?: number;
  poin: number;
  deskripsi: string;
  aktif: boolean;
  created_at: string;
  updated_at: string;
}

export interface FasePenangananTatib {
  fase: number;
  kategori_pelanggaran: 'Ringan' | 'Sedang' | 'Berat';
  rentang_skor: string;
  min_skor: number;
  max_skor: number;
  tindakan: string;
  penanggung_jawab: string;
}

export interface PenghargaanSkorTatib {
  id: string;
  no: number;
  prestasi_capaian: string;
  skor_pengurang: number;
  kategori: string;
}

export interface AcuanSkorBawaan {
  no: number;
  kategori_murid: string;
  capaian_skor: string;
  persentase_bawaan: number;
  contoh_capaian: number;
  contoh_bawaan: number;
}

export interface Pelanggaran {
  id: string;
  siswa_id: string;
  petugas_id: string;
  tanggal: string;
  waktu: string;
  jenis_pelanggaran_id: string;
  kategori: string;
  poin: number;
  uraian: string;
  tindakan_awal: string;
  status: 'Tercatat' | 'Diproses' | 'Selesai';
  created_at: string;
  updated_at: string;
}

// 18. Pembinaan Kesiswaan
export interface PembinaanKesiswaan {
  id: string;
  siswa_id: string;
  petugas_id: string;
  pelanggaran_id: string | null;
  tanggal: string;
  jenis_pembinaan: string;
  uraian: string;
  pihak_dilibatkan: string;
  hasil: string;
  rencana_tindak_lanjut: string;
  status: 'Tahap 1' | 'Tahap 2' | 'Tahap 3' | 'Selesai';
  dokumentasi_url: string | null;
  created_at: string;
  updated_at: string;
}

// 19. Surat Panggilan Ortu
export interface SuratPanggilanOrtu {
  id: string;
  siswa_id: string;
  petugas_id: string;
  nomor_surat: string;
  tanggal: string;
  alasan: string;
  jadwal: string;
  waktu: string;
  status: 'Diterbitkan' | 'Terkirim' | 'Hadir' | 'Tidak Hadir';
  hasil: string;
  created_at: string;
}

// 20. Berita Acara
export interface BeritaAcara {
  id: string;
  siswa_id: string;
  petugas_id: string;
  jenis: string;
  nomor: string;
  tanggal: string;
  isi: string;
  status: 'Draft' | 'Disahkan';
  file_url: string | null;
  created_at: string;
}

// 21. Kontrak Pembinaan
export interface KontrakPembinaan {
  id: string;
  siswa_id: string;
  petugas_id: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  isi_kesepakatan: string;
  target: string;
  status: 'Aktif' | 'Terpenuhi' | 'Melanggar';
  file_url: string | null;
  created_at: string;
  updated_at: string;
}

// 22. Keterlambatan
export interface Keterlambatan {
  id: string;
  siswa_id: string;
  tanggal: string;
  waktu: string;
  petugas_id: string;
  alasan: string;
  tindakan: string;
  status: 'Tercatat' | 'Diberi Pembinaan';
  created_at: string;
}

// 23. Ketidakhadiran
export interface Ketidakhadiran {
  id: string;
  siswa_id: string;
  tanggal: string;
  jenis: 'Sakit' | 'Izin' | 'Alpa' | 'Dispensasi';
  keterangan: string;
  petugas_id: string;
  created_at: string;
}

// 24. Pusat Koordinasi Siswa
export type StatusKoordinasi = 
  | 'Baru'
  | 'Diproses'
  | 'Koordinasi'
  | 'Tindak Lanjut'
  | 'Monitoring'
  | 'Selesai';

export interface KoordinasiSiswa {
  id: string;
  nomor_kasus: string; // KS-2026-000001
  siswa_id: string;
  pelapor_id: string;
  kategori_masalah: string;
  tanggal_laporan: string;
  penanggung_jawab_id: string;
  target_penyelesaian: string;
  status: StatusKoordinasi;
  informasi_koordinasi: string;
  rekomendasi_umum: string;
  created_at: string;
  updated_at: string;
}

// 25. Penugasan Tindak Lanjut
export interface PenugasanTindakLanjut {
  id: string;
  koordinasi_id: string;
  ditugaskan_kepada: string;
  ditugaskan_oleh: string;
  tanggal_penugasan: string;
  target_penyelesaian: string;
  tugas: string;
  hasil: string | null;
  status: 'Menunggu' | 'Dikerjakan' | 'Selesai';
  created_at: string;
  updated_at: string;
}

// 26. Riwayat Status Kasus
export interface RiwayatStatusKasus {
  id: string;
  koordinasi_id: string;
  status_lama: string;
  status_baru: string;
  diubah_oleh: string;
  catatan: string;
  created_at: string;
}

// 27. Prestasi Siswa
export interface PrestasiSiswa {
  id: string;
  siswa_id: string;
  nama_prestasi: string;
  tingkat: 'Sekolah' | 'Kecamatan' | 'Kabupaten/Kota' | 'Provinsi' | 'Nasional' | 'Internasional';
  kategori: 'Akademik' | 'Non-Akademik' | 'Kejuruan / LKS' | 'Seni & Olahraga';
  peringkat: string;
  tanggal: string;
  penyelenggara: string;
  keterangan: string;
  dokumentasi_url: string | null;
  created_at: string;
}

// 28. OSIS / MPK
export interface KegiatanOSIS {
  id: string;
  nama_kegiatan: string;
  jenis_organisasi: 'OSIS' | 'MPK';
  tanggal_mulai: string;
  tanggal_selesai: string;
  penanggung_jawab: string;
  deskripsi: string;
  status: 'Perencanaan' | 'Terlaksana' | 'Selesai Evaluasi';
  dokumentasi_url: string | null;
  created_at: string;
}

// 29. Ekstrakurikuler
export interface KegiatanEkstrakurikuler {
  id: string;
  nama_ekstrakurikuler: string;
  pembina_id: string;
  tanggal: string;
  kegiatan: string;
  hasil: string;
  dokumentasi_url: string | null;
  status: 'Aktif' | 'Terlaksana';
  created_at: string;
}

// 30. Audit Log
export interface AuditLog {
  id: string;
  user_id: string;
  action: 'LOGIN' | 'LOGOUT' | 'CREATE' | 'READ_RESTRICTED' | 'UPDATE' | 'DELETE' | 'CHANGE_ROLE' | 'ACCESS_BK_RESTRICTED';
  table_name: string;
  record_id: string | null;
  description: string;
  created_at: string;
}

// 31. Notifikasi
export interface Notification {
  id: string;
  user_id: string;
  judul: string;
  pesan: string;
  jenis: 'info' | 'warning' | 'koordinasi' | 'tindak_lanjut';
  referensi_id: string | null;
  dibaca: boolean;
  created_at: string;
}
