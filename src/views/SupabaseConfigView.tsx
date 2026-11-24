import React, { useState } from 'react';
import { dbService } from '../services/supabaseService';
import { SIMPEL_SMESA_MIGRATION_SQL } from '../services/sqlMigration';
import {
  Database,
  CheckCircle,
  Copy,
  Check,
  Download,
  RefreshCw,
  AlertCircle,
  BookOpen,
  ShieldCheck,
  Terminal,
  PlugZap,
  Unplug,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CloudUpload,
  CloudDownload,
  Radio
} from 'lucide-react';

interface GuideStep {
  step: number;
  title: string;
  subtitle: string;
  details: string[];
  tip?: string;
}

const SUPABASE_GUIDE_STEPS: GuideStep[] = [
  {
    step: 1,
    title: 'Buat Akun & Project Baru di Supabase',
    subtitle: 'Inisialisasi server database PostgreSQL Cloud',
    details: [
      'Buka https://supabase.com lalu login menggunakan akun GitHub atau Email resmi sekolah.',
      'Klik tombol "New Project", pilih Organization Anda.',
      'Isi Name: simpel-smesa-smkn1jember dan buat Database Password yang kuat.',
      'Pilih Region: Southeast Asia (Singapore) agar koneksi paling cepat di Indonesia.',
      'Klik "Create new project" dan tunggu ±1–2 menit hingga aktif.'
    ]
  },
  {
    step: 2,
    title: 'Ambil Project URL & Anon Public Key',
    subtitle: 'Kredensial publik untuk menghubungkan aplikasi ke Supabase',
    details: [
      'Buka menu Project Settings (ikon gerigi kiri bawah) → API.',
      'Salin Project URL (format: https://xxxxxxxxxxxx.supabase.co).',
      'Pada Project API keys, salin kunci "anon / public" (bukan service_role).',
      'Kunci anon aman dipakai di browser karena akses dilindungi Row Level Security (RLS).'
    ],
    tip: 'Jangan pernah menggunakan service_role key di sisi frontend browser.'
  },
  {
    step: 3,
    title: 'Jalankan Script SQL Migrasi (001 – 028)',
    subtitle: 'Membuat tabel relasional, RLS, & Engine Auto-Sync Realtime',
    details: [
      'Klik "Salin Script SQL" di bawah halaman ini.',
      'Di dashboard Supabase, buka menu SQL Editor → "+ New query".',
      'Tempel seluruh isi Script SQL 001 – 028 lalu klik "Run" (Ctrl+Enter).',
      'Pastikan muncul pesan "Success. No rows returned" tanpa error.'
    ],
    tip: 'Migrasi 028 mengaktifkan tabel simpel_sync_collections & Supabase Realtime Publication untuk update data online otomatis.'
  },
  {
    step: 4,
    title: 'Sambungkan & Aktifkan Auto-Sinkronisasi Online',
    subtitle: 'Update data otomatis lintas perangkat (HP & Laptop)',
    details: [
      'Tempel Project URL dan Anon Public Key ke form di bawah, lalu klik "Tes Koneksi & Cek Tabel".',
      'Klik "Simpan & Sambungkan Supabase".',
      'Saat Auto-Sinkronisasi Online aktif, setiap input data Master, Excel Upload, Pelanggaran, Jurnal, maupun Koordinasi langsung tersimpan ke Supabase & otomatis terupdate di perangkat lain.'
    ]
  }
];

