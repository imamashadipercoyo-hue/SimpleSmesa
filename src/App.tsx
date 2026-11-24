import React, { useState, useEffect } from 'react';
import { dbService } from './services/supabaseService';
import { AppLayout } from './components/layout/AppLayout';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { GuruWaliView } from './views/GuruWaliView';
import { WaliKelasView } from './views/WaliKelasView';
import { KKKView } from './views/KKKView';
import { BKView } from './views/BKView';
import { KesiswaanView } from './views/KesiswaanView';
import { KoordinasiView } from './views/KoordinasiView';
import { PrestasiOrganisasiView } from './views/PrestasiOrganisasiView';
import { LaporanView } from './views/LaporanView';
import { MasterDataView } from './views/MasterDataView';
import { SchoolProfileView } from './views/SchoolProfileView';
import { SupabaseConfigView } from './views/SupabaseConfigView';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [, setRerender] = useState(0);

  useEffect(() => {
    const unsub = dbService.subscribe(() => {
      setRerender(n => n + 1);
    });
    return unsub;
  }, []);

  const currentUser = dbService.currentUser;
  const role = currentUser.role_kode;

  // View Access Guard based on Role (Section 45)
  const isAuthorized = (view: string): boolean => {
    switch (view) {
      case 'dashboard':
      case 'koordinasi':
      case 'prestasi':
      case 'laporan':
        return true;
      case 'guru-wali':
        return ['admin', 'guru_wali', 'waka_kesiswaan', 'kepala_sekolah'].includes(role);
      case 'wali-kelas':
        return ['admin', 'wali_kelas', 'waka_kesiswaan', 'kepala_sekolah'].includes(role);
      case 'kkk':
        return ['admin', 'kkk', 'waka_kesiswaan', 'kepala_sekolah'].includes(role);
      case 'bk':
        return ['admin', 'guru_bk', 'waka_kesiswaan', 'kepala_sekolah'].includes(role);
      case 'kesiswaan':
        return ['admin', 'kesiswaan', 'waka_kesiswaan', 'kepala_sekolah'].includes(role);
      case 'master-data':
        return ['admin'].includes(role);
      case 'school-profile':
      case 'supabase-config':
        return ['admin', 'waka_kesiswaan', 'kepala_sekolah'].includes(role);
      default:
        return true;
    }
  };

  const renderContent = () => {
    if (!isAuthorized(currentView)) {
      return (
        <div className="bg-white p-8 rounded-xl border border-red-200 text-center max-w-lg mx-auto my-12 space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">403 Unauthorized — Akses Ditolak</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Peran Anda saat ini (<strong className="capitalize">{role.replace(/_/g, ' ')}</strong>) tidak memiliki hak akses operasional ke modul ini berdasarkan kebijakan Row Level Security.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Dashboard Utama</span>
            </button>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <DashboardView onNavigate={setCurrentView} />;
      case 'guru-wali':
        return <GuruWaliView />;
      case 'wali-kelas':
        return <WaliKelasView />;
      case 'kkk':
        return <KKKView />;
      case 'bk':
        return <BKView />;
      case 'kesiswaan':
        return <KesiswaanView />;
      case 'koordinasi':
        return <KoordinasiView />;
      case 'prestasi':
        return <PrestasiOrganisasiView />;
      case 'laporan':
        return <LaporanView />;
      case 'master-data':
        return <MasterDataView />;
      case 'school-profile':
        return <SchoolProfileView />;
      case 'supabase-config':
        return <SupabaseConfigView />;
      default:
        return <DashboardView onNavigate={setCurrentView} />;
    }
  };

  return (
    <AppLayout currentView={currentView} onNavigate={setCurrentView}>
      {renderContent()}
    </AppLayout>
  );
}
