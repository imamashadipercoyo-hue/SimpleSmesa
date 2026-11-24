import React, { useState } from 'react';
import { dbService } from '../services/supabaseService';
import { StudentSelect, ClassAutoFill, CompetencyAutoFill, DatePicker, TimePicker, ServiceTypeSelect, StatusSelect, FileUpload } from '../components/common/FormComponents';
import { JenisLayananGuruWali, JurnalGuruWali, Siswa } from '../types/database';
import { BookOpen, Plus, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';

export const GuruWaliView: React.FC = () => {
  const profile = dbService.currentUser;
  const isGuruWali = profile.role_kode === 'guru_wali' || profile.role_kode === 'admin';

  // State
  const [showModal, setShowModal] = useState(false);
  const [selectedSiswaId, setSelectedSiswaId] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [waktu, setWaktu] = useState('08:30');
  const [jenisLayanan, setJenisLayanan] = useState<JenisLayananGuruWali>('Bimbingan');
  const [permasalahan, setPermasalahan] = useState('');
  const [uraianLayanan, setUraianLayanan] = useState('');
  const [hasilLayanan, setHasilLayanan] = useState('');
  const [rencanaTindakLanjut, setRencanaTindakLanjut] = useState('');
  const [status, setStatus] = useState<'Berjalan' | 'Selesai' | 'Perlu Koordinasi'>('Berjalan');
  const [dokumentasiUrl, setDokumentasiUrl] = useState<string | null>(null);

  // Filter list
  const [filterStudent, setFilterStudent] = useState('');

  // RLS: Guru wali only sees assigned students
  const accessibleStudents = dbService.getAccessibleSiswa();
  const selectedStudentObj = dbService.getSiswaById(selectedSiswaId);

  // Jurnal list filtered according to accessible students or current guru
  const journals = dbService.jurnalGuruWaliList.filter(j => {
    // RLS enforcement
    if (profile.role_kode === 'guru_wali') {
      return j.guru_id === profile.guru_id;
    }
    return true; // admin or manager view
  });

  const filteredJournals = journals.filter(j => {
    if (!filterStudent) return true;
    return j.siswa_id === filterStudent;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiswaId) return;

    dbService.addJurnalGuruWali({
      siswa_id: selectedSiswaId,
      guru_id: profile.guru_id || 'guru-wali',
      tanggal,
      waktu,
      jenis_layanan: jenisLayanan,
      permasalahan,
      uraian_layanan: uraianLayanan,
      hasil_layanan: hasilLayanan,
      rencana_tindak_lanjut: rencanaTindakLanjut,
      status,
      dokumentasi_url: dokumentasiUrl
    });

    // Reset & close
    setShowModal(false);
    setSelectedSiswaId('');
    setPermasalahan('');
    setUraianLayanan('');
    setHasilLayanan('');
    setRencanaTindakLanjut('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
            <UserCheck className="w-4 h-4" />
            <span>Layanan Pendampingan Siswa Asuh</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Jurnal & Pembinaan Guru Wali</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pendampingan personal, bimbingan berkala, dan monitoring perkembangan siswa dampingan SMKN 1 Jember.
          </p>
        </div>

        {isGuruWali && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Entri Jurnal Baru</span>
          </button>
        )}
      </div>

      {/* RLS Guard Notice */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-lg flex items-start gap-2.5 text-xs text-blue-800">
        <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold">Row Level Security (RLS) Aktif:</strong>
          <span className="ml-1 text-slate-600">
            Sesuai aturan database, Guru Wali hanya dapat melihat dan membina {accessibleStudents.length} siswa yang ditugaskan melalui tabel <code className="bg-blue-100 px-1 py-0.5 rounded text-[11px]">penugasan_guru</code>. Akses ke catatan rahasia BK tetap ditutup.
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-medium text-slate-500 whitespace-nowrap">Filter Siswa:</label>
          <select
            value={filterStudent}
            onChange={e => setFilterStudent(e.target.value)}
            className="h-9 px-3 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-64"
          >
            <option value="">Semua Siswa Dampingan ({accessibleStudents.length})</option>
            {accessibleStudents.map(s => (
              <option key={s.id} value={s.id}>
                {s.nama_lengkap} ({s.nis})
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-600 self-end sm:self-auto">
          Menampilkan <strong>{filteredJournals.length}</strong> entri jurnal
        </span>
      </div>

      {/* Journal Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Tanggal & Waktu</th>
                <th className="py-3 px-4">Siswa Dampingan</th>
                <th className="py-3 px-4">Layanan</th>
                <th className="py-3 px-4">Uraian & Permasalahan</th>
                <th className="py-3 px-4">Hasil & Rencana Lanjut</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredJournals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-600">
                    <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    Belum ada riwayat jurnal pendampingan untuk kriteria ini.
                  </td>
                </tr>
              ) : (
                filteredJournals.map(j => {
                  const s = dbService.getSiswaById(j.siswa_id);
                  const kls = s ? dbService.getKelasById(s.kelas_id) : null;
                  return (
                    <tr key={j.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                        <span className="font-semibold text-slate-900 block">{j.tanggal}</span>
                        <span>{j.waktu} WIB</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-900 block">{s?.nama_lengkap || 'Siswa'}</span>
                        <span className="text-[11px] text-slate-500">NIS: {s?.nis} · {kls?.nama_kelas}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-blue-700">{j.jenis_layanan}</span>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-medium text-slate-800 line-clamp-2">{j.permasalahan}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{j.uraian_layanan}</p>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <p className="text-slate-700 line-clamp-2">{j.hasil_layanan}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 italic">Lanjut: {j.rencana_tindak_lanjut}</p>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`font-semibold ${
                          j.status === 'Selesai' ? 'text-emerald-700' :
                          j.status === 'Perlu Koordinasi' ? 'text-rose-700' : 'text-blue-700'
                        }`}>
                          {j.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Jurnal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl border border-slate-200 overflow-hidden my-8">
            <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Form Jurnal Guru Wali</h3>
                <p className="text-xs text-slate-500">Hanya siswa yang berada dalam SK penugasan yang dapat dipilih.</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Student Select with RLS Filter */}
              <StudentSelect
                value={selectedSiswaId}
                onChange={id => setSelectedSiswaId(id)}
                filterAssignedOnly={profile.role_kode === 'guru_wali'}
                label="Pilih Siswa Binaan Dampingan"
                required
              />

              {selectedStudentObj && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ClassAutoFill kelasId={selectedStudentObj.kelas_id} />
                  <CompetencyAutoFill kompetensiId={selectedStudentObj.kompetensi_keahlian_id} />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DatePicker value={tanggal} onChange={setTanggal} />
                <TimePicker value={waktu} onChange={setWaktu} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ServiceTypeSelect
                  value={jenisLayanan}
                  onChange={val => setJenisLayanan(val as JenisLayananGuruWali)}
                  options={['Bimbingan', 'Pembinaan', 'Monitoring', 'Konsultasi', 'Layanan Kolaborasi BK & Kesiswaan']}
                />
                <StatusSelect
                  value={status}
                  onChange={(val: string) => setStatus(val as any)}
                  options={['Berjalan', 'Selesai', 'Perlu Koordinasi']}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Permasalahan / Fokus Pendampingan <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={permasalahan}
                  onChange={e => setPermasalahan(e.target.value)}
                  placeholder="Contoh: Mengalami kesulitan dalam mengatur waktu belajar dan frekuensi terlambat..."
                  className="w-full p-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Uraian Layanan / Dialog Personal <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={uraianLayanan}
                  onChange={e => setUraianLayanan(e.target.value)}
                  placeholder="Penjelasan proses bimbingan, empati, penggalian penyebab..."
                  className="w-full p-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Hasil Layanan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={hasilLayanan}
                    onChange={e => setHasilLayanan(e.target.value)}
                    placeholder="Hasil yang dicapai siswa..."
                    className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Rencana Tindak Lanjut <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={rencanaTindakLanjut}
                    onChange={e => setRencanaTindakLanjut(e.target.value)}
                    placeholder="Jadwal monitoring berikutnya..."
                    className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800"
                  />
                </div>
              </div>

              <FileUpload
                bucket="evidence"
                value={dokumentasiUrl}
                onChange={setDokumentasiUrl}
                label="Dokumentasi Pendukung (Opsional)"
              />

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-xs transition-colors"
                >
                  Simpan Jurnal ke Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