export const SupabaseConfigView: React.FC = () => {
  const [url, setUrl] = useState(dbService.supabaseUrl);
  const [key, setKey] = useState(dbService.supabaseAnonKey);
  const [copied, setCopied] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncBusy, setSyncBusy] = useState<'pull' | 'push' | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{
    type: 'success' | 'warning' | 'error';
    text: string;
  } | null>(null);

  const handleTestConnection = async () => {
    setTesting(true);
    setStatusMsg(null);
    const result = await dbService.testSupabaseConnection(url, key);
    setTesting(false);

    if (result.ok) {
      setStatusMsg({ type: 'success', text: result.message });
    } else if (result.stage === 'missing_tables' || result.stage === 'missing_sync_table') {
      setStatusMsg({ type: 'warning', text: result.message });
    } else {
      setStatusMsg({ type: 'error', text: result.message });
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !key.trim()) {
      setStatusMsg({ type: 'error', text: 'Supabase Project URL dan Anon Public Key tidak boleh kosong.' });
      return;
    }

    setTesting(true);
    const testResult = await dbService.testSupabaseConnection(url, key);
    setTesting(false);

    if (testResult.stage === 'invalid_credentials' || testResult.stage === 'network_error') {
      setStatusMsg({ type: 'error', text: testResult.message });
      return;
    }

    const success = dbService.initSupabaseClient(url, key);
    if (success) {
      if (testResult.ok) {
        setStatusMsg({
          type: 'success',
          text: `${testResult.message} Auto-Sinkronisasi Online (Realtime) langsung aktif!`
        });
      } else {
        setStatusMsg({
          type: 'warning',
          text: testResult.message
        });
      }
    } else {
      setStatusMsg({
        type: 'error',
        text: 'Format URL atau Key tidak valid. Pastikan URL diawali https:// dan berakhiran .supabase.co.'
      });
    }
  };

  const handlePullNow = async () => {
    setSyncBusy('pull');
    const res = await dbService.pullAllFromSupabase(false);
    setSyncBusy(null);
    setStatusMsg({ type: res.ok ? 'success' : 'error', text: res.message });
  };

  const handlePushNow = async () => {
    setSyncBusy('push');
    const res = await dbService.pushAllToSupabase();
    setSyncBusy(null);
    setStatusMsg({ type: res.ok ? 'success' : 'error', text: res.message });
  };

  const handleDisconnect = () => {
    dbService.disconnectSupabase();
    setUrl('');
    setKey('');
    setStatusMsg({
      type: 'warning',
      text: 'Koneksi Supabase diputus. Aplikasi kembali menggunakan mode penyimpanan lokal.'
    });
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SIMPEL_SMESA_MIGRATION_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyEnv = () => {
    const envSnippet = `VITE_SUPABASE_URL="${url || 'https://YOUR_PROJECT_REF.supabase.co'}"\nVITE_SUPABASE_ANON_KEY="${key || 'YOUR_SUPABASE_ANON_PUBLIC_KEY'}"`;
    navigator.clipboard.writeText(envSnippet);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2500);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([SIMPEL_SMESA_MIGRATION_SQL], { type: 'text/sql' });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = 'simpel_smesa_migration_001_to_028.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider">
          <Database className="w-4 h-4" />
          <span>Integrasi Database PostgreSQL & Auto-Sync Online</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mt-1">Konfigurasi Supabase, Auto-Sync Realtime & SQL (001 – 028)</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Setiap perubahan data (Input Manual, Upload Excel, Jurnal, Pelanggaran, Pembinaan, Koordinasi) otomatis tersinkronisasi online ke Supabase dan diperbarui real-time lintas perangkat.
        </p>
      </div>

      {/* Connection & Auto-Sync Card */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${dbService.isConnectedToSupabase ? 'bg-emerald-500' : 'bg-blue-500'}`} />
            <h3 className="text-sm font-bold text-slate-900">
              {dbService.isConnectedToSupabase ? 'Terhubung ke Supabase Cloud' : 'Mode Penyimpanan Lokal'}
            </h3>
          </div>
          {dbService.isConnectedToSupabase && (
            <button
              type="button"
              onClick={handleDisconnect}
              className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-1 transition-colors"
            >
              <Unplug className="w-3.5 h-3.5" />
              <span>Putuskan Koneksi</span>
            </button>
          )}
        </div>

        {statusMsg && (
          <div className={`p-3 rounded-lg text-xs font-medium flex items-start gap-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : statusMsg.type === 'warning'
              ? 'bg-amber-50 text-amber-900 border border-amber-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {statusMsg.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : statusMsg.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleConnect} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Supabase Project URL
              </label>
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://xyzprojectid.supabase.co"
                className="w-full h-11 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Supabase Anon / Public Key
              </label>
              <input
                type="password"
                value={key}
                onChange={e => setKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full h-11 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-slate-500">
              Gunakan <strong>anon / public key</strong> dari Project Settings → API.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={testing}
                onClick={handleTestConnection}
                className="h-10 px-3.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlugZap className="w-3.5 h-3.5 text-emerald-600" />}
                <span>Tes Koneksi & Cek Tabel</span>
              </button>
              <button
                type="submit"
                disabled={testing}
                className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                <span>Simpan & Sambungkan Supabase</span>
              </button>
            </div>
          </div>
        </form>

        {/* Auto-Sync Realtime Control Panel */}
        <div className="pt-4 border-t border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                dbService.isConnectedToSupabase && dbService.autoSyncEnabled
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-200 text-slate-600'
              }`}>
                <Radio className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Auto-Sinkronisasi Online & Update Realtime Multi-Perangkat
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                  Otomatis mengirim setiap perubahan data ke Supabase PostgreSQL, menyimpan antrean otomatis saat offline, dan menerima pembaruan langsung dari perangkat lain tanpa refresh.
                </p>
                {dbService.lastSyncedAt && (
                  <p className="text-[11px] text-emerald-700 font-medium mt-1">
                    Sinkronisasi terakhir: {new Date(dbService.lastSyncedAt).toLocaleString('id-ID')}
                  </p>
                )}
                {dbService.lastSyncError && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">
                    Catatan sinkronisasi: {dbService.lastSyncError}
                  </p>
                )}
              </div>
            </div>

            <label className="inline-flex items-center gap-2.5 cursor-pointer shrink-0 select-none">
              <span className="text-xs font-semibold text-slate-700">
                {dbService.autoSyncEnabled ? 'Aktif' : 'Nonaktif'}
              </span>
              <input
                type="checkbox"
                checked={dbService.autoSyncEnabled}
                onChange={e => dbService.setAutoSyncEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-checked:bg-emerald-600 rounded-full relative transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
            </label>
          </div>

          {dbService.isConnectedToSupabase && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500">
                Sinkronisasi manual dua arah (26 koleksi operasional + tabel relasional Guru, Kompetensi, Kelas, Siswa, & 62 Tatib Baku):
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={syncBusy !== null}
                  onClick={handlePullNow}
                  className="h-9 px-3.5 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {syncBusy === 'pull' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CloudDownload className="w-3.5 h-3.5" />}
                  <span>Tarik Data Online (Pull)</span>
                </button>
                <button
                  type="button"
                  disabled={syncBusy !== null}
                  onClick={handlePushNow}
                  className="h-9 px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {syncBusy === 'push' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CloudUpload className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>Kirim Semua ke Supabase (Push)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Collapsible Step-by-Step Guide Card */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setShowGuide(prev => !prev)}
          className="w-full p-5 flex items-center justify-between text-left bg-slate-50/70 hover:bg-slate-50 border-b border-slate-200 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <BookOpen className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Panduan Step-by-Step Setup Supabase, SQL & Auto-Sync Online
              </h3>
              <p className="text-xs text-slate-500">
                Klik untuk membuka/menutup panduan 4 langkah & konfigurasi .env produksi
              </p>
            </div>
          </div>
          {showGuide ? (
            <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
          )}
        </button>

        {showGuide && (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {SUPABASE_GUIDE_STEPS.map(item => (
                <div
                  key={item.step}
                  className="p-4 rounded-lg border border-slate-200 bg-white flex flex-col gap-2.5"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-md bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {item.step}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                      <p className="text-[11px] text-slate-500">{item.subtitle}</p>
                    </div>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-slate-700 pl-1">
                    {item.details.map((detail, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {detail}
                      </li>
                    ))}
                  </ol>
                  {item.tip && (
                    <div className="mt-auto pt-2 border-t border-slate-100 flex items-start gap-1.5 text-[11px] text-emerald-800 bg-emerald-50/70 p-2 rounded">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item.tip}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 rounded-lg bg-slate-900 text-slate-200 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Konfigurasi .env untuk Auto-Connect di Deployment Production</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyEnv}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
                >
                  {copiedEnv ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedEnv ? 'Tersalin' : 'Salin .env'}</span>
                </button>
              </div>
              <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto">{`VITE_SUPABASE_URL="${url || 'https://YOUR_PROJECT_REF.supabase.co'}"
VITE_SUPABASE_ANON_KEY="${key || 'YOUR_SUPABASE_ANON_PUBLIC_KEY'}"`}</pre>
            </div>
          </div>
        )}
      </div>

      {/* SQL Migration Script Generator (001 - 028) */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Script SQL Migrasi 001 – 028 (PostgreSQL, Tata Tertib Baku, RLS & Auto-Sync Realtime)
            </h3>
            <p className="text-xs text-slate-500">
              Jalankan di <strong>SQL Editor</strong> Supabase untuk membentuk seluruh tabel, 7 fase sanksi, RLS, bucket Storage, dan tabel <strong>simpel_sync_collections</strong> (Realtime).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySql}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Script SQL'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadSql}
              className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Unduh .SQL</span>
            </button>
          </div>
        </div>

        {/* Code Block Viewer */}
        <div className="relative rounded-lg bg-slate-950 p-4 border border-slate-800 max-h-[420px] overflow-y-auto font-mono text-xs text-slate-300">
          <pre className="whitespace-pre">{SIMPEL_SMESA_MIGRATION_SQL}</pre>
        </div>
      </div>
    </div>
  );
};
