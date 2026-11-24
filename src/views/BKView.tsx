import React, { useState } from 'react';
import { dbService } from '../services/supabaseService';
import { StudentSelect, ClassAutoFill, CompetencyAutoFill, DatePicker, TimePicker, StatusSelect, FileUpload } from '../components/common/FormComponents';
import { JenisLayananBK, BidangLayananBK, JurnalBK, KonselingRestricted, AsesmenBKRestricted, RujukanBK } from '../types/database';
import { HeartHandshake, ShieldCheck, ShieldAlert, Lock, Unlock, Plus, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

export const BKView: React.FC = () => {
  const profile = dbService.currentUser;
  const isGuruBK = profile.role_kode === 'guru_bk';

  const [activeTab, setActiveTab] = useState<'jurnal' | 'vault' | 'asesmen' | 'rujukan'>('jurnal');
  const [showModalJurnal, setShowModalJurnal] = useState(false);
  const [showModalAsesmen, setShowModalAsesmen] = useState(false);
  const [showModalRujukan, setShowModalRujukan] = useState(false);

  // Form Jurnal BK state
  const [selectedSiswaId, setSelectedSiswaId] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [waktu, setWaktu] = useState('08:30');
  const [bidangLayanan, setBidangLayanan] = useState<BidangLayananBK>('Pribadi');
  const [jenisLayanan, setJenisLayanan] = useState<JenisLayananBK>('Konseling Individu');
  const [tujuanLayanan, setTujuanLayanan] = useState('');
  const [identifikasiKebutuhan, setIdentifikasiKebutuhan] = useState('');
  const [intervensi, setIntervensi] = useState('');
  const [hasilLayanan, setHasilLayanan] = useState('');
  const [rencanaTindakLanjut, setRencanaTindakLanjut] = useState('');
  const [jadwalBerikutnya, setJadwalBerikutnya] = useState('');
  const [statusLayanan, setStatusLayanan] = useState<'Baru' | 'Dalam Proses' | 'Selesai' | 'Alih Tangan Kasus'>('Dalam Proses');
  const [dokumentasiUrl, setDokumentasiUrl] = useState<string | null>(null);

  // Form Restricted Confidential Notes (Optional inclusion during session)
  const [withRestricted, setWithRestricted] = useState(false);
  const [catatanRahasia, setCatatanRahasia] = useState('');
  const [hasilAssessment, setHasilAssessment] = useState('');
  const [rekomendasiProfesional, setRekomendasiProfesional] = useState('');

  // Form Asesmen state
  const [jenisAsesmen, setJenisAsesmen] = useState('Inventori Tugas Perkembangan (ITP)');
  const [hasilAsesmenText, setHasilAsesmenText] = useState('');
  const [catatanProfText, setCatatanProfText] = useState('');
  const [rekomendasiText, setRekomendasiText] = useState('');

  // Form Rujukan state
  const [jenisRujukan, setJenisRujukan] = useState('Konsultasi Spesialis Psikolog Klinis');
  const [tujuanRujukan, setTujuanRujukan] = useState('Pemeriksaan diagnostik komprehensif');
  const [alasanRujukan, setAlasanRujukan] = useState('');

  const selectedStudentObj = dbService.getSiswaById(selectedSiswaId);

  // RLS evaluation for restricted data
  const restrictedResult = dbService.getKonselingRestricted();
  const asesmenResult = dbService.getAsesmenRestricted();

  const handleSaveJurnal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiswaId) return;

    dbService.addJurnalBK(
      {
        siswa_id: selectedSiswaId,
        guru_bk_id: profile.guru_id || 'guru-bk',
        tanggal,
        waktu,
        jenis_layanan: jenisLayanan,
        bidang_layanan: bidangLayanan,
        tujuan_layanan: tujuanLayanan,
        identifikasi_kebutuhan: identifikasiKebutuhan,
        intervensi,
        hasil_layanan: hasilLayanan,
        rencana_tindak_lanjut: rencanaTindakLanjut,
        jadwal_berikutnya: jadwalBerikutnya ? new Date(jadwalBerikutnya).toISOString() : null,
        status_layanan: statusLayanan,
        dokumentasi_url: dokumentasiUrl
      },
      withRestricted && isGuruBK
        ? {
            catatan_rahasia: catatanRahasia,
            hasil_assessment: hasilAssessment,
            rekomendasi_profesional: rekomendasiProfesional
          }
        : undefined
    );

    setShowModalJurnal(false);
    setSelectedSiswaId('');
    setTujuanLayanan('');
    setIdentifikasiKebutuhan('');
    setIntervensi('');
    setHasilLayanan('');
    setRencanaTindakLanjut('');
    setCatatanRahasia('');
    setHasilAssessment('');
    setRekomendasiProfesional('');
  };

  const handleSaveAsesmen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiswaId) return;

    dbService.addAsesmenBK({
      siswa_id: selectedSiswaId,
      guru_bk_id: profile.guru_id || 'guru-bk',
      tanggal,
      jenis_asesmen: jenisAsesmen,
      hasil_asesmen: hasilAsesmenText,
      catatan_profesional: catatanProfText,
      rekomendasi: rekomendasiText
    });

    setShowModalAsesmen(false);
    setSelectedSiswaId('');
    setHasilAsesmenText('');
    setCatatanProfText('');
    setRekomendasiText('');
  };

  const handleSaveRujukan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiswaId) return;

    dbService.addRujukanBK({
      siswa_id: selectedSiswaId,
      guru_bk_id: profile.guru_id || 'guru-bk',
      tanggal,
      jenis_rujukan: jenisRujukan,
      tujuan_rujukan: tujuanRujukan,
      alasan_rujukan: alasanRujukan,
      status: 'Diusulkan',
      hasil_rujukan: 'Menunggu konfirmasi jadwal'
    });

    setShowModalRujukan(false);
    setSelectedSiswaId('');
    setAlasanRujukan('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 uppercase tracking-wider">
            <HeartHandshake className="w-4 h-4" />
            <span>Bimbingan Konseling & Layanan Psikopedagogis</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Layanan Guru BK SMKN 1 Jember</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Konseling individu, bimbingan kelompok, mediasi, asesmen psikologis, dan alih tangan kasus (rujukan).
          </p>
        </div>

        {isGuruBK && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowModalJurnal(true)}
              className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Sesi Layanan BK</span>
            </button>
            <button
              onClick={() => setShowModalAsesmen(true)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Asesmen Rahasia</span>
            </button>
            <button
              onClick={() => setShowModalRujukan(true)}
              className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Rujukan Kasus</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg max-w-xl">
        <button
          onClick={() => setActiveTab('jurnal')}
          className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'jurnal' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Jurnal Layanan Umum ({dbService.jurnalBKList.length})
        </button>
        <button
          onClick={() => setActiveTab('vault')}
          className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'vault' ? 'bg-white text-purple-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Lock className="w-3 h-3 text-purple-600" />
          <span>Vault BK Rahasia (Restricted)</span>
        </button>
        <button
          onClick={() => setActiveTab('asesmen')}
          className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'asesmen' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Asesmen Psikologis
        </button>
        <button
          onClick={() => setActiveTab('rujukan')}
          className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'rujukan' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Rujukan ({dbService.rujukanBKList.length})
        </button>
      </div>

      {/* TAB 1: JURNAL BK UMUM */}
      {activeTab === 'jurnal' && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Jurnal Layanan Bimbingan Konseling</h3>
              <p className="text-[11px] text-slate-500">Data umum ini dapat diselaraskan untuk keperluan koordinasi lintas guru.</p>
            </div>
            <span className="text-xs text-slate-600">Total: {dbService.jurnalBKList.length} sesi</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-white text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Tanggal / Waktu</th>
                  <th className="py-3 px-4">Konseli (Siswa)</th>
                  <th className="py-3 px-4">Bidang & Jenis Layanan</th>
                  <th className="py-3 px-4">Identifikasi Kebutuhan</th>
                  <th className="py-3 px-4">Intervensi & Hasil</th>
                  <th className="py-3 px-4">Status & Jadwal Lanjut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dbService.jurnalBKList.map((j: JurnalBK) => {
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
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-purple-800 block">{j.jenis_layanan}</span>
                        <span className="text-[11px] text-slate-500">Bidang: {j.bidang_layanan}</span>
                      </td>
                      <td className="py-3 px-4 max-w-xs text-slate-800">
                        <p className="font-medium line-clamp-2">{j.identifikasi_kebutuhan}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">Tujuan: {j.tujuan_layanan}</p>
                      </td>
                      <td className="py-3 px-4 max-w-xs text-slate-700">
                        <p className="line-clamp-2">{j.hasil_layanan}</p>
                        <p className="text-[11px] text-slate-500 italic mt-0.5">Lanjut: {j.rencana_tindak_lanjut}</p>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-blue-700 block">{j.status_layanan}</span>
                        {j.jadwal_berikutnya && (
                          <span className="text-[11px] text-emerald-700 font-medium">
                            Jadwal: {new Date(j.jadwal_berikutnya).toLocaleDateString('id-ID')}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: VAULT BK RESTRICTED (STRICT SECURITY CHECK) */}
      {activeTab === 'vault' && (
        <div className="space-y-4">
          {!restrictedResult.authorized ? (
            /* 403 Forbidden Access Screen for non-BK roles */
            <div className="bg-white p-8 rounded-xl border border-red-200 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
                <Lock className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900">403 Forbidden — Akses Tertutup</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {restrictedResult.message}
                </p>
                <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-md text-[11px] text-slate-500 text-left space-y-1 font-mono">
                  <div>POLICY: <span className="text-red-600 font-semibold">bk_restricted_guru_bk_only</span></div>
                  <div>USER_ROLE: <span className="text-slate-800 font-bold">{profile.role_kode}</span></div>
                  <div>SECURITY_STATUS: <span className="text-emerald-700 font-semibold">ENFORCED (LOGGED TO AUDIT_LOGS)</span></div>
                </div>
              </div>
            </div>
          ) : (
            /* Authorized Guru BK View */
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg flex items-start gap-3">
                <Unlock className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">Akses Terotorisasi Guru BK</h4>
                  <p className="text-xs text-purple-800 mt-0.5">
                    Data di bawah ini berasal dari tabel <code className="bg-purple-100 px-1 py-0.5 rounded text-[11px]">konseling_restricted</code>. Seluruh isi asesmen, diagnosis, dan dinamika psikologis dirahasiakan penuh.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {restrictedResult.data.map((item: KonselingRestricted) => {
                  const s = dbService.getSiswaById(item.siswa_id);
                  const kls = s ? dbService.getKelasById(s.kelas_id) : null;
                  return (
                    <div key={item.id} className="bg-white p-5 rounded-lg border border-purple-200 shadow-xs space-y-3">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">{s?.nama_lengkap}</span>
                          <span className="text-[11px] text-slate-500">NIS: {s?.nis} · {kls?.nama_kelas}</span>
                        </div>
                        <span className="text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-sm font-semibold border border-purple-200">
                          Catatan Rahasia Konseling
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <strong className="text-slate-800 block text-[11px] uppercase tracking-wider font-semibold">Catatan Khusus & Latar Belakang:</strong>
                          <p className="text-slate-700 bg-slate-50 p-2.5 rounded-md mt-0.5 leading-relaxed">{item.catatan_rahasia}</p>
                        </div>
                        <div>
                          <strong className="text-slate-800 block text-[11px] uppercase tracking-wider font-semibold">Hasil Assessment Psikologis:</strong>
                          <p className="text-slate-700 bg-slate-50 p-2.5 rounded-md mt-0.5 leading-relaxed">{item.hasil_assessment}</p>
                        </div>
                        <div>
                          <strong className="text-slate-800 block text-[11px] uppercase tracking-wider font-semibold">Rekomendasi Profesional Guru BK:</strong>
                          <p className="text-purple-950 font-medium bg-purple-50/70 p-2.5 rounded-md mt-0.5 leading-relaxed">{item.rekomendasi_profesional}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ASESMEN PSIKOLOGIS */}
      {activeTab === 'asesmen' && (
        <div className="space-y-4">
          {!asesmenResult.authorized ? (
            <div className="bg-white p-6 rounded-lg border border-slate-200 text-center text-xs text-slate-600">
              Akses asesmen psikologis terbatas pada Guru BK.
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Asesmen Psikologis & Bakat Minat</h3>
                <span className="text-xs text-slate-600">Total: {asesmenResult.data.length} asesmen</span>
              </div>
              <div className="divide-y divide-slate-100">
                {asesmenResult.data.map((a: AsesmenBKRestricted) => {
                  const s = dbService.getSiswaById(a.siswa_id);
                  return (
                    <div key={a.id} className="p-4 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{s?.nama_lengkap} (NIS: {s?.nis})</span>
                        <span className="text-slate-500">{a.tanggal}</span>
                      </div>
                      <p className="font-semibold text-purple-700">Instrumen: {a.jenis_asesmen}</p>
                      <p className="text-slate-700 bg-slate-50 p-2 rounded-md"><strong>Hasil:</strong> {a.hasil_asesmen}</p>
                      <p className="text-slate-600"><strong>Catatan Profesional:</strong> {a.catatan_profesional}</p>
                      <p className="text-emerald-800 font-medium"><strong>Rekomendasi:</strong> {a.rekomendasi}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: RUJUKAN BK */}
      {activeTab === 'rujukan' && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Daftar Rujukan & Alih Tangan Kasus</h3>
            <span className="text-xs text-slate-600">Total: {dbService.rujukanBKList.length}</span>
          </div>
          <div className="divide-y divide-slate-100">
            {dbService.rujukanBKList.map((r: RujukanBK) => {
              const s = dbService.getSiswaById(r.siswa_id);
              return (
                <div key={r.id} className="p-4 text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-semibold text-slate-900">
                    <span>{s?.nama_lengkap} (NIS: {s?.nis})</span>
                    <span className="text-blue-700 font-bold">{r.status}</span>
                  </div>
                  <p className="font-medium text-slate-800">Lembaga Rujukan: {r.jenis_rujukan}</p>
                  <p className="text-slate-600">Tujuan: {r.tujuan_rujukan}</p>
                  <p className="text-slate-500 italic">Alasan: {r.alasan_rujukan}</p>
                  {r.hasil_rujukan && (
                    <div className="mt-2 p-2 bg-slate-50 rounded text-slate-700">
                      <strong>Hasil / Progres:</strong> {r.hasil_rujukan}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Jurnal BK */}
      {showModalJurnal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl border border-slate-200 overflow-hidden my-8">
            <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Form Layanan Bimbingan Konseling</h3>
                <p className="text-xs text-slate-500">Mencatat sesi konseling individu/kelompok.</p>
              </div>
              <button onClick={() => setShowModalJurnal(false)} className="text-slate-400 hover:text-slate-600 text-lg leading-none p-1">
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveJurnal} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <StudentSelect
                value={selectedSiswaId}
                onChange={id => setSelectedSiswaId(id)}
                label="Pilih Konseli (Siswa)"
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
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Bidang Layanan</label>
                  <select
                    value={bidangLayanan}
                    onChange={e => setBidangLayanan(e.target.value as any)}
                    className="w-full h-11 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="Pribadi">Pribadi</option>
                    <option value="Sosial">Sosial</option>
                    <option value="Belajar">Belajar</option>
                    <option value="Karier">Karier</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Jenis Layanan</label>
                  <select
                    value={jenisLayanan}
                    onChange={e => setJenisLayanan(e.target.value as any)}
                    className="w-full h-11 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="Konseling Individu">Konseling Individu</option>
                    <option value="Konseling Kelompok">Konseling Kelompok</option>
                    <option value="Bimbingan Klasikal">Bimbingan Klasikal</option>
                    <option value="Bimbingan Kelompok">Bimbingan Kelompok</option>
                    <option value="Konsultasi">Konsultasi</option>
                    <option value="Mediasi">Mediasi</option>
                    <option value="Home Visit">Home Visit</option>
                    <option value="Rujukan">Rujukan</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Identifikasi Kebutuhan / Permasalahan</label>
                <textarea
                  rows={2}
                  required
                  value={identifikasiKebutuhan}
                  onChange={e => setIdentifikasiKebutuhan(e.target.value)}
                  placeholder="Kebutuhan bimbingan / keluhan siswa..."
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Tujuan Layanan</label>
                  <input
                    type="text"
                    required
                    value={tujuanLayanan}
                    onChange={e => setTujuanLayanan(e.target.value)}
                    placeholder="Tujuan sesi..."
                    className="w-full h-11 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Intervensi / Teknik</label>
                  <input
                    type="text"
                    required
                    value={intervensi}
                    onChange={e => setIntervensi(e.target.value)}
                    placeholder="Teknik konseling yang diterapkan..."
                    className="w-full h-11 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Hasil Layanan</label>
                  <input
                    type="text"
                    required
                    value={hasilLayanan}
                    onChange={e => setHasilLayanan(e.target.value)}
                    placeholder="Respon konseli..."
                    className="w-full h-11 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Rencana Lanjut</label>
                  <input
                    type="text"
                    required
                    value={rencanaTindakLanjut}
                    onChange={e => setRencanaTindakLanjut(e.target.value)}
                    placeholder="Tindak lanjut..."
                    className="w-full h-11 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <StatusSelect
                  value={statusLayanan}
                  onChange={(val: string) => setStatusLayanan(val as any)}
                  options={['Baru', 'Dalam Proses', 'Selesai', 'Alih Tangan Kasus']}
                />
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Jadwal Sesi Berikutnya (Opsional)</label>
                  <input
                    type="datetime-local"
                    value={jadwalBerikutnya}
                    onChange={e => setJadwalBerikutnya(e.target.value)}
                    className="w-full h-11 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              {/* Confidential Vault Entry Toggle */}
              {isGuruBK && (
                <div className="pt-3 border-t border-purple-100 space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={withRestricted}
                      onChange={e => setWithRestricted(e.target.checked)}
                      className="rounded border-purple-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
                    />
                    <span className="text-xs font-bold text-purple-900 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-purple-600" />
                      Sertakan Catatan Rahasia BK (Tersimpan di konseling_restricted)
                    </span>
                  </label>

                  {withRestricted && (
                    <div className="p-3 bg-purple-50/50 border border-purple-200 rounded-lg space-y-3">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-purple-900 uppercase">Catatan Rahasia Konseling</label>
                        <textarea
                          rows={2}
                          value={catatanRahasia}
                          onChange={e => setCatatanRahasia(e.target.value)}
                          placeholder="Informasi konfidensial keluarga, kondisi emosional..."
                          className="w-full p-2.5 text-xs bg-white border border-purple-200 rounded-md text-slate-800"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-purple-900 uppercase">Hasil Assessment & Diagnosis</label>
                        <input
                          type="text"
                          value={hasilAssessment}
                          onChange={e => setHasilAssessment(e.target.value)}
                          placeholder="Skor DASS-21, ITP, observasi klinis..."
                          className="w-full h-9 px-2.5 text-xs bg-white border border-purple-200 rounded-md text-slate-800"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-purple-900 uppercase">Rekomendasi Profesional</label>
                        <input
                          type="text"
                          value={rekomendasiProfesional}
                          onChange={e => setRekomendasiProfesional(e.target.value)}
                          placeholder="Rekomendasi perlakuan guru / wali kelas..."
                          className="w-full h-9 px-2.5 text-xs bg-white border border-purple-200 rounded-md text-slate-800"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModalJurnal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-purple-700 hover:bg-purple-800 text-white rounded-md shadow-xs"
                >
                  Simpan Layanan BK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Asesmen BK */}
      {showModalAsesmen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl border border-slate-200 overflow-hidden my-8">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Form Asesmen Psikologis Rahasia</h3>
              <button onClick={() => setShowModalAsesmen(false)} className="text-slate-400 text-lg leading-none">&times;</button>
            </div>
            <form onSubmit={handleSaveAsesmen} className="p-5 space-y-3">
              <StudentSelect value={selectedSiswaId} onChange={setSelectedSiswaId} label="Siswa Konseli" required />
              <DatePicker value={tanggal} onChange={setTanggal} />
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">Jenis Asesmen</label>
                <input
                  type="text"
                  required
                  value={jenisAsesmen}
                  onChange={e => setJenisAsesmen(e.target.value)}
                  className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg text-slate-800"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">Hasil Asesmen</label>
                <textarea
                  rows={2}
                  required
                  value={hasilAsesmenText}
                  onChange={e => setHasilAsesmenText(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg text-slate-800"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">Catatan Profesional</label>
                <input
                  type="text"
                  required
                  value={catatanProfText}
                  onChange={e => setCatatanProfText(e.target.value)}
                  className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg text-slate-800"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">Rekomendasi</label>
                <input
                  type="text"
                  required
                  value={rekomendasiText}
                  onChange={e => setRekomendasiText(e.target.value)}
                  className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg text-slate-800"
                />
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModalAsesmen(false)} className="px-3 py-1.5 text-xs text-slate-600">Batal</button>
                <button type="submit" className="px-4 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded">Simpan Asesmen</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Rujukan BK */}
      {showModalRujukan && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl border border-slate-200 overflow-hidden my-8">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Form Rujukan / Alih Tangan Kasus</h3>
              <button onClick={() => setShowModalRujukan(false)} className="text-slate-400 text-lg leading-none">&times;</button>
            </div>
            <form onSubmit={handleSaveRujukan} className="p-5 space-y-3">
              <StudentSelect value={selectedSiswaId} onChange={setSelectedSiswaId} label="Siswa yang Dirujuk" required />
              <DatePicker value={tanggal} onChange={setTanggal} />
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">Lembaga / Dokter Rujukan</label>
                <input
                  type="text"
                  required
                  value={jenisRujukan}
                  onChange={e => setJenisRujukan(e.target.value)}
                  className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg text-slate-800"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">Tujuan Rujukan</label>
                <input
                  type="text"
                  required
                  value={tujuanRujukan}
                  onChange={e => setTujuanRujukan(e.target.value)}
                  className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg text-slate-800"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">Alasan Rujukan</label>
                <textarea
                  rows={2}
                  required
                  value={alasanRujukan}
                  onChange={e => setAlasanRujukan(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg text-slate-800"
                />
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModalRujukan(false)} className="px-3 py-1.5 text-xs text-slate-600">Batal</button>
                <button type="submit" className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded">Kirim Rujukan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
