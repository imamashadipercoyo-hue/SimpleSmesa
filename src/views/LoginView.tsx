import React, { useState } from 'react';
import { dbService } from '../services/supabaseService';
import { UserRole } from '../types/database';
import { ShieldCheck, LogIn, Sparkles, Key, CheckCircle, ArrowRight } from 'lucide-react';

interface LoginViewProps {
  onSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('guru.wali@smkn1jember.sch.id');
  const [password, setPassword] = useState('••••••••');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const result = await dbService.login(email, password);
      if (result.success) {
        onSuccess();
      } else {
        setErrorMsg(result.message || 'Gagal masuk. Periksa kembali kredensial Anda.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRole = (roleKode: UserRole) => {
    dbService.switchRole(roleKode);
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800/80 text-blue-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>SMK NEGERI 1 JEMBER</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">SIMPEL SMESA</h1>
        <p className="text-xs text-slate-300 font-medium">
          Sistem Informasi Monitoring, Pendampingan, dan Evaluasi Siswa
        </p>
        <p className="text-[11px] text-blue-300/80 tracking-wide">
          “Data Terintegrasi • Layanan Terarah • Pembinaan Berkelanjutan”
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-6 shadow-xl rounded-xl sm:px-10 border border-slate-200">
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Email Pengguna
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nama@smkn1jember.sch.id"
                  className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-[11px] text-slate-600 font-mono">auth.users</span>
              </div>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md font-medium">
                {errorMsg}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 flex justify-center items-center gap-2 px-4 border border-transparent rounded-lg shadow-xs text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-70"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'Memverifikasi...' : 'Masuk ke Sistem'}</span>
              </button>
            </div>
          </form>

          {/* Quick Role Evaluator Switcher (Section 63 Requirements) */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block text-center mb-3">
              Uji Coba Cepat 8 Role (Pengujian Test 1 - Test 8)
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickRole('guru_wali')}
                className="p-2 text-left bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-md transition-colors"
              >
                <span className="font-bold text-slate-800 block text-[11px]">1. Guru Wali</span>
                <span className="text-[10px] text-slate-600">Siswa Dampingan</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickRole('wali_kelas')}
                className="p-2 text-left bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-md transition-colors"
              >
                <span className="font-bold text-slate-800 block text-[11px]">2. Wali Kelas</span>
                <span className="text-[10px] text-slate-600">Kelas XI RPL 1</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickRole('kkk')}
                className="p-2 text-left bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-md transition-colors"
              >
                <span className="font-bold text-slate-800 block text-[11px]">3. KKK RPL</span>
                <span className="text-[10px] text-slate-600">Kompetensi Vokasi</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickRole('guru_bk')}
                className="p-2 text-left bg-purple-50/70 hover:bg-purple-100/70 hover:border-purple-300 border border-purple-200 rounded-md transition-colors"
              >
                <span className="font-bold text-purple-900 block text-[11px]">4. Guru BK</span>
                <span className="text-[10px] text-purple-700">Akses Vault Rahasia</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickRole('kesiswaan')}
                className="p-2 text-left bg-slate-50 hover:bg-rose-50 hover:border-rose-300 border border-slate-200 rounded-md transition-colors"
              >
                <span className="font-bold text-slate-800 block text-[11px]">5. Kesiswaan</span>
                <span className="text-[10px] text-slate-600">Tatib & Poin</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickRole('waka_kesiswaan')}
                className="p-2 text-left bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 border border-slate-200 rounded-md transition-colors"
              >
                <span className="font-bold text-slate-800 block text-[11px]">6. Waka Kesiswaan</span>
                <span className="text-[10px] text-slate-600">Monitoring Kasus</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickRole('kepala_sekolah')}
                className="p-2 text-left bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-md transition-colors"
              >
                <span className="font-bold text-slate-800 block text-[11px]">7. Kepala Sekolah</span>
                <span className="text-[10px] text-slate-600">Laporan Strategis</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickRole('admin')}
                className="p-2 text-left bg-slate-900 text-white rounded-md transition-colors hover:bg-slate-800"
              >
                <span className="font-bold block text-[11px]">8. Admin SIMPEL</span>
                <span className="text-[10px] text-slate-400">Master Data & RLS</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
