import * as XLSX from 'xlsx';
import { dbService } from '../services/supabaseService';
import { Guru, Kelas, KompetensiKeahlian, Siswa } from '../types/database';

export type MasterEntityType = 'siswa' | 'guru' | 'kelas' | 'kompetensi';

export interface ParsedExcelRow<T> {
  rowNumber: number;
  status: 'valid' | 'duplicate' | 'error';
  message: string;
  displaySummary: Record<string, string>;
  payload?: T;
}

export interface ExcelParseResult<T = any> {
  fileName: string;
  totalRows: number;
  validCount: number;
  duplicateCount: number;
  errorCount: number;
  rows: ParsedExcelRow<T>[];
}

// Normalize column key for flexible Indonesian / English Excel headers
function normalizeKey(raw: string): string {
  return raw
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function getField(rowObj: Record<string, unknown>, aliases: string[]): string {
  const normalizedMap: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rowObj)) {
    normalizedMap[normalizeKey(k)] = v;
  }
  for (const alias of aliases) {
    const val = normalizedMap[normalizeKey(alias)];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      return String(val).trim();
    }
  }
  return '';
}

function parseExcelDate(raw: unknown): string {
  if (!raw) return '2008-01-01';
  if (typeof raw === 'number' && raw > 10000) {
    // Excel serial date
    const parsed = XLSX.SSF.parse_date_code(raw);
    if (parsed && parsed.y && parsed.m && parsed.d) {
      const m = String(parsed.m).padStart(2, '0');
      const d = String(parsed.d).padStart(2, '0');
      return `${parsed.y}-${m}-${d}`;
    }
  }
  const str = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const dmy = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmy) {
    return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
  }
  return '2008-01-01';
}

