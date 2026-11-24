/**
 * SIMPEL SMESA — SMK NEGERI 1 JEMBER
 * Full Database Migrations 001 to 026 with PostgreSQL Row Level Security (RLS)
 */

export const SIMPEL_SMESA_MIGRATION_SQL = `-- ==============================================================================
-- SIMPEL SMESA — SISTEM INFORMASI MONITORING, PENDAMPINGAN, DAN EVALUASI SISWA
-- SMK NEGERI 1 JEMBER
-- Tagline: "Data Terintegrasi • Layanan Terarah • Pembinaan Berkelanjutan"
-- Full Migration 001 to 026 with Row Level Security (RLS) & Helper Functions
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 001: ROLES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kode TEXT UNIQUE NOT NULL,
    nama TEXT NOT NULL,
    deskripsi TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial roles
INSERT INTO public.roles (kode, nama, deskripsi) VALUES
('admin', 'Administrator', 'Pengelola sistem, data master, dan hak akses'),
('kepala_sekolah', 'Kepala Sekolah', 'Akses manajerial dan laporan strategis sekolah'),
('waka_kesiswaan', 'Waka Kesiswaan', 'Monitoring kebijakan, tata tertib, dan rekap layanan siswa'),
('guru_wali', 'Guru Wali', 'Pendampingan khusus siswa asuh dampingan'),
('wali_kelas', 'Wali Kelas', 'Pembinaan dan monitoring siswa dalam kelas binaan'),
('kkk', 'Ketua Konsentrasi Keahlian (KKK)', 'Monitoring siswa dalam kompetensi keahlian kejuruan'),
('guru_bk', 'Guru BK', 'Bimbingan konseling dan catatan psikologis khusus'),
('kesiswaan', 'Tim Kesiswaan', 'Penegakan tata tertib, poin pelanggaran, dan pembinaan')
ON CONFLICT (kode) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 002: PROFILES TABLE (Linked with auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nama_lengkap TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    nip TEXT,
    role_id UUID NOT NULL REFERENCES public.roles(id),
    guru_id UUID,
    aktif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 003: GURU TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.guru (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nip TEXT UNIQUE NOT NULL,
    nama_lengkap TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    no_hp TEXT,
    jabatan TEXT NOT NULL,
    status_aktif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint to profiles.guru_id (idempotent / aman dijalankan ulang)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_profiles_guru'
    ) THEN
        ALTER TABLE public.profiles
            ADD CONSTRAINT fk_profiles_guru
            FOREIGN KEY (guru_id) REFERENCES public.guru(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 004: TAHUN PELAJARAN
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tahun_pelajaran (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama TEXT NOT NULL,
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    semester_aktif TEXT NOT NULL CHECK (semester_aktif IN ('Ganjil', 'Genap')),
    aktif BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 005: KOMPETENSI KEAHLIAN
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.kompetensi_keahlian (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kode TEXT UNIQUE NOT NULL,
    nama TEXT NOT NULL,
    aktif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 006: KELAS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.kelas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_kelas TEXT NOT NULL,
    tingkat INTEGER NOT NULL CHECK (tingkat IN (10, 11, 12)),
    kompetensi_keahlian_id UUID NOT NULL REFERENCES public.kompetensi_keahlian(id),
    tahun_pelajaran_id UUID NOT NULL REFERENCES public.tahun_pelajaran(id),
    wali_kelas_id UUID NOT NULL REFERENCES public.guru(id),
    aktif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 007: SISWA
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.siswa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nis TEXT UNIQUE NOT NULL,
    nisn TEXT,
    nama_lengkap TEXT NOT NULL,
    jenis_kelamin TEXT NOT NULL CHECK (jenis_kelamin IN ('L', 'P')),
    tanggal_lahir DATE,
    alamat TEXT,
    nama_orang_tua TEXT,
    no_hp_orang_tua TEXT,
    kelas_id UUID NOT NULL REFERENCES public.kelas(id),
    kompetensi_keahlian_id UUID NOT NULL REFERENCES public.kompetensi_keahlian(id),
    tahun_pelajaran_id UUID NOT NULL REFERENCES public.tahun_pelajaran(id),
    status TEXT NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Lulus', 'Pindah', 'Drop Out')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 008: PENUGASAN GURU
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.penugasan_guru (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guru_id UUID NOT NULL REFERENCES public.guru(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    kelas_id UUID REFERENCES public.kelas(id) ON DELETE SET NULL,
    kompetensi_keahlian_id UUID REFERENCES public.kompetensi_keahlian(id) ON DELETE SET NULL,
    siswa_id UUID REFERENCES public.siswa(id) ON DELETE SET NULL,
    tahun_pelajaran_id UUID NOT NULL REFERENCES public.tahun_pelajaran(id) ON DELETE CASCADE,
    aktif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 009: JURNAL GURU WALI
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.jurnal_guru_wali (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    siswa_id UUID NOT NULL REFERENCES public.siswa(id) ON DELETE CASCADE,
    guru_id UUID NOT NULL REFERENCES public.guru(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    waktu TIME NOT NULL DEFAULT CURRENT_TIME,
    jenis_layanan TEXT NOT NULL CHECK (jenis_layanan IN ('Bimbingan', 'Pembinaan', 'Monitoring', 'Konsultasi', 'Layanan Kolaborasi BK & Kesiswaan')),
    permasalahan TEXT NOT NULL,
    uraian_layanan TEXT NOT NULL,
    hasil_layanan TEXT NOT NULL,
    rencana_tindak_lanjut TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Berjalan',
    dokumentasi_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 010: JURNAL WALI KELAS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.jurnal_wali_kelas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    siswa_id UUID NOT NULL REFERENCES public.siswa(id) ON DELETE CASCADE,
    guru_id UUID NOT NULL REFERENCES public.guru(id) ON DELETE CASCADE,
    kelas_id UUID NOT NULL REFERENCES public.kelas(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    waktu TIME NOT NULL DEFAULT CURRENT_TIME,
    jenis_layanan TEXT NOT NULL,
    permasalahan TEXT NOT NULL,
    tindakan TEXT NOT NULL,
    hasil TEXT NOT NULL,
    tindak_lanjut TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Berjalan',
    dokumentasi_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 011: JURNAL KKK
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.jurnal_kkk (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    siswa_id UUID NOT NULL REFERENCES public.siswa(id) ON DELETE CASCADE,
    guru_id UUID NOT NULL REFERENCES public.guru(id) ON DELETE CASCADE,
    kompetensi_keahlian_id UUID NOT NULL REFERENCES public.kompetensi_keahlian(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    waktu TIME NOT NULL DEFAULT CURRENT_TIME,
    jenis_kegiatan TEXT NOT NULL,
    permasalahan TEXT NOT NULL,
    tindakan TEXT NOT NULL,
    hasil TEXT NOT NULL,
    tindak_lanjut TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Berjalan',
    dokumentasi_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 012: JURNAL BK (Layanan Bimbingan Konseling Umum)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.jurnal_bk (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    siswa_id UUID NOT NULL REFERENCES public.siswa(id) ON DELETE CASCADE,
    guru_bk_id UUID NOT NULL REFERENCES public.guru(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    waktu TIME NOT NULL DEFAULT CURRENT_TIME,
    jenis_layanan TEXT NOT NULL,
    bidang_layanan TEXT NOT NULL CHECK (bidang_layanan IN ('Pribadi', 'Sosial', 'Belajar', 'Karier')),
    tujuan_layanan TEXT NOT NULL,
    identifikasi_kebutuhan TEXT NOT NULL,
    intervensi TEXT NOT NULL,
    hasil_layanan TEXT NOT NULL,
    rencana_tindak_lanjut TEXT NOT NULL,
    jadwal_berikutnya TIMESTAMP WITH TIME ZONE,
    status_layanan TEXT NOT NULL DEFAULT 'Baru',
    dokumentasi_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 013: DATA BK RAHASIA / RESTRICTED (STRICT ACCESS: GURU BK ONLY)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.konseling_restricted (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jurnal_bk_id UUID NOT NULL REFERENCES public.jurnal_bk(id) ON DELETE CASCADE,
    siswa_id UUID NOT NULL REFERENCES public.siswa(id) ON DELETE CASCADE,
    guru_bk_id UUID NOT NULL REFERENCES public.guru(id) ON DELETE CASCADE,
    catatan_rahasia TEXT NOT NULL,
    hasil_assessment TEXT NOT NULL,
    rekomendasi_profesional TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.asesmen_bk_restricted (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    siswa_id UUID NOT NULL REFERENCES public.siswa(id) ON DELETE CASCADE,
    guru_bk_id UUID NOT NULL REFERENCES public.guru(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    jenis_asesmen TEXT NOT NULL,
    hasil_asesmen TEXT NOT NULL,
    catatan_profesional TEXT NOT NULL,
    rekomendasi TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rujukan_bk (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    siswa_id UUID NOT NULL REFERENCES public.siswa(id) ON DELETE CASCADE,
    guru_bk_id UUID NOT NULL REFERENCES public.guru(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    jenis_rujukan TEXT NOT NULL,
    tujuan_rujukan TEXT NOT NULL,
    alasan_rujukan TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Diusulkan',
    hasil_rujukan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 014: MASTER POIN TATA TERTIB BAKU (SMK NEGERI 1 JEMBER)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.master_poin_tatib (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kode TEXT UNIQUE NOT NULL,
    nomor_urut INTEGER,
    nama_pelanggaran TEXT NOT NULL,
    kategori TEXT NOT NULL CHECK (kategori IN ('Perilaku', 'Kerajinan', 'Kerapian')),
    poin INTEGER NOT NULL CHECK (poin > 0),
    deskripsi TEXT,
    aktif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 014B: FASE / TAHAPAN PENANGANAN PELANGGARAN (7 JENJANG RESMI)
CREATE TABLE IF NOT EXISTS public.fase_penanganan_tatib (
    fase INTEGER PRIMARY KEY,
    kategori_pelanggaran TEXT NOT NULL CHECK (kategori_pelanggaran IN ('Ringan', 'Sedang', 'Berat')),
    rentang_skor TEXT NOT NULL,
    min_skor INTEGER NOT NULL,
    max_skor INTEGER NOT NULL,
    tindakan TEXT NOT NULL,
    penanggung_jawab TEXT NOT NULL
);

INSERT INTO public.fase_penanganan_tatib (fase, kategori_pelanggaran, rentang_skor, min_skor, max_skor, tindakan, penanggung_jawab) VALUES
(1, 'Ringan', '5 - 35', 5, 35, 'Peringatan I', 'Guru Wali'),
(2, 'Ringan', '36 - 55', 36, 55, 'Peringatan II', 'Guru Wali'),
(3, 'Sedang', '56 - 75', 56, 75, 'Panggilan Orang Tua I', 'Wali Kelas, KKK'),
(4, 'Sedang', '76 - 95', 76, 95, 'Panggilan Orang Tua II', 'Wali Kelas, KKK, Tim Kesiswaan'),
(5, 'Berat', '96 - 150', 96, 150, 'Panggilan Orang Tua III', 'KKK, Tim Kesiswaan'),
(6, 'Berat', '151 - 249', 151, 249, 'Skorsing Akademik', 'Wakasek Kesiswaan'),
(7, 'Berat', '250 ke atas', 250, 999, 'Dikembalikan ke Orang Tua (Drop Out / Mutasi)', 'Kepala Sekolah')
ON CONFLICT (fase) DO NOTHING;

-- 014C: PENGHARGAAN / PENGURANGAN SKOR PELANGGARAN
CREATE TABLE IF NOT EXISTS public.penghargaan_skor_tatib (
    no INTEGER PRIMARY KEY,
    prestasi_capaian TEXT NOT NULL,
    skor_pengurang INTEGER NOT NULL CHECK (skor_pengurang > 0),
    kategori TEXT NOT NULL
);

INSERT INTO public.penghargaan_skor_tatib (no, prestasi_capaian, skor_pengurang, kategori) VALUES
(1, 'Memiliki Prestasi/Juara Tingkat Nasional', 150, 'Kejuaraan'),
(2, 'Memiliki Prestasi/Juara Tingkat Provinsi', 100, 'Kejuaraan'),
(3, 'Memiliki Prestasi/Juara Tingkat Kabupaten', 75, 'Kejuaraan'),
(4, 'Memiliki Prestasi/Juara Tingkat Kecamatan', 50, 'Kejuaraan'),
(5, 'Memiliki Prestasi/Juara Tingkat Sekolah/Antar Kelas', 25, 'Kejuaraan'),
(6, 'Menjadi Ketua OSIS', 25, 'Kepemimpinan'),
(7, 'Menjadi Ketua Ekstrakurikuler', 20, 'Kepemimpinan'),
(8, 'Menjadi Pengurus OSIS/MPK', 20, 'Organisasi'),
(9, 'Mengikuti Latihan LDK', 15, 'Pengembangan Diri'),
(10, 'Tidak alpa dalam 1 bulan berturut-turut', 25, 'Presensi Disiplin'),
(11, 'Tidak terlambat dalam 1 bulan berturut-turut', 15, 'Ketepatan Waktu'),
(12, 'Mampu menunjukkan bukti penyelesaian tugas/catatan pelajaran secara lengkap', 30, 'Akademik')
ON CONFLICT (no) DO NOTHING;

-- 014D: ACUAN SKOR BAWAAN ANTAR SEMESTER (CARRY OVER)
CREATE TABLE IF NOT EXISTS public.acuan_skor_bawaan (
    no INTEGER PRIMARY KEY,
    kategori_murid TEXT NOT NULL,
    capaian_skor TEXT NOT NULL,
    persentase_bawaan INTEGER NOT NULL,
    contoh_capaian INTEGER NOT NULL,
    contoh_bawaan INTEGER NOT NULL
);

INSERT INTO public.acuan_skor_bawaan (no, kategori_murid, capaian_skor, persentase_bawaan, contoh_capaian, contoh_bawaan) VALUES
(1, 'Berpelanggaran Ringan', '5 - 55', 20, 50, 10),
(2, 'Berpelanggaran Sedang', '56 - 95', 40, 80, 32),
(3, 'Berpelanggaran Berat 1', '96 - 200', 60, 175, 105),
(4, 'Berpelanggaran Berat 2', '201 - 250', 80, 230, 184)
ON CONFLICT (no) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 015: PELANGGARAN
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pelanggaran (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    siswa_id UUID NOT NULL REFERENCES public.siswa(id) ON DELETE CASCADE,
    petugas_id UUID NOT NULL REFERENCES public.guru(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    waktu TIME NOT NULL DEFAULT CURRENT_TIME,
    jenis_pelanggaran_id UUID NOT NULL REFERENCES public.master_poin_tatib(id),
    kategori TEXT NOT NULL,
    poin INTEGER NOT NULL,
    uraian TEXT NOT NULL,
    tindakan_awal TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Tercatat',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 016: PEMBINAAN KESISWAAN
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pembinaan_kesiswaan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    siswa_id UUID NOT NULL REFERENCES public.siswa(id) ON DELETE CASCADE,
    petugas_id UUID NOT NULL REFERENCES public.guru(id) ON DELETE CASCADE,
    pelanggaran_id UUID REFERENCES public.pelanggaran(id) ON DELETE SET NULL,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    jenis_pembinaan TEXT NOT NULL,
    uraian TEXT NOT NULL,
    pihak_dilibatkan TEXT NOT NULL,
    hasil TEXT NOT NULL,
    rencana_tindak_lanjut TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Tahap 1',
    dokumentasi_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 017: KEHADIRAN (KETIDAKHADIRAN)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ketidakhadiran (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    siswa_id UUID NOT NULL REFERENCES public.siswa(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    jenis TEXT NOT NULL CHECK (jenis IN ('Sakit', 'Izin', 'Alpa', 'Dispensasi')),
    keterangan TEXT,
    petugas_id UUID NOT NULL REFERENCES public.guru(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 018: KETERLAMBATAN
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.keterlambatan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    siswa_id UUID NOT NULL REFERENCES public.siswa(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    waktu TIME NOT NULL DEFAULT CURRENT_TIME,
    petugas_id UUID NOT NULL REFERENCES public.guru(id),
    alasan TEXT NOT NULL,
    tindakan TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Tercatat',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 019: PUSAT KOORDINASI SISWA
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.koordinasi_siswa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nomor_kasus TEXT UNIQUE NOT NULL, -- e.g. KS-2026-000001
    siswa_id UUID NOT NULL REFERENCES public.siswa(id) ON DELETE CASCADE,
    pelapor_id UUID NOT NULL REFERENCES public.guru(id),
    kategori_masalah TEXT NOT NULL,
    tanggal_laporan DATE NOT NULL DEFAULT CURRENT_DATE,
    penanggung_jawab_id UUID NOT NULL REFERENCES public.guru(id),
    target_penyelesaian DATE,
    status TEXT NOT NULL DEFAULT 'Baru' CHECK (status IN ('Baru', 'Diproses', 'Koordinasi', 'Tindak Lanjut', 'Monitoring', 'Selesai')),
    informasi_koordinasi TEXT NOT NULL,
    rekomendasi_umum TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sequence and function for automated case numbering
CREATE SEQUENCE IF NOT EXISTS case_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.nomor_kasus IS NULL OR NEW.nomor_kasus = '' THEN
        NEW.nomor_kasus := 'KS-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(NEXTVAL('case_number_seq')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_case_number ON public.koordinasi_siswa;
CREATE TRIGGER trigger_case_number
    BEFORE INSERT ON public.koordinasi_siswa
    FOR EACH ROW
    EXECUTE FUNCTION generate_case_number();

-- ------------------------------------------------------------------------------
-- 020: PENUGASAN TINDAK LANJUT & RIWAYAT STATUS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.penugasan_tindak_lanjut (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    koordinasi_id UUID NOT NULL REFERENCES public.koordinasi_siswa(id) ON DELETE CASCADE,
    ditugaskan_kepada UUID NOT NULL REFERENCES public.guru(id),
    ditugaskan_oleh UUID NOT NULL REFERENCES public.guru(id),
    tanggal_penugasan DATE NOT NULL DEFAULT CURRENT_DATE,
    target_penyelesaian DATE,
    tugas TEXT NOT NULL,
    hasil TEXT,
    status TEXT NOT NULL DEFAULT 'Menunggu' CHECK (status IN ('Menunggu', 'Dikerjakan', 'Selesai')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.riwayat_status_kasus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    koordinasi_id UUID NOT NULL REFERENCES public.koordinasi_siswa(id) ON DELETE CASCADE,
    status_lama TEXT NOT NULL,
    status_baru TEXT NOT NULL,
    diubah_oleh UUID NOT NULL REFERENCES public.guru(id),
    catatan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 021: PRESTASI SISWA
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prestasi_siswa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    siswa_id UUID NOT NULL REFERENCES public.siswa(id) ON DELETE CASCADE,
    nama_prestasi TEXT NOT NULL,
    tingkat TEXT NOT NULL,
    kategori TEXT NOT NULL,
    peringkat TEXT NOT NULL,
    tanggal DATE NOT NULL,
    penyelenggara TEXT NOT NULL,
    keterangan TEXT,
    dokumentasi_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 022: OSIS / MPK
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.kegiatan_osis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_kegiatan TEXT NOT NULL,
    jenis_organisasi TEXT NOT NULL CHECK (jenis_organisasi IN ('OSIS', 'MPK')),
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    penanggung_jawab TEXT NOT NULL,
    deskripsi TEXT,
    status TEXT NOT NULL DEFAULT 'Perencanaan',
    dokumentasi_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 023: EKSTRAKURIKULER
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.kegiatan_ekstrakurikuler (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_ekstrakurikuler TEXT NOT NULL,
    pembina_id UUID NOT NULL REFERENCES public.guru(id),
    tanggal DATE NOT NULL,
    kegiatan TEXT NOT NULL,
    hasil TEXT,
    dokumentasi_url TEXT,
    status TEXT NOT NULL DEFAULT 'Aktif',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 024: NOTIFIKASI
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    judul TEXT NOT NULL,
    pesan TEXT NOT NULL,
    jenis TEXT NOT NULL DEFAULT 'info',
    referensi_id UUID,
    dibaca BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 025: AUDIT LOGS (IMMUTABLE)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disallow manual deletion or updating of audit logs
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit log entries are immutable and cannot be modified or deleted.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_audit_log_mod ON public.audit_logs;
CREATE TRIGGER trg_prevent_audit_log_mod
    BEFORE UPDATE OR DELETE ON public.audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_log_modification();

-- ------------------------------------------------------------------------------
-- 026: ROW LEVEL SECURITY (RLS) POLICIES & HELPER FUNCTIONS
-- ------------------------------------------------------------------------------

-- Helper function: get current role code
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT AS $$
DECLARE
    role_kode TEXT;
BEGIN
    SELECT r.kode INTO role_kode
    FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid()
    LIMIT 1;

    RETURN role_kode;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Helper functions
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_current_user_role() = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_guru_bk() RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_current_user_role() = 'guru_bk';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_poin_tatib ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fase_penanganan_tatib ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.penghargaan_skor_tatib ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acuan_skor_bawaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jurnal_guru_wali ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jurnal_wali_kelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jurnal_kkk ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jurnal_bk ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.konseling_restricted ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asesmen_bk_restricted ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rujukan_bk ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pelanggaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pembinaan_kesiswaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.koordinasi_siswa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Public read untuk tabel referensi (dibutuhkan untuk cek koneksi & daftar role)
DROP POLICY IF EXISTS roles_select_all ON public.roles;
CREATE POLICY roles_select_all ON public.roles FOR SELECT USING (true);

DROP POLICY IF EXISTS master_tatib_select_all ON public.master_poin_tatib;
CREATE POLICY master_tatib_select_all ON public.master_poin_tatib FOR SELECT USING (true);

DROP POLICY IF EXISTS fase_tatib_select_all ON public.fase_penanganan_tatib;
CREATE POLICY fase_tatib_select_all ON public.fase_penanganan_tatib FOR SELECT USING (true);

DROP POLICY IF EXISTS penghargaan_tatib_select_all ON public.penghargaan_skor_tatib;
CREATE POLICY penghargaan_tatib_select_all ON public.penghargaan_skor_tatib FOR SELECT USING (true);

DROP POLICY IF EXISTS carryover_tatib_select_all ON public.acuan_skor_bawaan;
CREATE POLICY carryover_tatib_select_all ON public.acuan_skor_bawaan FOR SELECT USING (true);

-- Policy: Profiles (user login baca profil sendiri / admin baca semua)
DROP POLICY IF EXISTS profiles_select_authenticated ON public.profiles;
CREATE POLICY profiles_select_authenticated ON public.profiles
    FOR SELECT USING (auth.uid() = id OR is_admin());

DROP POLICY IF EXISTS profiles_manage_admin ON public.profiles;
CREATE POLICY profiles_manage_admin ON public.profiles
    FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Policy: Operasional Jurnal & Kesiswaan (hanya pengguna terautentikasi)
DROP POLICY IF EXISTS jurnal_gw_auth ON public.jurnal_guru_wali;
CREATE POLICY jurnal_gw_auth ON public.jurnal_guru_wali
    FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS jurnal_wk_auth ON public.jurnal_wali_kelas;
CREATE POLICY jurnal_wk_auth ON public.jurnal_wali_kelas
    FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS jurnal_kkk_auth ON public.jurnal_kkk;
CREATE POLICY jurnal_kkk_auth ON public.jurnal_kkk
    FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS jurnal_bk_auth ON public.jurnal_bk;
CREATE POLICY jurnal_bk_auth ON public.jurnal_bk
    FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS rujukan_bk_auth ON public.rujukan_bk;
CREATE POLICY rujukan_bk_auth ON public.rujukan_bk
    FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS pelanggaran_auth ON public.pelanggaran;
CREATE POLICY pelanggaran_auth ON public.pelanggaran
    FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS pembinaan_auth ON public.pembinaan_kesiswaan;
CREATE POLICY pembinaan_auth ON public.pembinaan_kesiswaan
    FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS koordinasi_auth ON public.koordinasi_siswa;
CREATE POLICY koordinasi_auth ON public.koordinasi_siswa
    FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Policy: BK Restricted (KHUSUS GURU BK, tertutup bagi role lain termasuk Admin)
DROP POLICY IF EXISTS bk_restricted_guru_bk_only ON public.konseling_restricted;
CREATE POLICY bk_restricted_guru_bk_only ON public.konseling_restricted
    FOR ALL
    USING (is_guru_bk())
    WITH CHECK (is_guru_bk());

DROP POLICY IF EXISTS asesmen_restricted_guru_bk_only ON public.asesmen_bk_restricted;
CREATE POLICY asesmen_restricted_guru_bk_only ON public.asesmen_bk_restricted
    FOR ALL
    USING (is_guru_bk())
    WITH CHECK (is_guru_bk());

-- Policy: Audit Log (hanya Admin dapat membaca, sistem/user login dapat menambah)
DROP POLICY IF EXISTS audit_logs_admin_select ON public.audit_logs;
CREATE POLICY audit_logs_admin_select ON public.audit_logs
    FOR SELECT
    USING (is_admin());

DROP POLICY IF EXISTS audit_logs_insert_all ON public.audit_logs;
CREATE POLICY audit_logs_insert_all ON public.audit_logs
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- ------------------------------------------------------------------------------
-- 027: STORAGE BUCKET UNTUK DOKUMENTASI (OPSIONAL)
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('dokumentasi-simpel', 'dokumentasi-simpel', false)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 028: AUTO-SYNC ONLINE & SUPABASE REALTIME MULTI-PERANGKAT
-- ------------------------------------------------------------------------------
-- Unique index untuk sinkronisasi tabel relasional kelas & tahun_pelajaran
CREATE UNIQUE INDEX IF NOT EXISTS idx_kelas_nama_unique ON public.kelas (nama_kelas);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tahun_pelajaran_nama_unique ON public.tahun_pelajaran (nama);

-- Tabel koleksi sinkronisasi realtime agar setiap perubahan data (Master, Jurnal,
-- Pelanggaran, Pembinaan, Koordinasi, Prestasi, OSIS, Ekskul) langsung tersinkron
-- dan tampil online di semua perangkat secara otomatis.
CREATE TABLE IF NOT EXISTS public.simpel_sync_collections (
    collection_key TEXT PRIMARY KEY,
    payload JSONB NOT NULL DEFAULT '[]'::jsonb,
    client_id TEXT,
    updated_by TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.simpel_sync_collections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sync_collections_access ON public.simpel_sync_collections;
CREATE POLICY sync_collections_access ON public.simpel_sync_collections
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Izinkan sinkronisasi otomatis tabel master relasional dari aplikasi
-- (Untuk produksi ketat berbasis Supabase Auth, ubah USING/WITH CHECK menjadi auth.role() = 'authenticated')
ALTER TABLE public.tahun_pelajaran ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tp_sync_policy ON public.tahun_pelajaran;
CREATE POLICY tp_sync_policy ON public.tahun_pelajaran FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.kompetensi_keahlian ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS kk_sync_policy ON public.kompetensi_keahlian;
CREATE POLICY kk_sync_policy ON public.kompetensi_keahlian FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.guru ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS guru_sync_policy ON public.guru;
CREATE POLICY guru_sync_policy ON public.guru FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.kelas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS kelas_sync_policy ON public.kelas;
CREATE POLICY kelas_sync_policy ON public.kelas FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.siswa ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS siswa_sync_policy ON public.siswa;
CREATE POLICY siswa_sync_policy ON public.siswa FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS master_tatib_write_all ON public.master_poin_tatib;
CREATE POLICY master_tatib_write_all ON public.master_poin_tatib FOR ALL USING (true) WITH CHECK (true);

-- Aktifkan Supabase Realtime Publication untuk tabel sinkronisasi (idempotent)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables
            WHERE pubname = 'supabase_realtime'
              AND schemaname = 'public'
              AND tablename = 'simpel_sync_collections'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.simpel_sync_collections;
        END IF;
    END IF;
END $$;

-- Selesai! Jalankan query verifikasi berikut untuk memastikan tabel & auto-sync siap:
-- SELECT kode, nama FROM public.roles;
-- SELECT collection_key, updated_at FROM public.simpel_sync_collections;
`;
