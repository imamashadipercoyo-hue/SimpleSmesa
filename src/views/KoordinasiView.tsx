import React, { useState } from 'react';
import { dbService } from '../services/supabaseService';
import { StudentSelect, ClassAutoFill, CompetencyAutoFill, DatePicker, StatusSelect } from '../components/common/FormComponents';
import { StatusKoordinasi, KoordinasiSiswa, PenugasanTindakLanjut, RiwayatStatusKasus, Guru } from '../types/database';
import { Activity, Plus, CheckCircle2, Clock, ArrowRight, UserCheck, MessageSquare, AlertCircle } from 'lucide-react';

export const KoordinasiView: React.FC = () => {
  const profile = dbService.currentUser;

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(
    dbService.koordinasiList[0]?.id || null
  );

  const [showModalNewCase, setShowModalNewCase] = useState(false);
  const [showModalTask, setShowModalTask] = useState(false);
  const [showModalStatus, setShowModalStatus] = useState(false);

  // New Case Form
  const [selectedSiswaId, setSelectedSiswaId] = useState('');
  const [kategoriMasalah, setKategoriMasalah] = useState('Kedisiplinan & Presensi Kehadiran');
  const [tanggalLaporan, setTanggalLaporan] = useState(new Date().toISOString().split('T')[0]);
  const [penanggungJawabId, setPenanggungJawabId] = useState(profile.guru_id || 'guru-kesiswaan');
  const [targetPenyelesaian, setTargetPenyelesaian] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [informasiKoordinasi, setInformasiKoordinasi] = useState('');
  const [rekomendasiUmum, setRekomendasiUmum] = useState('');

  // Update Status Form
  const [newStatus, setNewStatus] = useState<StatusKoordinasi>('Tindak Lanjut');
  const [catatanStatus, setCatatanStatus] = useState('');

  // Add Follow Up Task Form
  const [tugasTargetGuru, setTugasTargetGuru] = useState('guru-bk');
  const [targetTugasDate, setTargetTugasDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [tugasDeskripsi, setTugasDeskripsi] = useState('');

  const activeCase = dbService.koordinasiList.find((k: KoordinasiSiswa) => k.id === selectedCaseId);
  const activeSiswa = activeCase ? dbService.getSiswaById(activeCase.siswa_id) : null;
  const activeKelas = activeSiswa ? dbService.getKelasById(activeSiswa.kelas_id) : null;

  // Follow-up tasks for active case
  const tasks = dbService.tindakLanjutList.filter((t: PenugasanTindakLanjut) => t.koordinasi_id === selectedCaseId);
  // Status history for active case
  const history = dbService.riwayatStatusList.filter((r: RiwayatStatusKasus) => r.koordinasi_id === selectedCaseId);

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiswaId) return;

    const created = dbService.createKoordinasiCase({
      siswa_id: selectedSiswaId,
      pelapor_id: profile.guru_id || 'guru-kesiswaan',
      kategori_masalah: kategoriMasalah,
      tanggal_laporan: tanggalLaporan,
      penanggung_jawab_id: penanggungJawabId,
      target_penyelesaian: targetPenyelesaian,
      status: 'Baru',
      informasi_koordinasi: informasiKoordinasi,
      rekomendasi_umum: rekomendasiUmum
    });

    setShowModalNewCase(false);
    setSelectedCaseId(created.id);
    setSelectedSiswaId('');
    setInformasiKoordinasi('');
    setRekomendasiUmum('');
  };

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId) return;

    dbService.updateKoordinasiStatus(selectedCaseId, newStatus, catatanStatus || `Status diperbarui menjadi ${newStatus}`);
    setShowModalStatus(false);
    setCatatanStatus('');
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId) return;

    dbService.addPenugasanTindakLanjut({
      koordinasi_id: selectedCaseId,
      ditugaskan_kepada: tugasTargetGuru,
      ditugaskan_oleh: profile.guru_id || 'guru-waka',
      tanggal_penugasan: new Date().toISOString().split('T')[0],
      target_penyelesaian: targetTugasDate,
      tugas: tugasDeskripsi,
      hasil: null,
      status: 'Menunggu'
    });

    setShowModalTask(false);
    setTugasDeskripsi('');
  };

  const getStatusColor = (st: StatusKoordinasi) => {
    switch (st) {
      case 'Baru': return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'Diproses': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Koordinasi': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Tindak Lanjut': return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      case 'Monitoring': return 'text-teal-700 bg-teal-50 border-teal-200';
      case 'Selesai': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      default: return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
            <Activity className="w-4 h-4" />
            <span>Pusat Koordinasi Kasus & Penanganan Siswa Terpadu</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Pusat Koordinasi Siswa</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sinergi kolaboratif Guru Wali, Wali Kelas, KKK, Guru BK, Kesiswaan, dan Pimpinan SMKN 1 Jember.
          </p>
        </div>

        <button
          onClick={() => setShowModalNewCase(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Buka Kasus Koordinasi Baru</span>
        </button>
      </div>

      {/* Main Split Layout: Case List on Left, Case Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Cases List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white p-3.5 rounded-lg border border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Daftar Kasus Koordinasi</span>
            <span className="text-xs text-slate-600">{dbService.koordinasiList.length} kasus terdaftar</span>
          </div>

          <div className="space-y-2.5 max-h-[750px] overflow-y-auto">
            {dbService.koordinasiList.map((k: KoordinasiSiswa) => {
              const s = dbService.getSiswaById(k.siswa_id);
              const kls = s ? dbService.getKelasById(s.kelas_id) : null;
              const isSelected = k.id === selectedCaseId;

              return (
                <div
                  key={k.id}
                  onClick={() => setSelectedCaseId(k.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/50 border-blue-500 ring-1 ring-blue-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-blue-700">{k.nomor_kasus}</span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${getStatusColor(k.status)}`}>
                      {k.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{s?.nama_lengkap || 'Siswa'}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">NIS: {s?.nis} · {kls?.nama_kelas || '-'}</p>

                  <p className="text-xs text-slate-700 mt-2 line-clamp-2">{k.informasi_koordinasi}</p>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                    <span>Lapor: {k.tanggal_laporan}</span>
                    <span>Target: {k.target_penyelesaian}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Case Details & Workflow Action */}
        <div className="lg:col-span-7 space-y-5">
          {activeCase ? (
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-5">
              {/* Top Banner Details */}
              <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700">{activeCase.nomor_kasus}</span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${getStatusColor(activeCase.status)}`}>
                      {activeCase.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{activeSiswa?.nama_lengkap}</h3>
                  <p className="text-xs text-slate-500">
                    Kelas: {activeKelas?.nama_kelas} · Kategori: <strong>{activeCase.kategori_masalah}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setNewStatus(activeCase.status);
                      setShowModalStatus(true);
                    }}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors"
                  >
                    Ubah Status Kasus
                  </button>
                  <button
                    onClick={() => setShowModalTask(true)}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Disposisi Tugas</span>
                  </button>
                </div>
              </div>

              {/* Information & General Recommendation (Prinsip Need-to-know: Section 16 & 31) */}
              <div className="space-y-3 text-xs">
                <div>
                  <strong className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Ringkasan Informasi Masalah & Koordinasi:
                  </strong>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-md mt-1 text-slate-800 leading-relaxed">
                    {activeCase.informasi_koordinasi}
                  </div>
                </div>

                <div>
                  <strong className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Rekomendasi Tindak Lanjut Terpadu:
                  </strong>
                  <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-md mt-1 text-blue-900 leading-relaxed font-medium">
                    {activeCase.rekomendasi_umum}
                  </div>
                </div>
              </div>

              {/* Disposisi & Penugasan Tindak Lanjut (Section 25) */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Penugasan Tindak Lanjut ({tasks.length})
                  </h4>
                  <button
                    onClick={() => setShowModalTask(true)}
                    className="text-xs text-blue-600 font-semibold hover:underline"
                  >
                    + Tambah Instruksi
                  </button>
                </div>

                <div className="space-y-2">
                  {tasks.length === 0 ? (
                    <p className="text-xs text-slate-600 italic">Belum ada penugasan tindak lanjut yang dikeluarkan.</p>
                  ) : (
                    tasks.map((t: PenugasanTindakLanjut) => {
                      const toGuru = dbService.getGuruById(t.ditugaskan_kepada);
                      const byGuru = dbService.getGuruById(t.ditugaskan_oleh);
                      return (
                        <div key={t.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
                          <div className="flex items-center justify-between font-semibold text-slate-900">
                            <span className="text-blue-700">Ditugaskan kepada: {toGuru?.nama_lengkap || 'Guru'}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              t.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {t.status}
                            </span>
                          </div>
                          <p className="text-slate-800 font-medium">{t.tugas}</p>
                          {t.hasil && (
                            <p className="text-emerald-800 bg-emerald-50/70 p-2 rounded text-[11px]">
                              <strong>Hasil:</strong> {t.hasil}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                            <span>Disposisi oleh: {byGuru?.nama_lengkap || 'Waka Kesiswaan'}</span>
                            <span>Target: {t.target_penyelesaian}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Riwayat Status Kasus / Audit Timeline (Section 26) */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Riwayat Perubahan Status (Immutable History)
                </h4>
                <div className="relative pl-6 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {history.map((h: RiwayatStatusKasus) => {
                    const guru = dbService.getGuruById(h.diubah_oleh);
                    return (
                      <div key={h.id} className="relative text-xs text-slate-700 space-y-0.5">
                        <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{h.status_baru}</span>
                          <span className="text-slate-600">· {new Date(h.created_at).toLocaleString('id-ID')}</span>
                        </div>
                        <p className="text-slate-600">{h.catatan}</p>
                        <span className="text-[11px] text-slate-600 block">Oleh: {guru?.nama_lengkap || 'Petugas'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg border border-slate-200 text-center text-xs text-slate-600">
              Pilih kasus dari daftar sebelah kiri untuk melihat detail penanganan.
            </div>
          )}
        </div>
      </div>

      {/* Modal Buka Kasus Baru */}
      {showModalNewCase && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-xl border border-slate-200 overflow-hidden my-8">
            <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Buka Kasus Koordinasi Siswa Baru</h3>
                <p className="text-xs text-slate-500">Nomor kasus KS-2026-XXXXXX otomatis dibuat oleh sistem.</p>
              </div>
              <button onClick={() => setShowModalNewCase(false)} className="text-slate-400 text-lg">&times;</button>
            </div>

            <form onSubmit={handleCreateCase} className="p-5 space-y-3.5 max-h-[75vh] overflow-y-auto">
              <StudentSelect value={selectedSiswaId} onChange={setSelectedSiswaId} label="Pilih Siswa Terkait Kasus" required />

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">Kategori Masalah</label>
                <select
                  value={kategoriMasalah}
                  onChange={e => setKategoriMasalah(e.target.value)}
                  className="w-full h-11 px-3 text-xs border border-slate-300 rounded-lg text-slate-800"
                >
                  <option value="Kedisiplinan & Presensi Kehadiran">Kedisiplinan & Presensi Kehadiran</option>
                  <option value="Penurunan Motivasi Belajar & Akademik">Penurunan Motivasi Belajar & Akademik</option>
                  <option value="Hambatan Sosial / Adaptasi Teman Sebaya">Hambatan Sosial / Adaptasi Teman Sebaya</option>
                  <option value="Kesiapan Praktik Vokasi & PKL Industri">Kesiapan Praktik Vokasi & PKL Industri</option>
                  <option value="Pelanggaran Tata Tertib Berat">Pelanggaran Tata Tertib Berat</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <DatePicker value={tanggalLaporan} onChange={setTanggalLaporan} label="Tanggal Laporan" />
                <DatePicker value={targetPenyelesaian} onChange={setTargetPenyelesaian} label="Target Selesai" />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">Penanggung Jawab Kasus (PJ)</label>
                <select
                  value={penanggungJawabId}
                  onChange={e => setPenanggungJawabId(e.target.value)}
                  className="w-full h-11 px-3 text-xs border border-slate-300 rounded-lg text-slate-800"
                >
                  {dbService.guruList.map((g: Guru) => (
                    <option key={g.id} value={g.id}>
                      {g.nama_lengkap} ({g.jabatan})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Informasi Koordinasi (Need-To-Know Non-Confidential) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={informasiKoordinasi}
                  onChange={e => setInformasiKoordinasi(e.target.value)}
                  placeholder="Deskripsikan masalah secara objektif tanpa mencantumkan rincian rahasia BK..."
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">Rekomendasi Tindakan</label>
                <textarea
                  rows={2}
                  required
                  value={rekomendasiUmum}
                  onChange={e => setRekomendasiUmum(e.target.value)}
                  placeholder="Rekomendasi kolaborasi lintas guru wali, wali kelas, atau kesiswaan..."
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModalNewCase(false)} className="px-3.5 py-2 text-xs text-slate-600">Batal</button>
                <button type="submit" className="px-5 py-2 text-xs font-semibold bg-blue-600 text-white rounded-md shadow-xs">
                  Buka Kasus Koordinasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ubah Status Kasus */}
      {showModalStatus && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Perbarui Status Kasus Koordinasi</h3>
              <button onClick={() => setShowModalStatus(false)} className="text-slate-400 text-lg">&times;</button>
            </div>
            <form onSubmit={handleUpdateStatus} className="p-5 space-y-3">
              <StatusSelect
                value={newStatus}
                onChange={(val: string) => setNewStatus(val as StatusKoordinasi)}
                options={['Baru', 'Diproses', 'Koordinasi', 'Tindak Lanjut', 'Monitoring', 'Selesai']}
              />
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">Catatan Perkembangan</label>
                <textarea
                  rows={3}
                  required
                  value={catatanStatus}
                  onChange={e => setCatatanStatus(e.target.value)}
                  placeholder="Catatan alasan perubahan status..."
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg text-slate-800"
                />
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModalStatus(false)} className="px-3 py-1.5 text-xs text-slate-600">Batal</button>
                <button type="submit" className="px-4 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded">Simpan Status</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Disposisi Tugas */}
      {showModalTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Disposisi Instruksi Tindak Lanjut</h3>
              <button onClick={() => setShowModalTask(false)} className="text-slate-400 text-lg">&times;</button>
            </div>
            <form onSubmit={handleAddTask} className="p-5 space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">Tugaskan Kepada</label>
                <select
                  value={tugasTargetGuru}
                  onChange={e => setTugasTargetGuru(e.target.value)}
                  className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg text-slate-800"
                >
                  {dbService.guruList.map((g: Guru) => (
                    <option key={g.id} value={g.id}>
                      {g.nama_lengkap} ({g.jabatan})
                    </option>
                  ))}
                </select>
              </div>
              <DatePicker value={targetTugasDate} onChange={setTargetTugasDate} label="Batas Waktu Target" />
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">Rincian Instruksi / Tugas</label>
                <textarea
                  rows={3}
                  required
                  value={tugasDeskripsi}
                  onChange={e => setTugasDeskripsi(e.target.value)}
                  placeholder="Instruksi spesifik yang harus dijalankan..."
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg text-slate-800"
                />
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModalTask(false)} className="px-3 py-1.5 text-xs text-slate-600">Batal</button>
                <button type="submit" className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded">Kirim Tugas</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
