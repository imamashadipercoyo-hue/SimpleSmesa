import React, { useState } from 'react';
import { dbService } from '../services/supabaseService';
import { Kelas, KompetensiKeahlian, Pelanggaran, JurnalGuruWali, PembinaanKesiswaan, Keterlambatan, PrestasiSiswa, KoordinasiSiswa } from '../types/database';
import { FileText, Printer, Download, Filter, Search, CheckCircle } from 'lucide-react';

export const LaporanView: React.FC = () => {
  const [jenisLaporan, setJenisLaporan] = useState<'layanan' | 'pelanggaran' | 'pembinaan' | 'keterlambatan' | 'prestasi' | 'koordinasi'>('pelanggaran');
  const [filterKelas, setFilterKelas] = useState('');
  const [filterKompetensi, setFilterKompetensi] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Print mode
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>Pusat Laporan & Rekapitulasi Manajemen</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Laporan Terpadu SMKN 1 Jember</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Laporan akuntabilitas layanan kesiswaan, bimbingan konseling, pelanggaran tatib, dan tindak lanjut.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Ekspor PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Panel (Section 49) */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          <span>Filter Laporan Terpadu</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-600 font-medium mb-1">Jenis Laporan</label>
            <select
              value={jenisLaporan}
              onChange={e => setJenisLaporan(e.target.value as any)}
              className="w-full h-10 px-3 bg-white border border-slate-300 rounded-md font-semibold text-slate-900"
            >
              <option value="pelanggaran">Laporan Pelanggaran Tatib</option>
              <option value="layanan">Laporan Jurnal Pendampingan</option>
              <option value="pembinaan">Laporan Pembinaan Terpadu</option>
              <option value="keterlambatan">Laporan Keterlambatan Gerbang</option>
              <option value="prestasi">Laporan Prestasi Siswa</option>
              <option value="koordinasi">Laporan Pusat Koordinasi</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Kelas</label>
            <select
              value={filterKelas}
              onChange={e => setFilterKelas(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-slate-300 rounded-md text-slate-800"
            >
              <option value="">Semua Kelas</option>
              {dbService.kelasList.map((k: Kelas) => (
                <option key={k.id} value={k.id}>{k.nama_kelas}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Kompetensi Keahlian</label>
            <select
              value={filterKompetensi}
              onChange={e => setFilterKompetensi(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-slate-300 rounded-md text-slate-800"
            >
              <option value="">Semua Jurusan</option>
              {dbService.kompetensiList.map((kk: KompetensiKeahlian) => (
                <option key={kk.id} value={kk.id}>{kk.kode} - {kk.nama}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Tahun Pelajaran</label>
            <input
              type="text"
              disabled
              value="2025/2026 (Genap)"
              className="w-full h-10 px-3 bg-slate-100 border border-slate-300 rounded-md text-slate-600 font-semibold"
            />
          </div>
        </div>
      </div>

      {/* Printable Report Document (A4 Styling) */}
      <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm space-y-6 text-xs text-slate-800" id="printable-report">
        {/* Official Header */}
        <div className="text-center border-b-2 border-slate-900 pb-4">
          <span className="font-bold text-xs tracking-wide block uppercase text-slate-700">Pemerintah Provinsi Jawa Timur · Dinas Pendidikan</span>
          <span className="font-extrabold text-base tracking-wider block uppercase text-slate-900">SMK NEGERI 1 JEMBER</span>
          <span className="text-[11px] text-slate-600 block">Jalan Panjaitan No. 88 Telp. (0331) 338573 Jember 68121</span>
          <div className="mt-2 text-xs font-bold text-slate-900 uppercase">
            Rekapitulasi {jenisLaporan.toUpperCase()} Periode Tahun Pelajaran 2025/2026
          </div>
        </div>

        {/* Content Table based on type */}
        {jenisLaporan === 'pelanggaran' && (
          <table className="w-full text-left text-xs text-slate-800 border-collapse">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-50 font-bold">
                <th className="py-2 px-3">No</th>
                <th className="py-2 px-3">Tanggal</th>
                <th className="py-2 px-3">Nama Siswa</th>
                <th className="py-2 px-3">Kelas</th>
                <th className="py-2 px-3">Pelanggaran & Uraian</th>
                <th className="py-2 px-3">Bobot Poin</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {dbService.pelanggaranList.map((p: Pelanggaran, idx: number) => {
                const s = dbService.getSiswaById(p.siswa_id);
                const kls = s ? dbService.getKelasById(s.kelas_id) : null;
                return (
                  <tr key={p.id}>
                    <td className="py-2 px-3">{idx + 1}</td>
                    <td className="py-2 px-3 whitespace-nowrap">{p.tanggal}</td>
                    <td className="py-2 px-3 font-semibold">{s?.nama_lengkap}</td>
                    <td className="py-2 px-3">{kls?.nama_kelas}</td>
                    <td className="py-2 px-3">{p.uraian}</td>
                    <td className="py-2 px-3 font-bold text-rose-700">+{p.poin}</td>
                    <td className="py-2 px-3">{p.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {jenisLaporan === 'layanan' && (
          <table className="w-full text-left text-xs text-slate-800 border-collapse">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-50 font-bold">
                <th className="py-2 px-3">No</th>
                <th className="py-2 px-3">Tanggal</th>
                <th className="py-2 px-3">Siswa</th>
                <th className="py-2 px-3">Layanan</th>
                <th className="py-2 px-3">Fokus Masalah</th>
                <th className="py-2 px-3">Hasil Layanan</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {dbService.jurnalGuruWaliList.map((j: JurnalGuruWali, idx: number) => {
                const s = dbService.getSiswaById(j.siswa_id);
                return (
                  <tr key={j.id}>
                    <td className="py-2 px-3">{idx + 1}</td>
                    <td className="py-2 px-3">{j.tanggal}</td>
                    <td className="py-2 px-3 font-semibold">{s?.nama_lengkap}</td>
                    <td className="py-2 px-3">{j.jenis_layanan}</td>
                    <td className="py-2 px-3">{j.permasalahan}</td>
                    <td className="py-2 px-3">{j.hasil_layanan}</td>
                    <td className="py-2 px-3 font-semibold">{j.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {jenisLaporan === 'pembinaan' && (
          <table className="w-full text-left text-xs text-slate-800 border-collapse">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-50 font-bold">
                <th className="py-2 px-3">No</th>
                <th className="py-2 px-3">Tanggal</th>
                <th className="py-2 px-3">Siswa</th>
                <th className="py-2 px-3">Jenis Pembinaan</th>
                <th className="py-2 px-3">Pihak Dilibatkan</th>
                <th className="py-2 px-3">Tahap Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {dbService.pembinaanList.map((pem: PembinaanKesiswaan, idx: number) => {
                const s = dbService.getSiswaById(pem.siswa_id);
                return (
                  <tr key={pem.id}>
                    <td className="py-2 px-3">{idx + 1}</td>
                    <td className="py-2 px-3">{pem.tanggal}</td>
                    <td className="py-2 px-3 font-semibold">{s?.nama_lengkap}</td>
                    <td className="py-2 px-3">{pem.jenis_pembinaan}</td>
                    <td className="py-2 px-3">{pem.pihak_dilibatkan}</td>
                    <td className="py-2 px-3 font-semibold text-blue-700">{pem.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {jenisLaporan === 'keterlambatan' && (
          <table className="w-full text-left text-xs text-slate-800 border-collapse">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-50 font-bold">
                <th className="py-2 px-3">No</th>
                <th className="py-2 px-3">Tanggal / Waktu</th>
                <th className="py-2 px-3">Siswa</th>
                <th className="py-2 px-3">Alasan</th>
                <th className="py-2 px-3">Tindakan Piket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {dbService.keterlambatanList.map((k: Keterlambatan, idx: number) => {
                const s = dbService.getSiswaById(k.siswa_id);
                return (
                  <tr key={k.id}>
                    <td className="py-2 px-3">{idx + 1}</td>
                    <td className="py-2 px-3">{k.tanggal} {k.waktu}</td>
                    <td className="py-2 px-3 font-semibold">{s?.nama_lengkap}</td>
                    <td className="py-2 px-3">{k.alasan}</td>
                    <td className="py-2 px-3">{k.tindakan}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {jenisLaporan === 'prestasi' && (
          <table className="w-full text-left text-xs text-slate-800 border-collapse">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-50 font-bold">
                <th className="py-2 px-3">No</th>
                <th className="py-2 px-3">Tanggal</th>
                <th className="py-2 px-3">Siswa</th>
                <th className="py-2 px-3">Nama Prestasi / Lomba</th>
                <th className="py-2 px-3">Tingkat</th>
                <th className="py-2 px-3">Peringkat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {dbService.prestasiList.map((pr: PrestasiSiswa, idx: number) => {
                const s = dbService.getSiswaById(pr.siswa_id);
                return (
                  <tr key={pr.id}>
                    <td className="py-2 px-3">{idx + 1}</td>
                    <td className="py-2 px-3">{pr.tanggal}</td>
                    <td className="py-2 px-3 font-semibold">{s?.nama_lengkap}</td>
                    <td className="py-2 px-3">{pr.nama_prestasi}</td>
                    <td className="py-2 px-3">{pr.tingkat}</td>
                    <td className="py-2 px-3 font-bold text-emerald-700">{pr.peringkat}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {jenisLaporan === 'koordinasi' && (
          <table className="w-full text-left text-xs text-slate-800 border-collapse">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-50 font-bold">
                <th className="py-2 px-3">Nomor Kasus</th>
                <th className="py-2 px-3">Tanggal</th>
                <th className="py-2 px-3">Siswa</th>
                <th className="py-2 px-3">Kategori</th>
                <th className="py-2 px-3">Penanggung Jawab</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {dbService.koordinasiList.map((ko: KoordinasiSiswa) => {
                const s = dbService.getSiswaById(ko.siswa_id);
                const pj = dbService.getGuruById(ko.penanggung_jawab_id);
                return (
                  <tr key={ko.id}>
                    <td className="py-2 px-3 font-mono font-bold text-blue-700">{ko.nomor_kasus}</td>
                    <td className="py-2 px-3">{ko.tanggal_laporan}</td>
                    <td className="py-2 px-3 font-semibold">{s?.nama_lengkap}</td>
                    <td className="py-2 px-3">{ko.kategori_masalah}</td>
                    <td className="py-2 px-3">{pj?.nama_lengkap || '-'}</td>
                    <td className="py-2 px-3 font-bold">{ko.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Signatures */}
        <div className="pt-8 grid grid-cols-2 text-center text-xs text-slate-800">
          <div>
            Mengetahui,<br />
            <strong>Kepala SMKN 1 Jember</strong>
            <div className="h-20" />
            <strong className="underline block">Drs. H. Sri Sugeng, M.Pd</strong>
            <span className="text-[11px] text-slate-500">NIP. 196805121994031005</span>
          </div>
          <div>
            Jember, {new Date().toLocaleDateString('id-ID')}<br />
            <strong>Waka Bidang Kesiswaan</strong>
            <div className="h-20" />
            <strong className="underline block">Rina Puspitasari, S.Pd, M.M</strong>
            <span className="text-[11px] text-slate-500">NIP. 197408221999032001</span>
          </div>
        </div>
      </div>
    </div>
  );
};
