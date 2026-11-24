import React, { useRef, useState } from 'react';
import { dbService } from '../services/supabaseService';
import { Siswa, Guru, Kelas, KompetensiKeahlian, AuditLog } from '../types/database';
import {
  downloadMasterTemplate,
  exportMasterToExcel,
  ExcelParseResult,
  MasterEntityType,
  parseMasterExcelFile
} from '../utils/masterExcelHelper';
import {
  Layers,
  Plus,
  Upload,
  Download,
  FileSpreadsheet,
  Search,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  X,
  Trash2,
  Database,
  Loader2
} from 'lucide-react';

const ENTITY_LABELS: Record<MasterEntityType, string> = {
  siswa: 'Data Siswa',
  guru: 'Guru & Tenaga Kependidikan',
  kelas: 'Rombongan Belajar / Kelas',
  kompetensi: 'Kompetensi Keahlian'
};

export const MasterDataView: React.FC = () => {
  const profile = dbService.currentUser;
  const isAdmin = profile.role_kode === 'admin';

  const [activeTab, setActiveTab] = useState<'siswa' | 'guru' | 'kelas' | 'kompetensi' | 'audit'>('siswa');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Modal Siswa
  const [showModalSiswa, setShowModalSiswa] = useState(false);
  const [nis, setNis] = useState('');
  const [nisn, setNisn] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [jk, setJk] = useState<'L' | 'P'>('L');
  const [tanggalLahir, setTanggalLahir] = useState('2009-01-01');
  const [alamatSiswa, setAlamatSiswa] = useState('Jember, Jawa Timur');
  const [kelasId, setKelasId] = useState(dbService.kelasList[0]?.id || '');
  const [namaOrtu, setNamaOrtu] = useState('');
  const [hpOrtu, setHpOrtu] = useState('');
  const [statusSiswa, setStatusSiswa] = useState<Siswa['status']>('Aktif');

  // Modal Guru
  const [showModalGuru, setShowModalGuru] = useState(false);
  const [nipGuru, setNipGuru] = useState('');
  const [namaGuru, setNamaGuru] = useState('');
  const [emailGuru, setEmailGuru] = useState('');
  const [hpGuru, setHpGuru] = useState('');
  const [jabatanGuru, setJabatanGuru] = useState('Guru Produktif & Wali Kelas');
  const [statusGuruAktif, setStatusGuruAktif] = useState(true);

  // Modal Kelas
  const [showModalKelas, setShowModalKelas] = useState(false);
  const [namaKelasInput, setNamaKelasInput] = useState('');
  const [tingkatKelas, setTingkatKelas] = useState<10 | 11 | 12>(10);
  const [kkKelasId, setKkKelasId] = useState(dbService.kompetensiList[0]?.id || '');
  const [waliKelasId, setWaliKelasId] = useState(dbService.guruList[0]?.id || '');

  // Modal Kompetensi Keahlian
  const [showModalKompetensi, setShowModalKompetensi] = useState(false);
  const [kodeKK, setKodeKK] = useState('');
  const [namaKK, setNamaKK] = useState('');
  const [aktifKK, setAktifKK] = useState(true);

  // Modal Upload Excel
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [excelEntity, setExcelEntity] = useState<MasterEntityType>('siswa');
  const [excelResult, setExcelResult] = useState<ExcelParseResult | null>(null);
  const [excelError, setExcelError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [updateDuplicates, setUpdateDuplicates] = useState(true);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (type: 'success' | 'warning' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 6000);
  };

  const openExcelImport = (entity: MasterEntityType) => {
    setExcelEntity(entity);
    setExcelResult(null);
    setExcelError(null);
    setUpdateDuplicates(true);
    setShowExcelModal(true);
  };

  const handleExcelFileSelected = async (file: File | undefined) => {
    if (!file) return;
    setExcelError(null);
    setExcelResult(null);

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!['xlsx', 'xls', 'csv'].includes(ext)) {
      setExcelError('Format file tidak didukung. Gunakan file Excel (.xlsx, .xls) atau .csv.');
      return;
    }

    try {
      const result = await parseMasterExcelFile(file, excelEntity);
      setExcelResult(result);
    } catch (err: any) {
      setExcelError(err?.message || 'Gagal membaca file Excel. Pastikan format file valid.');
    }
  };

  const handleCommitExcelImport = async () => {
    if (!excelResult) return;

    const validRows = excelResult.rows
      .filter(r => r.status === 'valid' || (r.status === 'duplicate' && updateDuplicates))
      .map(r => r.payload)
      .filter(Boolean);

    if (validRows.length === 0) {
      setExcelError('Tidak ada baris valid yang dapat disimpan ke database.');
      return;
    }

    setImporting(true);
    try {
      let summary: { inserted: number; updated: number; skipped: number; syncedToSupabase: boolean; supabaseError?: string };

      if (excelEntity === 'siswa') {
        summary = await dbService.bulkImportSiswa(validRows, updateDuplicates);
      } else if (excelEntity === 'guru') {
        summary = await dbService.bulkImportGuru(validRows, updateDuplicates);
      } else if (excelEntity === 'kelas') {
        summary = await dbService.bulkImportKelas(validRows, updateDuplicates);
      } else {
        summary = await dbService.bulkImportKompetensi(validRows, updateDuplicates);
      }

      const syncNote = summary.syncedToSupabase
        ? ' & tersinkronisasi ke Supabase Cloud.'
        : dbService.isConnectedToSupabase && summary.supabaseError
        ? ` (tersimpan lokal; sinkronisasi Supabase: ${summary.supabaseError}).`
        : ' (tersimpan di database aplikasi).';

      showToast(
        summary.supabaseError ? 'warning' : 'success',
        `Import ${ENTITY_LABELS[excelEntity]} selesai: ${summary.inserted} baru, ${summary.updated} diperbarui, ${summary.skipped} dilewati${syncNote}`
      );
      setShowExcelModal(false);
      setExcelResult(null);
      setActiveTab(excelEntity);
    } catch (err: any) {
      setExcelError(err?.message || 'Terjadi kesalahan saat menyimpan data import.');
    } finally {
      setImporting(false);
    }
  };

  // Manual Save Handlers
  const handleSaveSiswa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nis.trim() || !namaLengkap.trim()) return;

    const existing = dbService.siswaList.find(s => s.nis.trim().toLowerCase() === nis.trim().toLowerCase());
    if (existing) {
      showToast('error', `NIS ${nis.trim()} sudah terdaftar atas nama ${existing.nama_lengkap}.`);
      return;
    }

    const kls = dbService.getKelasById(kelasId) || dbService.kelasList[0];
    dbService.addSiswa({
      nis: nis.trim(),
      nisn: nisn.trim() || '-',
      nama_lengkap: namaLengkap.trim(),
      jenis_kelamin: jk,
      tanggal_lahir: tanggalLahir || '2009-01-01',
      alamat: alamatSiswa.trim() || 'Jember, Jawa Timur',
      nama_orang_tua: namaOrtu.trim() || 'Orang Tua Siswa',
      no_hp_orang_tua: hpOrtu.trim() || '-',
      kelas_id: kls?.id || '',
      kompetensi_keahlian_id: kls?.kompetensi_keahlian_id || dbService.kompetensiList[0]?.id || '',
      tahun_pelajaran_id: dbService.getActiveTahunPelajaranId(),
      status: statusSiswa
    });

    setShowModalSiswa(false);
    setNis('');
    setNisn('');
    setNamaLengkap('');
    setNamaOrtu('');
    setHpOrtu('');
    showToast('success', `Data siswa "${namaLengkap.trim()}" berhasil ditambahkan ke database.`);
  };

  const handleSaveGuru = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nipGuru.trim() || !namaGuru.trim()) return;

    const existing = dbService.guruList.find(g => g.nip.trim().toLowerCase() === nipGuru.trim().toLowerCase());
    if (existing) {
      showToast('error', `NIP ${nipGuru.trim()} sudah terdaftar atas nama ${existing.nama_lengkap}.`);
      return;
    }

    dbService.addGuru({
      nip: nipGuru.trim(),
      nama_lengkap: namaGuru.trim(),
      email: emailGuru.trim() || `${nipGuru.trim().replace(/\s+/g, '')}@smkn1jember.sch.id`,
      no_hp: hpGuru.trim() || '-',
      jabatan: jabatanGuru.trim() || 'Guru Mata Pelajaran',
      status_aktif: statusGuruAktif
    });

    setShowModalGuru(false);
    setNipGuru('');
    setNamaGuru('');
    setEmailGuru('');
    setHpGuru('');
    showToast('success', `Data pendidik "${namaGuru.trim()}" berhasil ditambahkan ke database.`);
  };

  const handleSaveKelas = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaKelasInput.trim()) return;

    const existing = dbService.findKelasByName(namaKelasInput);
    if (existing) {
      showToast('error', `Rombel "${namaKelasInput.trim()}" sudah terdaftar.`);
      return;
    }

    dbService.addKelas({
      nama_kelas: namaKelasInput.trim(),
      tingkat: tingkatKelas,
      kompetensi_keahlian_id: kkKelasId || dbService.kompetensiList[0]?.id || '',
      tahun_pelajaran_id: dbService.getActiveTahunPelajaranId(),
      wali_kelas_id: waliKelasId || dbService.guruList[0]?.id || '',
      aktif: true
    });

    setShowModalKelas(false);
    setNamaKelasInput('');
    showToast('success', `Rombongan belajar "${namaKelasInput.trim()}" berhasil ditambahkan.`);
  };

  const handleSaveKompetensi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kodeKK.trim() || !namaKK.trim()) return;

    const existing = dbService.kompetensiList.find(
      kk => kk.kode.trim().toLowerCase() === kodeKK.trim().toLowerCase()
    );
    if (existing) {
      showToast('error', `Kode kompetensi "${kodeKK.trim().toUpperCase()}" sudah terdaftar.`);
      return;
    }

    dbService.addKompetensi({
      kode: kodeKK.trim().toUpperCase(),
      nama: namaKK.trim(),
      aktif: aktifKK
    });

    setShowModalKompetensi(false);
    setKodeKK('');
    setNamaKK('');
    showToast('success', `Kompetensi Keahlian "${kodeKK.trim().toUpperCase()} — ${namaKK.trim()}" berhasil ditambahkan.`);
  };

  const q = searchQuery.trim().toLowerCase();

  const filteredSiswa = dbService.siswaList.filter((s: Siswa) => {
    if (!q) return true;
    const kls = dbService.getKelasById(s.kelas_id)?.nama_kelas || '';
    const kk = dbService.getKompetensiById(s.kompetensi_keahlian_id)?.nama || '';
    return (
      s.nama_lengkap.toLowerCase().includes(q) ||
      s.nis.toLowerCase().includes(q) ||
      s.nisn.toLowerCase().includes(q) ||
      kls.toLowerCase().includes(q) ||
      kk.toLowerCase().includes(q)
    );
  });

  const filteredGuru = dbService.guruList.filter((g: Guru) => {
    if (!q) return true;
    return (
      g.nama_lengkap.toLowerCase().includes(q) ||
      g.nip.toLowerCase().includes(q) ||
      g.email.toLowerCase().includes(q) ||
      g.jabatan.toLowerCase().includes(q)
    );
  });

  const filteredKelas = dbService.kelasList.filter((k: Kelas) => {
    if (!q) return true;
    const kk = dbService.getKompetensiById(k.kompetensi_keahlian_id)?.nama || '';
    const wk = dbService.getGuruById(k.wali_kelas_id)?.nama_lengkap || '';
    return (
      k.nama_kelas.toLowerCase().includes(q) ||
      kk.toLowerCase().includes(q) ||
      wk.toLowerCase().includes(q)
    );
  });

  const filteredKompetensi = dbService.kompetensiList.filter((kk: KompetensiKeahlian) => {
    if (!q) return true;
    return kk.kode.toLowerCase().includes(q) || kk.nama.toLowerCase().includes(q);
  });

  const activeEntityForExcel: MasterEntityType | null =
    activeTab === 'audit' ? null : activeTab;

  const openManualModalForActiveTab = () => {
    if (activeTab === 'siswa') {
      setKelasId(dbService.kelasList[0]?.id || '');
      setShowModalSiswa(true);
    } else if (activeTab === 'guru') {
      setShowModalGuru(true);
    } else if (activeTab === 'kelas') {
      setKkKelasId(dbService.kompetensiList[0]?.id || '');
      setWaliKelasId(dbService.guruList[0]?.id || '');
      setShowModalKelas(true);
    } else if (activeTab === 'kompetensi') {
      setShowModalKompetensi(true);
    }
  };

  const manualButtonLabel =
    activeTab === 'siswa'
      ? 'Tambah Siswa'
      : activeTab === 'guru'
      ? 'Tambah Guru'
      : activeTab === 'kelas'
      ? 'Tambah Kelas'
      : 'Tambah Kompetensi';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Administrasi Data Master & Import Excel</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Data Master SIMPEL SMESA</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola input manual maupun upload massal file Excel (.xlsx / .xls / .csv) untuk Siswa, Guru, Kelas, dan Kompetensi Keahlian.
          </p>
        </div>

        {isAdmin && activeEntityForExcel && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => openExcelImport(activeEntityForExcel)}
              className="h-10 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Excel</span>
            </button>

            <button
              type="button"
              onClick={() => downloadMasterTemplate(activeEntityForExcel)}
              className="h-10 px-3 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Template .XLSX</span>
            </button>

            <button
              type="button"
              onClick={() => exportMasterToExcel(activeEntityForExcel)}
              className="h-10 px-3 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Export</span>
            </button>

            <button
              type="button"
              onClick={openManualModalForActiveTab}
              className="h-10 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{manualButtonLabel}</span>
            </button>
          </div>
        )}
      </div>

      {/* Feedback Banner */}
      {toast && (
        <div
          className={`p-3.5 rounded-lg border text-xs font-medium flex items-center justify-between gap-3 ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : toast.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : toast.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{toast.text}</span>
          </div>
          <button type="button" onClick={() => setToast(null)} className="text-slate-500 hover:text-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs + Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          <button
            onClick={() => { setActiveTab('siswa'); setSearchQuery(''); setConfirmDeleteId(null); }}
            className={`py-2 px-3 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'siswa' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Siswa ({dbService.siswaList.length})
          </button>
          <button
            onClick={() => { setActiveTab('guru'); setSearchQuery(''); setConfirmDeleteId(null); }}
            className={`py-2 px-3 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'guru' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Guru & Tendik ({dbService.guruList.length})
          </button>
          <button
            onClick={() => { setActiveTab('kelas'); setSearchQuery(''); setConfirmDeleteId(null); }}
            className={`py-2 px-3 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'kelas' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rombel / Kelas ({dbService.kelasList.length})
          </button>
          <button
            onClick={() => { setActiveTab('kompetensi'); setSearchQuery(''); setConfirmDeleteId(null); }}
            className={`py-2 px-3 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'kompetensi' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kompetensi ({dbService.kompetensiList.length})
          </button>
          <button
            onClick={() => { setActiveTab('audit'); setSearchQuery(''); setConfirmDeleteId(null); }}
            className={`py-2 px-3 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'audit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Audit Log ({dbService.auditLogs.length})
          </button>
        </div>

        {activeTab !== 'audit' && (
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={`Cari ${ENTITY_LABELS[activeTab].toLowerCase()}...`}
              className="w-full h-10 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>
        )}
      </div>

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
                  <th className="py-3 px-4">Kelas</th>
                  <th className="py-3 px-4">Kompetensi Keahlian</th>
                  <th className="py-3 px-4">Orang Tua & Telepon</th>
                  <th className="py-3 px-4">Status</th>
                  {isAdmin && <th className="py-3 px-4 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSiswa.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 8 : 7} className="py-8 text-center text-slate-400">
                      Tidak ada data siswa yang sesuai pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredSiswa.map((s: Siswa) => {
                    const kls = dbService.getKelasById(s.kelas_id);
                    const kk = dbService.getKompetensiById(s.kompetensi_keahlian_id);
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {s.nis}
                          <span className="block text-[11px] text-slate-500 font-normal">{s.nisn}</span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900">{s.nama_lengkap}</td>
                        <td className="py-3 px-4">{s.jenis_kelamin}</td>
                        <td className="py-3 px-4 font-semibold text-blue-700 whitespace-nowrap">{kls?.nama_kelas || '-'}</td>
                        <td className="py-3 px-4">{kk?.nama || '-'}</td>
                        <td className="py-3 px-4">
                          <span className="block font-medium text-slate-800">{s.nama_orang_tua}</span>
                          <span className="text-[11px] text-slate-500">{s.no_hp_orang_tua}</span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-emerald-700">{s.status}</td>
                        {isAdmin && (
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            {confirmDeleteId === s.id ? (
                              <span className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    dbService.deleteSiswa(s.id);
                                    setConfirmDeleteId(null);
                                    showToast('warning', `Data siswa "${s.nama_lengkap}" dihapus.`);
                                  }}
                                  className="px-2 py-1 bg-rose-600 text-white rounded text-[11px] font-semibold"
                                >
                                  Hapus
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[11px]"
                                >
                                  Batal
                                </button>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(s.id)}
                                title="Hapus Siswa"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Guru */}
      {activeTab === 'guru' && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">NIP</th>
                  <th className="py-3 px-4">Nama Lengkap</th>
                  <th className="py-3 px-4">Email Dinas</th>
                  <th className="py-3 px-4">No. HP</th>
                  <th className="py-3 px-4">Jabatan Tugas</th>
                  <th className="py-3 px-4">Status</th>
                  {isAdmin && <th className="py-3 px-4 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGuru.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} className="py-8 text-center text-slate-400">
                      Tidak ada data guru yang sesuai pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredGuru.map((g: Guru) => (
                    <tr key={g.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">{g.nip}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{g.nama_lengkap}</td>
                      <td className="py-3 px-4 text-slate-600">{g.email}</td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{g.no_hp}</td>
                      <td className="py-3 px-4 font-medium text-blue-700">{g.jabatan}</td>
                      <td className="py-3 px-4 font-semibold text-emerald-700">
                        {g.status_aktif ? 'Aktif' : 'Non-Aktif'}
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          {confirmDeleteId === g.id ? (
                            <span className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  dbService.deleteGuru(g.id);
                                  setConfirmDeleteId(null);
                                  showToast('warning', `Data guru "${g.nama_lengkap}" dihapus.`);
                                }}
                                className="px-2 py-1 bg-rose-600 text-white rounded text-[11px] font-semibold"
                              >
                                Hapus
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[11px]"
                              >
                                Batal
                              </button>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(g.id)}
                              title="Hapus Guru"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Kelas */}
      {activeTab === 'kelas' && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Nama Rombel / Kelas</th>
                  <th className="py-3 px-4">Tingkat</th>
                  <th className="py-3 px-4">Kompetensi Keahlian</th>
                  <th className="py-3 px-4">Wali Kelas</th>
                  <th className="py-3 px-4">Jumlah Siswa</th>
                  {isAdmin && <th className="py-3 px-4 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredKelas.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="py-8 text-center text-slate-400">
                      Tidak ada data kelas yang sesuai pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredKelas.map((k: Kelas) => {
                    const kk = dbService.getKompetensiById(k.kompetensi_keahlian_id);
                    const wk = dbService.getGuruById(k.wali_kelas_id);
                    const count = dbService.siswaList.filter((s: Siswa) => s.kelas_id === k.id).length;
                    return (
                      <tr key={k.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-bold text-slate-900">{k.nama_kelas}</td>
                        <td className="py-3 px-4 font-medium">Kelas {k.tingkat}</td>
                        <td className="py-3 px-4">{kk ? `${kk.kode} — ${kk.nama}` : '-'}</td>
                        <td className="py-3 px-4 font-medium text-slate-800">{wk?.nama_lengkap || '-'}</td>
                        <td className="py-3 px-4 font-bold text-blue-700">{count} siswa</td>
                        {isAdmin && (
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            {confirmDeleteId === k.id ? (
                              <span className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    dbService.deleteKelas(k.id);
                                    setConfirmDeleteId(null);
                                    showToast('warning', `Data kelas "${k.nama_kelas}" dihapus.`);
                                  }}
                                  className="px-2 py-1 bg-rose-600 text-white rounded text-[11px] font-semibold"
                                >
                                  Hapus
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[11px]"
                                >
                                  Batal
                                </button>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(k.id)}
                                title="Hapus Kelas"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Kompetensi */}
      {activeTab === 'kompetensi' && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
          <div className="divide-y divide-slate-100">
            {filteredKompetensi.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Tidak ada kompetensi keahlian yang sesuai pencarian.
              </div>
            ) : (
              filteredKompetensi.map((kk: KompetensiKeahlian) => (
                <div key={kk.id} className="p-4 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/70">
                  <div>
                    <span className="font-mono font-bold text-blue-700 text-sm block">{kk.kode}</span>
                    <span className="font-semibold text-slate-900">{kk.nama}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-semibold ${kk.aktif ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {kk.aktif ? 'Aktif' : 'Non-Aktif'}
                    </span>
                    {isAdmin && (
                      confirmDeleteId === kk.id ? (
                        <span className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              dbService.deleteKompetensi(kk.id);
                              setConfirmDeleteId(null);
                              showToast('warning', `Kompetensi "${kk.kode}" dihapus.`);
                            }}
                            className="px-2 py-1 bg-rose-600 text-white rounded text-[11px] font-semibold"
                          >
                            Hapus
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[11px]"
                          >
                            Batal
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(kk.id)}
                          title="Hapus Kompetensi"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: Audit Log */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Audit Trail Log Sistem (Append-Only Immutable)
              </h3>
              <p className="text-[11px] text-slate-500">Mencatat aktivitas autentikasi, modifikasi database, import Excel, dan akses data sensitif BK.</p>
            </div>
            <span className="text-xs text-slate-600">{dbService.auditLogs.length} event</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 font-mono">
              <thead className="bg-white text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">Action</th>
                  <th className="py-2.5 px-4">Tabel Terkait</th>
                  <th className="py-2.5 px-4">User ID</th>
                  <th className="py-2.5 px-4 font-sans">Deskripsi Aktivitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dbService.auditLogs.map((l: AuditLog) => (
                  <tr key={l.id} className="hover:bg-slate-50/70">
                    <td className="py-2 px-4 whitespace-nowrap text-slate-500">{new Date(l.created_at).toLocaleString('id-ID')}</td>
                    <td className="py-2 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        l.action === 'LOGIN' ? 'bg-blue-50 text-blue-700' :
                        l.action === 'CREATE' ? 'bg-emerald-50 text-emerald-700' :
                        l.action === 'DELETE' ? 'bg-rose-50 text-rose-700' :
                        l.action === 'ACCESS_BK_RESTRICTED' ? 'bg-purple-50 text-purple-700' :
                        l.action === 'READ_RESTRICTED' ? 'bg-rose-50 text-rose-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {l.action}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-slate-600">{l.table_name}</td>
                    <td className="py-2 px-4 text-slate-500 text-[11px]">{l.user_id}</td>
                    <td className="py-2 px-4 font-sans text-slate-800">{l.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 1: UPLOAD & IMPORT EXCEL (.xlsx / .xls / .csv)
      ====================================================================== */}
      {showExcelModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-4 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold">Upload & Import Data Master dari Excel</h3>
                  <p className="text-xs text-slate-300">
                    Mendukung file <span className="font-mono text-emerald-300">.xlsx</span>, <span className="font-mono text-emerald-300">.xls</span>, dan <span className="font-mono text-emerald-300">.csv</span> dengan pratinjau & validasi otomatis sebelum masuk database.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExcelModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
              {/* Step 1: Pilih Jenis Data Master & Unduh Template */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    1. Pilih Target Tabel Data Master
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(['siswa', 'guru', 'kelas', 'kompetensi'] as MasterEntityType[]).map(ent => (
                      <button
                        key={ent}
                        type="button"
                        onClick={() => {
                          setExcelEntity(ent);
                          setExcelResult(null);
                          setExcelError(null);
                        }}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                          excelEntity === ent
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {ENTITY_LABELS[ent]}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => downloadMasterTemplate(excelEntity)}
                  className="h-10 px-3.5 bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 transition-colors"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Unduh Template {ENTITY_LABELS[excelEntity]}</span>
                </button>
              </div>

              {/* Step 2: Drag & Drop Upload Zone */}
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleExcelFileSelected(e.dataTransfer.files?.[0]);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 sm:p-8 rounded-xl border-2 border-dashed text-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-300 bg-slate-50/50 hover:border-emerald-400 hover:bg-emerald-50/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={e => {
                    handleExcelFileSelected(e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
                <Upload className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-xs sm:text-sm font-bold text-slate-800">
                  Klik untuk memilih file Excel atau tarik (drag & drop) file ke sini
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Format: <span className="font-mono">.xlsx</span>, <span className="font-mono">.xls</span>, <span className="font-mono">.csv</span> (Maks. 5 MB) · Target: <strong>{ENTITY_LABELS[excelEntity]}</strong>
                </p>
                {excelEntity === 'siswa' && (
                  <p className="text-[11px] text-blue-700 mt-2">
                    Kolom: <span className="font-mono">NIS, NISN, Nama Lengkap, Jenis Kelamin (L/P), Tanggal Lahir, Alamat, Nama Orang Tua, No HP Orang Tua, Nama Kelas, Status</span>
                  </p>
                )}
                {excelEntity === 'guru' && (
                  <p className="text-[11px] text-blue-700 mt-2">
                    Kolom: <span className="font-mono">NIP, Nama Lengkap, Email, No HP, Jabatan, Status</span>
                  </p>
                )}
                {excelEntity === 'kelas' && (
                  <p className="text-[11px] text-blue-700 mt-2">
                    Kolom: <span className="font-mono">Nama Kelas, Tingkat (10/11/12), Kode Kompetensi, Wali Kelas</span>
                  </p>
                )}
                {excelEntity === 'kompetensi' && (
                  <p className="text-[11px] text-blue-700 mt-2">
                    Kolom: <span className="font-mono">Kode, Nama Kompetensi Keahlian, Status</span>
                  </p>
                )}
              </div>

              {/* Error Banner */}
              {excelError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{excelError}</span>
                </div>
              )}

              {/* Step 3: Preview & Validation Table */}
              {excelResult && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs font-bold text-slate-800">
                      Pratinjau File: <span className="font-mono text-emerald-700">{excelResult.fileName}</span> ({excelResult.totalRows} baris)
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Baru: {excelResult.validCount}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        Duplikat: {excelResult.duplicateCount}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                        Error: {excelResult.errorCount}
                      </span>
                    </div>
                  </div>

                  {excelResult.duplicateCount > 0 && (
                    <label className="flex items-center gap-2 p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={updateDuplicates}
                        onChange={e => setUpdateDuplicates(e.target.checked)}
                        className="rounded border-amber-400 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>
                        <strong>Perbarui data lama</strong> jika NIS / NIP / Nama Kelas / Kode sudah terdaftar di database (jika tidak dicentang, data duplikat akan dilewati).
                      </span>
                    </label>
                  )}

                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="max-h-64 overflow-auto">
                      <table className="w-full text-left text-xs text-slate-700">
                        <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200 sticky top-0">
                          <tr>
                            <th className="py-2 px-3">Baris</th>
                            <th className="py-2 px-3">Status</th>
                            {Object.keys(excelResult.rows[0]?.displaySummary || {}).map(col => (
                              <th key={col} className="py-2 px-3 whitespace-nowrap">{col}</th>
                            ))}
                            <th className="py-2 px-3">Keterangan Validasi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {excelResult.rows.map(row => (
                            <tr
                              key={row.rowNumber}
                              className={
                                row.status === 'error'
                                  ? 'bg-rose-50/60'
                                  : row.status === 'duplicate'
                                  ? 'bg-amber-50/40'
                                  : 'hover:bg-slate-50'
                              }
                            >
                              <td className="py-2 px-3 font-mono text-slate-500">#{row.rowNumber}</td>
                              <td className="py-2 px-3 whitespace-nowrap">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    row.status === 'valid'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : row.status === 'duplicate'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {row.status === 'valid' ? 'BARU' : row.status === 'duplicate' ? 'DUPLIKAT' : 'ERROR'}
                                </span>
                              </td>
                              {Object.values(row.displaySummary).map((val, i) => (
                                <td key={i} className="py-2 px-3 whitespace-nowrap font-medium text-slate-800">
                                  {val}
                                </td>
                              ))}
                              <td className="py-2 px-3 text-[11px] text-slate-600">{row.message}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {dbService.isConnectedToSupabase
                    ? 'Supabase Cloud aktif — data valid otomatis disimpan & disinkronkan.'
                    : 'Mode Database Lokal — data tersimpan ke browser & siap disinkronkan ke Supabase.'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowExcelModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={
                    importing ||
                    !excelResult ||
                    excelResult.validCount + (updateDuplicates ? excelResult.duplicateCount : 0) === 0
                  }
                  onClick={handleCommitExcelImport}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
                >
                  {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  <span>
                    Simpan ke Database (
                    {excelResult
                      ? excelResult.validCount + (updateDuplicates ? excelResult.duplicateCount : 0)
                      : 0}{' '}
                    baris)
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: TAMBAH SISWA MANUAL
      ====================================================================== */}
      {showModalSiswa && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl border border-slate-200 overflow-hidden my-6">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Input Data Siswa Baru</h3>
              <button onClick={() => setShowModalSiswa(false)} className="text-slate-400 hover:text-slate-700 text-lg">&times;</button>
            </div>
            <form onSubmit={handleSaveSiswa} className="p-5 space-y-3 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">NIS *</label>
                  <input type="text" required value={nis} onChange={e => setNis(e.target.value)} className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg" placeholder="2526001" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">NISN</label>
                  <input type="text" value={nisn} onChange={e => setNisn(e.target.value)} className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg" placeholder="0091234567" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">Nama Lengkap Siswa *</label>
                <input type="text" required value={namaLengkap} onChange={e => setNamaLengkap(e.target.value)} className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg" placeholder="Contoh: Nadia Putri Maharani" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">Jenis Kelamin</label>
                  <select value={jk} onChange={e => setJk(e.target.value as 'L' | 'P')} className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg bg-white">
                    <option value="L">Laki-Laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">Tanggal Lahir</label>
                  <input type="date" value={tanggalLahir} onChange={e => setTanggalLahir(e.target.value)} className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">Status</label>
                  <select value={statusSiswa} onChange={e => setStatusSiswa(e.target.value as Siswa['status'])} className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg bg-white">
                    <option value="Aktif">Aktif</option>
                    <option value="Lulus">Lulus</option>
                    <option value="Pindah">Pindah</option>
                    <option value="Drop Out">Drop Out</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">Rombongan Belajar / Kelas *</label>
                <select value={kelasId} onChange={e => setKelasId(e.target.value)} className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg bg-white">
                  {dbService.kelasList.map((k: Kelas) => (
                    <option key={k.id} value={k.id}>{k.nama_kelas}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">Alamat</label>
                <input type="text" value={alamatSiswa} onChange={e => setAlamatSiswa(e.target.value)} className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg" placeholder="Alamat lengkap siswa..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">Nama Orang Tua / Wali</label>
                  <input type="text" value={namaOrtu} onChange={e => setNamaOrtu(e.target.value)} className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg" placeholder="Nama orang tua" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">No. HP Orang Tua</label>
                  <input type="text" value={hpOrtu} onChange={e => setHpOrtu(e.target.value)} className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg" placeholder="0812xxxxxxxx" />
                </div>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModalSiswa(false)} className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Simpan Siswa</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 3: TAMBAH GURU MANUAL
      ====================================================================== */}
      {showModalGuru && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-slate-200 overflow-hidden my-6">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Input Guru / Tenaga Pendidik</h3>
              <button onClick={() => setShowModalGuru(false)} className="text-slate-400 hover:text-slate-700 text-lg">&times;</button>
            </div>
            <form onSubmit={handleSaveGuru} className="p-5 space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">NIP / NUPTK *</label>
                <input type="text" required value={nipGuru} onChange={e => setNipGuru(e.target.value)} className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg" placeholder="198501012010011001" />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">Nama Lengkap & Gelar *</label>
                <input type="text" required value={namaGuru} onChange={e => setNamaGuru(e.target.value)} className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg" placeholder="Contoh: Drs. Hendra Kusuma, M.Pd" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">Email Dinas</label>
                  <input type="email" value={emailGuru} onChange={e => setEmailGuru(e.target.value)} className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg" placeholder="nama@smkn1jember.sch.id" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">No. HP / WhatsApp</label>
                  <input type="text" value={hpGuru} onChange={e => setHpGuru(e.target.value)} className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg" placeholder="0812xxxxxxxx" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">Jabatan / Penugasan *</label>
                <input type="text" required value={jabatanGuru} onChange={e => setJabatanGuru(e.target.value)} className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg" />
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-700 pt-1">
                <input type="checkbox" checked={statusGuruAktif} onChange={e => setStatusGuruAktif(e.target.checked)} className="rounded border-slate-300 text-blue-600" />
                <span>Status Aktif Mengajar / Bertugas</span>
              </label>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModalGuru(false)} className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Simpan Guru</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 4: TAMBAH ROMBONGAN BELAJAR / KELAS MANUAL
      ====================================================================== */}
      {showModalKelas && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-slate-200 overflow-hidden my-6">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Input Rombongan Belajar / Kelas</h3>
              <button onClick={() => setShowModalKelas(false)} className="text-slate-400 hover:text-slate-700 text-lg">&times;</button>
            </div>
            <form onSubmit={handleSaveKelas} className="p-5 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">Nama Kelas *</label>
                  <input
                    type="text"
                    required
                    value={namaKelasInput}
                    onChange={e => setNamaKelasInput(e.target.value)}
                    placeholder="Contoh: X RPL 3"
                    className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">Tingkat *</label>
                  <select
                    value={tingkatKelas}
                    onChange={e => setTingkatKelas(Number(e.target.value) as 10 | 11 | 12)}
                    className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value={10}>Kelas 10</option>
                    <option value={11}>Kelas 11</option>
                    <option value={12}>Kelas 12</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">Kompetensi Keahlian *</label>
                <select
                  value={kkKelasId}
                  onChange={e => setKkKelasId(e.target.value)}
                  className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  {dbService.kompetensiList.map((kk: KompetensiKeahlian) => (
                    <option key={kk.id} value={kk.id}>{kk.kode} — {kk.nama}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">Wali Kelas *</label>
                <select
                  value={waliKelasId}
                  onChange={e => setWaliKelasId(e.target.value)}
                  className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  {dbService.guruList.map((g: Guru) => (
                    <option key={g.id} value={g.id}>{g.nama_lengkap} ({g.nip})</option>
                  ))}
                </select>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModalKelas(false)} className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Simpan Kelas</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 5: TAMBAH KOMPETENSI KEAHLIAN MANUAL
      ====================================================================== */}
      {showModalKompetensi && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-slate-200 overflow-hidden my-6">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Input Kompetensi Keahlian</h3>
              <button onClick={() => setShowModalKompetensi(false)} className="text-slate-400 hover:text-slate-700 text-lg">&times;</button>
            </div>
            <form onSubmit={handleSaveKompetensi} className="p-5 space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">Kode Singkatan *</label>
                <input
                  type="text"
                  required
                  value={kodeKK}
                  onChange={e => setKodeKK(e.target.value)}
                  placeholder="Contoh: PPLG, AKL, MPLB, DKV"
                  className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg uppercase font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">Nama Kompetensi Keahlian *</label>
                <input
                  type="text"
                  required
                  value={namaKK}
                  onChange={e => setNamaKK(e.target.value)}
                  placeholder="Contoh: Pengembangan Perangkat Lunak dan Gim"
                  className="w-full h-10 px-3 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-700 pt-1">
                <input type="checkbox" checked={aktifKK} onChange={e => setAktifKK(e.target.checked)} className="rounded border-slate-300 text-blue-600" />
                <span>Kompetensi Keahlian Aktif</span>
              </label>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModalKompetensi(false)} className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Simpan Kompetensi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
