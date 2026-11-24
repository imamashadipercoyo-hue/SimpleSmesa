import {
  Role,
  Guru,
  KompetensiKeahlian,
  TahunPelajaran,
  Kelas,
  Siswa,
  PenugasanGuru,
  Profile,
  MasterPoinTatib,
  FasePenangananTatib,
  PenghargaanSkorTatib,
  AcuanSkorBawaan,
  JurnalGuruWali,
  JurnalWaliKelas,
  JurnalKKK,
  JurnalBK,
  KonselingRestricted,
  AsesmenBKRestricted,
  RujukanBK,
  Pelanggaran,
  PembinaanKesiswaan,
  Keterlambatan,
  Ketidakhadiran,
  KoordinasiSiswa,
  PenugasanTindakLanjut,
  RiwayatStatusKasus,
  PrestasiSiswa,
  KegiatanOSIS,
  KegiatanEkstrakurikuler,
  AuditLog,
  Notification
} from '../types/database';

export const SEED_ROLES: Role[] = [
  { id: 'role-admin', kode: 'admin', nama: 'Administrator', deskripsi: 'Pengelola sistem, data master, dan hak akses', created_at: '2026-01-01T00:00:00Z' },
  { id: 'role-kepsek', kode: 'kepala_sekolah', nama: 'Kepala Sekolah', deskripsi: 'Akses manajerial dan laporan strategis sekolah', created_at: '2026-01-01T00:00:00Z' },
  { id: 'role-waka', kode: 'waka_kesiswaan', nama: 'Waka Kesiswaan', deskripsi: 'Monitoring ketertiban, pembinaan, dan rekap layanan siswa', created_at: '2026-01-01T00:00:00Z' },
  { id: 'role-guru-wali', kode: 'guru_wali', nama: 'Guru Wali', deskripsi: 'Pendampingan khusus siswa asuh dampingan', created_at: '2026-01-01T00:00:00Z' },
  { id: 'role-wali-kelas', kode: 'wali_kelas', nama: 'Wali Kelas', deskripsi: 'Pembinaan dan monitoring siswa dalam kelas binaan', created_at: '2026-01-01T00:00:00Z' },
  { id: 'role-kkk', kode: 'kkk', nama: 'KKK (Ketua Konsentrasi Keahlian)', deskripsi: 'Monitoring siswa dalam kompetensi keahlian kejuruan', created_at: '2026-01-01T00:00:00Z' },
  { id: 'role-guru-bk', kode: 'guru_bk', nama: 'Guru BK', deskripsi: 'Bimbingan konseling dan catatan psikologis khusus', created_at: '2026-01-01T00:00:00Z' },
  { id: 'role-kesiswaan', kode: 'kesiswaan', nama: 'Tim Kesiswaan', deskripsi: 'Penegakan tata tertib, poin pelanggaran, dan pembinaan', created_at: '2026-01-01T00:00:00Z' },
];

export const SEED_KOMPETENSI: KompetensiKeahlian[] = [
  { id: 'kk-rpl', kode: 'RPL', nama: 'Rekayasa Perangkat Lunak', aktif: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'kk-tkj', kode: 'TKJ', nama: 'Teknik Komputer & Jaringan', aktif: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'kk-dkv', kode: 'DKV', nama: 'Desain Komunikasi Visual', aktif: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'kk-akl', kode: 'AKL', nama: 'Akuntansi & Keuangan Lembaga', aktif: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'kk-bdp', kode: 'BDP', nama: 'Bisnis Daring & Pemasaran', aktif: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'kk-mplb', kode: 'MPLB', nama: 'Manajemen Perkantoran & Layanan Bisnis', aktif: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'kk-ulp', kode: 'ULP', nama: 'Usaha Layanan Pariwisata', aktif: true, created_at: '2026-01-01T00:00:00Z' },
];

export const SEED_TAHUN_PELAJARAN: TahunPelajaran[] = [
  { id: 'tp-2025-2026', nama: '2025/2026', tanggal_mulai: '2025-07-14', tanggal_selesai: '2026-06-25', semester_aktif: 'Genap', aktif: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'tp-2024-2025', nama: '2024/2025', tanggal_mulai: '2024-07-15', tanggal_selesai: '2025-06-20', semester_aktif: 'Genap', aktif: false, created_at: '2025-01-01T00:00:00Z' },
];