export async function parseMasterExcelFile(
  file: File,
  entity: MasterEntityType
): Promise<ExcelParseResult> {
  const maxBytes = 5 * 1024 * 1024; // 5MB guard
  if (file.size > maxBytes) {
    throw new Error('Ukuran file melebihi batas maksimal 5 MB.');
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('File Excel tidak memiliki sheet/lembar kerja yang valid.');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });

  if (!rawRows.length) {
    throw new Error('File Excel kosong. Pastikan data dimulai pada baris ke-2 di bawah header kolom.');
  }

  const activeTpId = dbService.getActiveTahunPelajaranId();
  const parsedRows: ParsedExcelRow<any>[] = [];

  if (entity === 'siswa') {
    const seenNis = new Set<string>();
    rawRows.forEach((raw, idx) => {
      const rowNumber = idx + 2;
      const nis = getField(raw, ['nis', 'nomorinduksiswa', 'nomorinduk']);
      const nisn = getField(raw, ['nisn']);
      const nama = getField(raw, ['namalengkap', 'namasiswa', 'nama']);
      const jkRaw = getField(raw, ['jeniskelamin', 'jk', 'lp', 'kelamin', 'gender']).toUpperCase();
      const jk: 'L' | 'P' = jkRaw.startsWith('P') || jkRaw === 'PEREMPUAN' || jkRaw === 'W' ? 'P' : 'L';
      const tglLahirRaw = getField(raw, ['tanggallahir', 'tgllahir', 'lahir']);
      const tanggal_lahir = parseExcelDate(raw['Tanggal Lahir'] ?? raw['tanggal_lahir'] ?? tglLahirRaw);
      const alamat = getField(raw, ['alamat', 'domisili']) || 'Jember, Jawa Timur';
      const namaOrtu = getField(raw, ['namaorangtua', 'namaortu', 'orangtua', 'wali']) || 'Orang Tua Siswa';
      const hpOrtu = getField(raw, ['nohporangtua', 'nohportu', 'hportu', 'teleponorangtua', 'nohp', 'telepon']) || '-';
      const kelasInput = getField(raw, ['namakelas', 'kelas', 'rombel', 'rombonganbelajar']);
      const statusRaw = getField(raw, ['status', 'statussiswa']) || 'Aktif';
      const status: Siswa['status'] = (['Aktif', 'Lulus', 'Pindah', 'Drop Out'].includes(statusRaw)
        ? statusRaw
        : 'Aktif') as Siswa['status'];

      const errors: string[] = [];
      if (!nis) errors.push('NIS wajib diisi');
      if (!nama) errors.push('Nama Lengkap wajib diisi');

      let matchedKelas = kelasInput ? dbService.findKelasByName(kelasInput) : undefined;
      if (kelasInput && !matchedKelas) {
        errors.push(`Kelas "${kelasInput}" tidak ditemukan di Data Kelas`);
      }
      if (!matchedKelas && !kelasInput) {
        matchedKelas = dbService.kelasList[0];
      }

      if (nis && seenNis.has(nis.toLowerCase())) {
        errors.push(`NIS "${nis}" duplikat di dalam file Excel`);
      } else if (nis) {
        seenNis.add(nis.toLowerCase());
      }

      const displaySummary = {
        NIS: nis || '-',
        'Nama Lengkap': nama || '-',
        'L/P': jk,
        Kelas: matchedKelas?.nama_kelas || kelasInput || '-',
        'Orang Tua': namaOrtu
      };

      if (errors.length > 0 || !matchedKelas) {
        parsedRows.push({
          rowNumber,
          status: 'error',
          message: errors.join('; '),
          displaySummary
        });
        return;
      }

      const existsInDb = dbService.siswaList.some(
        s => s.nis.trim().toLowerCase() === nis.toLowerCase()
      );

      const payload: Omit<Siswa, 'id' | 'created_at' | 'updated_at'> = {
        nis,
        nisn: nisn || '-',
        nama_lengkap: nama,
        jenis_kelamin: jk,
        tanggal_lahir,
        alamat,
        nama_orang_tua: namaOrtu,
        no_hp_orang_tua: hpOrtu,
        kelas_id: matchedKelas.id,
        kompetensi_keahlian_id: matchedKelas.kompetensi_keahlian_id,
        tahun_pelajaran_id: activeTpId,
        status
      };

      parsedRows.push({
        rowNumber,
        status: existsInDb ? 'duplicate' : 'valid',
        message: existsInDb ? 'NIS sudah ada (akan diperbarui jika opsi update aktif)' : 'Siap disimpan',
        displaySummary,
        payload
      });
    });
  } else if (entity === 'guru') {
    const seenNip = new Set<string>();
    rawRows.forEach((raw, idx) => {
      const rowNumber = idx + 2;
      const nip = getField(raw, ['nip', 'nuptk', 'nomorindukpegawai']);
      const nama = getField(raw, ['namalengkap', 'namaguru', 'nama', 'namalengkapgelar']);
      const email = getField(raw, ['email', 'emaildinas']) || (nip ? `${nip.replace(/\s+/g, '')}@smkn1jember.sch.id` : '');
      const noHp = getField(raw, ['nohp', 'hp', 'telepon', 'whatsapp', 'wa']) || '-';
      const jabatan = getField(raw, ['jabatan', 'jabatantugas', 'tugas', 'peran']) || 'Guru Mata Pelajaran';
      const statusRaw = getField(raw, ['statusaktif', 'status']).toLowerCase();
      const statusAktif = statusRaw === 'non-aktif' || statusRaw === 'nonaktif' || statusRaw === 'false' || statusRaw === 'tidak' ? false : true;

      const errors: string[] = [];
      if (!nip) errors.push('NIP wajib diisi');
      if (!nama) errors.push('Nama Lengkap wajib diisi');
      if (nip && seenNip.has(nip.toLowerCase())) {
        errors.push(`NIP "${nip}" duplikat di dalam file Excel`);
      } else if (nip) {
        seenNip.add(nip.toLowerCase());
      }

      const displaySummary = {
        NIP: nip || '-',
        'Nama Lengkap': nama || '-',
        Email: email || '-',
        Jabatan: jabatan,
        Status: statusAktif ? 'Aktif' : 'Non-Aktif'
      };

      if (errors.length > 0) {
        parsedRows.push({
          rowNumber,
          status: 'error',
          message: errors.join('; '),
          displaySummary
        });
        return;
      }

      const existsInDb = dbService.guruList.some(
        g => g.nip.trim().toLowerCase() === nip.toLowerCase()
      );

      const payload: Omit<Guru, 'id' | 'created_at' | 'updated_at'> = {
        nip,
        nama_lengkap: nama,
        email,
        no_hp: noHp,
        jabatan,
        status_aktif: statusAktif
      };

      parsedRows.push({
        rowNumber,
        status: existsInDb ? 'duplicate' : 'valid',
        message: existsInDb ? 'NIP sudah ada (akan diperbarui jika opsi update aktif)' : 'Siap disimpan',
        displaySummary,
        payload
      });
    });
  } else if (entity === 'kelas') {
    const seenKelas = new Set<string>();
    rawRows.forEach((raw, idx) => {
      const rowNumber = idx + 2;
      const namaKelas = getField(raw, ['namakelas', 'kelas', 'rombel', 'namarombel']);
      const tingkatRaw = getField(raw, ['tingkat', 'level', 'jenjang']);
      const parsedTingkat = Number(tingkatRaw.replace(/[^0-9]/g, ''));
      const tingkat: 10 | 11 | 12 | null =
        parsedTingkat === 10 || parsedTingkat === 11 || parsedTingkat === 12
          ? parsedTingkat
          : namaKelas.toUpperCase().startsWith('XII')
          ? 12
          : namaKelas.toUpperCase().startsWith('XI')
          ? 11
          : namaKelas.toUpperCase().startsWith('X')
          ? 10
          : null;

      const kkInput = getField(raw, ['kompetensikeahlian', 'kodekompetensi', 'jurusan', 'konsentrasi', 'kompetensi']);
      const wkInput = getField(raw, ['walikelas', 'nipwalikelas', 'namawalikelas', 'guru']);

      const errors: string[] = [];
      if (!namaKelas) errors.push('Nama Kelas wajib diisi');
      if (!tingkat) errors.push('Tingkat harus 10, 11, atau 12');

      const matchedKK = kkInput ? dbService.findKompetensiByCodeOrName(kkInput) : dbService.kompetensiList[0];
      if (kkInput && !matchedKK) {
        errors.push(`Kompetensi "${kkInput}" tidak ditemukan (cek tab Kompetensi)`);
      }

      const matchedWK = wkInput ? dbService.findGuruByNipOrName(wkInput) : dbService.guruList[0];
      if (wkInput && !matchedWK) {
        errors.push(`Wali Kelas "${wkInput}" tidak ditemukan di Data Guru`);
      }

      if (namaKelas && seenKelas.has(namaKelas.toLowerCase())) {
        errors.push(`Nama Kelas "${namaKelas}" duplikat di dalam file`);
      } else if (namaKelas) {
        seenKelas.add(namaKelas.toLowerCase());
      }

      const displaySummary = {
        'Nama Kelas': namaKelas || '-',
        Tingkat: tingkat ? `Kelas ${tingkat}` : '-',
        Kompetensi: matchedKK?.kode || kkInput || '-',
        'Wali Kelas': matchedWK?.nama_lengkap || wkInput || '-'
      };

      if (errors.length > 0 || !tingkat || !matchedKK || !matchedWK) {
        parsedRows.push({
          rowNumber,
          status: 'error',
          message: errors.join('; '),
          displaySummary
        });
        return;
      }

      const existsInDb = dbService.kelasList.some(
        k => k.nama_kelas.trim().toLowerCase() === namaKelas.toLowerCase()
      );

      const payload: Omit<Kelas, 'id' | 'created_at'> = {
        nama_kelas: namaKelas,
        tingkat,
        kompetensi_keahlian_id: matchedKK.id,
        tahun_pelajaran_id: activeTpId,
        wali_kelas_id: matchedWK.id,
        aktif: true
      };

      parsedRows.push({
        rowNumber,
        status: existsInDb ? 'duplicate' : 'valid',
        message: existsInDb ? 'Kelas sudah ada (akan diperbarui jika opsi update aktif)' : 'Siap disimpan',
        displaySummary,
        payload
      });
    });
  } else if (entity === 'kompetensi') {
    const seenKode = new Set<string>();
    rawRows.forEach((raw, idx) => {
      const rowNumber = idx + 2;
      const kode = getField(raw, ['kode', 'kodejurusan', 'kodekompetensi', 'singkatan']).toUpperCase();
      const nama = getField(raw, ['nama', 'namakompetensi', 'namakompetensikeahlian', 'namajurusan', 'kompetensikeahlian']);
      const statusRaw = getField(raw, ['status', 'aktif']).toLowerCase();
      const aktif = statusRaw === 'non-aktif' || statusRaw === 'nonaktif' || statusRaw === 'false' || statusRaw === 'tidak' ? false : true;

      const errors: string[] = [];
      if (!kode) errors.push('Kode wajib diisi (contoh: RPL, AKL, MPLB)');
      if (!nama) errors.push('Nama Kompetensi Keahlian wajib diisi');
      if (kode && seenKode.has(kode.toLowerCase())) {
        errors.push(`Kode "${kode}" duplikat di dalam file`);
      } else if (kode) {
        seenKode.add(kode.toLowerCase());
      }

      const displaySummary = {
        Kode: kode || '-',
        'Nama Kompetensi Keahlian': nama || '-',
        Status: aktif ? 'Aktif' : 'Non-Aktif'
      };

      if (errors.length > 0) {
        parsedRows.push({
          rowNumber,
          status: 'error',
          message: errors.join('; '),
          displaySummary
        });
        return;
      }

      const existsInDb = dbService.kompetensiList.some(
        kk => kk.kode.trim().toLowerCase() === kode.toLowerCase()
      );

      const payload: Omit<KompetensiKeahlian, 'id' | 'created_at'> = {
        kode,
        nama,
        aktif
      };

      parsedRows.push({
        rowNumber,
        status: existsInDb ? 'duplicate' : 'valid',
        message: existsInDb ? 'Kode sudah ada (akan diperbarui jika opsi update aktif)' : 'Siap disimpan',
        displaySummary,
        payload
      });
    });
  }

  return {
    fileName: file.name,
    totalRows: parsedRows.length,
    validCount: parsedRows.filter(r => r.status === 'valid').length,
    duplicateCount: parsedRows.filter(r => r.status === 'duplicate').length,
    errorCount: parsedRows.filter(r => r.status === 'error').length,
    rows: parsedRows
  };
}

