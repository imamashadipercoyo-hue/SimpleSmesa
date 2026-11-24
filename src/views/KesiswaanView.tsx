import React, { useState } from 'react';
import { dbService } from '../services/supabaseService';
import { StudentSelect, ClassAutoFill, CompetencyAutoFill, DatePicker, TimePicker, StatusSelect, FileUpload } from '../components/common/FormComponents';
import { MasterPoinTatib, Pelanggaran, PembinaanKesiswaan, Keterlambatan, Siswa, FasePenangananTatib, PenghargaanSkorTatib, AcuanSkorBawaan } from '../types/database';
import { ShieldAlert, Plus, AlertTriangle, FileText, Printer, CheckCircle, Clock, Users, Search, Scale, Award, ArrowRight, ShieldCheck, BookOpen, Info, Check, Filter, Lock } from 'lucide-react';

export const KesiswaanView: React.FC = () => {
  const profile = dbService.currentUser;
  const isKesiswaan = profile.role_kode === 'kesiswaan' || profile.role_kode === 'admin' || profile.role_kode === 'waka_kesiswaan';

  const [activeTab, setActiveTab] = useState<'pelanggaran' | 'pembinaan' | 'tatib' | 'surat' | 'kontrak' | 'keterlambatan'>('pelanggaran');

  // Modals
  const [showModalPelanggaran, setShowModalPelanggaran] = useState(false);
  const [showModalPembinaan, setShowModalPembinaan] = useState(false);
  const [showModalSurat, setShowModalSurat] = useState(false);
  const [showModalKontrak, setShowModalKontrak] = useState(false);
  const [showModalKeterlambatan, setShowModalKeterlambatan] = useState(false);

  // Print view state for Surat Panggilan Ortu
  const [printSurat, setPrintSurat] = useState<any | null>(null);

  // Form Pelanggaran State
  const [selectedSiswaId, setSelectedSiswaId] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [waktu, setWaktu] = useState('07:30');
  const [jenisPelanggaranId, setJenisPelanggaranId] = useState(dbService.masterTatibList[0]?.id || '');
  const [uraian, setUraian] = useState('');
  const [tindakanAwal, setTindakanAwal] = useState('');
  const [statusPelanggaran, setStatusPelanggaran] = useState<'Tercatat' | 'Diproses' | 'Selesai'>('Tercatat');

  // Form Pembinaan State
  const [jenisPembinaan, setJenisPembinaan] = useState('Pembinaan Disiplin & Penandatanganan Komitmen');
  const [uraianPembinaan, setUraianPembinaan] = useState('');
  const [pihakDilibatkan, setPihakDilibatkan] = useState('Tim Kesiswaan, Wali Kelas, Orang Tua Siswa');
  const [hasilPembinaan, setHasilPembinaan] = useState('');
  const [rencanaLanjut, setRencanaLanjut] = useState('');
  const [statusPembinaan, setStatusPembinaan] = useState<'Tahap 1' | 'Tahap 2' | 'Tahap 3' | 'Selesai'>('Tahap 1');

  // Form Surat Panggilan Ortu State
  const [nomorSurat, setNomorSurat] = useState(`421.5/KESISWAAN/${Math.floor(100 + Math.random() * 900)}/2026`);
  const [alasanSurat, setAlasanSurat] = useState('Akumulasi poin pelanggaran tata tertib sekolah');
  const [jadwalSurat, setJadwalSurat] = useState(new Date().toISOString().split('T')[0]);
  const [waktuSurat, setWaktuSurat] = useState('09:00');

  // Form Kontrak Pembinaan State
  const [tanggalMulai, setTanggalMulai] = useState(new Date().toISOString().split('T')[0]);
  const [tanggalSelesai, setTanggalSelesai] = useState(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
  const [isiKesepakatan, setIsiKesepakatan] = useState('Bersedia hadir tepat waktu pukul 06.45 WIB setiap hari sekolah.');
  const [targetKontrak, setTargetKontrak] = useState('Nol pelanggaran dalam 30 hari ke depan');

  // Form Keterlambatan State
  const [alasanKeterlambatan, setAlasanKeterlambatan] = useState('');
  const [tindakanKeterlambatan, setTindakanKeterlambatan] = useState('Pencatatan piket dan literasi 15 menit');

  // Master Tatib Filter state
  const [tatibSubTab, setTatibSubTab] = useState<'katalog' | 'fase' | 'penghargaan' | 'carryover'>('katalog');
  const [kategoriFilter, setKategoriFilter] = useState<'Semua' | 'Perilaku' | 'Kerajinan' | 'Kerapian'>('Semua');
  const [searchTatib, setSearchTatib] = useState('');

  // Modal Pelanggaran Filter state
  const [modalKategoriFilter, setModalKategoriFilter] = useState<'Semua' | 'Perilaku' | 'Kerajinan' | 'Kerapian'>('Semua');
  const [modalSearch, setModalSearch] = useState('');

  // Filtered Master Tatib for Modal Form
  const filteredModalTatib = dbService.masterTatibList.filter((t: MasterPoinTatib) => {
    const matchesCategory = modalKategoriFilter === 'Semua' || t.kategori === modalKategoriFilter;
    const matchesQuery = !modalSearch.trim() ||
      t.nama_pelanggaran.toLowerCase().includes(modalSearch.toLowerCase()) ||
      t.kode.toLowerCase().includes(modalSearch.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  // Selected student & points resolved
  const selectedStudentObj = dbService.getSiswaById(selectedSiswaId);
  const selectedTatib = dbService.masterTatibList.find((t: MasterPoinTatib) => t.id === jenisPelanggaranId);
  const currentStudentPoints = selectedSiswaId ? dbService.getTotalPoinSiswa(selectedSiswaId) : 0;
  const projectedTotalPoints = currentStudentPoints + (selectedTatib ? selectedTatib.poin : 0);
  const currentFase = dbService.getFasePenanganan(currentStudentPoints);
  const projectedFase = dbService.getFasePenanganan(projectedTotalPoints);

  const handleSavePelanggaran = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiswaId || !jenisPelanggaranId) return;

    dbService.addPelanggaran({
      siswa_id: selectedSiswaId,
      petugas_id: profile.guru_id || 'guru-kesiswaan',
      tanggal,
      waktu,
      jenis_pelanggaran_id: jenisPelanggaranId,
      uraian,
      tindakan_awal: tindakanAwal,
      status: statusPelanggaran
    });

    setShowModalPelanggaran(false);
    setSelectedSiswaId('');
    setUraian('');
    setTindakanAwal('');
  };

  const handleSavePembinaan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiswaId) return;

    dbService.addPembinaan({
      siswa_id: selectedSiswaId,
      petugas_id: profile.guru_id || 'guru-kesiswaan',
      pelanggaran_id: null,
      tanggal,
      jenis_pembinaan: jenisPembinaan,
      uraian: uraianPembinaan,
      pihak_dilibatkan: pihakDilibatkan,
      hasil: hasilPembinaan,
      rencana_tindak_lanjut: rencanaLanjut,
      status: statusPembinaan,
      dokumentasi_url: null
    });

    setShowModalPembinaan(false);
    setSelectedSiswaId('');
    setUraianPembinaan('');
    setHasilPembinaan('');
  };

  const handleSaveKeterlambatan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiswaId) return;

    dbService.addKeterlambatan({
      siswa_id: selectedSiswaId,
      tanggal,
      waktu,
      petugas_id: profile.guru_id || 'guru-kesiswaan',
      alasan: alasanKeterlambatan,
      tindakan: tindakanKeterlambatan,
      status: 'Diberi Pembinaan'
    });

    setShowModalKeterlambatan(false);
    setSelectedSiswaId('');
    setAlasanKeterlambatan('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Kesiswaan & Ketertiban Sekolah</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Penegakan Tata Tertib & Pembinaan</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan pelanggaran, perhitungan poin otomatis, pembinaan bertahap, surat panggilan, dan kontrak disiplin.
          </p>
        </div>

        {isKesiswaan && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowModalPelanggaran(true)}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Pelanggaran</span>
            </button>
            <button
              onClick={() => setShowModalPembinaan(true)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Entri Pembinaan</span>
            </button>
            <button
              onClick={() => setShowModalKeterlambatan(true)}
              className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Piket Terlambat</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg max-w-2xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('pelanggaran')}
          className={`py-1.5 px-3 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'pelanggaran' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Pelanggaran ({dbService.pelanggaranList.length})
        </button>
        <button
          onClick={() => setActiveTab('pembinaan')}
          className={`py-1.5 px-3 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'pembinaan' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Pembinaan ({dbService.pembinaanList.length})
        </button>
        <button
          onClick={() => setActiveTab('keterlambatan')}
          className={`py-1.5 px-3 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'keterlambatan' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Keterlambatan ({dbService.keterlambatanList.length})
        </button>
        <button
          onClick={() => setActiveTab('tatib')}
          className={`py-1.5 px-3 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'tatib' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Master Poin Tatib ({dbService.masterTatibList.length})
        </button>
        <button
          onClick={() => setActiveTab('surat')}
          className={`py-1.5 px-3 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'surat' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Surat Panggilan Ortu
        </button>
      </div>

      {/* TAB 1: PELANGGARAN */}
      {activeTab === 'pelanggaran' && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Buku Catatan Pelanggaran Siswa</h3>
            <span className="text-xs text-slate-600">Poin otomatis dihitung dari master tatib</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-white text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Tanggal / Waktu</th>
                  <th className="py-3 px-4">Siswa Pelanggar</th>
                  <th className="py-3 px-4">Kategori & Poin</th>
                  <th className="py-3 px-4">Uraian Kejadian</th>
                  <th className="py-3 px-4">Tindakan Awal Petugas</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dbService.pelanggaranList.map((p: Pelanggaran) => {
                  const s = dbService.getSiswaById(p.siswa_id);
                  const kls = s ? dbService.getKelasById(s.kelas_id) : null;
                  const totalPoin = s ? dbService.getTotalPoinSiswa(s.id) : 0;
                  const fase = dbService.getFasePenanganan(totalPoin);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                        <span className="font-semibold text-slate-900 block">{p.tanggal}</span>
                        <span>{p.waktu} WIB</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-900 block">{s?.nama_lengkap}</span>
                        <span className="text-[11px] text-slate-500 block">
                          NIS: {s?.nis} · {kls?.nama_kelas} · <strong className="text-rose-600">Total: {totalPoin} poin</strong>
                        </span>
                        <span className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          Fase {fase.fase}: {fase.tindakan}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-bold text-rose-700 block">+{p.poin} Poin</span>
                        <span className="text-[11px] text-slate-500">{p.kategori}</span>
                      </td>
                      <td className="py-3 px-4 max-w-xs text-slate-800 font-medium">
                        {p.uraian}
                      </td>
                      <td className="py-3 px-4 max-w-xs text-slate-600">
                        {p.tindakan_awal}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-semibold text-blue-700">
                        {p.status}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PEMBINAAN */}
      {activeTab === 'pembinaan' && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Riwayat Tindakan Pembinaan Kesiswaan</h3>
            <span className="text-xs text-slate-600">Pembinaan bertahap terstruktur</span>
          </div>
          <div className="divide-y divide-slate-100">
            {dbService.pembinaanList.map((pem: PembinaanKesiswaan) => {
              const s = dbService.getSiswaById(pem.siswa_id);
              return (
                <div key={pem.id} className="p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{s?.nama_lengkap}</span>
                      <span className="text-slate-500 ml-2">NIS: {s?.nis} · {pem.tanggal}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-800 font-semibold rounded text-[11px] border border-blue-200">
                      {pem.status}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-800">{pem.jenis_pembinaan}</p>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded">{pem.uraian}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 text-[11px]">
                    <div><strong>Pihak Dilibatkan:</strong> {pem.pihak_dilibatkan}</div>
                    <div><strong>Hasil:</strong> {pem.hasil}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: KETERLAMBATAN */}
      {activeTab === 'keterlambatan' && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Rekapitulasi Keterlambatan Gerbang Pagi</h3>
            <span className="text-xs text-slate-600">Total: {dbService.keterlambatanList.length} siswa</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-white text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Tanggal & Jam</th>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4">Alasan Terlambat</th>
                  <th className="py-3 px-4">Tindakan Petugas Piket</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dbService.keterlambatanList.map((k: Keterlambatan) => {
                  const s = dbService.getSiswaById(k.siswa_id);
                  const kls = s ? dbService.getKelasById(s.kelas_id) : null;
                  return (
                    <tr key={k.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        <span className="font-bold text-slate-900 block">{k.tanggal}</span>
                        <span>{k.waktu} WIB</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-900 block">{s?.nama_lengkap}</span>
                        <span className="text-[11px] text-slate-500">{kls?.nama_kelas}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-800 font-medium">{k.alasan}</td>
                      <td className="py-3 px-4 text-slate-600">{k.tindakan}</td>
                      <td className="py-3 px-4 font-semibold text-amber-700">{k.status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: MASTER TATA TERTIB BAKU */}
      {activeTab === 'tatib' && (
        <div className="space-y-4">
          {/* Official Letterhead Header */}
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3.5">
                <img
                  src="/logo-smkn1-jember.png"
                  alt="Logo SMK Negeri 1 Jember"
                  className="w-12 h-12 object-contain shrink-0"
                />
                <div>
                  <span className="text-[11px] font-bold text-blue-700 tracking-wider uppercase block">
                    Pemerintah Provinsi Jawa Timur · Dinas Pendidikan
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    SKORING TATA TERTIB SEKOLAH (DOKUMEN RESMI BAKU)
                  </h3>
                  <span className="text-xs text-slate-600 block">
                    SMK Negeri 1 Jember · Jalan Jambu Nomor 17 Jember (0331) 429690
                  </span>
                </div>
              </div>
              <div className="text-left sm:text-right sm:border-l sm:pl-4 border-slate-200 text-xs">
                <span className="font-semibold text-slate-800 block">Ditetapkan: Jember, 3 Agustus 2026</span>
                <span className="text-slate-600 block">Kepala Sekolah: <strong>SRI HARTATIK, M.Pd.</strong></span>
                <span className="text-[11px] text-slate-500 font-mono block">NIP. 196809102000122003</span>
              </div>
            </div>

            {/* Quick Stats overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Total Aturan Baku</span>
                <span className="text-lg font-bold text-slate-900">62 Pelanggaran</span>
              </div>
              <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100">
                <span className="text-[11px] text-blue-700 block">Rentang Bobot Skor</span>
                <span className="text-lg font-bold text-blue-900">+5 s/d +250 Poin</span>
              </div>
              <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-100">
                <span className="text-[11px] text-amber-700 block">Tahapan Sanksi</span>
                <span className="text-lg font-bold text-amber-900">7 Fase Penanganan</span>
              </div>
              <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-100">
                <span className="text-[11px] text-emerald-700 block">Pengurang Skor Prestasi</span>
                <span className="text-lg font-bold text-emerald-900">12 Kriteria Positif</span>
              </div>
            </div>
          </div>

          {/* Sub Navigation Segmented Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => setTatibSubTab('katalog')}
              className={`py-2 px-3 text-xs font-semibold rounded-md transition-colors ${
                tatibSubTab === 'katalog' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              A-C. Tabel Pelanggaran Baku ({dbService.masterTatibList.length})
            </button>
            <button
              onClick={() => setTatibSubTab('fase')}
              className={`py-2 px-3 text-xs font-semibold rounded-md transition-colors ${
                tatibSubTab === 'fase' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              D. Fase / Tahapan Penanganan (7)
            </button>
            <button
              onClick={() => setTatibSubTab('penghargaan')}
              className={`py-2 px-3 text-xs font-semibold rounded-md transition-colors ${
                tatibSubTab === 'penghargaan' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              E. Penghargaan Pengurang Skor (12)
            </button>
            <button
              onClick={() => setTatibSubTab('carryover')}
              className={`py-2 px-3 text-xs font-semibold rounded-md transition-colors ${
                tatibSubTab === 'carryover' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              F. Acuan Skor Bawaan Antar Semester
            </button>
          </div>

          {/* Sub Tab 1: Katalog 62 Pelanggaran Baku */}
          {tatibSubTab === 'katalog' && (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs space-y-4 p-4">
              {/* Category Pills & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" />
                    Kategori:
                  </span>
                  {(['Semua', 'Perilaku', 'Kerajinan', 'Kerapian'] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setKategoriFilter(cat)}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                        kategoriFilter === cat
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {cat} {cat === 'Semua' ? '(62)' : cat === 'Perilaku' ? '(35)' : cat === 'Kerajinan' ? '(14)' : '(13)'}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTatib}
                    onChange={e => setSearchTatib(e.target.value)}
                    placeholder="Cari bentuk pelanggaran baku..."
                    className="w-full h-9 pl-8 pr-3 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">No</th>
                      <th className="py-2.5 px-3 w-28">Kode</th>
                      <th className="py-2.5 px-3 w-24">Kategori</th>
                      <th className="py-2.5 px-4">Bentuk Pelanggaran (Baku)</th>
                      <th className="py-2.5 px-3 w-28 text-center">Skor Baku</th>
                      <th className="py-2.5 px-4">Ketentuan Regulasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dbService.masterTatibList
                      .filter(m => {
                        const matchCat = kategoriFilter === 'Semua' || m.kategori === kategoriFilter;
                        const matchSearch = !searchTatib || 
                          m.nama_pelanggaran.toLowerCase().includes(searchTatib.toLowerCase()) ||
                          m.kode.toLowerCase().includes(searchTatib.toLowerCase()) ||
                          m.deskripsi.toLowerCase().includes(searchTatib.toLowerCase());
                        return matchCat && matchSearch;
                      })
                      .map((m: MasterPoinTatib, idx: number) => {
                        const getPoinBadge = (poin: number) => {
                          if (poin <= 10) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
                          if (poin <= 20) return 'bg-blue-50 text-blue-800 border-blue-200';
                          if (poin <= 50) return 'bg-amber-50 text-amber-800 border-amber-200';
                          if (poin <= 100) return 'bg-orange-50 text-orange-800 border-orange-200';
                          return 'bg-rose-50 text-rose-800 border-rose-200 font-black';
                        };

                        return (
                          <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-2.5 px-3 text-center text-slate-500 font-mono">{m.nomor_urut || idx + 1}</td>
                            <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">{m.kode}</td>
                            <td className="py-2.5 px-3">
                              <span className="font-semibold text-slate-700">{m.kategori}</span>
                            </td>
                            <td className="py-2.5 px-4 font-medium text-slate-900">{m.nama_pelanggaran}</td>
                            <td className="py-2.5 px-3 text-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold border ${getPoinBadge(m.poin)}`}>
                                +{m.poin}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-slate-500 max-w-xs">{m.deskripsi}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub Tab 2: Fase / Tahapan Penanganan */}
          {tatibSubTab === 'fase' && (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs p-5 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">D. Fase / Tahapan Penanganan Pelanggaran Siswa</h4>
                <p className="text-xs text-slate-500">Tindakan pembinaan dan sanksi berjenjang berdasarkan akumulasi capaian skor tata tertib.</p>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 w-16 text-center">No</th>
                      <th className="py-2.5 px-4 w-32">Kategori</th>
                      <th className="py-2.5 px-4 w-36 text-center">Capaian Skor</th>
                      <th className="py-2.5 px-4">Tindakan / Sanksi</th>
                      <th className="py-2.5 px-4">Penanggung Jawab Penanganan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dbService.fasePenangananList.map((f: FasePenangananTatib) => (
                      <tr key={f.fase} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3 text-center font-bold text-slate-700 font-mono">{f.fase}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            f.kategori_pelanggaran === 'Ringan' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                            f.kategori_pelanggaran === 'Sedang' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                            'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}>
                            {f.kategori_pelanggaran}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                          {f.rentang_skor}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{f.tindakan}</td>
                        <td className="py-3 px-4 text-blue-700 font-medium">{f.penanggung_jawab}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub Tab 3: Penghargaan / Pengurangan Skor */}
          {tatibSubTab === 'penghargaan' && (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs p-5 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">E. Penghargaan / Pengurangan Skor Pelanggaran</h4>
                <p className="text-xs text-slate-500">Apresiasi capaian positif siswa yang mengurangi total poin pelanggaran yang telah terkumpul.</p>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 w-14 text-center">No</th>
                      <th className="py-2.5 px-4">Penghargaan / Prestasi / Capaian Positif</th>
                      <th className="py-2.5 px-4 w-36">Kategori</th>
                      <th className="py-2.5 px-4 w-36 text-center">Skor Dikurangi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dbService.penghargaanTatibList.map((reward: PenghargaanSkorTatib) => (
                      <tr key={reward.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3 text-center font-mono font-semibold text-slate-600">{reward.no}</td>
                        <td className="py-3 px-4 font-medium text-slate-900">{reward.prestasi_capaian}</td>
                        <td className="py-3 px-4 text-slate-600">{reward.kategori}</td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-emerald-700 bg-emerald-50/50">
                          -{reward.skor_pengurang} Poin
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub Tab 4: Acuan Skor Bawaan Antar Semester */}
          {tatibSubTab === 'carryover' && (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs p-5 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">F. Acuan Skor Bawaan Antar Semester (Carry Over)*</h4>
                <p className="text-xs text-slate-500">Persentase akumulasi poin yang dibawa ke semester selanjutnya untuk pembinaan berkelanjutan.</p>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 w-14 text-center">No</th>
                      <th className="py-2.5 px-4">Kategori Murid</th>
                      <th className="py-2.5 px-4 text-center">Capaian Skor Semester Berjalan</th>
                      <th className="py-2.5 px-4 text-center">Persentase Skor Bawaan</th>
                      <th className="py-2.5 px-4 text-center">Simulasi: Capaian Skor</th>
                      <th className="py-2.5 px-4 text-center">Skor Bawaan Semester Selanjutnya</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {dbService.carryOverTatibList.map((co: AcuanSkorBawaan) => (
                      <tr key={co.no} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3 text-center font-semibold text-slate-600">{co.no}</td>
                        <td className="py-3 px-4 font-sans font-semibold text-slate-900">{co.kategori_murid}</td>
                        <td className="py-3 px-4 text-center font-bold text-slate-700">{co.capaian_skor}</td>
                        <td className="py-3 px-4 text-center font-bold text-blue-700">{co.persentase_bawaan}%</td>
                        <td className="py-3 px-4 text-center text-slate-600">{co.contoh_capaian}</td>
                        <td className="py-3 px-4 text-center font-bold text-rose-700 bg-rose-50/40">
                          {co.contoh_bawaan} Poin
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-amber-50 rounded-md border border-amber-200 text-xs text-amber-900">
                <strong>Catatan Resmi (*):</strong> Skor bawaan akan disidangkan/ditetapkan pada akhir semester sebelum penyerahan rapor pada semester berjalan.
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SURAT PANGGILAN ORTU */}
      {activeTab === 'surat' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Format Resmi Surat Panggilan Orang Tua</h3>
              <p className="text-xs text-slate-500">Terbitkan surat pemanggilan resmi berkop SMKN 1 Jember</p>
            </div>
            <button
              onClick={() => setShowModalSurat(true)}
              className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              <span>Terbitkan Surat Panggilan</span>
            </button>
          </div>

          {/* Sample template view */}
          <div className="bg-white p-8 rounded-lg border border-slate-300 shadow-sm max-w-3xl mx-auto space-y-6 text-xs text-slate-800">
            {/* Header Kop */}
            <div className="flex items-center justify-center gap-4 border-b-2 border-slate-900 pb-4">
              <img
                src="/logo-smkn1-jember.png"
                alt="Logo SMK Negeri 1 Jember"
                className="w-14 h-14 object-contain shrink-0"
              />
              <div className="text-center">
                <span className="font-bold text-sm tracking-wide block uppercase">Pemerintah Provinsi Jawa Timur · Dinas Pendidikan</span>
                <span className="font-extrabold text-base tracking-wider block uppercase">SMK NEGERI 1 JEMBER</span>
                <span className="text-[11px] text-slate-600 block">Jalan Jambu Nomor 17 Telp. (0331) 429690 Jember 68111</span>
              </div>
            </div>

            <div className="flex justify-between">
              <div>
                <div>Nomor: <strong>421.5/KESISWAAN/042/2026</strong></div>
                <div>Lampiran: -</div>
                <div>Perihal: <strong>Panggilan Orang Tua / Wali Siswa</strong></div>
              </div>
              <div className="text-right">
                Jember, 22 Februari 2026
              </div>
            </div>

            <div>
              Kepada Yth. Bapak / Ibu Orang Tua / Wali dari:<br />
              <strong>Rizky Kurniawan Pratama (NIS: 2324103)</strong><br />
              Kelas: XI RPL 1
            </div>

            <p className="leading-relaxed">
              Dengan hormat,<br />
              Sehubungan dengan perkembangan kedisiplinan dan pembinaan belajar putra/putri Bapak/Ibu di SMK Negeri 1 Jember, kami mengharap kehadiran Bapak/Ibu pada:
            </p>

            <div className="pl-6 space-y-1">
              <div>Hari / Tanggal : <strong>Kamis, 26 Februari 2026</strong></div>
              <div>Pukul : <strong>09.00 WIB</strong></div>
              <div>Tempat : Ruang Sidang Kesiswaan & Bimbingan Konseling SMKN 1 Jember</div>
              <div>Keperluan : Sidang Pembinaan Terpadu & Kesepakatan Kontrak Disiplin Siswa</div>
            </div>

            <p className="leading-relaxed">
              Mengingat pentingnya agenda tersebut demi kelanjutan studi putra/putri Bapak/Ibu, dimohon kehadiran Bapak/Ibu tepat waktu tanpa diwakilkan. Atas perhatian dan kerja sama yang baik, kami sampaikan terima kasih.
            </p>

            <div className="flex justify-end pt-6">
              <div className="text-center">
                <span>Koordinator Tim Kesiswaan,</span>
                <div className="h-16" />
                <span className="font-bold underline block">Agus Prasetyo, S.Pd</span>
                <span className="text-[11px]">NIP. 198311282009021004</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Pelanggaran */}
      {showModalPelanggaran && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-4 sm:my-8 flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 text-white flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-rose-500/30 text-rose-200 border border-rose-400/30 uppercase">
                    SMK Negeri 1 Jember
                  </span>
                  <span className="text-[11px] text-rose-200 flex items-center gap-1 font-medium">
                    <Lock className="w-3 h-3 text-amber-400" />
                    Poin Baku SK Kepala Sekolah
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mt-1">Catat Pelanggaran Tata Tertib</h3>
                <p className="text-xs text-rose-200/90">
                  Bobot skor ditetapkan secara baku (non-editable) sesuai dokumen tata tertib resmi.
                </p>
              </div>
              <button 
                onClick={() => setShowModalPelanggaran(false)} 
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSavePelanggaran} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <StudentSelect value={selectedSiswaId} onChange={setSelectedSiswaId} label="Pilih Siswa Pelanggar" required />

              {selectedStudentObj && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ClassAutoFill kelasId={selectedStudentObj.kelas_id} />
                  <CompetencyAutoFill kompetensiId={selectedStudentObj.kompetensi_keahlian_id} />
                </div>
              )}

              {/* Student Points & Realtime Projection Card */}
              {selectedStudentObj && (
                <div className="p-3.5 bg-gradient-to-br from-slate-50 to-rose-50/50 border border-rose-200 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Analisis Akumulasi Skor Siswa:</span>
                    <span className="text-[11px] text-slate-500">
                      NIS: <span className="font-mono font-bold text-slate-700">{selectedStudentObj.nis}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Skor Sekarang</div>
                      <div className="text-base sm:text-lg font-extrabold text-slate-800">{currentStudentPoints} <span className="text-[10px] font-normal text-slate-400">poin</span></div>
                      <div className="text-[10px] text-slate-500 truncate">{currentFase.fase}</div>
                    </div>
                    <div className="p-2 bg-rose-50 rounded-lg border border-rose-200">
                      <div className="text-[10px] text-rose-600 uppercase font-semibold">Poin Baku Pelanggaran</div>
                      <div className="text-base sm:text-lg font-extrabold text-rose-700">+{selectedTatib ? selectedTatib.poin : 0} <span className="text-[10px] font-normal text-rose-400">poin</span></div>
                      <div className="text-[10px] text-rose-600 font-medium">Baku & Terkunci</div>
                    </div>
                    <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="text-[10px] text-amber-700 uppercase font-semibold">Proyeksi Total</div>
                      <div className="text-base sm:text-lg font-extrabold text-amber-800">{projectedTotalPoints} <span className="text-[10px] font-normal text-amber-500">poin</span></div>
                      <div className="text-[10px] text-amber-700 font-semibold truncate">Fase {projectedFase.fase} ({projectedFase.kategori_pelanggaran})</div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <div className="font-semibold text-slate-800">
                        Proyeksi Tindakan / Sanksi: <span className="text-rose-700">Fase {projectedFase.fase} — {projectedFase.tindakan}</span>
                      </div>
                      <div className="text-[11px] text-slate-600">
                        Penanggung Jawab: <span className="font-medium text-slate-900">{projectedFase.penanggung_jawab}</span> | Rentang: <span className="font-medium">{projectedFase.rentang_skor} Poin</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DatePicker value={tanggal} onChange={setTanggal} />
                <TimePicker value={waktu} onChange={setWaktu} />
              </div>

              {/* Master Tatib Selection with Baku Filtering */}
              <div className="space-y-2 pt-1 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Pilih Jenis Pelanggaran (Katalog Baku SMKN 1 Jember) <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-600" />
                    Poin baku tidak dapat diubah manual
                  </span>
                </div>

                {/* Filter category chips & search */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {(['Semua', 'Perilaku', 'Kerajinan', 'Kerapian'] as const).map(kat => (
                      <button
                        type="button"
                        key={kat}
                        onClick={() => setModalKategoriFilter(kat)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium shrink-0 transition-colors ${
                          modalKategoriFilter === kat
                            ? 'bg-rose-700 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {kat === 'Semua' ? 'Semua (62)' : kat === 'Perilaku' ? 'Perilaku (35)' : kat === 'Kerajinan' ? 'Kerajinan (14)' : 'Kerapian (13)'}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={modalSearch}
                      onChange={e => setModalSearch(e.target.value)}
                      placeholder="Cari kode (TATIB-PRL-..), kata kunci (rokok, seragam, bolos)..."
                      className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>

                {/* Select dropdown */}
                <select
                  required
                  value={jenisPelanggaranId}
                  onChange={e => setJenisPelanggaranId(e.target.value)}
                  className="w-full h-11 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                >
                  {filteredModalTatib.length === 0 ? (
                    <option value="" disabled>Tidak ada pelanggaran yang sesuai pencarian</option>
                  ) : (
                    filteredModalTatib.map((t: MasterPoinTatib) => (
                      <option key={t.id} value={t.id}>
                        [{t.kode}] ({t.kategori}) {t.nama_pelanggaran} — {t.poin} POIN BAKU
                      </option>
                    ))
                  )}
                </select>

                {/* Selected Item Detail Card */}
                {selectedTatib && (
                  <div className="p-3 bg-rose-50/80 border border-rose-200 rounded-lg text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-rose-800 bg-white px-2 py-0.5 rounded border border-rose-200">
                          {selectedTatib.kode}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800">
                          Kategori: {selectedTatib.kategori}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-rose-600 text-white px-2.5 py-1 rounded font-bold text-xs shadow-xs">
                        <Lock className="w-3 h-3 text-amber-300" />
                        <span>+{selectedTatib.poin} POIN BAKU</span>
                      </div>
                    </div>
                    <div className="font-medium text-slate-800 leading-snug">
                      {selectedTatib.nama_pelanggaran}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Uraian Kejadian Pelanggaran <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={uraian}
                  onChange={e => setUraian(e.target.value)}
                  placeholder="Lokasi kejadian, saksi/guru pelapor, kronologi singkat temuan..."
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Tindakan Awal Petugas <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={tindakanAwal}
                  onChange={e => setTindakanAwal(e.target.value)}
                  placeholder="Peringatan langsung, pembinaan di tempat, penahanan barang bukti, diarahkan ke BK..."
                  className="w-full h-11 px-3 text-xs border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModalPelanggaran(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!selectedTatib}
                  className="px-5 py-2.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  Simpan Pelanggaran Baku (+{selectedTatib ? selectedTatib.poin : 0} Poin)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Pembinaan */}
      {showModalPembinaan && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-xl border border-slate-200 overflow-hidden my-8">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Form Pembinaan Kesiswaan</h3>
              <button onClick={() => setShowModalPembinaan(false)} className="text-slate-400 text-lg">&times;</button>
            </div>
            <form onSubmit={handleSavePembinaan} className="p-5 space-y-3">
              <StudentSelect value={selectedSiswaId} onChange={setSelectedSiswaId} label="Siswa yang Dibina" required />
              <DatePicker value={tanggal} onChange={setTanggal} />
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">Jenis Pembinaan</label>
                <input
                  type="text"
                  required
                  value={jenisPembinaan}
                  onChange={e => setJenisPembinaan(e.target.value)}
                  className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg text-slate-800"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">Uraian Pembinaan</label>
                <textarea
                  rows={2}
                  required
                  value={uraianPembinaan}
                  onChange={e => setUraianPembinaan(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg text-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">Pihak Dilibatkan</label>
                  <input
                    type="text"
                    value={pihakDilibatkan}
                    onChange={e => setPihakDilibatkan(e.target.value)}
                    className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
                <StatusSelect value={statusPembinaan} onChange={setStatusPembinaan as any} options={['Tahap 1', 'Tahap 2', 'Tahap 3', 'Selesai']} />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">Hasil Pembinaan</label>
                <input
                  type="text"
                  required
                  value={hasilPembinaan}
                  onChange={e => setHasilPembinaan(e.target.value)}
                  className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg text-slate-800"
                />
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModalPembinaan(false)} className="px-3 py-1.5 text-xs text-slate-600">Batal</button>
                <button type="submit" className="px-4 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded">Simpan Pembinaan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Keterlambatan */}
      {showModalKeterlambatan && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl border border-slate-200 overflow-hidden my-8">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Catat Keterlambatan Gerbang Pagi</h3>
              <button onClick={() => setShowModalKeterlambatan(false)} className="text-slate-400 text-lg">&times;</button>
            </div>
            <form onSubmit={handleSaveKeterlambatan} className="p-5 space-y-3">
              <StudentSelect value={selectedSiswaId} onChange={setSelectedSiswaId} label="Siswa Terlambat" required />
              <div className="grid grid-cols-2 gap-3">
                <DatePicker value={tanggal} onChange={setTanggal} />
                <TimePicker value={waktu} onChange={setWaktu} />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">Alasan Keterlambatan</label>
                <input
                  type="text"
                  required
                  value={alasanKeterlambatan}
                  onChange={e => setAlasanKeterlambatan(e.target.value)}
                  placeholder="Rantai putus, bangun kesiangan..."
                  className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg text-slate-800"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">Tindakan Piket</label>
                <input
                  type="text"
                  required
                  value={tindakanKeterlambatan}
                  onChange={e => setTindakanKeterlambatan(e.target.value)}
                  className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg text-slate-800"
                />
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModalKeterlambatan(false)} className="px-3 py-1.5 text-xs text-slate-600">Batal</button>
                <button type="submit" className="px-4 py-1.5 text-xs font-semibold bg-amber-600 text-white rounded">Simpan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
