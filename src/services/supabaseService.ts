import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import {
  Profile,
  Role,
  Guru,
  KompetensiKeahlian,
  TahunPelajaran,
  Kelas,
  Siswa,
  PenugasanGuru,
  MasterPoinTatib,
  JurnalGuruWali,
  JurnalWaliKelas,
  JurnalKKK,
  JurnalBK,
  KonselingRestricted,
  AsesmenBKRestricted,
  RujukanBK,
  Pelanggaran,
  PembinaanKesiswaan,
  Keterlambatan,
  Ketidakhadiran,
  KoordinasiSiswa,
  PenugasanTindakLanjut,
  RiwayatStatusKasus,
  PrestasiSiswa,
  KegiatanOSIS,
  KegiatanEkstrakurikuler,
  AuditLog,
  Notification,
  UserRole,
  FasePenangananTatib,
  PenghargaanSkorTatib,
  AcuanSkorBawaan,
  SchoolProfile
} from '../types/database';

import {
  SEED_ROLES,
  SEED_KOMPETENSI,
  SEED_TAHUN_PELAJARAN,
  SEED_GURU,
  SEED_KELAS,
  SEED_SISWA,
  SEED_PENUGASAN,
  SEED_PROFILES,
  SEED_MASTER_TATIB,
  SEED_FASE_PENANGANAN_TATIB,
  SEED_PENGHARGAAN_TATIB,
  SEED_CARRY_OVER_TATIB,
  SEED_JURNAL_GURU_WALI,
  SEED_JURNAL_WALI_KELAS,
  SEED_JURNAL_KKK,
  SEED_JURNAL_BK,
  SEED_KONSELING_RESTRICTED,
  SEED_ASESMEN_BK_RESTRICTED,
  SEED_RUJUKAN_BK,
  SEED_PELANGGARAN,
  SEED_PEMBINAAN,
  SEED_KETERLAMBATAN,
  SEED_KETIDAKHADIRAN,
  SEED_KOORDINASI,
  SEED_TINDAK_LANJUT,
  SEED_RIWAYAT_STATUS,
  SEED_PRESTASI,
  SEED_KEGIATAN_OSIS,
  SEED_EKSTRAKURIKULER,
  SEED_AUDIT_LOGS,
  SEED_NOTIFIKASI
} from '../data/seedData';

const STORAGE_KEY_PREFIX = 'simpel_smesa_';

function getStoredItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error('Error reading from localStorage', e);
    return defaultValue;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Error writing to localStorage', e);
  }
}

export const DEFAULT_SCHOOL_PROFILE: SchoolProfile = {
  nama_sekolah: 'SMK Negeri 1 Jember',
  nama_aplikasi: 'SIMPEL SMESA',
  npsn: '20523850',
  instansi_induk: 'Pemerintah Provinsi Jawa Timur · Dinas Pendidikan',
  alamat: 'Jalan Jambu Nomor 17',
  kota: 'Jember',
  provinsi: 'Jawa Timur',
  kode_pos: '68111',
  telepon: '(0331) 429690',
  email: 'info@smkn1jember.sch.id',
  website: 'https://smkn1jember.sch.id',
  logo_url: '/logo-smkn1-jember.png',
  kepala_sekolah_nama: 'SRI HARTATIK, M.Pd.',
  kepala_sekolah_nip: '196809102000122003',
  kepala_sekolah_pangkat: 'Pembina Utama Muda / IVc',
  waka_kesiswaan_nama: 'Rina Puspitasari, S.Pd., M.M.',
  waka_kesiswaan_nip: '197408221999032001',
  waka_kesiswaan_pangkat: 'Pembina / IVa',
  updated_at: new Date().toISOString()
};

type SyncCollectionKey =
  | 'profil_sekolah'
  | 'roles'
  | 'profiles'
  | 'guru'
  | 'kompetensi'
  | 'tahun_pelajaran'
  | 'kelas'
  | 'siswa'
  | 'penugasan'
  | 'master_tatib_baku'
  | 'jurnal_gw'
  | 'jurnal_wk'
  | 'jurnal_kkk'
  | 'jurnal_bk'
  | 'rujukan_bk'
  | 'pelanggaran'
  | 'pembinaan'
  | 'keterlambatan'
  | 'ketidakhadiran'
  | 'koordinasi'
  | 'tindak_lanjut'
  | 'riwayat_status'
  | 'prestasi'
  | 'osis'
  | 'ekskul'
  | 'audit_logs'
  | 'notifications';

const ALL_SYNC_KEYS: SyncCollectionKey[] = [
  'profil_sekolah',
  'roles',
  'profiles',
  'guru',
  'kompetensi',
  'tahun_pelajaran',
  'kelas',
  'siswa',
  'penugasan',
  'master_tatib_baku',
  'jurnal_gw',
  'jurnal_wk',
  'jurnal_kkk',
  'jurnal_bk',
  'rujukan_bk',
  'pelanggaran',
  'pembinaan',
  'keterlambatan',
  'ketidakhadiran',
  'koordinasi',
  'tindak_lanjut',
  'riwayat_status',
  'prestasi',
  'osis',
  'ekskul',
  'audit_logs',
  'notifications'
];

class SimpelSmesaService {
  private supabase: SupabaseClient | null = null;
  private realtimeChannel: RealtimeChannel | null = null;
  private listeners: Set<() => void> = new Set();
  private clientInstanceId: string = 'client-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);
  private syncTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private pendingSyncKeys: Set<SyncCollectionKey> = new Set();

  public supabaseUrl: string = '';
  public supabaseAnonKey: string = '';
  public isConnectedToSupabase: boolean = false;
  public autoSyncEnabled: boolean = true;
  public syncState: 'idle' | 'syncing' | 'synced' | 'offline' | 'error' = 'idle';
  public lastSyncedAt: string | null = null;
  public lastSyncError: string | null = null;
  public isRealtimeSubscribed: boolean = false;

  // Active state
  public schoolProfile: SchoolProfile;
  public currentUser: Profile;
  public roles: Role[];
  public profiles: Profile[];
  public guruList: Guru[];
  public kompetensiList: KompetensiKeahlian[];
  public tahunPelajaranList: TahunPelajaran[];
  public kelasList: Kelas[];
  public siswaList: Siswa[];
  public penugasanList: PenugasanGuru[];
  public masterTatibList: MasterPoinTatib[];
  public fasePenangananList: FasePenangananTatib[] = SEED_FASE_PENANGANAN_TATIB;
  public penghargaanTatibList: PenghargaanSkorTatib[] = SEED_PENGHARGAAN_TATIB;
  public carryOverTatibList: AcuanSkorBawaan[] = SEED_CARRY_OVER_TATIB;

  public jurnalGuruWaliList: JurnalGuruWali[];
  public jurnalWaliKelasList: JurnalWaliKelas[];
  public jurnalKKKList: JurnalKKK[];
  public jurnalBKList: JurnalBK[];
  private konselingRestrictedList: KonselingRestricted[];
  private asesmenRestrictedList: AsesmenBKRestricted[];
  public rujukanBKList: RujukanBK[];

  public pelanggaranList: Pelanggaran[];
  public pembinaanList: PembinaanKesiswaan[];
  public keterlambatanList: Keterlambatan[];
  public ketidakhadiranList: Ketidakhadiran[];

  public koordinasiList: KoordinasiSiswa[];
  public tindakLanjutList: PenugasanTindakLanjut[];
  public riwayatStatusList: RiwayatStatusKasus[];

  public prestasiList: PrestasiSiswa[];
  public kegiatanOSISList: KegiatanOSIS[];
  public kegiatanEkskulList: KegiatanEkstrakurikuler[];

  public auditLogs: AuditLog[];
  public notifications: Notification[];