export function downloadMasterTemplate(entity: MasterEntityType): void {
  const sampleKelas1 = dbService.kelasList[0]?.nama_kelas || 'XI RPL 1';
  const sampleKelas2 = dbService.kelasList[1]?.nama_kelas || sampleKelas1;
  const sampleKK1 = dbService.kompetensiList[0]?.kode || 'RPL';
  const sampleKK2 = dbService.kompetensiList[1]?.kode || sampleKK1;
  const sampleGuru1 = dbService.guruList[0]?.nama_lengkap || 'Ahmad Fauzan, S.Kom';

  let sheetName = 'Template';
  let fileName = 'template_master.xlsx';
  let data: Record<string, string | number>[] = [];
  let colWidths: { wch: number }[] = [];

  if (entity === 'siswa') {
    sheetName = 'Data_Siswa';
    fileName = 'Template_Import_Siswa_SMKN1Jember.xlsx';
    data = [
      {
        NIS: '2526001',
        NISN: '0091234501',
        'Nama Lengkap': 'Nadia Putri Maharani',
        'Jenis Kelamin': 'P',
        'Tanggal Lahir': '2009-04-12',
        Alamat: 'Jl. Kalimantan No. 45, Jember',
        'Nama Orang Tua': 'Budi Santoso',
        'No HP Orang Tua': '081234567801',
        'Nama Kelas': sampleKelas1,
        Status: 'Aktif'
      },
      {
        NIS: '2526002',
        NISN: '0091234502',
        'Nama Lengkap': 'Rizky Pratama Wijaya',
        'Jenis Kelamin': 'L',
        'Tanggal Lahir': '2009-08-21',
        Alamat: 'Jl. Jawa No. 18, Sumbersari, Jember',
        'Nama Orang Tua': 'Slamet Hariyadi',
        'No HP Orang Tua': '081234567802',
        'Nama Kelas': sampleKelas2,
        Status: 'Aktif'
      }
    ];
    colWidths = [
      { wch: 12 }, { wch: 14 }, { wch: 26 }, { wch: 14 }, { wch: 15 },
      { wch: 30 }, { wch: 22 }, { wch: 18 }, { wch: 16 }, { wch: 12 }
    ];
  } else if (entity === 'guru') {
    sheetName = 'Data_Guru';
    fileName = 'Template_Import_Guru_SMKN1Jember.xlsx';
    data = [
      {
        NIP: '198705142015031002',
        'Nama Lengkap': 'Drs. Hendra Kusuma, M.Pd',
        Email: 'hendra.kusuma@smkn1jember.sch.id',
        'No HP': '081334556677',
        Jabatan: 'Guru Produktif & Wali Kelas',
        Status: 'Aktif'
      },
      {
        NIP: '199108202019032005',
        'Nama Lengkap': 'Fitria Rahmawati, S.Pd',
        Email: 'fitria.rahmawati@smkn1jember.sch.id',
        'No HP': '081223344556',
        Jabatan: 'Guru BK',
        Status: 'Aktif'
      }
    ];
    colWidths = [
      { wch: 22 }, { wch: 28 }, { wch: 32 }, { wch: 16 }, { wch: 28 }, { wch: 12 }
    ];
  } else if (entity === 'kelas') {
    sheetName = 'Data_Kelas';
    fileName = 'Template_Import_Kelas_SMKN1Jember.xlsx';
    data = [
      {
        'Nama Kelas': 'X RPL 3',
        Tingkat: 10,
        'Kode Kompetensi': sampleKK1,
        'Wali Kelas': sampleGuru1
      },
      {
        'Nama Kelas': 'XI AKL 2',
        Tingkat: 11,
        'Kode Kompetensi': sampleKK2,
        'Wali Kelas': sampleGuru1
      }
    ];
    colWidths = [{ wch: 18 }, { wch: 10 }, { wch: 20 }, { wch: 28 }];
  } else {
    sheetName = 'Data_Kompetensi';
    fileName = 'Template_Import_Kompetensi_SMKN1Jember.xlsx';
    data = [
      { Kode: 'PPLG', 'Nama Kompetensi Keahlian': 'Pengembangan Perangkat Lunak dan Gim', Status: 'Aktif' },
      { Kode: 'PM', 'Nama Kompetensi Keahlian': 'Pemasaran Digital & Bisnis Ritel', Status: 'Aktif' }
    ];
    colWidths = [{ wch: 12 }, { wch: 40 }, { wch: 12 }];
  }

  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = colWidths;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, fileName);
}

