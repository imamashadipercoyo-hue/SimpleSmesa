import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/supabaseService';
import { UserRole } from '../../types/database';
import {
  LayoutDashboard,
  UserCheck,
  Users,
  Briefcase,
  HeartHandshake,
  ShieldAlert,
  Activity,
  Award,
  FileText,
  Layers,
  Database,
  Bell,
  Menu,
  X,
  LogOut,
  ChevronRight,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
  Shield,
  Sparkles,
  CheckCircle2,
  Lock,
  Command
} from 'lucide-react';

interface AppLayoutProps {
  currentView: string;
  onNavigate: (view: string) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentView,
  onNavigate,
  children
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('simpel_smesa_sidebar_collapsed');
      return saved === 'true';
    } catch {
      return false;
    }
  });
  const [, setRerender] = useState(0);

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('simpel_smesa_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleCollapse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const unsub = dbService.subscribe(() => {
      setRerender(n => n + 1);
    });
    return unsub;
  }, []);

  const profile = dbService.currentUser;
  const role = profile.role_kode;
  const unreadNotifs = dbService.notifications.filter(n => !n.dibaca);

  // Role styling helper
  const getRoleTheme = (roleKode: string) => {
    switch (roleKode) {
      case 'guru_bk':
        return { initial: 'BK', bg: 'bg-purple-600', ring: 'ring-purple-400' };
      case 'kesiswaan':
        return { initial: 'KS', bg: 'bg-rose-600', ring: 'ring-rose-400' };
      case 'waka_kesiswaan':
        return { initial: 'WK', bg: 'bg-indigo-600', ring: 'ring-indigo-400' };
      case 'kepala_sekolah':
        return { initial: 'KS', bg: 'bg-emerald-600', ring: 'ring-emerald-400' };
      case 'admin':
        return { initial: 'AD', bg: 'bg-amber-600', ring: 'ring-amber-400' };
      case 'wali_kelas':
        return { initial: 'WK', bg: 'bg-cyan-600', ring: 'ring-cyan-400' };
      case 'kkk':
        return { initial: 'KK', bg: 'bg-teal-600', ring: 'ring-teal-400' };
      case 'guru_wali':
      default:
        return { initial: 'GW', bg: 'bg-blue-600', ring: 'ring-blue-400' };
    }
  };

  const roleTheme = getRoleTheme(role);

  // Navigation Items
  interface NavItemDef {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    roles?: string[];
    category: 'layanan' | 'manajemen';
  }

  const navItems: NavItemDef[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'layanan' },
    { id: 'guru-wali', label: 'Guru Wali', icon: UserCheck, roles: ['admin', 'guru_wali', 'waka_kesiswaan', 'kepala_sekolah'], category: 'layanan' },
    { id: 'wali-kelas', label: 'Wali Kelas', icon: Users, roles: ['admin', 'wali_kelas', 'waka_kesiswaan', 'kepala_sekolah'], category: 'layanan' },
    { id: 'kkk', label: 'KKK (Vokasi)', icon: Briefcase, roles: ['admin', 'kkk', 'waka_kesiswaan', 'kepala_sekolah'], category: 'layanan' },
    { id: 'bk', label: 'Layanan BK', icon: HeartHandshake, roles: ['admin', 'guru_bk', 'waka_kesiswaan', 'kepala_sekolah'], category: 'layanan' },
    { id: 'kesiswaan', label: 'Kesiswaan & Tatib', icon: ShieldAlert, roles: ['admin', 'kesiswaan', 'waka_kesiswaan', 'kepala_sekolah'], category: 'layanan' },
    { id: 'koordinasi', label: 'Pusat Koordinasi', icon: Activity, category: 'layanan' },
    { id: 'prestasi', label: 'Prestasi & OSIS', icon: Award, category: 'layanan' },
    { id: 'laporan', label: 'Pusat Laporan', icon: FileText, category: 'manajemen' },
    { id: 'master-data', label: 'Data Master', icon: Layers, roles: ['admin'], category: 'manajemen' },
    { id: 'supabase-config', label: 'Supabase & SQL', icon: Database, roles: ['admin', 'waka_kesiswaan', 'kepala_sekolah'], category: 'manajemen' },
  ];

  const visibleNav = navItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(role);
  });

  const layananNav = visibleNav.filter(item => item.category === 'layanan');
  const manajemenNav = visibleNav.filter(item => item.category === 'manajemen');

  const handleNavClick = (viewId: string) => {
    onNavigate(viewId);
    setMobileMenuOpen(false);
  };

  const handleRoleSwitch = (newRole: UserRole) => {
    dbService.switchRole(newRole);
    setRoleSwitcherOpen(false);
    onNavigate('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800">
      {/* ---------------------------------------------------------------------- */}
      {/* DESKTOP SIDEBAR (Visible on md and above)                              */}
      {/* ---------------------------------------------------------------------- */}
      <aside
        className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 bg-slate-900 border-r border-slate-800/80 z-30 transition-all duration-300 ease-in-out shadow-xl ${
          isCollapsed ? 'md:w-20' : 'md:w-64'
        }`}
      >
        {/* Brand Header */}
        <div
          className={`h-16 border-b border-slate-800/80 flex items-center transition-all duration-300 ${
            isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
          }`}
        >
          {isCollapsed ? (
            <div className="relative group">
              <button
                onClick={toggleCollapse}
                title="Perluas Sidebar (Ctrl+B)"
                className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm tracking-tighter shadow-md hover:scale-105 active:scale-95 transition-all ring-1 ring-blue-400/30 cursor-pointer"
              >
                SM
              </button>
              {/* Tooltip */}
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none hidden group-hover:flex items-center">
                <div className="bg-slate-950 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xl border border-slate-700 whitespace-nowrap">
                  SIMPEL SMESA · Klik untuk perluas
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm tracking-tighter shadow-sm shrink-0 ring-1 ring-blue-400/20">
                  SM
                </div>
                <div className="min-w-0">
                  <h1 className="text-sm font-bold text-white tracking-tight truncate leading-none">
                    SIMPEL SMESA
                  </h1>
                  <span className="text-[10px] text-blue-300 font-medium tracking-wide uppercase block mt-1 truncate">
                    SMK Negeri 1 Jember
                  </span>
                </div>
              </div>
              <button
                onClick={toggleCollapse}
                title="Ciutkan Sidebar (Ctrl+B)"
                aria-label="Ciutkan Sidebar"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* User Profile Card with Quick Role Selector Trigger */}
        <div className={`transition-all duration-300 ${isCollapsed ? 'p-2' : 'p-3 mx-3 mt-3 rounded-xl bg-slate-800/50 border border-slate-700/60 shadow-xs'}`}>
          {isCollapsed ? (
            <div className="relative group flex justify-center">
              <button
                onClick={() => setRoleSwitcherOpen(true)}
                title="Ganti Peran Uji Coba"
                className={`w-11 h-11 rounded-xl ${roleTheme.bg} text-white font-bold text-xs flex items-center justify-center shadow-md ring-2 ring-slate-900 hover:ring-blue-400 transition-all cursor-pointer`}
              >
                {roleTheme.initial}
              </button>
              {/* Tooltip on profile */}
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none hidden group-hover:flex items-center">
                <div className="bg-slate-950 text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-slate-700 whitespace-nowrap">
                  <p className="font-bold text-slate-100">{profile.nama_lengkap}</p>
                  <p className="text-[11px] text-blue-400 capitalize">{role.replace(/_/g, ' ')}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Klik untuk ganti peran</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-8 h-8 rounded-lg ${roleTheme.bg} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs`}>
                  {roleTheme.initial}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white truncate block leading-tight">
                    {profile.nama_lengkap}
                  </span>
                  <span className="text-[11px] text-blue-400 capitalize block truncate mt-0.5">
                    {role.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setRoleSwitcherOpen(true)}
                title="Ganti Peran Akun"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/80 transition-colors shrink-0 cursor-pointer"
              >
                <Shield className="w-4 h-4 text-blue-400" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-2.5 py-3 space-y-4 overflow-y-auto overflow-x-hidden">
          {/* Section 1: Layanan Siswa */}
          <div className="space-y-1">
            {!isCollapsed ? (
              <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Layanan & Pendampingan</span>
              </div>
            ) : (
              <div className="my-1.5 border-t border-slate-800/80 mx-2" />
            )}

            {layananNav.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              const badgeCount = item.id === 'koordinasi'
                ? dbService.koordinasiList.filter(k => k.status !== 'Selesai').length
                : 0;

              return isCollapsed ? (
                <div key={item.id} className="relative group flex justify-center py-0.5">
                  <button
                    onClick={() => handleNavClick(item.id)}
                    className={`relative w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold ring-1 ring-blue-400/40'
                        : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                    }`}
                    aria-label={item.label}
                  >
                    <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                    {badgeCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[9px] font-mono font-bold flex items-center justify-center ring-2 ring-slate-900">
                        {badgeCount}
                      </span>
                    )}
                  </button>
                  {/* Floating Tooltip */}
                  <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 hidden group-hover:flex items-center">
                    <div className="bg-slate-950 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xl border border-slate-700/80 whitespace-nowrap flex items-center gap-2">
                      <span>{item.label}</span>
                      {badgeCount > 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold bg-amber-500 text-slate-950">
                          {badgeCount} kasus
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 text-left cursor-pointer group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span className="truncate">{item.label}</span>
                  {badgeCount > 0 && (
                    <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-amber-500 text-slate-950 shadow-xs">
                      {badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Section 2: Manajemen & Sistem */}
          {manajemenNav.length > 0 && (
            <div className="space-y-1">
              {!isCollapsed ? (
                <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Manajemen & Sistem
                </div>
              ) : (
                <div className="my-2 border-t border-slate-800/80 mx-2" />
              )}

              {manajemenNav.map(item => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return isCollapsed ? (
                  <div key={item.id} className="relative group flex justify-center py-0.5">
                    <button
                      onClick={() => handleNavClick(item.id)}
                      className={`relative w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-150 cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold ring-1 ring-blue-400/40'
                          : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                      }`}
                      aria-label={item.label}
                    >
                      <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                    </button>
                    {/* Floating Tooltip */}
                    <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 hidden group-hover:flex items-center">
                      <div className="bg-slate-950 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xl border border-slate-700/80 whitespace-nowrap">
                        {item.label}
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 text-left cursor-pointer group ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </nav>

        {/* Footer & Supabase Status */}
        <div className="p-2.5 border-t border-slate-800 bg-slate-950/70 text-[11px] text-slate-400 space-y-2">
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              <div className="relative group">
                <button
                  onClick={() => onNavigate('supabase-config')}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                >
                  <div className="relative">
                    <Database className="w-4 h-4" />
                    <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${dbService.isConnectedToSupabase ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                  </div>
                </button>
                <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 hidden group-hover:flex items-center">
                  <div className="bg-slate-950 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-xl border border-slate-700 whitespace-nowrap">
                    {dbService.isConnectedToSupabase ? 'Supabase Terhubung' : 'Local Postgres Engine'}
                  </div>
                </div>
              </div>

              <div className="relative group">
                <button
                  onClick={toggleCollapse}
                  title="Perluas Sidebar (Ctrl+B)"
                  className="w-10 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 hidden group-hover:flex items-center">
                  <div className="bg-slate-950 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-xl border border-slate-700 whitespace-nowrap">
                    Perluas Sidebar (Ctrl+B)
                  </div>
                </div>
              </div>

              <div className="relative group">
                <button
                  onClick={() => dbService.logout()}
                  title="Keluar Akun"
                  className="w-10 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
                <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 hidden group-hover:flex items-center">
                  <div className="bg-slate-950 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-xl border border-slate-700 whitespace-nowrap">
                    Keluar Akun
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-2 py-1 bg-slate-900/60 rounded-lg border border-slate-800/80">
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${dbService.isConnectedToSupabase ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'}`} />
                  <span className="text-[10px] text-slate-300 font-medium">
                    {dbService.isConnectedToSupabase ? 'Supabase Connected' : 'Local Postgres Engine'}
                  </span>
                </span>
                <button
                  onClick={() => onNavigate('supabase-config')}
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold"
                >
                  SQL
                </button>
              </div>

              <div className="flex items-center gap-1.5 pt-1">
                <button
                  onClick={toggleCollapse}
                  className="flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors flex items-center justify-between border border-transparent hover:border-slate-700/60 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Ciutkan Sidebar</span>
                  </span>
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 font-mono">
                    Ctrl+B
                  </span>
                </button>

                <button
                  onClick={() => dbService.logout()}
                  title="Keluar Akun"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* ---------------------------------------------------------------------- */}
      {/* MOBILE TOPBAR                                                          */}
      {/* ---------------------------------------------------------------------- */}
      <header className="md:hidden sticky top-0 z-40 bg-slate-900 border-b border-slate-800 h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 text-slate-300 hover:text-white"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xs font-bold text-white tracking-tight leading-none">SIMPEL SMESA</h1>
            <span className="text-[10px] text-blue-300">SMKN 1 Jember</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRoleSwitcherOpen(true)}
            className="px-2 py-1 bg-slate-800 text-[10px] font-semibold text-blue-300 rounded border border-slate-700 capitalize flex items-center gap-1"
          >
            <Shield className="w-3 h-3" />
            <span>{role.replace(/_/g, ' ')}</span>
          </button>
          <button
            onClick={() => setNotifOpen(true)}
            className="relative p-2 text-slate-300 hover:text-white"
            aria-label="Notifikasi"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500" />
            )}
          </button>
        </div>
      </header>

      {/* ---------------------------------------------------------------------- */}
      {/* MOBILE SLIDE-OVER DRAWER MENU                                          */}
      {/* ---------------------------------------------------------------------- */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
          />

          {/* Drawer Body */}
          <div className="relative w-4/5 max-w-xs bg-slate-900 border-r border-slate-800 flex flex-col h-full z-10">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">SIMPEL SMESA</h2>
                <span className="text-[10px] text-blue-300">SMK Negeri 1 Jember</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile info in drawer */}
            <div className="p-3 bg-slate-800/60 border-b border-slate-800 text-xs">
              <span className="font-bold text-white block">{profile.nama_lengkap}</span>
              <span className="text-blue-300 capitalize text-[11px] block">{role.replace(/_/g, ' ')}</span>
            </div>

            {/* Nav list */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {visibleNav.map(item => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-md text-xs font-semibold text-left transition-colors min-h-[44px] ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Drawer Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/80">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setRoleSwitcherOpen(true);
                }}
                className="w-full py-2.5 px-3 rounded text-xs text-blue-400 bg-slate-800/80 font-semibold mb-2 flex items-center justify-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Ganti Peran Akun</span>
              </button>
              <button
                onClick={() => dbService.logout()}
                className="w-full py-2.5 px-3 rounded text-xs text-red-400 hover:bg-slate-800 font-semibold flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* MAIN CONTENT WRAPPER                                                   */}
      {/* ---------------------------------------------------------------------- */}
      <div className={`flex-1 ${isCollapsed ? 'md:pl-20' : 'md:pl-64'} flex flex-col min-h-screen transition-all duration-300 ease-in-out`}>
        {/* Desktop Topbar */}
        <header className="hidden md:flex h-16 bg-white border-b border-slate-200 items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
            <button
              onClick={toggleCollapse}
              title={isCollapsed ? 'Perluas Sidebar (Ctrl+B)' : 'Ciutkan Sidebar (Ctrl+B)'}
              aria-label={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 shadow-xs flex items-center justify-center cursor-pointer"
            >
              {isCollapsed ? <PanelLeftOpen className="w-4 h-4 text-blue-600" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-2">
              <span>SMK Negeri 1 Jember</span>
              <span aria-hidden="true">/</span>
              <span className="text-slate-900 font-semibold capitalize">{currentView.replace('-', ' ')}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Tagline snippet */}
            <span className="text-xs text-slate-600 hidden xl:inline">
              Data Terintegrasi · Layanan Terarah · Pembinaan Berkelanjutan
            </span>

            {/* Notification Trigger */}
            <button
              onClick={() => setNotifOpen(true)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
              title="Notifikasi"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
              )}
            </button>

            {/* Role indicator button */}
            <button
              onClick={() => setRoleSwitcherOpen(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span className="capitalize">{role.replace(/_/g, ' ')}</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 md:pb-8">
          {children}
        </main>

        {/* ---------------------------------------------------------------------- */}
        {/* MOBILE BOTTOM NAVIGATION BAR (Thumb-friendly quick access)             */}
        {/* ---------------------------------------------------------------------- */}
        <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 h-16 flex items-center justify-around z-30 px-2 shadow-lg">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`flex flex-col items-center justify-center w-14 h-full text-[10px] font-medium ${
              currentView === 'dashboard' ? 'text-blue-600 font-bold' : 'text-slate-500'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span>Beranda</span>
          </button>

          <button
            onClick={() => onNavigate('koordinasi')}
            className={`flex flex-col items-center justify-center w-14 h-full text-[10px] font-medium relative ${
              currentView === 'koordinasi' ? 'text-blue-600 font-bold' : 'text-slate-500'
            }`}
          >
            <Activity className="w-5 h-5 mb-0.5" />
            <span>Kasus</span>
          </button>

          <button
            onClick={() => {
              if (role === 'guru_bk') onNavigate('bk');
              else if (role === 'wali_kelas') onNavigate('wali-kelas');
              else if (role === 'kkk') onNavigate('kkk');
              else if (role === 'guru_wali') onNavigate('guru-wali');
              else onNavigate('kesiswaan');
            }}
            className={`flex flex-col items-center justify-center w-14 h-full text-[10px] font-medium ${
              ['bk', 'wali-kelas', 'kkk', 'guru-wali', 'kesiswaan'].includes(currentView)
                ? 'text-blue-600 font-bold'
                : 'text-slate-500'
            }`}
          >
            <UserCheck className="w-5 h-5 mb-0.5" />
            <span>Layanan</span>
          </button>

          <button
            onClick={() => onNavigate('laporan')}
            className={`flex flex-col items-center justify-center w-14 h-full text-[10px] font-medium ${
              currentView === 'laporan' ? 'text-blue-600 font-bold' : 'text-slate-500'
            }`}
          >
            <FileText className="w-5 h-5 mb-0.5" />
            <span>Laporan</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center w-14 h-full text-[10px] font-medium text-slate-500"
          >
            <Menu className="w-5 h-5 mb-0.5" />
            <span>Lainnya</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* NOTIFICATIONS MODAL / DRAWER                                           */}
      {/* ---------------------------------------------------------------------- */}
      {notifOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Notifikasi Masuk</h3>
                <p className="text-[11px] text-slate-500">Prinsip Need-to-know: Tanpa data rahasia konseling.</p>
              </div>
              <button onClick={() => setNotifOpen(false)} className="text-slate-400 text-lg">&times;</button>
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
              {dbService.notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-600">Tidak ada notifikasi baru.</div>
              ) : (
                dbService.notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => dbService.markNotificationAsRead(n.id)}
                    className={`p-4 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                      !n.dibaca ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">{n.judul}</span>
                      <span className="text-[10px] text-slate-600">{new Date(n.created_at).toLocaleDateString('id-ID')}</span>
                    </div>
                    <p className="text-slate-600">{n.pesan}</p>
                    {!n.dibaca && (
                      <span className="inline-block mt-1 text-[10px] text-blue-600 font-semibold">Tandai sudah dibaca</span>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setNotifOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* ROLE SWITCHER MODAL (Evaluator Testing 1 to 8)                         */}
      {/* ---------------------------------------------------------------------- */}
      {roleSwitcherOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Uji Coba Hak Akses Role (Test 1 - 8)</h3>
                <p className="text-[11px] text-slate-500">Pilih salah satu dari 8 role untuk menguji pembatasan RLS.</p>
              </div>
              <button onClick={() => setRoleSwitcherOpen(false)} className="text-slate-400 text-lg">&times;</button>
            </div>

            <div className="p-4 space-y-2 max-h-96 overflow-y-auto text-xs">
              {[
                { role: 'guru_wali' as UserRole, title: '1. Guru Wali', desc: 'Hanya melihat siswa asuh binaan SK', active: role === 'guru_wali' },
                { role: 'wali_kelas' as UserRole, title: '2. Wali Kelas', desc: 'Hanya mengelola siswa kelas XI RPL 1', active: role === 'wali_kelas' },
                { role: 'kkk' as UserRole, title: '3. KKK (Ketua Konsentrasi)', desc: 'Hanya melihat siswa kompetensi RPL', active: role === 'kkk' },
                { role: 'guru_bk' as UserRole, title: '4. Guru BK', desc: 'Akses eksklusif Vault BK Rahasia', active: role === 'guru_bk' },
                { role: 'kesiswaan' as UserRole, title: '5. Tim Kesiswaan', desc: 'Mengelola pelanggaran, poin & pembinaan', active: role === 'kesiswaan' },
                { role: 'waka_kesiswaan' as UserRole, title: '6. Waka Kesiswaan', desc: 'Rekapitulasi manajerial tanpa catatan rahasia', active: role === 'waka_kesiswaan' },
                { role: 'kepala_sekolah' as UserRole, title: '7. Kepala Sekolah', desc: 'Laporan strategis sekolah', active: role === 'kepala_sekolah' },
                { role: 'admin' as UserRole, title: '8. Administrator', desc: 'Master data, users & audit logs', active: role === 'admin' },
              ].map(item => (
                <button
                  key={item.role}
                  onClick={() => handleRoleSwitch(item.role)}
                  className={`w-full p-3 rounded-lg border text-left flex items-center justify-between transition-colors ${
                    item.active
                      ? 'border-blue-600 bg-blue-50/70'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{item.title}</span>
                    <span className="text-[11px] text-slate-500">{item.desc}</span>
                  </div>
                  {item.active ? (
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>

            <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setRoleSwitcherOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