  constructor() {
    // Load config (prioritize saved localStorage config, fallback to Vite environment variables)
    const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
    const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
    this.supabaseUrl = getStoredItem<string>('sb_url', '') || (envUrl.includes('YOUR_PROJECT_REF') ? '' : envUrl);
    this.supabaseAnonKey = getStoredItem<string>('sb_key', '') || (envKey.includes('YOUR_SUPABASE_ANON') ? '' : envKey);
    this.autoSyncEnabled = getStoredItem<boolean>('sb_auto_sync', true);
    this.lastSyncedAt = getStoredItem<string | null>('sb_last_synced', null);

    // Initialize databases from storage or seeds FIRST before starting cloud sync
    const savedSchool = getStoredItem<Partial<SchoolProfile> | null>('profil_sekolah', null);
    this.schoolProfile = { ...DEFAULT_SCHOOL_PROFILE, ...(savedSchool || {}) };
    this.roles = getStoredItem<Role[]>('roles', SEED_ROLES);
    this.profiles = getStoredItem<Profile[]>('profiles', SEED_PROFILES);
    this.guruList = getStoredItem<Guru[]>('guru', SEED_GURU);
    this.kompetensiList = getStoredItem<KompetensiKeahlian[]>('kompetensi', SEED_KOMPETENSI);
    this.tahunPelajaranList = getStoredItem<TahunPelajaran[]>('tahun_pelajaran', SEED_TAHUN_PELAJARAN);
    this.kelasList = getStoredItem<Kelas[]>('kelas', SEED_KELAS);
    this.siswaList = getStoredItem<Siswa[]>('siswa', SEED_SISWA);
    this.penugasanList = getStoredItem<PenugasanGuru[]>('penugasan', SEED_PENUGASAN);
    
    // Always prioritize the official baku 62 tata tertib rules from SK Kepala Sekolah SMKN 1 Jember
    const storedTatib = getStoredItem<MasterPoinTatib[]>('master_tatib_baku', null as any);
    this.masterTatibList = (storedTatib && Array.isArray(storedTatib) && storedTatib.length >= 50) ? storedTatib : SEED_MASTER_TATIB;
    setStoredItem('master_tatib_baku', this.masterTatibList);

    this.jurnalGuruWaliList = getStoredItem<JurnalGuruWali[]>('jurnal_gw', SEED_JURNAL_GURU_WALI);
    this.jurnalWaliKelasList = getStoredItem<JurnalWaliKelas[]>('jurnal_wk', SEED_JURNAL_WALI_KELAS);
    this.jurnalKKKList = getStoredItem<JurnalKKK[]>('jurnal_kkk', SEED_JURNAL_KKK);
    this.jurnalBKList = getStoredItem<JurnalBK[]>('jurnal_bk', SEED_JURNAL_BK);
    this.konselingRestrictedList = getStoredItem<KonselingRestricted[]>('konseling_restricted', SEED_KONSELING_RESTRICTED);
    this.asesmenRestrictedList = getStoredItem<AsesmenBKRestricted[]>('asesmen_restricted', SEED_ASESMEN_BK_RESTRICTED);
    this.rujukanBKList = getStoredItem<RujukanBK[]>('rujukan_bk', SEED_RUJUKAN_BK);

    this.pelanggaranList = getStoredItem<Pelanggaran[]>('pelanggaran', SEED_PELANGGARAN);
    this.pembinaanList = getStoredItem<PembinaanKesiswaan[]>('pembinaan', SEED_PEMBINAAN);
    this.keterlambatanList = getStoredItem<Keterlambatan[]>('keterlambatan', SEED_KETERLAMBATAN);
    this.ketidakhadiranList = getStoredItem<Ketidakhadiran[]>('ketidakhadiran', SEED_KETIDAKHADIRAN);

    this.koordinasiList = getStoredItem<KoordinasiSiswa[]>('koordinasi', SEED_KOORDINASI);
    this.tindakLanjutList = getStoredItem<PenugasanTindakLanjut[]>('tindak_lanjut', SEED_TINDAK_LANJUT);
    this.riwayatStatusList = getStoredItem<RiwayatStatusKasus[]>('riwayat_status', SEED_RIWAYAT_STATUS);

    this.prestasiList = getStoredItem<PrestasiSiswa[]>('prestasi', SEED_PRESTASI);
    this.kegiatanOSISList = getStoredItem<KegiatanOSIS[]>('osis', SEED_KEGIATAN_OSIS);
    this.kegiatanEkskulList = getStoredItem<KegiatanEkstrakurikuler[]>('ekskul', SEED_EKSTRAKURIKULER);

    this.auditLogs = getStoredItem<AuditLog[]>('audit_logs', SEED_AUDIT_LOGS);
    this.notifications = getStoredItem<Notification[]>('notifications', SEED_NOTIFIKASI);

    // Default current user: Guru Wali Ahmad Fauzan for rich showcase, or Admin
    const savedUserId = getStoredItem<string>('current_user_id', 'user-guru-wali');
    const foundUser = this.profiles.find(p => p.id === savedUserId);
    this.currentUser = foundUser || this.profiles[3]; // user-guru-wali

    // Browser network & tab-focus auto-sync listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        if (this.isConnectedToSupabase && this.autoSyncEnabled) {
          this.flushPendingSyncQueue();
          this.pullAllFromSupabase(true);
        }
      });
      window.addEventListener('offline', () => {
        if (this.isConnectedToSupabase) {
          this.syncState = 'offline';
          this.notifyListeners();
        }
      });
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && this.isConnectedToSupabase && this.autoSyncEnabled) {
          this.pullAllFromSupabase(true);
        }
      });
    }

    // Activate Supabase & Auto-Sync automatically if credentials exist
    if (this.supabaseUrl && this.supabaseAnonKey) {
      this.initSupabaseClient(this.supabaseUrl, this.supabaseAnonKey);
    }
  }

  public initSupabaseClient(url: string, key: string): boolean {
    try {
      const cleanUrl = url.trim().replace(/\/+$/, '');
      const cleanKey = key.trim();
      if (cleanUrl && cleanKey && /^https:\/\/.+\.supabase\.(co|in|net)$/i.test(cleanUrl)) {
        this.stopRealtimeSync();
        this.supabase = createClient(cleanUrl, cleanKey);
        this.supabaseUrl = cleanUrl;
        this.supabaseAnonKey = cleanKey;
        setStoredItem('sb_url', cleanUrl);
        setStoredItem('sb_key', cleanKey);
        this.isConnectedToSupabase = true;
        this.lastSyncError = null;
        this.notifyListeners();

        if (this.autoSyncEnabled) {
          this.startRealtimeSync();
          void this.pullAllFromSupabase(true);
        }
        return true;
      }
    } catch (e) {
      console.error('Failed to init Supabase client', e);
    }
    this.isConnectedToSupabase = false;
    return false;
  }

  public setAutoSyncEnabled(enabled: boolean): void {
    this.autoSyncEnabled = enabled;
    setStoredItem('sb_auto_sync', enabled);
    if (this.isConnectedToSupabase) {
      if (enabled) {
        this.startRealtimeSync();
        void this.flushPendingSyncQueue();
        void this.pullAllFromSupabase(true);
      } else {
        this.stopRealtimeSync();
        this.syncState = 'idle';
      }
    }
    this.notifyListeners();
  }

  public disconnectSupabase(): void {
    this.stopRealtimeSync();
    this.syncTimers.forEach(t => clearTimeout(t));
    this.syncTimers.clear();
    this.pendingSyncKeys.clear();
    this.supabase = null;
    this.supabaseUrl = '';
    this.supabaseAnonKey = '';
    this.isConnectedToSupabase = false;
    this.syncState = 'idle';
    this.lastSyncError = null;
    try {
      localStorage.removeItem(STORAGE_KEY_PREFIX + 'sb_url');
      localStorage.removeItem(STORAGE_KEY_PREFIX + 'sb_key');
    } catch (e) {
      console.error('Error clearing Supabase credentials', e);
    }
    this.notifyListeners();
  }

  public async testSupabaseConnection(
    urlInput?: string,
    keyInput?: string
  ): Promise<{
    ok: boolean;
    stage: 'connected' | 'missing_sync_table' | 'missing_tables' | 'invalid_credentials' | 'network_error';
    message: string;
    rolesCount?: number;
    syncReady?: boolean;
  }> {
    const targetUrl = (urlInput ?? this.supabaseUrl).trim().replace(/\/+$/, '');
    const targetKey = (keyInput ?? this.supabaseAnonKey).trim();

    if (!targetUrl || !targetKey) {
      return {
        ok: false,
        stage: 'invalid_credentials',
        message: 'Project URL dan Anon Public Key harus diisi terlebih dahulu.'
      };
    }

    if (!/^https:\/\/.+\.supabase\.(co|in|net)$/i.test(targetUrl)) {
      return {
        ok: false,
        stage: 'invalid_credentials',
        message: 'Format Project URL tidak valid. Contoh yang benar: https://abcdefghijk.supabase.co'
      };
    }

    try {
      const client = createClient(targetUrl, targetKey);
      const { data, error } = await client.from('roles').select('kode, nama');

      if (!error) {
        // Also check Migration 028 auto-sync table
        const syncCheck = await client.from('simpel_sync_collections').select('collection_key').limit(1);
        if (syncCheck.error) {
          return {
            ok: false,
            stage: 'missing_sync_table',
            rolesCount: data?.length ?? 0,
            syncReady: false,
            message: `Tabel public.roles terdeteksi (${data?.length ?? 0} role), tetapi tabel Auto-Sync Online (028) belum terpasang. Jalankan ulang Script SQL 001–028 di Supabase SQL Editor agar Auto-Sinkronisasi Realtime aktif.`
          };
        }

        return {
          ok: true,
          stage: 'connected',
          rolesCount: data?.length ?? 0,
          syncReady: true,
          message: `Terkoneksi penuh ke Supabase PostgreSQL! Tabel public.roles (${data?.length ?? 0} role) & Engine Auto-Sync Realtime (028) siap digunakan.`
        };
      }

      const errMsg = (error.message || '').toLowerCase();
      const errCode = (error as any).code || '';

      if (errCode === '42P01' || errCode === 'PGRST205' || errMsg.includes('does not exist') || errMsg.includes('schema cache')) {
        return {
          ok: false,
          stage: 'missing_tables',
          message: 'Koneksi ke Project Supabase BERHASIL, namun tabel belum dibuat. Jalankan Script SQL Migrasi 001–028 di Supabase SQL Editor terlebih dahulu.'
        };
      }

      if (errMsg.includes('jwt') || errMsg.includes('api key') || errMsg.includes('unauthorized') || errCode === '401') {
        return {
          ok: false,
          stage: 'invalid_credentials',
          message: 'Anon / Public Key ditolak oleh Supabase. Periksa kembali API Key di menu Project Settings → API.'
        };
      }

      return {
        ok: false,
        stage: 'network_error',
        message: `Supabase merespons dengan error: ${error.message}`
      };
    } catch (err: any) {
      return {
        ok: false,
        stage: 'network_error',
        message: `Gagal menjangkau server Supabase (${err?.message || 'Network error'}). Pastikan Project URL benar dan proyek Supabase tidak sedang di-pause.`
      };
    }
  }

  // --------------------------------------------------------------------------
  // AUTO-SYNC ENGINE & SUPABASE REALTIME MULTI-DEVICE
  // --------------------------------------------------------------------------
  private getCollectionData(key: SyncCollectionKey): unknown {
    switch (key) {
      case 'profil_sekolah': return this.schoolProfile;
      case 'roles': return this.roles;
      case 'profiles': return this.profiles;
      case 'guru': return this.guruList;
      case 'kompetensi': return this.kompetensiList;
      case 'tahun_pelajaran': return this.tahunPelajaranList;
      case 'kelas': return this.kelasList;
      case 'siswa': return this.siswaList;
      case 'penugasan': return this.penugasanList;
      case 'master_tatib_baku': return this.masterTatibList;
      case 'jurnal_gw': return this.jurnalGuruWaliList;
      case 'jurnal_wk': return this.jurnalWaliKelasList;
      case 'jurnal_kkk': return this.jurnalKKKList;
      case 'jurnal_bk': return this.jurnalBKList;
      case 'rujukan_bk': return this.rujukanBKList;
      case 'pelanggaran': return this.pelanggaranList;
      case 'pembinaan': return this.pembinaanList;
      case 'keterlambatan': return this.keterlambatanList;
      case 'ketidakhadiran': return this.ketidakhadiranList;
      case 'koordinasi': return this.koordinasiList;
      case 'tindak_lanjut': return this.tindakLanjutList;
      case 'riwayat_status': return this.riwayatStatusList;
      case 'prestasi': return this.prestasiList;
      case 'osis': return this.kegiatanOSISList;
      case 'ekskul': return this.kegiatanEkskulList;
      case 'audit_logs': return this.auditLogs;
      case 'notifications': return this.notifications;
    }
  }

  private applyRemoteCollection(key: SyncCollectionKey, payload: unknown): boolean {
    if (key === 'profil_sekolah') {
      if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
        this.schoolProfile = { ...DEFAULT_SCHOOL_PROFILE, ...(payload as Partial<SchoolProfile>) };
        setStoredItem(key, this.schoolProfile);
        return true;
      }
      return false;
    }
    if (!Array.isArray(payload)) return false;
    switch (key) {
      case 'roles': this.roles = payload as Role[]; break;
      case 'profiles': this.profiles = payload as Profile[]; break;
      case 'guru': this.guruList = payload as Guru[]; break;
      case 'kompetensi': this.kompetensiList = payload as KompetensiKeahlian[]; break;
      case 'tahun_pelajaran': this.tahunPelajaranList = payload as TahunPelajaran[]; break;
      case 'kelas': this.kelasList = payload as Kelas[]; break;
      case 'siswa': this.siswaList = payload as Siswa[]; break;
      case 'penugasan': this.penugasanList = payload as PenugasanGuru[]; break;
      case 'master_tatib_baku':
        if (payload.length >= 50) this.masterTatibList = payload as MasterPoinTatib[];
        break;
      case 'jurnal_gw': this.jurnalGuruWaliList = payload as JurnalGuruWali[]; break;
      case 'jurnal_wk': this.jurnalWaliKelasList = payload as JurnalWaliKelas[]; break;
      case 'jurnal_kkk': this.jurnalKKKList = payload as JurnalKKK[]; break;
      case 'jurnal_bk': this.jurnalBKList = payload as JurnalBK[]; break;
      case 'rujukan_bk': this.rujukanBKList = payload as RujukanBK[]; break;
      case 'pelanggaran': this.pelanggaranList = payload as Pelanggaran[]; break;
      case 'pembinaan': this.pembinaanList = payload as PembinaanKesiswaan[]; break;
      case 'keterlambatan': this.keterlambatanList = payload as Keterlambatan[]; break;
      case 'ketidakhadiran': this.ketidakhadiranList = payload as Ketidakhadiran[]; break;
      case 'koordinasi': this.koordinasiList = payload as KoordinasiSiswa[]; break;
      case 'tindak_lanjut': this.tindakLanjutList = payload as PenugasanTindakLanjut[]; break;
      case 'riwayat_status': this.riwayatStatusList = payload as RiwayatStatusKasus[]; break;
      case 'prestasi': this.prestasiList = payload as PrestasiSiswa[]; break;
      case 'osis': this.kegiatanOSISList = payload as KegiatanOSIS[]; break;
      case 'ekskul': this.kegiatanEkskulList = payload as KegiatanEkstrakurikuler[]; break;
      case 'audit_logs': this.auditLogs = payload as AuditLog[]; break;
      case 'notifications': this.notifications = payload as Notification[]; break;
      default: return false;
    }
    setStoredItem(key, payload);
    return true;
  }

  public updateSchoolProfile(updates: Partial<SchoolProfile>): SchoolProfile {
    this.schoolProfile = {
      ...this.schoolProfile,
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.persist('profil_sekolah', this.schoolProfile);
    this.logAudit(
      'UPDATE',
      'profil_sekolah',
      null,
      `Profil sekolah diperbarui (${this.schoolProfile.nama_sekolah} · Kepsek: ${this.schoolProfile.kepala_sekolah_nama} · Waka Kesiswaan: ${this.schoolProfile.waka_kesiswaan_nama})`
    );
    return this.schoolProfile;
  }

  public resetSchoolProfile(): SchoolProfile {
    this.schoolProfile = { ...DEFAULT_SCHOOL_PROFILE, updated_at: new Date().toISOString() };
    this.persist('profil_sekolah', this.schoolProfile);
    this.logAudit('UPDATE', 'profil_sekolah', null, 'Profil sekolah dikembalikan ke pengaturan default SMK Negeri 1 Jember');
    return this.schoolProfile;
  }

  private startRealtimeSync(): void {
    if (!this.supabase || !this.isConnectedToSupabase || !this.autoSyncEnabled) return;
    this.stopRealtimeSync();

    this.realtimeChannel = this.supabase
      .channel('simpel-smesa-online-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'simpel_sync_collections' },
        (payload: any) => {
          const record = payload?.new;
          if (!record || !record.collection_key) return;
          // Ignore echo from our own browser instance
          if (record.client_id === this.clientInstanceId) return;

          const key = record.collection_key as SyncCollectionKey;
          if (ALL_SYNC_KEYS.includes(key) && record.payload) {
            const applied = this.applyRemoteCollection(key, record.payload);
            if (applied) {
              this.lastSyncedAt = record.updated_at || new Date().toISOString();
              setStoredItem('sb_last_synced', this.lastSyncedAt);
              this.syncState = 'synced';
              this.notifyListeners();
            }
          }
        }
      )
      .subscribe((status: string) => {
        this.isRealtimeSubscribed = status === 'SUBSCRIBED';
        this.notifyListeners();
      });
  }

  private stopRealtimeSync(): void {
    if (this.realtimeChannel && this.supabase) {
      try {
        void this.supabase.removeChannel(this.realtimeChannel);
      } catch (e) {
        console.error('Error removing realtime channel', e);
      }
    }
    this.realtimeChannel = null;
    this.isRealtimeSubscribed = false;
  }

  private scheduleAutoSync(key: string): void {
    if (!this.isConnectedToSupabase || !this.autoSyncEnabled) return;
    if (!ALL_SYNC_KEYS.includes(key as SyncCollectionKey)) return;

    const syncKey = key as SyncCollectionKey;
    this.pendingSyncKeys.add(syncKey);

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.syncState = 'offline';
      this.notifyListeners();
      return;
    }

    const prevTimer = this.syncTimers.get(syncKey);
    if (prevTimer) clearTimeout(prevTimer);

    const timer = setTimeout(() => {
      this.syncTimers.delete(syncKey);
      void this.pushCollectionToSupabase(syncKey);
    }, 250);
    this.syncTimers.set(syncKey, timer);
  }

  private async pushCollectionToSupabase(key: SyncCollectionKey): Promise<boolean> {
    if (!this.supabase || !this.isConnectedToSupabase) return false;

    this.syncState = 'syncing';
    this.notifyListeners();

    try {
      const payload = this.getCollectionData(key);
      const now = new Date().toISOString();
      const { error } = await this.supabase.from('simpel_sync_collections').upsert(
        {
          collection_key: key,
          payload,
          client_id: this.clientInstanceId,
          updated_by: this.currentUser?.nama_lengkap || 'System',
          updated_at: now
        },
        { onConflict: 'collection_key' }
      );

      if (error) {
        this.syncState = 'error';
        this.lastSyncError = error.message;
        this.notifyListeners();
        return false;
      }

      // Mirror relational master tables in background so Supabase Table Editor stays up-to-date
      if (['kompetensi', 'guru', 'kelas', 'siswa', 'tahun_pelajaran', 'master_tatib_baku'].includes(key)) {
        void this.syncRelationalMasterTablesToSupabase();
      }

      this.pendingSyncKeys.delete(key);
      this.lastSyncedAt = now;
      setStoredItem('sb_last_synced', now);
      this.lastSyncError = null;
      this.syncState = this.pendingSyncKeys.size === 0 ? 'synced' : 'syncing';
      this.notifyListeners();
      return true;
    } catch (err: any) {
      this.syncState = typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'error';
      this.lastSyncError = err?.message || 'Gagal sinkronisasi ke Supabase';
      this.notifyListeners();
      return false;
    }
  }

  public async flushPendingSyncQueue(): Promise<void> {
    if (!this.supabase || !this.isConnectedToSupabase || this.pendingSyncKeys.size === 0) return;
    const keys = Array.from(this.pendingSyncKeys);
    for (const k of keys) {
      await this.pushCollectionToSupabase(k);
    }
  }

  public async pullAllFromSupabase(autoPushIfEmpty: boolean = false): Promise<{
    ok: boolean;
    updatedCollections: number;
    message: string;
  }> {
    if (!this.supabase || !this.isConnectedToSupabase) {
      return { ok: false, updatedCollections: 0, message: 'Supabase belum terhubung.' };
    }

    this.syncState = 'syncing';
    this.notifyListeners();

    try {
      const { data, error } = await this.supabase
        .from('simpel_sync_collections')
        .select('collection_key, payload, updated_at');

      if (error) {
        this.syncState = 'error';
        this.lastSyncError = error.message;
        this.notifyListeners();
        return {
          ok: false,
          updatedCollections: 0,
          message: `Gagal menarik data dari Supabase: ${error.message}`
        };
      }

      // First-time empty cloud database: seed cloud with current local data automatically
      if (!data || data.length === 0) {
        if (autoPushIfEmpty) {
          const pushRes = await this.pushAllToSupabase();
          return {
            ok: pushRes.ok,
            updatedCollections: pushRes.syncedCollections,
            message: pushRes.ok
              ? `Database cloud masih kosong — ${pushRes.syncedCollections} koleksi data awal otomatis diunggah ke Supabase.`
              : pushRes.message
          };
        }
        this.syncState = 'synced';
        this.notifyListeners();
        return {
          ok: true,
          updatedCollections: 0,
          message: 'Database Supabase masih kosong. Klik "Kirim Semua ke Supabase" untuk mengunggah data awal.'
        };
      }

      let updatedCount = 0;
      for (const row of data) {
        const key = row.collection_key as SyncCollectionKey;
        if (ALL_SYNC_KEYS.includes(key) && row.payload != null) {
          if (this.applyRemoteCollection(key, row.payload)) {
            updatedCount++;
          }
        }
      }

      // Refresh currentUser reference from synced profiles if available
      const savedUserId = getStoredItem<string>('current_user_id', this.currentUser?.id || 'user-guru-wali');
      const matchedProfile = this.profiles.find(p => p.id === savedUserId);
      if (matchedProfile) {
        this.currentUser = matchedProfile;
      }

      this.lastSyncedAt = new Date().toISOString();
      setStoredItem('sb_last_synced', this.lastSyncedAt);
      this.lastSyncError = null;
      this.syncState = 'synced';
      this.notifyListeners();

      return {
        ok: true,
        updatedCollections: updatedCount,
        message: `Berhasil menarik & memperbarui ${updatedCount} koleksi data terbaru secara online dari Supabase.`
      };
    } catch (err: any) {
      this.syncState = 'error';
      this.lastSyncError = err?.message || 'Gagal menghubungi server Supabase';
      this.notifyListeners();
      return {
        ok: false,
        updatedCollections: 0,
        message: this.lastSyncError || 'Gagal menghubungi Supabase.'
      };
    }
  }

  public async pushAllToSupabase(): Promise<{
    ok: boolean;
    syncedCollections: number;
    relationalSynced: boolean;
    message: string;
  }> {
    if (!this.supabase || !this.isConnectedToSupabase) {
      return { ok: false, syncedCollections: 0, relationalSynced: false, message: 'Supabase belum terhubung.' };
    }

    this.syncState = 'syncing';
    this.notifyListeners();

    try {
      const now = new Date().toISOString();
      const rows = ALL_SYNC_KEYS.map(key => ({
        collection_key: key,
        payload: this.getCollectionData(key),
        client_id: this.clientInstanceId,
        updated_by: this.currentUser?.nama_lengkap || 'System',
        updated_at: now
      }));

      const { error } = await this.supabase
        .from('simpel_sync_collections')
        .upsert(rows, { onConflict: 'collection_key' });

      if (error) {
        this.syncState = 'error';
        this.lastSyncError = error.message;
        this.notifyListeners();
        return {
          ok: false,
          syncedCollections: 0,
          relationalSynced: false,
          message: `Gagal mengunggah ke Supabase: ${error.message}`
        };
      }

      const relSync = await this.syncRelationalMasterTablesToSupabase();

      this.pendingSyncKeys.clear();
      this.lastSyncedAt = now;
      setStoredItem('sb_last_synced', now);
      this.lastSyncError = null;
      this.syncState = 'synced';
      this.notifyListeners();

      return {
        ok: true,
        syncedCollections: rows.length,
        relationalSynced: relSync.ok,
        message: relSync.ok
          ? `Berhasil menyinkronkan ${rows.length} koleksi data + seluruh tabel relasional Master (Guru, Kompetensi, Kelas, Siswa, 62 Tatib Baku) ke Supabase Cloud.`
          : `Berhasil menyinkronkan ${rows.length} koleksi online ke Supabase (catatan tabel relasional: ${relSync.error}).`
      };
    } catch (err: any) {
      this.syncState = 'error';
      this.lastSyncError = err?.message || 'Network error saat sinkronisasi';
      this.notifyListeners();
      return {
        ok: false,
        syncedCollections: 0,
        relationalSynced: false,
        message: this.lastSyncError || 'Gagal sinkronisasi ke Supabase.'
      };
    }
  }

  // Mirror normalized relational master tables in dependency order resolving real Supabase UUIDs
  public async syncRelationalMasterTablesToSupabase(): Promise<{ ok: boolean; error?: string }> {
    if (!this.supabase || !this.isConnectedToSupabase) return { ok: false, error: 'Tidak terhubung' };

    try {
      // 1. Tahun Pelajaran
      if (this.tahunPelajaranList.length > 0) {
        const tpPayload = this.tahunPelajaranList.map(tp => ({
          nama: tp.nama,
          tanggal_mulai: tp.tanggal_mulai,
          tanggal_selesai: tp.tanggal_selesai,
          semester_aktif: tp.semester_aktif,
          aktif: tp.aktif
        }));
        await this.supabase.from('tahun_pelajaran').upsert(tpPayload, { onConflict: 'nama' });
      }
      const { data: sbTp } = await this.supabase.from('tahun_pelajaran').select('id, nama');
      const tpUuidByLocalId = new Map<string, string>();
      this.tahunPelajaranList.forEach(local => {
        const found = sbTp?.find(r => r.nama === local.nama);
        if (found) tpUuidByLocalId.set(local.id, found.id);
      });
      const fallbackTpUuid = sbTp?.[0]?.id;

      // 2. Kompetensi Keahlian
      if (this.kompetensiList.length > 0) {
        const kkPayload = this.kompetensiList.map(kk => ({
          kode: kk.kode,
          nama: kk.nama,
          aktif: kk.aktif
        }));
        await this.supabase.from('kompetensi_keahlian').upsert(kkPayload, { onConflict: 'kode' });
      }
      const { data: sbKK } = await this.supabase.from('kompetensi_keahlian').select('id, kode');
      const kkUuidByLocalId = new Map<string, string>();
      this.kompetensiList.forEach(local => {
        const found = sbKK?.find(r => r.kode === local.kode);
        if (found) kkUuidByLocalId.set(local.id, found.id);
      });
      const fallbackKkUuid = sbKK?.[0]?.id;

      // 3. Guru
      if (this.guruList.length > 0) {
        const guruPayload = this.guruList.map(g => ({
          nip: g.nip,
          nama_lengkap: g.nama_lengkap,
          email: g.email,
          no_hp: g.no_hp || null,
          jabatan: g.jabatan,
          status_aktif: g.status_aktif
        }));
        await this.supabase.from('guru').upsert(guruPayload, { onConflict: 'nip' });
      }
      const { data: sbGuru } = await this.supabase.from('guru').select('id, nip');
      const guruUuidByLocalId = new Map<string, string>();
      this.guruList.forEach(local => {
        const found = sbGuru?.find(r => r.nip === local.nip);
        if (found) guruUuidByLocalId.set(local.id, found.id);
      });
      const fallbackGuruUuid = sbGuru?.[0]?.id;

      // 4. Kelas (needs kompetensi_keahlian_id, tahun_pelajaran_id, wali_kelas_id UUIDs)
      if (this.kelasList.length > 0 && fallbackKkUuid && fallbackTpUuid && fallbackGuruUuid) {
        const kelasPayload = this.kelasList.map(k => ({
          nama_kelas: k.nama_kelas,
          tingkat: k.tingkat,
          kompetensi_keahlian_id: kkUuidByLocalId.get(k.kompetensi_keahlian_id) || fallbackKkUuid,
          tahun_pelajaran_id: tpUuidByLocalId.get(k.tahun_pelajaran_id) || fallbackTpUuid,
          wali_kelas_id: guruUuidByLocalId.get(k.wali_kelas_id) || fallbackGuruUuid,
          aktif: k.aktif
        }));
        await this.supabase.from('kelas').upsert(kelasPayload, { onConflict: 'nama_kelas' });
      }
      const { data: sbKelas } = await this.supabase.from('kelas').select('id, nama_kelas');
      const kelasUuidByLocalId = new Map<string, string>();
      this.kelasList.forEach(local => {
        const found = sbKelas?.find(r => r.nama_kelas === local.nama_kelas);
        if (found) kelasUuidByLocalId.set(local.id, found.id);
      });
      const fallbackKelasUuid = sbKelas?.[0]?.id;

      // 5. Siswa (needs kelas_id, kompetensi_keahlian_id, tahun_pelajaran_id UUIDs)
      if (this.siswaList.length > 0 && fallbackKelasUuid && fallbackKkUuid && fallbackTpUuid) {
        const siswaPayload = this.siswaList.map(s => ({
          nis: s.nis,
          nisn: s.nisn || null,
          nama_lengkap: s.nama_lengkap,
          jenis_kelamin: s.jenis_kelamin,
          tanggal_lahir: s.tanggal_lahir || null,
          alamat: s.alamat || null,
          nama_orang_tua: s.nama_orang_tua || null,
          no_hp_orang_tua: s.no_hp_orang_tua || null,
          kelas_id: kelasUuidByLocalId.get(s.kelas_id) || fallbackKelasUuid,
          kompetensi_keahlian_id: kkUuidByLocalId.get(s.kompetensi_keahlian_id) || fallbackKkUuid,
          tahun_pelajaran_id: tpUuidByLocalId.get(s.tahun_pelajaran_id) || fallbackTpUuid,
          status: s.status
        }));
        await this.supabase.from('siswa').upsert(siswaPayload, { onConflict: 'nis' });
      }

      // 6. Master Poin Tatib Baku (62 aturan resmi)
      if (this.masterTatibList.length > 0) {
        const tatibPayload = this.masterTatibList.map(t => ({
          kode: t.kode,
          nomor_urut: t.nomor_urut ?? null,
          nama_pelanggaran: t.nama_pelanggaran,
          kategori: ['Perilaku', 'Kerajinan', 'Kerapian'].includes(t.kategori) ? t.kategori : 'Perilaku',
          poin: t.poin,
          deskripsi: t.deskripsi || null,
          aktif: t.aktif
        }));
        await this.supabase.from('master_poin_tatib').upsert(tatibPayload, { onConflict: 'kode' });
      }

      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err?.message || 'Gagal sinkronisasi tabel relasional' };
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(fn => fn());
  }

  private persist(key: string, data: unknown): void {
    setStoredItem(key, data);
    this.notifyListeners();
    this.scheduleAutoSync(key);
  }

  // --------------------------------------------------------------------------
  // AUTHENTICATION & ROLE SWITCHER
  // --------------------------------------------------------------------------
  public async login(email: string, _password?: string): Promise<{ success: boolean; message?: string }> {
    const user = this.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { success: false, message: 'Akun tidak ditemukan. Periksa email Anda.' };
    }
    if (!user.aktif) {
      return { success: false, message: 'Akun Anda belum aktif. Silakan hubungi Admin.' };
    }

    this.currentUser = user;
    setStoredItem('current_user_id', user.id);

    this.logAudit('LOGIN', 'auth.users', user.id, `User ${user.nama_lengkap} (${user.role_kode}) login ke SIMPEL SMESA`);
    this.notifyListeners();
    return { success: true };
  }

  public switchRole(roleKode: UserRole): void {
    const target = this.profiles.find(p => p.role_kode === roleKode && p.aktif);
    if (target) {
      this.currentUser = target;
      setStoredItem('current_user_id', target.id);
      this.logAudit('CHANGE_ROLE', 'profiles', target.id, `Beralih peran ke: ${target.role_kode} (${target.nama_lengkap})`);
      this.notifyListeners();
    }
  }

  public logout(): void {
    this.logAudit('LOGOUT', 'auth.users', this.currentUser.id, `User ${this.currentUser.nama_lengkap} logout`);
    // default to admin or first
    this.currentUser = this.profiles[0];
    setStoredItem('current_user_id', this.currentUser.id);
    this.notifyListeners();
  }

  // --------------------------------------------------------------------------
  // AUDIT LOG (IMMUTABLE APPEND-ONLY)
  // --------------------------------------------------------------------------
  public logAudit(action: AuditLog['action'], tableName: string, recordId: string | null, description: string): void {
    const log: AuditLog = {
      id: 'al-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      user_id: this.currentUser?.id || 'system',
      action,
      table_name: tableName,
      record_id: recordId,
      description,
      created_at: new Date().toISOString()
    };
    this.auditLogs.unshift(log);
    setStoredItem('audit_logs', this.auditLogs);
    this.scheduleAutoSync('audit_logs');
  }

  // --------------------------------------------------------------------------
  // ROW LEVEL SECURITY (RLS) EVALUATION ENGINE
  // --------------------------------------------------------------------------

  /**
   * Get students accessible by the current logged-in role according to RLS rules:
   * - guru_wali: only assigned students via penugasan_guru
   * - wali_kelas: only students whose kelas.wali_kelas_id = guru.id
   * - kkk: only students in assigned kompetensi_keahlian_id
   * - guru_bk: all active students (for counseling discovery)
   * - kesiswaan, waka_kesiswaan, kepala_sekolah, admin: all students
   */
  public getAccessibleSiswa(): Siswa[] {
    const role = this.currentUser.role_kode;
    const guruId = this.currentUser.guru_id;

    if (role === 'guru_wali') {
      const assignedSiswaIds = this.penugasanList
        .filter(p => p.guru_id === guruId && p.siswa_id && p.aktif)
        .map(p => p.siswa_id);
      return this.siswaList.filter(s => assignedSiswaIds.includes(s.id));
    }

    if (role === 'wali_kelas') {
      const assignedClassIds = this.kelasList
        .filter(k => k.wali_kelas_id === guruId && k.aktif)
        .map(k => k.id);
      return this.siswaList.filter(s => assignedClassIds.includes(s.kelas_id));
    }

    if (role === 'kkk') {
      const assignedKK = this.penugasanList
        .filter(p => p.guru_id === guruId && p.kompetensi_keahlian_id && p.aktif)
        .map(p => p.kompetensi_keahlian_id);
      return this.siswaList.filter(s => assignedKK.includes(s.kompetensi_keahlian_id));
    }

    // Other roles: guru_bk, kesiswaan, waka_kesiswaan, kepala_sekolah, admin
    return this.siswaList;
  }

  /**
   * STRICT SECURITY: ONLY GURU BK can access konseling_restricted & asesmen_bk_restricted.
   * All other roles (even Admin & Kepsek) receive 403 / Access Denied.
   */
  public getKonselingRestricted(siswaId?: string): { authorized: boolean; data: KonselingRestricted[]; message?: string } {
    if (this.currentUser.role_kode !== 'guru_bk') {
      this.logAudit('READ_RESTRICTED', 'konseling_restricted', null, `UNAUTHORIZED ATTEMPT to access BK restricted notes by ${this.currentUser.nama_lengkap} (${this.currentUser.role_kode})`);
      return {
        authorized: false,
        data: [],
        message: 'Akses Ditolak (403): Catatan konseling rahasia dilindungi kode etik dan HANYA dapat diakses oleh Guru BK berwenang.'
      };
    }

    this.logAudit('ACCESS_BK_RESTRICTED', 'konseling_restricted', siswaId || null, `Guru BK ${this.currentUser.nama_lengkap} mengakses catatan konseling rahasia`);
    const results = siswaId
      ? this.konselingRestrictedList.filter(k => k.siswa_id === siswaId)
      : this.konselingRestrictedList;
    return { authorized: true, data: results };
  }

  public getAsesmenRestricted(siswaId?: string): { authorized: boolean; data: AsesmenBKRestricted[]; message?: string } {
    if (this.currentUser.role_kode !== 'guru_bk') {
      this.logAudit('READ_RESTRICTED', 'asesmen_bk_restricted', null, `UNAUTHORIZED ATTEMPT to access BK assessment by ${this.currentUser.nama_lengkap} (${this.currentUser.role_kode})`);
      return {
        authorized: false,
        data: [],
        message: 'Akses Ditolak (403): Data asesmen psikologis rahasia hanya dapat diakses oleh Guru BK.'
      };
    }

    const results = siswaId
      ? this.asesmenRestrictedList.filter(a => a.siswa_id === siswaId)
      : this.asesmenRestrictedList;
    return { authorized: true, data: results };
  }

  // --------------------------------------------------------------------------
  // CRUD OPERATIONS WITH AUTOMATION & AUDIT
  // --------------------------------------------------------------------------

  // Jurnal Guru Wali
  public addJurnalGuruWali(entry: Omit<JurnalGuruWali, 'id' | 'created_at' | 'updated_at'>): JurnalGuruWali {
    const newEntry: JurnalGuruWali = {
      ...entry,
      id: 'jgw-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.jurnalGuruWaliList.unshift(newEntry);
    this.persist('jurnal_gw', this.jurnalGuruWaliList);
    this.logAudit('CREATE', 'jurnal_guru_wali', newEntry.id, `Jurnal Guru Wali ditambahkan untuk siswa ID ${entry.siswa_id}`);
    return newEntry;
  }

  // Jurnal Wali Kelas
  public addJurnalWaliKelas(entry: Omit<JurnalWaliKelas, 'id' | 'created_at' | 'updated_at'>): JurnalWaliKelas {
    const newEntry: JurnalWaliKelas = {
      ...entry,
      id: 'jwk-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.jurnalWaliKelasList.unshift(newEntry);
    this.persist('jurnal_wk', this.jurnalWaliKelasList);
    this.logAudit('CREATE', 'jurnal_wali_kelas', newEntry.id, `Jurnal Wali Kelas ditambahkan untuk siswa ID ${entry.siswa_id}`);
    return newEntry;
  }

  // Jurnal KKK
  public addJurnalKKK(entry: Omit<JurnalKKK, 'id' | 'created_at' | 'updated_at'>): JurnalKKK {
    const newEntry: JurnalKKK = {
      ...entry,
      id: 'jkkk-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.jurnalKKKList.unshift(newEntry);
    this.persist('jurnal_kkk', this.jurnalKKKList);
    this.logAudit('CREATE', 'jurnal_kkk', newEntry.id, `Jurnal KKK ditambahkan untuk siswa ID ${entry.siswa_id}`);
    return newEntry;
  }

  // Jurnal BK & Restricted
  public addJurnalBK(
    generalEntry: Omit<JurnalBK, 'id' | 'created_at' | 'updated_at'>,
    restrictedData?: { catatan_rahasia: string; hasil_assessment: string; rekomendasi_profesional: string }
  ): JurnalBK {
    const newJurnal: JurnalBK = {
      ...generalEntry,
      id: 'jbk-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.jurnalBKList.unshift(newJurnal);
    this.persist('jurnal_bk', this.jurnalBKList);
    this.logAudit('CREATE', 'jurnal_bk', newJurnal.id, `Layanan BK ${generalEntry.jenis_layanan} dicatat untuk siswa ID ${generalEntry.siswa_id}`);

    // If restricted data provided and caller is BK:
    if (restrictedData && this.currentUser.role_kode === 'guru_bk') {
      const restrictedEntry: KonselingRestricted = {
        id: 'kr-' + Date.now(),
        jurnal_bk_id: newJurnal.id,
        siswa_id: generalEntry.siswa_id,
        guru_bk_id: generalEntry.guru_bk_id,
        catatan_rahasia: restrictedData.catatan_rahasia,
        hasil_assessment: restrictedData.hasil_assessment,
        rekomendasi_profesional: restrictedData.rekomendasi_profesional,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.konselingRestrictedList.unshift(restrictedEntry);
      this.persist('konseling_restricted', this.konselingRestrictedList);
      this.logAudit('CREATE', 'konseling_restricted', restrictedEntry.id, `Catatan rahasia BK disimpan`);
    }

    return newJurnal;
  }

  public addAsesmenBK(entry: Omit<AsesmenBKRestricted, 'id' | 'created_at' | 'updated_at'>): boolean {
    if (this.currentUser.role_kode !== 'guru_bk') {
      return false;
    }
    const newEntry: AsesmenBKRestricted = {
      ...entry,
      id: 'abr-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.asesmenRestrictedList.unshift(newEntry);
    this.persist('asesmen_restricted', this.asesmenRestrictedList);
    this.logAudit('CREATE', 'asesmen_bk_restricted', newEntry.id, `Asesmen BK disimpan`);
    return true;
  }

  public addRujukanBK(entry: Omit<RujukanBK, 'id' | 'created_at' | 'updated_at'>): RujukanBK {
    const newEntry: RujukanBK = {
      ...entry,
      id: 'rbk-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.rujukanBKList.unshift(newEntry);
    this.persist('rujukan_bk', this.rujukanBKList);
    this.logAudit('CREATE', 'rujukan_bk', newEntry.id, `Rujukan BK diterbitkan untuk siswa ID ${entry.siswa_id}`);
    return newEntry;
  }

  // Pelanggaran dengan Poin Otomatis dari Master Tatib
  public addPelanggaran(entry: Omit<Pelanggaran, 'id' | 'poin' | 'kategori' | 'created_at' | 'updated_at'>): Pelanggaran {
    const master = this.masterTatibList.find(m => m.id === entry.jenis_pelanggaran_id);
    const poin = master ? master.poin : 5;
    const kategori = master ? master.kategori : 'Ketertiban';

    const newPelanggaran: Pelanggaran = {
      ...entry,
      id: 'pel-' + Date.now(),
      poin,
      kategori,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.pelanggaranList.unshift(newPelanggaran);
    this.persist('pelanggaran', this.pelanggaranList);
    this.logAudit('CREATE', 'pelanggaran', newPelanggaran.id, `Pelanggaran ${master?.kode || ''} (+${poin} poin) dicatat untuk siswa ID ${entry.siswa_id}`);

    // Cek jika total poin melampaui ambang batas untuk notifikasi koordinasi
    const totalPoin = this.getTotalPoinSiswa(entry.siswa_id);
    if (totalPoin >= 20) {
      this.createNotification(
        'user-kesiswaan',
        'Peringatan Akumulasi Poin Tatib',
        `Siswa telah mencapai ${totalPoin} poin pelanggaran. Perlu tindakan pembinaan atau surat pemanggilan orang tua.`,
        'warning',
        newPelanggaran.id
      );
    }

    return newPelanggaran;
  }

  public getTotalPoinSiswa(siswaId: string): number {
    return this.pelanggaranList
      .filter(p => p.siswa_id === siswaId)
      .reduce((sum, item) => sum + item.poin, 0);
  }

  public getFasePenanganan(totalSkor: number): FasePenangananTatib {
    if (totalSkor >= 250) {
      return this.fasePenangananList[6];
    }
    const found = this.fasePenangananList.find(f => totalSkor >= f.min_skor && totalSkor <= f.max_skor);
    return found || this.fasePenangananList[0];
  }

  // Pembinaan Kesiswaan
  public addPembinaan(entry: Omit<PembinaanKesiswaan, 'id' | 'created_at' | 'updated_at'>): PembinaanKesiswaan {
    const newEntry: PembinaanKesiswaan = {
      ...entry,
      id: 'pem-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.pembinaanList.unshift(newEntry);
    this.persist('pembinaan', this.pembinaanList);
    this.logAudit('CREATE', 'pembinaan_kesiswaan', newEntry.id, `Pembinaan dicatat untuk siswa ID ${entry.siswa_id}`);
    return newEntry;
  }

  // Keterlambatan
  public addKeterlambatan(entry: Omit<Keterlambatan, 'id' | 'created_at'>): Keterlambatan {
    const newEntry: Keterlambatan = {
      ...entry,
      id: 'ket-' + Date.now(),
      created_at: new Date().toISOString()
    };
    this.keterlambatanList.unshift(newEntry);
    this.persist('keterlambatan', this.keterlambatanList);
    this.logAudit('CREATE', 'keterlambatan', newEntry.id, `Keterlambatan dicatat untuk siswa ID ${entry.siswa_id}`);
    return newEntry;
  }

  // Ketidakhadiran
  public addKetidakhadiran(entry: Omit<Ketidakhadiran, 'id' | 'created_at'>): Ketidakhadiran {
    const newEntry: Ketidakhadiran = {
      ...entry,
      id: 'abs-' + Date.now(),
      created_at: new Date().toISOString()
    };
    this.ketidakhadiranList.unshift(newEntry);
    this.persist('ketidakhadiran', this.ketidakhadiranList);
    this.logAudit('CREATE', 'ketidakhadiran', newEntry.id, `Presensi (${entry.jenis}) dicatat untuk siswa ID ${entry.siswa_id}`);
    return newEntry;
  }

  // --------------------------------------------------------------------------
  // PUSAT KOORDINASI SISWA (Automated Case Number KS-2026-XXXXXX)
  // --------------------------------------------------------------------------
  public createKoordinasiCase(
    entry: Omit<KoordinasiSiswa, 'id' | 'nomor_kasus' | 'created_at' | 'updated_at'>
  ): KoordinasiSiswa {
    const year = new Date().getFullYear();
    const count = this.koordinasiList.length + 1;
    const nomorKasus = `KS-${year}-${String(count).padStart(6, '0')}`;

    const newKasus: KoordinasiSiswa = {
      ...entry,
      id: 'ks-' + Date.now(),
      nomor_kasus: nomorKasus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.koordinasiList.unshift(newKasus);
    this.persist('koordinasi', this.koordinasiList);

    // Initial status history
    this.riwayatStatusList.unshift({
      id: 'rsk-' + Date.now(),
      koordinasi_id: newKasus.id,
      status_lama: 'Baru',
      status_baru: 'Baru',
      diubah_oleh: entry.pelapor_id,
      catatan: 'Kasus koordinasi baru dibuka dengan nomor: ' + nomorKasus,
      created_at: new Date().toISOString()
    });
    this.persist('riwayat_status', this.riwayatStatusList);

    // Send notification to PJ (need-to-know: no confidential details)
    const pjProfile = this.profiles.find(p => p.guru_id === entry.penanggung_jawab_id);
    if (pjProfile) {
      this.createNotification(
        pjProfile.id,
        'Kasus Koordinasi Baru',
        `Anda ditunjuk sebagai penanggung jawab penanganan kasus ${nomorKasus}.`,
        'koordinasi',
        newKasus.id
      );
    }

    this.logAudit('CREATE', 'koordinasi_siswa', newKasus.id, `Kasus koordinasi ${nomorKasus} dibuat`);
    return newKasus;
  }

  public updateKoordinasiStatus(koordinasiId: string, statusNew: KoordinasiSiswa['status'], catatan: string): void {
    const item = this.koordinasiList.find(k => k.id === koordinasiId);
    if (item) {
      const oldStatus = item.status;
      item.status = statusNew;
      item.updated_at = new Date().toISOString();
      this.persist('koordinasi', this.koordinasiList);

      this.riwayatStatusList.unshift({
        id: 'rsk-' + Date.now(),
        koordinasi_id: koordinasiId,
        status_lama: oldStatus,
        status_baru: statusNew,
        diubah_oleh: this.currentUser.guru_id || 'system',
        catatan,
        created_at: new Date().toISOString()
      });
      this.persist('riwayat_status', this.riwayatStatusList);
      this.logAudit('UPDATE', 'koordinasi_siswa', koordinasiId, `Status kasus ${item.nomor_kasus} diubah dari ${oldStatus} menjadi ${statusNew}`);
    }
  }

  public addPenugasanTindakLanjut(entry: Omit<PenugasanTindakLanjut, 'id' | 'created_at' | 'updated_at'>): PenugasanTindakLanjut {
    const newEntry: PenugasanTindakLanjut = {
      ...entry,
      id: 'ptl-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.tindakLanjutList.unshift(newEntry);
    this.persist('tindak_lanjut', this.tindakLanjutList);

    const targetProfile = this.profiles.find(p => p.guru_id === entry.ditugaskan_kepada);
    if (targetProfile) {
      this.createNotification(
        targetProfile.id,
        'Penugasan Tindak Lanjut Baru',
        `Ada instruksi tindak lanjut siswa yang ditugaskan kepada Anda.`,
        'tindak_lanjut',
        entry.koordinasi_id
      );
    }

    this.logAudit('CREATE', 'penugasan_tindak_lanjut', newEntry.id, `Penugasan tindak lanjut kasus ID ${entry.koordinasi_id} dibuat`);
    return newEntry;
  }

  // Prestasi Siswa
  public addPrestasi(entry: Omit<PrestasiSiswa, 'id' | 'created_at'>): PrestasiSiswa {
    const newEntry: PrestasiSiswa = {
      ...entry,
      id: 'pres-' + Date.now(),
      created_at: new Date().toISOString()
    };
    this.prestasiList.unshift(newEntry);
    this.persist('prestasi', this.prestasiList);
    this.logAudit('CREATE', 'prestasi_siswa', newEntry.id, `Prestasi diraih oleh siswa ID ${entry.siswa_id}: ${entry.nama_prestasi}`);
    return newEntry;
  }

  // OSIS / MPK
  public addKegiatanOSIS(entry: Omit<KegiatanOSIS, 'id' | 'created_at'>): KegiatanOSIS {
    const newEntry: KegiatanOSIS = {
      ...entry,
      id: 'osis-' + Date.now(),
      created_at: new Date().toISOString()
    };
    this.kegiatanOSISList.unshift(newEntry);
    this.persist('osis', this.kegiatanOSISList);
    this.logAudit('CREATE', 'kegiatan_osis', newEntry.id, `Kegiatan OSIS dicatat: ${entry.nama_kegiatan}`);
    return newEntry;
  }

  // Ekstrakurikuler
  public addKegiatanEkskul(entry: Omit<KegiatanEkstrakurikuler, 'id' | 'created_at'>): KegiatanEkstrakurikuler {
    const newEntry: KegiatanEkstrakurikuler = {
      ...entry,
      id: 'ekskul-' + Date.now(),
      created_at: new Date().toISOString()
    };
    this.kegiatanEkskulList.unshift(newEntry);
    this.persist('ekskul', this.kegiatanEkskulList);
    this.logAudit('CREATE', 'kegiatan_ekstrakurikuler', newEntry.id, `Kegiatan ekskul dicatat: ${entry.nama_ekstrakurikuler}`);
    return newEntry;
  }

  // Notifikasi
  public createNotification(userId: string, judul: string, pesan: string, jenis: Notification['jenis'], referensiId?: string): void {
    const notif: Notification = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      user_id: userId,
      judul,
      pesan,
      jenis,
      referensi_id: referensiId || null,
      dibaca: false,
      created_at: new Date().toISOString()
    };
    this.notifications.unshift(notif);
    this.persist('notifications', this.notifications);
  }

  public markNotificationAsRead(id: string): void {
    const n = this.notifications.find(item => item.id === id);
    if (n) {
      n.dibaca = true;
      this.persist('notifications', this.notifications);
    }
  }

  // Master Data Additions & Bulk Import (Admin)
  public getActiveTahunPelajaranId(): string {
    const active = this.tahunPelajaranList.find(tp => tp.aktif);
    return active?.id || this.tahunPelajaranList[0]?.id || 'tp-2025-2026';
  }

  public findKelasByName(namaKelas: string): Kelas | undefined {
    const target = namaKelas.trim().toLowerCase().replace(/\s+/g, ' ');
    return this.kelasList.find(k => k.nama_kelas.trim().toLowerCase().replace(/\s+/g, ' ') === target);
  }

  public findKompetensiByCodeOrName(input: string): KompetensiKeahlian | undefined {
    const target = input.trim().toLowerCase();
    return this.kompetensiList.find(
      kk => kk.kode.trim().toLowerCase() === target || kk.nama.trim().toLowerCase() === target
    );
  }

  public findGuruByNipOrName(input: string): Guru | undefined {
    const target = input.trim().toLowerCase();
    return this.guruList.find(
      g => g.nip.trim().toLowerCase() === target || g.nama_lengkap.trim().toLowerCase() === target
    );
  }

  public addSiswa(siswa: Omit<Siswa, 'id' | 'created_at' | 'updated_at'>): Siswa {
    const now = new Date().toISOString();
    const newSiswa: Siswa = {
      ...siswa,
      id: 'siswa-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      created_at: now,
      updated_at: now
    };
    this.siswaList.unshift(newSiswa);
    this.persist('siswa', this.siswaList);
    this.logAudit('CREATE', 'siswa', newSiswa.id, `Siswa baru ditambahkan: ${newSiswa.nama_lengkap} (NIS: ${newSiswa.nis})`);
    return newSiswa;
  }

  public deleteSiswa(id: string): void {
    const target = this.siswaList.find(s => s.id === id);
    if (!target) return;
    this.siswaList = this.siswaList.filter(s => s.id !== id);
    this.persist('siswa', this.siswaList);
    this.logAudit('DELETE', 'siswa', id, `Data siswa dihapus: ${target.nama_lengkap} (NIS: ${target.nis})`);
  }

  public async bulkImportSiswa(
    rows: Omit<Siswa, 'id' | 'created_at' | 'updated_at'>[],
    updateDuplicates: boolean = true
  ): Promise<{ inserted: number; updated: number; skipped: number; syncedToSupabase: boolean; supabaseError?: string }> {
    const now = new Date().toISOString();
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    const processed: Siswa[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const existingIdx = this.siswaList.findIndex(
        s => s.nis.trim().toLowerCase() === row.nis.trim().toLowerCase()
      );
      if (existingIdx >= 0) {
        if (updateDuplicates) {
          this.siswaList[existingIdx] = {
            ...this.siswaList[existingIdx],
            ...row,
            updated_at: now
          };
          processed.push(this.siswaList[existingIdx]);
          updated++;
        } else {
          skipped++;
        }
      } else {
        const newSiswa: Siswa = {
          ...row,
          id: `siswa-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 5)}`,
          created_at: now,
          updated_at: now
        };
        this.siswaList.unshift(newSiswa);
        processed.push(newSiswa);
        inserted++;
      }
    }

    this.persist('siswa', this.siswaList);
    this.logAudit(
      'CREATE',
      'siswa',
      null,
      `Import Excel Siswa: ${inserted} baru, ${updated} diperbarui, ${skipped} dilewati.`
    );

    let syncedToSupabase = false;
    let supabaseError: string | undefined;
    if (this.isConnectedToSupabase && this.autoSyncEnabled) {
      const colOk = await this.pushCollectionToSupabase('siswa');
      const rel = await this.syncRelationalMasterTablesToSupabase();
      syncedToSupabase = colOk && rel.ok;
      if (!syncedToSupabase) supabaseError = this.lastSyncError || rel.error;
    }

    return {
      inserted,
      updated,
      skipped,
      syncedToSupabase,
      supabaseError
    };
  }

  public addGuru(guru: Omit<Guru, 'id' | 'created_at' | 'updated_at'>): Guru {
    const now = new Date().toISOString();
    const newGuru: Guru = {
      ...guru,
      id: 'guru-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      created_at: now,
      updated_at: now
    };
    this.guruList.unshift(newGuru);
    this.persist('guru', this.guruList);
    this.logAudit('CREATE', 'guru', newGuru.id, `Data guru baru ditambahkan: ${newGuru.nama_lengkap}`);
    return newGuru;
  }

  public deleteGuru(id: string): void {
    const target = this.guruList.find(g => g.id === id);
    if (!target) return;
    this.guruList = this.guruList.filter(g => g.id !== id);
    this.persist('guru', this.guruList);
    this.logAudit('DELETE', 'guru', id, `Data guru dihapus: ${target.nama_lengkap} (NIP: ${target.nip})`);
  }

  public async bulkImportGuru(
    rows: Omit<Guru, 'id' | 'created_at' | 'updated_at'>[],
    updateDuplicates: boolean = true
  ): Promise<{ inserted: number; updated: number; skipped: number; syncedToSupabase: boolean; supabaseError?: string }> {
    const now = new Date().toISOString();
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    const processed: Guru[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const existingIdx = this.guruList.findIndex(
        g => g.nip.trim().toLowerCase() === row.nip.trim().toLowerCase()
      );
      if (existingIdx >= 0) {
        if (updateDuplicates) {
          this.guruList[existingIdx] = {
            ...this.guruList[existingIdx],
            ...row,
            updated_at: now
          };
          processed.push(this.guruList[existingIdx]);
          updated++;
        } else {
          skipped++;
        }
      } else {
        const newGuru: Guru = {
          ...row,
          id: `guru-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 5)}`,
          created_at: now,
          updated_at: now
        };
        this.guruList.unshift(newGuru);
        processed.push(newGuru);
        inserted++;
      }
    }

    this.persist('guru', this.guruList);
    this.logAudit(
      'CREATE',
      'guru',
      null,
      `Import Excel Guru: ${inserted} baru, ${updated} diperbarui, ${skipped} dilewati.`
    );

    let syncedToSupabase = false;
    let supabaseError: string | undefined;
    if (this.isConnectedToSupabase && this.autoSyncEnabled) {
      const colOk = await this.pushCollectionToSupabase('guru');
      const rel = await this.syncRelationalMasterTablesToSupabase();
      syncedToSupabase = colOk && rel.ok;
      if (!syncedToSupabase) supabaseError = this.lastSyncError || rel.error;
    }

    return {
      inserted,
      updated,
      skipped,
      syncedToSupabase,
      supabaseError
    };
  }

  public addKelas(kelas: Omit<Kelas, 'id' | 'created_at'>): Kelas {
    const newKelas: Kelas = {
      ...kelas,
      id: 'kelas-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      created_at: new Date().toISOString()
    };
    this.kelasList.unshift(newKelas);
    this.persist('kelas', this.kelasList);
    this.logAudit('CREATE', 'kelas', newKelas.id, `Kelas baru dibuat: ${newKelas.nama_kelas}`);
    return newKelas;
  }

  public deleteKelas(id: string): void {
    const target = this.kelasList.find(k => k.id === id);
    if (!target) return;
    this.kelasList = this.kelasList.filter(k => k.id !== id);
    this.persist('kelas', this.kelasList);
    this.logAudit('DELETE', 'kelas', id, `Data kelas dihapus: ${target.nama_kelas}`);
  }

  public async bulkImportKelas(
    rows: Omit<Kelas, 'id' | 'created_at'>[],
    updateDuplicates: boolean = true
  ): Promise<{ inserted: number; updated: number; skipped: number; syncedToSupabase: boolean; supabaseError?: string }> {
    const now = new Date().toISOString();
    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const existingIdx = this.kelasList.findIndex(
        k => k.nama_kelas.trim().toLowerCase() === row.nama_kelas.trim().toLowerCase()
      );
      if (existingIdx >= 0) {
        if (updateDuplicates) {
          this.kelasList[existingIdx] = {
            ...this.kelasList[existingIdx],
            ...row
          };
          updated++;
        } else {
          skipped++;
        }
      } else {
        const newKelas: Kelas = {
          ...row,
          id: `kelas-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 5)}`,
          created_at: now
        };
        this.kelasList.unshift(newKelas);
        inserted++;
      }
    }

    this.persist('kelas', this.kelasList);
    this.logAudit(
      'CREATE',
      'kelas',
      null,
      `Import Excel Kelas: ${inserted} baru, ${updated} diperbarui, ${skipped} dilewati.`
    );

    let syncedToSupabase = false;
    let supabaseError: string | undefined;
    if (this.isConnectedToSupabase && this.autoSyncEnabled) {
      const colOk = await this.pushCollectionToSupabase('kelas');
      const rel = await this.syncRelationalMasterTablesToSupabase();
      syncedToSupabase = colOk && rel.ok;
      if (!syncedToSupabase) supabaseError = this.lastSyncError || rel.error;
    }

    return {
      inserted,
      updated,
      skipped,
      syncedToSupabase,
      supabaseError
    };
  }

  public addKompetensi(kk: Omit<KompetensiKeahlian, 'id' | 'created_at'>): KompetensiKeahlian {
    const newKK: KompetensiKeahlian = {
      ...kk,
      id: 'kk-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      created_at: new Date().toISOString()
    };
    this.kompetensiList.unshift(newKK);
    this.persist('kompetensi', this.kompetensiList);
    this.logAudit('CREATE', 'kompetensi_keahlian', newKK.id, `Kompetensi keahlian ditambahkan: ${newKK.nama}`);
    return newKK;
  }

  public deleteKompetensi(id: string): void {
    const target = this.kompetensiList.find(k => k.id === id);
    if (!target) return;
    this.kompetensiList = this.kompetensiList.filter(k => k.id !== id);
    this.persist('kompetensi', this.kompetensiList);
    this.logAudit('DELETE', 'kompetensi_keahlian', id, `Kompetensi keahlian dihapus: ${target.kode} - ${target.nama}`);
  }

  public async bulkImportKompetensi(
    rows: Omit<KompetensiKeahlian, 'id' | 'created_at'>[],
    updateDuplicates: boolean = true
  ): Promise<{ inserted: number; updated: number; skipped: number; syncedToSupabase: boolean; supabaseError?: string }> {
    const now = new Date().toISOString();
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    const processed: KompetensiKeahlian[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const existingIdx = this.kompetensiList.findIndex(
        k => k.kode.trim().toLowerCase() === row.kode.trim().toLowerCase()
      );
      if (existingIdx >= 0) {
        if (updateDuplicates) {
          this.kompetensiList[existingIdx] = {
            ...this.kompetensiList[existingIdx],
            ...row
          };
          processed.push(this.kompetensiList[existingIdx]);
          updated++;
        } else {
          skipped++;
        }
      } else {
        const newKK: KompetensiKeahlian = {
          ...row,
          id: `kk-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 5)}`,
          created_at: now
        };
        this.kompetensiList.unshift(newKK);
        processed.push(newKK);
        inserted++;
      }
    }

    this.persist('kompetensi', this.kompetensiList);
    this.logAudit(
      'CREATE',
      'kompetensi_keahlian',
      null,
      `Import Excel Kompetensi Keahlian: ${inserted} baru, ${updated} diperbarui, ${skipped} dilewati.`
    );

    let syncedToSupabase = false;
    let supabaseError: string | undefined;
    if (this.isConnectedToSupabase && this.autoSyncEnabled) {
      const colOk = await this.pushCollectionToSupabase('kompetensi');
      const rel = await this.syncRelationalMasterTablesToSupabase();
      syncedToSupabase = colOk && rel.ok;
      if (!syncedToSupabase) supabaseError = this.lastSyncError || rel.error;
    }

    return {
      inserted,
      updated,
      skipped,
      syncedToSupabase,
      supabaseError
    };
  }

  public addMasterTatib(tatib: Omit<MasterPoinTatib, 'id' | 'created_at' | 'updated_at'>): MasterPoinTatib {
    const newTatib: MasterPoinTatib = {
      ...tatib,
      id: 'tatib-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.masterTatibList.push(newTatib);
    this.persist('master_tatib', this.masterTatibList);
    this.logAudit('CREATE', 'master_poin_tatib', newTatib.id, `Aturan tatib baru ditambahkan: ${newTatib.kode} (${newTatib.poin} poin)`);
    return newTatib;
  }

  // Helpers to resolve entities
  public getSiswaById(id: string): Siswa | undefined {
    return this.siswaList.find(s => s.id === id);
  }

  public getGuruById(id: string): Guru | undefined {
    return this.guruList.find(g => g.id === id);
  }

  public getKelasById(id: string): Kelas | undefined {
    return this.kelasList.find(k => k.id === id);
  }

  public getKompetensiById(id: string): KompetensiKeahlian | undefined {
    return this.kompetensiList.find(k => k.id === id);
  }

  // Reset to demo seed data
  public resetToDefaultSeed(): void {
    localStorage.clear();
    window.location.reload();
  }
}

export const dbService = new SimpelSmesaService();
