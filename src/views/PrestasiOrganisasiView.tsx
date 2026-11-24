import React, { useState } from 'react';
import { dbService } from '../services/supabaseService';
import { StudentSelect, DatePicker, FileUpload } from '../components/common/FormComponents';
import { PrestasiSiswa, KegiatanOSIS, KegiatanEkstrakurikuler } from '../types/database';
import { Award, Users, Trophy, Plus, Calendar, CheckCircle } from 'lucide-react';

export const PrestasiOrganisasiView: React.FC = () => {
  const profile = dbService.currentUser;
  const [tab, setTab] = useState<'prestasi' | 'osis' | 'ekskul'>('prestasi');

  const [showModalPrestasi, setShowModalPrestasi] = useState(false);
  const [showModalOSIS, setShowModalOSIS] = useState(false);
  const [showModalEkskul, setShowModalEkskul] = useState(false);

  // Prestasi Form
  const [selectedSiswaId, setSelectedSiswaId] = useState('');
  const [namaPrestasi, setNamaPrestasi] = useState('');
  const [tingkat, setTingkat] = useState<'Sekolah' | 'Kecamatan' | 'Kabupaten/Kota' | 'Provinsi' | 'Nasional' | 'Internasional'>('Provinsi');
  const [kategori, setKategori] = useState<'Akademik' | 'Non-Akademik' | 'Kejuruan / LKS' | 'Seni & Olahraga'>('Kejuruan / LKS');
  const [peringkat, setPeringkat] = useState('Juara 1 (Emas)');
  const [tanggalPrestasi, setTanggalPrestasi] = useState(new Date().toISOString().split('T')[0]);
  const [penyelenggara, setPenyelenggara] = useState('Dinas Pendidikan Provinsi Jawa Timur');
  const [keterangan, setKeterangan] = useState('');

  // OSIS Form
  const [namaKegiatanOSIS, setNamaKegiatanOSIS] = useState('');
  const [jenisOrganisasi, setJenisOrganisasi] = useState<'OSIS' | 'MPK'>('OSIS');
  const [tglMulai, setTglMulai] = useState(new Date().toISOString().split('T')[0]);
  const [tglSelesai, setTglSelesai] = useState(new Date().toISOString().split('T')[0]);
  const [pjOSIS, setPjOSIS] = useState('Ketua OSIS');
  const [deskripsiOSIS, setDeskripsiOSIS] = useState('');

  // Ekskul Form
  const [namaEkskul, setNamaEkskul] = useState('SMESA IT Club & Coding');
  const [tglEkskul, setTglEkskul] = useState(new Date().toISOString().split('T')[0]);
  const [kegiatanEkskul, setKegiatanEkskul] = useState('');
  const [hasilEkskul, setHasilEkskul] = useState('');

  const handleSavePrestasi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiswaId || !namaPrestasi) return;

    dbService.addPrestasi({
      siswa_id: selectedSiswaId,
      nama_prestasi: namaPrestasi,
      tingkat,
      kategori,
      peringkat,
      tanggal: tanggalPrestasi,
      penyelenggara,
      keterangan,
      dokumentasi_url: null
    });

    setShowModalPrestasi(false);
    setSelectedSiswaId('');
    setNamaPrestasi('');
    setKeterangan('');
  };

  const handleSaveOSIS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaKegiatanOSIS) return;

    dbService.addKegiatanOSIS({
      nama_kegiatan: namaKegiatanOSIS,
      jenis_organisasi: jenisOrganisasi,
      tanggal_mulai: tglMulai,
      tanggal_selesai: tglSelesai,
      penanggung_jawab: pjOSIS,
      deskripsi: deskripsiOSIS,
      status: 'Terlaksana',
      dokumentasi_url: null
    });

    setShowModalOSIS(false);
    setNamaKegiatanOSIS('');
    setDeskripsiOSIS('');
  };

  const handleSaveEkskul = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaEkskul) return;

    dbService.addKegiatanEkskul({
      nama_ekstrakurikuler: namaEkskul,
      pembina_id: profile.guru_id || 'guru-kkk',
      tanggal: tglEkskul,
      kegiatan: kegiatanEkskul,
      hasil: hasilEkskul,
      status: 'Terlaksana',
      dokumentasi_url: null
    });

    setShowModalEkskul(false);
    setKegiatanEkskul('');
    setHasilEkskul('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider">
            <Trophy className="w-4 h-4" />
            <span>Prestasi & Pengembangan Karakter Siswa</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Prestasi, OSIS/MPK & Ekstrakurikuler</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dokumentasi kejuaraan akademik/non-akademik, kepemimpinan organisasi siswa, dan talenta ekskul SMKN 1 Jember.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {tab === 'prestasi' && (
            <button
              onClick={() => setShowModalPrestasi(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Prestasi Siswa</span>
            </button>
          )}
          {tab === 'osis' && (
            <button
              onClick={() => setShowModalOSIS(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kegiatan OSIS/MPK</span>
            </button>
          )}
          {tab === 'ekskul' && (
            <button
              onClick={() => setShowModalEkskul(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Aktivitas Ekskul</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg max-w-md">
        <button
          onClick={() => setTab('prestasi')}
          className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-colors ${
            tab === 'prestasi' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Prestasi Siswa ({dbService.prestasiList.length})
        </button>
        <button
          onClick={() => setTab('osis')}
          className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-colors ${
            tab === 'osis' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          OSIS / MPK ({dbService.kegiatanOSISList.length})
        </button>
        <button
          onClick={() => setTab('ekskul')}
          className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-colors ${
            tab === 'ekskul' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Ekstrakurikuler ({dbService.kegiatanEkskulList.length})
        </button>
      </div>

      {/* Tab: Prestasi */}
      {tab === 'prestasi' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dbService.prestasiList.map((p: PrestasiSiswa) => {
            const s = dbService.getSiswaById(p.siswa_id);
            const kls = s ? dbService.getKelasById(s.kelas_id) : null;
            return (
              <div key={p.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Tingkat {p.tingkat} · {p.kategori}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-2">{p.nama_prestasi}</h3>
                  </div>
                  <Award className="w-6 h-6 text-amber-500 shrink-0" />
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <div>Peraih: <strong className="text-slate-900">{s?.nama_lengkap}</strong> ({kls?.nama_kelas})</div>
                  <div>Peringkat: <strong className="text-emerald-700">{p.peringkat}</strong></div>
                  <div>Penyelenggara: {p.penyelenggara}</div>
                  <div>Tanggal: {p.tanggal}</div>
                  <p className="text-slate-500 italic mt-2">{p.keterangan}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: OSIS */}
      {tab === 'osis' && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
          <div className="divide-y divide-slate-100">
            {dbService.kegiatanOSISList.map((o: KegiatanOSIS) => (
              <div key={o.id} className="p-4 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold text-slate-900 text-sm">
                  <span>{o.nama_kegiatan}</span>
                  <span className="text-blue-700 text-xs px-2 py-0.5 bg-blue-50 border border-blue-200 rounded">
                    {o.jenis_organisasi} · {o.status}
                  </span>
                </div>
                <p className="text-slate-700">{o.deskripsi}</p>
                <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1">
                  <span>Penanggung Jawab: {o.penanggung_jawab}</span>
                  <span>Pelaksanaan: {o.tanggal_mulai} s/d {o.tanggal_selesai}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Ekskul */}
      {tab === 'ekskul' && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
          <div className="divide-y divide-slate-100">
            {dbService.kegiatanEkskulList.map((e: KegiatanEkstrakurikuler) => {
              const pembina = dbService.getGuruById(e.pembina_id);
              return (
                <div key={e.id} className="p-4 text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-slate-900 text-sm">
                    <span>{e.nama_ekstrakurikuler}</span>
                    <span className="text-emerald-700 text-xs px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded">
                      {e.status}
                    </span>
                  </div>
                  <p className="text-slate-800 font-medium">Kegiatan: {e.kegiatan}</p>
                  <p className="text-slate-600 bg-slate-50 p-2 rounded">Hasil: {e.hasil}</p>
                  <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1">
                    <span>Pembina: {pembina?.nama_lengkap || '-'}</span>
                    <span>Tanggal: {e.tanggal}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Prestasi */}
      {showModalPrestasi && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl border border-slate-200 overflow-hidden my-8">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Catat Prestasi Siswa</h3>
              <button onClick={() => setShowModalPrestasi(false)} className="text-slate-400 text-lg">&times;</button>
            </div>
            <form onSubmit={handleSavePrestasi} className="p-5 space-y-3">
              <StudentSelect value={selectedSiswaId} onChange={setSelectedSiswaId} label="Siswa Berprestasi" required />
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">Nama Kejuaraan / Prestasi</label>
                <input
                  type="text"
                  required
                  value={namaPrestasi}
                  onChange={e => setNamaPrestasi(e.target.value)}
                  placeholder="Contoh: Juara 1 Lomba Web Technologies LKS..."
                  className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg text-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">Tingkat</label>
                  <select
                    value={tingkat}
                    onChange={e => setTingkat(e.target.value as any)}
                    className="w-full h-10 px-2 text-xs border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="Sekolah">Sekolah</option>
                    <option value="Kecamatan">Kecamatan</option>
                    <option value="Kabupaten/Kota">Kabupaten/Kota</option>
                    <option value="Provinsi">Provinsi</option>
                    <option value="Nasional">Nasional</option>
                    <option value="Internasional">Internasional</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">Peringkat</label>
                  <input
                    type="text"
                    required
                    value={peringkat}
                    onChange={e => setPeringkat(e.target.value)}
                    placeholder="Juara 1 / Medali Emas"
                    className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <DatePicker value={tanggalPrestasi} onChange={setTanggalPrestasi} />
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">Penyelenggara</label>
                  <input
                    type="text"
                    required
                    value={penyelenggara}
                    onChange={e => setPenyelenggara(e.target.value)}
                    className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">Keterangan Tambahan</label>
                <textarea
                  rows={2}
                  value={keterangan}
                  onChange={e => setKeterangan(e.target.value)}
                  placeholder="Catatan apresiasi..."
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg text-slate-800"
                />
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModalPrestasi(false)} className="px-3 py-1.5 text-xs text-slate-600">Batal</button>
                <button type="submit" className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded">Simpan Prestasi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal OSIS */}
      {showModalOSIS && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-slate-200 overflow-hidden my-8">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Catat Kegiatan OSIS / MPK</h3>
              <button onClick={() => setShowModalOSIS(false)} className="text-slate-400 text-lg">&times;</button>
            </div>
            <form onSubmit={handleSaveOSIS} className="p-5 space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">Nama Kegiatan</label>
                <input
                  type="text"
                  required
                  value={namaKegiatanOSIS}
                  onChange={e => setNamaKegiatanOSIS(e.target.value)}
                  placeholder="Contoh: Latihan Dasar Kepemimpinan Siswa..."
                  className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg text-slate-800"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">Organisasi</label>
                <select
                  value={jenisOrganisasi}
                  onChange={e => setJenisOrganisasi(e.target.value as any)}
                  className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg text-slate-800"
                >
                  <option value="OSIS">OSIS</option>
                  <option value="MPK">MPK</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <DatePicker value={tglMulai} onChange={setTglMulai} label="Tanggal Mulai" />
                <DatePicker value={tglSelesai} onChange={setTglSelesai} label="Tanggal Selesai" />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">Deskripsi Kegiatan</label>
                <textarea
                  rows={2}
                  value={deskripsiOSIS}
                  onChange={e => setDeskripsiOSIS(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg text-slate-800"
                />
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModalOSIS(false)} className="px-3 py-1.5 text-xs text-slate-600">Batal</button>
                <button type="submit" className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded">Simpan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ekskul */}
      {showModalEkskul && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-slate-200 overflow-hidden my-8">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Aktivitas Ekstrakurikuler</h3>
              <button onClick={() => setShowModalEkskul(false)} className="text-slate-400 text-lg">&times;</button>
            </div>
            <form onSubmit={handleSaveEkskul} className="p-5 space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">Nama Ekstrakurikuler</label>
                <input
                  type="text"
                  required
                  value={namaEkskul}
                  onChange={e => setNamaEkskul(e.target.value)}
                  className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg text-slate-800"
                />
              </div>
              <DatePicker value={tglEkskul} onChange={setTglEkskul} />
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">Uraian Kegiatan</label>
                <textarea
                  rows={2}
                  required
                  value={kegiatanEkskul}
                  onChange={e => setKegiatanEkskul(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg text-slate-800"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">Hasil / Output Siswa</label>
                <input
                  type="text"
                  required
                  value={hasilEkskul}
                  onChange={e => setHasilEkskul(e.target.value)}
                  className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg text-slate-800"
                />
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModalEkskul(false)} className="px-3 py-1.5 text-xs text-slate-600">Batal</button>
                <button type="submit" className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded">Simpan Ekskul</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
