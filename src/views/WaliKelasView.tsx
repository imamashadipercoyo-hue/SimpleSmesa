import React, { useState } from 'react';
import { dbService } from '../services/supabaseService';
import { StudentSelect, ClassAutoFill, DatePicker, TimePicker, StatusSelect, FileUpload } from '../components/common/FormComponents';
import { Siswa, JurnalWaliKelas, Keterlambatan, Ketidakhadiran, Kelas } from '../types/database';
import { BookOpen, Plus, ShieldCheck, Users, Clock, AlertTriangle } from 'lucide-react';

export const WaliKelasView: React.FC = () => {
  const profile = dbService.currentUser;
  const isWaliKelas = profile.role_kode === 'wali_kelas' || profile.role_kode === 'admin';

  // Find assigned class
  const myKelas = dbService.kelasList.find((k: Kelas) => k.wali_kelas_id === profile.guru_id) || dbService.kelasList[0];

  const [activeTab, setActiveTab] = useState<'jurnal' | 'siswa' | 'presensi'>('jurnal');
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [selectedSiswaId, setSelectedSiswaId] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [waktu, setWaktu] = useState('09:00');
  const [jenisLayanan, setJenisLayanan] = useState('Pembinaan Disiplin Kelas');
  const [permasalahan, setPermasalahan] = useState('');
  const [tindakan, setTindakan] = useState('');
  const [hasil, setHasil] = useState('');
  const [tindakLanjut, setTindakLanjut] = useState('');
  const [status, setStatus] = useState<'Berjalan' | 'Selesai' | 'Perlu Koordinasi'>('Berjalan');
  const [dokumentasiUrl, setDokumentasiUrl] = useState<string | null>(null);

  // Accessible students in this class
  const classStudents = dbService.siswaList.filter((s: Siswa) => s.kelas_id === myKelas?.id);
  const selectedStudentObj = dbService.getSiswaById(selectedSiswaId);

  // Class journals
  const journals = dbService.jurnalWaliKelasList.filter((j: JurnalWaliKelas) => {
    if (profile.role_kode === 'wali_kelas') {
      return j.kelas_id === myKelas?.id;
    }
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiswaId || !myKelas) return;

    dbService.addJurnalWaliKelas({
      siswa_id: selectedSiswaId,
      guru_id: profile.guru_id || 'guru-wali-kelas',
      kelas_id: myKelas.id,
      tanggal,
      waktu,
      jenis_layanan: jenisLayanan,
      permasalahan,
      tindakan,
      hasil,
      tindak_lanjut: tindakLanjut,
      status,
      dokumentasi_url: dokumentasiUrl
    });

    setShowModal(false);
    setSelectedSiswaId('');
    setPermasalahan('');
    setTindakan('');
    setHasil('');
    setTindakLanjut('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Manajemen Pembinaan Kelas Binaan</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Wali Kelas {myKelas ? myKelas.nama_kelas : 'Binaan'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tahun Pelajaran 2025/2026 · Total {classStudents.length} siswa binaan aktif.
          </p>
        </div>

        {isWaliKelas && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Jurnal Wali Kelas</span>
          </button>
        )}
      </div>

      {/* RLS Policy Notice */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-lg flex items-start gap-2.5 text-xs text-blue-800">
        <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold">RLS Wali Kelas Aktif:</strong>
          <span className="ml-1 text-slate-600">
            Sesuai kebijakan RLS (<code className="bg-blue-100 px-1 py-0.5 rounded text-[11px]">siswa.kelas_id = kelas.id</code>), Wali Kelas hanya dapat mengakses dan mengelola siswa dari kelas binaannya sendiri ({myKelas?.nama_kelas || '-'}). Jurnal kelas lain dibatasi.
          </span>
        </div>
      </div>

      {/* Segmented Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg max-w-md">
        <button
          onClick={() => setActiveTab('jurnal')}
          className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'jurnal' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Jurnal Pembinaan ({journals.length})
        </button>
        <button
          onClick={() => setActiveTab('siswa')}
          className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'siswa' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Daftar Siswa ({classStudents.length})
        </button>
        <button
          onClick={() => setActiveTab('presensi')}
          className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'presensi' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Catatan Kedisiplinan
        </button>
      </div>

      {/* Tab: Jurnal */}
      {activeTab === 'jurnal' && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Tanggal / Waktu</th>
                  <th className="py-3 px-4">Siswa Binaan</th>
                  <th className="py-3 px-4">Permasalahan</th>
                  <th className="py-3 px-4">Tindakan Wali Kelas</th>
                  <th className="py-3 px-4">Hasil & Tindak Lanjut</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {journals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-600">
                      Belum ada catatan jurnal untuk kelas ini.
                    </td>
                  </tr>
                ) : (
                  journals.map((j: JurnalWaliKelas) => {
                    const s = dbService.getSiswaById(j.siswa_id);
                    return (
                      <tr key={j.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                          <span className="font-semibold text-slate-900 block">{j.tanggal}</span>
                          <span>{j.waktu} WIB</span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-semibold text-slate-900 block">{s?.nama_lengkap}</span>
                          <span className="text-[11px] text-slate-500">NIS: {s?.nis}</span>
                        </td>
                        <td className="py-3 px-4 max-w-xs font-medium text-slate-800">
                          {j.permasalahan}
                        </td>
                        <td className="py-3 px-4 max-w-xs text-slate-700">
                          {j.tindakan}
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <p className="text-slate-800">{j.hasil}</p>
                          <p className="text-[11px] text-slate-500 italic mt-0.5">{j.tindak_lanjut}</p>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap font-semibold text-blue-700">
                          {j.status}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Siswa */}
      {activeTab === 'siswa' && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">NIS / NISN</th>
                  <th className="py-3 px-4">Nama Lengkap</th>
                  <th className="py-3 px-4">L/P</th>
                  <th className="py-3 px-4">Nama Orang Tua & Kontak</th>
                  <th className="py-3 px-4">Akumulasi Poin Tatib</th>
                  <th className="py-3 px-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classStudents.map((s: Siswa) => {
                  const poin = dbService.getTotalPoinSiswa(s.id);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap font-mono">
                        <span className="font-semibold text-slate-900 block">{s.nis}</span>
                        <span className="text-[11px] text-slate-500">{s.nisn}</span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">{s.nama_lengkap}</td>
                      <td className="py-3 px-4">{s.jenis_kelamin}</td>
                      <td className="py-3 px-4">
                        <span className="block text-slate-800 font-medium">{s.nama_orang_tua}</span>
                        <span className="text-[11px] text-slate-500">{s.no_hp_orang_tua}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={poin > 0 ? 'text-amber-600 font-bold' : 'text-slate-400'}>
                          {poin} poin
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => {
                            setSelectedSiswaId(s.id);
                            setShowModal(true);
                          }}
                          className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                          + Bimbingan
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Presensi & Disiplin */}
      {activeTab === 'presensi' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">Catatan Keterlambatan Siswa Kelas</h3>
            </div>
            <div className="space-y-2">
              {dbService.keterlambatanList.filter((k: Keterlambatan) => classStudents.some((s: Siswa) => s.id === k.siswa_id)).map((k: Keterlambatan) => {
                const s = dbService.getSiswaById(k.siswa_id);
                return (
                  <div key={k.id} className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs">
                    <div className="flex items-center justify-between font-semibold text-slate-900">
                      <span>{s?.nama_lengkap}</span>
                      <span className="text-slate-500 font-normal">{k.tanggal} · {k.waktu}</span>
                    </div>
                    <p className="text-slate-600 mt-1">Alasan: {k.alasan}</p>
                    <p className="text-[11px] text-slate-500 italic mt-0.5">Tindakan: {k.tindakan}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm font-bold text-slate-900">Ketidakhadiran (Alpa / Izin / Sakit)</h3>
            </div>
            <div className="space-y-2">
              {dbService.ketidakhadiranList.filter((a: Ketidakhadiran) => classStudents.some((s: Siswa) => s.id === a.siswa_id)).map((a: Ketidakhadiran) => {
                const s = dbService.getSiswaById(a.siswa_id);
                return (
                  <div key={a.id} className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs">
                    <div className="flex items-center justify-between font-semibold text-slate-900">
                      <span>{s?.nama_lengkap}</span>
                      <span className={`font-bold ${a.jenis === 'Alpa' ? 'text-red-600' : 'text-blue-600'}`}>
                        {a.jenis}
                      </span>
                    </div>
                    <p className="text-slate-500 mt-0.5">{a.tanggal} · {a.keterangan}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Jurnal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl border border-slate-200 overflow-hidden my-8">
            <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Catat Jurnal Wali Kelas</h3>
                <p className="text-xs text-slate-500">Kelas: {myKelas?.nama_kelas}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg leading-none p-1">
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Pilih Siswa Kelas {myKelas?.nama_kelas} <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={selectedSiswaId}
                  onChange={e => setSelectedSiswaId(e.target.value)}
                  className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800"
                >
                  <option value="">-- Pilih Siswa Kelas Ini --</option>
                  {classStudents.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nama_lengkap} (NIS: {s.nis})
                    </option>
                  ))}
                </select>
              </div>

              {selectedStudentObj && (
                <ClassAutoFill kelasId={selectedStudentObj.kelas_id} />
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DatePicker value={tanggal} onChange={setTanggal} />
                <TimePicker value={waktu} onChange={setWaktu} />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Permasalahan / Fokus Pembinaan <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={permasalahan}
                  onChange={e => setPermasalahan(e.target.value)}
                  placeholder="Deskripsi masalah yang dihadapi siswa dalam kelas..."
                  className="w-full p-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Tindakan Wali Kelas <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={tindakan}
                  onChange={e => setTindakan(e.target.value)}
                  placeholder="Langkah penanganan yang telah dilakukan wali kelas..."
                  className="w-full p-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Hasil</label>
                  <input
                    type="text"
                    required
                    value={hasil}
                    onChange={e => setHasil(e.target.value)}
                    placeholder="Hasil pembinaan..."
                    className="w-full h-11 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Tindak Lanjut</label>
                  <input
                    type="text"
                    required
                    value={tindakLanjut}
                    onChange={e => setTindakLanjut(e.target.value)}
                    placeholder="Langkah lanjutan..."
                    className="w-full h-11 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <StatusSelect
                  value={status}
                  onChange={(val: string) => setStatus(val as any)}
                  options={['Berjalan', 'Selesai', 'Perlu Koordinasi']}
                />
                <FileUpload
                  bucket="evidence"
                  value={dokumentasiUrl}
                  onChange={setDokumentasiUrl}
                  label="Lampiran Dokumentasi"
                />
              </div>

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
                  Simpan Jurnal Wali Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