export const SEED_GURU: Guru[] = [
  { id: 'guru-admin', nip: '198503152010011002', nama_lengkap: 'Bambang Sudarmono, S.Kom', email: 'admin@smkn1jember.sch.id', no_hp: '081234567890', jabatan: 'Koordinator IT & Admin SIMPEL', status_aktif: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'guru-kepsek', nip: '196805121994031005', nama_lengkap: 'Drs. H. Sri Sugeng, M.Pd', email: 'kepsek@smkn1jember.sch.id', no_hp: '081234567891', jabatan: 'Kepala SMKN 1 Jember', status_aktif: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'guru-waka', nip: '197408221999032001', nama_lengkap: 'Rina Puspitasari, S.Pd, M.M', email: 'waka.kesiswaan@smkn1jember.sch.id', no_hp: '081234567892', jabatan: 'Waka Bidang Kesiswaan', status_aktif: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'guru-wali', nip: '198210102008011015', nama_lengkap: 'Ahmad Fauzan, S.Pd', email: 'guru.wali@smkn1jember.sch.id', no_hp: '081234567893', jabatan: 'Guru Wali & Pembimbing Siswa', status_aktif: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'guru-wali-kelas', nip: '198704182011012012', nama_lengkap: 'Siti Nurhaliza, S.Pd', email: 'wali.kelas@smkn1jember.sch.id', no_hp: '081234567894', jabatan: 'Wali Kelas XI RPL 1', status_aktif: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'guru-kkk', nip: '198002142006041009', nama_lengkap: 'Hendra Setiawan, S.Kom', email: 'kkk.rpl@smkn1jember.sch.id', no_hp: '081234567895', jabatan: 'Ketua Konsentrasi Keahlian RPL', status_aktif: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'guru-bk', nip: '197909052005012008', nama_lengkap: 'Dra. Endang Lestari, M.Psi', email: 'bk@smkn1jember.sch.id', no_hp: '081234567896', jabatan: 'Koordinator Guru BK', status_aktif: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'guru-kesiswaan', nip: '198311282009021004', nama_lengkap: 'Agus Prasetyo, S.Pd', email: 'kesiswaan@smkn1jember.sch.id', no_hp: '081234567897', jabatan: 'Ketua Tim Penegak Disiplin & Tatib', status_aktif: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
];

export const SEED_KELAS: Kelas[] = [
  { id: 'kelas-xi-rpl-1', nama_kelas: 'XI RPL 1', tingkat: 11, kompetensi_keahlian_id: 'kk-rpl', tahun_pelajaran_id: 'tp-2025-2026', wali_kelas_id: 'guru-wali-kelas', aktif: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'kelas-x-tkj-1', nama_kelas: 'X TKJ 1', tingkat: 10, kompetensi_keahlian_id: 'kk-tkj', tahun_pelajaran_id: 'tp-2025-2026', wali_kelas_id: 'guru-wali', aktif: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'kelas-xi-dkv-1', nama_kelas: 'XI DKV 1', tingkat: 11, kompetensi_keahlian_id: 'kk-dkv', tahun_pelajaran_id: 'tp-2025-2026', wali_kelas_id: 'guru-kesiswaan', aktif: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'kelas-xii-akl-1', nama_kelas: 'XII AKL 1', tingkat: 12, kompetensi_keahlian_id: 'kk-akl', tahun_pelajaran_id: 'tp-2025-2026', wali_kelas_id: 'guru-waka', aktif: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'kelas-x-bdp-1', nama_kelas: 'X BDP 1', tingkat: 10, kompetensi_keahlian_id: 'kk-bdp', tahun_pelajaran_id: 'tp-2025-2026', wali_kelas_id: 'guru-admin', aktif: true, created_at: '2026-01-01T00:00:00Z' },
];

export const SEED_SISWA: Siswa[] = [
  {
    id: 'siswa-01',
    nis: '2324101',
    nisn: '0078912341',
    nama_lengkap: 'Muhammad Dimas Prasetya',
    jenis_kelamin: 'L',
    tanggal_lahir: '2008-04-12',
    alamat: 'Jl. Mastrip Timur No. 45, Sumbersari, Jember',
    nama_orang_tua: 'Bambang Prasetya',
    no_hp_orang_tua: '085234112233',
    kelas_id: 'kelas-xi-rpl-1',
    kompetensi_keahlian_id: 'kk-rpl',
    tahun_pelajaran_id: 'tp-2025-2026',
    status: 'Aktif',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'siswa-02',
    nis: '2324102',
    nisn: '0078912342',
    nama_lengkap: 'Sarah Amelia Putri',
    jenis_kelamin: 'P',
    tanggal_lahir: '2008-07-25',
    alamat: 'Jl. Kalimantan No. 12, Patrang, Jember',
    nama_orang_tua: 'H. Suwandi',
    no_hp_orang_tua: '085234112244',
    kelas_id: 'kelas-xi-rpl-1',
    kompetensi_keahlian_id: 'kk-rpl',
    tahun_pelajaran_id: 'tp-2025-2026',
    status: 'Aktif',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'siswa-03',
    nis: '2324103',
    nisn: '0078912343',
    nama_lengkap: 'Rizky Kurniawan Pratama',
    jenis_kelamin: 'L',
    tanggal_lahir: '2008-01-18',
    alamat: 'Jl. PB Sudirman No. 88, Kaliwates, Jember',
    nama_orang_tua: 'Kurniawan Santoso',
    no_hp_orang_tua: '085234112255',
    kelas_id: 'kelas-xi-rpl-1',
    kompetensi_keahlian_id: 'kk-rpl',
    tahun_pelajaran_id: 'tp-2025-2026',
    status: 'Aktif',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'siswa-04',
    nis: '2425201',
    nisn: '0081234561',
    nama_lengkap: 'Fajar Hidayatullah',
    jenis_kelamin: 'L',
    tanggal_lahir: '2009-02-14',
    alamat: 'Jl. Hayam Wuruk No. 20, Mangli, Jember',
    nama_orang_tua: 'Supriyanto',
    no_hp_orang_tua: '081333444555',
    kelas_id: 'kelas-x-tkj-1',
    kompetensi_keahlian_id: 'kk-tkj',
    tahun_pelajaran_id: 'tp-2025-2026',
    status: 'Aktif',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'siswa-05',
    nis: '2425202',
    nisn: '0081234562',
    nama_lengkap: 'Nabila Putri Cahyani',
    jenis_kelamin: 'P',
    tanggal_lahir: '2009-09-03',
    alamat: 'Jl. Tidar No. 104, Sumbersari, Jember',
    nama_orang_tua: 'Agus Cahyono',
    no_hp_orang_tua: '081333444666',
    kelas_id: 'kelas-x-tkj-1',
    kompetensi_keahlian_id: 'kk-tkj',
    tahun_pelajaran_id: 'tp-2025-2026',
    status: 'Aktif',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'siswa-06',
    nis: '2324301',
    nisn: '0076543211',
    nama_lengkap: 'Kevin Ananda Wijaya',
    jenis_kelamin: 'L',
    tanggal_lahir: '2008-05-11',
    alamat: 'Jl. Gajah Mada No. 15, Kaliwates, Jember',
    nama_orang_tua: 'Wijaya Kusuma',
    no_hp_orang_tua: '082199887766',
    kelas_id: 'kelas-xi-dkv-1',
    kompetensi_keahlian_id: 'kk-dkv',
    tahun_pelajaran_id: 'tp-2025-2026',
    status: 'Aktif',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'siswa-07',
    nis: '2223401',
    nisn: '0069988771',
    nama_lengkap: 'Anisa Rahmawati',
    jenis_kelamin: 'P',
    tanggal_lahir: '2007-11-20',
    alamat: 'Jl. Panjaitan No. 40, Jember',
    nama_orang_tua: 'Rahmad Hidayat',
    no_hp_orang_tua: '082334455667',
    kelas_id: 'kelas-xii-akl-1',
    kompetensi_keahlian_id: 'kk-akl',
    tahun_pelajaran_id: 'tp-2025-2026',
    status: 'Aktif',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  }
];

// Guru Wali Ahmad Fauzan is assigned to:
// siswa-01 (Dimas), siswa-02 (Sarah), siswa-05 (Nabila)
export const SEED_PENUGASAN: PenugasanGuru[] = [
  // Guru Wali assignments (Specific Students)
  { id: 'pg-gw-01', guru_id: 'guru-wali', role_id: 'role-guru-wali', kelas_id: null, kompetensi_keahlian_id: null, siswa_id: 'siswa-01', tahun_pelajaran_id: 'tp-2025-2026', aktif: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'pg-gw-02', guru_id: 'guru-wali', role_id: 'role-guru-wali', kelas_id: null, kompetensi_keahlian_id: null, siswa_id: 'siswa-02', tahun_pelajaran_id: 'tp-2025-2026', aktif: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'pg-gw-03', guru_id: 'guru-wali', role_id: 'role-guru-wali', kelas_id: null, kompetensi_keahlian_id: null, siswa_id: 'siswa-05', tahun_pelajaran_id: 'tp-2025-2026', aktif: true, created_at: '2026-01-01T00:00:00Z' },

  // Wali Kelas Siti Nurhaliza assigned to XI RPL 1
  { id: 'pg-wk-01', guru_id: 'guru-wali-kelas', role_id: 'role-wali-kelas', kelas_id: 'kelas-xi-rpl-1', kompetensi_keahlian_id: null, siswa_id: null, tahun_pelajaran_id: 'tp-2025-2026', aktif: true, created_at: '2026-01-01T00:00:00Z' },

  // KKK Hendra Setiawan assigned to RPL
  { id: 'pg-kkk-01', guru_id: 'guru-kkk', role_id: 'role-kkk', kelas_id: null, kompetensi_keahlian_id: 'kk-rpl', siswa_id: null, tahun_pelajaran_id: 'tp-2025-2026', aktif: true, created_at: '2026-01-01T00:00:00Z' },

  // Guru BK Dra. Endang
  { id: 'pg-bk-01', guru_id: 'guru-bk', role_id: 'role-guru-bk', kelas_id: null, kompetensi_keahlian_id: null, siswa_id: null, tahun_pelajaran_id: 'tp-2025-2026', aktif: true, created_at: '2026-01-01T00:00:00Z' },

  // Tim Kesiswaan Agus Prasetyo
  { id: 'pg-kes-01', guru_id: 'guru-kesiswaan', role_id: 'role-kesiswaan', kelas_id: null, kompetensi_keahlian_id: null, siswa_id: null, tahun_pelajaran_id: 'tp-2025-2026', aktif: true, created_at: '2026-01-01T00:00:00Z' },
];

export const SEED_PROFILES: Profile[] = [
  { id: 'user-admin', nama_lengkap: 'Bambang Sudarmono, S.Kom', email: 'admin@smkn1jember.sch.id', nip: '198503152010011002', role_id: 'role-admin', guru_id: 'guru-admin', role_kode: 'admin', aktif: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'user-kepsek', nama_lengkap: 'Drs. H. Sri Sugeng, M.Pd', email: 'kepsek@smkn1jember.sch.id', nip: '196805121994031005', role_id: 'role-kepsek', guru_id: 'guru-kepsek', role_kode: 'kepala_sekolah', aktif: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'user-waka', nama_lengkap: 'Rina Puspitasari, S.Pd, M.M', email: 'waka.kesiswaan@smkn1jember.sch.id', nip: '197408221999032001', role_id: 'role-waka', guru_id: 'guru-waka', role_kode: 'waka_kesiswaan', aktif: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'user-guru-wali', nama_lengkap: 'Ahmad Fauzan, S.Pd', email: 'guru.wali@smkn1jember.sch.id', nip: '198210102008011015', role_id: 'role-guru-wali', guru_id: 'guru-wali', role_kode: 'guru_wali', aktif: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'user-wali-kelas', nama_lengkap: 'Siti Nurhaliza, S.Pd', email: 'wali.kelas@smkn1jember.sch.id', nip: '198704182011012012', role_id: 'role-wali-kelas', guru_id: 'guru-wali-kelas', role_kode: 'wali_kelas', aktif: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'user-kkk', nama_lengkap: 'Hendra Setiawan, S.Kom', email: 'kkk.rpl@smkn1jember.sch.id', nip: '198002142006041009', role_id: 'role-kkk', guru_id: 'guru-kkk', role_kode: 'kkk', aktif: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'user-guru-bk', nama_lengkap: 'Dra. Endang Lestari, M.Psi', email: 'bk@smkn1jember.sch.id', nip: '197909052005012008', role_id: 'role-guru-bk', guru_id: 'guru-bk', role_kode: 'guru_bk', aktif: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'user-kesiswaan', nama_lengkap: 'Agus Prasetyo, S.Pd', email: 'kesiswaan@smkn1jember.sch.id', nip: '198311282009021004', role_id: 'role-kesiswaan', guru_id: 'guru-kesiswaan', role_kode: 'kesiswaan', aktif: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
];

// ============================================================================
// DOKUMEN RESMI: SKORING TATA TERTIB SEKOLAH - SMK NEGERI 1 JEMBER
// Ditetapkan di Jember, 3 Agustus 2026 oleh Kepala Sekolah SRI HARTATIK, M.Pd.
// ============================================================================

export const SEED_MASTER_TATIB: MasterPoinTatib[] = [
  // --------------------------------------------------------------------------
  // A. PERILAKU (35 Pelanggaran Baku)
  // --------------------------------------------------------------------------
  { id: 'tatib-a-01', kode: 'TATIB-PRL-01', nomor_urut: 1, kategori: 'Perilaku', nama_pelanggaran: 'Tidak membawa buku sesuai jadwal', poin: 5, deskripsi: 'Wajib membawa buku mata pelajaran sesuai jadwal harian.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-a-02', kode: 'TATIB-PRL-02', nomor_urut: 2, kategori: 'Perilaku', nama_pelanggaran: 'Menyontek', poin: 5, deskripsi: 'Tidak jujur saat ulangan, asesmen, atau ujian.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-a-03', kode: 'TATIB-PRL-03', nomor_urut: 3, kategori: 'Perilaku', nama_pelanggaran: 'Membuat kegaduhan di kelas atau di sekolah', poin: 10, deskripsi: 'Mengganggu ketenangan kegiatan belajar mengajar.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-a-04', kode: 'TATIB-PRL-04', nomor_urut: 4, kategori: 'Perilaku', nama_pelanggaran: 'Membawa atau bermain kartu remi dan domino di sekolah', poin: 10, deskripsi: 'Larangan membawa dan bermain kartu di lingkungan sekolah.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-a-05', kode: 'TATIB-PRL-05', nomor_urut: 5, kategori: 'Perilaku', nama_pelanggaran: 'Memarkir sepeda/sepeda motor tidak pada tempatnya', poin: 10, deskripsi: 'Parkir kendaraan di luar zona parkir resmi siswa.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-a-06', kode: 'TATIB-PRL-06', nomor_urut: 6, kategori: 'Perilaku', nama_pelanggaran: 'Bermain bola di koridor dan di dalam kelas', poin: 10, deskripsi: 'Bermain bola membahayakan kaca, sarana, dan ketertiban.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-a-07', kode: 'TATIB-PRL-07', nomor_urut: 7, kategori: 'Perilaku', nama_pelanggaran: 'Mencoret-coret atau mengotori dinding, pintu, meja, kursi, dan/atau pagar sekolah', poin: 15, deskripsi: 'Vandalisme terhadap fasilitas belajar sekolah.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-a-08', kode: 'TATIB-PRL-08', nomor_urut: 8, kategori: 'Perilaku', nama_pelanggaran: 'Melindungi teman yang bersalah (dalam pelanggaran ringan)', poin: 15, deskripsi: 'Menyembunyikan fakta pelanggaran tatib ringan.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-a-09', kode: 'TATIB-PRL-09', nomor_urut: 9, kategori: 'Perilaku', nama_pelanggaran: 'Menghidupkan/bermain hp waktu KBM (tanpa ijin guru)', poin: 20, deskripsi: 'Menggunakan gawai untuk kepentingan di luar pembelajaran.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-a-10', kode: 'TATIB-PRL-10', nomor_urut: 10, kategori: 'Perilaku', nama_pelanggaran: 'Merayakan ulang tahun berlebihan', poin: 20, deskripsi: 'Perayaan berlebihan seperti melempar telur/tepung/air kotor.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-a-11', kode: 'TATIB-PRL-11', nomor_urut: 11, kategori: 'Perilaku', nama_pelanggaran: 'Melindungi teman yang bersalah (dalam pelanggaran sedang)', poin: 50, deskripsi: 'Menghalangi penanganan pelanggaran kategori sedang.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-a-12', kode: 'TATIB-PRL-12', nomor_urut: 12, kategori: 'Perilaku', nama_pelanggaran: 'Membawa atau menyembunyikan petasan', poin: 50, deskripsi: 'Membawa bahan peledak/petasan di lingkungan sekolah.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-a-13', kode: 'TATIB-PRL-13', nomor_urut: 13, kategori: 'Perilaku', nama_pelanggaran: 'Membuat surat izin palsu', poin: 50, deskripsi: 'Memalsukan tanda tangan orang tua/dokter.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-a-14', kode: 'TATIB-PRL-14', nomor_urut: 14, kategori: 'Perilaku', nama_pelanggaran: 'Tidak melaksanakan ketentuan keagamaan yang dianut', poin: 50, deskripsi: 'Mengabaikan kewajiban ibadah/ketentuan keagamaan resmi.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-a-15', kode: 'TATIB-PRL-15', nomor_urut: 15, kategori: 'Perilaku', nama_pelanggaran: 'Meloncat jendela dan pagar sekolah', poin: 50, deskripsi: 'Menerobos batas pengamanan sekolah.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-a-16', kode: 'TATIB-PRL-16', nomor_urut: 16, kategori: 'Perilaku', nama_pelanggaran: 'Meninggalkan lokasi sekolah tanpa izin', poin: 50, deskripsi: 'Keluar area sekolah pada jam sekolah tanpa izin piket/tatib.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-a-17', kode: 'TATIB-PRL-17', nomor_urut: 17, kategori: 'Perilaku', nama_pelanggaran: 'Melindungi teman yang bersalah (dalam pelanggaran berat)', poin: 75, deskripsi: 'Konspirasi menutupi pelanggaran berat.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-a-18', kode: 'TATIB-PRL-18', nomor_urut: 18, kategori: 'Perilaku', nama_pelanggaran: 'Menyalahgunakan uang sekolah', poin: 75, deskripsi: 'Penggelapan iuran kelas/organisasi/keperluan sekolah.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-a-19', kode: 'TATIB-PRL-19', nomor_urut: 19, kategori: 'Perilaku', nama_pelanggaran: 'Berpacaran di sekolah', poin: 100, deskripsi: 'Melakukan tindakan asusila ringan/berpacaran di area sekolah.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-a-20', kode: 'TATIB-PRL-20', nomor_urut: 20, kategori: 'Perilaku', nama_pelanggaran: 'Membawa/menyimpan rokok dan/atau merokok di sekolah', poin: 100, deskripsi: 'Membawa, menyimpan rokok konvensional maupun elektrik (vape).', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-a-21', kode: 'TATIB-PRL-21', nomor_urut: 21, kategori: 'Perilaku', nama_pelanggaran: 'Merusak sarana dan prasarana sekolah', poin: 100, deskripsi: 'Perusakan disengaja terhadap aset/perangkat praktikum sekolah.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-a-22', kode: 'TATIB-PRL-22', nomor_urut: 22, kategori: 'Perilaku', nama_pelanggaran: 'Mengancam/mengintimidasi teman sekelas dan/atau teman sekolah', poin: 150, deskripsi: 'Tindakan perundungan (bullying), intimidasi verbal/fisik antarsiswa.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-a-23', kode: 'TATIB-PRL-23', nomor_urut: 23, kategori: 'Perilaku', nama_pelanggaran: 'Mengikuti aliran, perkumpulan, geng terlarang, komunitas LGBT, dan/atau radikalisme', poin: 150, deskripsi: 'Keterlibatan dalam kelompok terlarang dan paham radikalisme.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-a-24', kode: 'TATIB-PRL-24', nomor_urut: 24, kategori: 'Perilaku', nama_pelanggaran: 'Mengancam/mengintimidasi kepala sekolah, guru, dan/atau karyawan sekolah', poin: 175, deskripsi: 'Pelanggaran etika berat dan intimidasi terhadap pendidik/tenaga kependidikan.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-a-25', kode: 'TATIB-PRL-25', nomor_urut: 25, kategori: 'Perilaku', nama_pelanggaran: 'Terlibat langsung maupun tidak langsung perkelahian/tawuran di sekolah, di luar sekolah, dan atau antar sekolah (Terlibat tindakan kriminal dan/atau mencemarkan nama baik sekolah)', poin: 175, deskripsi: 'Tawuran, pengeroyokan, atau tindak kriminalitas kekerasan.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-a-26', kode: 'TATIB-PRL-26', nomor_urut: 26, kategori: 'Perilaku', nama_pelanggaran: 'Menyalahgunakan media sosial dan merugikan pihak lain yang berhubungan dengan sekolah', poin: 200, deskripsi: 'Pencemaran nama baik, cyberbullying, ujaran kebencian di media sosial.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-a-27', kode: 'TATIB-PRL-27', nomor_urut: 27, kategori: 'Perilaku', nama_pelanggaran: 'Berperilaku jorok dan/atau asusila baik di dalam maupun di luar sekolah', poin: 200, deskripsi: 'Tindakan asusila, pelecehan seksual, perilaku tidak senonoh.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-a-28', kode: 'TATIB-PRL-28', nomor_urut: 28, kategori: 'Perilaku', nama_pelanggaran: 'Berjudi dalam bentuk apapun di sekolah', poin: 200, deskripsi: 'Judi langsung maupun online dalam lingkungan sekolah.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-a-29', kode: 'TATIB-PRL-29', nomor_urut: 29, kategori: 'Perilaku', nama_pelanggaran: 'Memalsukan stempel sekolah, edaran sekolah, dan/atau tanda tangan kepala sekolah, komite, orang tua, guru, dan/atau karyawan', poin: 250, deskripsi: 'Tindak pemalsuan dokumen resmi sekolah.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-a-30', kode: 'TATIB-PRL-30', nomor_urut: 30, kategori: 'Perilaku', nama_pelanggaran: 'Mencuri di sekolah dan/atau di luar sekolah', poin: 250, deskripsi: 'Tindak pidana pencurian aset sekolah atau barang orang lain.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-a-31', kode: 'TATIB-PRL-31', nomor_urut: 31, kategori: 'Perilaku', nama_pelanggaran: 'Membawa dan/atau menyalahgunakan senjata tajam dan/atau senjata api', poin: 250, deskripsi: 'Membawa senjata berbahaya yang mengancam keselamatan jiwa.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-a-32', kode: 'TATIB-PRL-32', nomor_urut: 32, kategori: 'Perilaku', nama_pelanggaran: 'Membawa, menggunakan, dan/atau mengedarkan minuman keras dan/atau NAPZA', poin: 250, deskripsi: 'Narkotika, psikotropika, zat adiktif, dan minuman beralkohol.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-a-33', kode: 'TATIB-PRL-33', nomor_urut: 33, kategori: 'Perilaku', nama_pelanggaran: 'Membawa dan atau membuat konten porno, buku porno, majalah porno, dan/atau sesuatu yang berbau pornografi dan pornoaksi', poin: 250, deskripsi: 'Distribusi atau kepemilikan materi pornografi dan pornoaksi.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-a-34', kode: 'TATIB-PRL-34', nomor_urut: 34, kategori: 'Perilaku', nama_pelanggaran: 'Terbukti hamil atau menghamili', poin: 250, deskripsi: 'Pelanggaran norma berat susila.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-a-35', kode: 'TATIB-PRL-35', nomor_urut: 35, kategori: 'Perilaku', nama_pelanggaran: 'Terbukti menikah', poin: 250, deskripsi: 'Menikah selama masa pendidikan aktif jenjang SMK.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },

  // --------------------------------------------------------------------------
  // B. KERAJINAN (14 Pelanggaran Baku)
  // --------------------------------------------------------------------------
  { id: 'tatib-b-01', kode: 'TATIB-KRJ-01', nomor_urut: 1, kategori: 'Kerajinan', nama_pelanggaran: 'Terlambat masuk kelas saat pergantian jam pelajaran', poin: 5, deskripsi: 'Tidak berada di kelas saat guru pelajaran berikutnya hadir.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-b-02', kode: 'TATIB-KRJ-02', nomor_urut: 2, kategori: 'Kerajinan', nama_pelanggaran: 'Terlambat masuk kelas saat selesai jam istirahat', poin: 5, deskripsi: 'Tidak tepat waktu masuk kelas pasca bel tanda istirahat selesai.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-b-03', kode: 'TATIB-KRJ-03', nomor_urut: 3, kategori: 'Kerajinan', nama_pelanggaran: 'Tidak mengikuti dan melaksanakan piket 7k', poin: 5, deskripsi: 'Mengabaikan tugas kebersihan dan ketertiban piket kelas.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-b-04', kode: 'TATIB-KRJ-04', nomor_urut: 4, kategori: 'Kerajinan', nama_pelanggaran: 'Tidur di kelas saat pelajaran berlangsung', poin: 5, deskripsi: 'Tidur saat kegiatan belajar mengajar tanpa izin kesehatan.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-b-05', kode: 'TATIB-KRJ-05', nomor_urut: 5, kategori: 'Kerajinan', nama_pelanggaran: 'Tidak membawa buku yang berkaitan dengan pelajaran', poin: 5, deskripsi: 'Kelalaian membawa perangkat dan buku modul materi.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-b-06', kode: 'TATIB-KRJ-06', nomor_urut: 6, kategori: 'Kerajinan', nama_pelanggaran: 'Datang terlambat', poin: 10, deskripsi: 'Hadir melewati batas waktu apel/bel masuk gerbang pagi.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-b-07', kode: 'TATIB-KRJ-07', nomor_urut: 7, kategori: 'Kerajinan', nama_pelanggaran: 'Tidak mengikuti pelajaran tanpa izin', poin: 15, deskripsi: 'Menghindari jam mata pelajaran tertentu di lingkungan sekolah.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-b-08', kode: 'TATIB-KRJ-08', nomor_urut: 8, kategori: 'Kerajinan', nama_pelanggaran: 'Meninggalkan kelas tanpa izin', poin: 15, deskripsi: 'Keluar ruangan kelas pada saat KBM berlangsung tanpa izin guru pengajar.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-b-09', kode: 'TATIB-KRJ-09', nomor_urut: 9, kategori: 'Kerajinan', nama_pelanggaran: 'Di kantin saat jam pelajaran', poin: 20, deskripsi: 'Nongkrong/makan di kantin pada jam efektif pelajaran berlangsung.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-b-10', kode: 'TATIB-KRJ-10', nomor_urut: 10, kategori: 'Kerajinan', nama_pelanggaran: 'Tidak masuk sekolah tanpa keterangan (alpa)', poin: 20, deskripsi: 'Ketidakhadiran tanpa surat dokter atau keterangan resmi orang tua.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-b-11', kode: 'TATIB-KRJ-11', nomor_urut: 11, kategori: 'Kerajinan', nama_pelanggaran: 'Tidak mengikuti upacara', poin: 20, deskripsi: 'Tidak hadir dalam upacara bendera hari Senin atau hari besar nasional.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-b-12', kode: 'TATIB-KRJ-12', nomor_urut: 12, kategori: 'Kerajinan', nama_pelanggaran: 'Tidak mengikuti kegiatan sekolah', poin: 20, deskripsi: 'Menghindar dari kegiatan resmi/peringatan yang diadakan sekolah.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-b-13', kode: 'TATIB-KRJ-13', nomor_urut: 13, kategori: 'Kerajinan', nama_pelanggaran: 'Tidak mengikuti ekstrakulikuler (kelas X)', poin: 20, deskripsi: 'Siswa kelas X wajib mengikuti ekstrakurikuler pilihan dan kepanduan.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-b-14', kode: 'TATIB-KRJ-14', nomor_urut: 14, kategori: 'Kerajinan', nama_pelanggaran: 'Pulang sebelum waktu bel pulang berbunyi tanpa izin', poin: 25, deskripsi: 'Meninggalkan sekolah sebelum berakhirnya jadwal KBM resmi (membolos pulang).', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },

  // --------------------------------------------------------------------------
  // C. KERAPIAN (13 Pelanggaran Baku - Masing-masing 10 Poin)
  // --------------------------------------------------------------------------
  { id: 'tatib-c-01', kode: 'TATIB-RAP-01', nomor_urut: 1, kategori: 'Kerapian', nama_pelanggaran: 'Tidak berseragam sesuai dengan ketentuan', poin: 10, deskripsi: 'Memakai seragam yang tidak sesuai dengan jadwal harian sekolah.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-c-02', kode: 'TATIB-RAP-02', nomor_urut: 2, kategori: 'Kerapian', nama_pelanggaran: 'Tidak memasukkan baju', poin: 10, deskripsi: 'Kemeja seragam dikeluarkan dan tidak dimasukkan ke dalam celana/rok.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-c-03', kode: 'TATIB-RAP-03', nomor_urut: 3, kategori: 'Kerapian', nama_pelanggaran: 'Salah memakai seragam sekolah', poin: 10, deskripsi: 'Tertukar hari pemakaian seragam osis, pramuka, atau kejuruan.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-c-04', kode: 'TATIB-RAP-04', nomor_urut: 4, kategori: 'Kerapian', nama_pelanggaran: 'Melipat lengan baju, baju tidak dikancingkan', poin: 10, deskripsi: 'Lengan baju digulung atau kancing terbuka tidak sopan.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-c-05', kode: 'TATIB-RAP-05', nomor_urut: 5, kategori: 'Kerapian', nama_pelanggaran: 'Seragam yang di corat-coret', poin: 10, deskripsi: 'Terdapat tulisan, gambar, atau coretan pada kain seragam.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-c-06', kode: 'TATIB-RAP-06', nomor_urut: 6, kategori: 'Kerapian', nama_pelanggaran: 'Celana atau rok bawah tidak kelim', poin: 10, deskripsi: 'Ujung bawah celana/rok dibiarkan terurai tanpa jahitan kelim rapi.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-c-07', kode: 'TATIB-RAP-07', nomor_urut: 7, kategori: 'Kerapian', nama_pelanggaran: 'Celana atau rok yang sengaja disobek', poin: 10, deskripsi: 'Memakai pakaian sekolah yang sengaja dimodifikasi robek/sobek.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-c-08', kode: 'TATIB-RAP-08', nomor_urut: 8, kategori: 'Kerapian', nama_pelanggaran: 'Memakai make up, lensa mata, pewarna rambut, pewarna kuku, tindik (untuk laki-laki), kuku panjang', poin: 10, deskripsi: 'Riasan berlebihan, softlens berwarna, cat rambut/kuku, tindik putra.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-c-09', kode: 'TATIB-RAP-09', nomor_urut: 9, kategori: 'Kerapian', nama_pelanggaran: 'Tidak memakai ikat pinggang', poin: 10, deskripsi: 'Wajib menggunakan ikat pinggang hitam standar sekolah.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-c-10', kode: 'TATIB-RAP-10', nomor_urut: 10, kategori: 'Kerapian', nama_pelanggaran: 'Memakai kaos kaki tidak sesuai ketentuan', poin: 10, deskripsi: 'Kaos kaki harus putih/hitam sesuai tata tertib seragam.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-c-11', kode: 'TATIB-RAP-11', nomor_urut: 11, kategori: 'Kerapian', nama_pelanggaran: 'Seragam atribut tidak lengkap', poin: 10, deskripsi: 'Kurang atribut badge lokasi SMKN 1 Jember, OSIS, bendera merah putih.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-c-12', kode: 'TATIB-RAP-12', nomor_urut: 12, kategori: 'Kerapian', nama_pelanggaran: 'Tidak memakai sepatu hitam, dasi, topi, dan atribut (sesuai ketentuan tata tertib seragam)', poin: 10, deskripsi: 'Sepatu wajib dominan hitam dan memakai dasi/topi pada saat upacara.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
  { id: 'tatib-c-13', kode: 'TATIB-RAP-13', nomor_urut: 13, kategori: 'Kerapian', nama_pelanggaran: 'Rambut panjang bagi siswa putra', poin: 10, deskripsi: 'Potongan rambut putra melewati alis mata, telinga, atau kerah baju.', aktif: true, created_at: '2026-08-03T00:00:00Z', updated_at: '2026-08-03T00:00:00Z' },
];

// ----------------------------------------------------------------------------
// D. FASE/TAHAPAN PENANGANAN PELANGGARAN
// ----------------------------------------------------------------------------
export const SEED_FASE_PENANGANAN_TATIB: FasePenangananTatib[] = [
  { fase: 1, kategori_pelanggaran: 'Ringan', rentang_skor: '5 - 35', min_skor: 5, max_skor: 35, tindakan: 'Peringatan I', penanggung_jawab: 'Guru Wali' },
  { fase: 2, kategori_pelanggaran: 'Ringan', rentang_skor: '36 - 55', min_skor: 36, max_skor: 55, tindakan: 'Peringatan II', penanggung_jawab: 'Guru Wali' },
  { fase: 3, kategori_pelanggaran: 'Sedang', rentang_skor: '56 - 75', min_skor: 56, max_skor: 75, tindakan: 'Panggilan Orang Tua I', penanggung_jawab: 'Wali Kelas, KKK' },
  { fase: 4, kategori_pelanggaran: 'Sedang', rentang_skor: '76 - 95', min_skor: 76, max_skor: 95, tindakan: 'Panggilan Orang Tua II', penanggung_jawab: 'Wali Kelas, KKK, Tim Kesiswaan' },
  { fase: 5, kategori_pelanggaran: 'Berat', rentang_skor: '96 - 150', min_skor: 96, max_skor: 150, tindakan: 'Panggilan Orang Tua III', penanggung_jawab: 'KKK, Tim Kesiswaan' },
  { fase: 6, kategori_pelanggaran: 'Berat', rentang_skor: '151 - 249', min_skor: 151, max_skor: 249, tindakan: 'Skorsing Akademik', penanggung_jawab: 'Wakasek Kesiswaan' },
  { fase: 7, kategori_pelanggaran: 'Berat', rentang_skor: '250 ke atas', min_skor: 250, max_skor: 999, tindakan: 'Dikembalikan ke Orang Tua (Drop Out / Mutasi)', penanggung_jawab: 'Kepala Sekolah' }
];

// ----------------------------------------------------------------------------
// E. PENGHARGAAN / PENGURANGAN SKOR PELANGGARAN (Capaian Positif Siswa)
// ----------------------------------------------------------------------------
export const SEED_PENGHARGAAN_TATIB: PenghargaanSkorTatib[] = [
  { id: 'reward-01', no: 1, prestasi_capaian: 'Memiliki Prestasi/Juara Tingkat Nasional', skor_pengurang: 150, kategori: 'Kejuaraan' },
  { id: 'reward-02', no: 2, prestasi_capaian: 'Memiliki Prestasi/Juara Tingkat Provinsi', skor_pengurang: 100, kategori: 'Kejuaraan' },
  { id: 'reward-03', no: 3, prestasi_capaian: 'Memiliki Prestasi/Juara Tingkat Kabupaten', skor_pengurang: 75, kategori: 'Kejuaraan' },
  { id: 'reward-04', no: 4, prestasi_capaian: 'Memiliki Prestasi/Juara Tingkat Kecamatan', skor_pengurang: 50, kategori: 'Kejuaraan' },
  { id: 'reward-05', no: 5, prestasi_capaian: 'Memiliki Prestasi/Juara Tingkat Sekolah/Antar Kelas', skor_pengurang: 25, kategori: 'Kejuaraan' },
  { id: 'reward-06', no: 6, prestasi_capaian: 'Menjadi Ketua OSIS', skor_pengurang: 25, kategori: 'Kepemimpinan' },
  { id: 'reward-07', no: 7, prestasi_capaian: 'Menjadi Ketua Ekstrakurikuler', skor_pengurang: 20, kategori: 'Kepemimpinan' },
  { id: 'reward-08', no: 8, prestasi_capaian: 'Menjadi Pengurus OSIS/MPK', skor_pengurang: 20, kategori: 'Organisasi' },
  { id: 'reward-09', no: 9, prestasi_capaian: 'Mengikuti Latihan LDK', skor_pengurang: 15, kategori: 'Pengembangan Diri' },
  { id: 'reward-10', no: 10, prestasi_capaian: 'Tidak alpa dalam 1 bulan berturut-turut', skor_pengurang: 25, kategori: 'Presensi Disiplin' },
  { id: 'reward-11', no: 11, prestasi_capaian: 'Tidak terlambat dalam 1 bulan berturut-turut', skor_pengurang: 15, kategori: 'Ketepatan Waktu' },
  { id: 'reward-12', no: 12, prestasi_capaian: 'Mampu menunjukkan bukti penyelesaian tugas/catatan pelajaran secara lengkap dalam rentang yang ditentukan/disepakati', skor_pengurang: 30, kategori: 'Akademik' }
];

// ----------------------------------------------------------------------------
// F. ACUAN SKOR BAWAAN ANTAR SEMESTER (CARRY OVER)*
// ----------------------------------------------------------------------------
export const SEED_CARRY_OVER_TATIB: AcuanSkorBawaan[] = [
  { no: 1, kategori_murid: 'Berpelanggaran Ringan', capaian_skor: '5 - 55', persentase_bawaan: 20, contoh_capaian: 50, contoh_bawaan: 10 },
  { no: 2, kategori_murid: 'Berpelanggaran Sedang', capaian_skor: '56 - 95', persentase_bawaan: 40, contoh_capaian: 80, contoh_bawaan: 32 },
  { no: 3, kategori_murid: 'Berpelanggaran Berat 1', capaian_skor: '96 - 200', persentase_bawaan: 60, contoh_capaian: 175, contoh_bawaan: 105 },
  { no: 4, kategori_murid: 'Berpelanggaran Berat 2', capaian_skor: '201 - 250', persentase_bawaan: 80, contoh_capaian: 230, contoh_bawaan: 184 }
];

export const SEED_JURNAL_GURU_WALI: JurnalGuruWali[] = [
  {
    id: 'jgw-01',
    siswa_id: 'siswa-01', // Dimas
    guru_id: 'guru-wali',
    tanggal: '2026-02-10',
    waktu: '09:30',
    jenis_layanan: 'Bimbingan',
    permasalahan: 'Penurunan motivasi belajar di mata pelajaran Pemrograman Web dan sering terlambat hadir sesi pagi.',
    uraian_layanan: 'Melakukan dialog personal empatik dengan siswa, mengidentifikasi kebiasaan tidur larut karena freelance desain luar sekolah, dan menyusun target harian belajar.',
    hasil_layanan: 'Siswa menyadari pentingnya manajemen waktu dan berkomitmen mengatur jadwal tidur maksimal pukul 22.30 WIB.',
    rencana_tindak_lanjut: 'Monitoring absensi kelas selama 2 pekan ke depan dan koordinasi berkala dengan Wali Kelas XI RPL 1.',
    status: 'Berjalan',
    dokumentasi_url: null,
    created_at: '2026-02-10T09:45:00Z',
    updated_at: '2026-02-10T09:45:00Z'
  },
  {
    id: 'jgw-02',
    siswa_id: 'siswa-02', // Sarah
    guru_id: 'guru-wali',
    tanggal: '2026-02-15',
    waktu: '11:00',
    jenis_layanan: 'Konsultasi',
    permasalahan: 'Konsultasi persiapan lomba LKS bidang Web Technologies tingkat Provinsi Jawa Timur.',
    uraian_layanan: 'Pendampingan kesiapan mental, pemetaan jadwal latihan intensif bersama pembimbing teknis, dan manajemen stres.',
    hasil_layanan: 'Siswa merasa lebih percaya diri dan jadwal latihan mingguan telah terorganisir dengan rapi.',
    rencana_tindak_lanjut: 'Evaluasi kesiapan pra-lomba H-7 bersama KKK RPL.',
    status: 'Selesai',
    dokumentasi_url: null,
    created_at: '2026-02-15T11:30:00Z',
    updated_at: '2026-02-15T11:30:00Z'
  }
];

export const SEED_JURNAL_WALI_KELAS: JurnalWaliKelas[] = [
  {
    id: 'jwk-01',
    siswa_id: 'siswa-03', // Rizky
    guru_id: 'guru-wali-kelas',
    kelas_id: 'kelas-xi-rpl-1',
    tanggal: '2026-02-12',
    waktu: '13:15',
    jenis_layanan: 'Pembinaan Disiplin Kelas',
    permasalahan: 'Tidak mengumpulkan tugas akhir proyek database semester genap dan tidak hadir 2 hari berturut-turut tanpa surat izin.',
    tindakan: 'Pemanggilan siswa di ruang wali kelas, verifikasi kendala perangkat laptop yang rusak, dan pemberian dispensasi pengerjaan di lab komputer sekolah.',
    hasil: 'Siswa bersedia menyelesaikan penugasan di Lab RPL 2 didampingi teknisi dan wali kelas.',
    tindak_lanjut: 'Pengecekan progres proyek pada Jumat pekan ini.',
    status: 'Berjalan',
    dokumentasi_url: null,
    created_at: '2026-02-12T13:30:00Z',
    updated_at: '2026-02-12T13:30:00Z'
  }
];

export const SEED_JURNAL_KKK: JurnalKKK[] = [
  {
    id: 'jkkk-01',
    siswa_id: 'siswa-01', // Dimas (RPL)
    guru_id: 'guru-kkk',
    kompetensi_keahlian_id: 'kk-rpl',
    tanggal: '2026-02-18',
    waktu: '10:00',
    jenis_kegiatan: 'Evaluasi Portofolio Praktik Kejuruan',
    permasalahan: 'Progres modul backend API Express masih tertinggal dibanding rekan sekelas.',
    tindakan: 'Pemberian klinik bimbingan pemrograman sore hari dan peer learning bersama tutor sebaya.',
    hasil: 'Siswa berhasil mendemonstrasikan implementasi CRUD REST API dasar.',
    tindak_lanjut: 'Uji kompetensi internal modul 3 pekan depan.',
    status: 'Berjalan',
    dokumentasi_url: null,
    created_at: '2026-02-18T10:30:00Z',
    updated_at: '2026-02-18T10:30:00Z'
  }
];

export const SEED_JURNAL_BK: JurnalBK[] = [
  {
    id: 'jbk-01',
    siswa_id: 'siswa-04', // Fajar
    guru_bk_id: 'guru-bk',
    tanggal: '2026-02-20',
    waktu: '08:45',
    jenis_layanan: 'Konseling Individu',
    bidang_layanan: 'Pribadi',
    tujuan_layanan: 'Membantu siswa meregulasi emosi dan mengatasi konflik interpersonal dengan teman sekelas di asrama/lingkungan.',
    identifikasi_kebutuhan: 'Siswa mengalami kecemasan sosial dan kesulitan beradaptasi dengan lingkungan baru kelas X.',
    intervensi: 'Teknik cognitive restructuring dan latihan relaksasi pernapasan terstruktur.',
    hasil_layanan: 'Siswa mampu mengidentifikasi pemicu ketegangan dan menunjukkan keterbukaan berdialog.',
    rencana_tindak_lanjut: 'Sesi lanjutan konseling individu pada 28 Februari 2026.',
    jadwal_berikutnya: '2026-02-28T09:00:00Z',
    status_layanan: 'Dalam Proses',
    dokumentasi_url: null,
    created_at: '2026-02-20T09:15:00Z',
    updated_at: '2026-02-20T09:15:00Z'
  }
];

// STRICT ACCESS: Only Guru BK Dra. Endang can see these!
export const SEED_KONSELING_RESTRICTED: KonselingRestricted[] = [
  {
    id: 'kr-01',
    jurnal_bk_id: 'jbk-01',
    siswa_id: 'siswa-04',
    guru_bk_id: 'guru-bk',
    catatan_rahasia: 'Siswa mengungkapkan adanya dinamika perselisihan keluarga yang cukup intens di rumah sehingga merasa tertekan dan melampiaskan pada isolasi sosial di sekolah. Kerahasiaan latar belakang keluarga dilindungi penuh sesuai kode etik konseling BK SMKN 1 Jember.',
    hasil_assessment: 'Tingkat stres situasional sedang (skala DASS-21: Kecemasan 16, Depresi 10). Tidak ditemukan indikasi risiko membahayakan diri sendiri, namun memerlukan ruang katarsis teratur.',
    rekomendasi_profesional: 'Pertahankan pendampingan hangat tanpa mengekspos detail persoalan keluarga kepada pihak luar/kelas. Koordinasikan dengan Wali Kelas hanya sebatas status kehadiran dan dukungan kenyamanan belajar di kelas.',
    created_at: '2026-02-20T09:20:00Z',
    updated_at: '2026-02-20T09:20:00Z'
  }
];

export const SEED_ASESMEN_BK_RESTRICTED: AsesmenBKRestricted[] = [
  {
    id: 'abr-01',
    siswa_id: 'siswa-04',
    guru_bk_id: 'guru-bk',
    tanggal: '2026-02-20',
    jenis_asesmen: 'Inventori Tugas Perkembangan (ITP) & DASS-21',
    hasil_asesmen: 'Profil kemandirian emosional memerlukan penguatan koping adaptif. Gaya belajar dominan Kinestetik dan Visual.',
    catatan_profesional: 'Siswa sangat kooperatif saat sesi individual tatap muka tertutup. Menunjukkan potensi kepemimpinan jika rasa percaya dirinya pulih.',
    rekomendasi: 'Fasilitasi keterlibatan dalam kegiatan ekstrakurikuler kepanduan/PMR untuk menyalurkan energi sosial positif.',
    created_at: '2026-02-20T09:25:00Z',
    updated_at: '2026-02-20T09:25:00Z'
  }
];

export const SEED_RUJUKAN_BK: RujukanBK[] = [
  {
    id: 'rbk-01',
    siswa_id: 'siswa-06',
    guru_bk_id: 'guru-bk',
    tanggal: '2026-02-22',
    jenis_rujukan: 'Konsultasi Spesialis Psikolog Klinis RSUD dr. Soebandi Jember',
    tujuan_rujukan: 'Evaluasi komprehensif hambatan konsentrasi belajar persisten (ADHD screening)',
    alasan_rujukan: 'Perlu verifikasi diagnostik profesional untuk rekomendasi akomodasi pembelajaran khusus',
    status: 'Disetujui',
    hasil_rujukan: 'Telah dijadwalkan sesi pendampingan pada awal bulan mendatang bersama orang tua.',
    created_at: '2026-02-22T10:00:00Z',
    updated_at: '2026-02-22T10:00:00Z'
  }
];

export const SEED_PELANGGARAN: Pelanggaran[] = [
  {
    id: 'pel-01',
    siswa_id: 'siswa-03', // Rizky
    petugas_id: 'guru-kesiswaan',
    tanggal: '2026-02-14',
    waktu: '07:20',
    jenis_pelanggaran_id: 'tatib-03', // Keterlambatan
    kategori: 'Ketertiban',
    poin: 5,
    uraian: 'Terlambat hadir 20 menit saat apel pagi Jumat karena rantai sepeda motor putus di jalan.',
    tindakan_awal: 'Pencatatan di buku piket ketertiban dan pembinaan literasi di perpustakaan 15 menit.',
    status: 'Selesai',
    created_at: '2026-02-14T07:30:00Z',
    updated_at: '2026-02-14T07:30:00Z'
  },
  {
    id: 'pel-02',
    siswa_id: 'siswa-03', // Rizky
    petugas_id: 'guru-kesiswaan',
    tanggal: '2026-02-21',
    waktu: '10:15',
    jenis_pelanggaran_id: 'tatib-04', // Membolos KBM
    kategori: 'Kehadiran',
    poin: 15,
    uraian: 'Ditemukan berada di warung luar pagar sekolah saat jam produktif RPL berlangsung.',
    tindakan_awal: 'Pemeriksaan oleh petugas Tatib, pemanggilan orang tua diusulkan karena akumulasi poin mencapai 20 poin.',
    status: 'Diproses',
    created_at: '2026-02-21T10:30:00Z',
    updated_at: '2026-02-21T10:30:00Z'
  }
];

export const SEED_PEMBINAAN: PembinaanKesiswaan[] = [
  {
    id: 'pem-01',
    siswa_id: 'siswa-03',
    petugas_id: 'guru-kesiswaan',
    pelanggaran_id: 'pel-02',
    tanggal: '2026-02-22',
    jenis_pembinaan: 'Pembinaan Disiplin & Penandatanganan Komitmen',
    uraian: 'Pembinaan terstruktur mengenai komitmen kehadiran siswa SMK dan konsekuensi reputasi di dunia kerja.',
    pihak_dilibatkan: 'Tim Kesiswaan, Wali Kelas XI RPL 1, Orang Tua Siswa',
    hasil: 'Siswa mengakui kesalahan dan berjanji mematuhi tata tertib SMKN 1 Jember.',
    rencana_tindak_lanjut: 'Pengawasan absensi harian bersama ketua kelas dan wali kelas.',
    status: 'Tahap 1',
    dokumentasi_url: null,
    created_at: '2026-02-22T11:00:00Z',
    updated_at: '2026-02-22T11:00:00Z'
  }
];

export const SEED_KETERLAMBATAN: Keterlambatan[] = [
  { id: 'ket-01', siswa_id: 'siswa-03', tanggal: '2026-02-14', waktu: '07:20', petugas_id: 'guru-kesiswaan', alasan: 'Kendala rantai motor di jalan', tindakan: 'Pembinaan piket', status: 'Diberi Pembinaan', created_at: '2026-02-14T07:25:00Z' },
  { id: 'ket-02', siswa_id: 'siswa-01', tanggal: '2026-02-18', waktu: '07:12', petugas_id: 'guru-kesiswaan', alasan: 'Membantu orang tua kirim barang', tindakan: 'Peringatan lisan', status: 'Tercatat', created_at: '2026-02-18T07:15:00Z' },
];

export const SEED_KETIDAKHADIRAN: Ketidakhadiran[] = [
  { id: 'abs-01', siswa_id: 'siswa-02', tanggal: '2026-02-05', jenis: 'Sakit', keterangan: 'Demam tinggi, disertai surat keterangan dokter klinik', petugas_id: 'guru-wali-kelas', created_at: '2026-02-05T08:00:00Z' },
  { id: 'abs-02', siswa_id: 'siswa-03', tanggal: '2026-02-19', jenis: 'Alpa', keterangan: 'Tidak masuk tanpa surat keterangan orang tua', petugas_id: 'guru-wali-kelas', created_at: '2026-02-19T08:00:00Z' },
];

export const SEED_KOORDINASI: KoordinasiSiswa[] = [
  {
    id: 'ks-01',
    nomor_kasus: 'KS-2026-000001',
    siswa_id: 'siswa-03', // Rizky
    pelapor_id: 'guru-wali-kelas',
    kategori_masalah: 'Kedisiplinan & Presensi Kehadiran',
    tanggal_laporan: '2026-02-21',
    penanggung_jawab_id: 'guru-kesiswaan',
    target_penyelesaian: '2026-03-05',
    status: 'Tindak Lanjut',
    informasi_koordinasi: 'Siswa mengalami peningkatan frekuensi alpa dan membolos KBM. Akumulasi poin tatib telah mencapai 20 poin. Perlu penanganan sinergis antara Wali Kelas, Tim Kesiswaan, dan Guru BK.',
    rekomendasi_umum: 'Penerbitan surat panggilan orang tua, kontrak pembinaan tertulis, dan konseling pendampingan berkala.',
    created_at: '2026-02-21T10:45:00Z',
    updated_at: '2026-02-22T11:30:00Z'
  }
];

export const SEED_TINDAK_LANJUT: PenugasanTindakLanjut[] = [
  {
    id: 'ptl-01',
    koordinasi_id: 'ks-01',
    ditugaskan_kepada: 'guru-kesiswaan',
    ditugaskan_oleh: 'guru-waka',
    tanggal_penugasan: '2026-02-21',
    target_penyelesaian: '2026-02-26',
    tugas: 'Terbitkan Surat Panggilan Orang Tua resmi Nomor 421.5/KESISWAAN/042 dan laksanakan sidang mediasi tertutup.',
    hasil: 'Surat telah diterbitkan dan orang tua dijadwalkan hadir Kamis, 26 Februari 2026 pukul 09.00 WIB.',
    status: 'Dikerjakan',
    created_at: '2026-02-21T11:00:00Z',
    updated_at: '2026-02-22T12:00:00Z'
  },
  {
    id: 'ptl-02',
    koordinasi_id: 'ks-01',
    ditugaskan_kepada: 'guru-bk',
    ditugaskan_oleh: 'guru-waka',
    tanggal_penugasan: '2026-02-22',
    target_penyelesaian: '2026-03-02',
    tugas: 'Lakukan sesi konseling eksplorasi minat dan hambatan belajar siswa pasca-pertemuan dengan orang tua.',
    hasil: null,
    status: 'Menunggu',
    created_at: '2026-02-22T12:05:00Z',
    updated_at: '2026-02-22T12:05:00Z'
  }
];

export const SEED_RIWAYAT_STATUS: RiwayatStatusKasus[] = [
  { id: 'rsk-01', koordinasi_id: 'ks-01', status_lama: 'Baru', status_baru: 'Diproses', diubah_oleh: 'guru-kesiswaan', catatan: 'Kasus diverifikasi dari laporan wali kelas.', created_at: '2026-02-21T10:50:00Z' },
  { id: 'rsk-02', koordinasi_id: 'ks-01', status_lama: 'Diproses', status_baru: 'Tindak Lanjut', diubah_oleh: 'guru-waka', catatan: 'Diberikan disposisi penugasan kesiswaan dan BK.', created_at: '2026-02-22T11:30:00Z' },
];

export const SEED_PRESTASI: PrestasiSiswa[] = [
  {
    id: 'pres-01',
    siswa_id: 'siswa-02', // Sarah
    nama_prestasi: 'Juara 1 Lomba Web Technologies LKS SMK Tingkat Wilayah Kerja 2 Jawa Timur',
    tingkat: 'Provinsi',
    kategori: 'Kejuruan / LKS',
    peringkat: 'Juara 1 (Emas)',
    tanggal: '2026-02-16',
    penyelenggara: 'Dinas Pendidikan Provinsi Jawa Timur',
    keterangan: 'Mewakili kontingen Kabupaten Jember melaju ke LKS Nasional 2026.',
    dokumentasi_url: null,
    created_at: '2026-02-16T15:00:00Z'
  },
  {
    id: 'pres-02',
    siswa_id: 'siswa-07', // Anisa
    nama_prestasi: 'Juara 2 National Accounting Olympiad 2026',
    tingkat: 'Nasional',
    kategori: 'Akademik',
    peringkat: 'Juara 2 (Perak)',
    tanggal: '2026-01-28',
    penyelenggara: 'Fakultas Ekonomi Universitas Jember',
    keterangan: 'Kompetisi akuntansi perbankan dan perpajakan tingkat SMA/SMK se-Indonesia.',
    dokumentasi_url: null,
    created_at: '2026-01-28T16:00:00Z'
  }
];

export const SEED_KEGIATAN_OSIS: KegiatanOSIS[] = [
  {
    id: 'osis-01',
    nama_kegiatan: 'Latihan Dasar Kepemimpinan Siswa (LDKS) SMESA 2026',
    jenis_organisasi: 'OSIS',
    tanggal_mulai: '2026-02-06',
    tanggal_selesai: '2026-02-08',
    penanggung_jawab: 'Ketua OSIS SMKN 1 Jember',
    deskripsi: 'Pembekalan karakter integritas, kedisiplinan baris-berbaris, dan manajemen organisasi bagi 120 pengurus baru.',
    status: 'Selesai Evaluasi',
    dokumentasi_url: null,
    created_at: '2026-02-09T08:00:00Z'
  }
];

export const SEED_EKSTRAKURIKULER: KegiatanEkstrakurikuler[] = [
  {
    id: 'ekskul-01',
    nama_ekstrakurikuler: 'SMESA IT Club & Coding',
    pembina_id: 'guru-kkk',
    tanggal: '2026-02-21',
    kegiatan: 'Workshop Pengembangan Web Modern dengan Tailwind CSS dan Supabase',
    hasil: '45 peserta berhasil membuat aplikasi portofolio digital masing-masing.',
    dokumentasi_url: null,
    status: 'Terlaksana',
    created_at: '2026-02-21T17:00:00Z'
  }
];

export const SEED_AUDIT_LOGS: AuditLog[] = [
  { id: 'al-01', user_id: 'user-admin', action: 'LOGIN', table_name: 'auth.users', record_id: 'user-admin', description: 'Administrator logged in from Chrome / Windows', created_at: '2026-02-22T07:00:00Z' },
  { id: 'al-02', user_id: 'user-guru-bk', action: 'ACCESS_BK_RESTRICTED', table_name: 'konseling_restricted', record_id: 'kr-01', description: 'Guru BK opened restricted psychological counseling record for siswa-04', created_at: '2026-02-22T08:15:00Z' },
  { id: 'al-03', user_id: 'user-kesiswaan', action: 'CREATE', table_name: 'pelanggaran', record_id: 'pel-02', description: 'Catatan pelanggaran tatib TATIB-HAD-01 dibuat untuk siswa-03 (poin: 15)', created_at: '2026-02-22T10:30:00Z' },
];

export const SEED_NOTIFIKASI: Notification[] = [
  {
    id: 'notif-01',
    user_id: 'user-kesiswaan',
    judul: 'Disposisi Koordinasi Siswa',
    pesan: 'Ada kasus koordinasi KS-2026-000001 (Rizky Kurniawan Pratama) yang memerlukan tindak lanjut kesiswaan.',
    jenis: 'koordinasi',
    referensi_id: 'ks-01',
    dibaca: false,
    created_at: '2026-02-22T11:00:00Z'
  },
  {
    id: 'notif-02',
    user_id: 'user-wali-kelas',
    judul: 'Pembaruan Status Penanganan Siswa',
    pesan: 'Tindak lanjut kasus siswa perwalian XI RPL 1 telah diperbarui statusnya menjadi Tindak Lanjut.',
    jenis: 'info',
    referensi_id: 'ks-01',
    dibaca: true,
    created_at: '2026-02-22T11:35:00Z'
  }
];