export function exportMasterToExcel(entity: MasterEntityType): void {
  let sheetName = 'Data';
  let fileName = 'export_master.xlsx';
  let rows: Record<string, string | number>[] = [];

  if (entity === 'siswa') {
    sheetName = 'Data_Siswa';
    fileName = `Export_Data_Siswa_${new Date().toISOString().split('T')[0]}.xlsx`;
    rows = dbService.siswaList.map(s => {
      const kls = dbService.getKelasById(s.kelas_id);
      const kk = dbService.getKompetensiById(s.kompetensi_keahlian_id);
      return {
        NIS: s.nis,
        NISN: s.nisn,
        'Nama Lengkap': s.nama_lengkap,
        'Jenis Kelamin': s.jenis_kelamin,
        'Tanggal Lahir': s.tanggal_lahir,
        Alamat: s.alamat,
        'Nama Orang Tua': s.nama_orang_tua,
        'No HP Orang Tua': s.no_hp_orang_tua,
        'Nama Kelas': kls?.nama_kelas || '-',
        'Kompetensi Keahlian': kk?.nama || '-',
        Status: s.status
      };
    });
  } else if (entity === 'guru') {
    sheetName = 'Data_Guru';
    fileName = `Export_Data_Guru_${new Date().toISOString().split('T')[0]}.xlsx`;
    rows = dbService.guruList.map(g => ({
      NIP: g.nip,
      'Nama Lengkap': g.nama_lengkap,
      Email: g.email,
      'No HP': g.no_hp,
      Jabatan: g.jabatan,
      Status: g.status_aktif ? 'Aktif' : 'Non-Aktif'
    }));
  } else if (entity === 'kelas') {
    sheetName = 'Data_Kelas';
    fileName = `Export_Data_Kelas_${new Date().toISOString().split('T')[0]}.xlsx`;
    rows = dbService.kelasList.map(k => {
      const kk = dbService.getKompetensiById(k.kompetensi_keahlian_id);
      const wk = dbService.getGuruById(k.wali_kelas_id);
      const count = dbService.siswaList.filter(s => s.kelas_id === k.id).length;
      return {
        'Nama Kelas': k.nama_kelas,
        Tingkat: k.tingkat,
        'Kode Kompetensi': kk?.kode || '-',
        'Kompetensi Keahlian': kk?.nama || '-',
        'Wali Kelas': wk?.nama_lengkap || '-',
        'Jumlah Siswa': count
      };
    });
  } else {
    sheetName = 'Data_Kompetensi';
    fileName = `Export_Kompetensi_Keahlian_${new Date().toISOString().split('T')[0]}.xlsx`;
    rows = dbService.kompetensiList.map(kk => ({
      Kode: kk.kode,
      'Nama Kompetensi Keahlian': kk.nama,
      Status: kk.aktif ? 'Aktif' : 'Non-Aktif'
    }));
  }

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, fileName);
}
