import React, { useEffect, useRef, useState } from 'react';
import { dbService, DEFAULT_SCHOOL_PROFILE } from '../services/supabaseService';
import { Guru, SchoolProfile } from '../types/database';
import {
  Building2,
  MapPin,
  UserCheck,
  ShieldCheck,
  Save,
  RotateCcw,
  Upload,
  CheckCircle,
  AlertCircle,
  FileText,
  Globe,
  Phone,
  Mail
} from 'lucide-react';

export const SchoolProfileView: React.FC = () => {
  const currentUser = dbService.currentUser;
  const canEdit = ['admin', 'kepala_sekolah', 'waka_kesiswaan'].includes(currentUser.role_kode);

  const [form, setForm] = useState<SchoolProfile>({ ...dbService.schoolProfile });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  // Sync form if remote Realtime update changes schoolProfile
  useEffect(() => {
    setForm({ ...dbService.schoolProfile });
  }, [dbService.schoolProfile.updated_at]);

  const handleChange = <K extends keyof SchoolProfile>(field: K, value: SchoolProfile[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      setFeedback({ type: 'error', text: 'Ukuran file logo maksimal 500 KB (format PNG/JPG/SVG).' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleChange('logo_url', reader.result);
        setFeedback({ type: 'success', text: 'Logo baru siap disimpan. Klik "Simpan Pengaturan Profil" untuk menerapkan.' });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handlePickGuruForKepsek = (guruId: string) => {
    const guru = dbService.guruList.find((g: Guru) => g.id === guruId);
    if (!guru) return;
    setForm(prev => ({
      ...prev,
      kepala_sekolah_nama: guru.nama_lengkap,
      kepala_sekolah_nip: guru.nip
    }));
  };

  const handlePickGuruForWaka = (guruId: string) => {
    const guru = dbService.guruList.find((g: Guru) => g.id === guruId);
    if (!guru) return;
    setForm(prev => ({
      ...prev,
      waka_kesiswaan_nama: guru.nama_lengkap,
      waka_kesiswaan_nip: guru.nip
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    if (!form.nama_sekolah.trim() || !form.kepala_sekolah_nama.trim() || !form.waka_kesiswaan_nama.trim()) {
      setFeedback({
        type: 'error',
        text: 'Nama Sekolah, Nama Kepala Sekolah, dan Nama Wakil Kepala Sekolah Bid. Kesiswaan wajib diisi.'
      });
      return;
    }

    dbService.updateSchoolProfile({
      ...form,
      nama_sekolah: form.nama_sekolah.trim(),
      nama_aplikasi: form.nama_aplikasi.trim() || 'SIMPEL SMESA',
      instansi_induk: form.instansi_induk.trim(),
      alamat: form.alamat.trim(),
      kota: form.kota.trim(),
      provinsi: form.provinsi.trim(),
      kode_pos: form.kode_pos.trim(),
      telepon: form.telepon.trim(),
      email: form.email.trim(),
      website: form.website.trim(),
      kepala_sekolah_nama: form.kepala_sekolah_nama.trim(),
      kepala_sekolah_nip: form.kepala_sekolah_nip.trim(),
      kepala_sekolah_pangkat: form.kepala_sekolah_pangkat.trim(),
      waka_kesiswaan_nama: form.waka_kesiswaan_nama.trim(),
      waka_kesiswaan_nip: form.waka_kesiswaan_nip.trim(),
      waka_kesiswaan_pangkat: form.waka_kesiswaan_pangkat.trim()
    });

    setFeedback({
      type: 'success',
      text: dbService.isConnectedToSupabase
        ? 'Profil Sekolah berhasil disimpan & otomatis disinkronkan online ke Supabase!'
        : 'Profil Sekolah berhasil disimpan dan langsung diterapkan ke sidebar, kop dokumen, & surat resmi.'
    });
  };

  const handleResetDefault = () => {
    if (!canEdit) return;
    const restored = dbService.resetSchoolProfile();
    setForm({ ...restored });
    setFeedback({
      type: 'success',
      text: 'Pengaturan dikembalikan ke profil default SMK Negeri 1 Jember.'
    });
  };

  const fullAddressLine = [
    form.alamat,
    form.kota,
    form.provinsi,
    form.kode_pos
  ].filter(Boolean).join(', ');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>Pengaturan Identitas & Pimpinan Satuan Pendidikan</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Setting Profil Sekolah</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Atur profil sekolah, alamat, Kepala Sekolah, dan Wakil Kepala Sekolah Bidang Kesiswaan. Perubahan otomatis berlaku pada kop dokumen resmi, surat panggilan, dan navigasi aplikasi.
          </p>
        </div>

        {canEdit && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleResetDefault}
              className="h-10 px-3.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        )}
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-lg border text-xs font-medium flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Identitas & Logo Sekolah */}
          <div className="bg-white p-5 sm:p-6 rounded-lg border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
              <Building2 className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">1. Identitas & Logo Sekolah</h3>
            </div>

            {/* Logo uploader */}
            <div className="flex items-center gap-4 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <div className="w-16 h-16 rounded-full bg-white p-1 border border-slate-200 shadow-xs shrink-0 flex items-center justify-center">
                <img
                  src={form.logo_url || DEFAULT_SCHOOL_PROFILE.logo_url}
                  alt="Logo Sekolah"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <span className="text-xs font-bold text-slate-800 block">Logo Resmi Sekolah</span>
                <p className="text-[11px] text-slate-500">
                  Digunakan di sidebar, halaman login, kop Tata Tertib, dan kop Surat Panggilan.
                </p>
                {canEdit && (
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[11px] font-semibold text-slate-700 inline-flex items-center gap-1"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Ganti Logo</span>
                    </button>
                    {form.logo_url !== DEFAULT_SCHOOL_PROFILE.logo_url && (
                      <button
                        type="button"
                        onClick={() => handleChange('logo_url', DEFAULT_SCHOOL_PROFILE.logo_url)}
                        className="px-2.5 py-1.5 text-[11px] font-medium text-blue-600 hover:underline"
                      >
                        Pakai Logo Resmi SMKN 1 Jember
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Instansi / Dinas Induk
              </label>
              <input
                type="text"
                disabled={!canEdit}
                value={form.instansi_induk}
                onChange={e => handleChange('instansi_induk', e.target.value)}
                placeholder="Pemerintah Provinsi Jawa Timur · Dinas Pendidikan"
                className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Nama Sekolah *
                </label>
                <input
                  type="text"
                  required
                  disabled={!canEdit}
                  value={form.nama_sekolah}
                  onChange={e => handleChange('nama_sekolah', e.target.value)}
                  placeholder="SMK Negeri 1 Jember"
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-50"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  NPSN
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={form.npsn}
                  onChange={e => handleChange('npsn', e.target.value)}
                  placeholder="20523850"
                  className="w-full h-10 px-3 text-xs font-mono bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Nama Aplikasi / Sistem
              </label>
              <input
                type="text"
                disabled={!canEdit}
                value={form.nama_aplikasi}
                onChange={e => handleChange('nama_aplikasi', e.target.value)}
                placeholder="SIMPEL SMESA"
                className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-50"
              />
            </div>
          </div>

          {/* Card 2: Alamat & Kontak Sekolah */}
          <div className="bg-white p-5 sm:p-6 rounded-lg border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">2. Alamat & Kontak Resmi Sekolah</h3>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Alamat Lengkap (Jalan / Nomor) *
              </label>
              <textarea
                rows={2}
                required
                disabled={!canEdit}
                value={form.alamat}
                onChange={e => handleChange('alamat', e.target.value)}
                placeholder="Jalan Jambu Nomor 17"
                className="w-full p-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Kota / Kabupaten
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={form.kota}
                  onChange={e => handleChange('kota', e.target.value)}
                  placeholder="Jember"
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 disabled:bg-slate-50"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Provinsi
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={form.provinsi}
                  onChange={e => handleChange('provinsi', e.target.value)}
                  placeholder="Jawa Timur"
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 disabled:bg-slate-50"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Kode Pos
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={form.kode_pos}
                  onChange={e => handleChange('kode_pos', e.target.value)}
                  placeholder="68111"
                  className="w-full h-10 px-3 text-xs font-mono bg-white border border-slate-300 rounded-lg text-slate-800 disabled:bg-slate-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>Telepon Sekolah</span>
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={form.telepon}
                  onChange={e => handleChange('telepon', e.target.value)}
                  placeholder="(0331) 429690"
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 disabled:bg-slate-50"
                />
              </div>
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>Email Resmi</span>
                </label>
                <input
                  type="email"
                  disabled={!canEdit}
                  value={form.email}
                  onChange={e => handleChange('email', e.target.value)}
                  placeholder="info@smkn1jember.sch.id"
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 disabled:bg-slate-50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                <Globe className="w-3 h-3 text-slate-400" />
                <span>Website Sekolah</span>
              </label>
              <input
                type="text"
                disabled={!canEdit}
                value={form.website}
                onChange={e => handleChange('website', e.target.value)}
                placeholder="https://smkn1jember.sch.id"
                className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 disabled:bg-slate-50"
              />
            </div>
          </div>

          {/* Card 3: Kepala Sekolah */}
          <div className="bg-white p-5 sm:p-6 rounded-lg border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">3. Kepala Sekolah</h3>
              </div>
              {canEdit && dbService.guruList.length > 0 && (
                <select
                  defaultValue=""
                  onChange={e => {
                    if (e.target.value) handlePickGuruForKepsek(e.target.value);
                    e.target.value = '';
                  }}
                  className="h-8 px-2 text-[11px] bg-slate-50 border border-slate-200 rounded text-slate-600"
                >
                  <option value="">Isi cepat dari Data Guru...</option>
                  {dbService.guruList.map((g: Guru) => (
                    <option key={g.id} value={g.id}>{g.nama_lengkap}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Nama Lengkap & Gelar Kepala Sekolah *
              </label>
              <input
                type="text"
                required
                disabled={!canEdit}
                value={form.kepala_sekolah_nama}
                onChange={e => handleChange('kepala_sekolah_nama', e.target.value)}
                placeholder="SRI HARTATIK, M.Pd."
                className="w-full h-10 px-3 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 disabled:bg-slate-50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  NIP Kepala Sekolah
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={form.kepala_sekolah_nip}
                  onChange={e => handleChange('kepala_sekolah_nip', e.target.value)}
                  placeholder="196809102000122003"
                  className="w-full h-10 px-3 text-xs font-mono bg-white border border-slate-300 rounded-lg text-slate-800 disabled:bg-slate-50"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Pangkat / Golongan
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={form.kepala_sekolah_pangkat}
                  onChange={e => handleChange('kepala_sekolah_pangkat', e.target.value)}
                  placeholder="Pembina Utama Muda / IVc"
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 disabled:bg-slate-50"
                />
              </div>
            </div>
          </div>

          {/* Card 4: Wakil Kepala Sekolah Bidang Kesiswaan */}
          <div className="bg-white p-5 sm:p-6 rounded-lg border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">4. Wakil Kepala Sekolah Bid. Kesiswaan</h3>
              </div>
              {canEdit && dbService.guruList.length > 0 && (
                <select
                  defaultValue=""
                  onChange={e => {
                    if (e.target.value) handlePickGuruForWaka(e.target.value);
                    e.target.value = '';
                  }}
                  className="h-8 px-2 text-[11px] bg-slate-50 border border-slate-200 rounded text-slate-600"
                >
                  <option value="">Isi cepat dari Data Guru...</option>
                  {dbService.guruList.map((g: Guru) => (
                    <option key={g.id} value={g.id}>{g.nama_lengkap}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Nama Lengkap & Gelar Waka Kesiswaan *
              </label>
              <input
                type="text"
                required
                disabled={!canEdit}
                value={form.waka_kesiswaan_nama}
                onChange={e => handleChange('waka_kesiswaan_nama', e.target.value)}
                placeholder="Rina Puspitasari, S.Pd., M.M."
                className="w-full h-10 px-3 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 disabled:bg-slate-50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  NIP Waka Kesiswaan
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={form.waka_kesiswaan_nip}
                  onChange={e => handleChange('waka_kesiswaan_nip', e.target.value)}
                  placeholder="197408221999032001"
                  className="w-full h-10 px-3 text-xs font-mono bg-white border border-slate-300 rounded-lg text-slate-800 disabled:bg-slate-50"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Pangkat / Golongan
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={form.waka_kesiswaan_pangkat}
                  onChange={e => handleChange('waka_kesiswaan_pangkat', e.target.value)}
                  placeholder="Pembina / IVa"
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 disabled:bg-slate-50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Kop Surat & Blok Tanda Tangan Resmi */}
        <div className="bg-white p-5 sm:p-6 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Pratinjau Kop Dokumen Resmi & Blok Pengesahan
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">Live Preview</span>
          </div>

          <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-lg border border-slate-300 bg-white space-y-6 text-xs text-slate-800">
            {/* Kop Surat */}
            <div className="flex items-center justify-center gap-4 border-b-2 border-slate-900 pb-4">
              <img
                src={form.logo_url || DEFAULT_SCHOOL_PROFILE.logo_url}
                alt="Logo Sekolah"
                className="w-14 h-14 object-contain shrink-0"
              />
              <div className="text-center">
                <span className="font-bold text-xs sm:text-sm tracking-wide block uppercase">
                  {form.instansi_induk || 'Pemerintah Provinsi Jawa Timur · Dinas Pendidikan'}
                </span>
                <span className="font-extrabold text-sm sm:text-base tracking-wider block uppercase">
                  {form.nama_sekolah || 'SMK NEGERI 1 JEMBER'}
                </span>
                <span className="text-[11px] text-slate-600 block">
                  {fullAddressLine} {form.telepon ? `· Telp. ${form.telepon}` : ''}
                </span>
                {(form.website || form.email) && (
                  <span className="text-[10px] text-slate-500 block">
                    {[form.website, form.email].filter(Boolean).join(' · ')}
                  </span>
                )}
              </div>
            </div>

            {/* Dual Signature Block */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-2 text-center">
              <div>
                <span className="block text-slate-600">Mengetahui,</span>
                <span className="font-semibold block">Kepala Sekolah</span>
                <div className="h-14" />
                <span className="font-bold underline block text-slate-900">{form.kepala_sekolah_nama || '-'}</span>
                {form.kepala_sekolah_pangkat && (
                  <span className="text-[11px] text-slate-600 block">{form.kepala_sekolah_pangkat}</span>
                )}
                <span className="text-[11px] font-mono text-slate-600 block">
                  NIP. {form.kepala_sekolah_nip || '-'}
                </span>
              </div>

              <div>
                <span className="block text-slate-600">{form.kota || 'Jember'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span className="font-semibold block">Wakil Kepala Sekolah Bid. Kesiswaan</span>
                <div className="h-14" />
                <span className="font-bold underline block text-slate-900">{form.waka_kesiswaan_nama || '-'}</span>
                {form.waka_kesiswaan_pangkat && (
                  <span className="text-[11px] text-slate-600 block">{form.waka_kesiswaan_pangkat}</span>
                )}
                <span className="text-[11px] font-mono text-slate-600 block">
                  NIP. {form.waka_kesiswaan_nip || '-'}
                </span>
              </div>
            </div>
          </div>

          {canEdit && (
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan Profil Sekolah</span>
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
