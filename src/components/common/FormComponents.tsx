import React from 'react';
import { dbService } from '../../services/supabaseService';
import { Siswa } from '../../types/database';
import { UploadCloud, CheckCircle2, User } from 'lucide-react';

interface StudentSelectProps {
  value: string;
  onChange: (siswaId: string, studentData?: Siswa) => void;
  label?: string;
  required?: boolean;
  filterAssignedOnly?: boolean;
}

export const StudentSelect: React.FC<StudentSelectProps> = ({
  value,
  onChange,
  label = 'Pilih Siswa',
  required = true,
  filterAssignedOnly = false
}) => {
  // If filterAssignedOnly is true, retrieve accessible students according to RLS
  const students = filterAssignedOnly ? dbService.getAccessibleSiswa() : dbService.siswaList;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sId = e.target.value;
    const sData = students.find(s => s.id === sId);
    onChange(sId, sData);
  };

  const selectedStudent = students.find(s => s.id === value);

  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={handleChange}
        required={required}
        className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors text-slate-800"
      >
        <option value="">-- Cari / Pilih Nama Siswa --</option>
        {students.map(s => {
          const kelas = dbService.getKelasById(s.kelas_id);
          const kk = dbService.getKompetensiById(s.kompetensi_keahlian_id);
          return (
            <option key={s.id} value={s.id}>
              {s.nama_lengkap} (NIS: {s.nis} · {kelas?.nama_kelas || '-'} · {kk?.kode || '-'})
            </option>
          );
        })}
      </select>

      {/* Auto-fill indicator snippet */}
      {selectedStudent && (
        <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1 items-center">
          <div className="flex items-center gap-1.5 font-medium text-slate-800">
            <User className="w-3.5 h-3.5 text-blue-600" />
            <span>{selectedStudent.nama_lengkap}</span>
          </div>
          <span>NIS: <strong className="text-slate-800">{selectedStudent.nis}</strong></span>
          <span>Kelas: <strong className="text-slate-800">{dbService.getKelasById(selectedStudent.kelas_id)?.nama_kelas}</strong></span>
          <span>Kompetensi: <strong className="text-slate-800">{dbService.getKompetensiById(selectedStudent.kompetensi_keahlian_id)?.nama}</strong></span>
        </div>
      )}
    </div>
  );
};

export const ClassAutoFill: React.FC<{ kelasId: string; label?: string }> = ({
  kelasId,
  label = 'Kelas Terisi Otomatis'
}) => {
  const kelas = dbService.getKelasById(kelasId);
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">{label}</label>
      <input
        type="text"
        disabled
        value={kelas ? `${kelas.nama_kelas} (Tingkat ${kelas.tingkat})` : '-'}
        className="w-full h-11 px-3 text-sm bg-slate-100 border border-slate-300 rounded-lg text-slate-600 cursor-not-allowed font-medium"
      />
    </div>
  );
};

export const CompetencyAutoFill: React.FC<{ kompetensiId: string; label?: string }> = ({
  kompetensiId,
  label = 'Kompetensi Keahlian Otomatis'
}) => {
  const kk = dbService.getKompetensiById(kompetensiId);
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">{label}</label>
      <input
        type="text"
        disabled
        value={kk ? `${kk.kode} — ${kk.nama}` : '-'}
        className="w-full h-11 px-3 text-sm bg-slate-100 border border-slate-300 rounded-lg text-slate-600 cursor-not-allowed font-medium"
      />
    </div>
  );
};

export const DatePicker: React.FC<{
  value: string;
  onChange: (val: string) => void;
  label?: string;
  required?: boolean;
}> = ({ value, onChange, label = 'Tanggal', required = true }) => {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800"
      />
    </div>
  );
};

export const TimePicker: React.FC<{
  value: string;
  onChange: (val: string) => void;
  label?: string;
  required?: boolean;
}> = ({ value, onChange, label = 'Waktu / Jam', required = true }) => {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="time"
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800"
      />
    </div>
  );
};

export const ServiceTypeSelect: React.FC<{
  value: string;
  onChange: (val: string) => void;
  options: string[];
  label?: string;
  required?: boolean;
}> = ({ value, onChange, options, label = 'Jenis Layanan', required = true }) => {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800"
      >
        <option value="">-- Pilih {label} --</option>
        {options.map(opt => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
};

export const StatusSelect: React.FC<{
  value: string;
  onChange: (val: string) => void;
  options: string[];
  label?: string;
  required?: boolean;
}> = ({ value, onChange, options, label = 'Status Layanan', required = true }) => {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800 font-medium"
      >
        {options.map(opt => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
};

export const FileUpload: React.FC<{
  label?: string;
  bucket?: 'documents' | 'evidence' | 'student-documents' | 'bk-restricted';
  value?: string | null;
  onChange: (fileUrl: string | null) => void;
}> = ({
  label = 'Dokumentasi / Bukti Pendukung (Supabase Storage)',
  bucket = 'evidence',
  value,
  onChange
}) => {
  const [fileName, setFileName] = React.useState<string | null>(value ? 'Lampiran terunggah' : null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      // Simulate real Supabase storage path
      const simulatedUrl = `https://storage.supabase.co/v1/${bucket}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      onChange(simulatedUrl);
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">{label}</label>
        <span className="text-[11px] text-slate-500 font-medium">Bucket: {bucket}</span>
      </div>
      <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-lg p-4 cursor-pointer bg-slate-50/70 hover:bg-slate-50 transition-colors">
        <input type="file" onChange={handleFile} className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
        {fileName ? (
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="truncate max-w-xs">{fileName}</span>
            <button
              type="button"
              onClick={(ev) => {
                ev.preventDefault();
                setFileName(null);
                onChange(null);
              }}
              className="ml-2 text-red-600 hover:underline"
            >
              Hapus
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-slate-600">
            <UploadCloud className="w-5 h-5 text-slate-400" />
            <span className="text-xs font-medium">Klik untuk unggah berkas / foto bukti</span>
            <span className="text-[10px] text-slate-600">Format PDF, PNG, JPG (Maks 10MB)</span>
          </div>
        )}
      </label>
    </div>
  );
};
