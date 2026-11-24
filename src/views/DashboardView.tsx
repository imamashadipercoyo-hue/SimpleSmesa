import React from 'react';
import { dbService } from '../services/supabaseService';
import { StatsCard } from '../components/common/StatsCard';
import { LineChart, BarChart, DonutChart } from '../components/common/ChartComponents';
import {
  Users,
  BookOpen,
  AlertTriangle,
  Clock,
  Award,
  ShieldAlert,
  Calendar,
  CheckCircle,
  FileText,
  Activity,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const profile = dbService.currentUser;
  const role = profile.role_kode;
  const guru = profile.guru_id ? dbService.getGuruById(profile.guru_id) : null;

  // Accessible students
  const accessibleSiswa = dbService.getAccessibleSiswa();

  // Metrics
  const totalSiswaAll = dbService.siswaList.length;
  const accessibleSiswaCount = accessibleSiswa.length;
  const totalPelanggaran = dbService.pelanggaranList.length;
  const totalKeterlambatan = dbService.keterlambatanList.length;
  const totalPembinaan = dbService.pembinaanList.length;
  const activeKoordinasi = dbService.koordinasiList.filter(k => k.status !== 'Selesai').length;
  const totalPrestasi = dbService.prestasiList.length;

  // Guru wali specific metrics
  const myJurnalGuruWali = dbService.jurnalGuruWaliList.filter(j => j.guru_id === profile.guru_id);
  const mySiswaIds = accessibleSiswa.map(s => s.id);
  const mySiswaPelanggaran = dbService.pelanggaranList.filter(p => mySiswaIds.includes(p.siswa_id)).length;
  const mySiswaKoordinasi = dbService.koordinasiList.filter(k => mySiswaIds.includes(k.siswa_id) && k.status !== 'Selesai').length;

  // Wali kelas specific
  const myKelas = dbService.kelasList.find(k => k.wali_kelas_id === profile.guru_id);
  const myJurnalWaliKelas = dbService.jurnalWaliKelasList.filter(j => j.guru_id === profile.guru_id);

  // KKK specific
  const myKK = dbService.penugasanList.find(p => p.guru_id === profile.guru_id && p.kompetensi_keahlian_id);
  const kompetensiInfo = myKK ? dbService.getKompetensiById(myKK.kompetensi_keahlian_id || '') : null;

  // BK specific
  const totalJurnalBK = dbService.jurnalBKList.length;
  const totalRujukan = dbService.rujukanBKList.length;
  const upcomingJadwal = dbService.jurnalBKList.filter(j => j.jadwal_berikutnya !== null).length;

  // Chart data
  const trendLayanan = [
    { label: 'Okt', value: 12 },
    { label: 'Nov', value: 18 },
    { label: 'Des', value: 14 },
    { label: 'Jan', value: 24 },
    { label: 'Feb', value: 32 },
  ];

  const pelanggaranPerKK = [
    { label: 'RPL', value: 4 },
    { label: 'TKJ', value: 6 },
    { label: 'DKV', value: 3 },
    { label: 'AKL', value: 2 },
    { label: 'BDP', value: 5 },
  ];

  const kategoriLayanan = [
    { label: 'Bimbingan Siswa', value: 18, color: '#2563eb' },
    { label: 'Konseling BK', value: 12, color: '#7c3aed' },
    { label: 'Pembinaan Tatib', value: 9, color: '#d97706' },
    { label: 'Koordinasi Terpadu', value: 5, color: '#059669' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Sistem Informasi Monitoring, Pendampingan, dan Evaluasi Siswa</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Selamat Datang, {profile.nama_lengkap}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Peran: <strong className="text-slate-700 capitalize">{role.replace(/_/g, ' ')}</strong>
            {guru?.jabatan && <span> · {guru.jabatan}</span>}
            {myKelas && <span> · Wali Kelas {myKelas.nama_kelas}</span>}
            {kompetensiInfo && <span> · KKK {kompetensiInfo.nama}</span>}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-slate-400 block">Tahun Pelajaran</span>
            <span className="text-xs font-bold text-slate-700">2025/2026 (Genap)</span>
          </div>
          <div className="h-8 w-px bg-slate-200 hidden sm:block" />
          <button
            onClick={() => onNavigate('koordinasi')}
            className="px-3.5 py-2 text-xs font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span>Pusat Koordinasi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Dynamic Role-Based Cards */}

      {/* 1. ROLE: GURU WALI */}
      {role === 'guru_wali' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatsCard
              title="Siswa Dampingan"
              value={accessibleSiswaCount}
              subtitle="Tercatat dalam SK"
              icon={Users}
              accentColor="blue"
            />
            <StatsCard
              title="Jurnal Bulan Ini"
              value={myJurnalGuruWali.length}
              subtitle="Layanan terdokumentasi"
              icon={BookOpen}
              accentColor="indigo"
            />
            <StatsCard
              title="Pembinaan Siswa"
              value={mySiswaPelanggaran}
              subtitle="Kasus terkait"
              icon={AlertTriangle}
              accentColor="amber"
            />
            <StatsCard
              title="Koordinasi Aktif"
              value={mySiswaKoordinasi}
              subtitle="Memerlukan respon"
              icon={Activity}
              accentColor="rose"
            />
            <StatsCard
              title="Tindak Lanjut"
              value={dbService.tindakLanjutList.filter(t => t.status !== 'Selesai').length}
              subtitle="Sedang berjalan"
              icon={CheckCircle}
              accentColor="emerald"
            />
          </div>

          {/* Dampingan student list snippet */}
          <div className="bg-white p-5 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Daftar Siswa Asuh / Dampingan Anda</h3>
                <p className="text-xs text-slate-500">Berdasarkan Surat Keputusan Penugasan Guru Wali SMKN 1 Jember</p>
              </div>
              <button
                onClick={() => onNavigate('guru-wali')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                Buka Jurnal Guru Wali <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-y border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">NIS</th>
                    <th className="py-2.5 px-3">Nama Siswa</th>
                    <th className="py-2.5 px-3">Kelas</th>
                    <th className="py-2.5 px-3">Kompetensi</th>
                    <th className="py-2.5 px-3">Total Poin Tatib</th>
                    <th className="py-2.5 px-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accessibleSiswa.map(s => {
                    const totalPoin = dbService.getTotalPoinSiswa(s.id);
                    const kls = dbService.getKelasById(s.kelas_id);
                    const kk = dbService.getKompetensiById(s.kompetensi_keahlian_id);
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-mono">{s.nis}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-900">{s.nama_lengkap}</td>
                        <td className="py-2.5 px-3">{kls?.nama_kelas || '-'}</td>
                        <td className="py-2.5 px-3">{kk?.nama || '-'}</td>
                        <td className="py-2.5 px-3">
                          <span className={totalPoin > 0 ? 'text-amber-600 font-bold' : 'text-slate-400'}>
                            {totalPoin} poin
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <button
                            onClick={() => onNavigate('guru-wali')}
                            className="text-xs text-blue-600 font-semibold hover:underline"
                          >
                            + Entri Jurnal
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. ROLE: WALI KELAS */}
      {role === 'wali_kelas' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatsCard
              title="Jumlah Siswa Kelas"
              value={accessibleSiswaCount}
              subtitle={myKelas ? `Kelas ${myKelas.nama_kelas}` : 'Binaan'}
              icon={Users}
              accentColor="blue"
            />
            <StatsCard
              title="Presensi / Kehadiran"
              value={`${accessibleSiswaCount - dbService.ketidakhadiranList.length}/${accessibleSiswaCount}`}
              subtitle="Hadir hari ini"
              icon={CheckCircle}
              accentColor="emerald"
            />
            <StatsCard
              title="Keterlambatan"
              value={dbService.keterlambatanList.length}
              subtitle="Tercatat pekan ini"
              icon={Clock}
              accentColor="amber"
            />
            <StatsCard
              title="Pembinaan Kelas"
              value={myJurnalWaliKelas.length}
              subtitle="Jurnal wali kelas"
              icon={BookOpen}
              accentColor="indigo"
            />
            <StatsCard
              title="Kasus Aktif"
              value={activeKoordinasi}
              subtitle="Dalam pantauan"
              icon={AlertTriangle}
              accentColor="rose"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LineChart title="Aktivitas Pendampingan Wali Kelas" data={trendLayanan} lineColor="#2563eb" />
            <div className="bg-white p-5 rounded-lg border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Aksi Cepat Wali Kelas</h3>
              <p className="text-xs text-slate-500 mb-4">Akses langsung fungsi perwalian kelas</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onNavigate('wali-kelas')}
                  className="p-3 text-left border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50/30 transition-colors"
                >
                  <BookOpen className="w-5 h-5 text-blue-600 mb-1" />
                  <span className="block text-xs font-bold text-slate-800">Jurnal Wali Kelas</span>
                  <span className="text-[11px] text-slate-500">Catat pembinaan kelas</span>
                </button>
                <button
                  onClick={() => onNavigate('kesiswaan')}
                  className="p-3 text-left border border-slate-200 rounded-lg hover:border-amber-500 hover:bg-amber-50/30 transition-colors"
                >
                  <Clock className="w-5 h-5 text-amber-600 mb-1" />
                  <span className="block text-xs font-bold text-slate-800">Cek Keterlambatan</span>
                  <span className="text-[11px] text-slate-500">Presensi & alpa</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. ROLE: KKK */}
      {role === 'kkk' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatsCard
              title="Siswa Kompetensi"
              value={accessibleSiswaCount}
              subtitle={kompetensiInfo ? kompetensiInfo.nama : 'Jurusan'}
              icon={Users}
              accentColor="blue"
            />
            <StatsCard
              title="Jurnal KKK"
              value={dbService.jurnalKKKList.length}
              subtitle="Monitoring kejuruan"
              icon={BookOpen}
              accentColor="indigo"
            />
            <StatsCard
              title="Pelanggaran Jurusan"
              value={dbService.pelanggaranList.filter(p => accessibleSiswa.some(s => s.id === p.siswa_id)).length}
              subtitle="Tercatat di tatib"
              icon={AlertTriangle}
              accentColor="amber"
            />
            <StatsCard
              title="Prestasi Kejuruan"
              value={totalPrestasi}
              subtitle="LKS & Lomba"
              icon={Award}
              accentColor="emerald"
            />
            <StatsCard
              title="Tindak Lanjut PKL"
              value={activeKoordinasi}
              subtitle="Kesiapan industri"
              icon={CheckCircle}
              accentColor="slate"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BarChart title="Distribusi Pelanggaran per Kompetensi Keahlian" data={pelanggaranPerKK} barColor="#3b82f6" />
            <DonutChart title="Sebaran Kategori Layanan Siswa" data={kategoriLayanan} />
          </div>
        </div>
      )}

      {/* 4. ROLE: GURU BK */}
      {role === 'guru_bk' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatsCard
              title="Konseli / Siswa Terdaftar"
              value={totalSiswaAll}
              subtitle="Populasi binaan BK"
              icon={Users}
              accentColor="indigo"
            />
            <StatsCard
              title="Layanan Bulan Ini"
              value={totalJurnalBK}
              subtitle="Sesi terlaksana"
              icon={BookOpen}
              accentColor="blue"
            />
            <StatsCard
              title="Kasus Aktif"
              value={activeKoordinasi}
              subtitle="Bimbingan intensif"
              icon={Activity}
              accentColor="rose"
            />
            <StatsCard
              title="Jadwal Berikutnya"
              value={upcomingJadwal}
              subtitle="Sesi teragendakan"
              icon={Calendar}
              accentColor="amber"
            />
            <StatsCard
              title="Rujukan / Alih Kasus"
              value={totalRujukan}
              subtitle="Spesialis / Klinis"
              icon={FileText}
              accentColor="emerald"
            />
          </div>

          {/* Secure Vault Notification for BK */}
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">Akses Khusus Kode Etik BK Aktif</h4>
              <p className="text-xs text-purple-800 mt-0.5">
                Anda memiliki hak akses eksklusif ke tabel <code className="bg-purple-100 px-1 py-0.5 rounded text-[11px]">konseling_restricted</code> dan <code className="bg-purple-100 px-1 py-0.5 rounded text-[11px]">asesmen_bk_restricted</code>. Catatan rahasia psikologis dilindungi penuh dari role lain oleh kebijakan PostgreSQL Row Level Security.
              </p>
            </div>
            <button
              onClick={() => onNavigate('bk')}
              className="ml-auto px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded text-xs font-semibold shrink-0"
            >
              Buka Layanan BK
            </button>
          </div>
        </div>
      )}

      {/* 5. ROLE: TIM KESISWAAN */}
      {role === 'kesiswaan' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatsCard
              title="Pelanggaran Tatib"
              value={totalPelanggaran}
              subtitle="Total kasus tercatat"
              icon={AlertTriangle}
              accentColor="rose"
            />
            <StatsCard
              title="Keterlambatan"
              value={totalKeterlambatan}
              subtitle="Piket gerbang"
              icon={Clock}
              accentColor="amber"
            />
            <StatsCard
              title="Pembinaan Siswa"
              value={totalPembinaan}
              subtitle="Tindakan berjalan"
              icon={BookOpen}
              accentColor="blue"
            />
            <StatsCard
              title="Kasus Aktif"
              value={activeKoordinasi}
              subtitle="Pusat koordinasi"
              icon={Activity}
              accentColor="indigo"
            />
            <StatsCard
              title="Prestasi Siswa"
              value={totalPrestasi}
              subtitle="Apresiasi karakter"
              icon={Award}
              accentColor="emerald"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BarChart title="Statistik Pelanggaran per Kompetensi Keahlian" data={pelanggaranPerKK} barColor="#ef4444" />
            <LineChart title="Tren Pembinaan Siswa per Bulan" data={trendLayanan} lineColor="#d97706" />
          </div>
        </div>
      )}

      {/* 6. ROLE: WAKA KESISWAAN & 7. KEPALA SEKOLAH */}
      {(role === 'waka_kesiswaan' || role === 'kepala_sekolah') && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <StatsCard
              title="Total Siswa Aktif"
              value={totalSiswaAll}
              subtitle="SMKN 1 Jember"
              icon={Users}
              accentColor="blue"
            />
            <StatsCard
              title="Pelanggaran Tatib"
              value={totalPelanggaran}
              subtitle="Tahun pelajaran berjalan"
              icon={AlertTriangle}
              accentColor="rose"
            />
            <StatsCard
              title="Keterlambatan"
              value={totalKeterlambatan}
              subtitle="Catatan presensi"
              icon={Clock}
              accentColor="amber"
            />
            <StatsCard
              title="Pembinaan Terpadu"
              value={totalPembinaan}
              subtitle="Kolaboratif"
              icon={BookOpen}
              accentColor="indigo"
            />
            <StatsCard
              title="Kasus Aktif"
              value={activeKoordinasi}
              subtitle="Status monitoring"
              icon={Activity}
              accentColor="rose"
            />
            <StatsCard
              title="Prestasi Siswa"
              value={totalPrestasi}
              subtitle="Juara & Apresiasi"
              icon={Award}
              accentColor="emerald"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <BarChart title="Analisis Pelanggaran per Jurusan" data={pelanggaranPerKK} barColor="#dc2626" />
            </div>
            <div>
              <DonutChart title="Komposisi Layanan Pembinaan" data={kategoriLayanan} />
            </div>
          </div>
        </div>
      )}

      {/* 8. ROLE: ADMIN */}
      {role === 'admin' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Pengguna"
              value={dbService.profiles.length}
              subtitle="Akun terdaftar"
              icon={Users}
              accentColor="blue"
            />
            <StatsCard
              title="Data Siswa"
              value={totalSiswaAll}
              subtitle="Data master"
              icon={Layers}
              accentColor="indigo"
            />
            <StatsCard
              title="Aturan Tatib"
              value={dbService.masterTatibList.length}
              subtitle="Katalog poin aktif"
              icon={ShieldAlert}
              accentColor="amber"
            />
            <StatsCard
              title="Audit Log"
              value={dbService.auditLogs.length}
              subtitle="Catatan immutable"
              icon={Activity}
              accentColor="emerald"
            />
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Panel Administrasi Sistem & Keamanan</h3>
            <p className="text-xs text-slate-500 mb-4">Pengelolaan data master, user role assignment, dan koneksi backend Supabase</p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('admin-master')}
                className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Kelola Data Master & Pengguna
              </button>
              <button
                onClick={() => onNavigate('supabase-config')}
                className="px-4 py-2 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-700 transition-colors"
              >
                Konfigurasi Supabase & Script SQL (001-026)
              </button>
              <button
                onClick={() => onNavigate('audit-log')}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Periksa Audit Log Sistem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
