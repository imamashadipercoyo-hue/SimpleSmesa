import React, { useState } from 'react';
import { dbService } from '../services/supabaseService';
import { StudentSelect, ClassAutoFill, CompetencyAutoFill, DatePicker, TimePicker, StatusSelect, FileUpload } from '../components/common/FormComponents';
import { PenugasanGuru, Siswa, JurnalKKK, PrestasiSiswa } from '../types/database';
import { Briefcase, Plus, ShieldCheck, Award, Layers } from 'lucide-react';

export const KKKView: React.FC = () => {
  const profile = dbService.currentUser;
  const isKKK = profile.role_kode === 'kkk' || profile.role_kode === 'admin';

  // Determine assigned competency
  const penugasanKK = dbService.penugasanList.find((p: PenugasanGuru) => p.guru_id === profile.guru_id && p.kompetensi_keahlian_id);
  const myKompetensi = penugasanKK
    ? dbService.getKompetensiById(penugasanKK.kompetensi_keahlian_id || '')
    : dbService.kompetensiList[0];

  const [showModal, setShowModal] = useState(false);
  const [selectedSiswaId, setSelectedSiswaId] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [waktu, setWaktu] = useState('10:00');
  const [jenisKegiatan, setJenisKegiatan] = useState('Evaluasi Portofolio Praktik Kejuruan');
  const [permasalahan, setPermasalahan] = useState('');
  const [tindakan, setTindakan] = useState('');
  const [hasil, setHasil] = useState('');
  const [tindakLanjut, setTindakLanjut] = useState('');
  const [status, setStatus] = useState<'Berjalan' | 'Selesai' | 'Perlu Koordinasi'>('Berjalan');
  const [dokumentasiUrl, setDokumentasiUrl] = useState<string | null>(null);

  // Accessible students in this competency
  const competencyStudents = dbService.siswaList.filter((s: Siswa) => s.kompetensi_keahlian_id === myKompetensi?.id);
  const selectedStudentObj = dbService.getSiswaById(selectedSiswaId);

  // Filter journals
  const journals = dbService.jurnalKKKList.filter((j: JurnalKKK) => {
    if (profile.role_kode === 'kkk' && myKompetensi) {
      return j.kompetensi_keahlian_id === myKompetensi.id;
    }
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiswaId || !myKompetensi) return;

    dbService.addJurnalKKK({
      siswa_id: selectedSiswaId,
      guru_id: profile.guru_id || 'guru-kkk',
      kompetensi_keahlian_id: myKompetensi.id,
      tanggal,
      waktu,
      jenis_kegiatan: jenisKegiatan,
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
            <Briefcase className="w-4 h-4" />
            <span>Ketua Konsentrasi Keahlian (KKK)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Program Keahlian: {myKompetensi?.nama} ({myKompetensi?.kode})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoring kesiapan vokasi, sertifikasi kompetensi keahlian, pembimbingan teknis & PKL Industri.
          </p>
        </div>

        {isKKK && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Jurnal Vokasi KKK</span>
          </button>
        )}
      </div>

      {/* RLS Policy Notice */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-lg flex items-start gap-2.5 text-xs text-blue-800">
        <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold">RLS KKK Aktif:</strong>
          <span className="ml-1 text-slate-600">
            Sesuai aturan RLS (<code className="bg-blue-100 px-1 py-0.5 rounded text-[11px]">siswa.kompetensi_keahlian_id = assigned_id</code>), KKK hanya memiliki akses terhadap {competencyStudents.length} siswa dalam program keahlian {myKompetensi?.kode}.
          </span>
        </div>
      </div>

      {/* Cards summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Siswa Jurusan</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{competencyStudents.length}</div>
          <span className="text-xs text-slate-500 mt-1 block">Tingkat X, XI, XII</span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Jurnal Monitoring</span>
          <div className="text-2xl font-bold text-indigo-600 mt-1">{journals.length}</div>
          <span className="text-xs text-slate-500 mt-1 block">Aktivitas pembinaan</span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Prestasi Jurusan</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {dbService.prestasiList.filter((p: PrestasiSiswa) => competencyStudents.some((s: Siswa) => s.id === p.siswa_id)).length}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">LKS & Kejuaraan</span>
        </div>
      </div>

      {/* Journal Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Riwayat Jurnal KKK</h3>
          <span className="text-xs text-slate-600">Total: {journals.length} catatan</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-white text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Tanggal / Waktu</th>
                <th className="py-3 px-4">Siswa</th>
                <th className="py-3 px-4">Jenis Kegiatan</th>
                <th className="py-3 px-4">Permasalahan Kejuruan</th>
                <th className="py-3 px-4">Tindakan & Solusi KKK</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {journals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-600">
                    Belum ada catatan jurnal KKK untuk program keahlian ini.
                  </td>
                </tr>
              ) : (
                journals.map((j: JurnalKKK) => {
                  const s = dbService.getSiswaById(j.siswa_id);
                  const kls = s ? dbService.getKelasById(s.kelas_id) : null;
                  return (
                    <tr key={j.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                        <span className="font-semibold text-slate-900 block">{j.tanggal}</span>
                        <span>{j.waktu} WIB</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-900 block">{s?.nama_lengkap}</span>
                        <span className="text-[11px] text-slate-500">NIS: {s?.nis} · {kls?.nama_kelas}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-indigo-700">
                        {j.jenis_kegiatan}
                      </td>
                      <td className="py-3 px-4 max-w-xs font-medium text-slate-800">
                        {j.permasalahan}
                      </td>
                      <td className="py-3 px-4 max-w-xs text-slate-700">
                        <p>{j.tindakan}</p>
                        <p className="text-[11px] text-slate-500 italic mt-0.5">Hasil: {j.hasil}</p>
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

      {/* Modal Add Jurnal KKK */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl border border-slate-200 overflow-hidden my-8">
            <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Form Jurnal KKK</h3>
                <p className="text-xs text-slate-500">Konsentrasi: {myKompetensi?.nama}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg leading-none p-1">
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Pilih Siswa Jurusan {myKompetensi?.kode} <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={selectedSiswaId}
                  onChange={e => setSelectedSiswaId(e.target.value)}
                  className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800"
                >
                  <option value="">-- Pilih Siswa Jurusan Ini --</option>
                  {competencyStudents.map((s: Siswa) => {
                    const kls = dbService.getKelasById(s.kelas_id);
                    return (
                      <option key={s.id} value={s.id}>
                        {s.nama_lengkap} (NIS: {s.nis} · {kls?.nama_kelas})
                      </option>
                    );
                  })}
                </select>
              </div>

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

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Jenis Kegiatan / Fokus Vokasi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={jenisKegiatan}
                  onChange={e => setJenisKegiatan(e.target.value)}
                  placeholder="Contoh: Evaluasi Portofolio Praktik / Penjajakan Mitra Industri PKL"
                  className="w-full h-11 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Permasalahan Kejuruan <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={permasalahan}
                  onChange={e => setPermasalahan(e.target.value)}
                  placeholder="Kendala teknis, absensi lab, sertifikasi kompetensi..."
                  className="w-full p-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Tindakan & Solusi KKK <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={tindakan}
                  onChange={e => setTindakan(e.target.value)}
                  placeholder="Klinik coding sore, matrikulasi alat, workshop..."
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
                    placeholder="Hasil yang dicapai..."
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
                    placeholder="Jadwal uji ulang..."
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
                  Simpan Jurnal KKK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
